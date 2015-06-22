console.log("");
console.warn("Scope Test_________________________________________________________________________");

function foo() {
    console.log("a:", a); //=> a: 3 (not 2!)
}

function bar() {
    var a = 3;
    foo();
}

var a = 2;
bar();

