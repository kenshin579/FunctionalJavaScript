var fortytwo = function () { return 42 };

fortytwo = [42, function () { return 42 }];

fortytwo = { number: 42, fun: function () { return 42 }};

fortytwo = { number: 42, fun: function () { return 42 }};

function weirdAdd(n, f) { return n + f()}
weirdAdd(42, function () { return 42 });
//=> 84

function returnFortyTwo() { return function () { return 42 };
}
returnFortyTwo()();
//=> 42

