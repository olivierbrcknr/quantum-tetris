function preload() {
  csv = loadStrings("TETRIS_blocks.csv");
}
function setup() {
  createCanvas(resX, resY);

  //Define colours
  blockColour = color(255);
  bg = color(20, 20, 20);
  noiseBlockColour = color(255, 0, 0);
  gridColor = color(40);

  for (let i = 0; i < csv.length; i++) {
    let sub1 = csv[i].substring(0, 2);
    let sub2 = csv[i].substring(2, 4);
    let sub3 = csv[i].substring(4, 6);
    let sub4 = csv[i].substring(6, 8);
    let one = "0";
    let two = "00";
    var StringsToJoin = [one, sub1, two, sub2, two, sub3, two, sub4, one];
    var sixteenBit = join(StringsToJoin, "");
    myData[i] = sixteenBit;

    if (noiseChecker(myData[i])) {
      regBlocks = append(regBlocks, myData[i]);
    } else {
      noiseBlocks = append(noiseBlocks, myData[i]);
    }
  }
  generateBlocks(regBlocks, noiseBlocks);

  createMap();
  getNewPiece();
}

function rotatef(rx, ry, rState) {
  switch (rState) {
    case 0:
      return ry * 4 + rx; //change to 2
    case 1:
      return 12 + ry - rx * 4;
    case 2:
      return 15 - ry * 4 - rx;
    case 3:
      return 3 - ry + rx * 4;
  }
  return 0;
}



function draw() {
  background(bg);
  update();
  drawForeground();
  drawFallingPiece();
  if (gameOver) {
    gameRestart();
  }

  noStroke();
  fill(bg);
  rect(-1, -1, width + 1, 68);
}

function update() {
  if (!gameOver) {
    if (millis() - secondCounter >= 1000) {
      secondsSinceStart++;
      secondCounter = millis();
    }
    // Remove rows of blocks if there are any to be removed
    if (blocksToRemove.length > 0) {
      dissolveBlocks();
      pushDownTimer = millis();
      return; // Pause until blocks have been removed
    }
    checkInputs();
    // If the falling piece wasn't manually pushed down by the player, push it down automatically after a delay
    // pushDownTimer is manipulated to control when or if the piece should be pushed down automatically
    if (millis() - pushDownTimer > pushDownDelay) {
      if (checkIfPieceFits(currPieceX, currPieceY + 1, rotationState)) {
        currPieceY++;
      } else {
        lockCurrPieceToMap();
      }
      pushDownTimer = millis();
    }
  }
}



