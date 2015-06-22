console.log("");
console.warn("Chap6_________________________________________________________________________");

//6.1 자신을 호출하는 함수
/**
 *
 * 1. 언제 멈출지: _.isEmpty
 * 2. 한 단계 수행: 1 + ...
 * 3. 작은 문제: _.rest
 *
 * @param ary
 * @returns {*}
 */
function myLength(ary) {
    if (_.isEmpty(ary))
        return 0;
    else
        return 1 + myLength(_.rest(ary));
}

console.info("myLength:", myLength(_.range(10))); //=>10
console.info("myLength:", myLength([])); //=> 0
console.info("myLength:", myLength(_.range(1000))); //=> 1000

//재귀 함수에 주어진 인자는 바꾸지 않는 것이 좋다!!!
var a = _.range(10);
console.info("myLength:", myLength(a)); //=> 10
console.info("a:", a); //=> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 *
 * 1. 언제 멈출지: times <= 0
 * 2. 한 단계 수행: cat(ary)...
 * 3. 작은 문제: times - 1
 *
 * @param times
 * @param ary
 * @returns {*}
 */
function cycle(times, ary) {
    if (times <= 0)
        return [];
    else
        return cat(ary, cycle(times - 1, ary));
}
console.info("cycle", cycle(2, [1, 2, 3])); //=> [1, 2, 3, 1, 2, 3]
console.info("cycle", _.first(cycle(5, [1, 2, 3]), 4)); //=> [1, 2, 3, 1]

console.info("_.zip:", JSON.stringify(_.zip(['a', 'b', 'c'], [1, 2, 3]))); //=> [["a",1],["b",2],["c",3]]
/*
 원하는 결과: [['a'], [1]]
 종료사항: [[], []]
 */
var zipped1 = [['a', 1]];

/**
 * 첫번째 list에서 한 꺼내고, 두번째 list에서 한나 꺼내고
 * @param pair
 * @param rests
 * @returns {*[]}
 */
function constructPair(pair, rests) {
    console.log("   constructPair > pair:", JSON.stringify(pair), "rests:", JSON.stringify(rests));
    console.log("first:", _.first(pair), _.first(rests));
    console.log("second:", second(pair), second(rests));
    return [
        construct(_.first(pair), _.first(rests)), //a, [] => [a]
        construct(second(pair), second(rests)) //1, [] => [1]
    ];
}
console.info("constructPair:", JSON.stringify(constructPair(['a', 1], [[], []]))); //=> [["a"],[1]]

constructPair(['a', 1],
    constructPair(['b', 2],
        constructPair(['c', 3], [[], []])));
//=> [['a','b','c'],[1,2,3]]

/**
 *
 * 1. 언제 멈출지: _.isEmpty
 * 2. 한 단계 수행: constructPair(_.first...
 * 3. 작은 문제: _.rest
 *
 * @param pairs
 * @returns {*[]}
 */
function unzip(pairs) {
    if (_.isEmpty(pairs)) return [[], []];
    return constructPair(_.first(pairs), unzip(_.rest(pairs)));
}

console.info("unzip:", JSON.stringify(unzip([]))); //=> [[],[]]
console.info("unzip:", JSON.stringify(unzip(zipped1)));

//6.1.1 재귀를 이용한 그래프 탐색

var influences = [
    ['Lisp', 'Smalltalk'],
    ['Lisp', 'Scheme'],
    ['Smalltalk', 'Self'],
    ['Scheme', 'JavaScript'],
    ['Scheme', 'Lua'],
    ['Self', 'Lua'],
    ['Self', 'JavaScript']];

/**
 * 특정 프로그래밍 언어에 영향을 받은 프로그래밍 언어 배열을 반환한다.
 *
 * 1. 언제 멈출지: _.isEmpty
 * 2. 한 단계 수행: construct(...
 * 3. 작은 문제: _.rest
 *
 * @param graph
 * @param node
 * @returns {*}
 */
function nexts(graph, node) {
    if (_.isEmpty(graph)) return [];

    var pair = _.first(graph);
    var from = _.first(pair);
    var to = second(pair);
    var more = _.rest(graph);

    if (_.isEqual(node, from)) {
        console.log("  construct(", JSON.stringify(to), "nexts(", JSON.stringify(more), ",", JSON.stringify(node), ")):",
            construct(to, nexts(more, node))); //"Smalltalk", [] => ["Smalltalk"]
        return construct(to, nexts(more, node));
    } else {
        return nexts(more, node);
    }
}
console.info("nexts:", nexts(influences, 'Lisp')); //=> ["Smalltalk", "Scheme"]

