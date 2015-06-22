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
/**
 * 함수를 times만큼 실행한 각 결과는 array에 담아서 반환한다.
 *
 * @param times
 * @param fun
 * @returns {Array|*}
 */
function repeatedly(times, fun) {
    return _.map(_.range(times), fun);
}
console.info("repeatedly:", repeatedly(3, function () {
    return Math.floor((Math.random() * 10) + 1);
})); //=> [1, 3, 8]
console.info("repeatedly:", repeatedly(3, function () {
    return "Hello";
})); //=> ["Hello", "Hello", "Hello"]

//
//console.info("repeatedly:", repeatedly(3, function (n) {
//    var id = 'id' + n;
//        $('body').append($("<p>Odelay!</p>").attr('id', id));
//    return id;
//})); //=> ["id0", "id1", "id2"]

/**
 * iterateUntil은 어떤 동작을 수행하는 함수와 특정조건이 만족할때까지만 함수 호출을 반복하는 함수이다.
 *
 * @param fun
 * @param checkPred
 * @param init
 * @returns {Array}
 */
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

//반환되는 함수가 클로저이다
//함수형 스타일에서는 메서드를 호출할 대상을 인자로 받는 형식을 선호한다

/**
 * 첫번째 인자로 받은 객체에 메서드를 호출하는 함수다
 * - 대상객체가 호출하려는 메서드를 제공하지 않으면 undefined를 반환된다
 * todo: arguments에 왜 args = {"0":[1,2,3],"1":0,"2":[[1,2,3]]}가 나오는가?
 * - map 함수의 3인자가 있음, 1.value, 2.index, 3.전체 list
 *
 * @param NAME
 * @param METHOD
 * @returns {Function}
 */
function invoker(NAME, METHOD) {
    return function (target /* args ... */) { //args = {"0":[1,2,3],"1":0,"2":[[1,2,3]]} (map 함수때문에 이렇게 나옴)
        if (!existy(target)) fail("Must provide a target");

        var targetMethod = target[NAME];
        var args = _.rest(arguments);
        console.log("   > arguments:", JSON.stringify(arguments)); //=> [0,[[1,2,3]]]
        console.log("   > args:", JSON.stringify(args)); //=> [0,[[1,2,3]]]

        return doWhen((existy(targetMethod) && METHOD === targetMethod), function () {
            return targetMethod.apply(target, args);
        });
    };
}

var rev = invoker('reverse', Array.prototype.reverse);
console.log("invoker:", rev);
//console.info("rev:", JSON.stringify(_.map([[1, 2, 3]], rev))); //=> [[3,2,1]]
console.info("rev:", JSON.stringify(_.map([1, 2, 3], rev))); //=> [[3,2,1]]

function argsTest1(target) {
    console.log("  > arguments", JSON.stringify(arguments));
}
console.info("argsTest1:", argsTest1([1, 2, 3], [3, 4, 5])); //=> {"0":[1,2,3],"1":[3,4,5]}

//4.2.1 고차원 함수로 인자 갭처하기
var add100 = makeAdder(100); //고차원 함수를 구현하려면 다른 함수를 반환하는 함수가 필요함
console.info("add100:", add100(38));

//4.2.2 변수를 갭쳐하는 이유
function uniqueString(len) {
    return Math.random().toString(36).substr(2, len);
};

console.info("uniqueString(len):", uniqueString(10)); //=> "3rm6ww5w0x"

function uniqueString(prefix) {
    return [prefix, new Date().getTime()].join('');
};

console.info("uniqueString(prefix):", uniqueString("argento")); //=> "argento1356107740868"

function makeUniqueStringFunction(start) {
    var COUNTER = start;
    return function (prefix) {
        return [prefix, COUNTER++].join('');
    }
};

var uniqueString = makeUniqueStringFunction(0);
console.info("uniqueString:", uniqueString("ghost")); //=> "ghost0"
console.info("uniqueString:", uniqueString("dari")); //=> "dari1"

var generator = {
    count: 0,
    uniqueString: function (prefix) {
        return [prefix, this.count++].join('');
    }
};
console.info("generator:", generator.uniqueString("bohr")); //=> bohr0
console.info("generator:", generator.uniqueString("bohr")); //=> bohr1

//위 코드는 함수형이 아니라는 점외에도 안전하지 않다는 것이 단점이다
//- count를 재할당
generator.count = "gotchar";
console.info(generator.uniqueString("bohr")); //=> bohrNaN


//- 동적으로 바인딩됨
console.info("generator.uniqueString.call:", generator.uniqueString.call({count: 1337}, "bohr")); //=>bohr1337

//counter를 숨기는 방법: IIE로 숨김
var omgenerator = (function (init) {
    var COUNTER = init;

    return {
        uniqueString: function (prefix) {
            return [prefix, COUNTER++].join('');
        }
    };
})(0);

