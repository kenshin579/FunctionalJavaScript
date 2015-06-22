console.log("");
console.warn("Chap2_________________________________________________________________________");

//2.1.1 자바스크립트의 다중 패러다임
//1. 명령형 프로그래밍 (imperative programming)
var lyrics = [];
for (var bottles = 99; bottles > 0; bottles--) {
    lyrics.push(bottles + " bottles of beer on the wall");
    lyrics.push(bottles + " bottles of beer");
    lyrics.push("Take one down, pass it around");

    if (bottles > 1) {
        lyrics.push((bottles - 1) + " bottles of beer on the wall.");
    }
    else {
        lyrics.push("No more bottles of beer on the wall!");
    }
}
//_.each(lyrics, function(element) {
//    console.log("lyrics: ",  element);
//});

//lyrics = [];
function lyricSegment(n) {
    return _.chain([])
        .push(n + " bottles of beer on the wall")
        .push(n + " bottles of beer")
        .push("Take one down, pass it around")
        .tap(function (lyrics) {
            if (n > 1)
                lyrics.push((n - 1) + " bottles of beer on the wall.");
            else
                lyrics.push("No more bottles of beer on the wall!");
        })
        .value();
}
_.each(lyricSegment(9), function (element) {
    console.log("lyricSegment: ", element);
});

function song(start, end, lyricGen) {
    return _.reduce(_.range(start, end, -1), //[5,4,3,2,1]
        function (acc, n) { //n => currentValue
            return acc.concat(lyricGen(n));
        }, []);
}
_.each(song(5, 0, lyricSegment), function (element) {
    console.log("song: ", element);
});

var aObj = {
    name: 'a',
    fun: function () {
        return this;
    }
};
console.log(aObj.fun());

var bObj = {
    name: 'a',
    fun: function () {
        return this; //this가 전역객체를 가리키는 것을 확인함
    }
};
var bFunc = bObj.fun;
console.log(bFunc()); //Window 같은 어떤 전역객체

//3.Metaprogramming:
function Point2D(x, y) {
    this._x = x;
    this._y = y;
}
console.log(new Point2D(0, 1));

function Point3D(x, y, z) {
    Point2D.call(this, x, y);
    this._z = z;
}
console.log(new Point3D(2, 3, 4));

//2.2 응용형 프로그래밍
//-함수 A의 결과를 함수 B의 인자로 제공한다: ex. map, reduce, filter 내부에서 다른 함수가 호출됨
var nums = [1, 2, 3, 4, 5];
function doubleAll(array) {
    return _.map(array, function (n) {
        return n * 2;
    });
}
console.info("doubleAll: ", doubleAll(nums)); //=> [2, 4, 6, 8, 10]

function average(array) {
    console.log("   > ", array);
    var sum = _.reduce(array, function (a, b) {
        return a + b;
    });
    return sum / _.size(array);
}
console.info("average: ", average(nums)); //=> 3

/* grab only even numbers in nums */
function onlyEven(array) {
    return _.filter(array, function (n) {
        return (n % 2) === 0;
    });
}
console.info("onlyEven: ", onlyEven([1, 2, 3, 4, 5])); //=> [2, 4]

//2.2.1 컬렉션 중심 프로그래밍: 컬렉션에 포함된 많은 아이템을 처리해야 할 때 함수형 프로그래밍의 진가가 발휘됨
console.log(_.map({a: 1, b: 2}, _.identity));
console.log(_.map({a: 1, b: 2}, function (v, k) { //=> [['a', 1],['b',2]]
    return [k, v];
}));
//_.map함수는 컬랙션 자체를 세번째 인자로 가질 수 있음
console.log(_.map({a: 1, b: 2}, function (v, k, coll) { //=> [['a', 1, ['a', 'b']], ['b', 2, ['a', 'b']]]
    return [k, v, _.keys(coll)];
}));

function allOf(/* funs */) {
    return _.reduceRight(arguments, function (truth, f) { //[T,T,T,F]
        return truth && f(); //함수를 실행함
    }, true);
}