/*
 꼬리 재귀(tail-recursive):
 - 특정 함수가 간접적으로 자신을 꼬리 호출함으로써, 재귀를 하면서도 스팩프레임을 재사용할 때를 부르는 말이다.
 - 한 단계 수행 & 작은 문제 항목 중 하나 이상이 재귀면 꼬리 재귀임! (depthSearch 참조)
 ㅁ. 즉 함수에서 발생한 마지막 동작(종료 요소를 반환하는 상황은 제외)이 재귀 호출이다.
 ㅁ. 마지막 호출이 재귀호출이고 함수의 바디는 다시 사용하지 않는다. (마지막 실행이 recursive 콜이다)

 - 장점?
 - 단점?
 - 참고: http://c2.com/cgi/wiki?TailRecursion
 - http://www.geeksforgeeks.org/tail-recursion/
 */

/**
 * 단지 뭔가를 깊이 우선 순서로 실행할 수 있도록 노드 배열을 만들어 준다.
 *
 * 1. 언제 멈출지: _.isEmpty
 * 2. 한 단계 수행: depthSearch(more...
 * 3. 작은 문제: depthSearch(cat
 *
 * @param graph
 * @param nodes
 * @param seen 기존 노드와 그 자식을 다시 탐색하지 않도록 이전에 탐색한 노드를 누적(accumulation)하는 역할을 함
 * @returns {*}
 */
function depthSearch(graph, nodes, seen) {
    console.log("  depthSearch > nodes:", nodes, "seen:", seen);
    if (_.isEmpty(nodes)) return rev(seen);

    var node = _.first(nodes);
    var more = _.rest(nodes);

    if (_.contains(seen, node)) {
        console.log("    depthSearch.if > seen:", seen, "node:", node);
        return depthSearch(graph, more, seen);
    } else {
        console.log("    depthSearch.else > node:", node, "more:", more, "seen:", seen);
        return depthSearch(graph,
            cat(nexts(graph, node), more),
            construct(node, seen));
    }
}
console.info("depthSearch:", depthSearch(influences, ['Lisp'], []));
//=>  ["Lisp", "Smalltalk", "Self", "Lua", "JavaScript", "Scheme"]

console.info("depthSearch:", depthSearch(influences, ['Smalltalk', 'Self'], []));
//=> ["Smalltalk", "Self", "Lua", "JavaScript"]

console.info("depthSearch:", depthSearch(construct(['Lua', 'Io'], influences), ['Lisp'], []));
//=> ["Lisp", "Smalltalk", "Self", "Lua", "Io", "JavaScript", "Scheme"]

/**
 * todo: 실제 실행 결과가 이해가 안됨.
 *
 * 1. 언제 멈출지: _.isEmpty
 * 2. 한 단계 수행: l + 1 ?
 * 3. 작은 문제: _.rest
 *
 * @param ary
 * @param n
 * @returns {*}
 */
function tcLength(ary, n) {
    var l = n ? n : 0;
    console.log("   tcLength l>", l);

    if (_.isEmpty(ary)) {
        console.log("   tcLength.if > l:", l);
        return l; //마지막 결과가 됨
    } else {
        //console.log("   tcLength.else(", _.rest(ary), ",", l + 1, "):", tcLength(_.rest(ary), l + 1));
        return tcLength(_.rest(ary), l + 1);
    }
}

console.info("tcLength:", tcLength(_.range(1))); //=> 10

