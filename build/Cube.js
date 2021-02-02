export var MoveCode;
(function (MoveCode) {
    MoveCode["SpeedChange"] = "G";
    MoveCode["ResetGame"] = "H";
    MoveCode["SolverMsg"] = "I";
})(MoveCode || (MoveCode = {}));
export var TileColor;
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
})(TileColor || (TileColor = {}));
export var CubeFace;
(function (CubeFace) {
    CubeFace[CubeFace["F"] = 0] = "F";
    CubeFace[CubeFace["R"] = 1] = "R";
    CubeFace[CubeFace["B"] = 2] = "B";
    CubeFace[CubeFace["L"] = 3] = "L";
    CubeFace[CubeFace["U"] = 4] = "U";
    CubeFace[CubeFace["D"] = 5] = "D";
})(CubeFace || (CubeFace = {}));
export class Cube {
    constructor(scene) {
        this.renderCount = 0;
        this.gameStartTime = 0;
        this.gameTimer = null;
        this.gameTime = 0;
        this.movesPendingQueue = [];
        this.movesSentQueue = [];
        this.sendSpeed = 200;
        this.doneMoves = [];
        this.redoMoves = [];
        this.moveCodes = "ULFRBDYXZMES";
        this.currentAngle = 0;
        this.targetAngle = 0;
        this.moveSpeed = 200;
        this.mainSpeed = 200;
        this.undoMove = () => {
            if (this.doneMoves.length > 0) {
                let move = this.doneMoves[this.doneMoves.length - 1];
                move = move.substr(0, 1)
                    + (move.substr(1, 1) === "'" ? " " : "'");
                this.sendMoves(move, true, this.mainSpeed);
            }
        };
        this.scene = scene;
    }
    redrawCube() {
        if (this.targetAngle === 0) {
            if (this.movesSentQueue.length === 0) {
                if (this.solver) {
                    const solved = this.solver.checkIfSolved();
                    if (solved && this.doneMoves.length > 2) {
                        this.solver.solverMsg(`Cube is Solved!`);
                        this.stopGameTimer();
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
    doPartialRotate() {
        const t1 = new Date().valueOf() - this.startTime;
        const t2 = this.moveSpeed;
        const newAngle = this.targetAngle * t1 / t2;
        let increment;
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
    executeNextMove() {
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
            this.solver.solverMsg(`Step ${step} DONE`);
        }
        else {
            this.doCubeRotate(move, this.sendSpeed);
            if (this.gameTimer === null &&
                (move.charAt(0) !== "X" && move.charAt(0) !== "Y" && move.charAt(0) !== "Z")) {
                this.startGameTimer();
            }
        }
    }
    stopGameTimer() {
        clearInterval(this.gameTimer);
        this.gameTimer = null;
    }
    startGameTimer() {
        this.gameStartTime = Math.floor(new Date().valueOf() / 1000);
        this.gameTime = 0;
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
    static getTile(face, ix) {
        let ix1;
        if (ix || ix === 0) {
            ix1 = face * 9 + ix;
        }
        else {
            ix1 = face;
        }
        return Cube.cubeTable[ix1];
    }
    mouseGetTile(event) {
        const pickResult = this.scene.pick(event.clientX, event.clientY);
        if (pickResult.pickedMesh != null) {
            const mesh1 = pickResult.pickedMesh;
            if (mesh1.name === "tile") {
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
    scramble() {
        let moves = "";
        for (let i = 0; i < 20; ++i) {
            const move1 = Math.floor(Math.random() * 6);
            moves += this.moveCodes.charAt(move1) + " ";
        }
        this.sendMoves(moves, true, 0);
        this.sendMoves(`X Z X'Y ${MoveCode.ResetGame} `, true, 100);
        this.doneMoves.length = 0;
        this.redoMoves.length = 0;
        const s2 = document.getElementById("ScoreBox");
        s2.innerText = this.doneMoves.length.toString();
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
                const tile1 = Cube.cubeTable[i * 9 + j];
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
        this.resetGame();
    }
    resetGame() {
        this.doneMoves.length = 0;
        this.redoMoves.length = 0;
        this.stopGameTimer();
        const s2 = document.getElementById("ScoreBox");
        s2.innerText = this.doneMoves.length.toString();
        if (this.solver) {
            this.solver.reset();
        }
    }
    setAdjacentColors() {
        for (let i = 0; i < this.sidePieces.length; ++i) {
            const sp1 = this.sidePieces[i];
            let tile = Cube.getTile(sp1.ix1);
            console.assert(tile.color === sp1.color1, "SidePiece wrong color");
            tile.color2 = sp1.color2;
            tile = Cube.getTile(sp1.ix2);
            console.assert(tile.color === sp1.color2, "SidePiece wrong color");
            tile.color2 = sp1.color1;
        }
        for (let i = 0; i < this.cornerPieces.length; ++i) {
            const sp1 = this.cornerPieces[i];
            let tile = Cube.getTile(sp1.ix1);
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
    sendMoves(moves, execute = false, speed = 200) {
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
    doCubeRotate(move, speed) {
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
    rotateCubeTable(move, cubeTable) {
        const pivotList = [];
        let moveTable;
        if (move.charAt(1) === "'") {
            moveTable = this.antiMoves;
        }
        else {
            moveTable = this.clockMoves;
        }
        const moveIx = this.moveCodes.indexOf(move.substr(0, 1));
        const moveTiles = [];
        const movelist = [];
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
Cube.tileColors = {};
//# sourceMappingURL=Cube.js.map