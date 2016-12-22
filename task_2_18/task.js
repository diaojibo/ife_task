//事件绑定函数，兼容浏览器差异
function addEvent(element, event, listener) {
    if(element.addEventListener){
        element.addEventListener(event,listener,false);
    }else if(element.attachEvent){
        element.attachEvent("on"+event,listener);
    }
    else{
        element["on"+event] = listener;
    }
}

function each(arr,fn) {
    for(var cur = 0; cur<arr.length;cur++){
        fn(arr[cur],cur);
    }
}

window.onload = function () {
    var container = document.getElementById("container");
    var buttonList =document.getElementsByTagName("input");

    var queue = {
        str : [],
        leftPush : function (num) {
            this.str.unshift(num);
            this.paint();
        },

        rightPush:function (num) {
            this.str.push(num);
            this.paint();
        },
        isEmpty: function () {
            return (this.str.length == 0);
        },

        leftPop:function () {
            if(!this.isEmpty()){
                alert(this.str.shift());
                this.paint();
            }else{
                alert("empty!");
            }
        },
        rightPop:function () {
            if(!this.isEmpty()){
                alert(this.str.pop());
                this.paint();
            }else{
                alert("empty!");
            }
        },
        paint : function () {
            var st = "";
            var index = 0;
            each(this.str,function (item) {
                st += "<div data-index='"+index+"'>"+parseInt(item)+"</div>";
                index ++;
            });
            container.innerHTML = st;

        },
        deleteID: function (id) {
            this.str.splice(id,1);
            this.paint();
        }

    };

    function addDivDelEvent() {
        for(var cur = 0; cur<container.childNodes.length;cur++){
            addEvent(container.childNodes[cur],"click",function (cur) {
                return function () {
                    return queue.deleteID(cur);
                }
            }(cur));
        }
    }

    addEvent(buttonList[1],"click",function () {
        var input = buttonList[0].value;
        if(/^[0-9]+$/.test(input)){
            queue.leftPush(input);
        }else{
            alert("please int!");
        }
    });
    addEvent(buttonList[2], "click", function() {
        var input = buttonList[0].value;
        if ((/^[0-9]+$/).test(input)) {
            queue.rightPush(input);
        }
        else {
            alert("Please enter an interger!");
        }
    });
    addEvent(buttonList[3], "click", function(){queue.leftPop()});
    addEvent(buttonList[4], "click", function(){queue.rightPop()});
    
    addEvent(container,"click",function (e) {
        if(e.target.dataset.index){
            var number = parseInt(e.target.dataset.index);
            queue.deleteID(number);
        }
    });
};