function anyOf(/* funs */) {
    return _.reduceRight(arguments, function (truth, f) {
        return truth || f();
    }, false);
}
function T() {
    return true;
}
function F() {
    return false;
}

console.info("allOf: ", allOf());              //=> true
console.info("allOf: ", allOf(T, T));          //=> false
console.info("allOf: ", allOf(T, T, T, F));    //=> true

console.info("anyOf: ", anyOf(T, T, F));       //=> true
console.info("anyOf: ", anyOf(F, F, F, F));    //=> false
console.info("anyOf: ", anyOf());              //=> false

console.log("_.find: ", _.find(['a', 'b', 3, 'd'], _.isNumber));

function complement(pred) {
    return function () {
        return !pred.apply(null, _.toArray(arguments));
    };
}
console.log("_.reject: ", _.reject(['a', 'b', 3, 'd'], _.isNumber)); //=>a,b,d
console.log("_.filter: ", _.filter(['a', 'b', 3, 'd'], _.isNumber)); //=>3
console.log("_.filter: ", _.filter(['a', 'b', 3, 'd'], complement(_.isNumber))); //=>a,b,d

/*
 Array & Apply에 대한 고찰
 - 참고: http://www.2ality.com/2012/07/apply-tricks.html
 */

//1.인자에 array로 넘겨줄수 없는 함수에도 넘겨주도록 할 수 있다 (apply로)
console.log("1.Handing an array to func: ", Math.max.apply(null, [10, -5, -1]));

//2.array 중간에 값이 없는 경우에 holes을 제거하는 역할을 함 (하지만, 완전하지 않음)
console.log("2. Eliminating holes: ", Array.apply(null, ["a", , "b"]));
console.log("2a. Eliminating holes(문제접도 있다): ", Array.apply(null, [3])); //empthy with len 3으로 인식

//3.flatten an array가 가능하다
console.log("3.flatten an array: ", Array.prototype.concat.apply([], [["a"], ["b"]]));
console.log("3a: ", Array.prototype.concat.apply([], [["a"], "b"]));
console.log("3b", JSON.stringify(Array.prototype.concat.apply([], [[["a"]], ["b"]])));
console.log("_.flatten", _.flatten([[["a"]], ["b"]]));

//2.2.3: 응용형 함수란
/**
 * 여러 array를 하나의 array로 합쳐주는 역할을 함
 *
 * - concat은 새로운 array를 반환한다. (immunity 함수임)
 *
 * @returns {*}
 */
function cat() {
    var head = _.first(arguments);
    //console.log("head: ", head); //[1, 2, 3]
    if (existy(head)) {
        var rest = _.rest(arguments);
        //console.log("rest: ", JSON.stringify(rest)); //[[4,5],[6,7,8]]
        return head.concat.apply(head, rest); //질문: concat.apply를 한것과 그냥 concat의 차이점은? 없음.
    }
    else {
        //console.log("else: ");
        return [];
    }
}
console.log("cat: ", cat([1, 2, 3], [4, 5], [6, 7, 8]));//=> [1, 2, 3, 4, 5, 6, 7, 8]

//아래 construct는 응용형 함수가 아니다. 인자로 받은 함수를 호출하지 않았음.

/**
 * 요소와 배열을 인자로 받아 배열 앞에 요소를 추가하는 함수임
 *
 * @param head
 * @param tail
 * @returns {*}
 */
function construct(head, tail) {
    return cat([head], _.toArray(tail));
}

console.log("construct: ", construct(42, [1, 2, 3])); //=> [42, 1, 2, 3]

//2.2.3 응용형 함수
/**
 * fun이라는 함수를 인자로 받아 _.map처럼 인자로 제공된 켈렉션의 모든 요소에 함수(, 합치는)를 실행한다.
 *
 * @param fun
 * @param coll
 * @returns {*}
 */
function mapcat(fun, coll) {
    console.log("   mapcat > coll:", coll);
    return cat.apply(null, _.map(coll, fun));
}

