console.warn("Collections________________________________________________________");
////_.toArray(list): list인자를 array [..] 형태로 반환함
console.info("_.toArray: ", (function () { //=> [2, 3, 4]
    return _.toArray(arguments).slice(1);
})(1, 2, 3, 4));

////_.reduce(list, iteratee, [memo], [context]): 하나의 값을 return함
//- initValue값이 없는 경우에는 list에서 첫번째 값이 initValue로 넘어감
var initValue = 10;
//first call:   10 + 1 => 11
//second call:  11 + 2 => 13
//third call:   13 + 3 => 16
var sum = _.reduce([1, 2, 3], function (previousValue, currentValue) { //=> 6
    return previousValue + currentValue;
}, initValue);

console.info("_.reduce: ", sum);
//참고: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
console.info("reduce: ", [0, 1, 2, 3, 4].reduce(function (previousValue, currentValue, index, array) {
    return previousValue + currentValue;
}, 10));

console.log({'a': 'AAA'});
console.info("_.reduce: ", _.reduce({'a': 'AAA'}, function (prevObj, value, key) {
    console.log("    > prevObj: ", prevObj, "value:", value, "key:", key);
    //return previousValue + currentValue;
    return prevObj;
}, {b: 2}));

////_.reduceRight(list, iteratee, memo, [context]) :
var list = [[0, 1], [2, 3], [4, 5]];
var flat = _.reduceRight(list, function (a, b) { //=> [4, 5, 2, 3, 0, 1]
    console.info("a: ", a, " b: ", b);
    return a.concat(b);
}, []);
console.info("flat: ", flat);
console.info("_.reduce: ", _.reduce([100, 2, 25], function (acc, curr) {
        console.log(acc, " / ", curr, " => ", acc / curr);
        return acc / curr;
    }
));
console.info("_.reduceRight: ", _.reduceRight([100, 2, 25], function (acc, curr) {
        console.log(acc + " / " + curr + " => " + acc / curr);
        return acc / curr;
    }
));

////_.map(list, iteratee, [context]): 주어진 array의 각 요소에 함수를 실행하고 array를 return함
console.info("_.map: ", _.map([1, 2, 3], function (num) { //=> [3, 6, 9]
    return num * 3;
}));
console.info("_.map: ", _.map({one: 1, two: 2, three: 3}, function (num, key) { //=> [3, 6, 9]
    return num * 3;
}));
console.info("_.map: ", _.map([[1, 2], [3, 4]], _.first)); //=> [1, 3]

////_.sortBy(list, iteratee, [context]): Returns a (stably) sorted copy of list, ranked in ascending order by the
// results of running each value through iteratee
console.info(_.sortBy([1, 2, 3, 4, 5, 6], function (num) {
    return Math.sin(num);
})); //=> [5, 4, 6, 3, 1, 2]

var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
console.info(JSON.stringify(_.sortBy(stooges, 'name')));
//=> [{name: 'curly', age: 60}, {name: 'larry', age: 50}, {name: 'moe', age: 40}];

////_.filter(list, predicate, [context]): 각 요소를 돌면서 predicate 함수가 true인 것만 array에 포함시킴
var evens = _.filter([1, 2, 3, 4, 5, 6], function (num) {
    return num % 2 == 0;
}); //=> [2, 4, 6]
console.info("evens: ", evens);

////_.find(list, predicate, [context]): predicate 함수가 true가 되는 첫번째 요소를 return함
var even = _.find([1, 2, 3, 4, 5, 6], function (num) { //=> 2
    return num % 2 == 0;
});
console.log("_.find: ", even);

////_.reject(list, predicate, [context]) : predicate함수가 false 인것만 array로 반환 (_.filter와 정반대인 함수임)
var odds = _.reject([1, 2, 3, 4, 5, 6], function (num) {
    return num % 2 == 0;
}); //=> [1, 3, 5]
console.log("_.reject: ", odds);

////_.every(list, [predicate], [context]): list의 모든 값이 predicate함수의 truth인 경우에 true를 반환함  , alias: _.all
console.info("_.every: ", _.every([1, false, 3, 4]), _.isNumber); //todo: =>이건 제대로 동작을 안함
console.info("_.every: ", _.every([1, 2, 3, 4], _.identity)); //=> true
console.info("_.every: ", _.every([true, 1, null, 'yes'], _.identity)); //=> false

////_.some(list, [predicate], [context]): predicate함수의 true가 하나라도 있으면 true를 반환함 , alias: any
console.log("_.some: ", _.some([null, 0, 'yes', false]));
console.log("_.some: ", _.some([1, 2, 'c', 4], _.isString));

