//import { CubeBuild } from './CubeBuild';
//import * as $ from "./Cube";
////import * as Solver1 from "./Solver";
//import { Solver } from "./Solver";
//import * as BABYLON from "babylonjs";

namespace App2 {
  //TODO: make CubeFace.U Enum 2
  //TODO: Swap some antiClockmoves with clockMoves
  //https://github.com/icflorescu/iisexpress-proxy
  // npm install -g iisexpress-proxy
  //iisexpress-proxy 55537 to 8080

  interface HitTarget {
    distance?: number;
    angle?: number;
    targetIx: number;
    move: string;
    precise?: boolean;
  }

  interface Point {
    X: number;
    Y: number;
  }

  interface HitEntry {
    X?: number;
    Y?: number;
    tileIx: number;
    targets?: HitTarget[];
  }

  // interface Polar {
  //   distance: number;
  //   angle: number;
  // }

  enum Panel {
    closeAll = 0,
    help = 1,
    menu = 2,
    about = 3,
    crib = 4,
    close = 5,
  }

  class MainApp {

    private aaSignature = "MainApp1";
    private solverPointerTimer: number | null = null;
    private iconRedo: HTMLElement;
    private scene: BABYLON.Scene;
    private cube: Cube;

    private cubeBuilder: CubeBuilder;
    private solver: Solver;

    private mouseStatus: number = 0;
    private mousePos1: Point = { X: 0, Y: 0 };   // Mouse position on canvas
    private minimumDistance: number = 0;
    private mouseTile1Ix: number = 0;
    private panelHelp: HTMLElement;
    private panelMenu: HTMLElement;
    private panelAbout: HTMLElement;
    private panelCrib: HTMLElement;
    private labels: HTMLCollectionOf<HTMLElement>;
    private overlay: Panel = Panel.closeAll;
    private engine: BABYLON.Engine;
    private camera: BABYLON.FreeCamera;
    private hitTable: HitEntry[];
    private fastSpeed: boolean = false;   // Rotation speed in ms

    constructor() {
      // http://stackoverflow.com/questions/16152609/
      //  importing-external-html-inner-content-with-javascript-ajax-without-jquery

      let rand = Math.floor(Math.random() * 10000);

      const xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = (): any => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          document.getElementById("panelHelp").innerHTML = xmlhttp.responseText;
        }
      };
      xmlhttp.open("GET", `help1.html?v${rand}`, true);
      xmlhttp.send();

      const xmlhttp1 = new XMLHttpRequest();
      xmlhttp1.onreadystatechange = (): any => {
        if (xmlhttp1.readyState === 4 && xmlhttp1.status === 200) {
          document.getElementById("panelCrib").innerHTML = xmlhttp1.responseText;
        }
      };
      xmlhttp1.open("GET", `crib.html?v${rand}`, true);
      xmlhttp1.send();

      //BABYLON.Engine.CodeRepository = "/Babylon/src/";
      //BABYLON.Engine.ShadersRepository = "/Babylon/src/Shaders/";
      this.resizeCanvas();

      const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
      const engine = new BABYLON.Engine(canvas, true);
      this.engine = engine;
      // TODO Default HardwareScaling PC = 1  930 = 0.5      2=jagged fast
      this.engine.setHardwareScalingLevel(1.0);
      window.addEventListener("resize", () => {
        //TODO add timer to reduce flashing
        this.resizeCanvas();
        engine.resize();
        this.cube.sendMoves("", true, 0);
        this.positionButtons();
        this.buildHitTester();
      });

      window.oncontextmenu = ((event: PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
        return false;
      });

      this.scene = new BABYLON.Scene(engine);
      this.scene.clearColor = new BABYLON.Color4(.5, 0.5, 0.5, 1);

