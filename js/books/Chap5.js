console.log("");
console.warn("Chap5_________________________________________________________________________");

//5.1 함수 조립의 핵심

/**
 * 객체를 포함하는 배열의 요소를 반복하면서 각 객체에 메서드를 호출해서 첫번째로
 * 반환되는 실제 값을 찾는 함수를 반환함
 * - 모든 함수를 실행한다.
 *
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

/*
 - key point: if-then-else 문을 이용하는 함수를 이용하는 대신 Array.prototype.toString
 - 이라는 상세 구현에 형식 및 존재확인 작업을 위임했다.
 */
var str = dispatch(
    invoker('toString', Array.prototype.toString),
    invoker('toString', String.prototype.toString)
);

console.info("str:", str("a")); //=> "a"

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
    return "Notify 실행함";
}
function changeView(message) {
    return "changeView 실행함";
}

/*
 아래 switch형식의 함수를 dispatch로 교체할 수 있다.
 */
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
); //=> performCommandHardcoded: Notify 실행함
console.info("performCommandHardcoded:",
    performCommandHardcoded({type: 'join', target: 'waiting-room'})
); //=> performCommandHardcoded: changeView 실행함

//console.info("performCommandHardcoded:",
//    performCommandHardcoded({type: 'wat'})
//);

/*
 반환된 함수는 type 문자열과 obj.type 필드가 일치하면 action함수를 호출하고
 일치하지 않으면 undefined를 반환한다.
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
    return hostname + ": shutdown 실행함";
}

/*
 확장하는 방식: vs switch 구문
 - dispatch함수로 performCommand를 래핑하면 간단하게 새 기능을 추가할 수 있다.
 */
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
/*
 5.2 커링: 각각의 논리적 인자에 대응하는 새로운 함수를 반환하는 함수를 커리(혹은 커리된) 함수라고 함
 - 커리 함수는 각각의 논리 파라미터를 이용해서 점차 세부적으로 설정된 함수를 반환한다.
 todo: 왜 이게 필요한지 그리고 어느곳에서 쓰면 유용한지 잘 모르겠음
 */
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
function leftCurryDiv(n) { //(10*)(2)
    return function (d) { //(10)(2*)
        return n / d;
    };
}
var divide10By = leftCurryDiv(10); //10 / ?
console.info("divide10By:", divide10By(2)); //=> 10 / 2 -> 5
console.info("divide10By:", leftCurryDiv(10)(2)); //=> 10 / 2 -> 5


function rightCurryDiv(d) {
    return function (n) {
        return n / d;
    };
}
var over10 = rightCurryDiv(10); //? / 10
console.info("divide10By:", over10(2)); //=> 0.2
console.info("divide10By:", rightCurryDiv(10)(2)); //=> 0.2

/*
 5.2.2 자동 커리 파라미터
 */
function curry(fun) {
    return function (arg) {
        return fun(arg);
    };
}

console.info("parseInt:", parseInt(['11', '12', '13', '11'])); //=> 11
console.info("parseInt:", parseInt('11')); //=> 11
console.info("parseInt:", parseInt('11', 2)); //=> 3

/*
 todo: 아래 잘 이해 안됨. radix: 0, 1, 2, 3순으로 제공된다. 왜? 잘 모르겠음.
 - 이해되는 것 같음.
 */
console.info("map:", ['11', '11', '11', '11'].map(parseInt)); //=> [11, NaN, 3, 4]
console.info("map:", ['11', '11', '11', '11'].map(curry(parseInt))); //=> [11, 11, 11, 11]
console.info("map:", ['11', '12', '13', '14'].map(curry(parseInt))); //=> [11, 12, 13, 14]

//underscore 버전
console.info("_.map:", _.map(['11', '11', '11', '11'], parseInt)); //=> [11, NaN, 3, 4] <- todo: 왜 이렇게 넘겨주게 되나?
console.info("_.map:", _.map(['11', '11', '11', '11'], function (each, index) {
    //> each: 11 index: 0 parseInt: 11
    //> each: 11 index: 1 parseInt: NaN
    //> each: 11 index: 2 parseInt: 3
    //> each: 11 index: 3 parseInt: 4
    console.log("  > each:", each, "index:", index, "parseInt:", parseInt(each, index));
    return parseInt(each, index);
    //return parseInt(each);
})); //=> [11, NaN, 3, 4]

console.info("_.map:", _.map(['11', '11', '11', '11'], curry(parseInt))); //=> [11, 11, 11, 11]

function curry2(fun) { //(div*)(10)(50)
    return function (secondArg) { //(div)(10*)(50)
        return function (firstArg) { //(div)(10)(50*)
            return fun(firstArg, secondArg);
        };
    };
}

function div(n, d) { //50 / 10
    return n / d
}

