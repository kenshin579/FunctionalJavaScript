console.log("");
console.warn("Chap9_________________________________________________________________________");

//9.1 데이터 지향
/**
 * 다른 점:
 * - 게이른 체인은 함수 호출로 초기화된다. (vs. new LazyChain)
 * - (calls의) 호출 체인으 비공개 데이터이다
 * - 명시적인 LazyChain의 형식은 존재하지 않는다.
 *
 * @param obj
 * @returns {{invoke: Function, force: Function}}
 */
function lazyChain(obj) {
    var calls = [];

    return {
        invoke: function (methodName /* args */) {
            var args = _.rest(arguments);

            calls.push(function (target) {
                var meth = target[methodName];

                return meth.apply(target, args);
            });

            return this;
        },
        force: function () {
            return _.reduce(calls, function (ret, thunk) {
                return thunk(ret);
            }, obj);
        }
    };
}

var lazyOp = lazyChain([2, 1, 3])
    .invoke('concat', [7, 7, 8, 9, 0])
    .invoke('sort');

console.info("lazyOp.force():", lazyOp.force()); //=> [0, 1, 2, 3, 7, 7, 8, 9]
//명시적으로 데이터 형식을 만들어야 할때가 있는가 하면 필요한 시점까지 데이터 형식 결정을 미루는 것이 바람직할 때가 있다.
// - 데이터 형식을 미루면 추상화라는 프로그래밍상의 이득을 취할 수 있다.

/*
 9.1.1 함수를 이용하는 프로그래밍
 */

/**
 * todo: 아래 왜 이렇게 하는지 이해가 안된다.
 * 그전 LazyChain과 다른 점이 무엇이고 왜 아래처럼 하는지?
 *
 * @param ary
 * @returns {*}
 */
function deferredSort(ary) {
    console.log("   deferredSort: ary> ", JSON.stringify(ary));
    return lazyChain(ary).invoke('sort');
}
console.info("deferredSort:", lazyChain([[2, 1, 3], [7, 7, 1], [0, 9, 5]]).invoke('sort'));

var deferredSorts = _.map([[2, 1, 3], [7, 7, 1], [0, 9, 5]], deferredSort);
console.info("deferredSorts:" + JSON.stringify(deferredSorts)); //=> [<thunk>, <thunk>, <thunk>]

function force(thunk) {
    console.log("     force: thunk> ", thunk);
    return thunk.force();
}
console.info("force:", JSON.stringify(_.map(deferredSorts, force))); //=> [[1,2,3],[1,7,7],[0,5,9]]

/*
 함수 내부로 검증 과정을 추가했으므로 검증 과정을 자유롭게 바꿔도 다른 동작에 영향을 미치지 않는다.
 */
var validateTriples = validator(
    "Each array should have three elements",
    function (arrays) {
        return _.every(arrays, function (a) { //true or false
            return a.length === 3;
        });
    });

//todo: 왜 여기서 partial1이 필요한가? 왜 identity를 넣는가?
var validateTripleStore = partial1(condition1(validateTriples), _.identity);

console.info("validateTripleStore:",
    JSON.stringify(validateTripleStore([[2, 1, 3], [7, 7, 1], [0, 9, 5]]))); //=> [[2,1,3],[7,7,1],[0,9,5]]

//console.info("validateTripleStore:",
//    JSON.stringify(validateTripleStore([[2, 1, 3], [7, 7, 1], [0, 9, 5, 3, 3]]))); //=> Error: Each array should have three elements

function postProcess(arrays) {
    console.log("    postProcess: arrays>", JSON.stringify(arrays)); //
    return _.map(arrays, second);
}

/**
 *
 *
 * @param data
 * @returns {*}
 */
function processTriples(data) {
    return pipeline(data,
        JSON.parse,          //string -> JSON obj
        validateTripleStore, //triple인지 검증함, 오류가 있으면 오류(output)
        deferredSort,
        force,               //결과: [[0,9,5],[2,1,3],[7,7,1]]
        postProcess,         //[9, 1, 7]
        invoker('sort', Array.prototype.sort),
        str);
}

console.info("processTriples:", processTriples("[[2, 1, 3], [7, 7, 1], [0, 9, 5]]")); //=> 1,7,9

//이상한 데이터가 제공되었을 때는 검증 단계에서 실행이 일찌감치 종료된다는 장점도 있다.
//console.info("processTriples:", processTriples("[[2, 1, 3], [7, 7, 1], [0, 9, 5, 4, 4]]")); //=> Each array should have three elements

