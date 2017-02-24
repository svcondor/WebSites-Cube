/// <reference path="../typings/index.d.ts" />

module App2 {
  //TODO: make CubeFace.U Enum 2
  //TODO: Swap some antiClockmoves with clockMoves
  export var this2: any;
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

  interface Polar {
    distance: number;
    angle: number;
  }

  enum Panel {
    close = 0,
    help = 1,
    menu = 2,
    about = 3
  }

  class MainApp {

    public aaSignature = "MainApp";
    private solverPointerTimer: number = 0;
    //private stepDirection: number = -1;
    private iconUndo: HTMLElement;
    private iconRedo: HTMLElement;
    private scene: BABYLON.Scene;
    private cube: Cube;
    private solver: Solver;

    private mouseStatus: number = 0;
    private mousePos1: Point = { X: 0, Y: 0 };   // Mouse position on canvas 
    private mouseDistance = 0;
    private minimumDistance: number;
    private mouseMove: string = "";
    private hitMaximum: number;
    private mousePos2: Point = { X: 0, Y: 0 };
    private mouseMesh1: BABYLON.AbstractMesh;
    private mouseTile1Ix: number;
    private mouseTargetIx: number;
    private panelHelp: HTMLElement;
    private panelMenu: HTMLElement;
    private panelAbout: HTMLElement;
    private labels: HTMLCollectionOf<HTMLElement>;
    private overlay: Panel = Panel.close;
    private interval1: number;
    private engine: BABYLON.Engine;
    private camera: BABYLON.FreeCamera;
    private hitTable: HitEntry[];
    private fastSpeed: boolean = false;   // Rotation speed in ms

    constructor() {
      this2 = this;

      //http://stackoverflow.com/questions/16152609/importing-external-html-inner-content-with-javascript-ajax-without-jquery
      let url = "help1.html";
      let xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          document.getElementById("panelHelp").innerHTML = xmlhttp.responseText;
          let v4 = 34;
        }
      }
      xmlhttp.open("GET", url, true);
      xmlhttp.send();

      let v2 = 2; //dummy
      BABYLON.Engine.CodeRepository = "/Babylon/src/";
      BABYLON.Engine.ShadersRepository = "/Babylon/src/Shaders/";
      this.resizeCanvas();

      let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
      let engine = new BABYLON.Engine(canvas, true);
      this.engine = engine;

      window.addEventListener('resize', () => {
        //TODO add timer to reduce flashing
        this.resizeCanvas();
        engine.resize();
        this.cube.renderScene();
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
      let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(10, 7, -15), this.scene);
      this.camera = camera;
      camera.setTarget(new BABYLON.Vector3(-.07, -1.2, 0)); // was 0,0,0
      camera.fov = 0.35;  //0.33 for iphone 5   //0.35 Nokia 930
      //let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, -1), this.scene);
      this.cube = new Cube(this.scene, engine);
      this.cube.renderScene();
      this.positionButtons();
      this.solver = new Solver(this.cube);

      let icons = document.getElementsByClassName("fa");
      this.panelHelp = document.getElementById("panelHelp");
      this.panelMenu = document.getElementById("panelMenu");
      this.panelAbout = document.getElementById("panelAbout");
      this.labels = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName("label");

      for (let i = 0; i < icons.length; ++i) {
        let icon = icons[i];
        if (icon.classList.contains("fa-arrow-circle-o-left")) {
          this.iconUndo = <HTMLElement>icon;
        }
        else if (icon.classList.contains("fa-arrow-circle-o-right")) {
          this.iconRedo = <HTMLElement>icon;
          //let s1 = this.iconRedo.className;
          //let s2 = s1.replace(" disabled", "");
          //this.iconRedo.className = s2;
          //let v2 = 34;
        }
        icon.addEventListener("pointerdown", this.handleIconPointerDown);
        icon.addEventListener("pointerup", this.handleIconPointerUp);
      }

      let settings = document.getElementsByTagName("li");
      for (let i = 0; i < settings.length; ++i) {
        let setting = settings[i];
        if (setting.innerText === "Fast") {
          this.fastSpeed = true;
        }
        //setting.addEventListener("click", this.handleSettingsClick);
        setting.addEventListener("pointerdown", this.handleSettingsPointerDown);
      }

      this.cube.renderScene();
      this.loadRawHitData();
      this.buildHitTester();

      let canvas1 = document.getElementById("renderCanvas");
      canvas1.addEventListener("pointerdown", this.handlePointerDown);
      canvas1.addEventListener("pointermove", this.handlePointerMove);
      canvas1.addEventListener("pointerup", this.handlePointerUp);

      canvas1.addEventListener("pointerleave", (event: PointerEvent) => {
        this.mouseStatus = 0;
      });

      engine.runRenderLoop(() => {
        //TODO only render when moving
        this.cube.renderScene();
      });
    }