console.info("omgenerator:", omgenerator.uniqueString("lichking-")); //=> "lichking-0"
console.info("omgenerator:", omgenerator.uniqueString("lichking-")); //=> "lichking-1"

//4.2.3 값이 존재하지 않는 상황을 지켜주는 함수: fnull
var nums = [1, 2, 3, null, 5];

console.info("_.reduce:", _.reduce(nums, function (total, n) {
    console.log("   > total:", total, " n:", n);
    return total * n
})); //=> 0
console.log("3 * null =>", 3 * null); //test

function fnull(fun /*, defaults */) {
    var DEFAULTS = _.rest(arguments);
    console.log("   fnull > arguments:", arguments);
    //console.log("   > defaults:", DEFAULTS);

    return function (/* args */) { //safeMulti에서 넘겨온 arguments를 나타낸다.
        console.log("      | fnull.func arguments:", arguments); //=> [1, 2, 1, Array[5]] [init, curr, key, context]
        var args = _.map(arguments, function (e, i) {
            console.log("      | fnull.func prev:", e, " curr:", i, " defaults:", DEFAULTS[i]);
            return existy(e) ? e : DEFAULTS[i];
        }); //args를 새롭게 채워서 함수를 실행하도록 함

        console.log("      | fnull.func = args:", args);
        return fun.apply(null, args);
    };
};

var safeMult = fnull(function (total, n) {
    console.log("   => total:", total, " n:", n);
    return total * n
}, 1, 1);

console.info("safeMult:", _.reduce(nums, safeMult)); //=> 30


function defaults(D) {
    console.log("   > D:", D);

    return function (o, k) {
        var val = fnull(_.identity, D[k]); //todo: 이해가 안됨. args에 이미 108로 채워 넣은 함수가 됨.
        console.log("  > o:", o, " k:", k, " val:", val(o[k]));
        return o && val(o[k]); //todo: 이 부분 정확하게 이해가 안 {} && 108 왜 이렇게 하나?
    };
}

function doSomething(config) {
    var lookup = defaults({critical: 108}); //함수

    return lookup(config, 'critical');
}
console.info("doSomething:", doSomething({critical: 9})); //=> 9
console.info("doSomething:", doSomething({})); //=> 108

//4.3 객체 검증자
/**
 * 함수에 args(obj)를 호출해서 false이면 err message를 array에 담는다.
 *
 * @returns {Function}
 */
function checker(/* validators */) {
    var validators = _.toArray(arguments);
    //console.log("   checker > validators:", validators);

    return function (obj) {
        return _.reduce(validators, function (errs, check) {
            //console.log("   checker > errs:", errs, "check:", check);

            if (check(obj)) //함수를 콜
                return errs;
            else
                return _.chain(errs).push(check.message).value();
        }, []);
    };
}

var alwaysPasses = checker(always(true), always(true));
console.info("alwaysPasses:", alwaysPasses({})); //=>  []

var fails = always(false);
fails.message = "a failure in life";
var alwaysFails = checker(fails);

console.info("alwaysFails:", alwaysFails({})); //=>["a failure in life"]

/**
 * 검증 찬반형을 인자로 받아서 에러가 발생한 항목 정보를 포함하는 배열을 반환한다
 * - 오류 메시지를 추가하는 부분을 함수로 추상화 시킴
 *
 * @param message
 * @param fun
 * @returns {Function}
 */
function validator(message, fun) {
    var f = function (/* args */) {
        return fun.apply(fun, arguments);
    };

    f['message'] = message;
    return f;
}

var gonnaFail = checker(validator("ZOMG!", always(false)));
console.info("gonnaFail:", gonnaFail(100)); //=> ["ZOMG!"]


/* aMap: {} 객체 인지 판단해줌. */
function aMap(obj) {
    return _.isObject(obj);
}

var checkCommand = checker(validator("must be a map", aMap));
console.info("checkCommand:", checkCommand({})); //=> []
console.info("checkCommand:", checkCommand(42)); //=> ['must be a map']

/**
 * key가 객체 있는지 확인하는 함수를 반환하고 없으면 오류 메시지를 추가한다.
 *
 * @returns {Function}
 */
function hasKeys() {
    var KEYS = _.toArray(arguments); //['msg', 'type']
    console.log("   hasKeys > KEYS:", KEYS);

    var fun = function (obj) {
        return _.every(KEYS, function (k) {
            return _.has(obj, k);
        });
    };

    fun.message = cat(["Must have values for keys:"], KEYS).join(" ");
    return fun;
}

var checkCommandWithHasKeys = checker(validator("must be a map", aMap), hasKeys('msg', 'type'));
console.info("checkCommandWithHasKeys:", checkCommandWithHasKeys({msg: "balh", type: "display"})); //=> []
console.info("checkCommandWithHasKeys:", checkCommandWithHasKeys(1)); //=> ["must be a map", "Must have values for keys: msg type"]
console.info("checkCommandWithHasKeys:", checkCommandWithHasKeys({})); //=> ["Must have values for keys: msg type"]
