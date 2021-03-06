console.log("");
console.warn("Chap7_________________________________________________________________________");

var rand = partial1(_.random, 1);

//1~10까지 중에서 number
console.info("rand:", rand(10)); //=> 1
console.info("repeatedly:", repeatedly(10, partial1(rand, 10))); //=> [20]
console.info("repeatedly:", _.first(repeatedly(100, partial1(rand, 10)), 5));
//=> [19, 13, 8, 1, 13, 3, 19, 13, 7, 10]

function randString(len) {
    var ascii = repeatedly(len, partial1(rand, 26)); //1~26중에서

    return _.map(ascii, function (n) {
        return n.toString(36); //base 36으로 바꿈
    }).join('');
}

console.info("randString:", randString(0)); //=> ""
console.info("randString:", randString(1)); //=> "b"
console.info("randString:", randString(10)); //=> "fqoppcfnqa"

//7.1.1 순수성과 테스트의 관계

PI = 3.14;

function areaOfACircle(radius) {
    return PI * sqr(radius);
}
console.info("areaOfACircle:", areaOfACircle(3)); //=> 28.26

//7.1.2 순수성과 비순수성 구별하기
//- 순수성 함수는 주어진 입력값과 예상된 출력값 테이블을 이용해서 검장가능하다
function generateRandomCharacter() {
    return rand(26).toString(36);
}

function generateString(charGen, len) {
    return repeatedly(len, charGen).join('');
}

var composedRandomString = partial1(generateString, generateRandomCharacter);
console.info("composedRandomString:", composedRandomString(10)); //=> "j18obij1jc"

//7.1.3 비순수한 함수의 프로퍼티 테스트


//7.1.4 순수성
console.info("nth:", nth([{a: 1}, {b: 2}], 0));
console.info("nth:", nth([function () {
    console.log("blah");
}], 0));

//7.1.5 순수성과 멱등(idempotence)의 관계
//-멱등: 어떤 동작을 여러번 실행한 결과와 한번 실행한 결과가 같은 상항을 가리킨다

var a = [1, [10, 20, 30], 3];

var secondTwice = _.compose(second, second);
console.info("second은 멱등이 아니다.", second(a) === secondTwice(a)); //=> false

//7.2 불변성(immutability)
//-
var obj = {lemongrab: "Earl"};

(function (o) {
    _.extend(o, {lemongrab: "King"});
})(obj);

console.info("obj:", obj);

/**
 * 숫자 n과 배열을 인자로 주었을 때 매 n 번째 요소를 포함하는 배열을 반환하는 함수다
 *
 * @param n
 * @param coll
 * @returns {Array}
 */
function skipTake(n, coll) {
    var ret = [];
    var sz = _.size(coll);

    for (var index = 0; index < sz; index += n) {
        ret.push(coll[index]);
    }

    return ret;
}

console.info("skipTake:", skipTake(2, [1, 2, 3, 4]));
console.info("skipTake:", skipTake(3, _.range(20)));

//7.2.2 불변성과 재귀의 관계

/*
 지역 변이 변수: i, result
 - 함수형 프로그래밍 언어에서는 지역 변이를 이용해서 함수를 구현할 수 없다.
 ㅁ. 지역 변수의 값을 바꾸려면 콜 스택을 이요하는 수밖에 없고 그래서 재귀가 필요하다.
 */
function summ(ary) {
    var result = 0;
    var sz = ary.length;

    for (var i = 0; i < sz; i++)
        result += ary[i];

    return result;
}

console.info("summ:", summ(_.range(1, 11))); //=> 55

/**
 * todo: tail-recursive같은데, 왜 그런가?
 * - 재귀호출에서는 함수의 인자를 통해 상태와 변화가 괸리된다.
 *
 * @param ary
 * @param seed
 * @returns {*}
 */
function summRec(ary, seed) {
    if (_.isEmpty(ary))
        return seed;
    else
        return summRec(_.rest(ary), _.first(ary) + seed);
}

console.info("summRec:", summRec([], 0)); //=> 0
console.info("summRec:", summRec(_.range(1, 2), 0)); //=> 55
console.info("summRec:", summRec(_.range(1, 11), 0)); //=> 55

//7.2.3 방어적인 얼리기와 복제
//Object.freeze는 얕은 방식으로 freeze 시키는 문제점이 있다.
var a = [1, 2, 3];
a[1] = 42;
console.info("a:", a);
Object.freeze(a);
a[1] = 108;
console.info("a:", a);
console.info("isFrozen", Object.isFrozen(a)); //=> true

function deepFreeze(obj) {
    if (!Object.isFrozen(obj))
        Object.freeze(obj);

    for (var key in obj) {
        if (!obj.hasOwnProperty(key) || !_.isObject(obj[key]))
            continue;

        deepFreeze(obj[key]);
    }
}

//7.2.4 함수 수준에서 불변성 유지하기

/*
 freq는 a를 변화시키지 않는다. _.countBy, _.identity도 둘다 순수한 함수이기 때문에
 */
var freq = curry2(_.countBy)(_.identity);
var a = repeatedly(1000, partial1(rand, 3));
var copy = _.clone(a);
console.info("freq:", freq(a)); //=> {1: 327, 2: 340, 3: 333}

