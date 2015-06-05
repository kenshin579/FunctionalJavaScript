console.log("");
console.warn("Chap5_________________________________________________________________________");

//5.1 함수 조립의 핵심

/**
 * 객체를 포함하는 배열의 요소를 반복하면서 각 객체에 메서드를 호출해서 첫번째로
 * 반환되는 실제 값을 찾는 함수를 반환함
 * -모든 함수를 실행한다.
 * @returns {Function}
 */
function dispatch(/* funs */) {
    var funs = _.toArray(arguments);
    var size = funs.length;

    return function (target /*, args */) {
        var ret = undefined;
        var args = _.rest(arguments);

        for (var funIndex = 0; funIndex < size; funIndex++) {
            var fun = funs[funIndex];
            ret = fun.apply(fun, construct(target, args));

            if (existy(ret)) return ret;
        }

        return ret;
    };
}

var str = dispatch(
    invoker('toString', Array.prototype.toString),
    invoker('toString', String.prototype.toString)
);

console.info("str:", str("a")); //=> "a"

//key point: if-then-else 문을 이용하는 함수를 이용하는 대신 Array.prototype.toString
//이라는 상세 구현에 형식 및 존재확인 작업을 위임했다.
console.info("str:", str(_.range(10))); //=> "0,1,2,3,4,5,6,7,8,9"
console.info("str:", str([1, 2, 3])); //=> "1,2,3"
console.info("str:", str({})); //=> undefined

function stringReverse(s) {
    if (!_.isString(s)) return undefined;
    return s.split('').reverse().join("");
}

console.info("stringReverse:", stringReverse("abc")); //=> "cba"
console.info("stringReverse:", stringReverse(1)); //=> undefined

var rev = dispatch(
    invoker('reverse', Array.prototype.reverse),
    stringReverse
);

console.info("rev:", rev([1, 2, 3])); //=> [3, 2, 1]
console.info("rev:", rev("abc")); //=> "cba"

var sillyReverse = dispatch(rev, always(42));

console.info("sillyReverse:", sillyReverse([1, 2, 3])); //=> [3, 2, 1]
console.info("sillyReverse:", sillyReverse("abc")); //=> "cba"
console.info("sillyReverse:", sillyReverse(100000)); //=> 42

function notify(message) {
    //console.warn("notify:", message);
    return "Notify 실행함";
}

function changeView(message) {
    //console.warn("changeView:", message);
    return "changeView 실행함";
}

//아래 switch형식의 함수를 dispatch로 교체할 수 있다.
function performCommandHardcoded(command) {
    var result;

    switch (command.type) {
        case 'notify':
            result = notify(command.message);
            break;
        case 'join':
            result = changeView(command.target);
            break;
        default:
            alert(command.type);
    }
    return result;
}
console.info("performCommandHardcoded:",
    performCommandHardcoded({type: 'notify', message: 'hi'})
);
console.info("performCommandHardcoded:",
    performCommandHardcoded({type: 'join', target: 'waiting-room'})
);
//console.info("performCommandHardcoded:",
//    performCommandHardcoded({type: 'wat'})
//);

/**
 * 반환된 함수는 type 문자열과 obj.type 필드가 일치하면 action함수를 호출하고
 * 일치하지 않으면 undefined를 반환한다.
 *
 * @param type
 * @param action
 * @returns {Function}
 */
function isa(type, action) {
    return function (obj) {
        if (type === obj.type)
            return action(obj);
    }
}

var performCommand = dispatch(
    isa('notify', function (obj) {
        return notify(obj.message)
    }),
    isa('join', function (obj) {
        return changeView(obj.target)
    }),
    function (obj) {
        //alert(obj.type)
        console.warn("alert!!!:", obj.type);
    }
);

function shutdown(hostname) {
    //console.warn("shutdown:", hostname);
    return "shutdown 실행함";
}

//확장하는 방식: vs switch 구문
//- dispatch함수로 performCommandHarcoded를 래핑하면 간단하게 새 기능을 추가할 수 있다.
var performAdminCommand = dispatch(
    isa('kill', function (obj) {
        return shutdown(obj.hostname)
    }),
    performCommand
);
console.info("performAdminCommand:",
    performAdminCommand({type: 'kill', hostname: 'localhost'})
);

console.info("performAdminCommand:",
    performAdminCommand({type: 'join', target: 'foo'})
);

console.info("performAdminCommand:",
    performAdminCommand({type: 'flail'})
);

