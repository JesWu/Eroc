var game = {
  gameState: false,
  players: new Array(),
  curPlayer: new Array(),
  numSides: 0,
  numDice: 0,
  turn: {
    curDice: 0,
    turn: 0,
    rollFreq: null
  },
  curGuess: {
    sideNum: 0,
    numDice: 0,
    ID: null
  }
};

function newGame(players, numDice, numSides) {
  game.players = constructPlayers(players, numDice);
  game.gameState = true;
  game.numSides = parseInt(numSides, 10);
  game.numDice = parseInt(numDice, 10);
  console.log(
    "Game started with " + game.numDice + " dice & " + game.numSides + " sides"
  );
  return rollPriority(game.players);
}

function constructPlayers(mentions, numDice) {
  var players = new Array();
  for (const [key, value] of mentions) {
    var player = {
      name: value.username,
      ID: value.id,
      dice: numDice,
      roll: ""
    };
    //console.log(player.Name);
    players.push(player);
  }
  return players;
}

function rollPriority(players) {
  var max = 0;
  var rollStr = "";
  curPlayer = new Array();

  for (player of players) {
    var roll = Math.floor(Math.random() * game.numSides) + 1;
    if (max < roll) {
      max = roll;
      curPlayer = [];
      curPlayer.push(player);
    } else if (max == roll) {
      curPlayer.push(player);
    }
    rollStr += player.name + " rolled " + roll + "\n";
  }

  while (curPlayer.length > 1) {
    rollStr += "Tie detected! rerolling...\n";
    for (player of curPlayer) {
      max = 0;
      var roll = Math.floor(Math.random() * game.numSides) + 1;
      if (max < roll) {
        max = roll;
        curPlayer = [];
        curPlayer.push(player);
      } else if (max == roll) {
        curPlayer.push(player);
      }
      rollStr += player.name + " rolled " + roll + "\n";
    }
  }
  rollStr +=
    "<@" + curPlayer[0].ID + ">" + " goes first with a roll of: " + max;
  return rollStr;
}

function nextTurn() {
  Turn = game.turn;
  Turn.curDice = 0;
  Turn.rollFreq = new Array(game.numSides);
  Turn.rollFreq.fill(0);
  game.curGuess = {
    sideNum: 0,
    numDice: 0,
    ID: null
  };

  players = game.players;

  for (var j = 0; j < players.length; j++) {
    players[j].roll = "";
    for (var i = 0; i < players[j].dice; i++) {
      var rolls = Math.floor(Math.random() * game.numSides) + 1;
      if (rolls == 1) {
        for (var k = 0; k < Turn.rollFreq.length; k++) {
          Turn.rollFreq[k] += 1;
        }
      } else {
        Turn.rollFreq[rolls - 1] += 1;
      }
      players[j].roll += rolls + " ";
    }
    Turn.curDice += player.dice;
  }
  Turn.turn++;
  console.log(game.turn.curDice);
}

function guess(id, numDice, sideNum) {
  if (isValidGuess(id, numDice, sideNum)) {
    game.curGuess = {
      sideNum: sideNum,
      numDice: numDice,
      ID: id
    };
    return (
      "New guess by <@" +
      game.curGuess.ID +
      "> : " +
      numDice +
      " " +
      sideNum +
      "s"
    );
  }
  return "Guess is invalid. Please raise either the number of dice or the number on the die.";
}

function peek(id) {
  for (player of game.players) {
    if (player.ID == id) {
      return player.roll;
    }
  }
  return false;
}

function isInGame(id) {
  for (player of game.players) {
    if (player.ID == id) {
      return true;
    }
  }
  return false;
}

function exit(id) {
  if (isInGame(id)) {
    game = {
      gameState: false,
      players: new Array(),
      curPlayer: new Array(),
      numSides: 0,
      numDice: 0,
      turn: {
        curDice: 0,
        turn: 0,
        rollFreq: null
      },
      curGuess: {
        sideNum: 0,
        numDice: 0,
        ID: null
      }
    };
    return "Game terminated.";
  }
  return "You are not in the game.";
}

function isValidGuess(id, numDice, sideNum) {
  if (
    sideNum > 0 &&
    sideNum <= game.numSides &&
    numDice >= 1 &&
    numDice <= game.turn.curDice
  ) {
    var curGuess = game.curGuess;
    if (
      curGuess.numDice < numDice ||
      (curGuess.numDice == numDice && curGuess.sideNum < sideNum)
    ) {
      return true;
    }
  }
  return false;
}

function isCorrectGuess(curGuess) {
    console.log(curGuess.numDice + " vs " + game.turn.rollFreq[curGuess.num - 1])
  if (curGuess.numDice >= game.turn.rollFreq[curGuess.num - 1]) {
    return true;
  }
  return false;
}

function bs(id) {
  var result = "";
  var players = game.players;
  var curGuess = game.curGuess;
  var Turn = game.turn;

  if (curGuess.ID == null) {
    return "No guess currently.";
  }

  result +=
    "<@" +
    id +
    "> has called BS on <@" +
    curGuess.ID +
    ">'s guess of " +
    curGuess.numDice +
    " dice for " +
    curGuess.sideNum +
    "\n";

  result += Turn.curDice + " rolls for this turn | ";
  for (var i = 1; i <= Turn.rollFreq.length; i++) {
    result += i + ": " + Turn.rollFreq[i - 1] + " |";
  }
  result += "\n";

  if (curGuess.numDice >= Turn.rollFreq[curGuess.sideNum - 1]) {
    result += "<@" + curGuess.ID + ">'s bs was wrong :cry: -1 dice";
    for (var i = 0; i < players.length; i++) {
      if (players[i].ID == id) {
        players[i].dice -= 1;
      }
    }
  } else {
    result += "<@" + id + ">'s guess was wrong :cry: -1 dice";
    for (var i = 0; i < players.length; i++) {
      if (players[i].ID == curGuess.ID) {
        players[i].dice -= 1;
      }
    }
  }
  if (players.length == 1) {
    result += "\n";
    result += "<@" + players[0].ID + "> wins!\n";
    result += "Game Ended.";
    //end game code here
    return result;
  }
  nextTurn();
  return result;
}

module.exports = {
  newGame: newGame,
  constructPlayers: constructPlayers,
  rollPriority: rollPriority,
  nextTurn: nextTurn,
  isInGame: isInGame,
  peek: peek,
  exit: exit,
  isValidGuess: isValidGuess,
  guess: guess,
  bs: bs,
  isCorrectGuess: isCorrectGuess
};