////_.sortBy(list, iteratee, [context]): iteratee 함수에 의해서 ascending order로 정렬후 copy 버전을 반환함
console.info("_.sortBy: ", _.sortBy([1, 2, 3, 4, 5, 6], function (num) {
    return Math.sin(num);
})); //=> [5, 4, 6, 3, 1, 2]

var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
console.info("_.sortBy: ", JSON.stringify(_.sortBy(stooges, 'name')));
//=> [{name: 'curly', age: 60}, {name: 'larry', age: 50}, {name: 'moe', age: 40}];

////_.groupBy(list, iteratee, [context]) : iteratee함수에 의해서 group별로 나뉨
console.info("_.groupBy: ", JSON.stringify(_.groupBy([1.3, 2.1, 2.4], function (num) {
    return Math.floor(num);
}))); //=> {1: [1.3], 2: [2.1, 2.4]}

console.info("_.groupBy: ", JSON.stringify(_.groupBy(['one', 'two', 'three'], 'length')));
//=> {3: ["one", "two"], 5: ["three"]}

////_.countBy(list, iteratee, [context]): iteratee함수에 의해서 구릅별로 나뉘고 나서의 count를 return함
//- 같은 결과끼지 묶어서 count를 한다고 보면 됨
console.info("_.countBy: ", JSON.stringify(_.countBy([1, 2, 3, 4, 5], function (num) {
    return num % 2 == 0 ? 'even' : 'odd';
}))); //=> {odd: 3, even: 2}

////_.pluck(list, propertyName) : propertyName으로 value을 뽑는다.
var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
console.info("_.pluck: ", _.pluck(stooges, 'name')); //=> ["moe", "larry", "curly"]

console.log("");
console.warn("Arrays________________________________________________________");
////_.first(array, [n]): array에서 첫번째 요소를 return함
console.info("_.first: ", _.first([5, 4, 3, 2, 1]));
////_.rest(array, [index]): index까지를 제외한 나머지 요소가 array로 return됨
console.info("_.rest: ", _.rest([5, 4, 3, 2, 1]));
console.info("_.rest: ", _.rest([5, 4, 3, 2, 1], 3));

////_.zip(*arrays): 첫번째 position, 두번째 position을 함께 merge함
console.info("_.zip: ", _.zip( //=> [["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]
    ['moe', 'larry', 'curly'],
    [30, 40, 50],
    [true, false, false]
));

console.info("_.zip: ", _.zip( //=>[[1, 'a'],[2, 'b']]
    [1, 2],
    ['a', 'b']
));

////_.range([start], stop, [step]): range를 만들어줌
console.info("_.range: ", _.range(10));         //=> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
console.info("_.range: ", _.range(1, 11));      //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
console.info("_.range: ", _.range(0, 30, 5));   //=> [0, 5, 10, 15, 20, 25]
console.info("_.range: ", _.range(0, -10, -1)); //=> [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
console.info("_.range: ", _.range(0));          //=> []
////_.object(list, [values]) : Converts arrays into objects.
console.info("_.object: ", _.object(['moe', 'larry', 'curly'], [30, 40, 50])); //=> {moe: 30, larry: 40, curly: 50}
console.info("_.object: ", _.object([['moe', 30], ['larry', 40], ['curly', 50]])); //=> {moe: 30, larry: 40, curly: 50}

////_.uniq(array, [isSorted], [iteratee]): 중복을 제거함
console.info("_.uniq:", _.uniq([1, 2, 1, 4, 1, 3])); //=> [1, 2, 4, 3]
console.info("_.uniq:", _.uniq([1, 2, 1, 4, 1, 3], false, function (each, index) {
    console.log("  > each:", each, "index:", index);
})); //=> [1, 2, 4, 3]


console.log("");
console.warn("Functions________________________________________________________");
////_.bind(function, object, *arguments) : 함수를 object에 bind시킨다.
//이 의미는 함수가 실행될때마다 this의 값이 object가 된다.
var func = function (greeting) { //gretting <- arguments
    return greeting + ': ' + this.name
};

func = _.bind(func, {name: 'moe'}, 'hi'); //'{name: 'mode'} ->
console.info("_.bind:", func()); //=> 'hi: moe'

////_.bindAll(object, *methodNames): object와 여러 함수를 binding 시킴. 이 의미는 함수가 호출될때마다 object context로 실행하도록 함
var buttonView = {
    label: 'underscore',
    onClick: function () {
        alert('clicked: ' + this.label);
    },
    onHover: function () {
        console.log('hovering: ' + this.label);
    }
};
_.bindAll(buttonView, 'onClick', 'onHover');
// When the button is clicked, this.label will have the correct value.
//jQuery('#underscore_button').bind('click', buttonView.onClick);

