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

var chartSetting = {
    max_height:200,
    max_number:100,
    min_number:10,
    div_width:20
};


window.onload = function () {
    var container = document.getElementById("container");
    var buttonList =document.getElementsByTagName("input");

    var queue = {
        str : [],
        leftPush : function (num) {
            if(this.str.length==60){
                alert("the queue is full over 60 !!")
            }else{
                this.str.unshift(num);
            }
            this.paint();
        },

        rightPush:function (num) {
            if(this.str.length==60){
                alert("the queue is full over 60 !!")
            }else{
                this.str.push(num);
            }
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
            //var index = 0;
            // each(this.str,function (item) {
            //     st += "<div data-index='"+index+"'>"+parseInt(item)+"</div>";
            //     index ++;
            // });
            for(var i = 0;i<this.str.length;i++){
                var new_div = document.createElement("div");
                new_div.innerHTML = this.str[i];
                new_div.style.height = chartSetting.max_height * parseInt(this.str[i])/chartSetting.max_number;
                new_div.style.lineHeight = new_div.style.height;
                new_div.style.left = i * (chartSetting.div_width+5) + "px";
                new_div.style.width = chartSetting.div_width;
                new_div.dataset.index = i;
                st += new_div.outerHTML;
            }
            container.innerHTML = st;

        },
        deleteID: function (id) {
            this.str.splice(id,1);
            this.paint();
        },
        swap:function (x, y) {
            var temp = this.str[x];
            this.str[x] = this.str[y];
            this.str[y] = temp;
            this.paint();
        },
        give:function (x) {
            x = [];
            for(var i=0;i<this.str.length;i++){
                x.push(this.str[i]);
            }
            return x;
        }

    };
    var temp_q;
    var swap_list = [];
    function quickSort(l,r,q) {
        var left = l;
        var right = r;
        var middle = parseInt((l+r) / 2);
        var m = parseInt(q[middle]);
        while(left<=right){
            while(q[left]<m) left++;
            while(q[right]>m) right--;
            if(left<=right){
                swap_list.push([left,right]);
                var t = q[left];
                q[left] = q[right];
                q[right] = t;
                console.log(left + " "+right);
                left++;
                right--;
            }
        }
        if(left<r) quickSort(left,r,q);
        if(right>l) quickSort(l,right,q);
    }
    
    function swapOneMove() {
        if(swap_list.length > 0){
            swaps = swap_list.shift();
            var x = parseInt(swaps[0]);
            var y = parseInt(swaps[1]);
            queue.swap(x,y);
            setTimeout(swapOneMove,200);
        }
    }

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
            var input_num = parseInt(input);
            if(input_num>=10 && input_num<=100 ) {
                queue.leftPush(input_num);
            }else{
                alert("10-100");
            }
        }else{
            alert("please int!");
        }
    });
    addEvent(buttonList[2], "click", function() {
        var input = buttonList[0].value;
        if ((/^[0-9]+$/).test(input)) {
            var input_num = parseInt(input);
            if(input_num>=10 && input_num<=100 ) {
                queue.rightPush(input_num);
            }else{
                alert("10-100");
            }
        }
        else {
            alert("Please enter an interger(10-100)!");
        }
    });
    addEvent(buttonList[3], "click", function(){queue.leftPop()});
    addEvent(buttonList[4], "click", function(){queue.rightPop()});
    addEvent(buttonList[5],"click",function () {
        swap_list = [];
        temp_q = [];
       quickSort(0,queue.str.length-1,queue.give(temp_q));
        setTimeout(swapOneMove,200);
    });
    addEvent(buttonList[6], "click", function(){swapOneMove()});
    addEvent(container,"click",function (e) {
        if(e.target.dataset.index){
            var number = parseInt(e.target.dataset.index);
            queue.deleteID(number);
        }
    });
};