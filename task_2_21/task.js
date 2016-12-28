//事件绑定兼容
function addEventHandler(ele, event, handler) {
    if(ele.addEventListener){
        ele.addEventListener(event,handler,false);
    }else if (ele.attachEvent){
        ele.attachEvent("on"+event,handler);
    }else {
        ele["on"+event] = handler;
    }
}

var tagInput = document.getElementById("tag_input");
var tagList = document.getElementById("tag_list");
var hobbyInput = document.getElementById("hobby_input");
var hobbyList = document.getElementById("hobby_list");
var hobbyBtn = document.getElementsByTagName('button')[0];

//实例对象
var tagObj = new CreatList(tagList),
    hobbyObj = new CreatList(hobbyList);


window.onload = function () {
//事件绑定
    addEventHandler(tagInput,'keyup',showTag);
    addEventHandler(hobbyBtn,'click',showHobby);

    addEventHandler(tagList,'mouseover',function (e) {
        if(e.target && e.target.nodeName == "SPAN") {
            e.target.firstChild.insertData(0,'点击删除');
            e.target.style.background = 'red';
        }
    });
    addEventHandler(tagList,'mouseout',function(e) {
        if(e.target && e.target.nodeName == "SPAN") {
            e.target.firstChild.deleteData(0,4);
            e.target.style.background = '#78BCFB'
        }
    })
    addEventHandler(tagList,'click',function (e) {
        if(e.target && e.target.nodeName == "SPAN") {
            tagList.removeChild(e.target);
        }
    })
}


function CreatList(divList) {
    this.queue = [];
    this.render = function () {
        var str = "";
        this.queue.forEach(function (e) {
            str += '<span>' + e + '</span>';
        });
        divList.innerHTML = str;
    }
}

CreatList.prototype.rightPush = function (str) {
    this.queue.push(str);
    this.render();
};

CreatList.prototype.leftShift = function() {
    this.queue.shift();
    this.render();
};

function showTag() {
    if (/[,，;；、\s\n]+/.test(tagInput.value) || event.keyCode == 13) {
        var data = splitInput(tagInput.value),
            newTag = data[0];
        if (tagObj.queue.indexOf(newTag) === -1) {
            tagObj.rightPush(newTag);
            if (tagObj.queue.length > 10) {
                tagObj.leftShift();
            }
        }
        tagObj.render();
        tagInput.value = "";
    }
}

function showHobby() {
    var data = splitInput(hobbyInput.value);
    data.forEach(function (e) {
        if (hobbyObj.queue.indexOf(e) === -1) {
            hobbyObj.rightPush(e);
            if (hobbyObj.queue.length > 10) {
                hobbyObj.leftShift();
            }
        }
        hobbyObj.render();
        hobbyInput.value = "";
    });
}