var div10 = curry2(div)(10);

console.info("div10:", div10(50)); //=> 5

//fun  //secondArg
var parseBinaryString = curry2(parseInt)(2);
//firstArg
console.info("parseBinaryString:", parseBinaryString("111")); //=> 7
console.info("parseBinaryString:", parseBinaryString("10")); //=> 2

//1.* 커링으로 새로운 함수 만들기
var plays = [{artist: "Burial", track: "Archangel"},
    {artist: "Ben Frost", track: "Stomp"},
    {artist: "Ben Frost", track: "Stomp"},
    {artist: "Burial", track: "Archangel"},
    {artist: "Emeralds", track: "Snores"},
    {artist: "Burial", track: "Archangel"}];

console.info("_.countBy:", JSON.stringify(_.countBy(plays, function (song) {
    return [song.artist, song.track].join(" - "); //같은 것끼리 묶어서 count를 함
})));
//=> {"Ben Frost - Stomp": 2,
//    "Burial - Archangel": 3,
//    "Emeralds - Snores": 1}

function songToString(song) {
    return [song.artist, song.track].join(" - ");
}

/* countBy와 songToString 함수를 조립해서 만듬 */
var songCount = curry2(_.countBy)(songToString);
console.info("songCount:", JSON.stringify(songCount(plays)));
//=> {"Ben Frost - Stomp": 2,
//    "Burial - Archangel": 3,
//    "Emeralds - Snores": 1}

//세개의 파라미터를 커링해서 HTML 16진 색상 생성기 구현하기
function curry3(fun) {
    return function (last) {
        return function (middle) {
            return function (first) {
                return fun(first, middle, last);
            };
        };
    };
};
//func  //middle  //last
var songsPlayed = curry3(_.uniq)(false)(songToString);
//first
console.info("songsPlayed:", JSON.stringify(songsPlayed(plays)));
console.info("songsPlayed:", JSON.stringify(curry3(_.uniq)(false)(songToString)(plays)));
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

console.info("rgbToHexString:", rgbToHexString(255, 255, 255));
//=> "#ffffff"

var blueGreenish = curry3(rgbToHexString)(255)(200);
console.info("blueGreenish:", blueGreenish(0)); //=> "#00c8ff"

var greaterThan = curry2(function (lhs, rhs) {
    console.log("   greaterThan > lhs: ", lhs, "rhs:", rhs); //lhs:15 > rhs:10
    return lhs > rhs
});
var lessThan = curry2(function (lhs, rhs) {
    console.log("   lessThan > lhs: ", lhs, "rhs:", rhs); //lhs:15 > rhs:20
    return lhs < rhs
});

//어떤 수보다 큰지, 어떤 수보다 작은지를 계산하는 임의의 버전을 직접 사용하는 것보다 커리된 함수를 이용하는 것이 휠씬 가독성이 좋다.
var withinRange = checker(
    validator("arg must be greater than 10", greaterThan(10)),
    validator("arg must be less than 20", lessThan(20))
);
console.info("withinRange:", withinRange(15));  //=> []
console.info("withinRange:", withinRange(1));   //=> ["arg must be greater than 10"]
console.info("withinRange:", withinRange(100)); //=> ["arg must be less than 20"]

//5.3 부분 적용
//부분 함수는 '부분적으로' 실행을 마친 다음에 나머지 인자와 함께 즉시 실행한 상태가 되는 함수
//- 실행되기까지 한개의 인자만 남겨 둔 상태의 커리 함수는 사실상 한개의 인자만 남겨 둔 부분 적용함수와 같다.
function divPart(n) { //leftCurryDiv 커리함수와 같음.
    return function (d) {
        return n / d;
    };
}

var over10Part = divPart(10);
console.info("over10Part:", over10Part(2)); //=> 5

//5.3.1 한 두개의 알려진 인자를 부분 적용
/**
 * 기존 호출로부터 arg1 인자를 캡처한 다음에 실행 호출의 인자 목록 앞부분에 추가한다.
 * - 캡처된 함수/변수의 참조값을 가지고 있게 된다.
 *
 * @param fun
 * @param arg1
 * @returns {Function}
 */
function partial1(fun, arg1) {
    return function (/* args */) {
        //console.log("   partial1 > arg1:", arg1, "arguments:", JSON.stringify(arguments));
        var args = construct(arg1, arguments); //args1과 나머지 arguments를 합친다.
        return fun.apply(fun, args);
    };
}
var div10By1 = partial1(div, 10);
console.info("div10By1:", div10By1(5)); //=> 2
console.info("partial1(div, 10)(5):", partial1(div, 10)(5)); //=> 2

function partial1Bind(fun, arg1) {
    return function (/* args */) {
        var args = construct(arg1, arguments); //args1과 나머지 arguments를 합친다.
        return fun.bind(undefined, args); //todo: 제대로 동작을 하지 않는 듯하다.
    };
}

