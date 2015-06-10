console.log("");
console.warn("Chap8_________________________________________________________________________");

//8.1 체이니
function createPerson() {
    var firstName = "";
    var lastName = "";
    var age = 0;

    return {
        setFirstName: function (fn) {
            firstName = fn;
            return this; //this를 return하기 때문에 chaining이 가능하다.
        },
        setLastName: function (ln) {
            lastName = ln;
            return this;
        },
        setAge: function (a) {
            age = a;
            return this;
        },
        toString: function () {
            return [firstName, lastName, age].join(' ');
        }
    };
}

console.info("createPerson:", createPerson()
    .setFirstName("Mike")
    .setLastName("Fogus")
    .setAge(108)
    .toString()); //=> "Mike Fogus 108"

var TITLE_KEY = 'title';

/*
 _.value 함수를 이용해서 명시적으로 감싼값을 요청하지 않았음에도 체인의 모든 호출이 실행됐다. 게이른 방식이었다면,
 _.value를 호출할때까지 체인의 어떤 호출도 실행되지 않았을 것이다.
 */
console.info("_.chain:",
    _.chain(library)
        .pluck(TITLE_KEY)
        .sort()
        .value()
); //=> ["Joy of Clojure", "SICP", "SICP"]

console.info("_.tap:", _.tap([1, 2, 3], note)); //=> [1,2,3]
console.info("_.tap:", _.tap([1, 2, 3], function () {
})); //=> [1,2,3]

//8.1.1 게이른 체인
function LazyChain(obj) {
    this._calls = [];
    this._target = obj;
}

/**
 * invoke는 실제 메서드 호출을 클로저로 감사서 _calls 배열에 추가한다.
 *
 * 단점: 수동으로 target을 넣어줘야 한다.
 *
 * @param methodName
 * @returns {LazyChain}
 */
LazyChain.prototype.invoke = function (methodName /*, args */) {
    var args = _.rest(arguments);

    this._calls.push(function (target) {
        var meth = target[methodName]; //todo: 왜 이렇게 해서 apply를 해야 하나?
        //console.log("meth:", target, "[", methodName, "]: ", meth);

        return meth.apply(target, args);
    });

    //console.log("this:", this);
    return this;
};

console.info("LazyChain.invoke:",
    new LazyChain([2, 1, 3]).invoke('sort')._calls); //=> [function(target)...]
//console.info("LazyChain.invoke:",
//    new LazyChain([2, 1, 3]).invoke('sort')._calls[0]()); //=> TypeError: Cannot read property 'sort' of undefined
console.info("LazyChain.invoke:",
    new LazyChain([2, 1, 3]).invoke('sort')._calls[0]([2, 1, 3])); //=>  [1, 2, 3]

/**
 * _.reduce함수로 중간 결과를 각 성크에 전달할 수 있도록 함
 *
 * @returns {*}
 */
LazyChain.prototype.force = function () {
    return _.reduce(this._calls, function (target, thunk) {
        return thunk(target);
    }, this._target);
};

console.info("LazyChain.prototype.force:",
    new LazyChain([2, 1, 3])
        .invoke('sort')
        .force()); //=> [1, 2, 3]

console.info("LazyChain.prototype.force:",
    new LazyChain([2, 1, 3])
        .invoke('concat', [9, 7, 6, 5])
        .invoke('sort')
        .invoke('join', ' ')
        .force()); //=> 1 2 3 5 6 7 9

LazyChain.prototype.tap = function (fun) {
    this._calls.push(function (target) {
        fun(target);
        return target;
    });

    return this;
}

console.info("LazyChain.prototype.tap:",
    new LazyChain([2, 1, 3])
        .invoke('concat', [9, 7, 6, 5])
        .invoke('sort')
        .tap(function (target) {
            console.log("target:", target);
        })
        .invoke('join', ' ')
        .force()); //=> 1 2 3 5 6 7 9

var deferredSort = new LazyChain([2, 1, 3])
    .invoke('sort')
    .tap(function (target) {
        console.log("target:", target);
    });

console.info("deferredSort:", deferredSort);

/**
 * LazyChain은 성큰 배열이므로 다른 LazyChain의 인자로 자신이 제공되었을 때 배열을 연결하도록 생성자를 고칠 수 있다.
 *
 * @param obj
 * @constructor
 */
