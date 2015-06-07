console.log("");
console.warn("Chap6_________________________________________________________________________");

//6.1 자신을 호출하는 함수
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
        console.log("  construct(", JSON.stringify(to), "nexts(", JSON.stringify(more), JSON.stringify(node), ")):",
            construct(to, nexts(more, node))); //"Smalltalk, [] => ["Smalltalk"]
        return construct(to, nexts(more, node));
    } else {
        return nexts(more, node);
    }
}
console.info("nexts:", nexts(influences, 'Lisp')); //=> ["Smalltalk", "Scheme"]

/**
 * 단지 뭔가를 깊이 우선 순서로 실행할 수 있도록 노드 배열을 만들어 준다.
 *
 * @param graph
 * @param nodes
 * @param seen
 * @returns {*}
 */
function depthSearch(graph, nodes, seen) {
    if (_.isEmpty(nodes)) return rev(seen);

    var node = _.first(nodes);
    var more = _.rest(nodes);

    if (_.contains(seen, node))
        return depthSearch(graph, more, seen);
    else
        return depthSearch(graph,
            cat(nexts(graph, node), more),
            construct(node, seen));
}
console.info("depthSearch:", depthSearch(influences, ['Lisp'], []));
//=>  ["Lisp", "Smalltalk", "Self", "Lua", "JavaScript", "Scheme"]

console.info("depthSearch:", depthSearch(influences, ['Smalltalk', 'Self'], []));
//=> ["Smalltalk", "Self", "Lua", "JavaScript"]

console.info("depthSearch:", depthSearch(construct(['Lua', 'Io'], influences), ['Lisp'], []));
//=> ["Lisp", "Smalltalk", "Self", "Lua", "Io", "JavaScript", "Scheme"]

//tail-recursive: 꼬리 재귀 (todo: 잘 이해가 안됨)
//- 특정 함수가 간접적으로 자신을 꼬리호출함으로써, 재귀를 하면서도 스팩프레임을 재사용할 때를 부르는 말이다.
//참고: http://c2.com/cgi/wiki?TailRecursion
function tcLength(ary, n) {
    var l = n ? n : 0;

    if (_.isEmpty(ary)) {
        console.log("   > l:", l);
        return l;
    } else {
        console.log("tcLength(", _.rest(ary), ",", l + 1, "):", tcLength(_.rest(ary), l + 1));
        return tcLength(_.rest(ary), l + 1);
    }
}

console.info("tcLength:", tcLength(_.range(3))); //=> 10
//console.info("tcLength:", tcLength()); //=> 0
//console.info("tcLength:",
//    tcLength([0], 1)
//); //=> 0

//function andify(/* preds */) {
//    var preds = _.toArray(arguments);
//
//    return function(/* args */) {
//        var args = _.toArray(arguments);
//
//        var everything = function(ps, truth) {
//            if (_.isEmpty(ps))
//                return truth;
//            else
//                return _.every(args, _.first(ps))
//                    && everything(_.rest(ps), truth);
//        };
//
//        return everything(preds, true);
//    };
//}
//
//function orify(/* preds */) {
//    var preds = _.toArray(arguments);
//
//    return function(/* args */) {
//        var args = _.toArray(arguments);
//
//        var something = function(ps, truth) {
//            if (_.isEmpty(ps))
//                return truth;
//            else
//                return _.some(args, _.first(ps))
//                    || something(_.rest(ps), truth);
//        };
//
//        return something(preds, false);
//    };
//}
//
//function evenSteven(n) {
//    if (n === 0)
//        return true;
//    else
//        return oddJohn(Math.abs(n) - 1);
//}
//
//function oddJohn(n) {
//    if (n === 0)
//        return false;
//    else
//        return evenSteven(Math.abs(n) - 1);
//}
//
//function flat(ary) {
//    if (_.isArray(ary))
//        return cat.apply(cat, _.map(ary, flat));
//    else
//        return [ary];
//}
//
//function deepClone(obj) {
//    if (!existy(obj) || !_.isObject(obj))
//        return obj;
//
//    var temp = new obj.constructor();
//    for (var key in obj)
//        if (obj.hasOwnProperty(key))
//            temp[key] = deepClone(obj[key]);
//
//    return temp;
//}
//
//function visit(mapFun, resultFun, ary) {
//    if (_.isArray(ary))
//        return resultFun(_.map(ary, mapFun));
//    else
//        return resultFun(ary);
//}
//
//function postDepth(fun, ary) {
//    return visit(partial1(postDepth, fun), fun, ary);
//}
//
//function preDepth(fun, ary) {
//    return visit(partial1(preDepth, fun), fun, fun(ary));
//}
//
//function influencedWithStrategy(strategy, lang, graph) {
//    var results = [];
//
//    strategy(function(x) {
//        if (_.isArray(x) && _.first(x) === lang)
//            results.push(second(x));
//
//        return x;
//    }, graph);
//
//    return results;
//}
//
//function evenOline(n) {
//    if (n === 0)
//        return true;
//    else
//        return partial1(oddOline, Math.abs(n) - 1);
//}
//
//function oddOline(n) {
//    if (n === 0)
//        return false;
//    else
//        return partial1(evenOline, Math.abs(n) - 1);
//}
//
//function trampoline(fun /*, args */) {
//    var result = fun.apply(fun, _.rest(arguments));
//
//    while (_.isFunction(result)) {
//        result = result();
//    }
//
//    return result;
//}
//
//function isEvenSafe(n) {
//    if (n === 0)
//        return true;
//    else
//        return trampoline(partial1(oddOline, Math.abs(n) - 1));
//}
//
//function isOddSafe(n) {
//    if (n === 0)
//        return false;
//    else
//        return trampoline(partial1(evenOline, Math.abs(n) - 1));
//}
//
//function generator(seed, current, step) {
//    return {
//        head: current(seed),
//        tail: function() {
//            console.log("forced");
//            return generator(step(seed), current, step);
//        }
//    };
//}
//
//function genHead(gen) { return gen.head }
//function genTail(gen) { return gen.tail() }
//
//var ints = generator(0, _.identity, function(n) { return n+1 });
//
//function genTake(n, gen) {
//    var doTake = function(x, g, ret) {
//        if (x === 0)
//            return ret;
//        else
//            return partial(doTake, x-1, genTail(g), cat(ret, genHead(g)));
//    };
//
//    return trampoline(doTake, n, gen, []);
//}
//
//function asyncGetAny(interval, urls, onsuccess, onfailure) {
//    var n = urls.length;
//
//    var looper = function(i) {
//        setTimeout(function() {
//            if (i >= n) {
//                onfailure("failed");
//                return;
//            }
//
//            $.get(urls[i], onsuccess)
//                .always(function() { console.log("try: " + urls[i]) })
//                .fail(function() {
//                    looper(i + 1);
//                });
//        }, interval);
//    }
//
//    looper(0);
//    return "go";
//}
//
//var groupFrom = curry2(_.groupBy)(_.first);
//var groupTo   = curry2(_.groupBy)(second);
//
//function influenced(graph, node) {
//    return _.map(groupFrom(graph)[node], second);
//}
