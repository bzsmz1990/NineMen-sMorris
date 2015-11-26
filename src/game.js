/**
 * Created by zelengzhuang on 3/3/15.
 */

angular.module('myApp')
    .controller('Ctrl',
    ['$scope', '$log', '$timeout', '$rootScope', 'gameLogic', 'aiService',
        function ($scope, $log, $timeout, $rootScope, gameLogic, aiService) {

            'use strict';


            resizeGameAreaService.setWidthToHeight(.866525424);



            var animationEnded = false;
            var isComputerTurn = false;
            var state = null;


            // drag and drop
            var draggingLines = document.getElementById("draggingLines");
            var horizontalDraggingLine = document.getElementById("horizontalDraggingLine");
            var verticalDraggingLine = document.getElementById("verticalDraggingLine");
            var gameArea = document.getElementById("gameArea");
            var rowsNum = 7;
            var colsNum = 7;
            var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
            var draggingStartRaw = null;
            var draggingPiece = null;
            var nextZIndex = 61;
            dragAndDropService.addDragListener("gameArea", handleDragEvent);
            var rowtmp;
            var coltmp;

            function handleDragEvent(type, clientX, clientY) {

                if ($scope.playerStates === undefined || $scope.turnIndex === -1)
                    return;
                // Center point in gameArea
                var phase = $scope.playerStates[$scope.turnIndex].phase;
                var x = clientX - gameArea.offsetLeft;
                var y = clientY - gameArea.offsetTop;
                // Is outside gameArea?
                if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
                  //  draggingLines.style.display = "none";
                    if (draggingPiece) {
                        // Drag the piece where the touch is (without snapping to a square).
                        var size = getSquareWidthHeight();
                        setDraggingPieceTopLeft({top: y - size.height / 2, left: x - size.width / 2});
                    } else {
                        return;
                    }
                } else {
                    // Inside gameArea. Let's find the containing square's row and col
                    coltmp = Math.floor(colsNum * x / gameArea.clientWidth);
                    rowtmp = Math.floor(rowsNum * y / gameArea.clientHeight);

                    var col;
                    var row;
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

                    if (type === "touchstart" && !draggingStartedRowCol) {
                        // drag started
                        if ((phase === 2 || phase === 3)) {
                            draggingStartRaw = {roww: rowtmp, col: coltmp};
                            draggingStartedRowCol = {row: row, col: col};
                            draggingPiece = document.getElementById("e2e_test_img_" + draggingStartedRowCol.row + "x" + draggingStartedRowCol.col);
                            if (draggingPiece !== null)
                                draggingPiece.style['z-index'] = ++nextZIndex;

                            if (row === undefined || col === undefined) {
                                canceled ();
                                return;
                            }

                            if (row < 0 || row > 2 || col < 0 || col > 7) {
                                canceled ();
                                return;
                            }

                            var color = $scope.turnIndex === 0 ? 'W' : 'B';

                            if ($scope.board [row][col] !== color) {
                                canceled ();
                                return;
                            }
                        }
                        if (phase === 4 || phase === 1) {
                            $rootScope.$apply(function () {
                                if (!$scope.isYourTurn) {
                                    return;
                                }
                                try {

                                    var phase = $scope.playerStates[$scope.turnIndex].phase;
                                    if (phase === 1) {
                                        var move = gameLogic.createMove($scope.board, $scope.playerStates, row, col, null, null, $scope.turnIndex);
                                    } else if (phase === 4) {
                                        var move = gameLogic.createMove($scope.board, $scope.playerStates, null, null, row, col, $scope.turnIndex);
                                    }
                                    gameService.makeMove(move);
//                                }
                                } catch (e) {
                                    $log.info(["Can't place piece:", row]);
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
                        var to = {row: row, col: col};
                        var phase = $scope.playerStates[$scope.turnIndex].phase;
                        if (phase === 2 || phase === 3)
                            dragDone(from, to);
                    } else {
                        // Drag continue
                        console.log (gameArea.clientWidth);
                        var size = getSquareWidthHeight();
                        console.log ("size.width: " + size.width/2 + "size.height" + size.height/2 + "x" + x + "y" + y);
                        setDraggingPieceTopLeft({top: y - size.height / 2, left: x - size.width / 2});
                    }
                }
                if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
                    canceled ();
                }
            }

            function canceled () {
                  // drag ended
                  // return the piece to it's original style (then angular will take care to hide it).
                    var tmp = getSquareTopLeft(rowtmp, coltmp);
                    setDraggingPieceTopLeft(tmp);
                 //   draggingLines.style.display = "none";
                    if (draggingPiece !== null) {
                        draggingPiece.removeAttribute("style");//fix broken UI
                        draggingPiece = null;
                    }
                    draggingStartedRowCol = null;
                    draggingPiece = null;

            }
            function setDraggingPieceTopLeft(topLeft) {
                var originalSize = getSquareTopLeft(draggingStartRaw.roww, draggingStartRaw.col);
                if (draggingPiece !== null) {
                    draggingPiece.style.left = (topLeft.left - originalSize.left + gameArea.clientWidth * 0.03) + "px";
                    draggingPiece.style.top = (topLeft.top - originalSize.top + gameArea.clientHeight * 0.03) + "px";
                }
            }
            function getSquareWidthHeight() {
                return {
                    width: gameArea.clientWidth / colsNum,
                    height: gameArea.clientHeight / rowsNum
                };
            }
            function getSquareTopLeft(row, col) {
                var size = getSquareWidthHeight();
                return {top: row * size.height, left: col * size.width}
            }


            function dragDone(from, to) {

                $rootScope.$apply(function () {

                    $log.info(["Clicked on cell:", from.row, from.col]);
                    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
                        throw new Error("Throwing the error because URL has '?throwException'");
                    }
                    if (!$scope.isYourTurn) {
                        return;
                    }
                    if ($scope.waitPiece === undefined) {
                        $scope.waitPiece = false;
                    }
                    if ($scope.lastPlacement === undefined) {
                        $scope.lastPlacement = {};
                    }

                    try {
                        var phase = $scope.playerStates[$scope.turnIndex].phase;
                        if (phase === 2 || phase === 3) {
                            var move = gameLogic.createMove($scope.board, $scope.playerStates, to.row, to.col, from.row, from.col, $scope.turnIndex);
                            gameService.makeMove(move);
                            console.log (draggingPiece);
                        }
                    } catch (e) {
                        $log.info(["Can't move piece:", from.row, from.col]);
                        return;
                    }

                });
            }




             //end drag and drop


            function animationEndedCallback() {
                $rootScope.$apply(function () {
                    $log.info("Animation ended");
                    animationEnded = true;
                    if (isComputerTurn) {
                        sendComputerMove();
                    }
                });
            }
            // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
            document.addEventListener("animationend", animationEndedCallback, false); // standard
            document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
            document.addEventListener("oanimationend", animationEndedCallback, false); // Opera



            function sendComputerMove() {
                gameService.makeMove(
                    aiService.createComputerMove($scope.board, $scope.playerStates, $scope.turnIndex,
                        // at most 1 second for the AI to choose a move (but might be much quicker)
                        {millisecondsLimit: 1000}
                    ));
            }


            function updateUI(params) {
                animationEnded = false;
                state = params.stateAfterMove;
                $scope.board = params.stateAfterMove.board;
                $scope.delta = params.stateAfterMove.delta;
                $scope.playerStates = params.stateAfterMove.playerStates;

                if ($scope.board === undefined) {
                    $scope.board = gameLogic.getInitialBoard();
                }

                if ($scope.playerStates === undefined) {
                    $scope.playerStates = gameLogic.getInitialStates();
                }

                $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
                params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
                $scope.turnIndex = params.turnIndexAfterMove;

                // Is it the computer's turn?
                if ($scope.isYourTurn &&
                    params.playersInfo[params.yourPlayerIndex].playerId === '') {
                    $scope.isYourTurn = false; // to make sure the UI won't send another move.
                    // Waiting 0.5 seconds to let the move animation finish; if we call aiService
                    // then the animation is paused until the javascript finishes.
                    $timeout(sendComputerMove, 1000);
                }
            }

            window.e2e_test_stateService = stateService; // to allow us to load any state in our e2e tests.


            $scope.shouldShowImage = function (row, col) {
                var cell = $scope.board[row][col];
//                console.log (row + "***" + col+ "***" + cell);
                return cell !== "";
            };


            $scope. shouldHighLight = function (row, col) {
                if ($scope.playerStates === undefined || $scope.turnIndex === -1)
                    return false;
                var color = $scope.turnIndex === 0 ? 'W' : 'B';
                var turn = $scope.turnIndex;
                var board = $scope.board;
//                if ($scope.playerStates === undefined)
//                    return false;
                var phase = $scope.playerStates [$scope.turnIndex].phase;
                if (phase === 1)
                    return false;
                if (phase === 2 || phase === 3) {
                    if (board [row][col] === color)
                        return true;
                    else
                        return false;
                }
                if (phase === 4) {
                    var oppcolor = turn === 1 ? 'W' : 'B';
                    if (board [row][col] === oppcolor)
                        return true;
                    else
                        return false;
                }
            };

            $scope.getImageSrc = function (row, col) {
                var cell = $scope.board[row][col];
                    return cell === "W" ? "imgs/white.png"
                        : cell === "B" ? "imgs/black.png" : "";
            };

            $scope.shouldEnLar = function (row, col) {

                var ss = !animationEnded &&
                    state.delta !== undefined &&
                    state.delta.destination[0] === row && state.delta.destination[1] === col;

                return ss;

            };

            $scope.shouldFade = function (row, col) {

                return !animationEnded &&
                    state.delta !== undefined &&
                    state.delta.origin[0] === row && state.delta.origin[1] === col;

            };



            gameService.setGame({
                gameDeveloperEmail: "zhuangzeleng19920731@gmail.com",
                minNumberOfPlayers: 2,
                maxNumberOfPlayers: 2,
                isMoveOk: gameLogic.isMoveOk,
                updateUI: updateUI
            });

        }]);
