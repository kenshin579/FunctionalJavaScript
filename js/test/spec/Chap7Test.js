define([
    //"books/Chap1",
    //"books/Chap2",
    //"books/Chap3",
    //"books/Chap4",
    "books/Chap5",
    //"books/Chap6",
    "books/Chap7",
    "underscore"
], function (Chap5, Chap7, _) {
    describe("randString",
        function () {
            it("builds a string of lowercase ASCII letters/digits",
                function () {
                    console.log("test");
                });
        }
    );

    describe("_.map",
        function () {
            it("should return an array made from...",
                function () {
                    expect(_.map([1, 2, 3], sqr)).toEqual([1, 4, 9]);
                });
        }
    );
});
