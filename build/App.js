import { Cube, CubeFace } from './Cube.js';
import { CubeBuilder } from './CubeBuilder.js';
import { Solver } from "./Solver.js";
var Panel;
(function (Panel) {
    Panel[Panel["closeAll"] = 0] = "closeAll";
    Panel[Panel["help"] = 1] = "help";
    Panel[Panel["menu"] = 2] = "menu";
    Panel[Panel["about"] = 3] = "about";
    Panel[Panel["crib"] = 4] = "crib";
    Panel[Panel["close"] = 5] = "close";
})(Panel || (Panel = {}));
export class MainApp {
    constructor() {
        this.aaSignature = "MainApp1";
        this.solverPointerTimer = null;
        this.mouseStatus = 0;
        this.mousePos1 = { X: 0, Y: 0 };
        this.minimumDistance = 0;
        this.mouseTile1Ix = 0;
        this.overlay = Panel.closeAll;
        this.fastSpeed = false;
        this.handlePointerDown = (event) => {
            if (this.cube.movesSentQueue.length !== 0) {
                return;
            }
            this.mousePos1.X = event.clientX;
            this.mousePos1.Y = event.clientY;
            this.showOverlay(Panel.close);
            this.mouseStatus = 1;
            const tileIx = this.cube.mouseGetTile(event);
            if (tileIx !== -1) {
                console.log(`PointerDown ${tileIx}`);
                this.mouseTile1Ix = tileIx;
                this.mouseStatus = 2;
            }
            return false;
        };
        this.handlePointerMove = (event) => {
            if (this.mouseStatus === 2) {
                const dX = event.x - this.mousePos1.X;
                const dY = event.y - this.mousePos1.Y;
                const distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
                if (distance > this.minimumDistance) {
                    const aCos = Math.acos(dX / distance);
                    let angle = aCos * 180 / Math.PI;
                    if (dY < 0)
                        angle = 360 - angle;
                    const hitTarget = this.findMouseTarget(this.mouseTile1Ix, angle);
                    if (hitTarget.precise === true) {
                        console.log(`move ${hitTarget.move}`);
                        if (hitTarget.move !== "  ") {
                            this.cube.sendMoves(hitTarget.move, true, 400);
                        }
                        this.mouseStatus = 3;
                    }
                }
            }
        };
        this.handlePointerUp = (_event) => {
            if (this.mouseStatus === 3) {
                if (this.cube.movesSentQueue.length !== 0) {
                    this.cube.moveSpeed /= 2;
                }
            }
        };
        this.handleSettingsPointerDown = ((event) => {
            event.preventDefault();
            const target = event.currentTarget;
            const buttonText = target.innerText;
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
                case "Scramble":
                    this.showOverlay(Panel.closeAll);
                    this.cube.scramble();
                    this.ShowMessage("");
                    break;
                case "Reset":
                    this.showOverlay(Panel.closeAll);
                    this.cube.resetTileColors();
                    this.ShowMessage("");
                    this.cube.sendMoves("X Z X'Y H ", true, 100);
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
            const target = event.currentTarget;
            switch (target.classList[1]) {
                case "fa-arrow-circle-o-left":
                    break;
                case "fa-arrow-circle-o-right":
                    if (this.solverPointerTimer !== null) {
                        clearInterval(this.solverPointerTimer);
                        this.solverPointerTimer = null;
                        this.solver.step(this.solver.targetStep);
                    }
                    break;
            }
        });
        this.handleIconPointerDown = ((event) => {
            console.log(`handleIconPointerDown`);
            const target = event.currentTarget;
            switch (target.classList[1]) {
                case "fa-arrow-circle-o-left":
                    this.cube.undoMove();
                    break;
                case "fa-arrow-circle-o-right":
                    if (this.solver.checkIfSolved()) {
                        this.cube.scramble();
                    }
                    else {
                        this.solver.targetStep = 0;
                        this.solverPointerTimer = setInterval(() => {
                            if (this.solver.targetStep >= 7) {
                                clearInterval(this.solverPointerTimer);
                                this.solverPointerTimer = null;
                            }
                            else {
                                ++this.solver.targetStep;
                                this.ShowMessage(`Target ${++this.solver.targetStep}`);
                            }
                        }, 1000);
                    }
                    break;
                case "fa-question":
                    if (this.overlay === Panel.help)
                        this.showOverlay(Panel.closeAll);
                    else
                        this.showOverlay(Panel.help);
                    break;
                case "fa-ellipsis-h":
                    if (this.overlay !== Panel.closeAll && this.overlay !== Panel.close)
                        this.showOverlay(Panel.closeAll);
                    else
                        this.showOverlay(Panel.menu);
                    break;
                case "fa-home":
                    this.showOverlay(Panel.closeAll);
                    this.cube.resetTileColors();
                    this.ShowMessage("");
                    this.cube.sendMoves("X Z X'Y H ", true, 100);
                    break;
                case "fa-random":
                    this.showOverlay(Panel.closeAll);
                    this.cube.scramble();
                    this.ShowMessage("");
                    break;
                case "fa-arrow-left":
                    break;
                case "fa-cog":
                    break;
            }
            return false;
        });
        fetch(`./help1.html`)
            .then(response => response.text())
            .then(html => document.getElementById("panelHelp").innerHTML = html)
            .catch(error => {
            return console.log(error);
        });
        fetch(`./crib.html`)
            .then(response => response.text())
            .then(html => document.getElementById("panelCrib").innerHTML = html)
            .catch(error => {
            return console.log(error);
        });
        this.resizeCanvas();
        const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);
        this.engine = engine;
        this.engine.setHardwareScalingLevel(1.0);
        window.addEventListener("resize", () => {
            this.resizeCanvas();
            engine.resize();
            this.cube.sendMoves("", true, 0);
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
        this.cube = new Cube(this, this.scene);
        this.cubeBuilder = new CubeBuilder(this.cube, this.scene);
        this.cube.resetTileColors();
        this.solver = new Solver(this, this.cube);
        this.cube.solver = this.solver;
        const icons = document.getElementsByClassName("fa");
        this.panelHelp = document.getElementById("panelHelp");
        this.panelCrib = document.getElementById("panelCrib");
        this.panelMenu = document.getElementById("panelMenu");
        this.panelAbout = document.getElementById("panelAbout");
        this.labels = document.getElementsByClassName("label");
        for (let i = 0; i < icons.length; ++i) {
            const icon = icons[i];
            if (icon.classList.contains("fa-arrow-circle-o-right")) {
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
        this.scene.render();
        this.loadRawHitData();
        this.buildHitTester();
        const canvas1 = document.getElementById("renderCanvas");
        canvas1.addEventListener("pointerdown", this.handlePointerDown);
        canvas1.addEventListener("pointermove", this.handlePointerMove);
        canvas1.addEventListener("pointerup", this.handlePointerUp);
        canvas1.addEventListener("pointerleave", (_event) => {
            this.mouseStatus = 0;
        });
        engine.runRenderLoop(() => {
            this.cube.redrawCube();
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
        const rawData = [
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
        for (const v100 of rawData) {
            const moves = v100[5];
            const hit1 = {
                tileIx: v100[0], targets: [
                    { targetIx: v100[1], move: moves.substr(0, 2) },
                    { targetIx: v100[2], move: moves.substr(2, 2) },
                    { targetIx: v100[3], move: moves.substr(4, 2) },
                    { targetIx: v100[4], move: moves.substr(6, 2) }
                ],
            };
            this.hitTable[hit1.tileIx] = hit1;
        }
    }
    buildHitTester() {
        const matrixIdentity = BABYLON.Matrix.Identity();
        const transformMatrix = this.scene.getTransformMatrix();
        const viewPort = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
        for (let face = 0; face < 6; ++face) {
            if (face === CubeFace.F || face === CubeFace.U || face === CubeFace.R) {
                for (let i = 0; i < 9; ++i) {
                    const tile1 = Cube.getTile(face, i);
                    const vector3 = tile1.mesh.absolutePosition;
                    const p = BABYLON.Vector3.Project(vector3, matrixIdentity, transformMatrix, viewPort);
                    const tileIx = face * 9 + i;
                    const hit1 = this.hitTable[tileIx];
                    console.assert(tileIx === hit1.tileIx, `buildHitTester tileIx ${tileIx} ${hit1.tileIx}`);
                    hit1.X = Math.round(p.x);
                    hit1.Y = Math.round(p.y);
                }
            }
        }
        let totalDistance = 0;
        for (const hit1 of this.hitTable) {
            if (!hit1)
                continue;
            for (const target of hit1.targets) {
                const targetHit = this.hitTable[Math.abs(target.targetIx)];
                const dX = targetHit.X - hit1.X;
                const dY = targetHit.Y - hit1.Y;
                const distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
                const aCos = Math.acos(dX / distance);
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
    findMouseTarget(tileIx, angle) {
        const hit1 = this.hitTable[tileIx];
        let foundDelta = 360;
        let foundDelta2 = 360;
        let target1;
        for (const target of hit1.targets) {
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
        const gameDiv1 = document.getElementById("gamediv");
        const matrixIdentity = BABYLON.Matrix.Identity();
        const transformMatrix = this.scene.getTransformMatrix();
        const viewPort = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
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
            const tile = Cube.getTile(face, relTile);
            const mesh2 = tile.mesh.getChildren()[0];
            const box = mesh2._boundingInfo.boundingBox.vectorsWorld;
            for (const v3 of box) {
                const p = BABYLON.Vector3.Project(v3, matrixIdentity, transformMatrix, viewPort);
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
        this.panelAbout.innerHTML = `\u00A9 2017-2021 David Lewis dlewis@svcondor.com<br>`
            + `Cube Xmin ${x1.toFixed(0)} max ${x2.toFixed(0)} Ymin ${y1.toFixed(0)} max ${y2.toFixed(0)}<br>`
            + `gamediv W-${gameDiv1.clientWidth} H-${gameDiv1.clientHeight} Window W-${window.innerWidth} H-${window.innerHeight}<br>`
            + `Pointerdown X-${this.mousePos1.X.toFixed(1)} Y-${this.mousePos1.Y.toFixed(1)}`;
        this.panelCrib.innerHTML = "";
    }
    resizeCanvas() {
        const gameDiv1 = document.getElementById("gamediv");
        const navbar1 = document.getElementById("navbar1");
        const panelHelp = document.getElementById("panelHelp");
        if (gameDiv1 && navbar1 && panelHelp) {
            gameDiv1.style.width = `${window.innerWidth}px`;
            gameDiv1.style.height = `${document.documentElement.clientHeight - navbar1.clientHeight}px`;
            panelHelp.style.height = `${(document.documentElement.clientHeight - navbar1.clientHeight) * 0.5}px`;
        }
    }
    ShowMessage(msg = "") {
        document.getElementById("solvermessage").innerText = msg;
    }
}
window.addEventListener("DOMContentLoaded", () => {
    new MainApp();
});
//# sourceMappingURL=App.js.map