console.log("");
console.warn("Chap3_________________________________________________________________________");

//3.1 전역 스코프
aGlobalVariable = 'ling la vida global';
console.info("aGlobalVariable: ", _.map(_.range(2), function () {
        return aGlobalVariable;
    })
);

//변경할 수 있는 객체를 여기저기로 넘겨줄 수 있는 상황에서 객체의 프로퍼티를 바꾸는 것은 전역 변수의 값을
//바꾸는 것이나 다른 없다.
function makeEmptyObject() {
    return new Object();
}
var testObject = makeEmptyObject();
testObject.name = function () {
    return "test";
};
console.info("makeEmptyObject: ", testObject.name());

//3.2 어휘 스코프: 변수와 값의 유효 범위를 가리킨다
aVariable = "Outer";
function afun() {
    var aVariable = "Middle";
    return _.map([1, 2, 3], function (e) {
        var aVariable = "In";
        return [aVariable, e].join(' ');
    });
}
console.info("afun: ", afun());

//3.3. 동적 스코프:
var globals = {};

function makeBindFun(resolver) {
    return function (k, v) {
        console.log("  > k:", k, "v:", v);

        var stack = globals[k] || [];
        globals[k] = resolver(stack, v); //global['a'] = [1]
        return globals;
    };
}

var stackBinder = makeBindFun(function (stack, v) {
    console.log("  | stack:", stack, "v:", v);
    stack.push(v);
    return stack;
});

var stackUnbinder = makeBindFun(function (stack) {
    console.log("  | stack:", stack);
    stack.pop();
    return stack;
});

var dynamicLookup = function (k) {
    var slot = globals[k] || [];
    return _.last(slot);
};

function f() {
    return dynamicLookup('a');
};

function g() {
    stackBinder('a', 'g');

    //todo: 여기서 명시적으로 동적 바인딩을 '언바인딩'해야 헸다는 건가? 이해가 잘 안감
    //- 호출을 누가했느냐에 따라서 a의 바인딩이 다르다는 이슈가 있다는 게 문제인 것 같다.
    console.log(" global", JSON.stringify(globals)); //=> {"a":[1,"g"],"b":[100],"c":[200]}

    return f(); //f() 함수를 호출
};

console.info("stackBinder:", JSON.stringify(stackBinder('a', 1)));   //=> {"a":[1]}
console.info("stackBinder:", JSON.stringify(stackBinder('b', 100))); //=> {"a":[1, 100]}
console.info("stackBinder:", JSON.stringify(stackBinder('c', 200))); //=> {"a":[1],"b":[100],"c":[200]}
console.info("dynamicLookup:", dynamicLookup('a')); //=>1
console.info("dynamicLookup:", dynamicLookup('b')); //=>100

console.info("stackBinder:", JSON.stringify(stackBinder('a', '*'))); //{"a":[1,"*","g"],"b":[100],"c":[200]}
console.info("dynamicLookup:", dynamicLookup('a')); //=>*
console.info("stackBinder:", JSON.stringify(stackUnbinder('a'))); //{"a":[1],"b":[100],"c":[200]}

console.info("f:", f()); //=> 1
console.info("g:", g()); //=> 'g'
console.info("globals: ", JSON.stringify(globals)); // {a: [1, "g"], b: [100]}

function globalThis() {
    return this;
}

//call메서드를 이용해서 'this' 레퍼런스를 원하는 값으로 설정할 있다.
console.info("globalThis: ", globalThis()); //=> Window 전역 객체
console.info("globalThis: " + globalThis.call('barnabas'));     //=> barnabas
console.info("globalThis: " + globalThis.apply('orsulak', [])); //=> orsulak

var nopeThis = _.bind(globalThis, 'nope'); //globalThis의 this 객체에 'nope'을 설정함
console.info("nopeThis: " + nopeThis.call('wat')); //=> 'nope';

var target = {
    name: 'the right value',
    aux: function () {
        return this.name;
    },
    act: function () {
        return this.aux();
    }
};
console.info("target:", target.aux());                   //=> target: the right value
console.info("target:", target.aux.call(target, 'wat')); //=> target: the right value

//todo: 잘 이해가 안됨.
//console.info("target.act.call:", target.act.call('wat'));
//=> Uncaught TypeError: this.aux is not a function <- 이건 value값이 function처럼 호출될때 오류가 발생함