    private showIcon(icon: HTMLElement, show: boolean): void {
      let className = icon.className;
      let pos1 = className.indexOf(" disabled");
      if (show && pos1 !== -1) {
        icon.className = className.replace(" disabled", "");
      }
      else if (!show && pos1 === -1) {
        icon.className += " disabled";
      }
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

      let matrixIdentity: BABYLON.Matrix = BABYLON.Matrix.Identity();
      let transformMatrix: BABYLON.Matrix = this.scene.getTransformMatrix();
      let viewPort: BABYLON.Viewport = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());


      for (let face: CubeFace = 0; face < 6; ++face) {
        if (face === CubeFace.F || face === CubeFace.U || face === CubeFace.R) {
          //console.log("");
          //console.log(`${CubeFace[face]}`);
          for (let i = 0; i < 9; ++i) {
            let tile1: Tile = Cube.tile(face, i);
            let mesh1: BABYLON.Mesh = tile1.mesh;
            let vector3: BABYLON.Vector3 = tile1.mesh.absolutePosition;
            let p: BABYLON.Vector3 = BABYLON.Vector3.Project(
              vector3, matrixIdentity, transformMatrix, viewPort);
            let tileIx = face * 9 + i;
            let hit1 = this.hitTable[tileIx];
            console.assert(tileIx === hit1.tileIx, `buildHitTester tileIx ${tileIx} ${hit1.tileIx}`);
            hit1.X = Math.round(p.x);
            hit1.Y = Math.round(p.y);
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
      this.hitMaximum = this.hitTable[1].X - this.hitTable[0].X;
      this.minimumDistance = totalDistance / 27 / 4 / 6;   // was / 27 / 4 / 4
    }

    private getPolar(dX: number, dY: number): Polar {
      let polar: Polar = { distance: 0, angle: 0 };
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
        //delay3(this);
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
    }

    private handlePointerMove = (event: PointerEvent) => {
      let this1 = this;
      if (this.mouseStatus !== 0) {
      }

      if (this.fastSpeed && this.mouseStatus === 3) {
        //let dX2 = event.x - this.mousePos2.X;
        //let dY2 = event.y - this.mousePos2.Y;
        //let polar = this.getPolar(dX2, dY2);
        //if (polar.distance < this.minimumDistance) {
        //  return;
        //}
        //let hitTarget = this.findMouseTarget(this.mouseTargetIx, polar.angle);
        //if (hitTarget.move.charAt(0) === this.mouseMove.charAt(0)) {
        //  // move double or back
        //  let dX = event.x - this.mousePos1.X;
        //  let dY = event.y - this.mousePos1.Y;
        //  let distance = Math.sqrt(dX ** 2 + dY ** 2);
        //  if (distance < this.mouseDistance - this.minimumDistance) {
        //    this.mouseMove = hitTarget.move;
        //    if (this.cube.targetAngle !== 0) {
        //      console.log(`handlePointerMove fastback ${this.mouseMove} ${this.cube.targetAngle}`);
        //      this.cube.rotateTable(this.mouseMove, false, 0);
        //      this.cube.targetAngle *= -1;
        //      this.cube.currentAngle += this.cube.targetAngle;
        //      //this.scene.render();

        //    }
        //    else {
        //      console.log(`handlePointerMove slowback ${this.mouseMove}`);
        //     this.cube.rotateTable(this.mouseMove, true, this.cube.moveSpeed);
        //      this.mouseDistance = 0;
        //      this.mousePos2.X = 0;
        //      this.mousePos2.Y = 0;
        //    }
        //    this.mouseStatus = 0;
        //    return;
        //  }
        //  else if (distance > this.mouseDistance) {
        //    if (distance < this.minimumDistance * 12) {  //was 4 then 9
        //      this.mouseDistance = distance;
        //      this.mousePos2.X = event.x;
        //      this.mousePos2.Y = event.y;
        //    }
        //    else {
        //      // Double rotate logic removed for now
        //      //if (this.cube1.targetAngle !== 0) {
        //      //  this.mouseStatus = 0;
        //      //  console.log(`PointerMove - Double`);
        //      //  let fastStartTime = new Date().valueOf() - 0.90 * this.cube1.moveSpeed;
        //      //  if (fastStartTime < this.cube1.startTime) this.cube1.startTime = fastStartTime
        //      //  setTimeout(() => {
        //      //    if (this.cube1.targetAngle !== 0) {
        //      //      this.cube1.startTime = 0;
        //      //      this.scene.render();
        //      //    }
        //      //    console.assert(this.cube1.targetAngle === 0, "handlePointermMove Double move error 1");
        //      //    this.cube1.rotateTable(this.mouseMove, true, this.cube1.moveSpeed);
        //      //  }, this.cube1.moveSpeed * 0.1);
        //      //}
        //    }
        //    return;
        //  }
        //}
        //else if (hitTarget.precise === true && polar.distance > this.minimumDistance) {

        //  //// right angle move logic removed for now
        //  //let tileIx = this.mouseTargetIx;
        //  //let move = hitTarget.move;
        //  //let tile = tileIx % 9;
        //  //if (tile % 2 === 1) {
        //  //  tileIx = this.mouseTile1Ix;
        //  //  tile = tileIx % 9;
        //  //  if (tile % 2 === 1)
        //  //    return;
        //  //  let targets: HitTarget[] = this.hitTable[this.mouseTargetIx].targets;
        //  //  for (let i = 0; i < 4; ++i) {
        //  //    if (hitTarget === targets[i]) {
        //  //      targets = this.hitTable[this.mouseTile1Ix].targets;
        //  //      move = targets[i].move;
        //  //    }
        //  //  }
        //  //}
        //  //if (this.cube1.targetAngle !== 0) {
        //  //  this.mouseStatus = 0;
        //  //  console.log(`PointerMove - L move`);
        //  //  let fastStartTime = new Date().valueOf() - 0.90 * this.cube1.moveSpeed;
        //  //  if (fastStartTime < this.cube1.startTime) this.cube1.startTime = fastStartTime
        //  //  setTimeout(() => {
        //  //    if (this.cube1.targetAngle !== 0) {
        //  //      this.cube1.startTime = 0;
        //  //      this.scene.render();
        //  //    }
        //  //    console.assert(this.cube1.targetAngle === 0, "handlePointermMove L move error 1");
        //  //    this.cube1.rotateTable(move, true, this.cube1.moveSpeed);
        //  //  }, this.cube1.moveSpeed * 0.1);
        //  //}

        //}
      }

      else if (this.mouseStatus === 2) {
        console.assert(this.cube.targetAngle === 0, "mousestatus 2 target != 0");
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
            console.log(`PointerMove - single2`);
            //if (distance > foundTarget.distance / 4) {
            if (this.cube.targetAngle != 0) {
            }
            this.mouseMove = hitTarget.move;
            console.log(`move ${this.mouseMove}`);

            this.cube.rotateTable(this.mouseMove, true, this.cube.mainSpeed);
            this.mouseDistance = distance;
            this.mouseTargetIx = Math.abs(hitTarget.targetIx);
            this.mousePos2.X = event.x;
            this.mousePos2.Y = event.y;
            this.mouseStatus = 3;
          }
        }
      }
    }