      //Was 7,7,-15
      const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(10, 7, -15), this.scene);
      this.camera = camera;
      camera.setTarget(new BABYLON.Vector3(-.07, -1.2, 0)); // was 0,0,0
      camera.fov = 0.35;  //0.33 for iphone 5   //0.35 Nokia 930
      //let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, -1), this.scene);
      this.cube = new Cube(this.scene);
      this.cubeBuilder = new CubeBuilder(this.cube, this.scene);
      this.cube.resetTileColors();

      //this.cube.sendMoves("''", true, 0);
      this.solver = new Solver(this.cube);
      this.cube.solver = this.solver;

      const icons = document.getElementsByClassName("fa");
      this.panelHelp = document.getElementById("panelHelp");
      this.panelCrib = document.getElementById("panelCrib");
      this.panelMenu = document.getElementById("panelMenu");
      this.panelAbout = document.getElementById("panelAbout");
      this.labels = document.getElementsByClassName("label") as HTMLCollectionOf<HTMLElement>;
      //this.labels = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName("label");

      for (let i = 0; i < icons.length; ++i) {
        const icon = icons[i];
        if (icon.classList.contains("fa-arrow-circle-o-left")) {
        }
        else if (icon.classList.contains("fa-arrow-circle-o-right")) {
          this.iconRedo = icon as HTMLElement;
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

      //this.cube.sendMoves("''", true, 0);
      //this.cube.sendMoves("F F ", true, 30);
      this.scene.render();
      this.positionButtons();
      this.loadRawHitData();
      this.buildHitTester();

      const canvas1 = document.getElementById("renderCanvas");
      canvas1.addEventListener("pointerdown", this.handlePointerDown);
      canvas1.addEventListener("pointermove", this.handlePointerMove);
      canvas1.addEventListener("pointerup", this.handlePointerUp);

      canvas1.addEventListener("pointerleave", (event: PointerEvent) => {
        this.mouseStatus = 0;
      });

      engine.runRenderLoop(() => {
        this.cube.redrawCube();
      });
    }

    private showIcon(icon: HTMLElement, show: boolean): void {
      const className = icon.className;
      const pos1 = className.indexOf(" disabled");
      if (show && pos1 !== -1) {
        icon.className = className.replace(" disabled", "");
      }
      else if (!show && pos1 === -1) {
        icon.className += " disabled";
      }
    }

    private loadRawHitData(): void {
      let rawData1: any = [
        [0, 42, 3, -1, 1, "L'L U U'"],
        [1, 43, 4, 0, 2, "    U U'"],    // 
        [2, 44, 5, 1, -1, "R R'U U'"],
        [3, 0, 6, -4, 4, "L'L     "],    // 
        [4, 1, 7, 3, 5, "X X'Y Y'"],
        [5, 2, 8, 4, -4, "R R'    "],    // 
        [6, 3, -3, -7, 7, "L'L D'D "],
        [7, 4, -4, 6, 8, "    D'D"],    //  
        [8, 5, -5, 7, -7, "R R'D'D "],

        [9, 44, 12, -10, 10, "F'F U U'"],
        [10, 41, 13, 9, 11, "    U U'"],    // 
        [11, 38, 14, 10, -10, "B B'U U'"],
        [12, 9, 15, -13, 13, "F'F     "],   // 
        [13, 10, 16, 12, 14, "Z'Z Y Y'"],
        [14, 11, 17, 13, -13, "B B'    "],  // 
        [15, 12, -12, -16, 16, "F'F D'D "],
        [16, 13, -13, 15, 17, "    D'D "],   // 
        [17, 14, -14, 16, -16, "B B'D'D "],

        [36, -39, 39, -37, 37, "L'L B B'"],
        [37, -40, 40, 36, 38, "    B B'"],   //
        [38, -41, 41, 37, 11, "R R'B B'"],
        [39, 36, 42, -40, 40, "L'L     "],   // 
        [40, 37, 43, 42, 41, "X X'Z'Z "],
        [41, 38, 44, 43, 10, "R R'    "],   //   
        [42, 39, 0, -43, 43, "L'L F'F "],
        [43, 40, 1, 42, 44, "    F'F"],    //   
        [44, 41, 2, 43, 9, "R R'F'F "],
      ];
      let rawData: any = [
        [0, 42, 3, -1, 1, "L'L U U'"],
        [1, 43, 4, 0, 2, "X X'U U'"],    // 
        [2, 44, 5, 1, -1, "R R'U U'"],
        [3, 0, 6, -4, 4, "L'L Y Y'"],    // 
        [4, 1, 7, 3, 5, "X X'Y Y'"],
        [5, 2, 8, 4, -4, "R R'Y Y'"],    // 
        [6, 3, -3, -7, 7, "L'L D'D "],
        [7, 4, -4, 6, 8, "X X'D'D "],    //  
        [8, 5, -5, 7, -7, "R R'D'D "],

        [9, 44, 12, -10, 10, "F'F U U'"],
        [10, 41, 13, 9, 11, "Z'Z U U'"],    // 
        [11, 38, 14, 10, -10, "B B'U U'"],
        [12, 9, 15, -13, 13, "F'F Y Y'"],   // 
        [13, 10, 16, 12, 14, "Z'Z Y Y'"],
        [14, 11, 17, 13, -13, "B B'Y Y'"],  // 
        [15, 12, -12, -16, 16, "F'F D'D "],
        [16, 13, -13, 15, 17, "Z'Z D'D "],   // 
        [17, 14, -14, 16, -16, "B B'D'D "],

        [36, -39, 39, -37, 37, "L'L B B'"],
        [37, -40, 40, 36, 38, "X X'B B'"],   //
        [38, -41, 41, 37, 11, "R R'B B'"],
        [39, 36, 42, -40, 40, "L'L Z'Z "],   // 
        [40, 37, 43, 42, 41, "X X'Z'Z "],
        [41, 38, 44, 43, 10, "R R'Z'Z "],   //   
        [42, 39, 0, -43, 43, "L'L F'F "],
        [43, 40, 1, 42, 44, "X X'F'F "],    //   
        [44, 41, 2, 43, 9, "R R'F'F "],
      ];
      let rawWithMiddle: any = [
        [0, 42, 3, -1, 1, "L'L U U'"],
        [1, 43, 4, 0, 2, "M M'U U'"],    // X X'U U'
        [2, 44, 5, 1, -1, "R R'U U'"],
        [3, 0, 6, -4, 4, "L'L E E'"],    // L'L Y Y'
        [4, 1, 7, 3, 5, "X X'Y Y'"],
        [5, 2, 8, 4, -4, "R R'E E'"],    // R R'Y Y'
        [6, 3, -3, -7, 7, "L'L D'D "],
        [7, 4, -4, 6, 8, "M M'D'D "],    // X X'D'D 
        [8, 5, -5, 7, -7, "R R'D'D "],

        [9, 44, 12, -10, 10, "F'F U U'"],
        [10, 41, 13, 9, 11, "S'S U U'"],    // Z'Z U U'
        [11, 38, 14, 10, -10, "B B'U U'"],
        [12, 9, 15, -13, 13, "F'F E E'"],   // F'F Y Y'
        [13, 10, 16, 12, 14, "Z'Z Y Y'"],
        [14, 11, 17, 13, -13, "B B'E E'"],  // B B'Y Y'
        [15, 12, -12, -16, 16, "F'F D'D "],
        [16, 13, -13, 15, 17, "S'S D'D "],   // Z'Z D'D 
        [17, 14, -14, 16, -16, "B B'D'D "],

        [36, -39, 39, -37, 37, "L'L B B'"],
        [37, -40, 40, 36, 38, "M M'B B'"],   // X X'B B
        [38, -41, 41, 37, 11, "R R'B B'"],
        [39, 36, 42, -40, 40, "L'L S'S "],   // L'L Z'Z
        [40, 37, 43, 42, 41, "X X'Z'Z "],
        [41, 38, 44, 43, 10, "R R'S'S "],   //  R R'Z'Z 
        [42, 39, 0, -43, 43, "L'L F'F "],
        [43, 40, 1, 42, 44, "M M'F'F "],    //  X X'F'F 
        [44, 41, 2, 43, 9, "R R'F'F "],
      ];

      this.hitTable = new Array(27);
      for (let v100 of rawData) {
        let moves: string = v100[5];
        let hit1: HitEntry = {

          tileIx: v100[0], targets: [
            { targetIx: v100[1], move: moves.substr(0, 2) },
            { targetIx: v100[2], move: moves.substr(2, 2) },
            { targetIx: v100[3], move: moves.substr(4, 2) },
            { targetIx: v100[4], move: moves.substr(6, 2) }],
        };
        this.hitTable[hit1.tileIx] = hit1;
      }
      let v1 = this.hitTable.length;
      let v3 = 0;
      for (let v2 of this.hitTable) {
        if (v2)++v3;
      }
      let v4 = v3;
    }

    private buildHitTester(): void {
      //TODO change test angle and distance calculation
      // only 2 entries in target table and hittest will check fo x + 180 and add/subtract '
      let matrixIdentity = BABYLON.Matrix.Identity();
      let transformMatrix = this.scene.getTransformMatrix();
      let viewPort = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());

      for (let face: CubeFace = 0; face < 6; ++face) {
        if (face === CubeFace.F || face === CubeFace.U || face === CubeFace.R) {
          //console.log("");
          //console.log(`${CubeFace[face]}`);
          for (let i = 0; i < 9; ++i) {
            let tile1: Tile = Cube.getTile(face, i);
            let mesh1: BABYLON.Mesh = tile1.mesh;
            let vector3: BABYLON.Vector3 = tile1.mesh.absolutePosition;
            let p: BABYLON.Vector3 = BABYLON.Vector3.Project(
              vector3, matrixIdentity, transformMatrix, viewPort);
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
        if (!hit1) continue;
        for (let target of hit1.targets) {
          let targetHit: HitEntry = this.hitTable[Math.abs(target.targetIx)];
          let dX = targetHit.X - hit1.X;
          let dY = targetHit.Y - hit1.Y;
          let distance = Math.sqrt(dX ** 2 + dY ** 2);
          let aCos = Math.acos(dX / distance);
          target.angle = Math.round(aCos * 180 / Math.PI);
          if (dY < 0) target.angle = 360 - target.angle;
          if (target.targetIx < 0) {
            target.angle = (target.angle + 180) % 360;
          }
          target.distance = Math.round(distance);
          totalDistance += distance;
        }
      }
      //this.hitMaximum = this.hitTable[1].X - this.hitTable[0].X;
      this.minimumDistance = totalDistance / 27 / 4 / 6;   // was / 27 / 4 / 4
    }

    // private getPolar(dX: number, dY: number): Polar {
    //   let polar: Polar = { distance: 0, angle: 0 };
    //   polar.distance = Math.sqrt(dX ** 2 + dY ** 2);
    //   let aCos = Math.acos(dX / polar.distance);
    //   if (polar.distance !== 0) {
    //     polar.angle = aCos * 180 / Math.PI;
    //     if (dY < 0) polar.angle = 360 - polar.angle;
    //   }
    //   return polar;
    // }

    private findMouseTarget(tileIx: number, angle): HitTarget {
      let hit1 = this.hitTable[tileIx];
      let foundDelta = 360;
      let foundDelta2 = 360;
      //let move = "";
      //let targetIx: number;
      let target1: HitTarget;
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

    private handlePointerDown = (event: PointerEvent) => {

      // Ignore pointerDown if cube is moving
      if (this.cube.movesSentQueue.length !== 0) {
        return;
      }

      // on pointerDown save X,Y and identify tile under poiner
      this.mousePos1.X = event.clientX;
      this.mousePos1.Y = event.clientY;
      this.showOverlay(Panel.close);
      this.mouseStatus = 1;
      let tileIx = this.cube.mouseGetTile(event);
      if (tileIx !== -1) {
        console.log(`PointerDown ${tileIx}`);
        this.mouseTile1Ix = tileIx;
        this.mouseStatus = 2;
      }
      return false; //TODO Why false
    }

    // Calculate which move to make depending on angle of move
    private handlePointerMove = (event: PointerEvent) => {
      if (this.mouseStatus === 2) {
        let dX = event.x - this.mousePos1.X;
        let dY = event.y - this.mousePos1.Y;
        let distance = Math.sqrt(dX ** 2 + dY ** 2);
        //console.log(`move mouseStatus 2 ${distance} ${this.minimumDistance}`);

        if (distance > this.minimumDistance) {
          let aCos = Math.acos(dX / distance);
          let angle = aCos * 180 / Math.PI;
          if (dY < 0) angle = 360 - angle;

          let hitTarget = this.findMouseTarget(this.mouseTile1Ix, angle);

          if (hitTarget.precise === true) {
            //console.log(`PointerMove - single2`);
            //if (distance > foundTarget.distance / 4) {
            console.log(`move ${hitTarget.move}`);
            if (hitTarget.move !== "  ") {
              //this.cube.sendMoves(hitTarget.move, true, this.cube.mainSpeed);
              this.cube.sendMoves(hitTarget.move, true, 400);
            }
            this.mouseStatus = 3;
          }
        }
      }
    }

    private handlePointerUp = (event: PointerEvent) => {
      if (this.mouseStatus === 3) {
        if (this.cube.movesSentQueue.length !== 0) {
          this.cube.moveSpeed /= 2;
        }
      }
      //TODO Consider speedup on pointerUp
      //this.mouseStatus = 0;
    }

    private handleSettingsPointerDown = ((event: Event) => {
      event.preventDefault();
      let target: HTMLElement = event.currentTarget as HTMLElement;

      let buttonText: string = target.innerText;
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
      else switch (buttonText) {

        case "Slow":
          //TODO: Add checkbox
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

    private handleIconPointerUp = ((event: Event) => {
      console.log(`handleIconPointerUp`);
      let this1 = this;
      let target: HTMLElement = event.currentTarget as HTMLElement;
      const v1 = target.classList;
      switch (target.classList[1]) {
        case "fa-arrow-circle-o-left":
          break;

        case "fa-arrow-circle-o-right":
          if (this.solverPointerTimer !== null) {
            clearTimeout(this.solverPointerTimer);
            this.solverPointerTimer = null;
            this.solver.solverMsg("");
          }
          break;
      }
    });

    private handleIconPointerDown = ((event: Event) => {
      let this1 = this;
      console.log(`handleIconPointerDown`);

      let target: HTMLElement = event.currentTarget as HTMLElement;
      let v1 = target.classList;

      switch (target.classList[1]) {
        case "fa-arrow-circle-o-left":
          this.undoMove();
          break;

        case "fa-arrow-circle-o-right":
          this.solverPointerTimer = setTimeout(() => {
            this.solverPointerTimer = null;
            this.solver.step();
          }, 500);
          break;

        case "fa-question":
          if (this.overlay === Panel.help) this.showOverlay(Panel.closeAll);
          else this.showOverlay(Panel.help);
          break;

        case "fa-ellipsis-h":
          if (this.overlay !== Panel.closeAll) this.showOverlay(Panel.closeAll);
          else this.showOverlay(Panel.menu);
          break;

        case "fa-home":
          this.showOverlay(Panel.closeAll);
          this.cube.resetTileColors();
          this.solver.solverMsg("");
          this.cube.sendMoves("X Z X'Y H ", true, 100);
          break;

        case "fa-random":
          this.showOverlay(Panel.closeAll);
          this.cube.scramble();
          this.solver.solverMsg("");
          break;

        case "fa-arrow-left":
          break;

        case "fa-cog":
          break;
      }
      return false;
    });

    private undoMove = (): void => {
      this.solver.solverMoves = "";
      if (this.cube.doneMoves.length > 0) {
        // Get previous move and undo it
        let move = this.cube.doneMoves[this.cube.doneMoves.length - 1];
        move = move.substr(0, 1)
          + (move.substr(1, 1) === "'" ? " " : "'");
        //TODO should we add move to redo table
        this.cube.sendMoves(move, true, this.cube.mainSpeed);
      }
    }

    private hideShowLabels(show: boolean): void {
      for (let i = 0; i < this.labels.length; ++i) {
        if (show) this.labels[i].style.display = "block";
        else this.labels[i].style.display = "none";
      }
    }

    private showOverlay(newPanel: Panel): void {
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
      if (newPanel === Panel.closeAll) this.overlay = Panel.closeAll;
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

    private showAboutPanel(): void {
      let navbar1 = document.getElementById("navbar1");
      let gameDiv1 = document.getElementById("gamediv");
      let buttons = document.getElementById("buttons");
      let solvermessage = document.getElementById("solvermessage");

      let matrixIdentity: BABYLON.Matrix = BABYLON.Matrix.Identity();
      let transformMatrix: BABYLON.Matrix = this.scene.getTransformMatrix();
      let viewPort: BABYLON.Viewport = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());

      let x1 = 100000;
      let x2 = -10000;
      let y1 = 100000;
      let y2 = -100000;
      for (let j = 0; j < 4; ++j) {
        let face: CubeFace;
        let relTile: number;
        switch (j) {
          case 0: face = 0; relTile = 0; break;
          case 1: face = 0; relTile = 8; break;
          case 2: face = 4; relTile = 0; break;
          case 3: face = 4; relTile = 2; break;
        }
        let tile = Cube.getTile(face, relTile);
        let mesh2 = tile.mesh.getChildren()[0] as BABYLON.Mesh;
        let box = mesh2._boundingInfo.boundingBox.vectorsWorld;
        for (let v3 of box) {
          let p: BABYLON.Vector3 = BABYLON.Vector3.Project(
            v3, matrixIdentity, transformMatrix, viewPort);
          if (p.x > x2) x2 = p.x;
          if (p.x < x1) x1 = p.x;
          if (p.y > y2) y2 = p.y;
          if (p.y < y1) y1 = p.y;
        }
      }

      this.panelAbout.innerHTML = `\u00A9 2017 David Lewis dlewis@svcondor.com<br>`
        + `Cube Xmin ${x1.toFixed(0)} max ${x2.toFixed(0)} Ymin ${y1.toFixed(0)} max ${y2.toFixed(0)}<br>`
        + `gamediv W-${gameDiv1.clientWidth} H-${gameDiv1.clientHeight} Window W-${window.innerWidth} H-${window.innerHeight}<br>`
        + `buttons W-${buttons.clientWidth} L-${buttons.clientLeft} B-${buttons.clientTop}`
        + `Pointerdown X-${this.mousePos1.X} Y-${this.mousePos1.Y}`;

      this.panelCrib.innerHTML = "";
    }

    private resizeCanvas(): void {
      let gameDiv1 = document.getElementById("gamediv");
      let navbar1 = document.getElementById("navbar1");
      let panelHelp = document.getElementById("panelHelp");
      if (gameDiv1 && navbar1 && panelHelp) {
        gameDiv1.style.width = `${window.innerWidth}px`;
        gameDiv1.style.height = `${document.documentElement.clientHeight - navbar1.clientHeight}px`;
        panelHelp.style.height = `${(document.documentElement.clientHeight - navbar1.clientHeight) * 0.8}px`;
        //this.positionButtons();
      }
    }

    private positionButtons(): void {
      let navbar1 = document.getElementById("navbar1");
      let gameDiv1 = document.getElementById("gamediv");
      let buttons = document.getElementById("buttons");
      let solvermessage = document.getElementById("solvermessage");
      console.log(`gamediv W-${gameDiv1.clientWidth} H-${gameDiv1.clientHeight} Window W-${window.innerWidth} H-${window.innerHeight}`);

      let matrixIdentity: BABYLON.Matrix = BABYLON.Matrix.Identity();
      let transformMatrix: BABYLON.Matrix = this.scene.getTransformMatrix();
      let viewPort: BABYLON.Viewport = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
      //var v5 = this.engine.getHardwareScalingLevel();
      //console.log(`Camera S-${v5} W-${this.engine.getRenderWidth()} H-${this.engine.getRenderHeight()}`);
      let x1 = 100000;
      let x2 = -10000;
      let y1 = 100000;
      let y2 = -100000;
      for (let j = 0; j < 4; ++j) {
        let face: CubeFace;
        let relTile: number;
        switch (j) {
          case 0: face = 0; relTile = 0; break;
          case 1: face = 0; relTile = 8; break;
          case 2: face = 4; relTile = 0; break;
          case 3: face = 4; relTile = 2; break;
          default: face = 0; relTile = 0; break;
        }
        let tile = Cube.getTile(face, relTile);
        let mesh2 = tile.mesh.getChildren()[0] as BABYLON.Mesh;
        if (mesh2 && mesh2._boundingInfo) {
          let box = mesh2._boundingInfo.boundingBox.vectorsWorld;
          for (let v3 of box) {
            let p: BABYLON.Vector3 = BABYLON.Vector3.Project(
              v3, matrixIdentity, transformMatrix, viewPort);
            //console.log(p.x, p.y);
            if (p.x > x2) x2 = p.x;
            if (p.x < x1) x1 = p.x;
            if (p.y > y2) y2 = p.y;
            if (p.y < y1) y1 = p.y;
          }
        }
      }
      console.log(`Cube Xmin ${x1.toFixed(0)} max ${x2.toFixed(0)} Ymin ${y1.toFixed(0)} max ${y2.toFixed(0)}`);

      //buttons.style.bottom = `${navbar1.clientHeight + 50}px`;
      buttons.style.bottom = `${navbar1.clientHeight + 5}px`;
      buttons.style.width = `${(x2 - x1).toFixed(0)}px`;
      buttons.style.left = `${x1.toFixed(0)}px`;
    }

    private getCubeWidth(): void {
    }
  }

  // Instantiate the main App class once everything is loaded
  window.addEventListener("DOMContentLoaded", () => {
    //TODO: Splash Screen
    const mainApp = new MainApp();
  });
}