function factorial(n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

console.info("factorial:", factorial(3)); //=> 6

function factorial1(n, accumulator) {
    if (n == 0) return accumulator;
    return factorial1(n - 1, n * accumulator);
}

function tailFactorial(n) {
    return factorial1(n, 1);
}

console.info("tailFactorial:", tailFactorial(3));

//6.1.3 재귀 함수와 합성 함수: Conjoin, Disjoin

/**
 * 설정된 여러 함수를 args의 인자로 실행해서 true이면 나머지 함수에 대해서 실행하도록 하는 함수임
 *
 * @returns {Function}
 */
function andify(/* preds */) {
    var preds = _.toArray(arguments);

    return function (/* args */) {
        var args = _.toArray(arguments);

        var everything = function (ps, truth) {
            console.log("  everything: ps>", ps, "truth", truth);
            if (_.isEmpty(ps)) {
                return truth;
            } else {
                console.log("  everything.else > ", "_.every(", args, ",", _.first(ps), ":", _.every(args, _.first(ps)));
                return _.every(args, _.first(ps)) && everything(_.rest(ps), truth);
            }
        };

        return everything(preds, true);
    };
}

var evenNums = andify(_.isNumber, isEven);
console.info("evenNums:", evenNums(1, 2)); //=> false
console.info("evenNums:", evenNums(2, 4)); //=> true
console.info("evenNums:", evenNums(2, 4, 6, 8, 9)); //=> false

/**
 *
 * @returns {Function}
 */
function orify(/* preds */) {
    var preds = _.toArray(arguments);

    return function (/* args */) {
        var args = _.toArray(arguments);

        var something = function (ps, truth) {
            if (_.isEmpty(ps))
                return truth; //함수 list에 empty이면 initValue을 반환한다.
            else
                return _.some(args, _.first(ps)) || something(_.rest(ps), truth);
        };

        return something(preds, false);
    };
}

var zeroOrOdd = orify(isOdd, zero);
console.info("zeroOrOdd:", zeroOrOdd()); //=> false
console.info("zeroOrOdd:", zeroOrOdd(0, 2, 4, 6)); //=> true
console.info("zeroOrOdd:", zeroOrOdd(2, 4, 6)); //=> false

//6.2 상호재귀 함수(서로를 호출하는 함수 : mutual recursion)
function evenSteven(n) {
    if (n === 0)
        return true;
    else
        return oddJohn(Math.abs(n) - 1);
}

function oddJohn(n) {
    if (n === 0)
        return false;
    else
        return evenSteven(Math.abs(n) - 1);
}
console.info("evenSteven:", evenSteven(4)); //=> true
console.info("evenSteven:", oddJohn(11)); //=> true

function flat(ary) {
    console.log("   flat: ary>", ary);
    if (_.isArray(ary)) {
        //console.log("   flat: _.map(", ary, ",flat)", _.map(ary, flat));
        return cat.apply(cat, _.map(ary, flat));
    } else {
        return [ary];
    }
}

console.info("flat:", flat([[1, 2], [3, 4]])); //=> [1, 2, 3, 4]
console.info("flat:", flat([[1, 2], [3, 4, [5, 6, [[[7]]], 8]]])); //=> [1, 2, 3, 4, 5, 6, 7, 8]

//6.2.1 재귀를 이용한 깊은 복제
var x = [{a: [1, 2, 3], b: 42}, {c: {d: []}}];
var y = _.clone(x); //deep 복제는 안됨.

console.info("y:", JSON.stringify(y));
x[1]['c']['d'] = 10000;
console.info("y:", JSON.stringify(y));

/**
 * 객체 level이 깊어도 복사 가능하도록 함
 *
 * @param obj
 * @returns {*}
 */
function deepClone(obj) {
    //console.log("   deepClone: obj>", JSON.stringify(obj));
    if (!existy(obj) || !_.isObject(obj))
        return obj;

    var temp = new obj.constructor(); //todo: constructor로 무엇을 만드나?
    console.log("    deepClone: temp> ", temp);
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) { //prototype 필드는 복사되지 않도록
            console.log("   deepClone: obj[", key, "]", JSON.stringify(obj[key]));
            temp[key] = deepClone(obj[key]);
        }
    }
    return temp;
}

y = deepClone(x);

console.info("_.isEqual:", _.isEqual(x, y));
y[1]['c']['d'] = 42;
console.info("_.isEqual:", _.isEqual(x, y));

//6.2.2 중첩된 배열 탐색
/**
 * 처리할 배열 외에 두 함수를 인자로 받은 mapFun의 배열의 각 요소에 호출한 다음에 최종 작업을 수행할 수 있도록
 * 결과 배열을 resultFun으로 넘긴다.
 *
 * @param mapFun
 * @param resultFun
 * @param ary
 * @returns {*}
 */
function visit(mapFun, resultFun, ary) {
    if (_.isArray(ary))
        return resultFun(_.map(ary, mapFun));
    else
        return resultFun(ary);
}
console.info("visit:", visit(_.identity, _.isNumber, 42)); //=> true
console.info("visit:", visit(_.isNumber, _.identity, [1, 2, null, 3])); //=> [true, true, false, true]
console.info("visit:", visit(function (n) {
    return n * 2
}, rev, _.range(10))); //=> [18, 16, 14, 12, 10, 8, 6, 4, 2, 0]


/**
 * todo: 잘 이해가 안됨.
 * - 왜 partial1함수로 호출했는가?
 *
 * @param fun
 * @param ary
 * @returns {*}
 */
function postDepth(fun, ary) {
    return visit(partial1(postDepth, fun), fun, ary);
}
console.info("postDepth:", JSON.stringify(postDepth(_.identity, influences)));
console.info("postDepth:", JSON.stringify(postDepth(function (x) {
    if (x === "Lisp") {
        return "LISP";
    } else {
        return x;
    }
}, influences)));

function preDepth(fun, ary) {
    return visit(partial1(preDepth, fun), fun, fun(ary));
}
console.info("preDepth:", preDepth(_.identity, influences));

/**
 * 이건 스킴함. todo: 다음에 이해하기
 *
 * @param strategy
 * @param lang
 * @param graph
 * @returns {Array}
 */
function influencedWithStrategy(strategy, lang, graph) {
    var results = [];

    strategy(function (x) {
        if (_.isArray(x) && _.first(x) === lang)
            results.push(second(x));

        return x;
    }, graph);

    return results;
}