//var div10By1Bind = partial1Bind(div, 10);
//console.info("div10By1Bind:", div10By1Bind(5)); //=> 2
//console.info("partial1(div, 10)(5):", partial1Bind(div, 10)(5)); //=> 2
//
function partial2(fun, arg1, arg2) {
    return function (/* args */) {
        var args = cat([arg1, arg2], arguments);
        return fun.apply(fun, args);
    };
}
var div10By2 = partial2(div, 10, 2);
console.info("div10By2:", div10By2()); //=> 5


//5.3.2 임의의 수의 인자를 부분 적용
/**
 * 임의의 수의 인자를 받아서 부분 적용할 수 있다.
 * - 한번에 인자를 합쳐서 호출 가능하다.
 * - 몇개의 인자를 받아 가장 왼쪽 인자를 이용해서 함수를 반환하는 partial를 살펴봄
 *
 * @param fun
 * @returns {Function}
 */
function partial(fun /* pargs */) { //(div, 10)(2)
    var pargs = _.rest(arguments); //=> [10]

    return function (/* arguments */) {
        var args = cat(pargs, _.toArray(arguments)); //[10, 2]
        return fun.apply(fun, args);
    };
}
var over10Partial = partial(div, 10);
console.info("over10Partial:", over10Partial(2)); //=> 5

//단점: partial은 임의의 수의 인자를 받을 수 있지만, 때로는 혼란스러울 수 있다.
var div10By2By4By5000Partial = partial(div, 10, 2, 4, 5000);
console.info("div10By2By4By5000Partial:", div10By2By4By5000Partial()); //=> 5

/*
 5.3.3. 부분 적용 사례: 선행조건
 */
console.info("validator:", validator("arg must be a map", aMap)(42)); //=> false

var zero = validator("cannot be zero", function (n) {
    return 0 === n
});
var number = validator("arg must be a number", _.isNumber);
console.info("zero:", zero(2)); //=> false
console.info("number:", number(3)); //=> true
console.info("number:", checker(number)(3)); //=> []
console.info("number:", checker(number)('a')); //=> ["arg must be a number"]

//단점: 기본적인 데이터 검증은 수행할 수 있지만, 위 코드로 검출할 수 없는 종류의 에러도 있다.
//- 바로 계산 보장과 관련된 종류의 에러가 그 중 하나다.
function sqr(n) {
    if (!number(n)) throw new Error(number.message);
    if (zero(n))    throw new Error(zero.message);

    return n * n;
}

console.info("sqr:", sqr(10)); //=> 100
//console.info("sqr:", sqr(0));  //=> Error: cannot be zero
//console.info("sqr:", sqr('')); //=> Error: arg must be a number

//두 종류로 계산 보장을 구분할 수 있다.
//1.선행조건(preconditions): 호출하는 함수에서 보장하는 조건
//2.후행조건(postconditions): 선행조건이 지켜졌다는 가정 하에 함수를 호출결과를 보장하는 조건

/**
 * arg로 함수를 실행을 해서 오류가 있으면 errors array에 메시지를 담고 오류가 없을 경우에는 실행해서 결과값을 반환한다.
 * - 핵심적인 계산 로직과는 독립적으로 선행조건을 추가하도록 부분 적용을 이용했다. (partial 함수와 비슷함)
 * - 상당한 플루언트 검증 API이다.
 *
 * @returns {Function}
 */
function condition1(/* validators */) {
    var validators = _.toArray(arguments); //함수

    return function (fun, arg) {
        console.log("   condition1 arg > ", JSON.stringify(arg)); //=> 10

        var errors = mapxcat(function (isValid) {
            return isValid(arg) ? [] : [isValid.message];
        }, validators);

        if (!_.isEmpty(errors))
            throw new Error(errors.join(", "));

        return fun(arg);
    };
}

var sqrPre = condition1(
    validator("arg must not be zero", complement(zero)),
    validator("arg must be a number", _.isNumber)
    //key point: 새로운 precondition 조건을 쉽게 추가할 수 있다는 장점이 있다.
);

console.info("sqrPre:", sqrPre(_.identity, 10)); //=> 10
//console.info("sqrPre:", sqrPre(_.identity, '')); //=> Error: arg must be a number
//console.info("sqrPre:", sqrPre(_.identity, 0)); //=> Error: arg must be a zero

//문제인 함수
function uncheckedSqr(n) {
    return n * n
}

//빈 문자열의 제곱이 0일수는 없다. 오류!!!
console.info("uncheckedSqr:", uncheckedSqr('')); //=> 0

