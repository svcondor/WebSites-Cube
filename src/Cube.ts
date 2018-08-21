namespace App2 {

  export enum TileColor {
    Blue = 0,
    Orange = 1,
    Green = 2,
    Red = 3,
    White = 4,
    Yellow = 5,
    Gray = 6,
    Black = 7,
    none = 8,
  }

  export enum CubeFace {
    F = 0,
    R = 1,
    B = 2,
    L = 3,
    U = 4,
    D = 5
  }

  export class Cube {
    private renderCount: number = 0;
    public gameStartTime: number = 0;
    //public gameStarted = false;
    public gameTimer: number | null = null;
    public gameTime: number = 0;
    //public movesCount: number = 0;
    public movesPendingQueue: string[] = [];
    public movesSentQueue: string[] = [];
    private sendSpeed: number = 200;
    public doneMoves: string[] = [];
    public redoMoves: string[] = [];
    public static tiles: Tile[];
    private clockMoves: number[][];
    private antiMoves: number[][];
    private mouseMoves: string[][];
    private sidePieces: Piece[];
    private cornerPieces: Piece[];
    public moveCodes: string = "ULFRBDYXZMES";
    // special moveCodes
    // G change speed
    // H solver message
    // IJKL NOPQRST
    //TODO change TS to YXZ
    private residualMoves: string = "";
    private pivotList: BABYLON.Mesh[];  //    Array<BABYLON.Mesh>;
    public currentAngle: number = 0;
    public targetAngle: number = 0;
    public startTime: number;
    public moveSpeed: number = 200;  // was 400
    public mainSpeed: number = 200;
    private scene: BABYLON.Scene;
    private rect4: BABYLON.Mesh;
    private axis: BABYLON.Vector3;
    private tile1: Tile;
    public static tileColors: { [color1: number]: BABYLON.StandardMaterial; } = {};
    private engine: BABYLON.Engine;
    public solver: Solver;

    constructor(scene: BABYLON.Scene, engine: BABYLON.Engine) {
      this.scene = scene;
      this.engine = engine;
      // solver new Solver
      //this.pivot1 = new BABYLON.Mesh("pivot1", this.scene);
      Cube.tiles = new Array(54);
      this.buildTileColorTable();
      this.buildTables();

      this.drawFace(CubeFace.F);
      this.rotateImage("Y ");
      this.drawFace(CubeFace.R);
      this.rotateImage("Y ");
      this.drawFace(CubeFace.B);
      this.rotateImage("Y ");
      this.drawFace(CubeFace.L);
      this.rotateImage("Y ");
      this.rotateImage("X'");
      this.drawFace(CubeFace.U);
      this.rotateImage("X ");
      this.rotateImage("X ");
      this.drawFace(CubeFace.D);
      this.rotateImage("X'");
      this.resetTileColors();
    }

    //public renderNew(angle: number, axis: BABYLON.Vector3, speed: number) {
    //pivot table
    //}

    /**
     * Repeatedly called by BABYLON to redraw cube if necessary
     */
    public renderScene(): void {

      if (this.targetAngle === 0) {
        if ( this.movesSentQueue.length === 0) {
          if (this.solver) {
          let solved = this.solver.checkSolved();
          if (solved && this.doneMoves.length > 2) {
            this.solver.solverMsg(`Cube is Solved!`);
            this.sendMoves("X Z X'Y H ", true, 100);
          }
          }
        }
        else if (this.movesSentQueue.length > 0) {
          let move = this.movesSentQueue[0];
          if (move === "''" || move === "") {
            this.movesSentQueue.shift();
            this.scene.render();
            return;
          }
          else if (move.substr(0, 1) === "G") {
            this.sendSpeed = parseInt(move.substr(1, 3), 10);
            this.movesSentQueue.shift();
            return;
          }
          else if (move.substr(0, 1) === "H") {
            this.resetGame();
            this.movesSentQueue.shift();
            return;
          }

          this.rotateTable(move, this.sendSpeed);

          // if (this.sendSpeed !== 0) {
          //   if (this.gameStarted) {
          //     let s2 = document.getElementById("ScoreBox");
          //     let elapsed: number = (Math.floor(new Date().valueOf())) - this.gameStartTime;
          //     let mins = Math.floor(elapsed /  60);
          //     let seconds = elapsed - mins * 60;
          //     s2.innerText = `${this.doneMoves.length.toString()} ${mins}:${seconds}`;
          //   }
          //   else {
          //     let s2 = document.getElementById("ScoreBox");
          //     s2.innerText = `${this.doneMoves.length.toString()}`;
          //   }
          // }

          // logic from rotateTable
          if (this.gameTimer === null) {
            if (move.charAt(0) !== "X" && move.charAt(0) !== "Y" && move.charAt(0) !== "Z") {
              this.gameStartTime = Math.floor(new Date().valueOf() / 1000);
              this.gameTimer = setInterval(() => {
                let currentTime = Math.floor(new Date().valueOf() / 1000)
                  - this.gameStartTime;
                if (currentTime > this.gameTime) {
                  this.gameTime = currentTime;
                  let s2 = document.getElementById("ScoreBox");
                  let mins = Math.floor(currentTime /  60);
                  let seconds =  100 + currentTime - mins * 60;
                  s2.innerText = `${this.doneMoves.length.toString()} ${mins}:${seconds.toString().substr(1)}`;
                    }
              }, 100);
            }
          }

        }
      }
      if (this.targetAngle !== 0) {
        let t1 = new Date().valueOf() - this.startTime;
        let t2 = this.moveSpeed;
        let newAngle = 90 * t1 / t2;
        let increment: number;
        if (this.targetAngle > 0) {
          increment = newAngle - this.currentAngle;
          if (increment > 10) console.log(`Pos ${t2} ${t1} ${newAngle} ${increment}`);
          if (this.currentAngle + increment >= this.targetAngle) {
            increment = this.targetAngle - this.currentAngle;
            this.targetAngle = 0;
          }
        }
        else {
          increment = - newAngle - this.currentAngle;
          // console.log(`Neg ${t2} ${t1} ${newAngle} ${this.currentAngle} ${increment}`); //
          //increment *= -1;
          if (this.currentAngle + increment <= this.targetAngle) {
            increment = this.targetAngle - this.currentAngle;
            this.targetAngle = 0;
          }
        }
        this.currentAngle += increment;
        let rads = increment * Math.PI / 180;
        for (let i = 0; i < this.pivotList.length; ++i) {
          this.pivotList[i].rotate(this.axis, rads, BABYLON.Space.WORLD);
        }
        if (this.targetAngle === 0) {
          let v1 = this.movesSentQueue.shift();
        }
        this.scene.render();
      }
    }

    // get Tile by index (0-53) or by face (0-5) and tile (0-8)
    public static getTile(face: number | CubeFace, ix?: number): Tile {
      let ix1: number;
      if (ix || ix === 0) {
        ix1 = face * 9 + ix;
      }
      else {
        ix1 = face;
      }
      return Cube.tiles[ix1];
    }

    public mouseGetTile(event: PointerEvent): number {
      let pickResult = this.scene.pick(event.clientX, event.clientY);

      if (pickResult.pickedMesh != null) {
        let mesh1 = pickResult.pickedMesh;
        if (mesh1.name === "tile") {

          let tile1Ix = -1;
          for (let i = 0; i < Cube.tiles.length; ++i) {
            if (Cube.tiles[i].mesh === mesh1) {
              if (i < 0 || (i >= 18 && i < 36) || i >= 45) {
                return -1;
              }
              return i;
            }
          }
        }
      }
      return -1;
    }

    private buildTileColorTable(): void {
      let sm1 = new BABYLON.StandardMaterial("BlueMat", this.scene);
      sm1.emissiveColor = new BABYLON.Color3(0, 0, 1);
      Cube.tileColors[TileColor.Blue as number] = sm1;
      sm1 = new BABYLON.StandardMaterial("OrangeMat", this.scene);
      sm1.emissiveColor = new BABYLON.Color3(.9, .67, 0);   //2, 1.5, 0
      Cube.tileColors[TileColor.Orange as number] = sm1;
      sm1 = new BABYLON.StandardMaterial("GreenMat", this.scene);
      sm1.emissiveColor = new BABYLON.Color3(0, 1, 0);
      Cube.tileColors[TileColor.Green] = sm1;
      sm1 = new BABYLON.StandardMaterial("RedMat", this.scene);
      sm1.emissiveColor = new BABYLON.Color3(2, 0, 0);
      Cube.tileColors[TileColor.Red] = sm1;
      sm1 = new BABYLON.StandardMaterial("WhiteMat", this.scene);
      sm1.emissiveColor = new BABYLON.Color3(2, 2, 2);
      Cube.tileColors[TileColor.White] = sm1;
      sm1 = new BABYLON.StandardMaterial("YellowMat", this.scene);
      sm1.emissiveColor = new BABYLON.Color3(2, 2, 0);
      Cube.tileColors[TileColor.Yellow] = sm1;
      sm1 = new BABYLON.StandardMaterial("GrayMat", this.scene);
      sm1.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      Cube.tileColors[TileColor.Gray] = sm1;
      sm1 = new BABYLON.StandardMaterial("BlackMat", this.scene);
      sm1.diffuseColor = new BABYLON.Color3(1, 1, 1);
      Cube.tileColors[TileColor.Black] = sm1;
    }

    private buildTables(): void {
      this.clockMoves = [
        [27, 27, 27, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, 2, 4, 6, -2, 200, 2, -6, -4, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [45, 0, 0, 45, 0, 0, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 0, 0, 16, 0, 0, 10, 2, 4, 6, -2, 0, 2, -6, -4, -2, -36, 0, 0, -36, 0, 0, -36, 0, 0, -19, 0, 0, -25, 0, 0, -31, 0, 0],
        [2, 4, 6, -2, 200, 2, -6, -4, -2, 38, 0, 0, 34, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 11, 0, 0, 7, 0, 0, 0, 0, 0, 0, -33, -31, -29, -16, -14, -12, 0, 0, 0, 0, 0, 0],
        [0, 0, 36, 0, 0, 36, 0, 0, 36, 2, 4, 6, -2, 200, 2, -6, -4, -2, 35, 0, 0, 29, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -14, 0, 0, -20, 0, 0, -26, 0, 0, -45, 0, 0, -45, 0, 0, -45],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 0, 23, 0, 0, 21, 2, 4, 6, -2, 0, 2, -6, -4, -2, 24, 0, 0, 22, 0, 0, 20, 0, 0, -3, -7, -11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -34, -38, -42],
        [0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, -27, -27, -27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, -2, 200, 2, -6, -4, -2],
        [27, 27, 27, 27, 27, 27, 27, 27, 27, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, 2, 4, 6, -2, 200, 2, -6, -4, -2, 6, 2, -2, 4, 200, -4, 2, -2, -6],
        [36, 36, 36, 36, 36, 36, 36, 36, 36, 2, 4, 6, -2, 200, 2, -6, -4, -2, 35, 33, 31, 29, 27, 25, 23, 21, 19, 6, 2, -2, 4, 200, -4, 2, -2, -6, -10, -12, -14, -16, -18, -20, -22, -24, -26, -45, -45, -45, -45, -45, -45, -45, -45, -45],
        [2, 4, 6, -2, 200, 2, -6, -4, -2, 38, 40, 42, 34, 36, 38, 30, 32, 34, 6, 2, -2, 4, 0, -4, 2, -2, -6, 11, 13, 15, 7, 9, 11, 3, 5, 7, -25, -23, -21, -29, -27, -25, -33, -31, -29, -16, -14, -12, -20, -18, -16, -24, -22, -20],
        [0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 0, 27, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -12, 0, 0, -18, 0, 0, -24, 0, 0, -45, 0, 0, -45, 0, 0, -45, 0],
        [0, 0, 0, 27, 27, 27, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 36, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 9, 0, 0, 5, 0, 0, 0, 0, -29, -27, -25, 0, 0, 0, 0, 0, 0, -20, -18, -16, 0, 0, 0]

      ];
      this.antiMoves = new Array(12);
      for (let i = 0; i < 12; ++i) {
        let print1 = "";
        this.antiMoves[i] = new Array(54);
        for (let j = 0; j < 54; ++j) {
          if (this.clockMoves[i][j] === 200) {
            this.antiMoves[i][j] = 200;
          }
          else if (this.clockMoves[i][j] === 0) {
            this.antiMoves[i][j] = 0;
          }
          else if (this.clockMoves[i][j] !== 0) {
            let j1 = j + this.clockMoves[i][j];
            let j2 = j1 + this.clockMoves[i][j1];  // 180
            let j3 = j2 + this.clockMoves[i][j2];  // 270
            let j4 = j3 + this.clockMoves[i][j3];  // 360
            let a3 = this.clockMoves[i][j3];
            if (j4 !== j) {
              throw new Error("error in table clockMoves");
            }
            this.antiMoves[i][j] = j3 - j;
          }
          //print1 += `${this.antiMoves[i][j]},`;
        }
        //console.log(print1);
      }
      this.sidePieces = [
        new Piece(TileColor.Blue, TileColor.White, null, 1, 43),
        new Piece(TileColor.Blue, TileColor.Orange, null, 5, 12),
        new Piece(TileColor.Blue, TileColor.Yellow, null, 7, 46),
        new Piece(TileColor.Blue, TileColor.Red, null, 3, 32),
        new Piece(TileColor.Orange, TileColor.White, null, 10, 41),
        new Piece(TileColor.Orange, TileColor.Green, null, 14, 21),
        new Piece(TileColor.Orange, TileColor.Yellow, null, 16, 50),
        new Piece(TileColor.Green, TileColor.White, null, 19, 37),
        new Piece(TileColor.Green, TileColor.Red, null, 23, 30),
        new Piece(TileColor.Green, TileColor.Yellow, null, 25, 52),
        new Piece(TileColor.Red, TileColor.White, null, 28, 39),
        new Piece(TileColor.Red, TileColor.Yellow, null, 34, 48)];
      this.cornerPieces = [
        new Piece(TileColor.Blue, TileColor.Red, TileColor.White, 0, 29, 42),
        new Piece(TileColor.Blue, TileColor.White, TileColor.Orange, 2, 44, 9),
        new Piece(TileColor.Blue, TileColor.Yellow, TileColor.Red, 6, 45, 35),
        new Piece(TileColor.Blue, TileColor.Orange, TileColor.Yellow, 8, 15, 47),
        new Piece(TileColor.Green, TileColor.Orange, TileColor.White, 18, 11, 38),
        new Piece(TileColor.Green, TileColor.White, TileColor.Red, 20, 36, 27),
        new Piece(TileColor.Green, TileColor.Yellow, TileColor.Orange, 24, 53, 17),
        new Piece(TileColor.Green, TileColor.Red, TileColor.Yellow, 26, 33, 51)];
    }

    private drawFace(cubeFace: CubeFace): void {
      let tileIx: number = cubeFace as number * 9;
      for (let y = 1; y >= -1; --y) {
        for (let x = -1; x <= 1; ++x) {
          if (y === 1 && x === 5) {
            let a1 = 1;
          }
          else {
            let tile1: Tile = new Tile(x, y, tileIx, this.scene);
            Cube.tiles[tileIx] = tile1;
          }
          ++tileIx;
        }
      }
    }

    private rotateImage(move: string) {
      let count: number = 0;
      let angle: number = 90;
      if (move.length > 1 && move.substr(1, 1) === "'") {
        angle = -90;
      }
      let axis: BABYLON.Vector3 = BABYLON.Axis.Z;
      switch (move.substr(0, 1)) {
        case "Y":
          axis = BABYLON.Axis.Y;
          break;
        case "X":
          axis = BABYLON.Axis.X;
          break;
        default:
          throw new Error("Move must be X or Y");
        //TODO why not handle Z
      }
      for (let item of Cube.tiles) {
        if (item != null && item.pivot != null) {
          item.pivot.rotate(axis, angle * Math.PI / 180, BABYLON.Space.WORLD);
          ++count;
        }
      }
      //console.log("Rotate Count ={0}", count);
    }

    public scramble(): void {
      //this.resetTileColors();
      //let seed1 = Math.floor(Math.random() * 6);
      //console.debug("Random Seed ", seed1);
      //var random1 = new Random(seed1);
      let moves = "";
      for (let i = 0; i < 20; ++i) {
        let move1 = Math.floor(Math.random() * 6);

        //let move1 = random1.nextInt32([0, 6]);
        moves += this.moveCodes.charAt(move1) + " ";
        // this.rotateTable(this.moveCodes.charAt(move1) + " ", true, 0);
      }
      // moves = "UUBFUBFBDFLUFBURBRLFLDDDULRBFULBRBUUUFUD";
      //this.sendMoves(moves, true, 100);
      this.sendMoves(moves, true, 0);
      this.sendMoves("X Z X'Y H ", true, 100);

      // for (let i = 0; i < moves.length; ++i) {
      //   let move1 = moves.charAt(i) + " ";
      //   this.sendMoves(move1);
      //   this.rotateTable(move1, 0);
      //   // this.scene.render();
      // }
      this.doneMoves.length = 0;
      //this.movesCount = 0;
      this.redoMoves.length = 0;
      clearInterval(this.gameTimer);
      this.gameTimer = null;
      let s2 = document.getElementById("ScoreBox");
      //s2.innerText = this.movesCount.toString();
      s2.innerText = this.doneMoves.length.toString();
      // console.log(moves);
    }

    public resetTileColors(): void {
      let color: TileColor = TileColor.Gray;
      for (let i = 0; i < 6; ++i) {
        switch (i) {
          case 0: color = TileColor.Blue; break;
          case 1: color = TileColor.Orange; break;
          case 2: color = TileColor.Green; break;
          case 3: color = TileColor.Red; break;
          case 4: color = TileColor.White; break;
          case 5: color = TileColor.Yellow; break;
        }
        for (let j = 0; j < 9; ++j) {
          let tile1: Tile = Cube.tiles[i * 9 + j];
          if (tile1 != null) {
            tile1.color = color;
            tile1.mesh.material = Cube.tileColors[color];

            tile1.color2 = TileColor.none;
            tile1.color3 = TileColor.none;
            if (tile1.tileIx !== (i * 9 + j)) {
              //console.log(`tileIx error Tile ${i * 9 + j} tileIx ${tile1.tileIx}`);
            }
          }
        }
      }
      this.setAdjacentColors();
      this.resetGame();
    }

    public resetGame() {
      this.doneMoves.length = 0;
      this.redoMoves.length = 0;
      //this.movesCount = 0;
      clearInterval(this.gameTimer);
      this.gameTimer = null;
      let s2 = document.getElementById("ScoreBox");
      //s2.innerText = this.movesCount.toString();
      s2.innerText = this.doneMoves.length.toString();
      if (this.solver) {
        this.solver.reset();
      }
    }

    private setAdjacentColors(): void {
      for (let i = 0; i < this.sidePieces.length; ++i) {
        let sp1: Piece = this.sidePieces[i];
        let tile: Tile = Cube.getTile(sp1.ix1);
        console.assert(tile.color === sp1.color1, "SidePiece wrong color");
        tile.color2 = sp1.color2;
        tile = Cube.getTile(sp1.ix2);
        console.assert(tile.color === sp1.color2, "SidePiece wrong color");
        tile.color2 = sp1.color1;
      }
      for (let i = 0; i < this.cornerPieces.length; ++i) {
        let sp1: Piece = this.cornerPieces[i];
        let tile: Tile = Cube.getTile(sp1.ix1);
        console.assert(tile.color === sp1.color1, "CornerPiece wrong color");
        tile.color2 = sp1.color2;
        tile.color3 = sp1.color3;
        tile = Cube.getTile(sp1.ix2);
        console.assert(tile.color === sp1.color2, "CornerPiece wrong color");
        tile.color2 = sp1.color3;
        tile.color3 = sp1.color1;
        tile = Cube.getTile(sp1.ix3);
        console.assert(tile.color === sp1.color3, "CornerPiece wrong color");
        tile.color2 = sp1.color1;
        tile.color3 = sp1.color2;
      }
    }



    /**
     * enque moves and optionally execute them
     * @param moves Even string of 0 or more moves eg F U' L R'
     * @param execute 
     * true start move now  
     * false(default)  wait for more moves
     * @param speed rotation speed 
     */
    public sendMoves(moves: string, execute = false, speed = 200) {
      if (moves.length % 2 === 1) {
        console.assert(moves.length % 2 !== 1, "Bad input to sendMoves");
      }
      let queue = this.movesPendingQueue;
      for (let i = 0; i < moves.length; i += 2) {
        queue.push(moves.substr(i, 2));
      }
      if (execute) {
        let speed1 = String(speed + 1000);
        this.movesSentQueue.push("G" + speed1.substr(1, 3));
        //TODO DONE UUUU->remove UUU->U-  Remember moves for ReDo
        for (let i = 0; i < queue.length; ++i) {
          let move = queue[i];
          if (queue.length > i + 2
            && queue[i + 1] === move
            && queue[i + 2] === move) {
            if (queue.length > i + 3
              && queue[i + 3] === move) {
              i += 3;
            }
            else {
              if (move.substr(1, 1) === "'") {
                this.movesSentQueue.push(move.substr(0, 1) + " ");
              }
              else {
                this.movesSentQueue.push(move.substr(0, 1) + "'");
              }
              i += 2;
            }
          }
          else if (queue.length > i + 1
            && move.substr(0, 1) === queue[i + 1].substr(0, 1)
            && move.substr(1, 1) !== queue[i + 1].substr(1, 1)) {
            i += 1;
          }
          else {
            this.movesSentQueue.push(move);
          }
        }
        queue.length = 0;
        this.sendSpeed = speed;
      }
    }


    private rotateTable(move: string, speed: number): void {
      //let moveCount = 1;
      if (move.length !== 2) {
        console.assert(move.length === 2, `cube.rotateTable move.length != 2`);
      }

      if (this.targetAngle !== 0) {
        let v1 = 0;
      }

      this.pivotList = this.rotateTable1(move, Cube.tiles);

      let lastMove = "  ";
      if (this.doneMoves.length > 0) {
        lastMove = this.doneMoves[this.doneMoves.length - 1];
      }
      if (lastMove.charAt(0) === move.charAt(0)
        && lastMove.charAt(1) !== move.charAt(1)) {
        this.doneMoves.pop();
      }
      else {
        this.doneMoves.push(move);
      }

      // if (this.targetAngle !== 0) {
      //   this.startTime = 0;
      //   this.renderScene();
      //   console.assert(this.targetAngle === 0, "handlePointerDown error 1");
      // }

      let angle: number = 90;
      if (move.substr(1, 1) === "'") {
        angle = -90;
      }
      switch (move.charAt(0)) {
        case "Y": this.axis = BABYLON.Axis.Y; break; //rotate like U
        case "X": this.axis = BABYLON.Axis.X; break; //flip Like R
        case "Z": this.axis = BABYLON.Axis.Z; angle *= -1; break; //like F
        case "U": this.axis = BABYLON.Axis.Y; break;
        case "D": this.axis = BABYLON.Axis.Y; angle *= -1; break;
        case "F": this.axis = BABYLON.Axis.Z; angle *= -1; break;
        case "B": this.axis = BABYLON.Axis.Z; break;
        case "R": this.axis = BABYLON.Axis.X; break;
        case "L": this.axis = BABYLON.Axis.X; angle *= -1; break;
        case "M": this.axis = BABYLON.Axis.X; break;
        case "E": this.axis = BABYLON.Axis.Y; break;
        case "S": this.axis = BABYLON.Axis.Z; angle *= -1; break;
      }
      if (speed === 0) {
        let rads = angle * Math.PI / 180;
        for (let i1 = 0; i1 < this.pivotList.length; ++i1) {
          this.pivotList[i1].rotate(this.axis, rads, BABYLON.Space.WORLD);
        }
        this.pivotList = [];
        if (this.movesSentQueue.length > 0) {
          this.movesSentQueue.shift();
        }
      }
      else {
        this.moveSpeed = speed;
        this.startTime = new Date().valueOf();
        this.currentAngle = 0;
        this.targetAngle = angle;
      }
    }

    /**
     * 
     * @param move the single move to be made "F " "U'" etc 
     * @param tiles the tiles table to me moved normally Cube.tiles but solver uses a copy
     * @return a table of meshes for all the tiles that need to be moved
     */
    public rotateTable1(move: string, tiles: Tile[]): BABYLON.Mesh[] {
      let pivotList: BABYLON.Mesh[] = [];
      let moveTable: number[][];
      if (move.charAt(1) === "'") {
        moveTable = this.antiMoves;
      }
      else {
        moveTable = this.clockMoves;
      }
      let moveIx = this.moveCodes.indexOf(move.substr(0, 1));
      let moveTiles: Tile[] = [];
      let movelist: number[] = [];
      for (let i = 0; i < tiles.length; ++i) {
        let tile1 = tiles[i];
        if (moveTable[moveIx][i] !== 0) {
          if (moveTable[moveIx][i] !== 200 && moveTable[moveIx][i] !== -1) {
            moveTiles.push(tile1);
            movelist.push(i + moveTable[moveIx][i]);
          }
          pivotList.push(tile1.pivot);
        }
      }
      while (movelist.length > 0) {
        let ix1 = movelist.pop();
        if (ix1 < 100 && ix1 !== -1) {
          tiles[ix1] = moveTiles.pop();
        }
      }
      return pivotList;
    }
  }
}
