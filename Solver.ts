module App2 {

  export interface Solution {
    moves1: string;
    message: string;
    step: number;
    completed: boolean;
  }

  export class Solver {
    public solveCount: number = 0;
    public stepCount: number = 0;
    private solveStep: number = 0;
    public solverMoves = "";
    public startStep: number = 0;

    public cube: Cube;

    constructor(cube: Cube) {
      this.cube = cube;
    }

    public reset(): void {
      // finish any move
      this.solverMoves = "";
      this.solveStep = 0;
      if (this.startStep !== -1) this.startStep = 0;
      document.getElementById("solvermessage").innerText = "";
    }

    public solverMsg(msg: string): void {
      document.getElementById("solvermessage").innerText = msg;
    }

    public step(): void {
      if (this.solveStep < 7)++this.solveStep;

      this.solverMoves = "";
      //this.solveStep = 0;
      //if (this.startStep !== -1) this.startStep = 0;
      document.getElementById("solvermessage").innerText = "";

      console.log(`solver.step ${this.solveStep}`);

      this.solve(this.solveStep);
      let v1 = 1;
    }

    public solve(startStep): string {
      //let solution1: Solution = { moves1: "", message: "", step: 0, completed: false };

      //TODO Check for any face moves or cube moves since last solve call
      this.solverMsg("");
      let moves = "";
      //if (startStep === 0) this.solveStep = 0;
      if (!this.checkWhiteLayer()) {
        let moves = this.runStep(this.whiteCross, 1, startStep);
        if (moves !== "" || startStep === 1) return moves;
        moves = this.runStep(this.whiteCorners, 2, startStep);
        if (moves !== "" || startStep === 2) return moves;
        if (startStep === 0) return "X X ";
        else this.doMoves("X X ");
      }
        moves = this.runStep(this.middleSection, 3, startStep);
        if (moves !== "" || startStep === 3) return moves;
        moves = this.runStep(this.yellowCross, 4, startStep);
        if (moves !== "" || startStep === 4) return moves;
        moves = this.runStep(this.orientateYellowCross, 5, startStep);
        if (moves !== "" || startStep === 5) return moves;
        moves = this.runStep(this.yellowCorners, 6, startStep);
        if (moves !== "" || startStep === 6) return moves;
        moves = this.runStep(this.orientateYellowCorners, 7, startStep);
        if (moves !== "" || startStep === 7) return moves;

        return "";
    }

    private runStep = (function1: Function, step: number, targetStep: number): string => {
      let this2 = this;
      while (true) {
        let moves = function1();
        if (moves === "") {
          if (step === 7) this.solverMsg(`Cube is Solved!`);
          else this.solverMsg(`Step ${step} DONE!`);
          return "";
        }
        else {
          if (targetStep === 0) return moves;
          this.doMoves(moves);
        }
      }
    }

    private doMoves(moves: string): void {
      for (let i = 0; i < moves.length; ++i) {
        if (moves.charAt(i) !== " " && moves.charAt(i) !== "'") {
          let move;
          if (i + 1 < moves.length && moves.charAt(i + 1) === "'") {
            move = moves.charAt(i) + "'";
          }
          else {
            move = moves.charAt(i) + " ";
          }
          //console.log(`doMoves ${move}`);
          this.cube.rotateTable(move, true, 0);
        }
      }
    }

    private checkWhiteLayer = (): boolean => {
      //TODO allow white to be on any face and move it to bottom
      for (let i = 0; i < 9; ++i) {
        if (Cube.tile(CubeFace.D, i).color !== TileColor.White) {
          return false;
        }
      }
      for (let i = 0; i < 4; ++i) {
        for (let j = 6; j < 9; ++j) {
          if (Cube.tile(i, j).color != Cube.tile(i, 4).color) {
            return false;
          }
        }
      }
      return true;
    }

    private whiteOnTop = (): string => {
      let moves: string = "";
      if (Cube.tile(CubeFace.U, 4).color == TileColor.White) {
        return "";
      }
      else if (Cube.tile(CubeFace.D, 4).color == TileColor.White) {
        moves = "X X ";
      }
      else if (Cube.tile(CubeFace.L, 4).color == TileColor.White) {
        moves = "Z ";
      }
      else if (Cube.tile(CubeFace.R, 4).color == TileColor.White) {
        moves = "Z'";
      }
      else if (Cube.tile(CubeFace.B, 4).color == TileColor.White) {
        moves = "X'";
      }
      else {
        moves = "X ";
      }
      console.log(`White On Top m=${moves}`);
      return moves;
    }

    private whiteCross = (): string => {
      this2 = this;
      console.log(this2);
      let moves: string = this.whiteOnTop();
      if (moves !== "") return moves;

      let front: TileColor = Cube.tile(CubeFace.F, 4).color;
      let ixWhite = Cube.findColors(TileColor.White, front);
      console.assert(ixWhite != -1, `whiteCross1 sidePiece White/${front} not found`);

      let face: CubeFace = Math.floor(ixWhite / 9);
      let relTile = ixWhite % 9;
      switch (face) {
        case CubeFace.F:
          switch (relTile) {
            case 1: moves = "F'UL'U'"; break;
            case 3: moves = "UL'U'L"; break;
            case 5: moves = "U'RUR'"; break;
            case 7: moves = "FUL'U'"; break;
          }
          break;
        case CubeFace.R:
          switch (relTile) {
            case 1: moves = "R'F'"; break;
            case 3: moves = "F'"; break;
            case 5: moves = "RRF'R'R'"; break;
            case 7: moves = "RF'R'"; break;
          }
          break;
        case CubeFace.B:
          switch (relTile) {
            case 1: moves = "B'U'R'UR"; break;
            case 3: moves = "U'R'U"; break;
            case 5: moves = "ULU'L'"; break;
            case 7: moves = "BU'R'URB'"; break;
          }
          break;
        case CubeFace.L:
          switch (relTile) {
            case 1: moves = "LF"; break;
            case 3: moves = "LLFL'L'"; break;
            case 5: moves = "F"; break;
            case 7: moves = "L'FL"; break;

          }
          break;
        case CubeFace.U:
          switch (relTile) {
            case 1: moves = "BBDDFF"; break;
            case 3: moves = "LLDFF"; break;
            case 5: moves = "RRD'FF"; break;
            case 7: moves = ""; break;
          }
          break;
        case CubeFace.D:
          switch (relTile) {
            case 1: moves = "FF"; break;
            case 3: moves = "DFF"; break;
            case 5: moves = "D'FF"; break;
            case 7: moves = "DDFF"; break;
          }
          break;
      }
      if ((Cube.tile(CubeFace.U, 1).color == TileColor.White)
        && (Cube.tile(CubeFace.U, 3).color == TileColor.White)
        && (Cube.tile(CubeFace.U, 5).color == TileColor.White)
        && (Cube.tile(CubeFace.L, 1).color == Cube.tile(CubeFace.L, 4).color)
        && (Cube.tile(CubeFace.B, 1).color == Cube.tile(CubeFace.B, 4).color)
        && (Cube.tile(CubeFace.R, 1).color == Cube.tile(CubeFace.R, 4).color)
      ) {
      }
      else {
        moves += "Y'";
      }
      console.log(`White Cross m=${moves}`);
      return moves;
    }

    private whiteCorners = (): string => {
      // Find tile that belongs in Front top right
      let front: TileColor = Cube.tile(CubeFace.F, 4).color;
      let ixWhite = Cube.findColors(TileColor.White, null, front);
      console.assert(ixWhite != -1, "whiteCorner1 piece not found");
      let moves = "";
      let face: CubeFace = Math.floor(ixWhite / 9);
      let tileOnFace = ixWhite % 9;
      switch (face) {
        case CubeFace.F:
          switch (tileOnFace) {
            case 0: moves = "F'DDFFD'F'"; break;
            case 2: moves = "FDDF'R'DDR"; break;
            case 6: moves = "DDFD'F'"; break;
            case 8: moves = "D'R'DR"; break;
          }
          break;
        case CubeFace.R:
          switch (tileOnFace) {
            case 0: moves = "R'DDRFDDF'"; break;
            case 2: moves = "RDR'DR'DR"; break;
            case 6: moves = "DFD'F'"; break;
            case 8: moves = "DDR'DR"; break;
          }
          break;
        case CubeFace.B:
          switch (tileOnFace) {
            case 0: moves = "B'FD'BF'"; break;
            case 2: moves = "BDB'R'DR "; break;
            case 6: moves = "FD'F'"; break;
            case 8: moves = "DR'DR"; break;
          }
          break;
        case CubeFace.L:
          switch (tileOnFace) {
            case 0: moves = "L'D'LFD'F'"; break;
            case 2: moves = "R'LDRL'"; break;
            case 6: moves = "FDDF'"; break;
            case 8: moves = "R'DR"; break;
          }
          break;
        case CubeFace.U:
          switch (tileOnFace) {
            case 0: moves = "L'R'D'LD'R"; break;
            case 2: moves = "RDR'D'FD'F'"; break;
            case 6: moves = "F'DFDDFD'F'"; break;
            case 8: moves = ""; break;
          }
          break;
        case CubeFace.D:
          switch (tileOnFace) {
            case 0: moves = "DFD'F'DR'DR"; break;
            case 2: moves = "FD'F'DR'DR"; break;
            case 6: moves = "FDF'DFD'F'"; break;
            case 8: moves = "DFDF'DFD'F'"; break;
          }
          break;
      }
      if ((Cube.tile(CubeFace.U, 0).color == TileColor.White)
        && (Cube.tile(CubeFace.U, 2).color == TileColor.White)
        && (Cube.tile(CubeFace.U, 6).color == TileColor.White)
        && (Cube.tile(CubeFace.L, 2).color == Cube.tile(CubeFace.L, 4).color)
        && (Cube.tile(CubeFace.B, 2).color == Cube.tile(CubeFace.B, 4).color)
        && (Cube.tile(CubeFace.R, 2).color == Cube.tile(CubeFace.R, 4).color)
      ) {
        if (moves == "") {
          console.log(`white Corner Done`);
        }
      }
      else {
        moves += "Y'";
      }
      console.log(`m=${moves}`);
      return moves;
    }

    private middleSection = (): string => {
      let moves = "";
      for (let i = 7; i > 0; i -= 2) {
        let tile1 = Cube.tile(CubeFace.U, i);
        if (tile1.color != TileColor.Yellow && tile1.color2 != TileColor.Yellow) {
          let frontColor: TileColor = Cube.tile(CubeFace.F, 4).color;
          let rotates1 = frontColor - tile1.color2;
          let rotates2 = 0;
          if (i == 1) rotates2 = 2;
          if (i == 3) rotates2 = 3;
          if (i == 5) rotates2 = 1;
          rotates2 -= rotates1;
          rotates1 = ((rotates1 + 4) % 4);
          rotates2 = ((rotates2 + 4) % 4);
          if (rotates1 == 1) moves = "Y";
          else if (rotates1 == 2) moves = "YY";
          else if (rotates1 == 3) moves = "Y'";
          if (rotates2 == 1) moves += "U";
          else if (rotates2 == 2) moves += "UU";
          else if (rotates2 == 3) moves += "U'";
          else {
            if (tile1.color == Cube.tile(CubeFace.R, 4).color) {
              if (moves.length >= 2 && moves.substr(moves.length - 2) == "U'") {
                moves = moves.substr(0, moves.length - 2) + "RU'R'U'F'UF";
              }
              else if (moves.length >= 2 && moves.substr(moves.length - 2) == "UU") {
                moves = moves.substr(0, moves.length - 2) + "U'RU'R'U'F'UF";
              }
              else moves += "URU'R'U'F'UF";
            }
            else {
              if (moves.length >= 1 && moves.substr(moves.length - 1) == "U") {
                moves = moves.substr(0, moves.length - 1) + "L'ULUFU'F'";
              }
              else moves += "U'L'ULUFU'F'";
            }
          }
          //console.log(`m=${moves}`);
          return moves;
        }
      }


      //      Front col
      //      0  1  2  3        Blue = 0,        F = 0,   
      //T  0  0  1  2  1-       Orange = 1,      R = 1,
      //O  1  1- 0  1  2        Green = 2,       B = 2,
      //P  2  2  1- 0  1        Red = 3,         L = 3,
      //   3  1  2  1- 0    

      for (let i = 0; i < 4; ++i) {
        moves = "";
        if (i == 1) moves = "Y";
        else if (i == 2) moves = "YY";
        else if (i == 3) moves = "Y'";
        if (Cube.tile(i, 4).color != Cube.tile(i, 3).color) {
          moves += "U'L'ULUFU'F'";
          console.log(`middle section m=${moves} `);
          return moves;

        }
        else if (Cube.tile(i, 4).color != Cube.tile(i, 5).color) {
          moves += "URU'R'U'F'UF";
          console.log(`m=${moves} `);
          return moves;
        }

      }
      //console.log(`midSection steps=${stepCount}`);
      //stepCount = 0;
      return "";
    }

    private yellowCross = (): string => {
      let moves = "";
      for (let i = 7; i > 0; i -= 2) {
        if (Cube.tile(CubeFace.U, i).color != TileColor.Yellow) {
          if (i == 5) moves = "U";
          else if (i == 3) moves = "U'";
          else if (i == 1) moves = "UU";
          moves += "R' U' F' U F R U'";
          return moves;
        }
      }
      //Debug.WriteLine($"Yellow cross steps={stepCount}");
      //stepCount = 0;
      return "";
    }

    private orientateYellowCross = (): string => {
      let moves = "";

      //// Possible new logic
      //let faces: number[] = [CubeFace.F, CubeFace.L, CubeFace.B, CubeFace.R, CubeFace.F];
      //let moveFace = -1;
      //for (let i = 0; i < 4; ++i) {
      //  let color1 = Cube.tile(faces[i], 1).color;
      //  let color2 = Cube.tile(faces[i + 1], 1).color;

      //  if (color2 !== (color1 + 1) % 4) {
      //    switch (faces[i]) {
      //      case CubeFace.L: moves = "U'"; break;
      //      case CubeFace.B: moves = "UU"; break;
      //      case CubeFace.R: moves = "U"; break;
      //      case CubeFace.F: break;
      //    }
      //  }
      //}

      for (let i = 0; i < 4; i++) {
        let j = (i + 3) % 4;
        let face: TileColor = Cube.tile(i, 1).color;
        let prevFace: TileColor = Cube.tile(j, 1).color;
        if ((face + 1) % 4 !== (prevFace) % 4) {
          if (i === 3) moves = "U'";
          else if (i === 2) moves = "UU";
          else if (i === 1) moves = "U";
          moves += "RUR'URUUR'";
          //Debug.Write($"m={moves} ");
          //cube.rotateBoth(moves);
          return moves;
        }
      }
      let front: TileColor = Cube.tile(CubeFace.F, 4).color;
      let top: TileColor = Cube.tile(CubeFace.F, 1).color;
      let rotate = (top + 4 - front) % 4;

      if (rotate === 0) {
        //Debug.WriteLine($"orientateYellowCross steps={stepCount}");
        //stepCount = 0;
        return "";
      }
      if (rotate === 1) moves = "U";
      else if (rotate === 2) moves = "UU";
      else if (rotate === 3) moves = "U'";
      //cube.rotateBoth(moves);

      return moves;
    }

    private yellowCorners = (): string => {
      let validCount = 0;
      let validFace = -1;
      for (let i = 0; i < 4; i++) {
        let tile1: Tile = Cube.tile(i, 2);
        let colors: TileColor[] = new Array(3);
        colors[0] = tile1.color;
        colors[1] = tile1.color2;
        colors[2] = tile1.color3;
        let j = 0;
        for (; j < 3; j++) {
          if (colors[j] != TileColor.Yellow
            && colors[j] != Cube.tile(i, 4).color
            && colors[j] != Cube.tile((i + 1) % 4, 4).color) {
            break;
          }
        }
        if (j >= 3) {
          if (validCount == 0) validFace = i;
          ++validCount;
        }
      }
      if (validCount == 4) {
        //Debug.WriteLine($"yellowCorners steps={stepCount}");
        //stepCount = 0;
        return "";
      }
      let moves: string = "";
      if (validCount != 0) {
        if (validFace == 1) moves = "Y";
        else if (validFace == 2) moves = "YY";
        else if (validFace == 3) moves = "Y'";
      }
      moves += "URU'L'UR'U'L";
      //Debug.Write($"m={moves} ");
      //cube.rotateBoth(moves);
      return moves;
    }

    private orientateYellowCorners = (): string => {

      let moves: string = "";
      let corner: number[] = [8, 2, 0, 6];
      for (let i of corner) {
        if (Cube.tile(CubeFace.U, i).color != TileColor.Yellow) {
          if (Cube.tile(CubeFace.U, i).color2 != TileColor.Yellow) {
            moves += "R'D'RDR'D'RD";
          }
          moves += "R'D'RDR'D'RD";
        }
        moves += "U";
      }
      if (moves === "UUUU") {
        return ""
      }

      //for (let i = 8; i >= 0; i -= 2) {
      //  if (i == 4) continue;
      //  if (Cube.tile(CubeFace.U, i).color != TileColor.Yellow) {
      //    if (i === 6) moves = "U'";
      //    else if (i === 0) moves = "UU";
      //    else if (i === 2) moves = "U'";
      //    moves += "R'D'RDR'D'RD";
      //    //Debug.Write($"m={moves} ");
      //    //cube.rotateBoth(moves);
      //    return moves;
      //  }
      //}
      //let frontColor: TileColor = Cube.tile(CubeFace.F, 4).color;
      //for (let i = 0; i < 4; i++) {
      //  if (Cube.tile(i, 0).color == frontColor) {
      //    if (i == 0) {
      //      //Debug.WriteLine($"orientateYellowCorners steps={stepCount} total={solveCount}");
      //      //stepCount = 0;
      //      //solveCount = 0;
      //      return "";
      //    }
      //    if (i == 1) moves = "U";
      //    else if (i == 2) moves = "UU";
      //    else if (i == 3) moves = "U'";
      //    //Debug.Write($"m={moves} ");
      //    //cube.rotateBoth(moves);
      //    return moves;
      //  }
      //}
      return moves;
    }

  }
}