////_.compose(*functions) : f(g(h()) 이렇게 각 함수는 함수의 return값을 consumes하면서 결과를 composite한다.
//- 가장 오른쪽의 함수의 결과가 왼쪽 함수로 하나씩 전달된다.
var greet = function (name) { //3.hi: MOE <==== !
    return "hi: " + name;
};
var exclaim = function (statement) { //2.MOE <==== !
    return statement.toUpperCase() + "!";
};
var last = function (statement) { // 1.moe <====
    return statement + " <===";
};
var welcome = _.compose(greet, exclaim);
console.info("welcome:", welcome('moe')); //=> 'hi: MOE!'
welcome = _.compose(greet, exclaim, last);
console.info("welcome:", welcome('moe')); //=> welcome: hi: MOE <===!

console.log("");
console.warn("Object________________________________________________________");
////_.tap(object, interceptor) : Invokes interceptor with the object, and then returns object.
//chain하는 중간에 무엇인가 실행할 때 사용함
console.info("_.chain:", _.chain([1, 2, 3, 200]) //=> [4, 40000]
        .filter(function (num) {
            return num % 2 == 0;
        })
        //.tap(alert) //=> // [2, 200] (alerted)
        .map(function (num) {
            return num * num
        })
        .value()
);

////_.keys(object) : keys만 추출함
console.info("_.keys: ", _.keys({one: 1, two: 2, three: 3})); //=> ["one", "two", "three"]
////_.values(object): value만 추출함
_.values({one: 1, two: 2, three: 3}); //=> [1, 2, 3]

////_.pairs(object):  a list of [key, value] pairs로 convert
_.pairs({one: 1, two: 2, three: 3}); //=> [["one", 1], ["two", 2], ["three", 3]]

////_.defaults(object, *defaults) : Fill in undefined properties in object with the first value present in the following list of defaults objects.
var iceCream = {flavor: "chocolate"};
console.info("_.defaults: ", _.defaults(iceCream, {flavor: "vanilla", sprinkles: "lots", frank: "test"}));
//=> {flavor: "chocolate", sprinkles: "lots"}

////_.findWhere(list, properties):
//console.info("_.findWhere: ",_.findWhere(publicServicePulitzers, {newsroom: "The New York Times"}));
//=> {year: 1918, newsroom: "The New York Times",
//    reason: "For its public service in publishing in full so many official reports,
//    documents and speeches by European statesmen relating to the progress and
//    conduct of the war."}

////_.isObject(value) :
console.info("_.isObject:", _.isObject({})); //=> true
console.info("_.isObject:", _.isObject(1)); //=> false

////_.has(object, key) : key가 객체에 있는가?
console.info("_.has:", _.has({a: 1, b: 2, c: 3}, "b")); //=> true

////_.extend(destination, *sources) : sources에 있는 properties를 dest 객체 다 복사해서 dest를 반한환다.
console.info("_.extend:", _.extend({name: 'moe'}, {age: 50})); //=> {name: 'moe', age: 50}

console.log("");
console.warn("Utility________________________________________________________");
////_.result(object, property, [defaultValue]): property가 함수인 경우에는 실행하고 존재하는 경우에는 그 값을 return
//하고 없는 경우에는 default 값을 return함
var object = {
    cheese: 'crumpets', stuff: function () {
        return 'nonsense';
    }
};
console.info("_.result: ", _.result(object, 'cheese')); //=> "crumpets"
console.info("_.result: ", _.result(object, 'stuff')); //=> "nonsense"
console.info("_.result: ", _.result(object, 'meat', 'ham')); //=> "ham"

console.info("_.result: ", _.result([1, 2, 3], "reverse")); //=> "ham"

////_.identity(value) : same value를 반환함
//underscore에서는 default iteratee로 사용됨
var stooge = {name: 'moe'};
console.info("_.identity: ", stooge === _.identity(stooge));//=> true

console.log("");
console.warn("Chaining________________________________________________________");
/*
 _.chain(obj): value()이 호출될때까지 계속 wrapped object를 return함
 */
var stooges = [{name: 'curly', age: 25}, {name: 'moe', age: 21}, {name: 'larry', age: 23}];
var youngest = _.chain(stooges) //=> "moe is 21"
    .sortBy(function (stooge) {
        return stooge.age;
    })
    .map(function (stooge) { //todo: 인자 없이 넘겨주면 어떻게 알 수 있나? 답변: _.chain 래퍼 객체가 수정한 버전에 의해서 앞에 인자가 없는 버전으로 바뀜
        return stooge.name + ' is ' + stooge.age;
    })
    .first()
    .value();

console.info("_.chain: ", JSON.stringify(youngest));
////_(obj).value(): wrapped object된 객체에서 value을 추출함
console.info("_.value: ", _([1, 2, 3]).value()); //=> [1, 2, 3]

console.info("_.chain:", _.chain([1]) //=> [4, 40000]
        .push("test")
        .value()
);

console.log("");
console.warn("기타________________________________________________________");
