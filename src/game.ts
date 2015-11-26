interface IRowCol {
  row: number;
  col: number
}

interface ITopLeft {
  top: number;
  left: number;
}

interface IWidthHeight {
  width: number;
  height: number;
}

let turnIndex: number;
let state: IState = null;
let animationEnded = false;
let isComputerTurn = false;
let isYourTurn: boolean;
let waitPiece: boolean = false;
let lastPlacement: any = {}


// drag and drop
let gameArea: HTMLElement;
let rowsNum = 7;
let colsNum = 7;
let draggingStartedRowCol: IRowCol = { row: -1, col: -1 };
let draggingStartRaw: IRowCol = null;
let draggingPiece: any = null;
let nextZIndex = 61;
let rowtmp: number;
let coltmp: number;

module game {
  //end drag and drop
  function animationEndedCallback() {
    $rootScope.$apply(function() {
      log.info("Animation ended");
      animationEnded = true;
      if (isComputerTurn) {
        sendComputerMove();
      }
    });
  }

  export function init() {
    resizeGameAreaService.setWidthToHeight(.866525424);

    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });

    // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    document.addEventListener("animationend", animationEndedCallback, false); // standard
    document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
    document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
    dragAndDropService.addDragListener("gameArea", handleDragEvent);
  }

  function sendComputerMove() {
    gameService.makeMove(
      aiService.createComputerMove(state.board, state.playerStates, turnIndex,
        { millisecondsLimit: 1000 }
        ));
  }

  function updateUI(params: IUpdateUI) {
    animationEnded = false;
    state = params.stateAfterMove;

    if (state.board === undefined) {
      state.board = gameLogic.getInitialBoard();
    }

    if (state.playerStates === undefined) {
      state.playerStates = gameLogic.getInitialStates();
    }

    isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
    params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
    turnIndex = params.turnIndexAfterMove;

    // Is it the computer's turn?
    if (isYourTurn &&
      params.playersInfo[params.yourPlayerIndex].playerId === '') {
      isYourTurn = false; // to make sure the UI won't send another move.
      // Waiting 0.5 seconds to let the move animation finish; if we call aiService
      // then the animation is paused until the javascript finishes.
      $timeout(sendComputerMove, 1000);
    }
  }

  function handleDragEvent(type: string, clientX: number, clientY: number) {
    gameArea = document.getElementById("gameArea");
    if (state.playerStates === undefined || turnIndex === -1)
      return;
    // Center point in gameArea
    var phase = state.playerStates[turnIndex].phase;
    var x = clientX - gameArea.offsetLeft;
    var y = clientY - gameArea.offsetTop;
    // Is outside gameArea?
    if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
      if (draggingPiece) {
        // Drag the piece where the touch is (without snapping to a square).
        var size = getSquareWidthHeight();
        setDraggingPieceTopLeft({ top: y - size.height / 2, left: x - size.width / 2 });
      } else {
        return;
      }
    } else {
      // Inside gameArea. Let's find the containing square's row and col
      coltmp = Math.floor(colsNum * x / gameArea.clientWidth);
      rowtmp = Math.floor(rowsNum * y / gameArea.clientHeight);

      var col: number;
      var row: number;
      if (coltmp === 0 && rowtmp === 0) {
        col = 0; row = 0;
      } else if (coltmp === 3 && rowtmp === 0) {
        col = 1; row = 0;
      } else if (coltmp === 6 && rowtmp === 0) {
        col = 2; row = 0;
      } else if (coltmp === 6 && rowtmp === 3) {
        col = 3; row = 0;
      } else if (coltmp === 6 && rowtmp === 6) {
        col = 4; row = 0;
      } else if (coltmp === 3 && rowtmp === 6) {
        col = 5; row = 0;
      } else if (coltmp === 0 && rowtmp === 6) {
        col = 6; row = 0;
      } else if (coltmp === 0 && rowtmp === 3) {
        col = 7; row = 0;
      } else if (coltmp === 1 && rowtmp === 1) {
        col = 0; row = 1;
      } else if (coltmp === 3 && rowtmp === 1) {
        col = 1; row = 1;
      } else if (coltmp === 5 && rowtmp === 1) {
        col = 2; row = 1;
      } else if (coltmp === 5 && rowtmp === 3) {
        col = 3; row = 1;
      } else if (coltmp === 5 && rowtmp === 5) {
        col = 4; row = 1;
      } else if (coltmp === 3 && rowtmp === 5) {
        col = 5; row = 1;
      } else if (coltmp === 1 && rowtmp === 5) {
        col = 6; row = 1;
      } else if (coltmp === 1 && rowtmp === 3) {
        col = 7; row = 1;
      } else if (coltmp === 2 && rowtmp === 2) {
        col = 0; row = 2;
      } else if (coltmp === 3 && rowtmp === 2) {
        col = 1; row = 2;
      } else if (coltmp === 4 && rowtmp === 2) {
        col = 2; row = 2;
      } else if (coltmp === 4 && rowtmp === 3) {
        col = 3; row = 2;
      } else if (coltmp === 4 && rowtmp === 4) {
        col = 4; row = 2;
      } else if (coltmp === 3 && rowtmp === 4) {
        col = 5; row = 2;
      } else if (coltmp === 2 && rowtmp === 4) {
        col = 6; row = 2;
      } else if (coltmp === 2 && rowtmp === 3) {
        col = 7; row = 2;
      }

      if (type === "touchstart" && draggingStartedRowCol.row < 0 && draggingStartedRowCol.col < 0) {
        // drag started
        if ((phase === 2 || phase === 3)) {
          draggingStartRaw = { row: rowtmp, col: coltmp };
          draggingStartedRowCol = { row: row, col: col };
          draggingPiece = document.getElementById("e2e_test_img_" + draggingStartedRowCol.row + "x" + draggingStartedRowCol.col);
          if (draggingPiece !== null)
            draggingPiece.style['z-index'] = ++nextZIndex;

          if (row === undefined || col === undefined) {
            canceled();
            return;
          }

          if (row < 0 || row > 2 || col < 0 || col > 7) {
            canceled();
            return;
          }

          var color = turnIndex === 0 ? 'W' : 'B';

          if (state.board[row][col] !== color) {
            canceled();
            return;
          }
        }
        if (phase === 4 || phase === 1) {
          $rootScope.$apply(function() {
            if (!isYourTurn) {
              return;
            }
            try {

              var phase = state.playerStates[turnIndex].phase;
              if (phase === 1) {
                var move = gameLogic.createMove(state.board, state.playerStates, row, col, null, null, turnIndex);
              } else if (phase === 4) {
                var move = gameLogic.createMove(state.board, state.playerStates, null, null, row, col, turnIndex);
              }
              gameService.makeMove(move);
              //                                }
            } catch (e) {
              console.log(["Can't place piece:", row]);
              return;
            }
          });
        }
      }
      if (!draggingPiece) {
        return;
      }

      if (type === "touchend") {
        var from = draggingStartedRowCol;
        var to = { row: row, col: col };
        var phase = state.playerStates[turnIndex].phase;
        if (phase === 2 || phase === 3)
          dragDone(from, to);
      } else {
        // Drag continue
        console.log(gameArea.clientWidth);
        var size = getSquareWidthHeight();
        console.log("size.width: " + size.width / 2 + "size.height" + size.height / 2 + "x" + x + "y" + y);
        setDraggingPieceTopLeft({ top: y - size.height / 2, left: x - size.width / 2 });
      }
    }
    if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
      canceled();
    }
  }

  function canceled() {
    // drag ended
    // return the piece to it's original style (then angular will take care to hide it).
    var tmp = getSquareTopLeft(rowtmp, coltmp);
    setDraggingPieceTopLeft(tmp);
    //   draggingLines.style.display = "none";
    if (draggingPiece !== null) {
      draggingPiece.removeAttribute("style");//fix broken UI
      draggingPiece = null;
    }
    draggingStartedRowCol = {row: -1, col: -1};
    draggingPiece = null;

  }

  function setDraggingPieceTopLeft(topLeft: ITopLeft) {
    var originalSize = getSquareTopLeft(draggingStartRaw.row, draggingStartRaw.col);
    if (draggingPiece !== null) {
      draggingPiece.style.left = (topLeft.left - originalSize.left + gameArea.clientWidth * 0.03) + "px";
      draggingPiece.style.top = (topLeft.top - originalSize.top + gameArea.clientHeight * 0.03) + "px";
    }
  }

  function getSquareWidthHeight(): IWidthHeight {
    return {
      width: gameArea.clientWidth / colsNum,
      height: gameArea.clientHeight / rowsNum
    };
  }

  function getSquareTopLeft(row: number, col: number): ITopLeft {
    var size = getSquareWidthHeight();
    return { top: row * size.height, left: col * size.width }
  }

  function dragDone(from: IRowCol, to: IRowCol) {

    $rootScope.$apply(function() {

      console.log(["Clicked on cell:", from.row, from.col]);
      if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (isYourTurn) {
        return;
      }
      if (waitPiece === undefined) {
        waitPiece = false;
      }
      if (lastPlacement === undefined) {
        lastPlacement = {};
      }

      try {
        var phase = state.playerStates[turnIndex].phase;
        if (phase === 2 || phase === 3) {
          var move = gameLogic.createMove(state.board, state.playerStates, to.row, to.col, from.row, from.col, turnIndex);
          gameService.makeMove(move);
          console.log(draggingPiece);
        }
      } catch (e) {
        console.log(["Can't move piece:", from.row, from.col]);
        return;
      }

    });
  }

  export function shouldShowImage(row: number, col: number): boolean {
    var cell = state.board[row][col];
    return cell !== "";
  }

  export function shouldHighLight(row: number, col: number): boolean {
    if (state.playerStates === undefined || turnIndex === -1)
      return false;
    var color = turnIndex === 0 ? 'W' : 'B';
    var turn = turnIndex;
    var board = state.board;

    var phase = state.playerStates[turnIndex].phase;
    if (phase === 1)
      return false;
    if (phase === 2 || phase === 3) {
      if (board[row][col] === color)
        return true;
      else
        return false;
    }
    if (phase === 4) {
      var oppcolor = turn === 1 ? 'W' : 'B';
      if (board[row][col] === oppcolor)
        return true;
      else
        return false;
    }
  }

  export function getImageSrc(row: number, col: number): string {
    var cell = state.board[row][col];
    return cell === "W" ? "imgs/white.png"
      : cell === "B" ? "imgs/black.png" : "";
  }

  export function shouldEnLar(row: number, col: number): boolean {
    var ss = !animationEnded &&
      state.delta !== undefined &&
      state.delta.destination[0] === row && state.delta.destination[1] === col;

    return ss;
  }

  export function shouldFade(row: number, col: number): boolean {
    return !animationEnded &&
      state.delta !== undefined &&
      state.delta.origin[0] === row && state.delta.origin[1] === col;
  }

}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function() {
  $rootScope['game'] = game;
  translate.setLanguage('en', {
    "RULES_OF_NNM":"Rules of Nine Men's Morris",
    "RULES_SLIDE1":"Nine Men's Morris has 3 phases, and each has different rules",
    "RULES_SLIDE2":"Phase1: Placing men on vacant points",
    "RULES_SLIDE3":"Phase2: Moving men to adjacent points",
    "RULES_SLIDE4":"Phase3: Moving men to any vacant point when a player has been reduced to three men",
    "RULES_SLIDE5":"Players try to form 'mills'— three of their own men lined horizontally or vertically",
    "RULES_SLIDE6":"When a 'mills' is formed you are allowed to remove an enemy's man.",
    "RULES_SLIDE7":"When one player loses has less than 3 players or has no place to move.",
    "CLOSE":"Close"
  });
  game.init();
});
