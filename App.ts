/// <reference path="../typings/index.d.ts" />

module App2 {
  //import { Cube } from "Cube";

  //TODO: make CubeFace.U Enum 2
  //TODO: Swap some antiClockmoves with clockMoves

  //https://github.com/icflorescu/iisexpress-proxy
  // npm install -g iisexpress-proxy
  //iisexpress-proxy 55537 to 6000

  interface HitTarget {
    distance?: number;
    angle?: number;
    targetIx: number;
    move: string;
    precise?: boolean;
  }

  interface HitEntry {
    x?: number;
    y?: number;
    tileIx: number;
    targets?: HitTarget[];
  }

  interface Polar {
    distance: number;
    angle: number;
  }

  class MainApp {
    public signature = "MainApp";
    private scene: BABYLON.Scene;
    public cube1: Cube;
    private mouseStatus: number = 0;
    private mouseX1: number = 0;
    private mouseY1: number = 0;
    private mouseDistance = 0;
    private minimumDistance: number;
    private mouseMove: string = "";
    private hitMaximum: number;
    private mouseX2: number = 0;
    private mouseY2: number = 0;
    private mouseMesh1: BABYLON.AbstractMesh;
    private mouseMesh2: BABYLON.AbstractMesh;
    private mouseTile1Ix: number;
    private mouseTargetIx: number;
    private panel1: HTMLElement;
    private panel2: HTMLElement;
    private labels: HTMLCollectionOf<HTMLElement>;
    private overlay: number = 0;
    private interval1: number;
    private engine: BABYLON.Engine;
    private camera: BABYLON.FreeCamera;
    private hitTable: HitEntry[];

    constructor() {
      //let url = 'cube/version.txt';
      //let xhr = new XMLHttpRequest();
      //xhr.onreadystatechange = () => {
      //  if (xhr.readyState == 4) {
      //    console.log(xhr.responseText);
      //  }
      //};
      //xhr.open("GET", url, true);
      //xhr.send();

      let v2 = 2; //dummy
      BABYLON.Engine.CodeRepository = "/Babylon/src/";
      BABYLON.Engine.ShadersRepository = "/Babylon/src/Shaders/";

      let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
      let engine = new BABYLON.Engine(canvas, true);
      this.engine = engine;

      window.addEventListener('resize', () => {
        resizeCanvas();
        engine.resize();
        this.scene.render();
        this.buildHitTester();
      });
      this.scene = new BABYLON.Scene(engine);
      this.scene.clearColor = new BABYLON.Color4(.5, 0.5, 0.5, 1);
      let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(7, 7, -15), this.scene);
      this.camera = camera;
      camera.setTarget(BABYLON.Vector3.Zero());

      camera.fov = 0.40; //0.35; //0.5 //0.27;
      //let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, -1), this.scene);

      this.cube1 = new Cube(this.scene, engine);

      //let buttons = document.getElementsByTagName("button");
      //for (let i = 0; i < buttons.length; ++i) {
      //  let button = buttons[i];
      //  let v2 = button.innerText;
      //  if (v2 !== "Help") {
      //    button.addEventListener("click", this.handleButtonClick);
      //  }
      //}

      let icons = document.getElementsByClassName("fa");
      this.panel1 = document.getElementById("panel1");
      this.panel2 = document.getElementById("panel2");
      this.labels = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName("label");

      for (let i = 0; i < icons.length; ++i) {
        let icon = icons[i];
        icon.addEventListener("click", this.handleIconClick);
      }

      let settings = document.getElementsByTagName("li");
      for (let i = 0; i < settings.length; ++i) {
        let setting = settings[i];
        setting.addEventListener("click", this.handleSettingsClick);
      }

      this.scene.render();
      this.loadRawHitData();
      this.buildHitTester();

      let canvas1 = document.getElementById("renderCanvas");
      canvas1.addEventListener("pointerdown", this.handlePointerDown);
      canvas1.addEventListener("pointermove", this.handlePointerMove);
      canvas1.addEventListener("pointerup", this.handlePointerUp);

      canvas1.addEventListener("pointerleave", (event: PointerEvent) => {
        this.mouseStatus = 0;
      });

      //this.animate(engine, this.scene);
      engine.runRenderLoop(() => {
        this.scene.render();
      });
    }

