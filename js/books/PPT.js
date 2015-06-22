var fortytwo = function () { return 42 };

fortytwo = [42, function () { return 42 }];

fortytwo = { number: 42, fun: function () { return 42 }};

function weirdAdd(n, f) { return n + f()}
weirdAdd(42, function () { return 42 });
//=> 84

function returnFortyTwo() {
    return function () { return 42 };
}
returnFortyTwo()();
//=> 42

//var numbers = [1, 2, 3, 4, 5];
//var total = 0;
//
//for (var i = 0; i < numbers.length; i++) {
//    total += numbers[i];
//}
//console.log(total); //=> 15

//var numbers = [1, 2, 3, 4, 5];
//
//var total = _.reduce(numbers, function (accum, n) {
//    return accum + n;
//});
//console.log(total); //=> 15

//var numbers = [1,2,3,4,5];
//
//var doubled = numbers.map(function(n) {
//    return n * 2;
//})
//console.log(doubled); //=> [2,4,6,8,10]

//var result = _.map([1, 2, 3], function (num) {
//    return num * 3;
//});
//console.info(result); //=> [3, 6, 9]
//var result = _.chain([1, 2, 3, 200])
//    .filter(function (num) {
//        return num % 2 == 0;
//    })
//    .map(function (num) {
//        return num * num
//    })
//    .value();
//
//console.info(result); //=> [4, 40000]

//var stooges = [{name: 'curly', age: 25}, {name: 'moe', age: 21}, {name: 'larry', age: 23}];
//var youngest = _.chain(stooges)
//    .sortBy(function (stooge) {
//        return stooge.age;
//    })
//    //=>  [{name: 'moe', age: 21}, {name: 'larry', age: 23}, {name: 'curly', age: 25}]
//    .map(function (stooge) {
//        return stooge.name + ' is ' + stooge.age;
//    })
//    //=>  ['moe is 21', 'larry is 23', 'curly is 25']
//    .first()
//    //=> "moe is 21"
//    .value();
////=> wrapped object 객체에서 value을 추출함
//
//console.info(youngest); //=> "moe is 21"

///* 함수를 times만큼 실행한 각 결과는 array에 담아서 반환한다. */
//function repeatedly(times, fun) {
//    return _.map(_.range(times), fun);
//}
//
//var result1 = repeatedly(3, function () {
//    return Math.floor((Math.random() * 10) + 1);
//});
//console.info(result1); //=> [1, 3, 8]
//
//var result2 = repeatedly(3, function () {
//    return "Hello";
//});
//console.info(result2); //=> ["Hello", "Hello", "Hello"]

///* iterateUntil은 어떤 동작을 수행하는 함수와 특정조건이 만족할때까지만 함수 호출을 반복하는 함수이다. */
//function iterateUntil(fun, checkPred, init) {
//    var ret = [];
//    var result = fun(init); //함수 호출 결과를 다음번 함수 호출의 인자로 전달한다.
//
//    while (checkPred(result)) {
//        ret.push(result);
//        result = fun(result);
//    }
//
//    return ret;
//}
//
//var result = iterateUntil(function (n) { return n + n },      //연산하는 함수
//                          function (n) { return n <= 1024; }, //조건 함수
//                          1);
//console.info(result); //=> [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]

/* 함수에 args(obj)를 호출해서 false이면 err message를 array에 담는다. */
function checker(/* validators */) {
    var validators = _.toArray(arguments); //[함수1, 함수2, etc]

    return function (obj) {
        return _.reduce(validators, function (errs, check) {
            console.log("   checker > errs:", errs, "check:", check);

            if (check(obj)) //실제 함수를 실행함
                return errs;
            else
                return _.chain(errs).push(check.message).value();
        }, []); //메시지를 array에 담는다.
    };
}

/**
 * 검증 찬반형을 인자로 받아서 에러가 발생한 항목 정보를 포함하는 배열을 반환한다
 * - 오류 메시지를 추가하는 부분을 함수로 추상화 시킴
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


/*aMap: {} 객체 인지 판단 */
function aMap(obj) {
    return _.isObject(obj);
}

var checkCommand = checker(validator("must be a map", aMap));
console.info(checkCommand({})); //=> []
console.info(checkCommand({message: "hi"})); //=> []
console.info(checkCommand(42)); //=> ['must be a map']