//$(document).ready(function () {
//    $.get("http://werwe.com", function (data) {
//        $('#result').text(processTriples(data));
//    })
//});

//var reportDataPackets = _.compose(
//    function (s) {
//        $(document).ready(function () {
//            $('#result').text(s);
//        });
//    },
//    processTriples);

//console.info("reportDataPackets:", reportDataPackets("[[2, 1, 3], [7, 7, 1], [0, 9, 5]]"));
//console.info("reportDataPackets:", $.get("http://sdsdf.com", reportDataPackets));

/*
 9.2 믹스인
 */

/**
 * 1. 객체가 필요한 상황의 예.
 * 인자로 받은 객체를 문자열 표현으로 반환한다.
 *
 * @param obj
 * @returns {*}
 */
function polyToString(obj) {
    console.log("   polyToString: obj>", obj);
    if (obj instanceof String)
        return obj;
    else if (obj instanceof Array)
        return stringifyArray(obj);

    return obj.toString();
}
/**
 * todo: 왜 2번 join 시킬까?
 * ["[", _.map(ary, polyToString).join(","), "]"]
 * => ["[", "1,2,3", "]"].join('') => [1,2,3]
 *
 * => ["[", "3,4", "]"]
 * => ["[", "1,2,[3,4]", "]"]
 *
 * @param ary
 * @returns {string}
 */
function stringifyArray(ary) {
    var x = ["[", _.map(ary, polyToString).join(","), "]"];
    console.log("   x:", x);
    return x.join('');
    //return ["[", _.map(ary, polyToString).join(","), "]"].join('');
}

console.info("polyToString:", polyToString([1, 2, 3])); //=> "[1,2,3]"
console.info("polyToString:", polyToString([1, 2, [3, 4]])); //=>  "[1,2,[3,4]]"
console.info("polyToString:", polyToString({a: 1, b: 2})); //=>  [object Object] <--

/*
 더 다양한 객체를 처리하려면 polyToString 바디에 if 문을 새로 추가해야 하는데, 이는 좋읍 방법이 아니다.
 - 결론: dispatch 사용
 */
var polyToStringDispatch = dispatch(
    function (s) {
        return _.isString(s) ? s : undefined
    },
    function (s) {
        return _.isArray(s) ? stringifyArray(s) : undefined
    },
    function (s) {
        return _.isObject(s) ? JSON.stringify(s) : undefined
    },
    function (s) {
        return s.toString()
    });

console.info("polyToStringDispatch:", polyToStringDispatch([1, 2, 3])); //=> "[1,2,3]"
console.info("polyToStringDispatch:", polyToStringDispatch([1, 2, [3, 4]])); //=>  "[1,2,[3,4]]"
console.info("polyToStringDispatch:", polyToStringDispatch({a: 1, b: 2}));

/*
 9.2.1 코어 프로토타입 개조
 - 이슈사항
 */
console.info("polyToStringDispatch:", polyToString(new Container(_.range(5)))); //=> [object Object]
/**
 * Container map 형식은 polyToString이 처리를 못함.
 * 그래서, polyToStringDispatch 보다는 직접 객체 자체의 toString 메서드를 customize하는게 더 좋다는 의미임
 *
 * @returns {string}
 */
Container.prototype.toString = function () {
    return ["@", polyToString(this._value), ">"].join('');
}

console.info("polyToStringDispatch:", polyToString(new Container(_.range(5)))); //=>  @[0,1,2,3,4]>

/*
 9.2.2 클래스 계층
 - todo: 아래 코드는 prototype library가 필요함
 */

//function ContainerClass() {
//}
//function ObservedContainerClass() {
//}
//function HoleClass() {
//}
//function CASClass() {
//}
//function TableBaseClass() {
//}

//ObservedContainerClass.prototype = new ContainerClass();
//HoleClass.prototype = new ObservedContainerClass();
//CASClass.prototype = new HoleClass();
//TableBaseClass.prototype = new HoleClass();

var ContainerClass = Class.create();
ContainerClass.prototype = {
    initialize: function (val) {
        this._value = val;
    }
};

var c = new ContainerClass(42);
console.info("c:", c); //=> {_value: 42 ...}

//console.info(c instanceof Class); //=> true

var ObservedContainerClass = Class.create();

ObservedContainerClass.prototype = Object.extend(new ContainerClass(), {
    observe: function (f) {
        note("set observer")
    },
    notify: function () {
        note("notifying observers")
    }
});

var HoleClass = Class.create();

HoleClass.prototype = Object.extend(new ObservedContainerClass(), {
    initialize: function (val) {
        this.setValue(val)
    },
    setValue: function (val) {
        this._value = val;
        this.notify();
        return val;
    }
});

