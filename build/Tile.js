import { Cube, TileColor } from './Cube.js';
export class Tile {
    constructor(x, y, tileIx, scene) {
        this.toString = () => {
            const s1 = `${this.tileIx} ${this.color} ${this.color2} ${this.color3}`;
            return s1;
        };
        this.tileIx = tileIx;
        if (x === -100) {
            return;
        }
        const rect2 = BABYLON.MeshBuilder.CreatePlane("plane1", { size: 1 }, scene);
        rect2.rotation.y = Math.PI;
        rect2.position.z = +0.001;
        rect2.material = Cube.tileColors[TileColor.Black];
        const rect3 = BABYLON.MeshBuilder.CreatePlane("plane1", { size: 1 }, scene);
        rect3.position.z = +0.001;
        rect3.material = Cube.tileColors[TileColor.Black];
        this.mesh = BABYLON.MeshBuilder.CreatePlane("tile", { size: 0.85 }, scene);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = -1.5;
        this.pivot = new BABYLON.Mesh("pivot", scene);
        this.mesh.material = Cube.tileColors[TileColor.Gray];
        rect3.parent = this.mesh;
        rect2.parent = this.mesh;
        this.mesh.parent = this.pivot;
    }
}
//# sourceMappingURL=Tile.js.map