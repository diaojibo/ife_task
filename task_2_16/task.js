/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};
var $ = function(id){return document.getElementById(id);};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
    var city,score;
    if((city = validateCityInput()) === null) return;
    if((score = validateScoreInput()) === null) return;

    aqiData[city] = score;
    clearInput();
}

function clearInput() {
    $("aqi-city-input").value = "";
    $("aqi-score-input").value = "";
    $("city-input-error").innerHTML = "";
    $("score-input-error").innerHTML = "";
}

function validateCityInput(){
    var city = $("aqi-city-input").value.trim();
    if(city === ""){
        $("city-input-error").innerHTML = "请先输入";
        return null;
    }else if(!/^[a-zA-Z\u4e00-\u9fa5]{2,10}$/.test(city)){
        $("city-input-error").innerHTML = "城市名必须2到10位中英文字符组成";
        return null;
    }else{
        $("city-input-error").innerHTML = "<img src='images/ok.png'/>";
        return city;
    }
}

function validateScoreInput() {
    var input = $("aqi-score-input").value.trim();
    var score = Number(input);
    if(input===""){
        $("score-input-error").innerHTML = "请先输入";
        return null;
    } else if(!(/^\d+$/.test(input)) || (score <0) || (score>1000)){
        $("score-input-error").innerHTML = "空气质量指数输入必须为0-1000之间的整数值";
        return null;
    } else {
        $("score-input-error").innerHTML = '<img src="images/ok.png" />';
        return score;
    }
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
    var items = "<tr><td>城市</td><td>空气质量</td><td>操作</td></tr>";
    for(var city in aqiData){
        items += "<tr><td>"+city+"</td><td>"+aqiData[city]+"</td><td><button data-city='"+city+"'>删除</button></td></tr>"
    }
    document.getElementById("aqi-table").innerHTML = city ? items : "";
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
    addAqiData();
    renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(city) {
    // do sth.
    delete aqiData[city];
    renderAqiList();
}

function init() {

    // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
    document.getElementById("add-btn").addEventListener("click",addBtnHandle);
    // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
    document.getElementById("aqi-table").addEventListener("click",function (event) {
        if(event.target.nodeName.toLowerCase() === "button"){
            delBtnHandle(event.target.dataset.city);
        }
    });

    // the validation process will be triggered when each input control loss the focus
    $("aqi-city-input").addEventListener("blur",validateCityInput);
    $("aqi-score-input").addEventListener("blur",validateScoreInput);
}

init();