    private loadRawHitData(): void {
      let rawData: any = [
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
        [44, 41, 2, 43, 9, "R R'F'F "]
      ];
      this.hitTable = new Array(27);
      for (let v1 of rawData) {
        let moves: string = v1[5];
        let hit1: HitEntry = {
          tileIx: v1[0], targets: [
            { targetIx: v1[1], move: moves.substr(0, 2) },
            { targetIx: v1[2], move: moves.substr(2, 2) },
            { targetIx: v1[3], move: moves.substr(4, 2) },
            { targetIx: v1[4], move: moves.substr(6, 2) }]
        };
        this.hitTable[hit1.tileIx] = hit1;
        //this.hitTable.push(hit1);
      }
      let v1 = this.hitTable.length;
      let v3 = 0;
      for (let v2 of this.hitTable) {
        if (v2)++v3;
      }
      let v4 = v3;
    }

    private buildHitTester(): void {

      //this.hitTable = new Array();
      let matrixIdentity: BABYLON.Matrix = BABYLON.Matrix.Identity();
      let transformMatrix: BABYLON.Matrix = this.scene.getTransformMatrix();
      let viewPort: BABYLON.Viewport = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
      for (let face: CubeFace = 0; face < 6; ++face) {
        if (face === CubeFace.F || face === CubeFace.U || face === CubeFace.R) {
          //console.log("");
          //console.log(`${CubeFace[face]}`);
          for (let i = 0; i < 9; ++i) {
            let v1 = new BABYLON.Vector2(2, 1);
            let tile1: Tile = Cube.tile(face, i);
            let mesh1: BABYLON.Mesh = tile1.mesh;
            let vector3: BABYLON.Vector3 = tile1.mesh.absolutePosition;
            let p: BABYLON.Vector3 = BABYLON.Vector3.Project(
              vector3, matrixIdentity, transformMatrix, viewPort);
            let tileIx = face * 9 + i;
            let hit1 = this.hitTable[tileIx];
            console.assert(tileIx === hit1.tileIx, `buildHitTester tileIx ${tileIx} ${hit1.tileIx}`);
            hit1.x = Math.round(p.x);
            hit1.y = Math.round(p.y);
            //this.hitTable.push({ x: Math.floor(p.x), y: Math.floor(p.y), tileIx: face * 9 + i });
            //console.log(`${i} ${TileColor[tile1.color]} X ${Math.floor(p.x)} Y ${Math.floor(p.y)}`);
          }
        }
      }
      let totalDistance = 0;
      for (let hit1 of this.hitTable) {
        if (!hit1) continue;
        for (let target of hit1.targets) {
          let targetHit: HitEntry = this.hitTable[Math.abs(target.targetIx)];
          let dX = targetHit.x - hit1.x;
          let dY = targetHit.y - hit1.y;
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
      this.hitMaximum = this.hitTable[1].x - this.hitTable[0].x;
      this.minimumDistance = totalDistance / 27 / 4 / 6;   // was / 27 / 4 / 4
    }

    private getPolar(dX: number, dY: number): Polar {
      let polar: Polar = {distance:0, angle:0 };
      polar.distance = Math.sqrt(dX ** 2 + dY ** 2);
      let aCos = Math.acos(dX / polar.distance);
      if (polar.distance !== 0) {
        polar.angle = aCos * 180 / Math.PI;
        if (dY < 0) polar.angle = 360 - polar.angle;
      }
      return polar;
    }

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
          foundDelta = deltaAngle
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
      let this1 = this;
      this.showOverlay(0);
      if (this.cube1.targetAngle !== 0) {
        if (this.cube1.fastSpeed !== true)
          return;
        this.cube1.startTime = 0;
        this.scene.render();
        console.assert(this.cube1.targetAngle === 0, "handlePointerDown error 1");
      }
      if (this.cube1.targetAngle === 0) {
        this.mouseStatus = 1;
        //delay3(this);
        let tileIx = this.cube1.mouseGetTile1(event);
        if ((tileIx >= 0 && tileIx < 18) || (tileIx >= 36 && tileIx < 45)) {
          console.log(`PointerDown ${tileIx}`);
          this.mouseTile1Ix = tileIx;
          this.mouseStatus = 2;
          this.mouseX1 = event.clientX;
          this.mouseY1 = event.clientY;
        }
        else {
          console.log(`PointerDown error 2 ${tileIx}`);
        }
      }
    }

    private handlePointerMove = (event: PointerEvent) => {
      let this1 = this;
      if (this.mouseStatus !== 0) {
      }

      if (this.cube1.fastSpeed && this.mouseStatus === 3) {
        let dX2 = event.x - this.mouseX2;
        let dY2 = event.y - this.mouseY2;
        let polar = this.getPolar(dX2, dY2);
        if (polar.distance < this.minimumDistance) {
          return;
        }
        let hitTarget = this.findMouseTarget(this.mouseTargetIx, polar.angle);
        if (hitTarget.move.charAt(0) === this.mouseMove.charAt(0)) {
          // move double or back
          let dX = event.x - this.mouseX1;
          let dY = event.y - this.mouseY1;
          let distance = Math.sqrt(dX ** 2 + dY ** 2);
          if (distance < this.mouseDistance - this.minimumDistance) {
            this.mouseMove = hitTarget.move;
            if (this.cube1.targetAngle != 0) {
              this.cube1.rotateTable(this.mouseMove, false, 0);
              this.cube1.targetAngle *= -1;
              this.cube1.currentAngle += this.cube1.targetAngle;
            }
            else {
              this.cube1.rotateTable(this.mouseMove, true, this.cube1.moveSpeed);
              this.mouseDistance = 0;
              this.mouseX2 = 0;
              this.mouseY2 = 0;
            }
            this.mouseStatus = 0;
            return;
          }
          else if (distance > this.mouseDistance) {
            if (distance < this.minimumDistance * 12) {  //was 4 then 9
              this.mouseDistance = distance;
              this.mouseX2 = event.x;
              this.mouseY2 = event.y;
            }
            else {
              if (this.cube1.targetAngle !== 0) {
                this.mouseStatus = 0;
                console.log(`PointerMove - Double`);
                let fastStartTime = new Date().valueOf() - 0.90 * this.cube1.moveSpeed;
                if (fastStartTime < this.cube1.startTime) this.cube1.startTime = fastStartTime
                setTimeout(() => {
                  if (this.cube1.targetAngle !== 0) {
                    this.cube1.startTime = 0;
                    this.scene.render();
                  }
                  console.assert(this.cube1.targetAngle === 0, "handlePointermMove Double move error 1");
                  this.cube1.rotateTable(this.mouseMove, true, this.cube1.moveSpeed);
                }, this.cube1.moveSpeed * 0.1);
              }
            }
            return;
          }
        }
        else if (hitTarget.precise === true && polar.distance > this.minimumDistance) {
         
          //// right angle move
          //let tileIx = this.mouseTargetIx;
          //let move = hitTarget.move;
          //let tile = tileIx % 9;
          //if (tile % 2 === 1) {
          //  tileIx = this.mouseTile1Ix;
          //  tile = tileIx % 9;
          //  if (tile % 2 === 1)
          //    return;
          //  let targets: HitTarget[] = this.hitTable[this.mouseTargetIx].targets;
          //  for (let i = 0; i < 4; ++i) {
          //    if (hitTarget === targets[i]) {
          //      targets = this.hitTable[this.mouseTile1Ix].targets;
          //      move = targets[i].move;
          //    }
          //  }
          //}
          //if (this.cube1.targetAngle !== 0) {
          //  this.mouseStatus = 0;
          //  console.log(`PointerMove - L move`);
          //  let fastStartTime = new Date().valueOf() - 0.90 * this.cube1.moveSpeed;
          //  if (fastStartTime < this.cube1.startTime) this.cube1.startTime = fastStartTime
          //  setTimeout(() => {
          //    if (this.cube1.targetAngle !== 0) {
          //      this.cube1.startTime = 0;
          //      this.scene.render();
          //    }
          //    console.assert(this.cube1.targetAngle === 0, "handlePointermMove L move error 1");
          //    this.cube1.rotateTable(move, true, this.cube1.moveSpeed);
          //  }, this.cube1.moveSpeed * 0.1);
          //}

        }
      }

      else if (this.mouseStatus === 2) {
        let dX = event.x - this.mouseX1;
        let dY = event.y - this.mouseY1;
        let distance = Math.sqrt(dX ** 2 + dY ** 2);
        console.log(`move mouseStatus 2 ${distance} ${this.minimumDistance}`);

        if (distance > this.minimumDistance) {

          let aCos = Math.acos(dX / distance);
          let angle = aCos * 180 / Math.PI;
          if (dY < 0) angle = 360 - angle;

          let hitTarget = this.findMouseTarget(this.mouseTile1Ix, angle);

          if (hitTarget.precise === true) {
            console.log(`PointerMove - single`);
            //if (distance > foundTarget.distance / 4) {
            if (this.cube1.targetAngle != 0) {
            }
            this.mouseMove = hitTarget.move;

            this.cube1.rotateTable(this.mouseMove, true, this.cube1.moveSpeed);
            this.mouseDistance = distance;
            this.mouseTargetIx = Math.abs(hitTarget.targetIx);
            this.mouseX2 = event.x;
            this.mouseY2 = event.y;
            this.mouseStatus = 3;
          }
        }
      }
    }

    private handlePointerUp = (event: PointerEvent) => {
      console.log(`PointerUp`);
      if (this.cube1.targetAngle !== 0 && this.cube1.fastSpeed) {
        let fastStartTime = new Date().valueOf() - .90 * this.cube1.moveSpeed;
        if (fastStartTime < this.cube1.startTime) this.cube1.startTime = fastStartTime
      }
      this.mouseStatus = 0;
    }

    //private handleButtonClick = ((event: Event) => {
    //  let target: HTMLElement = event.currentTarget as HTMLElement;
    //  let buttonText = target.innerText;
    //  switch (buttonText) {
    //    case "TestX":
    //      target.innerText = "TestY";
    //      //this.buildHitTester();
    //      this.cube1.moveSpeed = 3000;
    //      break;
    //    case "TestY":
    //      target.innerText = "TestX";
    //      //if (this.cube1.targetAngle !== 0) {
    //      //  this.cube1.startTime = 0;
    //      //}
    //      //this.cube1.moveSpeed = 3000;
    //      break;

    //    case "Slow":
    //      target.innerText = "Fast";
    //      this.cube1.fastSpeed = true;
    //      break;

    //    case "Fast":
    //      target.innerText = "Slow";
    //      this.cube1.fastSpeed = false;
    //      break;

    //    case "Run": break;
    //    case "Redo": break;

    //    case "Undo":
    //      //let textBox = document.getElementById("TextBox");
    //      let s1: string = this.cube1.doneMoves;
    //      let antiClock = "'";
    //      for (let len1: number = s1.length; len1 > 0; --len1) {
    //        let next: string = s1.substr(len1 - 1, 1);
    //        if (next === " ") { }
    //        else if (next === "'") {
    //          antiClock = " ";
    //        }
    //        else {
    //          if (this.cube1.moveCodes.indexOf(next) !== -1) {
    //            let move = next + antiClock;
    //            //TODO add move to redo table
    //            this.cube1.rotateTable(move, true, 300);
    //            this.cube1.doneMoves = s1.substr(0, len1 - 1);
    //            this.cube1.movesCount -= 1;
    //            let s2 = document.getElementById("ScoreBox");
    //            s2.innerText = this.cube1.movesCount.toString();
    //          }
    //          break;
    //        }
    //      }
    //      break;

    //    case "Solve": break;

    //    case "Scramble":
    //      this.cube1.scramble();
    //      break;

    //    case "Reset":
    //      this.cube1.resetTileColors();
    //      break;

    //    default:
    //      if (buttonText.length == 1) {
    //        buttonText += " ";
    //      }
    //      this.cube1.rotateTable(buttonText, true, 300);
    //      break;
    //  }

    //});

    private handleSettingsClick = ((event: Event) => {
      let target: HTMLElement = event.currentTarget as HTMLElement;
      let buttonText = target.innerText;
      switch (buttonText) {

        case "Slow":
          target.innerText = "Fast";
          this.cube1.fastSpeed = true;
          this.showOverlay(0);
          break;

        case "Fast":
          target.innerText = "Slow";
          this.cube1.fastSpeed = false;
          this.showOverlay(0);
          break;

        case "Help":
          this.showOverlay(1);
          break;
      }
    });

    private handleIconClick = ((event: Event) => {
      let target: HTMLElement = event.currentTarget as HTMLElement;
      let v1 = target.classList;

      switch (target.classList[1]) {
        case "fa-question":
          this.panel2.style.display = "none";
          if (this.panel1.style.display === "block") {
            this.panel1.style.display = "none";
          } else {
            this.panel1.style.display = "block";
          }
          //if (panel1.style.maxHeight) {
          //  panel1.style.maxHeight = null;
          //} else {
          //  //panel1.style.maxHeight = panel1.scrollHeight + "px";
          //  panel1.style.maxHeight = "400" + "px";
          //} 
          break;

        case "fa-ellipsis-h":
          if (this.overlay !== 0) {
            this.showOverlay(0);
          }
          else {
            this.showOverlay(2);
          }
          break;

        case "fa-home":
          this.showOverlay(0);
          this.cube1.resetTileColors();
          break;

        case "fa-random":
          this.showOverlay(0);
          this.cube1.scramble();
          break;

        case "fa-arrow-left":
          this.showOverlay(0);
          let s1: string = this.cube1.doneMoves;
          let antiClock = "'";
          for (let len1: number = s1.length; len1 > 0; --len1) {
            let next: string = s1.substr(len1 - 1, 1);
            if (next === " ") { }
            else if (next === "'") {
              antiClock = " ";
            }
            else {
              if (this.cube1.moveCodes.indexOf(next) !== -1) {
                let move = next + antiClock;
                //TODO add move to redo table
                this.cube1.rotateTable(move, true, 300);
                this.cube1.doneMoves = s1.substr(0, len1 - 1);
                this.cube1.movesCount -= 1;
                let s2 = document.getElementById("ScoreBox");
                s2.innerText = this.cube1.movesCount.toString();
              }
              break;
            }
          }
          break;
        case "fa-cog": break;
      }
    });

    private hideShowLabels(show: boolean): void {
      for (let i = 0; i < this.labels.length; ++i) {
        if (show) this.labels[i].style.display = "block";
        else this.labels[i].style.display = "none";
      }
    }

    private showOverlay(overlayIx: number): void {
      // 0 - off
      // 1 help
      // 2 settings
      if (this.overlay === 1) {
        this.panel1.style.display = "none";
      }
      else if (this.overlay === 2) {
        this.hideShowLabels(false);
        this.panel2.style.display = "none";
      }
      if (overlayIx === 0) this.overlay = 0;
      else if (overlayIx === 1) {
        this.panel1.style.display = "block";
        this.overlay = 1;
      }
      else if (overlayIx === 2) {
        this.hideShowLabels(true);
        this.panel2.style.display = "block";
        this.overlay = 2;
      }
    }

    private animate(engine: BABYLON.Engine, scene: BABYLON.Scene): void {
      // run the render loop
      engine.runRenderLoop(() => {
        scene.render();
      });
    }
  }

