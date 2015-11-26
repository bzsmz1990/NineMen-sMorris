/**
 * Created by zelengzhuang on 4/5/15.
 */
var aiService;
(function (aiService) {
    function createComputerMove(board, playerStates, playerIndex, alphaBetaLimits) {
        return alphaBetaService.alphaBetaDecision([null, { set: { key: 'board', value: board } }, { set: { key: 'playerStates', value: playerStates } }], playerIndex, getNextStates, getStateScoreForIndex0, 
        // If you want to see debugging output in the console, then surf to game.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    function getDebugStateToString(move) {
        return "\n" + move[1].set.value.join("\n") + "\n";
    }
    function getStateScoreForIndex0(move) {
        if (move[0].endMatch) {
            var endMatchScores = move[0].endMatch.endMatchScores;
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        if (move[2].set.value[0].phase === 4) {
            return Number.POSITIVE_INFINITY / 2;
        }
        if (move[2].set.value[1].phase === 4) {
            return Number.NEGATIVE_INFINITY / 2;
        }
        return (move[2].set.value[0].alreadyMills.length * 1000000000000 - move[2].set.value[1].alreadyMills.length * 1000000000000);
    }
    function getNextStates(move, playerIndex) {
        return gameLogic.getAllPossibleMove(move[1].set.value, move[2].set.value, playerIndex);
    }
})(aiService || (aiService = {}));
// angular.module('myApp').factory('aiService',
//   ["gameLogic",
//     function(gameLogic: any) {
//       return { createComputerMove: aiService.createComputerMove };
//     }]);
angular.module('myApp').factory('aiService', function () {
    return { createComputerMove: aiService.createComputerMove };
});
