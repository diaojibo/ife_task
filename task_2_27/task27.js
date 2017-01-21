/**
 * Created by Administrator on 2017/1/21.
 */

/* BUS */
var Bus = {
    ships: [null,null,null,null],
    addship:function (ship, index) {
        this.ships[index] = ship;
    },
    receive:function (signal) {
        var self = this;
        var timer = setInterval(function () {
            var ships = self.ships;
            var ship;
            console.log(signal+" signal publishing");

            if(self.publish(signal)){
                if(signal.slice(4) == "0010"){
                    ships[parseInt(signal.slice(0,4),2).toString(10) - 1 ] = null;
                }

                clearInterval(timer);
                return true;
            }

        },300);
    },
    publish:function (signal) {
        var randomNum = Math.floor(Math.random() * 100);
        var loseProbability = 10;
        if(randomNum >= loseProbability){
            for(var iter in this.ships){
                if(this.ships[iter] && this.ships[iter] instanceof Ship){
                    this.ships[iter].receive(signal);
                }
            }
            console.log(signal + " signal has been published to the target ship");
            return true;
        }else{
            console.log(signal + " signal lost,keep trying !");
            return false;
        }
   }
};

var Ship = function (index) {
    this.index = index;
    this.rotate = 0;
    this.power = 0;
    this.speed = 2;
    this.consume = -5;
    this.restore = 2;
    this.state = 0;
    this.ship = undefined;
    this.controlBar = undefined;
    this.interval = undefined;

};

Ship.prototype.createSelf = function (signal) {
    var earth = document.querySelector(".earth");
    var cmd = document.querySelector(".cmd");
    var ship = document.createElement("div");
    var controlBar = document.createElement("div");
    var number = document.createElement("span");
    var startBtn = document.createElement("button");
    var stopBtn = document.createElement("button");
    var destroyBtn = document.createElement("button");

    ship.className = "ship"+this.index;
    ship.innerHTML = parseInt(this.power/10,10) + "%";
    number.innerHTML = "对" + this.index + "号进操作: ";
    startBtn.innerHTML = "beginToFly";
    stopBtn.innerHTML = "stopToFly";
    destroyBtn.innerHTML = "destroy";

    controlBar.appendChild(number);
    controlBar.appendChild(startBtn);
    controlBar.appendChild(stopBtn);
    controlBar.appendChild(destroyBtn);
    earth.appendChild(ship);
    cmd.appendChild(controlBar);

    this.ship = ship;
    this.controlBar = controlBar;
    this.speed = signal.speed;
    this.restore = signal.restore;
    this.consume = signal.consume;

};

Ship.prototype.fly = function () {
  if (1 == this.state){
      return false;
  }
  this.state = 1;
  var self = this;
  clearInterval(this.interval);
  this.interval = setInterval(function () {
      if(self.power < 5){
          self.stop();
          return ;
      }
      self.power += (self.consume + self.restore);
      if(self.power > 1000){
          self.power = 1000;
      }
      self.ship.innerHTML = parseInt(self.power/10,10) + "%";
      self.rotate += self.speed;

      if(self.rotate >= 360){
          self.rotate = 0;
      }
      self.ship.style.webkitTransform = "rotate("+self.rotate+"deg)";
      self.ship.style.mozTransform = "rotate("+self.rotate+"deg)";
      self.ship.style.oTransform = "rotate("+self.rotate+"deg)";
      self.ship.style.transform = "rotate("+self.rotate+"deg)";
  },80);
};

Ship.prototype.stop = function () {
    if(0 == this.state){
        return false;
    }
    this.state =  0;
    var self = this;

    clearInterval(this.interval);
    this.interval = setInterval(function () {
        if(self.power>980){
            self.power = 1000;
            self.ship.innerHTML = "100%";
            clearInterval(self.interval);
            return;
        }
        self.power += self.restore;
        self.ship.innerHTML = parseInt(self.power/10,10) + "%";
    },80);
};

Ship.prototype.destroySelf = function () {
    var earth = document.querySelector(".earth");
    this.stop();
    earth.removeChild(this.ship);
};

Ship.prototype.receive = function (signal) {
    signal = this.Adapter(signal);
    if(signal.index != this.index){
        return false;
    }
    var command = signal.command;
    switch (command){
        case "fly":
            this.fly();
            break;
        case "stop":
            this.stop();
            break;
        case "destroy":
            this.destroySelf();
            break;
        default:
            console.log("command rejected");
            break;
    }
};

Ship.prototype.Adapter = function (signal) {
    var result = {};
    var commands = ["fly","stop","destroy"];

    result.index = parseInt(signal.slice(0,4),2).toString(10) - 0;
    result.command = commands[parseInt(signal.slice(0,4),2).toString(10) - 0];
    return result;
};

var Commander = function () {
};

Commander.prototype.command = function (signal) {
    Bus.receive(this.Adapter(signal));
};

/**
 * @return {string}
 */
Commander.prototype.Adapter = function (signal) {
    var transition = {};
    var patch = "0000";
    signal.index = signal.index.toString(2);
    patch = patch.substring(0,patch.length - signal.index.length);
    transition["fly"] = "0000";
    transition["stop"] = "0001";
    transition["destroy"] = "0010";

    return patch + signal.index + transition[signal.command];
};

(function () {
    var commander = new Commander();
    var cmd = document.querySelector(".cmd");

    addHandler(cmd,"click",function (event) {
        var btn = getTarget(event);
        var cmd = document.querySelector(".cmd");
        var cmdBar = btn.parentNode;
        var index = -1;
        var commands = ["fly","stop","destroy"];
        var radios1 = cmd.querySelectorAll("fieldset")[0].querySelectorAll("input");
        var radios2 = cmd.querySelectorAll("fieldset")[1].querySelectorAll("input");
        var speed;
        var consume;

        var ship;
        if (btn.id == "createBtn") {
            for (var iter = 0, len = radios1.length; iter < len; iter++) {
                if (radios1[iter].checked) {
                    speed = parseInt(radios1[iter].value, 10);
                    break;
                }
            }
            for (var iter = 0; iter < 4; iter++) {
                if (!Bus.ships[iter]) {
                    ship = new Ship(iter + 1);
                    ship.createSelf({
                        speed: speed,
                        restore: consume == 0 ? 2 * speed : consume,
                        consume: -2 * speed
                    });
                    Bus.addship(ship,iter);
                    console.log("create new ship");
                    break;
                }
            }
        }else if(btn.tagName == "INPUT"){
            console.log("the type of ship has been changed");
        }else if (btn.targetName == "BUTTON"){
            [].forEach.call(cmdBar.querySelectorAll("button"),function (tempBtn,tempIndex) {
                if(btn == tempBtn){
                    index = tempIndex;
                }
            });

            if(index == 2){
                cmd.removeChild(btn.parentNode);
            }
            commander.command({
                index: parseInt(cmdBar.querySelector("span").innerHTML.substr(1, 1), 10),
                command: commands[index]
            });
            console.log(commands[index] + " command sent from commander");
        } else{
            console.log("keep working...");
        }
    });


})();