/**
 * Created by rocklct on 2017/1/10.
 */
(function () {
    var SPACE_SPEED = 2;
    var SPACESHIP_SIZE = 40; //飞船大小
    var SPACESHIP_COUNT = 4; //飞船数量
    var DEFAULT_CHARGE_RATE = 0.3; //飞船充电速度
    var DEFAULT_DISCHARGE_RATE = 0.2; //飞船放电速度

    var POWERBAR_POS_OFFSET = 5; //电量条位置位移
    var POWERBAR_COLOR_GOOD = "#70ed3f"; //电量良好状态颜色
    var POWERBAR_COLOR_MEDIUM = "#fccd1f"; //电量一般状态颜色
    var POWERBAR_COLOR_BAD = "#fb0000"; //电量差状态颜色
    var POWERBAR_WIDTH = 5; //电量条宽度

    var SCREEN_WIDTH = 800; //屏幕宽度
    var SCREEN_HEIGHT = 800; //屏幕高度
    var SCREEN_CENTER_X = SCREEN_WIDTH / 2; //屏幕X轴中心坐标
    var SCREEN_CENTER_Y = SCREEN_HEIGHT / 2; //屏幕Y轴中心坐标

    var PLANET_RADIUS = 50; //行星半径
    var ORBIT_COUNT = 4; //轨道数量
    var FAILURE_RATE = 0.3; //消息发送失败率

    var SpaceShip = function (id) {
        this.id = id;
        this.power = 100;
        this.currState = "stop";
        this.orbit = 100 + 50 * id - SPACESHIP_SIZE / 2; //飞船所在轨道的半径
        this.deg = 0; //飞船初始位置的角度
        this.timer = null;
    };

    //动力系统
    SpaceShip.prototype.dynamicManager = function () {
        var self = this;
        var fly = function () {
            self.timer = setInterval(function () {
                self.deg += SPACE_SPEED;
                if(self.deg >= 360) self.deg = 0;
                AnimUtil.fly(self.id,self.deg);
            },20);
        };

        var stop = function () {
            clearInterval(self.timer);
            AnimUtil.stop(self.id);
            ConsoleUtil.show("Spaceship No."+self.id + "has stop.");
        };

        return {
            fly:fly,
            stop:stop
        };
    };

    //能源系统
    SpaceShip.prototype.powerManager = function () {
        var self = this;

        var charge = function () {
            var chargeRate = DEFAULT_CHARGE_RATE;
            var timer = setInterval(function () {
                if(self.currState == "fly" || self.currState == "destroy"){
                    clearInterval(timer);
                    return false;
                }
                if(self.power >= 100){
                    clearInterval(timer);
                    self.power = 100;
                    return false;
                }
                self.power += chargeRate;
                AnimUtil.updatePower(self.id,self.power);
            },20);
            ConsoleUtil.show("Spaceship No." + self.id + "is charging.");
        };

        var discharge = function () {
            var dischargeRate = DEFAULT_DISCHARGE_RATE;
            var timer = setInterval(function () {
                if(self.currState == "stop" || self.currState == "destroy"){
                    clearInterval(timer);
                    return false;
                }
                if(self.power<=0){
                    clearInterval(timer);
                    self.power = 0;
                    self.stateManager().changeState("stop");
                    return false;
                }
                self.power -= dischargeRate;
                AnimUtil.updatePower(self.id,self.power);
            },20);
            ConsoleUtil.show("SpaceShip No." + self.id + "is discharging.");
        };
        return {
            charge:charge,
            discharge:discharge
        }
    };

    //状态系统
    SpaceShip.prototype.stateManager = function () {
        var self = this;
        var states = {
            fly:function (state) {
                self.currState = "fly";
                self.dynamicManager().fly();
                self.powerManager().discharge();
            },
            stop:function (state) {
                self.currState = "stop";
                self.dynamicManager().stop();
                self.powerManager().charge();
            },
            destroy:function (state) {
                self.currState = "destroy";
                AnimUtil.destroy(self.id);
                self.mediator.remove(self);
            }
        };

        var changeState = function (state) {
            states[state]();
            ConsoleUtil.show("SpaceShip No." + self.id + "state is" + state);
        };

        return{
          changeState:changeState
        };
    };

    //信号系统
    SpaceShip.prototype.signalManager = function () {
        var self = this;
        return {
            receive:function (msg, from) {
                if(self.currState != msg.cmd && self.id == msg.id){
                    self.stateManager().changeState(msg.cmd);
                }
            }
        };
    };



    //指挥官
    var Commander = function () {
        this.id = "Rock";
        this.msgs = [];
        this.mediator = null;
    };

    Commander.prototype.send = function (msg) {
        this.mediator.send(msg);
        this.msgs.push(msg);
    };

    //中转系统
    var Mediator = function () {
        var spaceships = [];
        var commander = null;

        return {
            register:function (obj) {
                if(obj instanceof Commander){
                    commander = obj;
                    obj.mediator = this;
                    ConsoleUtil.show("mediator register" + "Commander " + obj.id);
                    return true;
                }
                if(obj instanceof SpaceShip){
                    spaceships[obj.id] = obj;
                    obj.mediator = this;
                    ConsoleUtil.show("mediator register" + " SpaceShip "+obj.id);
                    return true;
                }
                ConsoleUtil.show("mediator register" + "SpaceShip " + obj.id);
                return false;
            },
            send : function (msg, from, to) {
                var self = this;
                setTimeout(function () {
                    var success = Math.random() > 0.3;
                    if(success){
                        ConsoleUtil.show("send success");
                        if(to){
                            to.receive(msg,from);
                        }else{
                            if(msg.cmd == "launch"){
                                self.create(msg);
                                return true;
                            }
                            for(var key in spaceships){
                                if(spaceships[key] !== from){
                                    if(spaceships[key] !== from){
                                        spaceships[key].signalManager().receive(msg,from);
                                    }
                                }
                            }
                        }
                    }else {
                        ConsoleUtil.show("send failed!");
                    }
                },1000);
            },
            remove : function (obj) {
                if(obj instanceof SpaceShip){
                    ConsoleUtil.show("destroy spaceship No." + obj.id);
                    spaceships[obj.id] = undefined;
                    delete obj;
                    return true;
                }
                ConsoleUtil.show("mediator remove failed");
                return false;
            },

            getSpaceShips:function () {
                return spaceships;
            },

            create:function (msg) {
                if(spaceships[msg.id] != undefined){
                    ConsoleUtil.show("Spaceship already exists");
                    return false;
                }
                var spaceship = new SpaceShip(msg.id);
                this.register(spaceship);
                AnimUtil.create(msg.id,spaceship.power);
            }
        }
    };


    var Message = function (target,command) {
        this.id = target;
        this.cmd = null;
        switch(command){
            case "launch":
            case "stop":
            case "fly":
            case "destroy":
                this.cmd = command;
                break;
            default:
                alert("invalid command");
        }
    };

    //按钮句柄
    var buttonHandler = function (commander) {
        var id = null;
        var cmd = null;
        $(".btn").on("click",function () {
            var cmdName = $(this).attr("name");
            switch (cmdName){
                case "launch":
                case "fly":
                case "stop":
                case "destroy":
                    id = $(this).parent().index();
                    cmd = cmdName;
                    break;
                default:
                    alert("invalid command");
                    break;
            }
            var message = new Message(id,cmd);
            commander.send(message);
        })
    };


    var AnimUtil = (function() {
        var mediator = null;
        return {
            create: function(id, power) {
                var target = "#spaceship0" + id;
                var target2 = "#info" + id;
                var target3 = "#powerbar" + id;
                $(target).css({ "display": "block" });
                $(target2).css("display", "block");
                $(target3).css("width", power + "px");
                ConsoleUtil.show("create animation");
            },
            fly: function(id, deg) {
                var mvDeg = "rotate(" + deg + "deg)";
                var target = "#spaceship0" + id;
                // $(target).addClass("active");
                $(target).css({
                    "transform": mvDeg,
                    "-webkit-transform": mvDeg
                });
            },
            stop: function(id) {
                var target = "#spaceship0" + id;
                $(target).removeClass("active");
            },
            updatePower: function(id, power) {
                var target = "#powerbar" + id;
                var powerColor = null;
                if (power > 60) {
                    powerColor = POWERBAR_COLOR_GOOD;
                } else if (power <= 60 && power >= 20) {
                    powerColor = POWERBAR_COLOR_MEDIUM;
                } else {
                    powerColor = POWERBAR_COLOR_BAD;
                }
                $(target).css({
                    "width": power + "px",
                    "background-color": powerColor
                });
            },
            destroy: function(id) {
                var target = "#spaceship0" + id;
                var target2 = "#info" + id;
                // $(target).removeClass("active");
                $(target).css("display", "none");
                $(target2).css("display", "none");
            }
        };
    })();

    //控制台工具
    var ConsoleUtil = (function() {
        var $consoleLog = $("#console ul");
        var show = function(msg) {
            var $msg = $("<li></li>");
            $msg.text(msg);
            $consoleLog.prepend($msg);
        };

        return {
            show: show
        };
    })();

    //主线程
    window.onload = function() {
        var commander = new Commander();
        var mediator = new Mediator();
        mediator.register(commander);
        buttonHandler(commander);
    };
})();
