"use strict";
var App2;
(function (App2) {
    class Tile {
        constructor(x, y, tileIx, scene) {
            this.toString = () => {
                let s1 = `${this.tileIx} ${this.color} ${this.color2} ${this.color3}`;
                return s1;
            };
            this.tileIx = tileIx;
            if (x === -100) {
                return;
            }
            let rect2 = BABYLON.MeshBuilder.CreatePlane("plane1", { size: 1 }, scene);
            rect2.rotation.y = Math.PI;
            rect2.position.z = +0.001;
            rect2.material = App2.Cube.tileColors[App2.TileColor.Black];
            let rect3 = BABYLON.MeshBuilder.CreatePlane("plane1", { size: 1 }, scene);
            rect3.position.z = +0.001;
            rect3.material = App2.Cube.tileColors[App2.TileColor.Black];
            this.mesh = BABYLON.MeshBuilder.CreatePlane("tile", { size: 0.85 }, scene);
            this.mesh.position.x = x;
            this.mesh.position.y = y;
            this.mesh.position.z = -1.5;
            this.pivot = new BABYLON.Mesh("pivot", scene);
            this.mesh.material = App2.Cube.tileColors[App2.TileColor.Gray];
            rect3.parent = this.mesh;
            rect2.parent = this.mesh;
            this.mesh.parent = this.pivot;
        }
    }
    App2.Tile = Tile;
})(App2 || (App2 = {}));
//# sourceMappingURL=Tile.js.map