function checkIfPieceFits(movingToX, movingToY, rotation) {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      let pieceIndex = rotatef(x, y, rotation);
      let mapIndex = (movingToY + y) * mapWidth + (movingToX + x);
      if (movingToX + x <= 0 || movingToX + x >= mapWidth - 1) {
        if (tetrominoes[currPieceType].charAt(pieceIndex) == "1") {
          return false;
        }
      }
      if (movingToX + x >= 0 && movingToX + x < mapWidth) {
        if (movingToY + y >= 0 && movingToY + y < mapHeight) {
          if (
            tetrominoes[currPieceType].charAt(pieceIndex) == "1" &&
            tMap[mapIndex] != 0
          ) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

function gameRestart() {
  tempVal++;
  drawGameOverScreen();

  if (tempVal == 60) {
    resetGameState();
    tempVal = 0;
    gameOver = false;
  }
}



function checkForRows() {
  for (let y = 0; y < mapHeight - 1; y++) {
    let piecesInRow = 0;
    for (let x = 1; x < mapWidth - 1; x++) {
      if (tMap[y * mapWidth + x] != 0) piecesInRow++;
    }
    if (piecesInRow == bToRemove) {
      for (let i = 1; i < mapWidth - 1; i++) {
        blocksToRemove.append(y * mapWidth + i);
        blockDissolveTimer = millis();
      }
    }
  }
}

function dissolveBlocks() {
  let dissolveTime = 200;
  if (millis() - blockDissolveTimer > dissolveTime) {
    let startHeight = (blocksToRemove[blocksToRemove.length - 1] + 1) / mapWidth;
    let rowsToRemoveHeights = [];
    for (let i = 0; i < blocksToRemove.length / bToRemove; i++) {
      rowsToRemoveHeights.add((blocksToRemove.get(bToRemove * i) + 1) / mapWidth);
    }
    let numRowsToDisplace = 0;
    for (let y = startHeight; y >= 0; y--) {
      var doDisplace = true;
      for (let j = 0; j < rowsToRemoveHeights.length; j++) {
        if (y == rowsToRemoveHeights[j]) {
          numRowsToDisplace++;
          doDisplace = false;
        }
      }
      for (let x = 1; x < mapWidth - 1; x++) {
        if (doDisplace) {
          tMap[(y + numRowsToDisplace) * mapWidth + x] = tMap[y * mapWidth + x]; //ERROR
          tileColors[(y + numRowsToDisplace) * mapWidth + x] = tileColors[y * mapWidth + x];
        }
        tMap[y * mapWidth + x] = 0;
        tileColors[y * mapWidth + x] = color(0, 0, 0, 255);
      }
    }
    blocksToRemove = [];
    updateGameSpeed();
  }
}

// Locks the current piece as part of the map and checks the game over condition
function lockCurrPieceToMap() {
  let blocksThatFit = 0;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      let pieceIndex = rotatef(x, y, rotationState);
      if (tetrominoes[currPieceType].charAt(pieceIndex) == '1') {
        let mapIndex = (currPieceY + y) * mapWidth + (currPieceX + x);
        if (mapIndex >= 0) {
          tMap[mapIndex] = currPieceType + 2;
          if (noiseChecker(tetrominoes[currPieceType])) {
            tileColors[mapIndex] = blockColour;
          } else {
            tileColors[mapIndex] = noiseBlockColour;
          }
          //blocksThatFit++;
          blocksThatFit = currPieceY;
        }
      }
    }
  }
  if (blocksThatFit < 0) {
    gameOver = true;
  }

  if (!gameOver) {
    checkForRows();
    getNewPiece();
  }
}

// Check if the piece fits in the position it's trying to move into
function checkIfPieceFits(movingToX, movingToY, rotation) {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      let pieceIndex = rotatef(x, y, rotation);
      let mapIndex = (movingToY + y) * mapWidth + (movingToX + x);
      if (movingToX + x <= 0 || movingToX + x >= mapWidth - 1) {
        if (tetrominoes[currPieceType].charAt(pieceIndex) == '1') {
          return false;
        }
      }
      if (movingToX + x >= 0 && movingToX + x < mapWidth) {
        if (movingToY + y >= 0 && movingToY + y < mapHeight) {
          if (tetrominoes[currPieceType].charAt(pieceIndex) == '1' && tMap[mapIndex] != 0) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

// Instantly place the current piece at the lowest point directly below it
function placePieceDownInstantly() {
  let lastFitY = 0;
  for (let y = 0; y < mapHeight + 2; y++) {
    if (checkIfPieceFits(currPieceX, currPieceY + y, rotationState)) {
      lastFitY = currPieceY + y;
    } else {
      currPieceY = lastFitY;
      lockCurrPieceToMap();
      break;
    }
  }
}

// Changes speed of automatic pushdown according to time elapsed, somewhat in tune with the music
function updateGameSpeed() {
  if (pushDownDelay > 100) {
    pushDownDelay -= 70;
  }
}


function resetGameState() {
  //saveFrame("game/###.png"); // enable to record screenshot at the end of the run
  tetrominoes = [];
  rowChecker = 0;
  generateBlocks(regBlocks, noiseBlocks);
  createMap();
  getNewPiece();
  gameOver = false;
  secondsSinceStart = 0;
  secondCounter = millis();
  pushDownDelay = 800;
}