_.bindAll(target, 'aux', 'act'); //aux, act 함수가 실행될때마다 target 객체(this)로 실행되로록 bind 시켜줌
console.info("target.aux.call:", target.aux.call('wat')); //=>the right value
console.info("target.act.call:", target.act.call('wat')); //=>the right value

//3.4 함수 스코프:
function strangeIdentity(n) {
    // intentionally strange
    for (var i = 0; i < n; i++);
    return i;
}

console.info("strangeIdentity: ", strangeIdentity(138)); //=> 138

function strangeIdentity(n) {
    var i;
    for (i = 0; i < n; i++);
    return i;
}

function strangerIdentity(n) {
    // intentionally stranger still
    console.log("  > this: ", this); //i: 108으로 세팅이 됨
    for (this['i'] = 0; this['i'] < n; this['i']++); //여기서 this는 전역객체 window를 가리킨다.
    return this['i'];
}

console.info("strangeIdentity: ", strangerIdentity(108)); //=> 108
console.info("i:", i); //실제로 전역 객체의 값을 바꿨음.
console.info("strangeIdentity.call: ", strangerIdentity.call({}, 10000)); //=> 10000

//todo: 이 부분 잘 이해가 안된다.
//clone을 사용하면 전역 컨텍스트를 넘겨주는 문제를 해결할 수 있다
function f() {
    this['a'] = 200;
    return this['a'] + this['b'];
}

var globals = {'b': 2};
console.info("_.clone: ", f.call(globals)); //=> 202
console.log("  > globals:", globals);
console.info("_.clone: ", f.call(_.clone(globals))); //=> 202
console.log("  > globals:", globals);

//3.5 클로저: 근처에서 만들어진 변수를 '캡처'하는 함수다
//- closure is a function having accessing to the parent scope, even after the parent function has closed

function whatWasTheLocal() {
    var CAPTURED = "Oh hai";
    return function () {
        return "The local was : " + CAPTURED;
    };
}
var reportLocal = whatWasTheLocal();
console.info("reportLocal: ", reportLocal()); //=>The local was : Oh hai

console.info("whatWasTheLocal: ", whatWasTheLocal()()); //=>The local was : Oh hai

//클로저는 지역 변수만 캡처할 수 있는 것은 아니다. 함수 인자도 갭처할 수 있다 (todo: 잘 이해가 안됨)
function createScaleFunction(FACTOR) {
    console.log("FACTOR: ", FACTOR);
    return function (v) {
        return _.map(v, function (n) {
            var test = "frank";
            return (n * FACTOR); //외부 factor 변수에 접근할 수 있고 내부안에서 작업함
        });
    };
}

var scale10 = createScaleFunction(10); //여기서 넘겨줬는데 아래에서 기억을 하고 있음
console.log("scale10: ", scale10([1, 2, 3])); //=> [10, 20, 30]

//클로저 simulation
function createWeirdScaleFunction(FACTOR) {
    return function (v) {
        this['FACTOR'] = FACTOR;
        var captures = this;
        console.log("  > captures: ", captures);

        return _.map(v,
            _.bind(function (n) { //_.bind은 함수가 실행될때마다 this의 객체가 captures로 설정된다는 것
                return (n * this['FACTOR']);
            }, captures)
        );
    };
}

var scale10 = createWeirdScaleFunction(10);
console.info("scale10:", scale10.call({}, [5, 6, 7])); //=> [50, 60, 70];

//캡처된 변수: 지역적인 선언없이(전달되지도 않았으면 지역에서 정의되지 않은) 어떤 함수에서 변수를 사용한다면 캡처된 변수다
function makeAdder(CAPTURED) {
    return function (free) {
        return free + CAPTURED;
    };
}

var add10 = makeAdder(10);
console.info("add10: ", add10(32)); //=> 42

var add1024 = makeAdder(1024);
console.info("add1024: ", add1024(11)); //=> 1035
console.info("add1024: ", add10(98)); //=> 108

function averageDamp(FUN) {
    return function (n) {
        return average([n, FUN(n)]);
    }
}

var averageSq = averageDamp(function (n) { //함수를 갭처함
    return n * n
});
console.info("averageSq: ", averageSq(10)); //=> 55