console.info("freq:", freq(skipTake(2, a)));

/*
 _.extend 함수는 순수한 함수가 아니다. 인자 목록의 첫번째 객체를 변이시킨다.
 */
var person = {fname: "Simon"};
console.info("_.extend:", _.extend(person, {lname: "Petrikov"}, {age: 28}, {age: 108}));
//=> {fname: "Simon", lname: "Petrikov", age: 108}

/**
 * 변이 되지 않도록 수정한 버전
 * todo: 적확하게 이해되지는 않는다. 왜 변의되지 않는지? 그리고 왜 construct를 사용했는지?
 * 답변: - cat() 함수에 있는 concat에서 새로운 array를 반환한다. cat은 불변성을 깨뜨지 않음
 * 의도는 {}<-이게 첫번째 인자가 되게 함
 */
function merge(/*args*/) {
    console.log("   merge: arguments> ", JSON.stringify(arguments));
    console.log("   merge: construct> ", JSON.stringify(construct({}, arguments)));
    return _.extend.apply(null, construct({}, arguments));
}
console.info("merge:", merge(person, {lname: "Petrikov"}, {age: 28}, {age: 108}));
//=> {fname: "Simon", lname: "Petrikov", age: 108}

//7.2.5 객체의 불변성 관찰
function Point(x, y) {
    this._x = x;
    this._y = y;
}

//객체 생성자를 비공개필드로 정의함
//- Point의 내부를 외부로 공개하지 않으면서도 필요한 기능을 제공하는 API를 만들 수 있다.
Point.prototype = {
    withX: function (val) {
        return new Point(val, this._y);
    },
    withY: function (val) {
        return new Point(this._x, val);
    }
};

var p = new Point(0, 1);
console.info("p:", p.withX(1000)); //=> {_x: 1000, _y: 1}
console.info("p:", p); //=> {_x: 0, _y: 1}

//chaining API도 만들 수 있다.
console.info("p:", (new Point(0, 1)).withX(100).withY(-100)); //=> {_x: 100, _y: -100}


function Queue(elems) {
    this._q = elems;
}

Queue.prototype = {
    enqueue: function (thing) {
        return new Queue(cat(this._q, [thing]));
    }
};

var seed = [1, 2, 3];
var q = new Queue(seed);
console.info("q:", JSON.stringify(q)); //=> {"_q":[1,2,3]}
seed.push(10000); //seed로 제공된 원래 값을 바꾸면 문제가 발생함
console.info("q:", JSON.stringify(q)); //=> {"_q":[1,2,3,10000]}

//복제를 사용해서 직접 값을 참조하지 못하도록 함
var SaferQueue = function (elems) {
    this._q = _.clone(elems);
}

/*
 cat을 이용하면 SafeQueue 인스턴스간에 참조를 공유하는 문제를 제거할 수 있다.
 */
SaferQueue.prototype = {
    enqueue: function (thing) {
        return new SaferQueue(cat(this._q, [thing]));
    }
};

seed = [1, 2, 3];
var saferQueue = new SaferQueue(seed);
var q2 = saferQueue.enqueue(36);
console.info("q2:", JSON.stringify(q2)); //=> {"_q":[1,2,3,36]}

seed.push(1000);
console.info("saferQueue:", JSON.stringify(saferQueue)); //=> {"_q":[1,2,3]}

saferQueue._q.push(-10000); //1.변경가능함
console.info("saferQueue:", JSON.stringify(saferQueue));

//SaferQueue.prototype.enqueue = sqr; //2.이번에도 변경가능함
//console.info("saferQueue:", q2.enqueue(42));

//7.2.6 객체는 대체로 저수준 동작이다.
q = SaferQueue([1, 2, 3]);
//console.info("q.enqueue(32):", q.enqueue(32)); //=> TypeError: Cannot read property 'enqueue' of undefined

//생성자 함수를 선호함
function queue() {
    return new SaferQueue(_.toArray(arguments));
}

//1.생성자 함수 방법
var q = queue(1, 2, 3);
console.info("q:", JSON.stringify(q)); //=> {_q: [1, 2, 3]}

//2.invoker 함수를 이용해서 enqueue로 위임할 함수를 만들 수 있다
var enqueue = invoker('enqueue', SaferQueue.prototype.enqueue);

console.info("enqueue:", JSON.stringify(enqueue(q, 42))); //=> {_q: [1, 2, 3, 42]}

//7.3 변화 제어 정책
function Container(init) {
    this._value = init;
};

/**
 *
 *
 * @type {{update: Function}}
 */
Container.prototype = {
    update: function (fun /*, args */) {
        var args = _.rest(arguments);
        var oldValue = this._value;
        console.log("   Container.update: oldValue:", oldValue, "args:", args);

        this._value = fun.apply(this, construct(oldValue, args));

        return this._value;
    }
};

var aNumber = new Container(42);
console.info("aNumber:", aNumber); //=> {_value: 42}
console.info("aNumber.update:", aNumber.update(function (n) {
    return n + 1
})); //=> 43
console.info("aNumber:", aNumber); //=> {_value: 43}

console.info("aNumber.update:", aNumber.update(function (n, x, y, z) {
    return n / x / y / z;
}, 1, 2, 3)); //=>  7.166666666666667

