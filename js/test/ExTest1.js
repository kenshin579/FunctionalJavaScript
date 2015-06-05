console.warn("Closure Example________________________________________________________");

//JavaScript에서는 내부 함수는 parent scope에 접근할 수 있다.
function add() {
    var counter = 0;

    function plus() {
        counter += 1; //count 접근이 가능함
    }

    plus();
    return counter;
}
console.info("add:", add());
console.info("add:", add());
console.info("add:", add());

var add = (function () {
    var counter = 0;
    return function () {
        return counter += 1;
    }
})();

//self-invoking 함수는 단 한번만 실행됨. 실행하고 return 값으로 함수 expression을 반환함
//- 그래서 counter는 한번만 zero로 세팅함
console.info("add:", add());
console.info("add:", add());
console.info("add:", add());


console.warn("fnull________________________________________________________");
//왜 reduce의 함수에서의 agruments 배열이 이해가 안됨
function existy(x) {
    return x != null
};

var nums = [1, 2, 3, null, 5];

function fnull(fun /*, defaults */) {
    var DEFAULTS = _.rest(arguments);
    console.log("   > arguments:", arguments);
    console.log("   > defaults:", DEFAULTS);

    return function (/* args */) { //safeMulti에서 넘겨온 arguments를 나타낸다.
        console.log("   + arguments:", arguments); //=> [1, 2, 1, Array[5]] todo: 왜 이렇게 arguments가 채워지나?

        //var args = _.map(arguments, function (e, i) {
        //    console.log("   > prev:", e, " curr:", i, " defaults:", DEFAULTS[i]);
        //    return existy(e) ? e : DEFAULTS[i]; //todo: 잘 이해가 안됨
        //}); //args를 새롭게 채워서 함수를 실행하도록 함

        //console.log("  = args:", args);
        //return fun.apply(null, args);
    };
};

var safeMult = fnull(function (total, n) {
    console.log("   => total:", total, " n:", n);
    return total * n
}, 1, 1);

console.log("safeMult:" + safeMult);
console.info("safeMult:", _.reduce(nums, safeMult)); //=> 30
console.info("safeMult:", _.reduce(nums, function () {
    console.log("  >=== arguments: ", arguments); //init, current, key, context
})); //=> 30
console.info("_.reduce: ", _.reduce([1, 2, 3, 4, 5], function (prevObj, value, key) {
    console.log("    > arguments:", arguments); //<=== 이렇게 호출이 됨
    console.log("    > prevObj: ", prevObj, "value:", value, "key:", key);
    //return previousValue + currentValue;
    return prevObj;
}, 2));