//해결방법:
//key point: 함수를 만드는 함수를 통해서 새로운 함수로 해결을 했다.
//- 핵심 계산 과정과 검증 단계가 분리되었음.
var checkedSqr = partial1(sqrPre, uncheckedSqr);
console.info("checkedSqr:", checkedSqr(10)); //=> 100
//console.info("checkedSqr:", checkedSqr('')); //=> Error: arg must be a number
//console.info("checkedSqr:", checkedSqr(0)); //=> Error: arg must not be zero

var sillySquare = partial1(
    condition1(validator("should be even", isEven)),
    checkedSqr
);

console.info("sillySquare:", sillySquare(10)); //=> 100
//console.info("sillySquare:", sillySquare(11)); //=> Error: should be even
//console.info("sillySquare:", sillySquare(''));
//console.info("sillySquare:", sillySquare(0));

//다른 예제.
var validateCommand = condition1(
    validator("arg must be a map", _.isObject),
    validator("arg must have the correct keys", hasKeys('msg', 'type'))
);

//todo: 왜 identity함수를 사용했나? 잘 이해안됨.
//- 책 답변: 자바스크립트에서는 훈련과 심사숙고를 거쳐야 안정성이라는 목표를 달성할 수 있다.
var createCommand = partial(validateCommand, _.identity); //partial함수는 args를 넣어서 실행하는 함수
//var createCommand = partial(validateCommand);

//console.info("createCommand:", createCommand({})); //=> Error: arg must have the correct keys
//console.info("createCommand:", createCommand(21)); //=> Error: arg must be a map, arg must have the correct keys
console.info("createCommand:", createCommand({msg: "", type: ""})); //=> {msg: "", type: ""}

//todo: 이해하기 어려움
var createLaunchCommand = partial1( //todo: partial1이 왜 이게 필요한가?
    condition1(validator("arg must have the count down", hasKeys('countDown'))),
    createCommand); //todo: <== 이건 어떻게 실행이 되는 건가?

//console.info("createLaunchCommand:", createLaunchCommand({msg: "", type:""})); //=> Error: arg must have the count down
console.info("createLaunchCommand:", createLaunchCommand({msg: "", type: "", countDown: 10})); //=> {msg: "", type: "", countDown: 10}

//5.4 함수의 끝을 서로 연결하는 함수 조립 방법 (pipelining)
//_.compose은 오른쪽에서 왼쪽으로 작동한다.
var isntString = _.compose(
    function (x) { //x: true -> false
        console.log("  x:", x);
        return !x
    },
    _.isString //true
);
console.info("isntString:", isntString([])); //=> true

function not(x) {
    return !x
}
var isntString2 = _.compose(not, _.isString);
console.info("isntString2;", isntString2([])); //=> true

var composedMapcat = _.compose(splat(cat), _.map); //todo: splat이 왜 필요한가?

//todo: 왜 identity가 필요한가?
console.info("composedMapcat:", composedMapcat([[1, 2], [3, 4], [5]], _.identity)); //=> [1, 2, 3, 4, 5]

var composedMapcat2 = _.compose(cat, _.map);

console.info("composedMapcat2:", JSON.stringify(composedMapcat2([1, 2], [3, 4], [5]))); //=> [[1,2],[3,4],[5]]
console.info("_.map:", JSON.stringify(_.map([[1, 2], [3, 4], [5]])));
console.info("cat:", JSON.stringify(cat([[1, 2], [3, 4], [5]])));

//5.4.1 조립을 이용해서 선행조건과 후행조건 만들기

var sqrPost = condition1(
    validator("result should be a number", _.isNumber),
    validator("result should not be zero", complement(zero)),
    validator("result should be positive", greaterThan(0)));

//console.info("sqrPost;", sqrPost(_.identity, 0)); //Error: result should not be zero, result should be positive
//console.info("sqrPost;", sqrPost(_.identity, -1));  // Error: result should be positive
//console.info("sqrPost;", sqrPost(_.identity, '')); //Error: result should be a number, result should be positive
console.info("sqrPost;", sqrPost(_.identity, 100)); //=> 100

//질문: 후행검사 check 함수를 어떻게 기존의 uncheckedStr, sqrPre함수에 추가할 수 있는 을까?
//- 답변: _.compose를 사용하면 된다.

//todo: 여기서 identity는 왜 필요한가?
//- 답변: checkedStr의 결과값을 _.identity인자로 넘겨줌)
var megaCheckedSqr = _.compose(
    partial(sqrPost, _.identity), //postcondition
    checkedSqr                    //precondition
);

console.info("megaCheckedSqr:", megaCheckedSqr(10)); //=> 100
//console.info("megaCheckedSqr:", megaCheckedSqr(0)); //=> Error: arg must not be zero
//console.info("megaCheckedSqr:", megaCheckedSqr(NaN)); //Error: result should be positive