var CASClass = Class.create();

CASClass.prototype = Object.extend(new HoleClass(), {
    swap: function (oldVal, newVal) {
        if (!_.isEqual(oldVal, this._value)) fail("No match");

        return this.setValue(newVal);
    }
});

var h = new HoleClass(42);
h.observe(null);
console.info(h.setValue(108));
//=>
//NOTE: notifying observers
//108

var c = new CASClass(42);
console.info(c.swap(42, 43));
//=>
//NOTE: notifying observers
//43
//console.info(c.swap('test', 43)); //=> Error: No match

/*
 9.2.3 계층 구조 바꾸기
 - 계층 중간에 (값이 올바른지 검증하는 함수를 부착할 수 있게, ValidatedContainer를 추가한다면?
 이슈사항
 - 계층 구조에서 바꿀때 이슈가 되는 부분
 */

/*
 9.2.4 믹스인으로 계층 구조를 수평화하기
 믹스인:
 - 기존 함수를 조립해서 새로운 함수를 만든다는 개념
 - 모든 박스(클래스)가 동작이므로 새로 동작을 정의하거나 기존 동작을 '섞어서' 새로운 동작을 정의할 수 있다.
 */

/**
 * this.initialize 호출은 믹스인을 정의하거나 또는 클라이언트가 Container와
 * 상호작용을 하는 방식 이외의 Container 확장 수단을 제공한다.
 *
 *  * 확장 프로토콜
 * - init 메서드를 반드시 제공한다.
 *
 * 인터페이스 프로토콜
 * - 생성자만 제공한다.
 *
 * @param val
 * @constructor
 */
function ContainerMixin(val) {
    this._value = val;
    this.initialize(val);
}
ContainerMixin.prototype.initialize = _.identity;

var cMixin = new Container(42);
console.info("cMixin:", cMixin); //=> {_value: 42}

/**
 * 1. 값 저장
 * 2. 값 집합을 검증하도록 검증 함수에 위임
 * 3. 관심이 있는 값 변화를 통지하도록 통지(notification) 함수에 위임
 *
 * @type {{setValue: Function}}
 */
var HoleMixin = {
    setValue: function (newValue) {
        var oldVal = this._value;

        this.validate(newValue);
        this._value = newValue;
        this.notify(oldVal, newValue);
        return this._value;
    }
};

/**
 * 확장 프로토콜
 * - notify, validate, init 메서드를 반드시 제공한다.
 *
 * 인터페이스 프로토콜
 * - 생성자와 setValue 제공
 *
 * @param val
 * @constructor
 */
var Hole = function (val) {
    ContainerMixin.call(this, val);
};

//var hMixin = new Hole(42);
//console.info("hMixin:", hMixin); //TypeError: this.initialize is not a function

/**
 *
 * @type {{watch, notify}}
 */
var ObserverMixin = (function () {
    var _watchers = []; //은닉된 객체(캡슐화)

    return {
        watch: function (fun) {
            _watchers.push(fun);
            return _.size(_watchers);
        },
        notify: function (oldVal, newVal) {
            _.each(_watchers, function (watcher) {
                watcher.call(this, oldVal, newVal);
            });

            return _.size(_watchers);
        }
    };
}());

/**
 * ValidateMixin이 initialize 확장 요구사항을 만족시킨다.
 *
 * @type {{addValidator: Function, initialize: Function, validate: Function}}
 */
var ValidateMixin = {
    addValidator: function (fun) {
        this._validator = fun;
    },
    initialize: function (val) {
        this.validate(val);
    },
    validate: function (val) {
        if (existy(this._validator) && !this._validator(val))
            fail("Attempted to set invalid value " + polyToString(val));
    }
};

/*
 Hole 형식의 요구사항을 모두 만족시킨다.
 */
_.extend(Hole.prototype
    , HoleMixin
    , ValidateMixin
    , ObserverMixin);

var hMixin = new Hole(42);
console.info("hMixin:", hMixin); //=> Hole {_value: 42}

hMixin.addValidator(always(false));
//hMixin.setValue(9); //=> Error: Attempted to set invalid value 9

hMixin.addValidator(isEven);
hMixin.setValue(108); //=> 108
console.info("hMixin:", hMixin);
//=> {_validator: function isEven(n) {...},
//_value: 108}

console.info(hMixin.watch(function (old, nu) {
    note(["Changing", old, "to", nu].join(' '));
})); //=> 1

console.info("hMixin.setValue", hMixin.setValue(42));
//=>
//NOTE: Changing 108 to 42
//hMixin.setValue 42

