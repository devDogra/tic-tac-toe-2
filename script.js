//  TODO: Clean up code
// TODO: DOnt export everything
// TODO: Styling

function Player(name, mark, ai) {
  const proto = {
    getName: function () {
      return this.name;
    },
    getMark: function () {
      return this.mark;
    },
    isAI: function () {
      return this.ai;
    },

    move: function (i, j) {
      Board.put(this.mark, i, j);
    },
  };

  const p = Object.create(proto);
  p.name = name;
  p.mark = mark;
  p.ai = ai;

  return p;
}
const Board = (function () {
  const SIZE = 3;
  const board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  function getCol(j) {
    return [board[0][j], board[1][j], board[2][j]];
  }
  function getRow(i) {
    return board[i];
  }
  function getDiag(i) {
    if (i == 1) return [board[0][0], board[1][1], board[2][2]];
    else return [board[0][2], board[1][1], board[2][0]];
  }

  function canPut(mark, i, j) {
    if (board[i][j] !== null) return false;
    if (i < 0 || i >= SIZE || j < 0 || j >= SIZE) return false;
    return true;
  }
  function put(mark, i, j) {
    if (!canPut(mark, i, j)) return false;

    board[i][j] = mark;
    return true;
  }
  function at(i, j) {
    return board[i][j];
  }
  function clear() {
    for (let i = 0; i != SIZE; i++) {
      for (let j = 0; j != SIZE; j++) {
        board[i][j] = null;
      }
    }
  }

  function show() {
    console.log(board);
  }

  function hasEmptyCells() {
    for (let i = 0; i != SIZE; i++) {
      for (let j = 0; j != SIZE; j++) {
        console.log("BRD =" + board[i][j]);
        if (board[i][j] == null) {
          console.log("RETTURNING TRUE");
          return true;
        }
      }
    }

    return false;
  }

  return { put, at, clear, show, hasEmptyCells, getCol, getRow, getDiag, SIZE };
})();

const displayController = (function () {
  const boardContainer = document.querySelector(".board-container");
  const board = document.querySelector(".board");
  const cells = document.querySelectorAll(".cell");

  const modal = document.querySelector(".modal");
  const modalMsg = document.querySelector(".modal-msg");
  const modalContainer = document.querySelector(".modal-container");
  const playAgainBtn = document.querySelector(".play-again-btn");
  const infoForm = document.querySelector(".player-info-form");
  const infoFormContainer = document.querySelector(
    ".player-info-form-container"
  );

  infoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name1 = infoForm.querySelector("#player-1-name").value;
    const mark1 = infoForm.querySelector("#player-1-mark").value;
    const ai1 = infoForm.querySelector("#player-1-ai").checked;

    const name2 = infoForm.querySelector("#player-2-name").value;
    const mark2 = infoForm.querySelector("#player-2-mark").value;
    const ai2 = infoForm.querySelector("#player-2-ai").checked;

    infoFormContainer.classList.remove("show");
    Game.initPlayers(name1, mark1, name2, mark2, ai1, ai2);
  });

  function handleGameEnd() {
    renderBoard();
    let status = Game.seeStatus();
    console.log("ST " + status);
    // return;
    let msg = "";
    if (status === "DRAW") {
      msg = "The game ends in a draw";
    } else if (status !== null) {
      const winnerName = Game.getWinnerName(status);
      msg = `${winnerName} has won`;
    }
    modalMsg.innerText = msg;
    modalContainer.classList.add("show");
  }

  playAgainBtn.addEventListener("click", (e) => {
    Game.reset();
    renderBoard();
    modalContainer.classList.remove("show");
  });

  function renderBoard() {
    cells.forEach((cell) => {
      const [i, j] = Game.toIndices(cell.dataset.cellIdx);
      const cellMark = Board.at(i, j);
      cell.innerText = cellMark || "";
    });
  }

  cells.forEach((cell) => {
    cell.addEventListener("click", (e) => {
      Game.playRound(cell);
      Board.show();
      renderBoard();
      const status = Game.seeStatus();
      if (status === "DRAW" || status !== null) {
        handleGameEnd(Game.gameStatus);
      }
    });
  });

  return { handleGameEnd, renderBoard };
})();

