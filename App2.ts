/// <reference path="../typings/index.d.ts" />

module App3 {

  //https://github.com/icflorescu/iisexpress-proxy
  // npm install -g iisexpress-proxy
  //iisexpress-proxy 55537 to 6000

  class MainApp {
    public signature = "MainAppTestW3";
    public cube1: any;
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

    private interval1: number;
    private engine: BABYLON.Engine;
    private camera: BABYLON.FreeCamera;

    constructor() {

      let v2 = 2; //dummy
      let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

      window.addEventListener('resize', () => {


      });

      let buttons = document.getElementsByTagName("button");
      for (let i = 0; i < buttons.length; ++i) {
        let button = buttons[i];
        let v2 = button.innerText;
        if (v2 !== "Help") {
          button.addEventListener("click", this.handleButtonClick);
        }
      }
      let icons = document.getElementsByClassName("fa");
      for (let i = 0; i < icons.length; ++i) {
        let icon = icons[i];
        icon.addEventListener("click", this.handleIconClick);
      }

      let settings = document.getElementsByTagName("li");
      for (let i = 0; i < settings.length; ++i) {
        let setting = settings[i];
        setting.addEventListener("click", this.handleSettingsClick);
      }


      let canvas1 = document.getElementById("renderCanvas");
      //canvas1.addEventListener("pointerdown", this.handlePointerDown);
      //canvas1.addEventListener("pointermove", this.handlePointerMove);
      //canvas1.addEventListener("pointerup", this.handlePointerUp);

    }


    private handlePointerDown = (event: PointerEvent) => {
      let this1 = this;

    }

    private handlePointerMove = (event: PointerEvent) => {
      let this1 = this;
    }

    private handlePointerUp = (event: PointerEvent) => {
      console.log(`PointerUp`);
    }

    private handleSettingsClick = ((event: Event) => {
      let target: HTMLElement = event.currentTarget as HTMLElement;
      let buttonText = target.innerText;
      switch (buttonText) {

        case "Slow":
          target.innerText = "Fast";
          break;

        case "Fast":
          target.innerText = "Slow";
          break;

        case "Help":
          break;
      }
    });

    private handleIconClick = ((event: Event) => {
      let target: HTMLElement = event.currentTarget as HTMLElement;
      let v1 = target.classList;
      let panel1 = document.getElementById("panel1");
      let panel2 = document.getElementById("panel2");

      switch (target.classList[1]) {
        case "fa-question":
          panel2.style.display = "none";
          if (panel1.style.display === "block") {
            panel1.style.display = "none";
          } else {
            panel1.style.display = "block";
          }
          //if (panel1.style.maxHeight) {
          //  panel1.style.maxHeight = null;
          //} else {
          //  //panel1.style.maxHeight = panel1.scrollHeight + "px";
          //  panel1.style.maxHeight = "400" + "px";
          //} 
          break;

        case "fa-ellipsis-h":
          panel1.style.display = "none";
          if (panel2.style.display === "block") {
            let el1 = document.getElementsByClassName("label");
            for (let i = 0; i < el1.length; ++i) {
              let el2: HTMLElement = <HTMLElement>el1[i];
              el2.style.display = "none";
            }
            panel2.style.display = "none";
          } else {
            let el1 = document.getElementsByClassName("label");
           for (let i = 0; i < el1.length; ++i) {
              let el2: HTMLElement = <HTMLElement>el1[i];
              el2.style.display = "block";
            }
            panel2.style.display = "block";
          }

          break;

        case "fa-home":
          this.cube1.resetTileColors();
          break;

        case "fa-random":
          this.cube1.scramble();
          break;

        case "fa-arrow-left":
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

    private handleButtonClick = ((event: Event) => {
      let target: HTMLElement = event.currentTarget as HTMLElement;
      let buttonText = target.innerText;
      switch (buttonText) {
        case "TestX":
          target.innerText = "TestY";
          break;
        case "TestY":
          target.innerText = "TestX";
          break;

        case "Slow":
          target.innerText = "Fast";
          break;

        case "Fast":
          target.innerText = "Slow";
          break;

        case "Run": break;
        case "Redo": break;

        case "Undo":
          break;

        case "Solve": break;

        case "Scramble":
          break;

        case "Reset":
          break;

        default:
          break;
      }

    });

  }

  function delay3(that: MainApp, delay: number = 0) {
    var that1: MainApp = that;
    //if (that1.cube1.targetAngle !== 0) {
    //  console.log("delay3");
    //  setTimeout(delay3(that1), 10);
    //}
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