  function delay3(that: MainApp, delay: number = 0) {
    var that1: MainApp = that;
    if (that1.cube1.targetAngle !== 0) {
      console.log("delay3");
      setTimeout(delay3(that1), 10);
    }
    else {
      //console.log("End delay3");
    }
  }

  function resizeCanvas() {
    let gameDiv1 = document.getElementById("gamediv");
    let navbar1 = document.getElementById("navbar1");
    gameDiv1.style.width = `${window.innerWidth}px`;
    gameDiv1.style.height = `${document.documentElement.clientHeight - navbar1.clientHeight}px`;
    let panel1 = document.getElementById("panel1");
    panel1.style.height = `${(document.documentElement.clientHeight - navbar1.clientHeight) * 0.8}px`;
  }




  // Instantiate the main App class once everything is loaded
  window.addEventListener('DOMContentLoaded', () => {
    //TODO: Splash Screen
    resizeCanvas();
    //http://stackoverflow.com/questions/16152609/importing-external-html-inner-content-with-javascript-ajax-without-jquery
    let url = "help1.html";
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        document.getElementById("panel1").innerHTML = xmlhttp.responseText;
        let v4 = 34;
      }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    let mainApp = new MainApp();
  });

  //(function screensize(): void {
  //  console.log(`1-${window.innerWidth} 2-${document.documentElement.clientWidth} 3-${screen.width}`);
  //  console.log(`1-${window.innerHeight} 2-${document.documentElement.clientHeight} 3-${screen.height}`);
  //  //1 - 1181 2- 1181 3- 1536  zoom 125 1920 zoom 100
  //  //1 - 665 2- 665 3- 864 zoom 125 1080 zoom 100
  //  //Detect viewport orientation
  //  // http://stackoverflow.com/questions/4917664/detect-viewport-orientation-if-orientation-is-portrait-display-alert-message-ad
  //}) ();
}