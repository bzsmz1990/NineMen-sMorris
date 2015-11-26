/*************************************************************************
	> File Name: NMM_Logic.js
	> OriginalAuthor: Zeleng Zhuang
  > Second Author: Chen Chen
	> Mail: bzsmz1990@gmail.com
 ************************************************************************/
type Board = string[][]

interface IPlayerState {
  count: number,
  phase: number,
  phaseLastTime: number,
  alreadyMills: IMills
}

interface BoardDelta {
  row: number;
  col: number;
}

interface IState {
  board?: Board;
  delta?: BoardDelta;
  playerStates?: IPlayerState[]
}

type IMills = any

type IPosition = number[]

module gameLogic {
  /**
   * Get initial board for the game.
   *    (0,0)----------------(0,1)----------------(0,2)
   *      |                    |                    |
   *      |   (1,0)----------(1,1)----------(1,2)   |
   *      |     |              |              |     |
   *      |     |   (2,0)----(2,1)----(2,2)   |     |
   *      |     |     |                 |     |     |
   *    (0,7)-(1,7)-(2,7)             (2,3)-(1,3)-(0,3)
   *      |     |     |                 |     |     |
   *      |     |   (2,6)----(2,5)----(2,4)   |     |
   *      |     |              |              |     |
   *      |   (1,6)----------(1,5)----------(1,4)   |
   *      |                    |                    |
   *    (0,6)----------------(0,5)----------------(0,4)
   *
   *    And 'W' stand for white, which is the 0th player,
   *        'B' stand for black, which is the 1th player.
   * @returns {*[]}
   */
  export function getInitialBoard(): Board {
    return [['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '']];
  }

  /**
   * This function returns the initial player states.
   * @returns {{phase: number, phaseLastTime: number, alreadyMills: Array}}
   */
  function getInitialState(): IPlayerState {
    return {
      count: 0,
      phase: 1,
      phaseLastTime: 1,
      alreadyMills: []
    };
  }

  export function getInitialStates(): IPlayerState[] {
    var playerStates: IPlayerState[] = [];
    playerStates[0] = getInitialState();
    playerStates[1] = getInitialState();
    return playerStates;
  }

  /**
   * This function checks if a mill is already existed.
   * @param Mills
   * @param alreadyMills
   * @returns {boolean}
   */
  function isAlreadyMills(Mills: IMills, alreadyMills: IMills): boolean {
    for (var i = 0; i < alreadyMills.length; i++) {
      if (Mills.sort().toString() === alreadyMills[i].sort().toString())
        return true;
    }
    return false;
  }

  /**
   * The purpose of this function is to check if there is mills in the board which is not
   * included in the alreadyMills array.
   *
   * This function return an object with attribute "player" and "mills".
   * "player" denote for which player forms a mills ("N" stand for no player),
   * "mills" stores the index number of men which forms a mills.
   * @param board
   * @param alreadyMills
   * @returns {{}}
   */
  function isMills(board: Board, alreadyMills: IMills, color: string) {
    var circuit_index: number, rotation_index: number;
    var obj: any = {};

    for (rotation_index = 1; rotation_index <= 7; rotation_index += 2) {
      if (
        board[0][rotation_index] === color &&
        board[1][rotation_index] === color &&
        board[2][rotation_index] === color &&
        !isAlreadyMills([[0, rotation_index], [1, rotation_index], [2, rotation_index]], alreadyMills)
        ) {
        obj.player = color;
        obj.mills = [[0, rotation_index], [1, rotation_index], [2, rotation_index]];
        return obj;
      }
    }
    for (circuit_index = 0; circuit_index <= 2; circuit_index++) {
      for (rotation_index = 0; rotation_index <= 6; rotation_index += 2) {
        if (
          board[circuit_index][rotation_index] === color &&
          board[circuit_index][rotation_index + 1] === color &&
          board[circuit_index][(rotation_index + 2) % 8] === color &&
          !isAlreadyMills(
            [[circuit_index, rotation_index],
              [circuit_index, rotation_index + 1],
              [circuit_index, (rotation_index + 2) % 8]], alreadyMills
            )
          ) {
          obj.player = color;
          obj.mills = [[circuit_index, rotation_index],
            [circuit_index, rotation_index + 1],
            [circuit_index, (rotation_index + 2) % 8]];
          return obj;
        }
      }
    }
    obj.player = 'N';
    obj.mills = [];
    return obj;
  }

  /**
   * To check if two certain points are adjacent.
   * @param positionA
   * @param positionB
   * @returns {boolean}
   */
  function isAdjacent(positionA: IPosition, positionB: IPosition): boolean {
    var x = positionA, y = positionB;

    if (x[0] === y[0]) {
      if (Math.abs(x[1] - y[1]) === 1 ||
        Math.abs(x[1] - y[1]) === 7)
        return true;
    } else if (x[1] === y[1] &&
      x[1] % 2 === 1) {
      if (Math.abs(x[0] - y[0]) === 1)
        return true;
    }
    return false;
  }

  /**
   * Get the number of men a certain player has on board.
   * @param board
   * @param turnIndexBeforeMove
   * @returns {number}
   */
  function getCount(board: Board, turnIndexBeforeMove: number) {
    var circuit_index = 0;
    var rotation_index = 0;
    var count = 0;

    for (circuit_index = 0; circuit_index <= 2; circuit_index++) {
      for (rotation_index = 0; rotation_index <= 7; rotation_index++) {
        if (turnIndexBeforeMove === 0) {
          if (board[circuit_index][rotation_index] === 'W')
            count++;
        }
        if (turnIndexBeforeMove === 1) {
          if (board[circuit_index][rotation_index] === 'B')
            count++;
        }
      }
    }
    return count;
  }

  /**
   * To find all the points on board that are adjacent to a certain point.
   * If no point is found, return 'N'
   * @param board
   * @param pos
   * @returns {*}
   */
  function findAdjacentPosition(board: Board, pos: IPosition): any {
    var circuit_index: number;
    var rotation_index: number;
    var res: IPosition = [];
    var emp = 1;

    for (circuit_index = 0; circuit_index <= 2; circuit_index++) {
      for (rotation_index = 0; rotation_index <= 7; rotation_index++) {
        if (
          board[circuit_index][rotation_index] === '' &&
          isAdjacent([circuit_index, rotation_index], pos)
          ) {
          emp = 0;
          // res.push([circuit_index, rotation_index]);
          res.push(circuit_index);
          res.push(rotation_index);
        }
      }
    }
    if (emp === 1)
      return 'N';
    else
      return res;
  }

  /**
   * Basically this function is used to judge a winning condition that one player has no place
   * to move his man.
   * @param board
   * @param turnIndexBeforeMove
   * @returns {boolean}
   */
  function isAdjacentPosition(board: Board, turnIndexBeforeMove: number): boolean {
    var circuit_index: number;
    var rotation_index: number;
    var color = turnIndexBeforeMove === 0 ? 'W' : 'B';

    for (circuit_index = 0; circuit_index <= 2; circuit_index++) {
      for (rotation_index = 0; rotation_index <= 7; rotation_index++) {
        if (
          board[circuit_index][rotation_index] === color &&
          findAdjacentPosition(board, [circuit_index, rotation_index]) !== 'N'
          )
          return true;
      }
    }
    return false;
  }

  /**
   * This function judges if 'W' wins, 'B' wins or no winner.
   * If one player has less than 3 men or has no place to move his man, he loose.
   * @param board
   * @param playerStates
   * @returns {string}
   */
  function getWinner(board: Board, playerStates: IPlayerState[]): string {
    var phaseW = playerStates[0].phase;
    var phaseB = playerStates[1].phase;

    if (phaseW !== 1 && getCount(board, 0) < 3)
      return 'B';

    if (phaseB !== 1 && getCount(board, 1) < 3)
      return 'W';

    if (phaseW === 2) {
      if (!isAdjacentPosition(board, 0))
        return 'B';
    }

    if (phaseB === 2) {
      if (!isAdjacentPosition(board, 1))
        return 'W';
    }
    return 'N';
  }

  /**
   * This function is to calculate the next phase of the player.
   * @param board
   * @param playerStates
   * @param turnIndexBeforeMove
   * @returns {number|phase|playerStates.phase}
   */
  function phaseCalc(board: Board, playerStates: IPlayerState[], turnIndexBeforeMove: number): number {
    var result = playerStates[turnIndexBeforeMove].phase;
    var num = getCount(board, turnIndexBeforeMove);
    var color = turnIndexBeforeMove === 0 ? 'W' : 'B';
    var obj = isMills(board, playerStates[turnIndexBeforeMove].alreadyMills, color);

    if (obj.player === color)
      return 4;

    if (playerStates[turnIndexBeforeMove].count === 9)
      result = 2;
    else {
      if (num === 3 && playerStates[turnIndexBeforeMove].phaseLastTime === 2) {
        result = 3;
      } else {
        result = (result === 4 ? playerStates[turnIndexBeforeMove].phaseLastTime : result);
      }
    }
    return result;
  }

  /**
   * This function is to check if a mills is still existed.
   * @param board
   * @param turnIndexBeforeMove
   * @param mills
   * @returns {boolean}
   */
  function checkPlace(board: Board, turnIndexBeforeMove: number, mills: IMills): boolean {
    var color = (turnIndexBeforeMove === 0 ? 'W' : 'B');

    for (var i = 0; i < mills.length; i++) {
      if (board[mills[i][0]][mills[i][1]] !== color)
        return false;
    }
    return true;
  }

  /**
   * This function is to check if the mills in the already mills array has
   * disappeared because one man in the mills been move away.
   * It will return -1 if no mills is been disappeared, or it will return the
   * index of mills that has disappear.
   * @param board
   * @param playerStates
   * @param turnIndexBeforeMove
   * @returns {number}
   */
  function checkMills(board: Board, playerStates: IPlayerState[], turnIndexBeforeMove: number): number {
    for (var i = 0; i < playerStates[turnIndexBeforeMove].alreadyMills.length; i++) {
      if (!checkPlace(board, turnIndexBeforeMove, playerStates[turnIndexBeforeMove].alreadyMills[i]))
        return i;
    }
    return -1;
  }

  /**
   * This function returns the new playerStates for the next round.
   * @param board
   * @param playerStates
   * @param turnIndexBeforeMove
   */
  function getPlayerStates(board: Board, playerStates: IPlayerState[], turnIndexBeforeMove: number): IPlayerState[] {
    var color = (turnIndexBeforeMove === 0 ? 'W' : 'B');
    var tmpPhase = playerStates[turnIndexBeforeMove].phase;
    var obj = isMills(board, playerStates[turnIndexBeforeMove].alreadyMills, color);
    var tmp = angular.copy(playerStates[turnIndexBeforeMove].alreadyMills);
    var tmpopp = angular.copy(playerStates[1 - turnIndexBeforeMove].alreadyMills);
    var check = checkMills(board, playerStates, turnIndexBeforeMove);
    var checkopp = checkMills(board, playerStates, 1 - turnIndexBeforeMove);
    var ret = angular.copy(playerStates);

    if (tmpPhase !== 4) {
      ret[turnIndexBeforeMove].count = ret[turnIndexBeforeMove].count + 1;
    }

    var phaseToSet = phaseCalc(board, ret, turnIndexBeforeMove);
    var num = getCount(board, 1 - turnIndexBeforeMove);


    if (check !== -1)
      tmp.splice(check, 1);

    if (checkopp !== -1)
      tmpopp.splice(checkopp, 1);

    if (obj.player === color)
      tmp.push(obj.mills);

    if (num === 3 && playerStates[1 - turnIndexBeforeMove].phaseLastTime === 2) {
      ret[1 - turnIndexBeforeMove].phase = 3;
      ret[1 - turnIndexBeforeMove].phaseLastTime = 2;
    }

    ret[turnIndexBeforeMove].phase = phaseToSet;
    ret[turnIndexBeforeMove].phaseLastTime = tmpPhase;
    ret[turnIndexBeforeMove].alreadyMills = tmp;
    ret[1 - turnIndexBeforeMove].alreadyMills = tmpopp;
    return ret;
  }

  export function createMove(board: Board, playerStates: IPlayerState[], circuitIndex: number, rotationIndex: number,
    circuitIndexOrigin: number, rotationIndexOrigin: number, turnIndexBeforeMove: number) {
    if (board === undefined) {
      board = getInitialBoard();
    }

    if (playerStates === undefined) {
      playerStates = getInitialStates();
    }

    var color = (turnIndexBeforeMove === 0 ? 'W' : 'B');
    var tmpPhase = playerStates[turnIndexBeforeMove].phase;
    var firstOperation: IOperation;
    var winner = getWinner(board, playerStates);
    var boardAfterMove = angular.copy(board);
    var playerStatesAfterMove: IPlayerState[];

    if (winner !== 'N') {
      throw new Error("Can only make a move if the game is not over!");
    }

    if (tmpPhase !== 4 && board[circuitIndex][rotationIndex] !== '') {
      throw new Error("That place has been occupied!");
    }

    if (playerStates[turnIndexBeforeMove].phase === 1) {

      boardAfterMove[circuitIndex][rotationIndex] = color;

    } else if (playerStates[turnIndexBeforeMove].phase === 2 ||
      playerStates[turnIndexBeforeMove].phase === 3
      ) {

      if (!isAdjacent([circuitIndex, rotationIndex], [circuitIndexOrigin, rotationIndexOrigin]) &&
        playerStates[turnIndexBeforeMove].phase === 2) {
        throw new Error("You can only move to an adjacent place!");

      } else if (board[circuitIndexOrigin][rotationIndexOrigin] !== color) {
        throw new Error("You can only move the your man!");

      } else {
        boardAfterMove[circuitIndex][rotationIndex] = color;
        boardAfterMove[circuitIndexOrigin][rotationIndexOrigin] = '';

        winner = getWinner(boardAfterMove, playerStates);
        if (winner !== 'N') {
          firstOperation = {
            endMatch: {
              endMatchScores:
              (winner === 'B' ? [0, 1] : [1, 0])
            }
          };
        }
      }
    }
    else if (playerStates[turnIndexBeforeMove].phase === 4) {
      var oppCoror = (color === 'B' ? 'W' : 'B');

      if (board[circuitIndexOrigin][rotationIndexOrigin] !== oppCoror) {
        throw new Error("Please choose a man of the enemy to remove!");

      } else {
        boardAfterMove[circuitIndexOrigin][rotationIndexOrigin] = '';
        winner = getWinner(boardAfterMove, playerStates);

        if (winner !== 'N') {
          firstOperation = {
            endMatch: {
              endMatchScores:
              (winner === 'B' ? [0, 1] : [1, 0])
            }
          };
        }
      }
    }

    if (winner === 'N') {
      if (isMills(boardAfterMove, playerStates[turnIndexBeforeMove].alreadyMills, color).player === color)
        firstOperation = { setTurn: { turnIndex: turnIndexBeforeMove } };
      else
        firstOperation = { setTurn: { turnIndex: 1 - turnIndexBeforeMove } };
    }

    playerStatesAfterMove = getPlayerStates(boardAfterMove, playerStates, turnIndexBeforeMove);

    return [firstOperation,
      { set: { key: 'board', value: boardAfterMove } },
      { set: { key: 'playerStates', value: playerStatesAfterMove } },
      {
        set: {
          key: 'delta', value:
          {
            destination: [circuitIndex, rotationIndex],
            origin: [circuitIndexOrigin, rotationIndexOrigin]
          }
        }
      }];
  }

  export function getAllPossibleMove(board: Board, playerStates: IPlayerState[], turnIndexBeforeMove: number) {
    var possibleMoves: IMove[] = [];
    var phase = playerStates[turnIndexBeforeMove].phase;
    var circuitIndex: number;
    var rotationIndex: number;
    var circuitIndexOrigin: number;
    var rotationIndexOricin: number;

    if (phase === 1 || phase === 4) {
      for (circuitIndex = 0; circuitIndex <= 2; circuitIndex++) {
        for (rotationIndex = 0; rotationIndex <= 7; rotationIndex++) {
          try {
            if (phase === 1)
              possibleMoves.push(createMove(board, playerStates, circuitIndex, rotationIndex,
                null, null, turnIndexBeforeMove));
            else
              possibleMoves.push(createMove(board, playerStates, null, null,
                circuitIndex, rotationIndex, turnIndexBeforeMove));
          } catch (e) {
            //Move is not valid.
          }
        }
      }
    }

    if (phase === 2 || phase === 3) {
      for (circuitIndex = 0; circuitIndex <= 2; circuitIndex++) {
        for (rotationIndex = 0; rotationIndex <= 7; rotationIndex++) {
          for (circuitIndexOrigin = 0; circuitIndexOrigin <= 2; circuitIndexOrigin++) {
            for (rotationIndexOricin = 0; rotationIndexOricin <= 7; rotationIndexOricin++) {
              try {
                possibleMoves.push(createMove(board, playerStates, circuitIndex, rotationIndex,
                  circuitIndexOrigin, rotationIndexOricin, turnIndexBeforeMove));
              } catch (e) {
                //Move is not valid.
              }

            }
          }
        }
      }
    }
    return possibleMoves;
  }

  export function isMoveOk(params: IIsMoveOk) {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove = params.stateBeforeMove;

    try {
      var deltaVal = move[3].set.value;
      var circuitIndex = deltaVal.destination[0];
      var rotationIndex = deltaVal.destination[1];
      var circuitIndexOrigin = deltaVal.origin[0];
      var rotationIndexOrigin = deltaVal.origin[1];
      var board = stateBeforeMove.board;
      var playerStates = stateBeforeMove.playerStates;

      var expectedMove = createMove(board, playerStates, circuitIndex, rotationIndex,
        circuitIndexOrigin, rotationIndexOrigin, turnIndexBeforeMove);

      if (!angular.equals(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }

}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices']).factory('gameLogic', function() {

  return {
    getInitialBoard: gameLogic.getInitialBoard,
    getInitialStates: gameLogic.getInitialStates,
    getAllPossibleMove: gameLogic.getAllPossibleMove,
    createMove: gameLogic.createMove,
    isMoveOk: gameLogic.isMoveOk
  };
}
  );
