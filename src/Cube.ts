import { MainApp } from './App.js';
import { Tile } from './Tile.js';
import { Piece } from './Piece.js';
import { Solver } from "./Solver.js";

export enum MoveCode {
  SpeedChange = "G",
  ResetGame = "H",
  SolverMsg = "I"
}

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
  private renderCount = 0;
  private gameStartTime = 0;
  //public gameStarted = false;
  private gameTimer: number | null = null;
  private gameTime = 0;
  //public movesCount: number = 0;
  public movesPendingQueue: string[] = [];
  public movesSentQueue: string[] = [];
  private sendSpeed = 200;
  public doneMoves: string[] = [];
  public redoMoves: string[] = [];

  public static cubeTable: Tile[];
  public clockMoves: number[][];
  public antiMoves: number[][];
  private mouseMoves: string[][];
  public sidePieces: Piece[];
  public cornerPieces: Piece[];
  public moveCodes = "ULFRBDYXZMES";
  // special moveCodes
  // G change speed
  // H solver message
  // IJKL NOPQRST

  private pivotList: BABYLON.Mesh[];  //    Array<BABYLON.Mesh>;
  public currentAngle = 0;
  private targetAngle = 0;
  public startTime: number;
  public moveSpeed = 200;  // was 400
  public mainSpeed = 200;
  public scene: BABYLON.Scene;
  private axis: BABYLON.Vector3;
  public static tileColors: { [color1: number]: BABYLON.StandardMaterial; } = {};
  public solver: Solver;
  public mainApp: MainApp;
  constructor(mainApp: MainApp, scene: BABYLON.Scene) {
    this.mainApp = mainApp;
    this.scene = scene;
  }


  /** Repeatedly called by BABYLON to redraw cube if necessary */
  public redrawCube(): void {

    if (this.targetAngle === 0) {
      if (this.movesSentQueue.length === 0) {
        if (this.solver) {
          const solved = this.solver.checkIfSolved();
          if (solved && this.doneMoves.length > 2) {
            this.mainApp.ShowMessage(`Cube is Solved!`);
            this.stopGameTimer();
            //this.sendMoves("X Z X'Y H ", true, 100);
          }
        }
      }
      else if (this.movesSentQueue.length > 0) {
        this.executeNextMove();
      }
    }

    if (this.targetAngle !== 0) {
      this.doPartialRotate();
    }
  }

  /** Partially rotate cube based on speed */
  private doPartialRotate() {
    // if (this.moveSpeed === 0) {

    // }
    const t1 = new Date().valueOf() - this.startTime;
    const t2 = this.moveSpeed;
    //let newAngle = 90 * t1 / t2;
    const newAngle = this.targetAngle * t1 / t2;
    let increment: number;

    increment = newAngle - this.currentAngle;
    if (Math.abs(this.currentAngle + increment) >= Math.abs(this.targetAngle)) {
      increment = this.targetAngle - this.currentAngle;
      this.targetAngle = 0;
    }
    this.currentAngle += increment;
    const rads = increment * Math.PI / 180;
    for (let i = 0; i < this.pivotList.length; ++i) {
      this.pivotList[i].rotate(this.axis, rads, BABYLON.Space.WORLD);
    }
    if (this.targetAngle === 0) {
      this.movesSentQueue.shift();
    }
    this.scene.render();
  }

  /**
   * ececute the next cube move or handle special MoveCode
   */
  private executeNextMove() {
    const move = this.movesSentQueue[0];
    if (move === "''" || move === "") {
      this.movesSentQueue.shift();
      this.scene.render();
    }
    else if (move.substr(0, 1) === MoveCode.SpeedChange) {
      this.sendSpeed = parseInt(move.substr(1, 3), 10);
      this.movesSentQueue.shift();
    }
    else if (move.substr(0, 1) === MoveCode.ResetGame) {
      this.resetGame();
      this.movesSentQueue.shift();
    }
    else if (move.substr(0, 1) === MoveCode.SolverMsg) {
      let step = move.substr(1, 1);
      if (move.length > 2) {
        step += "." + move.substr(2, 1);
      }
      //this.solver.solverMsg(`Step ${step} DONE`);
      this.mainApp.ShowMessage(`Step ${step} DONE`);
    }
    else {
      this.doCubeRotate(move, this.sendSpeed);
      if (this.gameTimer === null &&
        (move.charAt(0) !== "X" && move.charAt(0) !== "Y" && move.charAt(0) !== "Z")) {
        this.startGameTimer();
        //this.solver.solverMsg(``);
      }
    }
  }
  public stopGameTimer() :void {
    clearInterval(this.gameTimer);
    this.gameTimer = null;
  }

  private startGameTimer() {
    this.gameStartTime = Math.floor(new Date().valueOf() / 1000);
    this.gameTime = 0;
    //const oldTimer = this.gameTimer;
    this.gameTimer = setInterval(() => {
      const currentTime = Math.floor(new Date().valueOf() / 1000)
        - this.gameStartTime;
      if (currentTime > this.gameTime) {
        if (this.gameTime >= 3600) {
          this.stopGameTimer();
        }
        else {
          this.gameTime = currentTime;
          const s2 = document.getElementById("ScoreBox");
          const mins = Math.floor(currentTime / 60);
          const seconds = 100 + currentTime - mins * 60;
          s2.innerText = 
            `${this.doneMoves.length.toString()} ${mins}:${seconds.toString().substr(1)}`;
        }
      }
    }, 100);
    }

  /** get Tile by index (0-53) or by face (0-5) and tile (0-8) */
  public static getTile(face: number | CubeFace, ix?: number): Tile {
    let ix1: number;
    if (ix || ix === 0) {
      ix1 = face * 9 + ix;
    }
    else {
      ix1 = face;
    }
    return Cube.cubeTable[ix1];
  }

  /** return Tile index of tile under mouse pointer */
  public mouseGetTile(event: PointerEvent): number {
    const pickResult = this.scene.pick(event.clientX, event.clientY);

    if (pickResult.pickedMesh != null) {
      const mesh1 = pickResult.pickedMesh;
      if (mesh1.name === "tile") {

        //const tile1Ix = -1;
        for (let i = 0; i < Cube.cubeTable.length; ++i) {
          if (Cube.cubeTable[i].mesh === mesh1) {
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

  /** Random scramble of cube */
  public scramble(): void {
    let moves = "";
    for (let i = 0; i < 20; ++i) {
      const move1 = Math.floor(Math.random() * 6);
      moves += this.moveCodes.charAt(move1) + " ";
      // this.rotateTable(this.moveCodes.charAt(move1) + " ", true, 0);
    }
    // moves = "UUBFUBFBDFLUFBURBRLFLDDDULRBFULBRBUUUFUD";
    this.sendMoves(moves, true, 0);
    this.sendMoves(`X Z X'Y ${MoveCode.ResetGame} `, true, 100);

    this.doneMoves.length = 0;
    //this.movesCount = 0;
    this.redoMoves.length = 0;
    //clearInterval(this.gameTimer);
    //this.gameTimer = null;
    const s2 = document.getElementById("ScoreBox");
    //s2.innerText = this.movesCount.toString();
    s2.innerText = this.doneMoves.length.toString();
    // console.log(moves);
  }

  public undoMove = (): void => {
    //this.solver.solverMoves = "";
    if (this.doneMoves.length > 0) {
      // Get previous move and undo it
      let move = this.doneMoves[this.doneMoves.length - 1];
      move = move.substr(0, 1)
        + (move.substr(1, 1) === "'" ? " " : "'");
      //TODO should we add move to redo table
      this.sendMoves(move, true, this.mainSpeed);
    }
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
        const tile1: Tile = Cube.cubeTable[i * 9 + j];
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

  public resetGame() :void {
    this.doneMoves.length = 0;
    this.redoMoves.length = 0;
    //this.movesCount = 0;
    this.stopGameTimer();
    const s2 = document.getElementById("ScoreBox");
    //s2.innerText = this.movesCount.toString();
    s2.innerText = this.doneMoves.length.toString();
    if (this.solver) {
      this.solver.reset();
    }
  }

  private setAdjacentColors(): void {
    for (let i = 0; i < this.sidePieces.length; ++i) {
      const sp1: Piece = this.sidePieces[i];
      let tile: Tile = Cube.getTile(sp1.ix1);
      console.assert(tile.color === sp1.color1, "SidePiece wrong color");
      tile.color2 = sp1.color2;
      tile = Cube.getTile(sp1.ix2);
      console.assert(tile.color === sp1.color2, "SidePiece wrong color");
      tile.color2 = sp1.color1;
    }
    for (let i = 0; i < this.cornerPieces.length; ++i) {
      const sp1: Piece = this.cornerPieces[i];
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
  public sendMoves(moves: string, execute = false, speed = 200): void {
    if (moves.length % 2 === 1) {
      console.assert(moves.length % 2 !== 1, `Bad input to sendMoves "${moves}"`);
    }
    const queue = this.movesPendingQueue;
    for (let i = 0; i < moves.length; i += 2) {
      queue.push(moves.substr(i, 2));
    }
    if (execute) {
      const speed1 = String(speed + 1000);
      this.movesSentQueue.push("G" + speed1.substr(1, 3));
      //TODO DONE UUUU->remove UUU->U-  Remember moves for ReDo
      for (let i = 0; i < queue.length; ++i) {
        const move = queue[i];
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

  /**
   * Do the move on the cubeTable and the display cube
   * @param move the 2 character move to be done
   * @param speed 0-immediately else slowly by redrawCube
   */
  private doCubeRotate(move: string, speed: number): void {
    //let moveCount = 1;
    if (move.length !== 2) {
      throw new Error(`cube.rotateTable move.length != 2`);
    }

    this.pivotList = this.rotateCubeTable(move, Cube.cubeTable);

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

    let angle = 90;
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
      const rads = angle * Math.PI / 180;
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
   * Use move to reorder the cubeTable, return pivotlist to rotate display cube 
   * @param move the single move to be made "F " "U'" etc 
   * @param cubeTable the tiles table to me moved normally Cube.cubeTable but solver uses a copy
   * @return a table of meshes for all the tiles that need to be moved
   */
  public rotateCubeTable(move: string, cubeTable: Tile[]): BABYLON.Mesh[] {
    const pivotList: BABYLON.Mesh[] = [];
    let moveTable: number[][];
    if (move.charAt(1) === "'") {
      moveTable = this.antiMoves;
    }
    else {
      moveTable = this.clockMoves;
    }
    const moveIx = this.moveCodes.indexOf(move.substr(0, 1));
    const moveTiles: Tile[] = [];
    const movelist: number[] = [];
    for (let i = 0; i < cubeTable.length; ++i) {
      const tile1 = cubeTable[i];
      if (moveTable[moveIx][i] !== 0) {
        if (moveTable[moveIx][i] !== 200 && moveTable[moveIx][i] !== -1) {
          moveTiles.push(tile1);
          movelist.push(i + moveTable[moveIx][i]);
        }
        pivotList.push(tile1.pivot);
      }
    }
    while (movelist.length > 0) {
      const ix1 = movelist.pop();
      if (ix1 < 100 && ix1 !== -1) {
        cubeTable[ix1] = moveTiles.pop();
      }
    }
    return pivotList;
  }
}

