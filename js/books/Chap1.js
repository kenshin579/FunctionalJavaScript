console.log("");
console.warn("Chap1_________________________________________________________________________");

//apply 메서드는 인자를 담은 배열 하나를 인자로 받음
function splat(fun) {
    return function (array) {
        return fun.apply(null, array);
    };
}
var addArrayElements = splat(function (x, y) {
    return x + y;
});
console.info("splat: ",  addArrayElements([1, 2]));
//=> 3

//call은 arguments list를 인자로 받음
function unsplat(fun) {
    return function () {
        return fun.call(null, _.toArray(arguments));
    };
}
var joinElements = unsplat(function (array) {
    return array.join(' ')
});
console.info("unsplat: ",  joinElements(1, 2));
//=> "1 2"
console.info(joinElements('-', '$', '/', '!', ':'));
//=> "- $ / ! :"


//1.2.2 함수 - 추상화 단위
function parseAgeV1(age) {
    if (!_.isString(age)) throw new Error("Expecting a string");
    var a;

    console.log("Attempting to parse an age");

    a = parseInt(age, 10);

    if (_.isNaN(a)) {
        console.log(["Could not parse age:", age].join(' '));
        a = 0;
    }

    return a;
}
console.info("parseAgeV1: ",  parseAgeV1("frob"));

//함수를 추상화 시킴:
//- 에러, 경고, 정보 출력 부분을 추상화 시킴
function fail(thing) {
    throw new Error(thing);
}
function warn(thing) {
    console.log(["WARNING:", thing].join(' '));
}
function note(thing) {
    console.log(["NOTE:", thing].join(' '));
}
function parseAgeV2(age) {
    if (!_.isString(age)) fail("Expecting a string");
    var a;

    note("Attempting to parse an age");
    a = parseInt(age, 10);

    if (_.isNaN(a)) {
        warn(["Could not parse age:", age].join(' '));
        a = 0;
    }

    return a;
}
console.info("parseAgeV2: ",  parseAgeV2("frob"));

//1.2.4 함수 - 동작 단위 (여러 동작으로
var letters = ['a', 'b', 'c'];
console.info("letters: ",  letters[1]);
//=> 'b'

//배열 인덱싱 동작을 추상화함
function naiveNth(a, index) {
    return a[index];
}
console.info("naiveNth: ",  naiveNth(letters, 2));
console.info("naiveNth: ",  naiveNth({}, 2)); //=> undefined으로 출력됨
function isIndexed(data) {
    return _.isArray(data) || _.isString(data);
}

function nth(a, index) {
    if (!_.isNumber(index)) fail("Expected a number as the index");
    if (!isIndexed(a)) fail("Not supported on non-indexed type");
    if ((index < 0) || (index > a.length - 1))
        fail("Index value is out of bounds");

    return a[index];
}
console.info("nth: ",  nth(letters, 1));
//console.info("nth: ",  nth(letters, 3));
//console.info("nth: ",  nth({}, 1));

//nth 이용해서 또 다른 함수 추상화를 만듬
function second(a) {
    return nth(a, 1);
}
console.info("second: ",  second(letters));

function compareLessThanOrEqual(x, y) {
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
}

console.info("compareLessThanOrEqual: ",  [2, 3, -1, -6, 0, -108, 42, 10].sort(compareLessThanOrEqual));
//=> [-108, -6, -1, 0, 2, 3, 10, 42]


//predicate(찬반형): 항상 boolean값을 반환하는 함수
function lessOrEqual(x, y) {
    return x <= y;
}
console.info("lessOrEqual: ",  [2, 3, -1, -6, 0, -108, 42, 10].sort(lessOrEqual));

//comparator는 -1/0/1중 하나는 변환하는 함수
function comparator(pred) {
    return function (x, y) {
        if (pred(x, y))
            return -1;
        else if (pred(y, x))
            return 1;
        else
            return 0;
    };
};
console.info("comparator: ",  [2, 3, -1, -6, 0, -108, 42, 10].sort(comparator(lessOrEqual)));

//1.2.5 데이터 추상화
//-comparator 함수처럼 함수형 프로그래밍에서는 하나의 데이터를 다른 형태의 데이터로 변환하는 것이 핵심이다
function lameCSV(str) { //=> [['name', 'age', 'hair'], ['Merble', 35, 'red'], ['Bob', 64, 'blonde']]
    //["name,age,hair", "Merble,35,red", "Bob,64,blonde"]
    return _.reduce(str.split("\n"), function (prevTable, currentRow) { //reduce는 하나의 값으로 return함
            prevTable.push(
                _.map(currentRow.split(","), function (c) { //map은 array를 return함
                    return c.trim(); //trim: 앞뒤로 whitespce를 제거함
                }) //_.map
            );
            return prevTable; //하나값이 table을 return함 reduce에서
        }
        , []); //_.reduce prevTable값을 []로 시작하게 함
};
var peopleTable = lameCSV("name,age,hair\nMerble,35,red\nBob,64,blonde");
console.info("lameCSV: ",  peopleTable);

console.info("_.rest: ",  _.isArray(peopleTable[1])); //=> true
console.info("_.rest: ",  peopleTable[1]); //=> [Merble,35,red]
console.info("_.rest: ",  _.rest(peopleTable)); //=> [[Merble,35,red],[Bob,64,blonde]]
console.info("_.rest.sort(): ",  _.rest(peopleTable).sort());

function selectNames(table) {
    return _.rest(_.map(table, _.first)); //todo: _.first 인자를 넘기지 않았음? 이건 어떻게 이해하면 되나?
}

function selectAges(table) {
    return _.rest(_.map(table, second)); //todo: second함수는 인자 하나를 받게 되어 있는 함수이다.
}

function selectHairColor(table) {
    return _.rest(_.map(table, function (row) { //row variable은 array의 각 element을 자동으로 map이 됨
        return nth(row, 2);
    }));
}
var mergeResults = _.zip;
//참고 peopleTable = [['name', 'age', 'hair'], ['Merble', 35, 'red'], ['Bob', 64, 'blonde']]
console.info("selectNames: ",  selectNames(peopleTable));
console.info("selectAges: ",  selectAges(peopleTable));
console.info("selectHairColor: ",  selectHairColor(peopleTable));
console.info("mergeResults: ",  mergeResults(selectNames(peopleTable), selectHairColor(peopleTable)));

/**
 * 뭔가 존재하는지 여부를 알려주는 함수
 * @param x
 * @returns {boolean}
 */
function existy(x) {
    return x != null
};

/**
 * 어떤 것이 참인지 여부를 결정하는 함수
 * @param x
 * @returns {boolean}
 */
function truthy(x) {
    return (x !== false) && existy(x)
};

//일반적인 형태의 패턴의 예
function doWhen(cond, action) {
    if (truthy(cond))
        return action();
    else
        return undefined;
}

function executeIfHasField(target, name) {
    return doWhen(existy(target[name]), function () {
        var result = _.result(target, name);
        console.log(['The result is', result].join(' '));
        return result;
    });
}
console.info("executeIfHasField: ",  executeIfHasField([1, 2, 3], 'reverse')); //[].reverse 함수 property가 존재함
console.info("executeIfHasField: ",  executeIfHasField({foo: 42}, 'foo')); //=>42
console.info("executeIfHasField: ",  executeIfHasField([1, 2, 3], 'notHere')); //=>undefined