console.log("mapcat: ", mapcat(function (e) {
    return construct(e, [","]);
}, [1, 2, 3])); //=>  [1, ",", 2, ",", 3, ","]

/**
 * 마지막(last)만 빼고 array를 반환한다.
 *
 * @param coll
 * @returns {Array.<T>|string|Blob|ArrayBuffer|*}
 */
function butLast(coll) {
    return _.toArray(coll).slice(0, -1);
}
console.log("butLast: ", butLast([2, 3, 4, 5])); //=> [2, 3, 4]

/**
 * 켈렉션의 모든 요소 중간에 ','를 삽입하고 마지막 요소를 제외한 array를 반환한다.
 *
 * @param inter
 * @param coll
 * @returns {Array.<T>|string|Blob|ArrayBuffer|*}
 */
function interpose(inter, coll) {
    return butLast(mapcat(function (e) {
            return construct(e, [inter]);
        },
        coll));
}

console.log("interpose: ", interpose(",", [1, 2, 3])); //=>  [1, ",", 2, ",", 3]


var zombie = {name: "Bub", film: "Day of the Dead"};

console.info("_.keys: ", _.keys(zombie)); //=> ["name", "film"]
console.info("_.values: ", _.values(zombie));//=> ["Bub", "Day of the Dead"]
console.info("_.object: ", JSON.stringify(
        _.object( //array -> map object 형식으로 바꿈
            _.map(
                _.pairs( //map object -> array 형식으로 바꿈
                    zombie
                ),
                function (pair) {
                    return [pair[0].toUpperCase(), pair[1]];
                }
            )
        )
    )
); //=> {NAME: "Bub", FILM: "Day of the Dead"}

console.info("_.invert: ", _.invert(zombie));
//=> {Bub: "name", Day of the Dead: "film"}

//객체에 삽입하는 예제
console.info("_.pluck: ", _.pluck(
        _.map(
            [
                {title: "Chthon", author: "Anthony"},
                {title: "Grendel", author: "Gardner"},
                {title: "After Dark"} //<--여기 끝에 삽입하려고 함
            ],
            function (obj) {
                console.log(obj);
                return _.defaults(obj, {author: "Unknown"});
            }
        ), 'author'
    )
);

var person = {name: "Romy", token: "j1234", password: "tigress"};
var info = _.omit(person, 'token', 'password');
var creds = _.pick(person, "token", "password");
console.info("_.omit: ", info);
console.info("_.pick: ", creds);

/*
 2.3.1 '테이블 형식'의 데이터
 */
var library = [
    {title: "SICP", isbn: "0262010771", ed: 1},
    {title: "SICP", isbn: "0262510871", ed: 2},
    {title: "Joy of Clojure", isbn: "1935182641", ed: 1}
];

//_.findWhere: 처음으로 match된 record를 return함
console.info("_.findWhere: ", _.findWhere(library, {title: "SICP", ed: 2}));
//=> {title: "SICP", isbn: "0262510871", ed: 2}
console.info("_.findWhere: ", _.findWhere(library, {title: "SICP"}));
//_.where: 모든 객체를 return함
console.info("_.where: ", JSON.stringify(_.where(library, {title: "SICP", ed: 2})));
console.info("_.where: ", JSON.stringify(_.where(library, {title: "SICP"})));

console.info("title만 가져오기", _.pluck(library, "title"));

/**
 * SQL select함수 구현
 *
 * @param table
 * @param keys
 * @returns {Array|*}
 */
