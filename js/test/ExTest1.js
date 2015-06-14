console.warn("Closure Example________________________________________________________");

//JavaScript에서는 내부 함수는 parent scope에 접근할 수 있다.
function add() {
    var counter = 0;

    function plus() {
        counter += 1; //count 접근이 가능함
    }

    plus();
    return counter;
}
console.info("add:", add());
console.info("add:", add());
console.info("add:", add());

var add = (function () {
    var counter = 0;
    return function () {
        return counter += 1;
    }
})();

//self-invoking 함수는 단 한번만 실행됨. 실행하고 return 값으로 함수 expression을 반환함
//- 그래서 counter는 한번만 zero로 세팅함
console.info("add:", add());
console.info("add:", add());
console.info("add:", add());


console.warn("fnull________________________________________________________");
//왜 reduce의 함수에서의 agruments 배열이 이해가 안됨
function existy(x) {
    return x != null
};

var nums = [1, 2, 3, null, 5];

function fnull(fun /*, defaults */) {
    var DEFAULTS = _.rest(arguments);
    console.log("   > arguments:", arguments);
    console.log("   > defaults:", DEFAULTS);

    return function (/* args */) { //safeMulti에서 넘겨온 arguments를 나타낸다.
        console.log("   + arguments:", arguments); //=> [1, 2, 1, Array[5]] todo: 왜 이렇게 arguments가 채워지나?

        //var args = _.map(arguments, function (e, i) {
        //    console.log("   > prev:", e, " curr:", i, " defaults:", DEFAULTS[i]);
        //    return existy(e) ? e : DEFAULTS[i]; //todo: 잘 이해가 안됨
        //}); //args를 새롭게 채워서 함수를 실행하도록 함

        //console.log("  = args:", args);
        //return fun.apply(null, args);
    };
};

var safeMult = fnull(function (total, n) {
    console.log("   => total:", total, " n:", n);
    return total * n
}, 1, 1);

console.log("safeMult:" + safeMult);
console.info("safeMult:", _.reduce(nums, safeMult)); //=> 30
console.info("safeMult:", _.reduce(nums, function () {
    console.log("  >=== arguments: ", arguments); //init, current, key, context
})); //=> 30
console.info("_.reduce: ", _.reduce([1, 2, 3, 4, 5], function (prevObj, value, key) {
    console.log("    > arguments:", arguments); //<=== 이렇게 호출이 됨
    console.log("    > prevObj: ", prevObj, "value:", value, "key:", key);
    //return previousValue + currentValue;
    return prevObj;
}, 2));

console.warn("Functions________________________________________________________");
console.error("1. 일반 함수 호출");
function say(something) {
    console.log(something);
    console.log("this:", this); //Window Object
}

say("hello");

console.info(typeof window.say);

console.error("2. 맴버함수 호출");
var unikys = {
    name: "frank",
    say: function (something) {
        console.log(this);
        console.log(this.name + ": " + something);
    }
};

unikys.say("hello");
unikys["say"]("hello2");

console.error("3. call/apply 호출");
unikys.say.call(unikys, "call is called");
unikys.say.apply(unikys, ["call is called"]);
unikys.say.apply(null, ["call is called"]);

var gasGuzzler = {
    year: 2008,
    model: 'Dodge'
};


function ArrayMaker(arg1, arg2) {
    this.someProperty = 'whatever';
    this.theArray = [this, arg1, arg2];
}

ArrayMaker.prototype = {
    someMethod: function () {
        console.log("someMethod callled");
    },
    getArray: function () {
        return this.theArray;
    }
};

var am = new ArrayMaker('one', 'two');
console.log("am:", am);
//var other = new ArrayMaker('first', 'second');
//
//am.getArray();
//other.getArray();

console.error("4. constructor 호출 (new에 의해서 호출됨)");

/**
 * Constructor 호출(new에 의해서 호출됨)
 * 1. new Empty 객체가 생성됨 {}
 * 2. constructor 속성이 object에 추가됨 (자동으로)
 * 3. Vehicle.prototype 속성도 자동으로 추가된다 (empty object)
 * - instance했을 때 prototype 객체에 대해서 암묵적인 참조를 갖게 된다.
 * 4.새로운 객체, Vehicle()함수츨 호출한다.
 * - return 값이 없는 경우 this를 반환한다.
 *
 * @param color
 * @constructor
 */
var Vehicle = function Vehicle(color) {
    this.color = color;
};
//Vehicle.prototype.wheelCount = 4;
Vehicle.prototype = {
    wheelCount: 4,
    go: function go() {
        return "Vroom!";
    }
};

var vehicle = new Vehicle("tan");
console.info("vehicle" + JSON.stringify(vehicle));
console.info("vehicle.constructor:" + vehicle.constructor);
console.info("vehicle.wheelCount:" + vehicle.wheelCount);

var Car = function Car() {
};
Car.prototype = new Vehicle("tan");
Car.prototype.honk = function honk() {
    return "BEEP!";
};

var car = new Car();
car.honk();
car.go();
console.info("car.color:", car.color); //=> tan
console.info("car.color:", car instanceof Car); //=> true
console.info("car.color:", car instanceof Vehicle); //=> true

function makeFunc() {
    var name = "Mozilla";

    function displayName() {
        //alert(name);
    }

    return displayName;
}

var myFunc = makeFunc();
myFunc();

var x = 10, y = 20, z = 30;
function outerFunc() {
    console.log(x, y, z);
}

function first() {
    var x = 1;
    var y = 2;

    (function () {
        console.log(x, y, z); //undefined, 2, 30
        var x = 50;
        y = z;
        outerFunc(); //10, 20, 30
    })();
}
first();

function foo() {
    console.log("%0", this);
}

foo(); //=> global
console.log(foo === foo.prototype.constructor);
foo.prototype.constructor();