//기존 join 함수를 overwrite할수도 있다.
var performTrialUserCommand = dispatch(
    isa('join', function (obj) {
        //alert("Cannot join until approved:", obj);
        console.warn("Alert!!!. Cannot join until approved:", obj);
    }),
    performCommand
);

console.info("performTrialUserCommand:",
    performTrialUserCommand({type: 'join', target: 'foo'})
);
console.info("performTrialUserCommand:",
    performTrialUserCommand({type: 'notify', message: 'Hi new user'})
);

//5.1.1 변이는 저수준 동작이다.
//5.2 커링: 각각의 논리적 인자에 대응하는 새로운 함수를 반환하는 함수를 커리(혹은 커리된) 함수라고 함
//- 커리 함수는 각각의 논리 파라미터를 이용해서 점차 세부적으로 설정된 함수를 반환한다.
function rightAwayInvoker() {
    var args = _.toArray(arguments);
    console.log("  > args:", args);
    var method = args.shift();
    var target = args.shift();

    return method.apply(target, args);
}
console.info("rightAwayInvoker:",
    rightAwayInvoker(Array.prototype.reverse, [1, 2, 3])
); //=> [3, 2, 1]

//커리 함수, 즉 모든 인자가 제공되기 전까지 target에 method를 호출하지 않는다.
//- 아래 코드에서는 invoker가 반환됨과 동시에 reverse 동작을 수행할 함수가 배열[1,2,3]을 호출한다.
console.info("invoker:",
    invoker('reverse', Array.prototype.reverse)([1, 2, 3])
); //=> [3, 2, 1]

//좌향커리: 가장 오른쪽 인자에서 커리가 시작해서 왼쪽으로 이동하는
//아래 curry함수는 수동 함수임
//- 함수 파라미터 수에 대응하는 수의 함수를 반환하도록 함수를 구현했다.
function leftCurryDiv(n) {
    return function (d) {
        return n / d;
    };
}

function rightCurryDiv(d) {
    return function (n) {
        return n / d;
    };
}
var divide10By = leftCurryDiv(10); //10 / ?
console.info("divide10By:", divide10By(2)); //=> 10 / 2 -> 5

var over10 = rightCurryDiv(10); //? / 10
console.info("divide10By:", over10(2)); //=> 0.2

//5.2.2 자동 커리 파라미터
//
function curry(fun) {
    return function (arg) {
        console.log("   > arg:", arg);
        return fun(arg);
    };
}

console.info("parseInt:", parseInt(['11', '12', '13', '11'])); //=> 11
console.info("parseInt:", parseInt('11')); //=> 11
console.info("parseInt:", parseInt('11', 2)); //=> 3

//todo: 아래 잘 이해 안됨. radix: 0, 1, 2, 3순으로 제공된다. 왜? 모름
console.info("map:", ['11', '11', '11', '11'].map(parseInt)); //=> [11, NaN, 3, 4]
console.info("map:", ['11', '11', '11', '11'].map(curry(parseInt))); //=> [11, 11, 11, 11]
console.info("map:", ['11', '12', '13', '14'].map(curry(parseInt))); //=> [11, 12, 13, 14]


function curry2(fun) {
    return function (secondArg) {
        return function (firstArg) {
            console.log("  > 1st:", firstArg, "2nd:", secondArg);
            return fun(firstArg, secondArg);
        };
    };
}

function div(n, d) {
    return n / d
}

var div10 = curry2(div)(10);

console.info("div10:", div10(50)); //=> 5

var parseBinaryString = curry2(parseInt)(2);

console.info("parseBinaryString:", parseBinaryString("111")); //=> 7
console.info("parseBinaryString:", parseBinaryString("10")); //=> 2

//1.* 커링으로 새로운 함수 만들기
var plays = [{artist: "Burial", track: "Archangel"},
    {artist: "Ben Frost", track: "Stomp"},
    {artist: "Ben Frost", track: "Stomp"},
    {artist: "Burial", track: "Archangel"},
    {artist: "Emeralds", track: "Snores"},
    {artist: "Burial", track: "Archangel"}];

console.info("_.countBy:", _.countBy(plays, function (song) {
    return [song.artist, song.track].join(" - "); //같은 것끼리 묶어서 count를 함
}));
//=> {"Ben Frost - Stomp": 2,
//    "Burial - Archangel": 3,
//    "Emeralds - Snores": 1}

function songToString(song) {
    return [song.artist, song.track].join(" - ");
}