const Game = (function () {
  const players = [null, null];
  let gameStatus = null;
  let turn = 0;

  function getWinnerName(winnerMark) {
    if (players[0].getMark() === winnerMark) return players[0].name;
    else return players[1].name;
  }

  function toIndices(cellNum) {
    cellNum -= 1;
    return [Math.floor(cellNum / Board.SIZE), cellNum % Board.SIZE];
  }
  function playRound(cell) {
    let [i, j] = toIndices(cell.dataset.cellIdx);

    players[turn].move(i, j);
    let status = checkWin();
    if (status === "DRAW" || status !== null) {
      // console.log("HI");
      // handleGameEnd(status);
      // return status;
    } else {
      flipTurn();
    }
    gameStatus = status;
    console.log(gameStatus);
  }

  function flipTurn() {
    turn = 1 - turn;
  }

  function getTurn() {
    return turn;
  }

  function seeStatus() {
    return gameStatus;
  }

  function reset() {
    turn = 0;
    gameStatus = null;
    Board.clear();
  }

  // function handleGameEnd(status) {
  //   displayController.handleGameEnd(status);
  // }
  initPlayers("random", "X", "random2", "O", false, false);
  function initPlayers(name1, mark1, name2, mark2, ai1, ai2) {
    players[0] = Player(name1, mark1, ai1);
    players[1] = Player(name2, mark2, ai2);
  }

  // If ith row all same, returns its mark. Else, null
  function winningRowMark(i) {
    if (Board.at(i, 0) === Board.at(i, 1)) {
      if (Board.at(i, 0) === Board.at(i, 2)) return Board.at(i, 0);
    }
    return null;
  }
  function winningColMark(j) {
    if (Board.at(0, j) === Board.at(1, j)) {
      if (Board.at(0, j) === Board.at(2, j)) return Board.at(0, j);
    }
    return null;
  }
  // Returns winning mark if there is a win
  // Returns "DRAW" if there is a draw
  // Else returns null

  function same(a, b, c) {
    return a === b && b === c;
  }
  function checkWin() {
    const SIZE = Board.SIZE;

    const r1 = same(Board.at(0, 0), Board.at(0, 1), Board.at(0, 2));
    const r2 = same(Board.at(1, 0), Board.at(1, 1), Board.at(1, 2));
    const r3 = same(Board.at(2, 0), Board.at(2, 1), Board.at(2, 2));

    const c1 = same(Board.at(0, 0), Board.at(1, 0), Board.at(2, 0));
    const c2 = same(Board.at(0, 1), Board.at(1, 1), Board.at(2, 1));
    const c3 = same(Board.at(0, 2), Board.at(1, 2), Board.at(2, 2));

    const d1 = same(Board.at(0, 0), Board.at(1, 1), Board.at(2, 2));
    const d2 = same(Board.at(0, 2), Board.at(1, 1), Board.at(2, 0));

    if (r1) return Board.at(0, 0);
    if (r2) return Board.at(1, 1);
    if (r3) return Board.at(2, 2);

    if (c1) return Board.at(0, 0);
    if (c2) return Board.at(1, 1);
    if (c3) return Board.at(2, 2);

    if (d1 || d2) return Board.at(1, 1);

    console.log("EMPTY CELLS = " + Board.hasEmptyCells());
    if (!Board.hasEmptyCells()) {
      return "DRAW";
    }
    return null;
  }

  return {
    checkWin,
    reset,
    getTurn,
    flipTurn,
    toIndices,
    getWinnerName,
    initPlayers,
    playRound,
    seeStatus,
  };
})();