console.info("influencedWithStrategy:", influencedWithStrategy(postDepth, "Lisp", influences)); //=> ["Smalltalk", "Scheme"]

//6.3 너무 깊은 재귀!
console.info("evenSteven:", evenSteven(100000));
//=> Uncaught RangeError: Maximum call stack size exceeded
function evenOline(n) {
    if (n === 0)
        return true;
    else
        return partial1(oddOline, Math.abs(n) - 1);
}

function oddOline(n) {
    if (n === 0)
        return false;
    else
        return partial1(evenOline, Math.abs(n) - 1);
}

console.info("evenOline:", evenOline(0)); //=> true
console.info("evenOline:", oddOline(0)); //=> false
console.info("evenOline:", oddOline(3)); //=> function...
console.info("evenOline:", oddOline(3)()); //=> function...
console.info("evenOline:", oddOline(3)()()); //=> function...
console.info("evenOline:", oddOline(3)()()()); //=> true

/**
 * 함수의 반환값을 함수가 아닐때까지 호출한다.
 * - 너무 깊은 재귀호출의 해결책!: 평탄화 시킴, f()()() 여러번의 재귀호출을 한번에 할 수 있도록 함.
 *
 * @param fun
 * @returns {*}
 */
function trampoline(fun /*, args */) {
    var result = fun.apply(fun, _.rest(arguments));
    //console.log("   trampoline: result>", result);

    while (_.isFunction(result)) { //함수가 아닐때까지 호출해서 결과를 반환함
        result = result();
    }

    return result;
}
console.info("trampoline:", trampoline(oddOline, 3)); //=> true
console.info("trampoline:", trampoline(evenOline, 200000));
//console.info("trampoline:", trampoline(oddOline, 3000000));
//console.info("trampoline:", trampoline(evenOline, 200000000));


function isEvenSafe(n) {
    if (n === 0)
        return true;
    else
        return trampoline(partial1(oddOline, Math.abs(n) - 1));
}

function isOddSafe(n) {
    if (n === 0)
        return false;
    else
        return trampoline(partial1(evenOline, Math.abs(n) - 1));
}
console.info("isOddSafe:", isOddSafe(20001));
console.info("isEvenSafe:", isEvenSafe(20001));

//6.3.1 발생기
function generator(seed, current, step) {
    return {
        head: current(seed),
        tail: function () {
            console.log("forced. ", step(seed), current, step);
            return generator(step(seed), current, step);
        }
    };
}

function genHead(gen) {
    return gen.head
}
function genTail(gen) {
    return gen.tail()
}

var ints = generator(0, _.identity, function (n) {
    return n + 1
});

console.info("genHead:", JSON.stringify(genHead(ints)));
console.info("genTail:", JSON.stringify(genTail(ints)));
console.info("genTail:", JSON.stringify(genTail(genTail(ints))));

/**
 * todo: 다음에 이해하는 걸로 함.
 *
 * @param n
 * @param gen
 * @returns {*}
 */
function genTake(n, gen) {
    var doTake = function (x, g, ret) {
        if (x === 0)
            return ret;
        else
            return partial(doTake, x - 1, genTail(g), cat(ret, genHead(g)));
    };

    return trampoline(doTake, n, gen, []);
}

console.info("genTake:", genTake(3, ints));

/**
 *
 * @param interval
 * @param urls
 * @param onsuccess
 * @param onfailure
 * @returns {string}
 */
function asyncGetAny(interval, urls, onsuccess, onfailure) {
    var n = urls.length;

    var looper = function (i) {
        setTimeout(function () {
            if (i >= n) {
                onfailure("failed");
                return;
            }

            $.get(urls[i], onsuccess)
                .always(function () {
                    console.log("try: " + urls[i])
                })
                .fail(function () {
                    looper(i + 1); //호출결과가 실패면, 재귀 호출 looper가 실행된다.
                });
        }, interval);
    }

    looper(0);
    return "go";
}
var urls = ['http://goog.com', 'http://sdfsdfsdf.bzi', '_.html', 'foo.txt'];
//console.info("asyncGetAny:", asyncGetAny(2000, urls,
//    function (data) {
//        console.warn("Got some data");
//    },
//    function () {
//        console.log("all failed");
//    }
//));//=> go


//6.4 재귀는 저수준 동작이다.
var groupFrom = curry2(_.groupBy)(_.first);
var groupTo = curry2(_.groupBy)(second);

console.info("groupFrom:", JSON.stringify(groupFrom(influences)));
console.info("groupTo:", JSON.stringify(groupTo(influences)));

/**
 * todo: 이해 안됨. 일단 스킵!!!
 * @param graph
 * @param node
 * @returns {Array|*}
 */
function influenced(graph, node) {
    return _.map(groupFrom(graph)[node], second);
}




