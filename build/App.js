"use strict";
var App2;
(function (App2) {
    let Panel;
    (function (Panel) {
        Panel[Panel["closeAll"] = 0] = "closeAll";
        Panel[Panel["help"] = 1] = "help";
        Panel[Panel["menu"] = 2] = "menu";
        Panel[Panel["about"] = 3] = "about";
        Panel[Panel["crib"] = 4] = "crib";
        Panel[Panel["close"] = 5] = "close";
    })(Panel || (Panel = {}));
    class MainApp {
        constructor() {
            this.aaSignature = "MainApp1";
            this.solverPointerTimer = null;
            this.mouseStatus = 0;
            this.mouseStatusSave = 0;
            this.mousePos1 = { X: 0, Y: 0 };
            this.minimumDistance = 0;
            this.mouseMove = "";
            this.mousePos2 = { X: 0, Y: 0 };
            this.mouseTile1Ix = 0;
            this.overlay = Panel.closeAll;
            this.fastSpeed = false;
            this.handlePointerDown = (event) => {
                this.mousePos1.X = event.clientX;
                this.mousePos1.Y = event.clientY;
                let this1 = this;
                this.showOverlay(Panel.close);
                if (this.cube.targetAngle !== 0) {
                    if (this.fastSpeed !== true)
                        return;
                    this.cube.startTime = 0;
                    this.cube.renderScene();
                    console.assert(this.cube.targetAngle === 0, "handlePointerDown error 1");
                }
                if (this.cube.targetAngle === 0) {
                    this.mouseStatus = 1;
                    let tileIx = this.cube.mouseGetTile(event);
                    if (tileIx !== -1) {
                        console.log(`PointerDown ${tileIx}`);
                        this.mouseTile1Ix = tileIx;
                        this.mouseStatus = 2;
                        return false;
                    }
                    else {
                        console.log(`PointerDown error 2 ${tileIx}`);
                    }
                }
            };
            this.handlePointerMove = (event) => {
                let this1 = this;
                if (this.mouseStatus !== 0) {
                }
                if (this.fastSpeed && this.mouseStatus === 3) {
                }
                else if (this.mouseStatus === 2) {
                    console.assert(this.cube.targetAngle === 0, "mousestatus 2 target != 0");
                    let dX = event.x - this.mousePos1.X;
                    let dY = event.y - this.mousePos1.Y;
                    let distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
                    if (distance > this.minimumDistance) {
                        let aCos = Math.acos(dX / distance);
                        let angle = aCos * 180 / Math.PI;
                        if (dY < 0)
                            angle = 360 - angle;
                        let hitTarget = this.findMouseTarget(this.mouseTile1Ix, angle);
                        if (hitTarget.precise === true) {
                            console.log(`PointerMove - single2`);
                            if (this.cube.targetAngle !== 0) {
                            }
                            this.mouseMove = hitTarget.move;
                            console.log(`move ${this.mouseMove}`);
                            this.cube.rotateTable(this.mouseMove, true, this.cube.mainSpeed);
                            this.mousePos2.X = event.x;
                            this.mousePos2.Y = event.y;
                            this.mouseStatus = 3;
                        }
                    }
                }
            };
            this.handlePointerUp = (event) => {
                console.log(`PointerUp`);
                if (this.cube.targetAngle !== 0 && this.fastSpeed) {
                    const fastStartTime = new Date().valueOf() - .90 * this.cube.moveSpeed;
                    if (fastStartTime < this.cube.startTime)
                        this.cube.startTime = fastStartTime;
                }
                this.mouseStatus = 0;
            };
            this.handleSettingsPointerDown = ((event) => {
                event.preventDefault();
                let target = event.currentTarget;
                let buttonText = target.innerText;
                if (buttonText.substr(0, 5) === "Tutor") {
                    this.solver.reset();
                    if (buttonText === "Tutor OFF") {
                        this.solver.startStep = 0;
                        buttonText = "Tutor ON";
                        this.showIcon(this.iconRedo, true);
                    }
                    else {
                        this.solver.startStep = -1;
                        buttonText = "Tutor OFF";
                        this.showIcon(this.iconRedo, false);
                    }
                }
                else
                    switch (buttonText) {
                        case "Slow":
                            target.innerText = "Fast";
                            this.fastSpeed = true;
                            this.showOverlay(Panel.closeAll);
                            break;
                        case "Fast":
                            target.innerText = "Slow";
                            this.fastSpeed = false;
                            this.showOverlay(Panel.closeAll);
                            break;
                        case "Help":
                            this.showOverlay(Panel.help);
                            break;
                        case "About":
                            this.showOverlay(Panel.about);
                            break;
                        case "Crib":
                            this.showOverlay(Panel.crib);
                    }
                return false;
            });
            this.handleIconPointerUp = ((event) => {
                console.log(`handleIconPointerUp`);
                let this1 = this;
                let target = event.currentTarget;
                const v1 = target.classList;
                switch (target.classList[1]) {
                    case "fa-arrow-circle-o-left":
                        break;
                    case "fa-arrow-circle-o-right":
                        if (this.solverPointerTimer !== null) {
                            clearTimeout(this.solverPointerTimer);
                            this.solverPointerTimer = null;
                            this.solver.solverMsg("");
                            this.doTutorMove();
                        }
                        break;
                }
            });
            this.handleIconPointerDown = ((event) => {
                let this1 = this;
                console.log(`handleIconPointerDown`);
                let target = event.currentTarget;
                let v1 = target.classList;
                switch (target.classList[1]) {
                    case "fa-arrow-circle-o-left":
                        this.undoMove();
                        break;
                    case "fa-arrow-circle-o-right":
                        this.solverPointerTimer = setTimeout(() => {
                            this.solverPointerTimer = null;
                            this.solver.step();
                            this.cube.renderScene();
                            return;
                        }, 1000);
                        break;
                    case "fa-question":
                        if (this.overlay === Panel.help)
                            this.showOverlay(Panel.closeAll);
                        else
                            this.showOverlay(Panel.help);
                        break;
                    case "fa-ellipsis-h":
                        if (this.overlay !== Panel.closeAll)
                            this.showOverlay(Panel.closeAll);
                        else
                            this.showOverlay(Panel.menu);
                        break;
                    case "fa-home":
                        this.showOverlay(Panel.closeAll);
                        this.cube.resetTileColors();
                        this.solver.reset();
                        this.cube.renderScene();
                        break;
                    case "fa-random":
                        this.showOverlay(Panel.closeAll);
                        this.cube.scramble();
                        this.solver.reset();
                        this.cube.renderScene();
                        break;
                    case "fa-arrow-left":
                        break;
                    case "fa-cog":
                        break;
                }
                return false;
            });
            this.doTutorMove = (...rest) => {
                if (this.cube.targetAngle !== 0) {
                    this.finishMove(this.doTutorMove, ...rest);
                    return;
                }
                while (this.solver.solverMoves.length > 0
                    && (this.solver.solverMoves.charAt(0) === " "
                        || this.solver.solverMoves.charAt(0) === "'")) {
                    this.solver.solverMoves = this.solver.solverMoves.substr(1);
                }
                if (this.solver.solverMoves.length === 0) {
                    this.solver.solverMoves = this.solver.solve(this.solver.startStep);
                    if (this.solver.solverMoves.length > 4 && this.solver.solverMoves.substr(0, 3) === "msg") {
                        let msg = document.getElementById("solvermessage");
                        msg.innerText = this.solver.solverMoves.substr(3);
                        this.solver.solverMoves = "";
                        return;
                    }
                }
                if (this.solver.solverMoves.length > 0) {
                    let move;
                    if (this.solver.solverMoves.length > 1
                        && this.solver.solverMoves.charAt(1) === "'") {
                        move = this.solver.solverMoves.charAt(0) + "'";
                    }
                    else {
                        move = this.solver.solverMoves.charAt(0) + " ";
                    }
                    this.cube.rotateTable(move, true, this.cube.mainSpeed);
                    if (this.solver.solverMoves.length > 0) {
                        this.solver.solverMoves = this.solver.solverMoves.substr(1);
                    }
                }
            };
            this.undoMove = () => {
                this.solver.reset();
                if (this.cube.targetAngle !== 0) {
                    this.finishMove(this.undoMove);
                    this.mouseStatus = 0;
                    console.log(`undo move call 1`);
                    return;
                }
                console.log(`undo move call 2`);
                this.solver.solverMoves = "";
                let s1 = this.cube.doneMoves;
                let antiClock = "'";
                for (let len1 = s1.length; len1 > 0; --len1) {
                    let next = s1.substr(len1 - 1, 1);
                    if (next === " ") { }
                    else if (next === "'") {
                        antiClock = " ";
                    }
                    else {
                        if (this.cube.moveCodes.indexOf(next) !== -1) {
                            let move = next + antiClock;
                            let moveCount = this.cube.rotateTable(move, true, this.cube.mainSpeed);
                            if (moveCount === 1) {
                                this.cube.doneMoves = s1.substr(0, len1 - 1);
                                this.cube.movesCount -= 1;
                            }
                            let s2 = document.getElementById("ScoreBox");
                            s2.innerText = this.cube.movesCount.toString();
                        }
                        break;
                    }
                }
            };
            App2.this2 = this;
            const xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    document.getElementById("panelHelp").innerHTML = xmlhttp.responseText;
                }
            };
            xmlhttp.open("GET", "help1.html", true);
            xmlhttp.send();
            const xmlhttp1 = new XMLHttpRequest();
            xmlhttp1.onreadystatechange = () => {
                if (xmlhttp1.readyState === 4 && xmlhttp1.status === 200) {
                    document.getElementById("panelCrib").innerHTML = xmlhttp1.responseText;
                }
            };
            xmlhttp1.open("GET", "crib.html", true);
            xmlhttp1.send();
            this.resizeCanvas();
            const canvas = document.getElementById("renderCanvas");
            const engine = new BABYLON.Engine(canvas, true);
            this.engine = engine;
            this.engine.setHardwareScalingLevel(1.0);
            window.addEventListener("resize", () => {
                this.resizeCanvas();
                engine.resize();
                this.cube.renderScene();
                this.positionButtons();
                this.buildHitTester();
            });
            window.oncontextmenu = ((event) => {
                event.preventDefault();
                event.stopPropagation();
                return false;
            });
            this.scene = new BABYLON.Scene(engine);
            this.scene.clearColor = new BABYLON.Color4(.5, 0.5, 0.5, 1);
            const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(10, 7, -15), this.scene);
            this.camera = camera;
            camera.setTarget(new BABYLON.Vector3(-.07, -1.2, 0));
            camera.fov = 0.35;
            this.cube = new App2.Cube(this.scene, engine);
            this.cube.renderScene();
            this.positionButtons();
            this.solver = new App2.Solver(this.cube);
            const icons = document.getElementsByClassName("fa");
            this.panelHelp = document.getElementById("panelHelp");
            this.panelCrib = document.getElementById("panelCrib");
            this.panelMenu = document.getElementById("panelMenu");
            this.panelAbout = document.getElementById("panelAbout");
            this.labels = document.getElementsByClassName("label");
            for (let i = 0; i < icons.length; ++i) {
                const icon = icons[i];
                if (icon.classList.contains("fa-arrow-circle-o-left")) {
                }
                else if (icon.classList.contains("fa-arrow-circle-o-right")) {
                    this.iconRedo = icon;
                }
                icon.addEventListener("pointerdown", this.handleIconPointerDown);
                icon.addEventListener("pointerup", this.handleIconPointerUp);
            }
            const settings = document.getElementsByTagName("li");
            for (let i = 0; i < settings.length; ++i) {
                const setting = settings[i];
                if (setting.innerText === "Fast") {
                    this.fastSpeed = true;
                }
                setting.addEventListener("pointerdown", this.handleSettingsPointerDown);
            }
            this.cube.renderScene();
            this.loadRawHitData();
            this.buildHitTester();
            const canvas1 = document.getElementById("renderCanvas");
            canvas1.addEventListener("pointerdown", this.handlePointerDown);
            canvas1.addEventListener("pointermove", this.handlePointerMove);
            canvas1.addEventListener("pointerup", this.handlePointerUp);
            canvas1.addEventListener("pointerleave", (event) => {
                this.mouseStatus = 0;
            });
            engine.runRenderLoop(() => {
                this.cube.renderScene(1);
            });
        }
        showIcon(icon, show) {
            const className = icon.className;
            const pos1 = className.indexOf(" disabled");
            if (show && pos1 !== -1) {
                icon.className = className.replace(" disabled", "");
            }
            else if (!show && pos1 === -1) {
                icon.className += " disabled";
            }
        }
        loadRawHitData() {
            let rawData = [
                [0, 42, 3, -1, 1, "L'L U U'"],
                [1, 43, 4, 0, 2, "X X'U U'"],
                [2, 44, 5, 1, -1, "R R'U U'"],
                [3, 0, 6, -4, 4, "L'L Y Y'"],
                [4, 1, 7, 3, 5, "X X'Y Y'"],
                [5, 2, 8, 4, -4, "R R'Y Y'"],
                [6, 3, -3, -7, 7, "L'L D'D "],
                [7, 4, -4, 6, 8, "X X'D'D "],
                [8, 5, -5, 7, -7, "R R'D'D "],
                [9, 44, 12, -10, 10, "F'F U U'"],
                [10, 41, 13, 9, 11, "Z'Z U U'"],
                [11, 38, 14, 10, -10, "B B'U U'"],
                [12, 9, 15, -13, 13, "F'F Y Y'"],
                [13, 10, 16, 12, 14, "Z'Z Y Y'"],
                [14, 11, 17, 13, -13, "B B'Y Y'"],
                [15, 12, -12, -16, 16, "F'F D'D "],
                [16, 13, -13, 15, 17, "Z'Z D'D "],
                [17, 14, -14, 16, -16, "B B'D'D "],
                [36, -39, 39, -37, 37, "L'L B B'"],
                [37, -40, 40, 36, 38, "X X'B B'"],
                [38, -41, 41, 37, 11, "R R'B B'"],
                [39, 36, 42, -40, 40, "L'L Z'Z "],
                [40, 37, 43, 42, 41, "X X'Z'Z "],
                [41, 38, 44, 43, 10, "R R'Z'Z "],
                [42, 39, 0, -43, 43, "L'L F'F "],
                [43, 40, 1, 42, 44, "X X'F'F "],
                [44, 41, 2, 43, 9, "R R'F'F "],
            ];
            this.hitTable = new Array(27);
            for (let v100 of rawData) {
                let moves = v100[5];
                let hit1 = {
                    tileIx: v100[0], targets: [
                        { targetIx: v100[1], move: moves.substr(0, 2) },
                        { targetIx: v100[2], move: moves.substr(2, 2) },
                        { targetIx: v100[3], move: moves.substr(4, 2) },
                        { targetIx: v100[4], move: moves.substr(6, 2) }
                    ],
                };
                this.hitTable[hit1.tileIx] = hit1;
            }
            let v1 = this.hitTable.length;
            let v3 = 0;
            for (let v2 of this.hitTable) {
                if (v2)
                    ++v3;
            }
            let v4 = v3;
        }
        buildHitTester() {
            let matrixIdentity = BABYLON.Matrix.Identity();
            let transformMatrix = this.scene.getTransformMatrix();
            let viewPort = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
            for (let face = 0; face < 6; ++face) {
                if (face === App2.CubeFace.F || face === App2.CubeFace.U || face === App2.CubeFace.R) {
                    for (let i = 0; i < 9; ++i) {
                        let tile1 = App2.Cube.tile(face, i);
                        let mesh1 = tile1.mesh;
                        let vector3 = tile1.mesh.absolutePosition;
                        let p = BABYLON.Vector3.Project(vector3, matrixIdentity, transformMatrix, viewPort);
                        let tileIx = face * 9 + i;
                        let hit1 = this.hitTable[tileIx];
                        console.assert(tileIx === hit1.tileIx, `buildHitTester tileIx ${tileIx} ${hit1.tileIx}`);
                        hit1.X = Math.round(p.x);
                        hit1.Y = Math.round(p.y);
                    }
                }
            }
            let totalDistance = 0;
            for (let hit1 of this.hitTable) {
                if (!hit1)
                    continue;
                for (let target of hit1.targets) {
                    let targetHit = this.hitTable[Math.abs(target.targetIx)];
                    let dX = targetHit.X - hit1.X;
                    let dY = targetHit.Y - hit1.Y;
                    let distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
                    let aCos = Math.acos(dX / distance);
                    target.angle = Math.round(aCos * 180 / Math.PI);
                    if (dY < 0)
                        target.angle = 360 - target.angle;
                    if (target.targetIx < 0) {
                        target.angle = (target.angle + 180) % 360;
                    }
                    target.distance = Math.round(distance);
                    totalDistance += distance;
                }
            }
            this.minimumDistance = totalDistance / 27 / 4 / 6;
        }
        getPolar(dX, dY) {
            let polar = { distance: 0, angle: 0 };
            polar.distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
            let aCos = Math.acos(dX / polar.distance);
            if (polar.distance !== 0) {
                polar.angle = aCos * 180 / Math.PI;
                if (dY < 0)
                    polar.angle = 360 - polar.angle;
            }
            return polar;
        }
        findMouseTarget(tileIx, angle) {
            let hit1 = this.hitTable[tileIx];
            let foundDelta = 360;
            let foundDelta2 = 360;
            let target1;
            for (let target of hit1.targets) {
                let deltaAngle = Math.abs(target.angle - angle) % 360;
                if (deltaAngle > 180) {
                    deltaAngle = 360 - deltaAngle;
                }
                if (deltaAngle < foundDelta) {
                    foundDelta2 = foundDelta;
                    foundDelta = deltaAngle;
                    target1 = target;
                }
                else if (deltaAngle < foundDelta2) {
                    foundDelta2 = deltaAngle;
                }
            }
            if (foundDelta / foundDelta2 < 0.3) {
                target1.precise = true;
            }
            else {
                target1.precise = false;
            }
            return target1;
        }
        finishMove(function1, ...rest) {
            if (MainApp.finishMoveReEnter) {
                console.log("finishMove reEnter");
            }
            MainApp.finishMoveReEnter = true;
            let fastStartTime = new Date().valueOf() - 0.90 * this.cube.moveSpeed;
            if (fastStartTime < this.cube.startTime)
                this.cube.startTime = fastStartTime;
            console.log("finish move 1");
            setTimeout(() => {
                if (this.cube.targetAngle !== 0) {
                    this.cube.startTime = 0;
                    this.cube.renderScene();
                }
                console.log("finish move 2");
                console.assert(this.cube.targetAngle === 0, "finishMove fast click error");
                MainApp.finishMoveReEnter = true;
                function1(...rest);
            }, this.cube.moveSpeed * 0.2);
        }
        hideShowLabels(show) {
            for (let i = 0; i < this.labels.length; ++i) {
                if (show)
                    this.labels[i].style.display = "block";
                else
                    this.labels[i].style.display = "none";
            }
        }
        showOverlay(newPanel) {
            if (this.overlay === Panel.help) {
                this.panelHelp.style.display = "none";
            }
            else if (this.overlay === Panel.crib) {
                if (newPanel !== Panel.close) {
                    this.panelCrib.style.display = "none";
                }
            }
            else if (this.overlay === Panel.menu) {
                this.hideShowLabels(false);
                this.panelMenu.style.display = "none";
            }
            else if (this.overlay === Panel.about) {
                this.panelAbout.style.display = "none";
            }
            if (newPanel !== Panel.close || this.overlay !== Panel.crib) {
                this.overlay = newPanel;
            }
            if (newPanel === Panel.closeAll)
                this.overlay = Panel.closeAll;
            else if (newPanel === Panel.help) {
                this.panelHelp.style.display = "block";
            }
            else if (newPanel === Panel.crib) {
                this.panelCrib.style.display = "block";
            }
            else if (newPanel === Panel.menu) {
                this.hideShowLabels(true);
                this.panelMenu.style.display = "block";
            }
            else if (newPanel === Panel.about) {
                this.panelAbout.style.display = "block";
                this.showAboutPanel();
            }
        }
        showAboutPanel() {
            let navbar1 = document.getElementById("navbar1");
            let gameDiv1 = document.getElementById("gamediv");
            let buttons = document.getElementById("buttons");
            let solvermessage = document.getElementById("solvermessage");
            let matrixIdentity = BABYLON.Matrix.Identity();
            let transformMatrix = this.scene.getTransformMatrix();
            let viewPort = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
            let x1 = 100000;
            let x2 = -10000;
            let y1 = 100000;
            let y2 = -100000;
            for (let j = 0; j < 4; ++j) {
                let face;
                let relTile;
                switch (j) {
                    case 0:
                        face = 0;
                        relTile = 0;
                        break;
                    case 1:
                        face = 0;
                        relTile = 8;
                        break;
                    case 2:
                        face = 4;
                        relTile = 0;
                        break;
                    case 3:
                        face = 4;
                        relTile = 2;
                        break;
                }
                let tile = App2.Cube.tile(face, relTile);
                let mesh2 = tile.mesh.getChildren()[0];
                let box = mesh2._boundingInfo.boundingBox.vectorsWorld;
                for (let v3 of box) {
                    let p = BABYLON.Vector3.Project(v3, matrixIdentity, transformMatrix, viewPort);
                    if (p.x > x2)
                        x2 = p.x;
                    if (p.x < x1)
                        x1 = p.x;
                    if (p.y > y2)
                        y2 = p.y;
                    if (p.y < y1)
                        y1 = p.y;
                }
            }
            this.panelAbout.innerHTML = `\u00A9 2017 David Lewis dlewis@svcondor.com<br>`
                + `Cube Xmin ${x1.toFixed(0)} max ${x2.toFixed(0)} Ymin ${y1.toFixed(0)} max ${y2.toFixed(0)}<br>`
                + `gamediv W-${gameDiv1.clientWidth} H-${gameDiv1.clientHeight} Window W-${window.innerWidth} H-${window.innerHeight}<br>`
                + `buttons W-${buttons.clientWidth} L-${buttons.clientLeft} B-${buttons.clientTop}`
                + `Pointerdown X-${this.mousePos1.X} Y-${this.mousePos1.Y}`;
            this.panelCrib.innerHTML = "";
        }
        resizeCanvas() {
            let gameDiv1 = document.getElementById("gamediv");
            let navbar1 = document.getElementById("navbar1");
            gameDiv1.style.width = `${window.innerWidth}px`;
            gameDiv1.style.height = `${document.documentElement.clientHeight - navbar1.clientHeight}px`;
            let panelHelp = document.getElementById("panelHelp");
            panelHelp.style.height = `${(document.documentElement.clientHeight - navbar1.clientHeight) * 0.8}px`;
        }
        positionButtons() {
            let navbar1 = document.getElementById("navbar1");
            let gameDiv1 = document.getElementById("gamediv");
            let buttons = document.getElementById("buttons");
            let solvermessage = document.getElementById("solvermessage");
            console.log(`gamediv W-${gameDiv1.clientWidth} H-${gameDiv1.clientHeight} Window W-${window.innerWidth} H-${window.innerHeight}`);
            let matrixIdentity = BABYLON.Matrix.Identity();
            let transformMatrix = this.scene.getTransformMatrix();
            let viewPort = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
            let x1 = 100000;
            let x2 = -10000;
            let y1 = 100000;
            let y2 = -100000;
            for (let j = 0; j < 4; ++j) {
                let face;
                let relTile;
                switch (j) {
                    case 0:
                        face = 0;
                        relTile = 0;
                        break;
                    case 1:
                        face = 0;
                        relTile = 8;
                        break;
                    case 2:
                        face = 4;
                        relTile = 0;
                        break;
                    case 3:
                        face = 4;
                        relTile = 2;
                        break;
                }
                let tile = App2.Cube.tile(face, relTile);
                let mesh2 = tile.mesh.getChildren()[0];
                let box = mesh2._boundingInfo.boundingBox.vectorsWorld;
                for (let v3 of box) {
                    let p = BABYLON.Vector3.Project(v3, matrixIdentity, transformMatrix, viewPort);
                    if (p.x > x2)
                        x2 = p.x;
                    if (p.x < x1)
                        x1 = p.x;
                    if (p.y > y2)
                        y2 = p.y;
                    if (p.y < y1)
                        y1 = p.y;
                }
            }
            console.log(`Cube Xmin ${x1.toFixed(0)} max ${x2.toFixed(0)} Ymin ${y1.toFixed(0)} max ${y2.toFixed(0)}`);
            buttons.style.bottom = `${navbar1.clientHeight + 5}px`;
            buttons.style.width = `${(x2 - x1).toFixed(0)}px`;
            buttons.style.left = `${x1.toFixed(0)}px`;
        }
        getCubeWidth() {
        }
    }
    MainApp.finishMoveReEnter = false;
    window.addEventListener("DOMContentLoaded", () => {
        const mainApp = new MainApp();
    });
})(App2 || (App2 = {}));
//# sourceMappingURL=App.js.map