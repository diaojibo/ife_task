/* 数据格式演示
 var aqiSourceData = {
 "北京": {
 "2016-01-01": 10,
 "2016-01-02": 10,
 "2016-01-03": 10,
 "2016-01-04": 10
 }
 };
 */
function $(id) {return document.getElementById(id);}
// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
    var y = dat.getFullYear();
    var m = dat.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = dat.getDate();
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
    var returnData = {};
    var dat = new Date("2016-01-01");
    var datStr = ''
    for (var i = 1; i < 92; i++) {
        datStr = getDateStr(dat);
        returnData[datStr] = Math.ceil(Math.random() * seed);
        dat.setDate(dat.getDate() + 1);
    }
    return returnData;
}

var aqiSourceData = {
    "北京": randomBuildData(500),
    "上海": randomBuildData(300),
    "广州": randomBuildData(200),
    "深圳": randomBuildData(100),
    "成都": randomBuildData(300),
    "西安": randomBuildData(500),
    "福州": randomBuildData(100),
    "厦门": randomBuildData(100),
    "沈阳": randomBuildData(500)
};

function buildCitySelect() {
    var options = [];
    for(var city in aqiSourceData){
        options.push("<option>"+city+"</option>");
    }
    $("city-select").innerHTML = options.join("");
}
var chartInfo = {
    axis_x_size : "90%",
    axis_y_size : "600px",
    max_aqi : 500,
    max_aqi_height_radio:0.8,
    colors:["#f00","#0f0","#00f","#0ff","#f0f","#ff0"],
    randomColor:function () {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }
};

function buildDataByWeek(dataMap) {
    var ret = {};
    var i = 1;
    var sum = 0;
    var count = 0;
    for(var day in dataMap){
        sum += dataMap[day];
        count++;
        if(new Date(day).getDay() === 0){
            ret["2016-week"+(i++)] = sum / count;
            sum = count = 0;
        }
    }
    if(count>0){
        ret["2016-week"+i] = sum / count;
    }

    return ret;
}

function buildDataByMonth(dataMap) {
    var ret = {};
    var i = 1;
    var sum = 0;
    var count  = 0;
    for(var day in dataMap){
        var thisdate = new Date(day).getDate();
        if(thisdate == 1){
            if(count>0){
                ret["2016-month"+(i++)] = sum / count;
                count = sum = 0;
            }
        }
        console.log(thisdate);
        sum += dataMap[day];
        count++;
    }
    if(count>0){
        ret["2016-month"+i] = sum / count;
    }
    return ret;
}

function drawAxis() {
    $("aqi-chart-wrap").innerHTML = "";
    //$("aqi-chart-wrap").innerHTML = "";
    var div = document.createElement("div");
    div.id = "aqi-chart-container";
    div.style.width = chartInfo.axis_x_size;
    div.style.height = chartInfo.axis_y_size;
    div.style.margin = "50px auto 0";
    div.style.borderLeft = "2px solid #aaa";
    div.style.borderBottom = "2px solid #aaa";
    div.style.position = "relative";
    div.style.textAlign = "center";
    $("aqi-chart-wrap").appendChild(div);
}

//缓存用户的当前选中的配置，当用户选择发生改变时会对应更新相关分量属性的取值
var setting = {
    city: "北京",
    granularity: "day",
    granularityInfoMap: {day: "天", week: "周", month: "月"},
    granularityByChinese: function(){return this.granularityInfoMap[this.granularity]}
};



function drawChart() {
    drawAxis();

    var dataMap = aqiSourceData[setting.city];
    if(setting.granularity === "week"){
        dataMap = buildDataByWeek(dataMap);
    }else if(setting.granularity === "month"){
        dataMap = buildDataByMonth(dataMap);
    }
    var h2 = document.createElement("h2");
    h2.innerHTML = '空气质量柱状图-<span style="color: red;">' + setting.city + '</span>-按<span style="color: red;">' + setting.granularityByChinese() + "</span>统计";

    var divHTMLArray = [h2.outerHTML];
    var div,i = 0;
    var dataCount = Object.getOwnPropertyNames(dataMap).length;
    for (var key in dataMap){
        div = document.createElement("div");
        div.title = key + ":" + dataMap[key];
        div.style.backgroundColor = chartInfo.randomColor();
        div.style.height = parseInt(chartInfo.axis_y_size.substring(0,chartInfo.axis_y_size.indexOf("px")))*
                chartInfo.max_aqi_height_radio * dataMap[key]/ chartInfo.max_aqi;
        div.style.position = "absolute";
        div.style.bottom = "2px";

        div.style.width = (100 / dataCount) + "%";
        div.style.left = ((i++) * 100 / dataCount) + "%";
        divHTMLArray.push(div.outerHTML);
    }

    $("aqi-chart-container").innerHTML = divHTMLArray.join("");
}

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
    nowSelectCity: -1,
    nowGraTime: "day"
}


/**
 * 初始化函数
 */
function init() {
    buildCitySelect();

    $("city-select").addEventListener("change",function () {
        setting.city = this.value;
        drawChart();
    });

    var radioChangeHandler = function (event) {
        setting.granularity = event.target.value;
        drawChart();
    };

    var radioList = document.querySelectorAll('#form-gra-time [type="radio"]');
    for(var i=0;i<radioList.length;i++){
        radioList[i].addEventListener("change",radioChangeHandler);
    }

    drawChart();
}

init();