function LazyChainChainChain(obj) {
    var isLC = (obj instanceof LazyChain);

    this._calls = isLC ? cat(obj._calls, []) : [];
    this._target = isLC ? obj._target : obj;
}

LazyChainChainChain.prototype = LazyChain.prototype;

console.info("LazyChainChainChain:",
    new LazyChainChainChain(deferredSort)
        .invoke('toString')
        .force()); //=> 1,2,3

/*
 8.1.2 프로미스
 참고:
 - http://joseoncode.com/2011/09/26/a-walkthrough-jquery-deferred-and-promise/
 - http://www.html5rocks.com/ko/tutorials/async/deferred/
 */
var longing = $.Deferred();
//실행되지 않은 동작의 핸들이 객체로 반환된다.
console.info("longing:", longing.promise()); //=> Object

//현재 멈춘 상태
console.info("longing:", longing.promise().state()); //=> pending

//todo: 아래 무슨 의미 인지 잘 모름.
console.info("longing:", longing.resolve("<3"));
console.info("longing:", longing.promise().state()); //=> resolved

console.info("longing:", longing.promise().done(note));
//=>
//NOTE: <3
//Chap8.js:172 longing: Object {}

/**
 * $.when 함수를 이용해서 프로미스 체인이 시작되게 만듬.
 * todo: 잘 이해 안됨.
 * - Deferred 인스턴스에 resolve가 호출되면서 프로미스가 처리된다.
 *
 * @returns {*}
 */
function go() {
    var d = $.Deferred();

    $.when("")
        .then(function () {
            setTimeout(function () {
                console.log("sub-task 1");
            }, 5000)
        })
        .then(function () {
            setTimeout(function () {
                console.log("sub-task 2");
            }, 10000)
        })
        .then(function () {
            setTimeout(function () {
                d.resolve("done done done done");
            }, 15000)
        })

    return d.promise();
}

var yearning = go().done(note);
console.info("yearning:", yearning.state());

//8.1 파이프라이닝
/**
 *
 * @param seed
 * @returns {*}
 */
function pipeline(seed /*, args */) {
    return _.reduce(_.rest(arguments),
        function (l, r) {
            return r(l);
        },
        seed);
};

console.info("pipeline:",
    pipeline([2, 3, null, 1, 42, false],
        _.compact,
        _.initial,
        _.rest,
        rev)); //=> [1, 3]

//중첩 호출로 표한한다면:
console.info(rev(_.rest(_.initial(_.compact([2, 3, null, 1, 42, false])))));
console.info("pipeline:", pipeline()); //undefined
console.info("pipeline:", pipeline(42)); //=> 42
console.info("pipeline:", pipeline(42, function (n) {
    return -n;
})); //=> -42

function fifth(a) {
    return pipeline(a
        , _.rest
        , _.rest
        , _.rest
        , _.rest
        , _.first);
}
console.info("fifth:", fifth([1, 2, 3, 4, 5])); //=> 5

function negativeFifth(a) {
    return pipeline(a
        , fifth
        , function (n) {
            return -n
        });
}
console.info("negativeFifth:", negativeFifth([1, 2, 3, 4, 5, 6, 7, 8, 9])); //=> -5

//pipeline은 유연한 API를 만드는데 잘 활용할 수 있다.
/**
 *
 * @param table
 * @returns {*}
 */
function firstEditions(table) {
    return pipeline(table,
        function (t) {
            return as(t, {ed: 'edition'})
        },
        function (t) {
            return project(t, ['title', 'edition', 'isbn'])
        },
        function (t) {
            return restrict(t, function (book) {
                return book.edition === 1;
            });
        });
}

library = [
    {title: "SICP", isbn: "0262010771", ed: 1},
    {title: "SICP", isbn: "0262510871", ed: 2},
    {title: "Joy of Clojure", isbn: "1935182641", ed: 1}
];

console.info("firstEditions:", JSON.stringify(firstEditions(library)));

//pipeline은 삽입되는 함수가 인자를 하나만 가질 수 있다는 점이 문제다

var RQL = {
    select: curry2(project),
    as: curry2(as),
    where: curry2(restrict)
};

