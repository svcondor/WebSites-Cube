namespace App2 {

  export class Tile {
    public tileIx: number;
    public color: TileColor;
    public color2: TileColor | null;
    public color3: TileColor | null;
    public mesh: BABYLON.Mesh;
    public pivot: BABYLON.Mesh;

    public toString = (): string => {
      let s1: string  = `${this.tileIx} ${this.color} ${this.color2} ${this.color3}`;
      return s1;
    }

    constructor(x: number, y: number, tileIx: number, scene: BABYLON.Scene | null) {
      this.tileIx = tileIx;

      let rect2: BABYLON.Mesh = BABYLON.MeshBuilder.CreatePlane("plane1", { size: 1 }, scene);
      rect2.rotation.y = Math.PI;
      rect2.position.z = +0.001;
      rect2.material = Cube.tileColors[TileColor.Black];

      let rect3 = BABYLON.MeshBuilder.CreatePlane("plane1", { size: 1 }, scene);
      rect3.position.z = + 0.001;
      rect3.material = Cube.tileColors[TileColor.Black];

      //var div = Math.floor(tileIx / 9);
      this.mesh = BABYLON.MeshBuilder.CreatePlane("tile", { size: 0.85 }, scene);
      this.mesh.position.x = x;
      this.mesh.position.y = y;
      this.mesh.position.z = -1.5; //  + div/10;

      //this.mesh.material = Cube.tileColors[div];
      this.pivot = new BABYLON.Mesh("pivot", scene);

      this.mesh.material = Cube.tileColors[TileColor.Gray];
      rect3.parent = this.mesh;
      rect2.parent = this.mesh;
      this.mesh.parent = this.pivot;
    }
  }
}