    private handlePointerUp = (event: PointerEvent) => {
      console.log(`PointerUp`);
      if (this.cube.targetAngle !== 0 && this.fastSpeed) {
        let fastStartTime = new Date().valueOf() - .90 * this.cube.moveSpeed;
        if (fastStartTime < this.cube.startTime) this.cube.startTime = fastStartTime;
      }
      this.mouseStatus = 0;
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
          this.showOverlay(Panel.close);
          break;

        case "Fast":
          target.innerText = "Slow";
          this.fastSpeed = false;
          this.showOverlay(Panel.close);
          break;

        case "Help":
          this.showOverlay(Panel.help);
          break;

        case "About":
          this.showOverlay(Panel.about);
          break;
      }
      return false;
    });

    private handleIconPointerUp = ((event: Event) => {
      console.log(`handleIconPointerUp`);
      let this1 = this;
      let target: HTMLElement = event.currentTarget as HTMLElement;
      let v1 = target.classList;
      switch (target.classList[1]) {
        case "fa-arrow-circle-o-left":
          break;

        case "fa-arrow-circle-o-right":
          clearTimeout(this.solverPointerTimer);
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
            this.solver.step();
            return;
          }, 1000);
          this.solver.solverMsg("");
          this.doTutorMove();
          break;

        case "fa-question":
          if (this.overlay === Panel.help) this.showOverlay(Panel.close);
          else this.showOverlay(Panel.help);
          break;

        case "fa-ellipsis-h":
          if (this.overlay !== Panel.close) this.showOverlay(Panel.close);
          else this.showOverlay(Panel.menu);
          break;

        case "fa-home":
          this.showOverlay(Panel.close);
          this.cube.resetTileColors();
          this.solver.reset();
          break;

        case "fa-random":
          this.showOverlay(Panel.close);
          this.cube.scramble();
          this.solver.reset();
          break;

        case "fa-arrow-left":
          break;

        case "fa-cog": break;
      }
      return false;
    });

    private doTutorMove = (...rest: any[]): void => {
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
        if (this.solver.solverMoves.length > 4 && this.solver.solverMoves.substr(0, 3) == "msg") {
          let msg = document.getElementById("solvermessage");
          msg.innerText = this.solver.solverMoves.substr(3);
          this.solver.solverMoves = "";
          return;
        }

      }
      if (this.solver.solverMoves.length > 0) {
        let move: string;
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
    }


    private finishMove(function1: any, ...rest: any[]): void {
      if (MainApp.finishMoveReEnter) {
        console.log("finishMove reEnter");

        //return;
      }
      MainApp.finishMoveReEnter = true;
      let fastStartTime = new Date().valueOf() - 0.90 * this.cube.moveSpeed;
      if (fastStartTime < this.cube.startTime) this.cube.startTime = fastStartTime;
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
      //TODO fine tune above speed
    }
    private static finishMoveReEnter: boolean = false;

    private undoMove = (): void => {
      this.solver.reset();
      if (this.cube.targetAngle !== 0) {
        this.finishMove(this.undoMove);
        this.mouseStatus = 0;
        console.log(`undo move call 1`);
        return;
      }
      //let d1 = new Date().
      console.log(`undo move call 2`);
      this.solver.solverMoves = "";
      //this.showOverlay(0);
      let s1: string = this.cube.doneMoves;
      let antiClock = "'";
      for (let len1: number = s1.length; len1 > 0; --len1) {
        let next: string = s1.substr(len1 - 1, 1);
        if (next === " ") { }
        else if (next === "'") {
          antiClock = " ";
        }
        else {
          if (this.cube.moveCodes.indexOf(next) !== -1) {
            let move = next + antiClock;
            //TODO add move to redo table
            this.cube.rotateTable(move, true, this.cube.mainSpeed);
            this.cube.doneMoves = s1.substr(0, len1 - 1);
            this.cube.movesCount -= 1;
            let s2 = document.getElementById("ScoreBox");
            s2.innerText = this.cube.movesCount.toString();
          }
          break;
        }
      }

    }

    private hideShowLabels(show: boolean): void {
      for (let i = 0; i < this.labels.length; ++i) {
        if (show) this.labels[i].style.display = "block";
        else this.labels[i].style.display = "none";
      }
    }

    private showOverlay(newPanel: Panel): void {
      // 0 - off
      // 1 help
      // 2 settings
      // 3 About

      ////TODO Add code to animate panel display
      //if (panelHelp.style.maxHeight) {
      //  panelHelp.style.maxHeight = null;
      //} else {
      //  //panelHelp.style.maxHeight = panelHelp.scrollHeight + "px";
      //  panelHelp.style.maxHeight = "400" + "px";
      //} 

      if (this.overlay === Panel.help) {
        this.panelHelp.style.display = "none";
      }
      else if (this.overlay === Panel.menu) {
        this.hideShowLabels(false);
        this.panelMenu.style.display = "none";
      }
      else if (this.overlay === Panel.about) {
        this.panelAbout.style.display = "none";
      }
      this.overlay = newPanel;
      if (newPanel === Panel.close) this.overlay = Panel.close;
      else if (newPanel === Panel.help) {
        this.panelHelp.style.display = "block";
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
        let tile = Cube.tile(face, relTile);
        let mesh2 = <BABYLON.Mesh>tile.mesh.getChildren()[0];
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
    }

    private resizeCanvas(): void {
      let gameDiv1 = document.getElementById("gamediv");
      let navbar1 = document.getElementById("navbar1");
      gameDiv1.style.width = `${window.innerWidth}px`;
      gameDiv1.style.height = `${document.documentElement.clientHeight - navbar1.clientHeight}px`;
      let panelHelp = document.getElementById("panelHelp");
      panelHelp.style.height = `${(document.documentElement.clientHeight - navbar1.clientHeight) * 0.8}px`;
      //this.positionButtons();
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
        let tile = Cube.tile(face, relTile);
        let mesh2 = <BABYLON.Mesh>tile.mesh.getChildren()[0];
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
      console.log(`Cube Xmin ${x1.toFixed(0)} max ${x2.toFixed(0)} Ymin ${y1.toFixed(0)} max ${y2.toFixed(0)}`);


      //buttons.style.bottom = `${navbar1.clientHeight + 50}px`;
      buttons.style.bottom = `${navbar1.clientHeight + 5}px`;
      //let h1 = gameDiv1.clientHeight / 1.5;
      //if (navbar1.clientWidth > h1) {
        //buttons.style.width = `${h1}px`;
        //buttons.style.left = `${(navbar1.clientWidth - h1) / 2}px`;
       //buttons.style.width = `${(x2-x1).toFixed(0)}px`;
       buttons.style.left = `${x1.toFixed(0)}px`;
       buttons.style.width = `${(navbar1.clientWidth - 2 * x1).toFixed(0)}px`;

        //buttons.style.width = `${h1}px`;
        //buttons.style.left = `${(navbar1.clientWidth - h1) / 2}px`;
      //}
      //else {
      //  buttons.style.width = `100%`;
      //  buttons.style.left = `0px`;
      //}
    }

    private getCubeWidth(): void {

      //  console.log(`1-${window.innerWidth} 2-${document.documentElement.clientWidth} 3-${screen.width}`);
      //  console.log(`1-${window.innerHeight} 2-${document.documentElement.clientHeight} 3-${screen.height}`);
      //  //1 - 1181 2- 1181 3- 1536  zoom 125 1920 zoom 100
      //  //1 - 665 2- 665 3- 864 zoom 125 1080 zoom 100
      //  //Detect viewport orientation
      //  // http://stackoverflow.com/questions/4917664/detect-viewport-orientation-if-orientation-is-portrait-display-alert-message-ad
    }
  }

  // Instantiate the main App class once everything is loaded
  window.addEventListener('DOMContentLoaded', () => {
    //TODO: Splash Screen
    let mainApp = new MainApp();
  });
}