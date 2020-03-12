// parameter    

// 必传参数
// mapId        加载地图的容器ID
// chinaUrl     中国地图url地址
// provinceUrl  省级url地址
// cityUrl      市级url地址

// 非必传参数
// testData     是否开启测试
// maxColor     地图最深颜色
// minColor     地图最浅颜色
// hoverColor   鼠标选中颜色

// 暂时只开放基本地图功能

// 组件依赖于echarts地图，
//具体细节可以查看http://echarts.baidu.com/option.html#series-map (内含地图基本功能)
//http://www.echartsjs.com/gallery/editor.html?c=map-usa (地图进阶使用参考)


// chinaMap详细代码开始
var geoCoordMap = {};
var option = {}
var _areaColor, chart, provinces;

function chinaMap(mapId, $mapdata, testData, maxColor, minColor, hoverColor, callback) {

    //地图容器
    chart = echarts.init(document.getElementById(mapId));
    //34个省、市、自治区的名字拼音映射数组
    provinces = {
        //23个省
        "台湾": "taiwan",
        "河北": "hebei",
        "山西": "shanxi",
        "辽宁": "liaoning",
        "吉林": "jilin",
        "黑龙江": "heilongjiang",
        "江苏": "jiangsu",
        "浙江": "zhejiang",
        "安徽": "anhui",
        "福建": "fujian",
        "江西": "jiangxi",
        "山东": "shandong",
        "河南": "henan",
        "湖北": "hubei",
        "湖南": "hunan",
        "广东": "guangdong",
        "海南": "hainan",
        "四川": "sichuan",
        "贵州": "guizhou",
        "云南": "yunnan",
        "陕西": "shanxi1",
        "甘肃": "gansu",
        "青海": "qinghai",
        //5个自治区
        "新疆": "xinjiang",
        "广西": "guangxi",
        "内蒙古": "neimenggu",
        "宁夏": "ningxia",
        "西藏": "xizang",
        //4个直辖市
        "北京": "beijing",
        "天津": "tianjin",
        "上海": "shanghai",
        "重庆": "chongqing",
        //2个特别行政区
        "香港": "xianggang",
        "澳门": "aomen"
    };

    //直辖市和特别行政区-只有二级地图，没有三级地图
    var special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
    var mapdata = [];
    //绘制全国地图

    function getChina() {
        doGetJSON('static/map/china.json', function (data) {
            if (testData) {
                var d = [];
                for (var i = 0; i < data.features.length; i++) {
                    d.push({
                        id: data.features[i].id,
                        value: Math.round(Math.random() * 100)
                    })
                }
                mapdata = d;
                restMap(mapdata, data, 'china')
            } else {
                restMap($mapdata, data, 'china')
            }
        });
    }
    getChina()
    //地图点击事件
    var _data = "";
    chart.on('click', function (params) {
        if (params.name in provinces) {
            //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
            doGetJSON('static/map/province/' + provinces[params.name] + '.json', function (data) {
                _data = params.name;

                // 判断是否为测试
                if (testData) {
                    var d = [];
                    for (var i = 0; i < data.features.length; i++) {
                        d.push({
                            id: data.features[i].id,
                            value: Math.round(Math.random() * 1000)
                        })
                    }
                    restMap(d, data, params.name)
                } else {
                    callback(data, params)
                }
            });
        } else if (params.seriesName in provinces) {
            //如果是【直辖市/特别行政区】只有二级下钻
            if (special.indexOf(params.seriesName) >= 0) {
                getChina();
                renderMap('china', mapdata);
            } else {
                //显示县级地图
                if (params.name != "") {
                    doGetJSON('static/map/city/' + cityMap[params.name] + '.json', function (data) {
                        if (testData) {
                            var d = [];
                            for (var i = 0; i < data.features.length; i++) {
                                d.push({
                                    id: data.features[i].properties.id,
                                    value: Math.round(Math.random() * 100)
                                })
                            }
                            restMap(d, data, params.name)
                        } else {
                            callback(data, params)
                        }
                    });
                } else {
                    getChina();
                    renderMap('china', mapdata);
                }

            }
        } else {
            getChina();
            renderMap('china', mapdata);
        }
    });

    // 设置地图颜色
    var maxbg = "#9561ff";
    var minbg = "#67d2ff";
    if (maxColor) {
        maxbg = maxColor;
    };
    if (minColor) {
        minbg = minColor;
    }
    //初始化绘制全国地图配置
    option = {
        backgroundColor: '#000',
        title: {
            text: '地图数据展示',
            subtext: '数据展示',
            left: 'center',
            textStyle: {
                color: '#fff',
                fontSize: 16,
                fontWeight: 'normal',
                fontFamily: "Microsoft YaHei"
            },
            subtextStyle: {
                color: '#fff',
                fontSize: 12,
                fontWeight: 'normal',
                fontFamily: "Microsoft YaHei"
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return params.name + "<br />" +
                    "设备数量:" + params.value;
            }
        },
        visualMap: {
            min: 0,
            max: 100,
            left: 'left',
            top: 'bottom',
            // text: ['高', '低'], // 文本，默认为数值文本
            color: [maxbg, minbg],
            calculable: true,
            textStyle: {
                color: ['#fff']
            }
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
                dataView: {
                    readOnly: true
                },
                restore: {},
                saveAsImage: {}
            },
            iconStyle: {
                normal: {
                    color: '#fff'
                }
            }
        },
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 1000

    };
    _areaColor = "#ff0000";
    if (hoverColor) {
        _areaColor = hoverColor;
    }


};
// 设置渲染数据
function renderMap(map, data) {
    option.title.subtext = map;
    option.series = [{
        name: map,
        type: 'map',
        mapType: map,
        roam: false,
        nameMap: {
            'china': '中国'
        },
        label: {
            normal: {
                show: true,
                textStyle: {
                    color: '#fff',
                    fontSize: 12
                }
            },
            emphasis: {
                show: true,
                textStyle: {
                    color: '#fff',
                    fontSize: 12
                }
            }
        },
        itemStyle: {
            normal: {
                areaColor: '#323c48',
                borderColor: 'dodgerblue'
            },
            emphasis: {
                areaColor: _areaColor
            }
        },
        data: data
    }];
    //渲染地图
    chart.setOption(option);
}

function restMap(chinaData, data, mapName, isCity) {
    data.features.forEach(function (v, i) {
        // 地区名称
        var _id = v.id || v.properties.id;
        v.value = 0
        v.name = v.properties.name
        // chinaData数组如果顺序和china.json内的顺序不相符，寻找相同省份绑定该数据
        if (!isCity) {
            for (var j = 0; j < chinaData.length; j++) {
                if (_id === chinaData[j].id) {
                    //如果id相同，返回该省份value绑定到mapdata并中断循环
                    v.value = chinaData[j].value
                    v.name = v.properties.name
                }
            }
        }

    })
    echarts.registerMap(mapName, data); //根据返回坐标点绘制地图
    //绘制地图
    renderMap(mapName, data.features); //地图填充数据
}


var xmlHttp;

// ie兼容处理
function createxmlHttpRequest() {
    if (window.ActiveXObject) {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    }
}

// 获取json
function doGetJSON(url, fun) {
    createxmlHttpRequest();
    xmlHttp.open("GET", url);
    xmlHttp.send(null);
    xmlHttp.onreadystatechange = function () {
        if ((xmlHttp.readyState == 4) && (xmlHttp.status == 200)) {
            fun & fun(JSON.parse(xmlHttp.responseText));
        }
    }
}