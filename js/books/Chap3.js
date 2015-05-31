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

console.info("globalThis: ", globalThis());

//function strangeIdentity(n) {
//    // intentionally strange
//    for(var i=0; i<n; i++);
//    return i;
//}
//
//strangeIdentity(138);
////=> 138
//
//function strangeIdentity(n) {
//    var i;
//    for(i=0; i<n; i++);
//    return i;
//}
//
//function strangerIdentity(n) {
//    // intentionally stranger still
//    for(this['i'] = 0; this['i']<n; this['i']++);
//    return this['i'];
//}
//
//strangerIdentity(108);
////=> 108
//
//function createScaleFunction(FACTOR) {
//    return function(v) {
//        return _.map(v, function(n) {
//            return (n * FACTOR);
//        });
//    };
//}
//
//var scale10 = createScaleFunction(10);
//
//scale10([1,2,3]);
////=> [10, 20, 30]
//
//function createWeirdScaleFunction(FACTOR) {
//    return function(v) {
//        this['FACTOR'] = FACTOR;
//        var captures = this;
//
//        return _.map(v, _.bind(function(n) {
//            return (n * this['FACTOR']);
//        }, captures));
//    };
//}
//
//var scale10 = createWeirdScaleFunction(10);
//
//scale10.call({}, [5,6,7]);
////=> [50, 60, 70];
//
//function makeAdder(CAPTURED) {
//    return function(free) {
//        return free + CAPTURED;
//    };
//}
//
//var add10 = makeAdder(10);
//
//add10(32);
////=> 42
//
//function averageDamp(FUN) {
//    return function(n) {
//        return average([n, FUN(n)]);
//    }
//}
//
//var averageSq = averageDamp(function(n) { return n * n });
//averageSq(10);
////=> 55
//
//function complement(PRED) {
//    return function() {
//        return !PRED.apply(null, _.toArray(arguments));
//    };
//}
//
//function isEven(n) { return (n%2) === 0 }
//
//var isOdd = complement(isEven);
//
//isOdd(2);
////=> false
//
//isOdd(413);
////=> true
//
//function plucker(FIELD) {
//    return function(obj) {
//        return (obj && obj[FIELD]);
//    };
//}
//
//var best = {title: "Infinite Jest", author: "DFW"};
//
//var getTitle = plucker('title');
//
//getTitle(best);
////=> "Infinite Jest"
//
//var books = [{title: "Chthon"}, {stars: 5}, {title: "Botchan"}];
//
//var third = plucker(2);
//
//third(books);
////=> {title: "Botchan"}