function project(table, keys) {
    return _.map(table, function (obj) {
        var pickParameters = construct(obj, keys); //[{"title":"SICP","isbn":"0262010771","ed":1},"title","isbn"]
        console.log(JSON.stringify(pickParameters));
        //return _.pick(construct(obj, keys));
        //질문: 왜 apply를 하나? _.pick함수는 여러 인자를 한번에 array로 넘겨주기 위함
        return _.pick.apply(null, pickParameters); //_.pick: 원하는 keys만 선택해서 복사본 객체를 반환함

    });
}
var editionResults = project(library, ['title', 'isbn']);
console.info("editionResults: ", JSON.stringify(editionResults));
//=>
//"[{'title': 'SICP', 'isbn': '0262010771'}, {'title': 'SICP', 'isbn': '0262510871'}, {'title': 'Joy of Clojure', 'isbn': '1935182641'}]"
//"[{'title': 'SICP', 'isbn': '0262010771'}, 'isbn']"
//"[{'title': 'SICP', 'isbn': '0262510871'}, 'isbn']"
//"[{'title': 'Joy of Clojure', 'isbn': '1935182641'}, 'isbn']

var isbnResults = project(editionResults, ['isbn']);
console.info("isbnResults: ", JSON.stringify(isbnResults));
//=> "[{'isbn': '0262010771'}, {'isbn': '0262510871'}, {'isbn': '1935182641'}]"

console.log("initValue: ", _.omit.apply(null, construct({a: 1, b: 2}, _.keys({'a': 'AAA'})))); //=> {b: 2}
console.log("initValue: ", _.omit.apply(null, construct({a: 1, b: 2, c: 3, d: 4}, _.keys({'a': 'AAA'})))); //=> {b: 2, c: 3, d: 4}

/**
 * 객체의 이름을 바꿈
 * - 아이디어:
 * 1. a를 제외한 객체로 시작해서 새로운 이름으로 객체에 추가하는 방식임
 *
 * @param obj
 * @param newNames
 * @returns {*}
 */
function rename(obj, newNames) {
    return _.reduce(
        newNames, //{'a':'AAA"}로 시작함 (결국 여기서는 한번 호출됨)
        function (prevObj, nuValue, oldKey) {
            console.log("o: ", prevObj, "newKeyInValue:", nuValue, "oldKey:", oldKey); //=> {b: 2} newKeyInValue: AAA oldKey: a
            if (_.has(obj, oldKey)) {
                prevObj[nuValue] = obj[oldKey]; //새로운 키로 추가함
                return prevObj;
            }
            else {
                return prevObj;
            }
        },
        _.omit.apply(null, construct(obj, _.keys(newNames))) //첫 initValue => 'a'를 제외한 나머지로 시작함, {b: 2}
    );
}
console.info("rename: ", rename({a: 1, b: 2}, {'a': 'AAA'})); //=> {b: 2, AAA: 1}
console.info("rename: ", rename({a: 1, b: 2, c: 3, d: 4}, {'a': 'AAA'})); //=> {b: 2, c: 3, d: 4, AAA: 1}

/**
 * SQL의 rename을 구현함
 *
 * @param table
 * @param newNames
 * @returns {*|Array}
 */
function as(table, newNames) {
    return _.map(table, function (obj) {
        return rename(obj, newNames);
    });
}
console.info("as: ", JSON.stringify(as(library, {ed: 'edition'})));
//=>
//"[{\"title\": \"SICP\", \"isbn\": \"0262010771\", \"edition\": 1},
// {\"title\": \"SICP\", \"isbn\": \"0262510871\", \"edition\": 2},
// {\"title\": \"Joy of Clojure\", \"isbn\": \"1935182641\", \"edition\": 1}]"

/**
 * SQL의 where 함수 구현
 *
 * @param table
 * @param pred
 * @returns {*}
 */
function restrict(table, pred) {
    return _.reduce(
        table,
        function (newTable, obj) {
            console.log("newTable", JSON.stringify(newTable));
            console.log("obj", obj);
            if (truthy(pred(obj))) {
                return newTable;
            } else {
                return _.without(newTable, obj); //obj를 table에서 제거함
            }
        },
        table);
}

console.info("restrict: ", JSON.stringify(
    restrict(library, function (book) {
            return book.ed > 1;
        }
    )
));

console.info("SQL: ", JSON.stringify(
        restrict(
            project(
                as(library, {ed: 'edition'}),
                ['title', 'isbn', 'edition']),
            function (book) {
                return book.edition > 1;
            }
        )
    )
);