//세도잉: 변수가 특정 스코프에 정의되어 있는 상태에서 하위스코프에서 같은 이름으로 다른 변수를 정의할 때 변수 세도잉이 발생함
var name = "Fogus";
var name = "Renamed";
console.info("name:", name); //=> Renamed

var shadowed = 0;
function argShadow(shadowed) {
    return ["Value is", shadowed].join(' ');
}
console.info(argShadow(108));   //=> Value is 108
console.info(argShadow());      //=> Value is <-- 인자를 넘겨주지 않아도 세도우 바인딩이 유호함을 확인할 수 있음

function varShadow(shadowed) {
    var shadowed = 4320000;
    return ["Value is", shadowed].join(' ');
}
console.info(varShadow(108));   //=> argShadow
console.info(argShadow());      //=> Value is

//세도잉이 발생하지 않도록 이름 짓는 규칙에 주의를 기울여야 한다
function captureShadow(SHADOWED) {
    return function (SHADOWED) { //여기서 인자로 사용됨 (108이 shadowed되어 버림)
        return SHADOWED + 1;
    }
}
var closureShadow = captureShadow(108);
console.info("closureShadow: ", closureShadow(2)); //=> 3

//3.5.2 클로저 사용하기
//클로저에서는 클로저가 만들어질 당시에 캡처한 값의 레퍼런스(찬뱡형 PRED)를 캡처한다
function complement(PRED) {
    return function () {
        return !PRED.apply(null, _.toArray(arguments)); //반환되는 함수는 PRED를 캡쳐한다
    };
}

function isEven(n) {
    return (n % 2) === 0
}

var isOdd = complement(isEven);
console.info("isOdd:", isOdd(2));   //=> false
console.info("isOdd:", isOdd(413)); //=> true

//isEven의 새 레퍼런스를 만들었으므로 콜로저 isOdd에는 아무영향이 없다.
//function isEven(n) {
//    return false;
//}

console.info("isEven:", isEven(10)); //=> false
console.info("isOdd:", isOdd(13));   //=> true
console.info("isOdd:", isOdd(12));   //=> true

function showObject(OBJ) {
    return function () {
        return OBJ;
    };
}

var o = {a: 42};
var showO = showObject(o);
console.info("showO:", showO()); //=> {a:42}

//변수 o의 레퍼런스가 클로저의 내부와 외부에 모두 존재하므로 o가 바뀌면서 두 경계의 값이 서로 엉키게 된다.
//- 일반적으로 캡처된 변수의 노출은 최소화한다.
o.newField = 108;
console.info("showO:", showO()); //=> {a: 42, newField: 108}

//익명 함수 내에서 만들어진 갭처된 변수 PRIVATE가 두 클로저에 비공개로 되어 있어서 두 함수를 호출하는 것
//이외에 접근할 방법이 없다
var pingpong = (function () {
    var PRIVATE = 0;
    return {
        inc: function (n) {
            return PRIVATE += n;
        },
        dec: function (n) {
            return PRIVATE -= n;
        }
    };
})();

console.info("pingpong.inc: ", pingpong.inc(10)); //=> 10
console.info("pingpong.dec: ", pingpong.dec(7)); //=> 3

//다른 함수를 추가해도 역시 안전하다.
pingpong.div = function (n) {
    return PRIVATE / n
};
//console.info("pingpong.div: ", pingpong.div(3)); //=> PRIVATE is not defined

//3.5.3 추상화 도구 클로저
//plucker함수는 (배열이나 객체 같은) 연상 구조체를 키로 받아서 주어진 구조체에서 키에 해당하는 값을 반환하는 함수를
function plucker(FIELD) {
    return function (obj) {
        return (obj && obj[FIELD]);
    };
}

var best = {title: "Infinite Jest", author: "DFW"};
var getTitle = plucker('title');
console.info("getTitle:", getTitle(best)); //=> "Infinite Jest"

var books = [{title: "Chthon"}, {stars: 5}, {title: "Botchan"}];
var third = plucker(2);
console.info("third:", third(books)); //=> {title: "Botchan"}

console.info(JSON.stringify(_.filter(books, getTitle))); //=> [{"title":"Chthon"},{"title":"Botchan"}]