var songCount = curry2(_.countBy)(songToString);
console.info("songCount:", songCount(plays));
//=> {"Ben Frost - Stomp": 2,
//    "Burial - Archangel": 3,
//    "Emeralds - Snores": 1}

function curry3(fun) {
    return function (last) {
        return function (middle) {
            return function (first) {
                return fun(first, middle, last);
            };
        };
    };
};

var songsPlayed = curry3(_.uniq)(false)(songToString);

songsPlayed(plays);

//=> [{artist: "Burial", track: "Archangel"},
//    {artist: "Ben Frost", track: "Stomp"},
//    {artist: "Emeralds", track: "Snores"}]

function toHex(n) {
    var hex = n.toString(16);
    return (hex.length < 2) ? [0, hex].join('') : hex;
}

function rgbToHexString(r, g, b) {
    return ["#", toHex(r), toHex(g), toHex(b)].join('');
}

rgbToHexString(255, 255, 255);
//=> "#ffffff"

var blueGreenish = curry3(rgbToHexString)(255)(200);

blueGreenish(0);
//=> "#00c8ff"
//
//var greaterThan = curry2(function (lhs, rhs) { return lhs > rhs });
//var lessThan    = curry2(function (lhs, rhs) { return lhs < rhs });
//
//var withinRange = checker(
//    validator("arg must be greater than 10", greaterThan(10)),
//    validator("arg must be less than 20", lessThan(20)));
//
//function divPart(n) {
//    return function(d) {
//        return n / d;
//    };
//}
//
//var over10Part = divPart(10);
//over10Part(2);
////=> 5
//
//function partial1(fun, arg1) {
//    return function(/* args */) {
//        var args = construct(arg1, arguments);
//        return fun.apply(fun, args);
//    };
//}
//
//function partial2(fun, arg1, arg2) {
//    return function(/* args */) {
//        var args = cat([arg1, arg2], arguments);
//        return fun.apply(fun, args);
//    };
//}
//
//var div10By2 = partial2(div, 10, 2)
//
//div10By2()
////=> 5
//
//function partial(fun /*, pargs */) {
//    var pargs = _.rest(arguments);
//
//    return function(/* arguments */) {
//        var args = cat(pargs, _.toArray(arguments));
//        return fun.apply(fun, args);
//    };
//}
//
//var zero = validator("cannot be zero", function(n) { return 0 === n
//});
//var number = validator("arg must be a number", _.isNumber);
//
//function sqr(n) {
//    if (!number(n)) throw new Error(number.message);
//    if (zero(n))    throw new Error(zero.message);
//
//    return n * n;
//}
//
//function condition1(/* validators */) {
//    var validators = _.toArray(arguments);
//
//    return function(fun, arg) {
//        var errors = mapcat(function(isValid) {
//            return isValid(arg) ? [] : [isValid.message];
//        }, validators);
//
//        if (!_.isEmpty(errors))
//            throw new Error(errors.join(", "));
//
//        return fun(arg);
//    };
//}
//
//var sqrPre = condition1(
//    validator("arg must not be zero", complement(zero)),
//    validator("arg must be a number", _.isNumber));
//
//function uncheckedSqr(n) { return n * n };
//
//uncheckedSqr('');
////=> 0
//
//var checkedSqr = partial1(sqrPre, uncheckedSqr);
//
//var sillySquare = partial1(
//    condition1(validator("should be even", isEven)),
//    checkedSqr);
//
//var validateCommand = condition1(
//    validator("arg must be a map", _.isObject),
//    validator("arg must have the correct keys", hasKeys('msg',
//        'type')));
//
//var createCommand = partial(validateCommand, _.identity);
//
//var createLaunchCommand = partial1(
//    condition1(
//        validator("arg must have the count down", hasKeys('countDown'))),
//    createCommand);
//
//var isntString = _.compose(function(x) { return !x }, _.isString);
//
//isntString([]);
////=> true
//
//function not(x) { return !x }
//
//var composedMapcat = _.compose(splat(cat), _.map);
//
//composedMapcat([[1,2],[3,4],[5]], _.identity);
////=> [1, 2, 3, 4, 5]
//
//var sqrPost = condition1(
//    validator("result should be a number", _.isNumber),
//    validator("result should not be zero", complement(zero)),
//    validator("result should be positive", greaterThan(0)));
//
//var megaCheckedSqr = _.compose(partial(sqrPost, _.identity),
//    checkedSqr);
