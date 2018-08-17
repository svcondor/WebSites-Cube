"use strict";
var App2;
(function (App2) {
    let TileColor;
    (function (TileColor) {
        TileColor[TileColor["Blue"] = 0] = "Blue";
        TileColor[TileColor["Orange"] = 1] = "Orange";
        TileColor[TileColor["Green"] = 2] = "Green";
        TileColor[TileColor["Red"] = 3] = "Red";
        TileColor[TileColor["White"] = 4] = "White";
        TileColor[TileColor["Yellow"] = 5] = "Yellow";
        TileColor[TileColor["Gray"] = 6] = "Gray";
        TileColor[TileColor["Black"] = 7] = "Black";
        TileColor[TileColor["none"] = 8] = "none";
    })(TileColor = App2.TileColor || (App2.TileColor = {}));
    let CubeFace;
    (function (CubeFace) {
        CubeFace[CubeFace["F"] = 0] = "F";
        CubeFace[CubeFace["R"] = 1] = "R";
        CubeFace[CubeFace["B"] = 2] = "B";
        CubeFace[CubeFace["L"] = 3] = "L";
        CubeFace[CubeFace["U"] = 4] = "U";
        CubeFace[CubeFace["D"] = 5] = "D";
    })(CubeFace = App2.CubeFace || (App2.CubeFace = {}));
    class Cube {
        constructor(scene, engine) {
            this.gameStartTime = 0;
            this.gameStarted = false;
            this.movesCount = 0;
            this.doneMoves = "";
            this.redoMoves = "";
            this.moveCodes = "ULFRBDYXZMES";
            this.residualMoves = "";
            this.currentAngle = 0;
            this.targetAngle = 0;
            this.moveSpeed = 200;
            this.mainSpeed = 200;
            this.scene = scene;
            this.engine = engine;
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
        renderNew(angle, axis, speed) {
        }
        renderScene() {
            let zeroTargetAngle = false;
            if (this.targetAngle !== 0) {
                let t1 = new Date().valueOf() - this.startTime;
                let t2 = this.moveSpeed;
                let newAngle = 90 * t1 / t2;
                let increment;
                if (this.targetAngle > 0) {
                    increment = newAngle - this.currentAngle;
                    if (increment > 10)
                        console.log(`Pos ${t2} ${t1} ${newAngle} ${increment}`);
                    if (this.currentAngle + increment >= this.targetAngle) {
                        increment = this.targetAngle - this.currentAngle;
                        zeroTargetAngle = true;
                    }
                }
                else {
                    increment = -newAngle - this.currentAngle;
                    if (this.currentAngle + increment <= this.targetAngle) {
                        increment = this.targetAngle - this.currentAngle;
                        zeroTargetAngle = true;
                    }
                }
                this.currentAngle += increment;
                let rads = increment * Math.PI / 180;
                for (let i = 0; i < this.pivotList.length; ++i) {
                    this.pivotList[i].rotate(this.axis, rads, BABYLON.Space.WORLD);
                }
            }
            this.scene.render();
            if (zeroTargetAngle) {
                this.targetAngle = 0;
            }
            return;
        }
        static tile(face, ix) {
            let ix1;
            if (ix || ix === 0) {
                ix1 = face * 9 + ix;
            }
            else {
                ix1 = face;
            }
            return Cube.tiles[ix1];
        }
        static findColors(color, color2, color3 = null) {
            if (color3 !== null) {
                for (let i = 0; i < Cube.tiles.length; i++) {
                    let tile1 = Cube.tile(i);
                    if (tile1.color === color && tile1.color3 === color3) {
                        return i;
                    }
                }
            }
            else {
                for (let i = 0; i < Cube.tiles.length; i++) {
                    let tile1 = Cube.tile(i);
                    if (tile1.color === color && tile1.color2 === color2 && tile1.color3 === TileColor.none) {
                        return i;
                    }
                }
            }
            return -1;
        }
        mouseGetTile(event) {
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
        buildTileColorTable() {
            let sm1 = new BABYLON.StandardMaterial("BlueMat", this.scene);
            sm1.emissiveColor = new BABYLON.Color3(0, 0, 1);
            Cube.tileColors[TileColor.Blue] = sm1;
            sm1 = new BABYLON.StandardMaterial("OrangeMat", this.scene);
            sm1.emissiveColor = new BABYLON.Color3(.9, .67, 0);
            Cube.tileColors[TileColor.Orange] = sm1;
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
        buildTables() {
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
                        let j2 = j1 + this.clockMoves[i][j1];
                        let j3 = j2 + this.clockMoves[i][j2];
                        let j4 = j3 + this.clockMoves[i][j3];
                        let a3 = this.clockMoves[i][j3];
                        if (j4 !== j) {
                            throw new Error("error in table clockMoves");
                        }
                        this.antiMoves[i][j] = j3 - j;
                    }
                }
            }
            this.sidePieces = [
                new App2.Piece(TileColor.Blue, TileColor.White, null, 1, 43),
                new App2.Piece(TileColor.Blue, TileColor.Orange, null, 5, 12),
                new App2.Piece(TileColor.Blue, TileColor.Yellow, null, 7, 46),
                new App2.Piece(TileColor.Blue, TileColor.Red, null, 3, 32),
                new App2.Piece(TileColor.Orange, TileColor.White, null, 10, 41),
                new App2.Piece(TileColor.Orange, TileColor.Green, null, 14, 21),
                new App2.Piece(TileColor.Orange, TileColor.Yellow, null, 16, 50),
                new App2.Piece(TileColor.Green, TileColor.White, null, 19, 37),
                new App2.Piece(TileColor.Green, TileColor.Red, null, 23, 30),
                new App2.Piece(TileColor.Green, TileColor.Yellow, null, 25, 52),
                new App2.Piece(TileColor.Red, TileColor.White, null, 28, 39),
                new App2.Piece(TileColor.Red, TileColor.Yellow, null, 34, 48)
            ];
            this.cornerPieces = [
                new App2.Piece(TileColor.Blue, TileColor.Red, TileColor.White, 0, 29, 42),
                new App2.Piece(TileColor.Blue, TileColor.White, TileColor.Orange, 2, 44, 9),
                new App2.Piece(TileColor.Blue, TileColor.Yellow, TileColor.Red, 6, 45, 35),
                new App2.Piece(TileColor.Blue, TileColor.Orange, TileColor.Yellow, 8, 15, 47),
                new App2.Piece(TileColor.Green, TileColor.Orange, TileColor.White, 18, 11, 38),
                new App2.Piece(TileColor.Green, TileColor.White, TileColor.Red, 20, 36, 27),
                new App2.Piece(TileColor.Green, TileColor.Yellow, TileColor.Orange, 24, 53, 17),
                new App2.Piece(TileColor.Green, TileColor.Red, TileColor.Yellow, 26, 33, 51)
            ];
        }
        drawFace(cubeFace) {
            let tileIx = cubeFace * 9;
            for (let y = 1; y >= -1; --y) {
                for (let x = -1; x <= 1; ++x) {
                    if (y === 1 && x === 5) {
                        let a1 = 1;
                    }
                    else {
                        let tile1 = new App2.Tile(x, y, tileIx, this.scene);
                        Cube.tiles[tileIx] = tile1;
                    }
                    ++tileIx;
                }
            }
        }
        rotateImage(move) {
            let count = 0;
            let angle = 90;
            if (move.length > 1 && move.substring(1, 2) === "'") {
                angle = -90;
            }
            let axis;
            switch (move.substring(0, 1)) {
                case "Y":
                    axis = BABYLON.Axis.Y;
                    break;
                case "X":
                    axis = BABYLON.Axis.X;
                    break;
            }
            for (let item of Cube.tiles) {
                if (item != null && item.pivot != null) {
                    item.pivot.rotate(axis, angle * Math.PI / 180, BABYLON.Space.WORLD);
                    ++count;
                }
            }
        }
        scramble() {
            this.resetTileColors();
            let moves = "";
            for (let i = 0; i < 200; ++i) {
                let move1 = Math.floor(Math.random() * 6);
                moves += this.moveCodes.charAt(move1);
            }
            for (let i = 0; i < moves.length; ++i) {
                let move1 = moves.charAt(i) + " ";
                this.rotateTable(move1, true, 0);
            }
            this.doneMoves = "";
            this.movesCount = 0;
            this.redoMoves = "";
            this.gameStarted = false;
            let s2 = document.getElementById("ScoreBox");
            s2.innerText = this.movesCount.toString();
        }
        resetTileColors() {
            let color = TileColor.Gray;
            for (let i = 0; i < 6; ++i) {
                switch (i) {
                    case 0:
                        color = TileColor.Blue;
                        break;
                    case 1:
                        color = TileColor.Orange;
                        break;
                    case 2:
                        color = TileColor.Green;
                        break;
                    case 3:
                        color = TileColor.Red;
                        break;
                    case 4:
                        color = TileColor.White;
                        break;
                    case 5:
                        color = TileColor.Yellow;
                        break;
                }
                for (let j = 0; j < 9; ++j) {
                    let tile1 = Cube.tiles[i * 9 + j];
                    if (tile1 != null) {
                        tile1.color = color;
                        tile1.mesh.material = Cube.tileColors[color];
                        tile1.color2 = TileColor.none;
                        tile1.color3 = TileColor.none;
                        if (tile1.tileIx !== (i * 9 + j)) {
                        }
                    }
                }
            }
            this.setAdjacentColors();
            this.doneMoves = "";
            this.redoMoves = "";
            this.movesCount = 0;
            this.gameStarted = false;
            let s2 = document.getElementById("ScoreBox");
            s2.innerText = this.movesCount.toString();
        }
        setAdjacentColors() {
            for (let i = 0; i < this.sidePieces.length; ++i) {
                let sp1 = this.sidePieces[i];
                let tile = Cube.tile(sp1.ix1);
                console.assert(tile.color === sp1.color1, "SidePiece wrong color");
                tile.color2 = sp1.color2;
                tile = Cube.tile(sp1.ix2);
                console.assert(tile.color === sp1.color2, "SidePiece wrong color");
                tile.color2 = sp1.color1;
            }
            for (let i = 0; i < this.cornerPieces.length; ++i) {
                let sp1 = this.cornerPieces[i];
                let tile = Cube.tile(sp1.ix1);
                console.assert(tile.color === sp1.color1, "CornerPiece wrong color");
                tile.color2 = sp1.color2;
                tile.color3 = sp1.color3;
                tile = Cube.tile(sp1.ix2);
                console.assert(tile.color === sp1.color2, "CornerPiece wrong color");
                tile.color2 = sp1.color3;
                tile.color3 = sp1.color1;
                tile = Cube.tile(sp1.ix3);
                console.assert(tile.color === sp1.color3, "CornerPiece wrong color");
                tile.color2 = sp1.color1;
                tile.color3 = sp1.color2;
            }
        }
        rotateTable(move, image, speed) {
            let moveCount = 1;
            console.assert(move.length === 2, `cube.rotateTable move.length != 2`);
            let moveTable;
            if (move.charAt(1) === "\'") {
                moveTable = this.antiMoves;
            }
            else
                moveTable = this.clockMoves;
            let moveIx = this.moveCodes.indexOf(move.substring(0, 1));
            let moveTiles = [];
            let movelist = [];
            if (image) {
                this.pivotList = [];
                if (this.targetAngle !== 0) {
                    let v1 = 0;
                }
            }
            for (let i = 0; i < Cube.tiles.length; ++i) {
                let tile1 = Cube.tiles[i];
                if (moveTable[moveIx][i] !== 0) {
                    if (moveTable[moveIx][i] !== 200 && moveTable[moveIx][i] !== -1) {
                        moveTiles.push(tile1);
                        movelist.push(i + moveTable[moveIx][i]);
                    }
                    if (image) {
                        this.pivotList.push(tile1.pivot);
                    }
                }
            }
            while (movelist.length > 0) {
                let ix1 = movelist.pop();
                if (ix1 < 100 && ix1 !== -1) {
                    Cube.tiles[ix1] = moveTiles.pop();
                }
            }
            if (this.doneMoves.length >= 2
                && this.doneMoves.charAt(this.doneMoves.length - 2) === move.charAt(0)
                && this.doneMoves.charAt(this.doneMoves.length - 1) !== move.charAt(1)) {
                this.doneMoves = this.doneMoves.substring(0, this.doneMoves.length - 2);
                this.movesCount -= 1;
                moveCount = -1;
            }
            else {
                this.doneMoves += move;
                this.movesCount += 1;
            }
            if (this.targetAngle !== 0) {
                this.startTime = 0;
                this.renderScene();
                console.assert(this.targetAngle === 0, "handlePointerDown error 1");
            }
            if (image) {
                let angle = 90;
                if (move.length > 1 && move.substring(1, 2) === "'") {
                    angle = -90;
                }
                switch (move.charAt(0)) {
                    case "Y":
                        this.axis = BABYLON.Axis.Y;
                        break;
                    case "X":
                        this.axis = BABYLON.Axis.X;
                        break;
                    case "Z":
                        this.axis = BABYLON.Axis.Z;
                        angle *= -1;
                        break;
                    case "U":
                        this.axis = BABYLON.Axis.Y;
                        break;
                    case "D":
                        this.axis = BABYLON.Axis.Y;
                        angle *= -1;
                        break;
                    case "F":
                        this.axis = BABYLON.Axis.Z;
                        angle *= -1;
                        break;
                    case "B":
                        this.axis = BABYLON.Axis.Z;
                        break;
                    case "R":
                        this.axis = BABYLON.Axis.X;
                        break;
                    case "L":
                        this.axis = BABYLON.Axis.X;
                        angle *= -1;
                        break;
                    case "M":
                        this.axis = BABYLON.Axis.X;
                        break;
                    case "E":
                        this.axis = BABYLON.Axis.Y;
                        break;
                    case "S":
                        this.axis = BABYLON.Axis.Z;
                        angle *= -1;
                        break;
                }
                if (speed === 0) {
                    let rads = angle * Math.PI / 180;
                    for (let i1 = 0; i1 < this.pivotList.length; ++i1) {
                        this.pivotList[i1].rotate(this.axis, rads, BABYLON.Space.WORLD);
                    }
                    this.pivotList = [];
                }
                else {
                    this.moveSpeed = speed;
                    this.startTime = new Date().valueOf();
                    this.currentAngle = 0;
                    this.targetAngle = angle;
                }
                if (this.gameStarted === false) {
                    if (move.charAt(0) !== "X" && move.charAt(0) !== "Y" && move.charAt(0) !== "Z") {
                        this.gameStarted = true;
                        this.gameStartTime = new Date().valueOf();
                    }
                }
                if (this.gameStarted) {
                    let s2 = document.getElementById("ScoreBox");
                    let elapsed = (new Date().valueOf()) - this.gameStartTime;
                    let mins = Math.floor(elapsed / (1000 * 60));
                    elapsed -= mins * (1000 * 60);
                    let seconds = Math.floor(elapsed / (1000));
                    s2.innerText = `${this.movesCount.toString()} ${mins}:${seconds}`;
                }
            }
            return moveCount;
        }
    }
    Cube.tileColors = {};
    App2.Cube = Cube;
})(App2 || (App2 = {}));
//# sourceMappingURL=Cube.js.map