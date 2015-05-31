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

//2.2 응용형 프로그래밍: 함수 A 내부의 함수 B를 호출하는 형식으로 이루어짐
//-함수 A의 결과를 함수 B의 인자로 제공한다: ex. map, reduce, filter 내부에서 다른 함수가 호출됨
var nums = [1, 2, 3, 4, 5];
function doubleAll(array) {
    return _.map(array, function (n) {
        return n * 2;
    });
}
console.info("doubleAll: ", doubleAll(nums)); //=> [2, 4, 6, 8, 10]

function average(array) {
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
console.info("onlyEven: ", onlyEven(nums)); //=> [2, 4]

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
        return !pred.apply(null, _.toArray(arguments)); //todo: 이거 이해가 안됨
    };
}
console.log("_.reject: ", _.reject(['a', 'b', 3, 'd'], _.isNumber)); //=>a,b,d
console.log("_.filter: ", _.filter(['a', 'b', 3, 'd'], _.isNumber)); //=>3
console.log("_.filter: ", _.filter(['a', 'b', 3, 'd'], complement(_.isNumber))); //=>a,b,d

//Array & Apply에 대한 참고내용: http://www.2ality.com/2012/07/apply-tricks.html
//1.인자에 array로 넘겨줄수 없는 함수에도 넘겨주도록 할 수 있다 (appy로)
console.log("1.Handing an array to func: ", Math.max.apply(null, [10, -5, -1]));
//2.array 중간에 값이 없는 경우에 holes을 제거하는 역할을 함 (하지만, 완전하지 않음)
console.log("2. Eliminating holes: ", Array.apply(null, ["a", , "b"]));
console.log("2a. Eliminating holes(문제접도 있다): ", Array.apply(null, [3])); //empthy with len 3으로 인식
console.log("3.flatten an array: ", Array.prototype.concat.apply([], [["a"], ["b"]]));
console.log("3a: ", Array.prototype.concat.apply([], [["a"], "b"]));
console.log("3b", JSON.stringify(Array.prototype.concat.apply([], [[["a"]], ["b"]])));
console.log("_.flatten", _.flatten([[["a"]], ["b"]]));

//2.2.3: 응용형 함수란: 다른 함수를 인자로 받는 함수를 정의하고 그 다음에 인자로 받은 함수를 호출하는 형태
function cat() {
    var head = _.first(arguments);
    //console.log("head: ", head);
    if (existy(head)) {
        var rest = _.rest(arguments);
        //console.log("rest: ", rest);
        return head.concat.apply(head, rest); //concat.apply를 한것과 그냥 concat의 차이점은?
    }
    else {
        //console.log("else: ");
        return [];
    }
}
console.log("cat: ", cat([1, 2, 3], [4, 5], [6, 7, 8]));//=> [1, 2, 3, 4, 5, 6, 7, 8]

//아래 construct는 응용형 함수가 아니다. 인자로 받은 함수를 호출하지 않았음.
function construct(head, tail) {
    return cat([head], _.toArray(tail));
}

console.log("construct: ", construct(42, [1, 2, 3])); //=> [42, 1, 2, 3]

//응용형 함수
function mapcat(fun, coll) {
    return cat.apply(null, _.map(coll, fun));
}
console.log("mapcat: ", mapcat(function (each) { //=> [] [1, 2, 3] todo: 잘 모르겠음.
    return each + 1;
}), [1, 2, 3]);

function butLast(coll) {
    return _.toArray(coll).slice(0, -1);
}
console.log("butLast: ", butLast([2, 3, 4, 5])); //=> [2, 3, 4]

function interpose(inter, coll) { //todo: 잘 이해가 안됨
    return butLast(mapcat(function (e) {
            return construct(e, [inter]);
        },
        coll));
}
console.log("interpose: ", interpose(",", [1, 2, 3])); //=> [1, ",", 2, ",", 3]


var zombie = {name: "Bub", film: "Day of the Dead"};

console.info("_.keys: ", _.keys(zombie)); //=> ["name", "film"]
console.info("_.values: ", _.values(zombie));//=> ["Bub", "Day of the Dead"]
console.info("_.object: ", JSON.stringify(
        _.object(
            _.map(
                _.pairs( //array -> map object 형식으로 바꿈
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

//객체에 삽입하는 예제
console.info("_.pluck: ", _.pluck(
        _.map(
            [
                {title: "Chthon", author: "Anthony"},
                {title: "Grendel", author: "Gardner"},
                {title: "After Dark"} //여기 끝에 삽입하려고 함
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

//SQL select함수 구현
function project(table, keys) {
    return _.map(table, function (obj) {
        var pickParameters = construct(obj, keys); //[{"title":"SICP","isbn":"0262010771","ed":1},"title","isbn"]
        console.log(JSON.stringify(pickParameters));
        //return _.pick(construct(obj, keys)); //pick에서 array로 인자를 받지 않기 때문
        return _.pick.apply(null, pickParameters); //todo: 왜 apply를 하나? array로 넘겨주기 위해서임

    });
};
var editionResults = project(library, ['title', 'isbn']);
console.info("editionResults: ", JSON.stringify(editionResults));

var isbnResults = project(editionResults, ['isbn']);
console.info("isbnResults: ", JSON.stringify(isbnResults));

console.log("initValue: ", _.omit.apply(null, construct({a: 1, b: 2}, _.keys({'a': 'AAA'}))));
console.log("initValue: ", _.omit.apply(null, construct({a: 1, b: 2, c: 3, d: 4}, _.keys({'a': 'AAA'}))));
function rename(obj, newNames) {
    return _.reduce(
        newNames,
        function (prevObj, nuValue, oldKey) {
            console.log("o: ", prevObj, "newKeyInValue:", nuValue, "oldKey:", oldKey);
            if (_.has(obj, oldKey)) {
                prevObj[nuValue] = obj[oldKey]; //추가함
                return prevObj;
            }
            else {
                return prevObj;
            }
        },
        _.omit.apply(null, construct(obj, _.keys(newNames))) //첫 initValue => 'a'를 제외한 나머지로 시작함, {b: 2}
    );
};
console.info("rename: ", rename({a: 1, b: 2}, {'a': 'AAA'})); //=> {b: 2, AAA: 1}
console.info("rename: ", rename({a: 1, b: 2, c: 3, d: 4}, {'a': 'AAA'})); //=> {b: 2, c: 3, d: 4, AAA: 1}

function as(table, newNames) {
    return _.map(table, function (obj) {
        return rename(obj, newNames);
    });
};
console.info("as: ", JSON.stringify(as(library, {ed: 'edition'})));

//SQL의 where 함수 구현
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
};

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