function allFirstEditions(table) {
    return pipeline(table,
        RQL.as({ed: 'edition'}),
        RQL.select(['title', 'edition', 'isbn']),
        RQL.where(function (book) {
            return book.edition === 1;
        }));
}

console.info("allFirstEditions:", JSON.stringify(allFirstEditions(library)));

//8.3 데이터 흐름과 제어 흐름
console.info("pipeline:", pipeline(42,
    sqr,
    note, //undefined로 모양이 바뀌면서 에러가 발생한다.
    function (n) {
        return -n;
    })); //=> NaN

function negativeSqr(n) {
    var s = sqr(n);
    note(n);
    return -s;
}

console.info("negativeSqr:", negativeSqr(42));

//8.3.1 공통 모양 찾기
/**
 * actions 함수는 인자로 받은 seed 값을 가지고 여러 acts함수를 실행해서 결과값을 values array에 담아서 반환한다.
 * - 중간에 null이 값들을 filter한다.
 * - 마지막에 done 함수를 실행한다.
 *
 * @param acts
 * @param done
 * @returns {Function}
 */
function actions(acts, done) {
    return function (seed) {
        var init = {values: [], state: seed};

        var intermediate = _.reduce(acts, function (stateObj, action) {
            var result = action(stateObj.state);
            var values = cat(stateObj.values, [result.answer]);

            return {values: values, state: result.state};
        }, init);

        var keep = _.filter(intermediate.values, existy);

        return done(keep, intermediate.state);
    };
}

/**
 * sqr함수는 state 객체를 모르므로 mSqr이라는 adapter 함수를 만들어야 한다.
 * todo: 왜? okay
 *
 * @returns {Function}
 */
function mSqr() {
    return function (state) {
        var ans = sqr(state);
        return {answer: ans, state: ans};
    }
}

var doubleSquareAction = actions(
    [
        mSqr(),
        mSqr()
    ],
    function (values) {
        return values;
    });

console.info("doubleSquareAction:", doubleSquareAction(10)); //=> [100, 10000]

function mNote() {
    return function (state) {
        note(state);
        return {answer: undefined, state: state};
    }
}

function mNeg() {
    return function (state) {
        return {answer: -state, state: -state};
    }
}

var negativeSqrAction = actions([mSqr(), mNote(), mNeg()],
    function (_, state) { //todo: _은 왜 필요한가?
        console.log("_:", _, "state:", state); //=> _: [81, -81] state: -81
        return state;
    });

console.info("negativeSqrAction:", negativeSqrAction(9));
//=>
//NOTE: 81
//-81

//8.3.2 단순하게 액션을 만들게 하는 함수

/**
 * lift 함수를 이용해서 actions의 중간 상황을 표현하는 state 객체 관리를 추상화한다
 * - curry 함수임
 *
 * - 위의 mNeg, mSqr를 추상화 시킨 함수임
 *
 * @param answerFun
 * @param stateFun
 * @returns {Function}
 */
function lift(answerFun, stateFun) {
    return function (/* args */) {
        var args = _.toArray(arguments);

        return function (state) {
            var ans = answerFun.apply(null, construct(state, args));
            var s = stateFun ? stateFun(state) : ans;

            return {answer: ans, state: s};
        };
    };
};

var mSqr2 = lift(sqr);

//note의 결과는 명확한 상태값(undefined)이 아니므로 note에서는 결과를 통과시키도록 _.identity를 이용함
var mNote2 = lift(note, _.identity);
var mNeg2 = lift(function (n) {
    return -n
});

var negativeSqrAction2 = actions([mSqr2(), mNote2(), mNeg2()],
    function (_, state) { //done 함수
        return state;
    });

console.info("negativeSqrAction2:", negativeSqrAction2(100));
//=>
//NOTE: 10000
//-10000

//stackAction을 구현할 수 있음.
var push = lift(function (stack, e) {
    return construct(e, stack)
});

var pop = lift(_.first, _.rest);

var stackAction = actions([
        push(1),
        push(2),
        pop()
    ],
    function (values, state) {
        return values;
    });

console.info("stackAction:", JSON.stringify(stackAction([]))); //=> [[1],[2,1],2]

console.info("pipeline:", pipeline(
    [],
    stackAction,
    _.chain) //todo: <== 이 부분 이해 안됨
    .each(function (elem) {
        console.log("elem:", elem);
    }
));