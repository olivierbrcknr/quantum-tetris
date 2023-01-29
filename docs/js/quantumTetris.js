const quantumTetris = (p) => {
  let score = 0;
  let currentHighScore = 0;
  let completedRows = 0;

  const rowsNeededToIncreaseGameSpeed = 5;

  let canvasDOM = null;

  // Sizing setup
  let ledColumns = 10;
  let ledRows = 20;

  const TILE_SIZE = 22;
  const SPACER = 3;
  const GRID_SIZE = TILE_SIZE + SPACER;

  if (window.innerWidth <= 600) {
    ledColumns = parseInt((window.innerWidth - 40) / GRID_SIZE);
    ledRows = parseInt((window.innerHeight - 200) / GRID_SIZE);
    if (ledRows > 20) {
      ledRows = 20;
    }
  }

  const RES_X = ledColumns * GRID_SIZE;
  const RES_Y = ledRows * GRID_SIZE;
  const MAP_WIDTH = ledColumns;
  const MAP_HEIGHT = ledRows;
  const BLOCKS_PER_ROW = MAP_WIDTH; // same as map width
  let map = [];

  //Data Variables
  let JSON_file = null;
  let generatedBinaries = [];

  // Game Setup
  const NUMBER_OF_BLOCKS = 150;
  let rowChecker = 0;

  let tetrominoes = [];
  let regBlocks = [];
  let noiseBlocks = [];

  let secondsSinceStart = 0; // Seconds since pressing spacebar
  let secondCounter = 0;
  let pushDownTimer = 0;
  const DISSOLVE_TIME = 200;

  const INITIAL_PUSH_DOWN_DELAY = 800; // Time between automatic pushdown of the falling piece
  let pushDownDelay = INITIAL_PUSH_DOWN_DELAY;
  // how much faster the game gets after a successful line
  const GAME_SPEED_INCREMENT = 80;
  let gameOver = false;
  let isPause = false;

  // get variables
  const CSS = getComputedStyle(document.body);

  //Colours
  let bg = p.color(CSS.getPropertyValue("--color-tetris-bg")); //Background colour
  let blockColour = p.color(CSS.getPropertyValue("--color-tetris-block")); //Colour of tetris block
  let noiseBlockColour = p.color(
    CSS.getPropertyValue("--color-tetris-noiseBlock")
  ); //Colour of 'noisy' tetris block
  let gridColor = p.color(CSS.getPropertyValue("--color-tetris-grid"));
  let removeColor = p.color(CSS.getPropertyValue("--color-tetris-remove"));

  let blocksToRemove = [];
  let blockDissolveTimer = 0;
  let tempVal = 0;

  // piece variables
  let currPieceType = 0;
  let currPieceX = MAP_WIDTH / 2;
  let currPieceY = -1;
  let rotationState = 0;

  const ledShapeMultiplier = 2;
  const ledSize =
    (TILE_SIZE - SPACER * (ledShapeMultiplier - 1)) / ledShapeMultiplier;

  // const TILE_SIZE = 22;
  //   const SPACER = 3;
  //   const GRID_SIZE = TILE_SIZE + SPACER;

  console.log(TILE_SIZE, ledSize);

  const ledShape = (color) => {
    p.push();

    p.translate(-TILE_SIZE / 2, -TILE_SIZE / 2);

    p.fill(color);
    // p.circle(0, 0, TILE_SIZE)
    for (let x = 0; x < ledShapeMultiplier; x++) {
      for (let y = 0; y < ledShapeMultiplier; y++) {
        p.rect(
          x * (ledSize + SPACER),
          y * (ledSize + SPACER),
          ledSize,
          ledSize
        );
      }
    }
    p.pop();
  };

  p.preload = () => {
    let url = "data/TETRIS_blocks.json";
    JSON_file = p.loadJSON(url);
  };

  p.setup = () => {
    canvasDOM = p.createCanvas(RES_X, RES_Y);

    generatedBinaries = JSON_file["blocks"];

    for (let i = 0; i < generatedBinaries.length; i++) {
      let blockString = generatedBinaries[i];

      let sub1 = blockString.substring(0, 2);
      let sub2 = blockString.substring(2, 4);
      let sub3 = blockString.substring(4, 6);
      let sub4 = blockString.substring(6, 8);
      let one = "0";
      let two = "00";
      let StringsToJoin = [one, sub1, two, sub2, two, sub3, two, sub4, one];
      let sixteenBit = StringsToJoin.join("");

      // console.log( sixteenBit )

      if (noiseChecker(sixteenBit)) {
        regBlocks.push(sixteenBit);
      } else {
        noiseBlocks.push(sixteenBit);
      }
    }

    generateBlocks(regBlocks, noiseBlocks);

    p.noStroke();
    createMap();
    getNewPiece();

    // for mobile gaming
    setupVirtualButtons();
  };

  p.draw = () => {
    p.background(bg);
    update();
    drawForeground();
    drawFallingPiece();

    if (gameOver) {
      // console.log( "Game Over 💀" )
      gameRestart();
    }
  };

  const gameRestart = () => {
    tempVal++;
    drawGameOverScreen();

    if (tempVal == 60) {
      resetGameState();
    }
  };

  const resetGameState = () => {
    // enable to record screenshot at the end of the run
    if (score > currentHighScore) {
      currentHighScore = score;
      console.log("New High Score 🎉");
    }
    console.log("Score:", score);
    score = 0;
    completedRows = 0;

    p.saveCanvas(canvasDOM, "QuantumTetris", "jpg");

    rowChecker = 0;
    generateBlocks(regBlocks, noiseBlocks);
    createMap();
    getNewPiece();
    gameOver = false;
    secondsSinceStart = 0;
    secondCounter = p.millis();
    pushDownDelay = INITIAL_PUSH_DOWN_DELAY;
    tempVal = 0;
  };

  // Main gameplay logic loop - push the current piece down, check inputs and remove full rows if they exist
  const update = () => {
    if (!gameOver && !isPause) {
      if (p.millis() - secondCounter >= 1000) {
        secondsSinceStart++;
        secondCounter = p.millis();
      }
      // Remove rows of blocks if there are any to be removed
      if (blocksToRemove.length > 0) {
        dissolveBlocks();
        pushDownTimer = p.millis();
        return; // Pause until blocks have been removed
      }

      // console.log( p.millis() - pushDownTimer , pushDownDelay )

      // If the falling piece wasn't manually pushed down by the player, push it down automatically after a delay
      // pushDownTimer is manipulated to control when or if the piece should be pushed down automatically
      if (p.millis() - pushDownTimer > pushDownDelay) {
        if (checkIfPieceFits(currPieceX, currPieceY + 1, rotationState)) {
          currPieceY++;
        } else {
          lockCurrPieceToMap();
        }
        pushDownTimer = p.millis();
      }
    }
  };

  const checkForRows = () => {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      let piecesInRow = 0;
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (map[y * MAP_WIDTH + x] != 0) piecesInRow++;
      }
      if (piecesInRow == BLOCKS_PER_ROW) {
        for (let i = 0; i < MAP_WIDTH; i++) {
          blocksToRemove.push(y * MAP_WIDTH + i);
          blockDissolveTimer = p.millis();
        }
      }
    }
  };

  const dissolveBlocks = () => {
    if (p.millis() - blockDissolveTimer > DISSOLVE_TIME) {
      const rowsToRemoveIndexArray = [];

      for (let i = 0; i < blocksToRemove.length / BLOCKS_PER_ROW; i++) {
        rowsToRemoveIndexArray.push(
          (blocksToRemove[BLOCKS_PER_ROW * i] + 0) / MAP_WIDTH
        );
      }

      const lastRowIndex =
        rowsToRemoveIndexArray[rowsToRemoveIndexArray.length - 1];

      // count how many rows need to be pushed
      let numRowsToDisplace = rowsToRemoveIndexArray.length;

      // update score and speed
      score += numRowsToDisplace * pushDownDelay;

      // start at the last row that needs to be deleted and go upwards from there and move each line downwards
      for (let y = lastRowIndex; y >= 0; y--) {
        // check if row should be deleted
        let needsToBeDeleted = false;

        // if row is part of the ones to be removed,
        // count count up and set delete to true
        if (rowsToRemoveIndexArray.find((i) => i === y)) {
          // numRowsToDisplace++;
          needsToBeDeleted = true;
        }

        // then go through each cell of the row
        for (let x = 0; x < MAP_WIDTH; x++) {
          const cellIndex = y * MAP_WIDTH + x;
          const shift = numRowsToDisplace * MAP_WIDTH;

          // if does not need to be deleted
          if (!needsToBeDeleted) {
            map[cellIndex + shift] = map[cellIndex];
          }

          // delete current position
          map[cellIndex] = 0;
        }
      }

      blocksToRemove = [];
      updateGameSpeed();
    }
  };

  // Locks the current piece as part of the map and checks the game over condition
  const lockCurrPieceToMap = () => {
    let blocksThatFit = 0;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let pieceIndex = rotatef(x, y, rotationState);
        if (tetrominoes[currPieceType].charAt(pieceIndex) == "1") {
          let mapIndex = (currPieceY + y) * MAP_WIDTH + (currPieceX + x);
          if (mapIndex >= 0) {
            map[mapIndex] = currPieceType + 2;
            if (noiseChecker(tetrominoes[currPieceType])) {
              map[mapIndex] = 1;
            } else {
              map[mapIndex] = 2;
            }
            blocksThatFit = currPieceY;
          }
        }
      }
    }

    if (blocksThatFit <= 0) {
      gameOver = true;
    }
    if (!gameOver) {
      checkForRows();
      getNewPiece();
    }
  };

  // Check if the piece fits in the position it's trying to move leto
  const checkIfPieceFits = (movingToX, movingToY, rotation) => {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let pieceIndex = rotatef(x, y, rotation);
        let mapIndex = (movingToY + y) * MAP_WIDTH + (movingToX + x);

        // only do calculations if there is acutally a piece at this pixel
        if (tetrominoes[currPieceType].charAt(pieceIndex) == "1") {
          if (mapIndex >= map.length) {
            return false;
          }

          if (movingToX + x < 0 || movingToX + x > MAP_WIDTH - 1) {
            return false;
          }

          if (movingToX + x >= 0 && movingToX + x < MAP_WIDTH) {
            if (movingToY + y >= 0 && movingToY + y <= MAP_HEIGHT) {
              if (map[mapIndex] !== 0 && mapIndex > MAP_WIDTH) {
                return false;
              }
            } else if (movingToY + y > MAP_HEIGHT) {
              return false;
            }
          }
        }
      }
    }
    return true;
  };

  // Instantly place the current piece at the lowest polet directly below it
  const placePieceDownInstantly = () => {
    let lastFitY = 0;
    let foundPosition = false;
    let y = 0;
    while (!foundPosition) {
      if (checkIfPieceFits(currPieceX, currPieceY + y, rotationState)) {
        lastFitY = currPieceY + y;
      } else {
        foundPosition = true;
        currPieceY = lastFitY;
        lockCurrPieceToMap();
      }
      y++;
    }
  };

  const updateGameSpeed = () => {
    if (
      pushDownDelay > 100 &&
      completedRows % rowsNeededToIncreaseGameSpeed == 0
    ) {
      pushDownDelay -= GAME_SPEED_INCREMENT;
      console.log("increased game speed 🏃", pushDownDelay);
    }
  };

  // Thanks to Javidx9 for this algorithm - https://www.youtube.com/watch?v=8OK8_tHeCIA
  const rotatef = (rx, ry, rState) => {
    switch (rState) {
      case 0:
        return ry * 4 + rx; //change to 2
      case 1:
        return 12 + ry - rx * 4;
      case 2:
        return 15 - ry * 4 - rx;
      case 3:
        return 3 - ry + rx * 4;
      default:
        return 0;
    }
  };

  // Map —————————————————————————————————————————————

  const generateBlocks = (reg, noise) => {
    // empty array
    tetrominoes = [];
    let dial = 0;

    for (let i = 0; i < NUMBER_OF_BLOCKS; i++) {
      const random = p.int(p.random(NUMBER_OF_BLOCKS));
      const regRand = p.int(p.random(reg.length - 1));
      const noiseRand = p.int(p.random(noise.length - 1));

      if (random < dial) {
        //tetrominoes = append(tetrominoes, noise[i]);
        tetrominoes.push(noise[noiseRand]);
      } else {
        //tetrominoes = append(tetrominoes, reg[i]);
        tetrominoes.push(reg[regRand]);
      }
      dial++;
    }
  };

  const addBlocks = (add) => {
    for (let i = 0; i < add; i++) {
      let random = p.int(p.random(NUMBER_OF_BLOCKS));
      tetrominoes.push(noiseBlocks[random]);
    }
  };

  const createMap = () => {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (x == 0 || x == MAP_WIDTH - 1 || y == MAP_HEIGHT - 1) {
          map[y * MAP_WIDTH + x] = 1;
        }
        map[y * MAP_WIDTH + x] = 0;
      }
    }
  };

  // replace undefined with 0
  const fixMap = () => {
    map = map.map((el) => {
      if (el === undefined) {
        return 0;
      } else {
        return el;
      }
    });
  };

  const drawForeground = () => {
    p.push();
    p.translate(GRID_SIZE / 2, GRID_SIZE / 2);
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        let fillColor = gridColor;

        switch (map[y * MAP_WIDTH + x]) {
          // regular LED
          case 1:
            fillColor = blockColour;
            break;
          // is noise
          case 2:
            fillColor = noiseBlockColour;
            break;
          // everything else
          default:
            fillColor = gridColor;
            break;
        }

        // highlight the blocks that get removed
        if (blocksToRemove.length > 0) {
          // console.log(blocksToRemove)
          if (blocksToRemove.includes(y * MAP_WIDTH + x)) {
            fillColor = removeColor;
          }
        }

        ledShape(fillColor);

        p.translate(GRID_SIZE, 0);
      }
      p.translate(0, GRID_SIZE);
      p.translate(-1 * GRID_SIZE * MAP_WIDTH, 0);
    }
    p.pop();
  };

  // fill empty tiles with white LEDs
  const drawGameOverScreen = () => {
    p.push();

    p.translate(GRID_SIZE / 2, GRID_SIZE / 2);
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (map[y * MAP_WIDTH + x] == 0) {
          ledShape(blockColour);
        }
        p.translate(GRID_SIZE, 0);
      }
      p.translate(0, GRID_SIZE);
      p.translate(-(GRID_SIZE * MAP_WIDTH), 0);
    }
    p.pop();
  };

  // quantum related —————————————————————————————————————————————

  // Draw current falling tetronimo
  const drawFallingPiece = () => {
    p.push();

    p.translate(GRID_SIZE / 2, GRID_SIZE / 2);
    p.translate(GRID_SIZE * currPieceX, GRID_SIZE * currPieceY);

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (
          tetrominoes[currPieceType].charAt(rotatef(x, y, rotationState)) == "1"
        ) {
          let ledFill = noiseBlockColour;
          if (noiseChecker(tetrominoes[currPieceType])) {
            ledFill = blockColour;
          }
          ledShape(ledFill);
        }
        p.translate(GRID_SIZE, 0);
      }
      p.translate(0, GRID_SIZE);
      p.translate(-(GRID_SIZE * 4), 0);
    }
    p.pop();
  };

  const getNewPiece = () => {
    rowChecker++;

    if (rowChecker == NUMBER_OF_BLOCKS) {
      addBlocks(NUMBER_OF_BLOCKS);
    }

    currPieceType = rowChecker;

    // random rotaiton
    rotationState = p.int(p.random(3));

    // make sure the piece would fit in the x axis
    let fitsInX = false;

    while (!fitsInX) {
      //random horizontal distribution
      currPieceX = p.int(
        p.map(p.random(MAP_WIDTH), 0, MAP_WIDTH, -2, MAP_WIDTH - 2)
      );

      if (checkIfPieceFits(currPieceX, -4, rotationState)) {
        fitsInX = true;
      }
    }

    // adjust y position for the piece to appear
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (
          tetrominoes[currPieceType].charAt(rotatef(x, y, rotationState)) == "1"
        ) {
          currPieceY = -1 * y;
        }
      }
    }

    pushDownTimer = p.millis();
  };

  // returns false if is noise
  const noiseChecker = (input) => {
    const validShapes = [
      "0000001000100110",
      "0000001001100100",
      "0000010001000110",
      "0010001000100010",
      "0010011000100000",
      "0100011000100000",
      "0000011001100000",
    ];

    //true if one of 7, else false
    return validShapes.includes(input);
  };

  const moveChecker = (dx, dy, dr) => {
    // console.log(dx, dy, dr)

    // // Check if we are trying to rotate the piece
    if (dr != 0) {
      let rotateTest = rotationState;
      let maxRotate = 3; // How many states of rotation are allowed for a piece type

      if (rotateTest + dr == -1) {
        rotateTest = 3;
      } else if (rotateTest + dr > maxRotate) {
        rotateTest = 0;
      } else {
        rotateTest += dr;
      }

      // console.log( checkIfPieceFits(currPieceX, currPieceY, rotateTest) )

      if (checkIfPieceFits(currPieceX, currPieceY, rotateTest)) {
        rotationState = rotateTest;
      } else if (checkIfPieceFits(currPieceX + 1, currPieceY, rotateTest)) {
        rotationState = rotateTest;
        dx = 1;
      } else if (checkIfPieceFits(currPieceX - 1, currPieceY, rotateTest)) {
        rotationState = rotateTest;
        dx = -1;
      } else if (checkIfPieceFits(currPieceX + 2, currPieceY, rotateTest)) {
        rotationState = rotateTest;
        dx = 2;
      } else if (checkIfPieceFits(currPieceX - 2, currPieceY, rotateTest)) {
        rotationState = rotateTest;
        dx = -2;
      }
    }

    // Check if we are trying to move the piece horizontally
    if (dx != 0) {
      if (checkIfPieceFits(currPieceX + dx, currPieceY, rotationState)) {
        currPieceX += dx;
      }
    }

    // Check if we are trying to move the piece vertically
    if (dy != 0) {
      if (checkIfPieceFits(currPieceX, currPieceY + dy, rotationState)) {
        currPieceY += dy;
      } else {
        lockCurrPieceToMap();
      }
    }
  };

  p.keyPressed = (e) => {
    let dx = 0; //Delta x
    let dy = 0; // delta y
    let dr = 0; // Delta rotate

    let isListeningToKey = false;

    if (e.keyCode === p.LEFT_ARROW) {
      dx = -1;
      isListeningToKey = true;
    }
    if (e.keyCode === p.RIGHT_ARROW) {
      dx = 1;
      isListeningToKey = true;
    }

    if (e.keyCode === p.DOWN_ARROW) {
      dy = 1;
      isListeningToKey = true;
    }

    if (e.keyCode === p.UP_ARROW) {
      dr = 1;
      isListeningToKey = true;
    }

    // spacebar
    if (e.keyCode == 32) {
      if (!isPause) {
        placePieceDownInstantly();
      }
      isListeningToKey = true;
    }

    // P
    if (e.keyCode == 80) {
      isPause = !isPause;
      isListeningToKey = true;
    }

    if (!isPause) {
      moveChecker(dx, dy, dr);
    }

    if (isListeningToKey) {
      // prevent default
      return false;
    }
  };

  const setupVirtualButtons = () => {
    const container = document.querySelector("#tetris-game-mobileControls");

    // check if is TouchDevice and display buttons
    console.log(window.matchMedia("(pointer: coarse)").matches);
    if (window.matchMedia("(pointer: coarse)").matches) {
      container.style.display = "flex";
    }

    container.querySelector(".left").addEventListener("click", () => {
      moveChecker(-1, 0, 0);
    });
    container.querySelector(".right").addEventListener("click", () => {
      moveChecker(1, 0, 0);
    });
    container.querySelector(".rotate").addEventListener("click", () => {
      moveChecker(0, 0, 1);
    });
    container.querySelector(".place").addEventListener("click", () => {
      placePieceDownInstantly();
    });
  };
};