console.info(hMixin.watch(function (old, nu) {
    note(["Veranderended", old, "tot", nu].join(' '));
})); //=> 2

console.info("hMixin.setValue", hMixin.setValue(36));
//=>
//NOTE: Changing 42 to 36
//NOTE: Veranderended 42 tot 36
//hMixin.setValue 36

/*
 9.2.5 믹스인 확장을 이용해서 새 기능 추가
 */
/**
 * 확장 프로토콜
 * - setValue 메서드와 _value 프로퍼티를 반드시 제공해야 한다.
 *
 * 인터페이스 프로토콜
 * - swap 메서드 제공
 *
 * @type {{swap: Function}}
 */
var SwapMixin = {
    swap: function (fun /* , args... */) {
        var args = _.rest(arguments);
        console.log("   swap: args>", args);
        //var newValue = fun.apply(fun, construct(this._value, args));
        var newValue = fun.apply(this, construct(this._value, args));

        return this.setValue(newValue);
    }
};

//todo: 이해가 잘 안됨
var o = {_value: 0, setValue: _.identity};
console.info("_.extend:", _.extend(o, SwapMixin));
console.info("o.swap:", o.swap(construct, [1, 2, 3])); //=> [0, 1, 2, 3]

var SnapshotMixin = {
    snapshot: function () {
        return deepClone(this._value);
    }
};

_.extend(Hole.prototype
    , HoleMixin
    , ValidateMixin
    , ObserverMixin
    , SwapMixin
    , SnapshotMixin);

var h2 = new Hole(42);
console.info("h2:", h2.snapshot()); //=> 42
console.info("h2:", h2.swap(always(99)));
//=>
//NOTE: Changing 42 to 99
//NOTE: Veranderended 42 tot 99
//99

console.info("h2:", h2.snapshot()); //=> 92

/*
 9.2.6 믹스인 믹싱을 이용한 새로운 형식
 */
/**
 * 비교후 교환기능을 수행하는 CAS라는 형식을 구현함
 * - CAS에서는 기본 값이 무엇인지 알고 있어야만 형식에 변화를 줄 수 있다.
 *
 * @param val
 * @constructor
 */
var CAS = function (val) {
    Hole.call(this, val);
};

var CASMixin = {
    swap: function (oldVal, f) {
        if (this._value === oldVal) {
            this.setValue(f(this._value));
            return this._value;
        }
        else {
            return undefined;
        }
    }
};

_.extend(CAS.prototype
    , HoleMixin
    , ValidateMixin
    , ObserverMixin
    , SwapMixin //<- 여기서 swap 함수가 있음. 나중에 확장 될 수 있기 때문에 남겨둠
    , CASMixin  //<- 여기도 swap 함수가 있음.
    , SnapshotMixin);

var c1 = new CAS(42);
console.info("c1:", c1.swap(42, always(-1)));
//=>
//NOTE: Changing 42 to -1
//NOTE: Veranderended 42 tot -1
//-1

console.info("c1:", c1.snapshot()); //=> -1
console.info("c1:", c1.swap("not the value", always(10000))); //undefined
console.info("c1:", c1.snapshot()); //=> -1

/*
 9.2.7 메서드는 저수준 동작이다
 */
function contain(value) {
    return new Container(value);
}

function hole(val /*, validator */) {
    var h = new Hole(); //addValidator, validate 이미 prototype에 들어가 있음.
    var v = _.toArray(arguments)[1];

    if (v) h.addValidator(v);

    h.setValue(val);

    return h;
}

//var x1 = hole(42, always(false));
//console.info("x1:", x1); //=>Error: Attempted to set invalid value 42

var swap = invoker('swap', Hole.prototype.swap);

var x2 = hole(42);
console.info("swap:", swap(x2, sqr)); //=> 1764

/**
 * todo: 잘 이해가 안됨
 * @param val
 * @returns {CAS}
 */
function cas(val /*, args */) {
    var h = hole.apply(this, arguments);
    var c = new CAS(val);
    c._validator = h._validator;

    return c;
}

var compareAndSwap = invoker('swap', CAS.prototype.swap);

function snapshot(o) {
    return o.snapshot()
}
function addWatcher(o, fun) {
    o.watch(fun)
}

var x3 = hole(42);
//=>
//NOTE: Changing  to 42
//NOTE: Veranderended  tot 42
addWatcher(x3, note);
swap(x, sqr);
//
//var y = cas(9, isOdd);
//compareAndSwap(y, 9, always(1));
//console.info("snapshot:", snapshot(y));
