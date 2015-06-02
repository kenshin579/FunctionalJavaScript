console.log("");
console.warn("Chap4_________________________________________________________________________");

//4.1 다른 함수를 인자로 취하는 함수
//4.1.1 함수 전달에 대한 고찰: max, finder, best

var people = [{name: "Fred", age: 65}, {name: "Lucy", age: 36}];

console.info("_.max:", _.max(people, function (p) {
    return p.age
})); //=> {name: "Fred", age: 65}


function finder(valueFun, bestFun, coll) {
    return _.reduce(coll, function (best, current) {
        console.log("  > best:", best, " current:", best);
        var bestValue = valueFun(best);
        var currentValue = valueFun(current);

        return (bestValue === bestFun(bestValue, currentValue)) ? best : current;
    });
}
//_.max와 동일함 함수가 됨
console.info("finder: ", finder(_.identity, Math.max, [1, 2, 3, 4, 5])); //=>5
console.info("finder: ", finder(_.identity, Math.max, [1, 3, 2, 5, 4])); //=>5

console.info("finder: ", finder(plucker('age'), Math.max, people)); //=>{name: "Fred", age: 65}
console.info("finder: ", finder(plucker('name'),
    function (x, y) {
        return (x.charAt(0) === "L") ? x : y
    },
    people)); //=>{name: "Lucy", age: 36}

//finder -> best 최적화함
function best(fun, coll) {
    return _.reduce(coll, function (x, y) {
        return fun(x, y) ? x : y;
    });
}
console.info("best:", best(function (x, y) {
    return x > y
}, [1, 2, 3, 4, 5])); //=> 5

console.info("best:", best(function (x, y) {
    console.log("  > x:", x, " y:", y);
    return x.age > y.age;
}, people)); //=> 5

//4.1.2 함수를 다른 인자로 전달하는 상황에 대한 더 깊은 고찰: repeat, repeatdly, iterateUntil
function repeat(times, VALUE) {
    return _.map(_.range(times), function () {
        return VALUE;
    });
}
console.info("repeat:", repeat(4, "Major")); //=> ["Major", "Major", "Major", "Major"]

//정적 값(VALUE)을 사용하는 대신 값대신 함수를 사용하라
function repeatedly(times, fun) {
    return _.map(_.range(times), fun);
}
console.info("repeatedly:", repeatedly(3, function () {
    return Math.floor((Math.random() * 10) + 1);
})); //=> [1, 3, 8]
console.info("repeatedly:", repeatedly(3, function () {
    return "Hello";
})); //=> ["Hello", "Hello", "Hello"]

console.info("repeatedly:", repeatedly(3, function (n) {
    var id = 'id' + n;
    $('body').append($("<p>Odelay!</p>").attr('id', id));
    return id;
})); //=> ["id0", "id1", "id2"]

function iterateUntil(fun, checkPred, init) {
    var ret = [];
    var result = fun(init); //함수 호출 결과를 다음번 함수 호출의 인자로 전달한다.

    while (checkPred(result)) {
        ret.push(result);
        result = fun(result);
    }

    return ret;
};

console.info("iterateUntil:",
    iterateUntil(
        function (n) { //연산하는 함수
            return n + n;
        },
        function (n) { //조건 함수
            return n <= 1024;
        },
        1
    )
);

console.info("repeatedly:", repeatedly(10, function (exp) {
    return Math.pow(2, exp + 1);
}));

//4.2. 다른 함수를 반환하는 함수
function always(VALUE) {
    return function () {
        return VALUE;
    };
};

var f = always(function () {
});
console.info("always:", f() === f()); //=> true

//새로운 클로저는 매번 다른 값을 캡처한다
var g = always(function () {
});
console.info("always:", f() === g()); //=> false
console.info("always:", repeatedly(3, always("Hello"))); //=> ["Hello", "Hello", "Hello"]


function invoker(NAME, METHOD) {
    return function (target /* args ... */) {
        if (!existy(target)) fail("Must provide a target");

        var targetMethod = target[NAME];
        var args = _.rest(arguments);

        return doWhen((existy(targetMethod) && METHOD === targetMethod), function () {
            return targetMethod.apply(target, args);
        });
    };
};

var rev = invoker('reverse', Array.prototype.reverse);
console.info("rev:", JSON.stringify(_.map([[1, 2, 3]], rev))); //=> [[3,2,1]]
//
//function uniqueString(len) {
//    return Math.random().toString(36).substr(2, len);
//};
//
//uniqueString(10);
////=> "3rm6ww5w0x"
//
//function uniqueString(prefix) {
//    return [prefix, new Date().getTime()].join('');
//};
//
//uniqueString("argento");
////=> "argento1356107740868"
//
//function makeUniqueStringFunction(start) {
//    var COUNTER = start;
//
//    return function(prefix) {
//        return [prefix, COUNTER++].join('');
//    }
//};
//
//var uniqueString = makeUniqueStringFunction(0);
//
//uniqueString("dari");
////=> "dari0"
//
//uniqueString("dari");
////=> "dari1"
//
//var generator = {
//    count: 0,
//    uniqueString: function(prefix) {
//        return [prefix, this.count++].join('');
//    }
//};
//
//generator.uniqueString("bohr");
////=> bohr0
//
//generator.uniqueString("bohr");
////=> bohr1
//
//var omgenerator = (function(init) {
//    var COUNTER = init;
//
//    return {
//        uniqueString: function(prefix) {
//            return [prefix, COUNTER++].join('');
//        }
//    };
//})(0);
//
//omgenerator.uniqueString("lichking-");
////=> "lichking-0"
//
//var nums = [1,2,3,null,5];
//
//_.reduce(nums, function(total, n) { return total * n });
////=> 0
//
//function fnull(fun /*, defaults */) {
//    var defaults = _.rest(arguments);
//
//    return function(/* args */) {
//        var args = _.map(arguments, function(e, i) {
//            return existy(e) ? e : defaults[i];
//        });
//
//        return fun.apply(null, args);
//    };
//};
//
//var safeMult = fnull(function(total, n) { return total * n }, 1, 1);
//
//_.reduce(nums, safeMult);
////=> 30
//
//function defaults(d) {
//    return function(o, k) {
//        var val = fnull(_.identity, d[k]);
//        return o && val(o[k]);
//    };
//}
//
//function doSomething(config) {
//    var lookup = defaults({critical: 108});
//
//    return lookup(config, 'critical');
//}
//
//doSomething({critical: 9});
////=> 9
//
//doSomething({});
////=> 108
//
//function checker(/* validators */) {
//    var validators = _.toArray(arguments);
//
//    return function(obj) {
//        return _.reduce(validators, function(errs, check) {
//            if (check(obj))
//                return errs;
//            else
//                return _.chain(errs).push(check.message).value();
//        }, []);
//    };
//}
//
//function validator(message, fun) {
//    var f = function(/* args */) {
//        return fun.apply(fun, arguments);
//    };
//
//    f['message'] = message;
//    return f;
//}
//
//function aMap(obj) {
//    return _.isObject(obj);
//}
//
//var checkCommand = checker(validator("must be a map", aMap));
//
//function hasKeys() {
//    var KEYS = _.toArray(arguments);
//
//    var fun = function(obj) {
//        return _.every(KEYS, function(k) {
//            return _.has(obj, k);
//        });
//    };
//
//    fun.message = cat(["Must have values for keys:"], KEYS).join(" ");
//    return fun;
//}
//
//var checkCommand = checker(validator("must be a map", aMap), hasKeys('msg', 'type'));
