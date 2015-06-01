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