"use strict";
var App2;
(function (App2) {
    class Solver {
        constructor(cube) {
            this.solveCount = 0;
            this.stepCount = 0;
            this.solveStep = 0;
            this.solverMoves = "";
            this.startStep = 0;
            this.runStep = (stepFunction, step, targetStep) => {
                let this2 = this;
                while (true) {
                    let moves = stepFunction();
                    if (moves === "") {
                        if (step === 7)
                            this.solverMsg(`Cube is Solved!`);
                        else
                            this.solverMsg(`Step ${step} DONE!`);
                        return "";
                    }
                    else {
                        if (targetStep === 0)
                            return moves;
                        this.doMoves(moves);
                    }
                }
            };
            this.checkWhiteLayer = () => {
                for (let i = 0; i < 9; ++i) {
                    if (App2.Cube.tile(App2.CubeFace.D, i).color !== App2.TileColor.White) {
                        return false;
                    }
                }
                for (let i = 0; i < 4; ++i) {
                    for (let j = 6; j < 9; ++j) {
                        if (App2.Cube.tile(i, j).color !== App2.Cube.tile(i, 4).color) {
                            return false;
                        }
                    }
                }
                return true;
            };
            this.whiteOnTop = () => {
                let moves = "";
                if (App2.Cube.tile(App2.CubeFace.U, 4).color === App2.TileColor.White) {
                    return "";
                }
                else if (App2.Cube.tile(App2.CubeFace.D, 4).color === App2.TileColor.White) {
                    moves = "X X ";
                }
                else if (App2.Cube.tile(App2.CubeFace.L, 4).color === App2.TileColor.White) {
                    moves = "Z ";
                }
                else if (App2.Cube.tile(App2.CubeFace.R, 4).color === App2.TileColor.White) {
                    moves = "Z'";
                }
                else if (App2.Cube.tile(App2.CubeFace.B, 4).color === App2.TileColor.White) {
                    moves = "X'";
                }
                else {
                    moves = "X ";
                }
                console.log(`White On Top m=${moves}`);
                return moves;
            };
            this.whiteCross = () => {
                App2.this2 = this;
                console.log(App2.this2);
                let moves = this.whiteOnTop();
                if (moves !== "")
                    return moves;
                let front = App2.Cube.tile(App2.CubeFace.F, 4).color;
                let ixWhite = App2.Cube.findColors(App2.TileColor.White, front);
                console.assert(ixWhite !== -1, `whiteCross1 sidePiece White/${front} not found`);
                let face = Math.floor(ixWhite / 9);
                let relTile = ixWhite % 9;
                switch (face) {
                    case App2.CubeFace.F:
                        switch (relTile) {
                            case 1:
                                moves = "F'UL'U'";
                                break;
                            case 3:
                                moves = "UL'U'L";
                                break;
                            case 5:
                                moves = "U'RUR'";
                                break;
                            case 7:
                                moves = "FUL'U'";
                                break;
                        }
                        break;
                    case App2.CubeFace.R:
                        switch (relTile) {
                            case 1:
                                moves = "R'F'";
                                break;
                            case 3:
                                moves = "F'";
                                break;
                            case 5:
                                moves = "RRF'R'R'";
                                break;
                            case 7:
                                moves = "RF'R'";
                                break;
                        }
                        break;
                    case App2.CubeFace.B:
                        switch (relTile) {
                            case 1:
                                moves = "B'U'R'UR";
                                break;
                            case 3:
                                moves = "U'R'U";
                                break;
                            case 5:
                                moves = "ULU'L'";
                                break;
                            case 7:
                                moves = "BU'R'URB'";
                                break;
                        }
                        break;
                    case App2.CubeFace.L:
                        switch (relTile) {
                            case 1:
                                moves = "LF";
                                break;
                            case 3:
                                moves = "LLFL'L'";
                                break;
                            case 5:
                                moves = "F";
                                break;
                            case 7:
                                moves = "L'FL";
                                break;
                        }
                        break;
                    case App2.CubeFace.U:
                        switch (relTile) {
                            case 1:
                                moves = "BBDDFF";
                                break;
                            case 3:
                                moves = "LLDFF";
                                break;
                            case 5:
                                moves = "RRD'FF";
                                break;
                            case 7:
                                moves = "";
                                break;
                        }
                        break;
                    case App2.CubeFace.D:
                        switch (relTile) {
                            case 1:
                                moves = "FF";
                                break;
                            case 3:
                                moves = "DFF";
                                break;
                            case 5:
                                moves = "D'FF";
                                break;
                            case 7:
                                moves = "DDFF";
                                break;
                        }
                        break;
                }
                if ((App2.Cube.tile(App2.CubeFace.U, 1).color === App2.TileColor.White)
                    && (App2.Cube.tile(App2.CubeFace.U, 3).color === App2.TileColor.White)
                    && (App2.Cube.tile(App2.CubeFace.U, 5).color === App2.TileColor.White)
                    && (App2.Cube.tile(App2.CubeFace.L, 1).color === App2.Cube.tile(App2.CubeFace.L, 4).color)
                    && (App2.Cube.tile(App2.CubeFace.B, 1).color === App2.Cube.tile(App2.CubeFace.B, 4).color)
                    && (App2.Cube.tile(App2.CubeFace.R, 1).color === App2.Cube.tile(App2.CubeFace.R, 4).color)) {
                }
                else {
                    moves += "Y'";
                }
                console.log(`White Cross m=${moves}`);
                return moves;
            };
            this.whiteCorners = () => {
                let front = App2.Cube.tile(App2.CubeFace.F, 4).color;
                let ixWhite = App2.Cube.findColors(App2.TileColor.White, null, front);
                console.assert(ixWhite !== -1, "whiteCorner1 piece not found");
                let moves = "";
                let face = Math.floor(ixWhite / 9);
                let tileOnFace = ixWhite % 9;
                switch (face) {
                    case App2.CubeFace.F:
                        switch (tileOnFace) {
                            case 0:
                                moves = "F'DDFFD'F'";
                                break;
                            case 2:
                                moves = "FDDF'R'DDR";
                                break;
                            case 6:
                                moves = "DDFD'F'";
                                break;
                            case 8:
                                moves = "D'R'DR";
                                break;
                        }
                        break;
                    case App2.CubeFace.R:
                        switch (tileOnFace) {
                            case 0:
                                moves = "R'DDRFDDF'";
                                break;
                            case 2:
                                moves = "RDR'DR'DR";
                                break;
                            case 6:
                                moves = "DFD'F'";
                                break;
                            case 8:
                                moves = "DDR'DR";
                                break;
                        }
                        break;
                    case App2.CubeFace.B:
                        switch (tileOnFace) {
                            case 0:
                                moves = "B'FD'BF'";
                                break;
                            case 2:
                                moves = "BDB'R'DR ";
                                break;
                            case 6:
                                moves = "FD'F'";
                                break;
                            case 8:
                                moves = "DR'DR";
                                break;
                        }
                        break;
                    case App2.CubeFace.L:
                        switch (tileOnFace) {
                            case 0:
                                moves = "L'D'LFD'F'";
                                break;
                            case 2:
                                moves = "R'LDRL'";
                                break;
                            case 6:
                                moves = "FDDF'";
                                break;
                            case 8:
                                moves = "R'DR";
                                break;
                        }
                        break;
                    case App2.CubeFace.U:
                        switch (tileOnFace) {
                            case 0:
                                moves = "L'R'D'LD'R";
                                break;
                            case 2:
                                moves = "RDR'D'FD'F'";
                                break;
                            case 6:
                                moves = "F'DFDDFD'F'";
                                break;
                            case 8:
                                moves = "";
                                break;
                        }
                        break;
                    case App2.CubeFace.D:
                        switch (tileOnFace) {
                            case 0:
                                moves = "DFD'F'DR'DR";
                                break;
                            case 2:
                                moves = "FD'F'DR'DR";
                                break;
                            case 6:
                                moves = "FDF'DFD'F'";
                                break;
                            case 8:
                                moves = "DFDF'DFD'F'";
                                break;
                        }
                        break;
                }
                if ((App2.Cube.tile(App2.CubeFace.U, 0).color === App2.TileColor.White)
                    && (App2.Cube.tile(App2.CubeFace.U, 2).color === App2.TileColor.White)
                    && (App2.Cube.tile(App2.CubeFace.U, 6).color === App2.TileColor.White)
                    && (App2.Cube.tile(App2.CubeFace.L, 2).color === App2.Cube.tile(App2.CubeFace.L, 4).color)
                    && (App2.Cube.tile(App2.CubeFace.B, 2).color === App2.Cube.tile(App2.CubeFace.B, 4).color)
                    && (App2.Cube.tile(App2.CubeFace.R, 2).color === App2.Cube.tile(App2.CubeFace.R, 4).color)) {
                    if (moves === "") {
                        console.log(`white Corner Done`);
                    }
                }
                else {
                    moves += "Y'";
                }
                console.log(`m=${moves}`);
                return moves;
            };
            this.middleSection = () => {
                let moves = "";
                for (let i = 7; i > 0; i -= 2) {
                    let tile1 = App2.Cube.tile(App2.CubeFace.U, i);
                    if (tile1.color !== App2.TileColor.Yellow && tile1.color2 !== App2.TileColor.Yellow) {
                        let frontColor = App2.Cube.tile(App2.CubeFace.F, 4).color;
                        let rotates1 = frontColor - tile1.color2;
                        let rotates2 = 0;
                        if (i === 1)
                            rotates2 = 2;
                        if (i === 3)
                            rotates2 = 3;
                        if (i === 5)
                            rotates2 = 1;
                        rotates2 -= rotates1;
                        rotates1 = ((rotates1 + 4) % 4);
                        rotates2 = ((rotates2 + 4) % 4);
                        if (rotates1 === 1)
                            moves = "Y";
                        else if (rotates1 === 2)
                            moves = "YY";
                        else if (rotates1 === 3)
                            moves = "Y'";
                        if (rotates2 === 1)
                            moves += "U";
                        else if (rotates2 === 2)
                            moves += "UU";
                        else if (rotates2 === 3)
                            moves += "U'";
                        else {
                            if (tile1.color === App2.Cube.tile(App2.CubeFace.R, 4).color) {
                                if (moves.length >= 2 && moves.substr(moves.length - 2) === "U'") {
                                    moves = moves.substr(0, moves.length - 2) + "RU'R'U'F'UF";
                                }
                                else if (moves.length >= 2 && moves.substr(moves.length - 2) === "UU") {
                                    moves = moves.substr(0, moves.length - 2) + "U'RU'R'U'F'UF";
                                }
                                else
                                    moves += "URU'R'U'F'UF";
                            }
                            else {
                                if (moves.length >= 1 && moves.substr(moves.length - 1) === "U") {
                                    moves = moves.substr(0, moves.length - 1) + "L'ULUFU'F'";
                                }
                                else
                                    moves += "U'L'ULUFU'F'";
                            }
                        }
                        return moves;
                    }
                }
                for (let i = 0; i < 4; ++i) {
                    moves = "";
                    if (i === 1)
                        moves = "Y";
                    else if (i === 2)
                        moves = "YY";
                    else if (i === 3)
                        moves = "Y'";
                    if (App2.Cube.tile(i, 4).color !== App2.Cube.tile(i, 3).color) {
                        moves += "U'L'ULUFU'F'";
                        console.log(`middle section m=${moves} `);
                        return moves;
                    }
                    else if (App2.Cube.tile(i, 4).color !== App2.Cube.tile(i, 5).color) {
                        moves += "URU'R'U'F'UF";
                        console.log(`m=${moves} `);
                        return moves;
                    }
                }
                return "";
            };
            this.yellowCross = () => {
                let moves = "";
                for (let i = 7; i > 0; i -= 2) {
                    if (App2.Cube.tile(App2.CubeFace.U, i).color !== App2.TileColor.Yellow) {
                        if (i === 5)
                            moves = "U";
                        else if (i === 3)
                            moves = "U'";
                        else if (i === 1)
                            moves = "UU";
                        moves += "R' U' F' U F R U'";
                        return moves;
                    }
                }
                return "";
            };
            this.orientateYellowCross = () => {
                let moves = "";
                for (let i = 0; i < 4; i++) {
                    let j = (i + 3) % 4;
                    let face = App2.Cube.tile(i, 1).color;
                    let prevFace = App2.Cube.tile(j, 1).color;
                    if ((face + 1) % 4 !== (prevFace) % 4) {
                        if (i === 3)
                            moves = "U'";
                        else if (i === 2)
                            moves = "UU";
                        else if (i === 1)
                            moves = "U";
                        moves += "RUR'URUUR'";
                        return moves;
                    }
                }
                let front = App2.Cube.tile(App2.CubeFace.F, 4).color;
                let top = App2.Cube.tile(App2.CubeFace.F, 1).color;
                let rotate = (top + 4 - front) % 4;
                if (rotate === 0) {
                    return "";
                }
                if (rotate === 1)
                    moves = "U";
                else if (rotate === 2)
                    moves = "UU";
                else if (rotate === 3)
                    moves = "U'";
                return moves;
            };
            this.yellowCorners = () => {
                let validCount = 0;
                let validFace = -1;
                for (let i = 0; i < 4; i++) {
                    let tile1 = App2.Cube.tile(i, 2);
                    let colors = new Array(3);
                    colors[0] = tile1.color;
                    colors[1] = tile1.color2;
                    colors[2] = tile1.color3;
                    let j = 0;
                    for (; j < 3; j++) {
                        if (colors[j] !== App2.TileColor.Yellow
                            && colors[j] !== App2.Cube.tile(i, 4).color
                            && colors[j] !== App2.Cube.tile((i + 1) % 4, 4).color) {
                            break;
                        }
                    }
                    if (j >= 3) {
                        if (validCount === 0)
                            validFace = i;
                        ++validCount;
                    }
                }
                if (validCount === 4) {
                    return "";
                }
                let moves = "";
                if (validCount !== 0) {
                    if (validFace === 1)
                        moves = "Y";
                    else if (validFace === 2)
                        moves = "YY";
                    else if (validFace === 3)
                        moves = "Y'";
                }
                moves += "URU'L'UR'U'L";
                return moves;
            };
            this.orientateYellowCorners = () => {
                let moves = "";
                let corner = [8, 2, 0, 6];
                for (let i of corner) {
                    if (App2.Cube.tile(App2.CubeFace.U, i).color !== App2.TileColor.Yellow) {
                        if (App2.Cube.tile(App2.CubeFace.U, i).color2 !== App2.TileColor.Yellow) {
                            moves += "R'D'RDR'D'RD";
                        }
                        moves += "R'D'RDR'D'RD";
                    }
                    moves += "U";
                }
                if (moves === "UUUU") {
                    return "";
                }
                return moves;
            };
            this.cube = cube;
        }
        reset() {
            this.solverMoves = "";
            this.solveStep = 0;
            if (this.startStep !== -1)
                this.startStep = 0;
            document.getElementById("solvermessage").innerText = "";
        }
        solverMsg(msg) {
            document.getElementById("solvermessage").innerText = msg;
        }
        step() {
            if (this.solveStep < 7)
                ++this.solveStep;
            this.solverMoves = "";
            document.getElementById("solvermessage").innerText = "";
            console.log(`solver.step ${this.solveStep}`);
            this.solve(this.solveStep);
            let v1 = 1;
        }
        solve(startStep) {
            this.solverMsg("");
            let moves = "";
            if (!this.checkWhiteLayer()) {
                moves = this.runStep(this.whiteCross, 1, startStep);
                if (moves !== "" || startStep === 1)
                    return moves;
                moves = this.runStep(this.whiteCorners, 2, startStep);
                if (moves !== "" || startStep === 2)
                    return moves;
                if (startStep === 0)
                    return "X X ";
                else
                    this.doMoves("X X ");
            }
            moves = this.runStep(this.middleSection, 3, startStep);
            if (moves !== "" || startStep === 3)
                return moves;
            moves = this.runStep(this.yellowCross, 4, startStep);
            if (moves !== "" || startStep === 4)
                return moves;
            moves = this.runStep(this.orientateYellowCross, 5, startStep);
            if (moves !== "" || startStep === 5)
                return moves;
            moves = this.runStep(this.yellowCorners, 6, startStep);
            if (moves !== "" || startStep === 6)
                return moves;
            moves = this.runStep(this.orientateYellowCorners, 7, startStep);
            if (moves !== "" || startStep === 7)
                return moves;
            return "";
        }
        doMoves1(moves) {
            for (let i = 0; i < moves.length; ++i) {
                if (moves.charAt(i) !== " " && moves.charAt(i) !== "'") {
                    let move;
                    if (i + 1 < moves.length && moves.charAt(i + 1) === "'") {
                        move = moves.charAt(i) + "'";
                    }
                    else {
                        move = moves.charAt(i) + " ";
                    }
                    this.cube.rotateTable(move, true, 0);
                }
            }
        }
        doMoves(moves, movePos = 0) {
            let newPos = movePos;
            for (let i = movePos; i < moves.length; ++i) {
                if (moves.charAt(i) !== " " && moves.charAt(i) !== "'") {
                    if (this.cube.currentAngle === 0) {
                        let move;
                        if (i + 1 < moves.length && moves.charAt(i + 1) === "'") {
                            move = moves.charAt(i) + "'";
                        }
                        else {
                            move = moves.charAt(i) + " ";
                        }
                        this.cube.rotateTable(move, true, 0);
                        console.log(`Move ${i} ${move}`);
                        newPos = i + 1;
                    }
                    else {
                        newPos = i;
                    }
                }
            }
            return;
            if (newPos < moves.length) {
                console.log(`setTimeout ${newPos} ${moves.length}`);
                setTimeout(this.doMoves(moves, newPos), 1000);
            }
        }
    }
    App2.Solver = Solver;
})(App2 || (App2 = {}));
//# sourceMappingURL=Solver.js.map