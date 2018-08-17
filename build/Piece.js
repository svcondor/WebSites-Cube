"use strict";
var App2;
(function (App2) {
    class Piece {
        constructor(color1, color2 = App2.TileColor.none, color3 = App2.TileColor.none, ix1, ix2 = 0, ix3 = 0) {
            this.color1 = color1;
            this.color2 = color2;
            this.color3 = color3;
            this.ix1 = ix1;
            this.ix2 = ix2;
            this.ix3 = ix3;
            if (color2 === null)
                color2 = App2.TileColor.none;
            if (color3 === null)
                color3 = App2.TileColor.none;
        }
    }
    App2.Piece = Piece;
})(App2 || (App2 = {}));
//# sourceMappingURL=Piece.js.map