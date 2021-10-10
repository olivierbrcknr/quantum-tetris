const quantumTetris = (p) => {

  // Sizing setup
  const ledColumns = 20
  const ledRows    = 20

  const tileSize = 22
  const spacer = 3;

  const gridSize = tileSize + spacer
  const resX = ledColumns * gridSize;
  const resY = ledRows    * gridSize;
  const mapWidth = ledColumns;
  const mapHeight = ledRows;
  let bToRemove = mapWidth-2;
  let map = [];

  //Data Variables
  let JSON_file = null
  let generatedBinaries = []

  // Game Setup
  let numberOfBlocks = 150;
  let rowChecker = 0;

  let tetrominoes = [];
  let regBlocks = [];
  let regBlocksCount = 0;
  let noiseBlocks = [];
  let noiseBlocksCount = 0;

  let secondsSinceStart = 0; // Seconds since pressing spacebar
  let secondCounter = 0;
  let pushDownTimer = 0;
  let pushDownDelay = 800; // Time between automatic pushdown of the falling piece
  let gameOver = false;

  // get variables
  const css = getComputedStyle(document.body)

  //Colours
  let bg = p.color( css.getPropertyValue('--color-tetris-bg') ); //Background colour
  let blockColour = p.color( css.getPropertyValue('--color-tetris-block') ); //Colour of tetris block
  let noiseBlockColour = p.color( css.getPropertyValue('--color-tetris-noiseBlock') ); //Colour of 'noisy' tetris block
  let gridColor = p.color( css.getPropertyValue('--color-tetris-grid') );
  let tileColors = []

  // PShape objects are used to render each different thing on screen
  // PShape boxShape;
  // PShape fillShape;
  // PShape mapFillerShape;
  let blocksToRemove = []
  let blockDissolveTimer = 0;

  let tempVal = 0;

  //
  let currPieceType = 0;
  let currPieceX = mapWidth / 2;
  let currPieceY = -1;
  let rotationState = 0;

  let downHoldDelay = 70; // ms between each downwards movement tick while holding the key
  let downPressTime = 0;
  let strafeHoldDelay = 120;
  let strafePressTime = -1;

  let w = false, a = false, s = false, d = false, esc = false, space = false;


  const ledShape = ( color ) => {
    p.fill( color )
    p.circle(0, 0, tileSize)
  }

  p.preload = () => {
    let url = 'data/TETRIS_blocks.json';
    JSON_file = p.loadJSON(url);
  }

  p.setup = () => {
    p.createCanvas(resX,resX)

    generatedBinaries = JSON_file["blocks"]

    // Load Data
    // regBlocks = ""
    // noiseBlocks = ""
    // tetrominoes = ""

    for (let i=0; i < generatedBinaries.length; i++) {

      let blockString = generatedBinaries[i]

      // var b = parseInt( blockString, 2 );
      // console.log(b)

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

    p.noStroke()
    createMap();
    getNewPiece();
  }

  p.draw = () => {

    p.background(200)

    p.background(bg);
    update();
    drawForeground();
    drawFallingPiece();

    if (gameOver) {
      // gameRestart();
    }

    // Hide blocks over start row
    // p.noStroke();
    // p.fill(bg);
    // p.rect(-1, -1, p.width+1, 68);

  }

  /*

  const gameRestart = () => {
    tempVal++;
    drawGameOverScreen();

    if (tempVal==60) {
      resetGameState();
      tempVal = 0;
      gameOver = false;
    }
  }

  */

  // Main gameplay logic loop - push the current piece down, check inputs and remove full rows if they exist
  const update = () => {

    if (!gameOver) {
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
      checkInputs();

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
  }

  const checkForRows = () => {
    for (let y = 0; y < mapHeight - 1; y++) {
      let piecesInRow = 0;
      for (let x = 1; x < mapWidth - 1; x++) {
        if (map[y * mapWidth + x] != 0) piecesInRow++;
      }
      if (piecesInRow == bToRemove) {
        for (let i = 1; i < mapWidth - 1; i++) {
          blocksToRemove.push(y * mapWidth + i);
          blockDissolveTimer = p.millis();
        }
      }
    }
  }

  const dissolveBlocks = () => {
    let dissolveTime = 200;
    if (p.millis() - blockDissolveTimer > dissolveTime) {
      let startHeight = ( blocksToRemove[ blocksToRemove.length - 1 ] + 1 ) / mapWidth;
      let rowsToRemoveHeights = [];
      for (let i = 0; i < blocksToRemove.length / bToRemove; i++) {

        rowsToRemoveHeights.push( (blocksToRemove[bToRemove * i] + 1) / mapWidth )
      }
      let numRowsToDisplace = 0;
      for (let y = startHeight; y >= 0; y--) {
        let doDisplace = true;
        for (let j = 0; j < rowsToRemoveHeights.length; j++) {
          if (y == rowsToRemoveHeights[j]) {
            numRowsToDisplace++;
            doDisplace = false;
          }
        }
        for (let x = 1; x < mapWidth - 1; x++) {
          if (doDisplace) {
            map[(y + numRowsToDisplace) * mapWidth + x] = map[y * mapWidth + x]; //ERROR
            tileColors[(y + numRowsToDisplace) * mapWidth + x] = tileColors[y * mapWidth + x];
          }
          map[y * mapWidth + x] = 0;
          tileColors[y * mapWidth + x] = color(0, 0, 0, 255);
        }
      }
      blocksToRemove = [];
      updateGameSpeed();
    }
  }

  // Locks the current piece as part of the map and checks the game over condition
  const lockCurrPieceToMap = () => {
    let blocksThatFit = 0;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let pieceIndex = rotatef(x, y, rotationState);
        if (tetrominoes[currPieceType].charAt(pieceIndex) == '1') {
          let mapIndex = (currPieceY + y) * mapWidth + (currPieceX + x);
          if (mapIndex >= 0)
          {
            map[mapIndex] = currPieceType + 2;
            if (noiseChecker(tetrominoes[currPieceType])) {
              tileColors[mapIndex] = blockColour;
            } else {
              tileColors[mapIndex] = noiseBlockColour;
            }
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

  // Check if the piece fits in the position it's trying to move leto
  const checkIfPieceFits = (movingToX, movingToY, rotation) => {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let pieceIndex = rotatef(x, y, rotation);
        let mapIndex = (movingToY + y) * mapWidth + (movingToX + x);
        if (movingToX + x <= 0 || movingToX + x >= mapWidth - 1) {
          if (tetrominoes[currPieceType].charAt(pieceIndex) == '1') {
            return false;
          }
        }

        // console.log( tetrominoes[currPieceType].charAt(pieceIndex), map[mapIndex], map[mapIndex] !== 0 )

        let pseudoMapIndex = map[mapIndex]
        if( mapIndex >= map.length ){
          // console.log(' would be undefined ')
          return false
        }

        if (movingToX + x >= 0 && movingToX + x < mapWidth) {
          if (movingToY + y >= 0 && movingToY + y < mapHeight) {
            if (tetrominoes[currPieceType].charAt(pieceIndex) == '1' && pseudoMapIndex !== 0  ) {

              // console.log('hit')
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  /*

  // Instantly place the current piece at the lowest polet directly below it
  const placePieceDownInstantly = () => {
    let lastFitY = 0;
    for (let y = 0; y < mapHeight + 2; y++){
      if (checkIfPieceFits(currPieceX, currPieceY + y, rotationState))
      {
        lastFitY = currPieceY + y
      } else {
        currPieceY = lastFitY
        lockCurrPieceToMap()
      }
    }
  }

  */

  const updateGameSpeed = () => {
    if (pushDownDelay>100) {
      pushDownDelay -= 70
    }
  }

  // Thanks to Javidx9 for this algorithm - https://www.youtube.com/watch?v=8OK8_tHeCIA
  const rotatef = (rx, ry, rState) => {
    switch(rState){
      case 0:
        return ry * 4 + rx //change to 2
      case 1:
        return 12 + ry - (rx * 4)
      case 2:
        return 15 - (ry * 4) - rx
      case 3:
        return 3 - ry + (rx * 4)
      default:
        return 0
    }
  }

  /*
  const resetGame = () => {
    tetrominoes = "";
    rowChecker = 0;
    generateBlocks(regBlocks, noiseBlocks);
    createMap();
    getNewPiece();
    gameOver = false;
    secondsSinceStart = 0;
    secondCounter = millis();
    pushDownDelay = 800;
  }

  */

  // Map —————————————————————————————————————————————

  const generateBlocks = (reg, noise) => {
    let dial = 0;

    for (let i=0; i < numberOfBlocks; i++) {

      const random = p.int( p.random(numberOfBlocks) );
      const regRand = p.int( p.random(reg.length-1) );
      const noiseRand = p.int( p.random(noise.length-1) );

      if (random < dial) {
        //tetrominoes = append(tetrominoes, noise[i]);
        tetrominoes.push(noise[noiseRand]);
      } else {
        //tetrominoes = append(tetrominoes, reg[i]);
        tetrominoes.push(reg[regRand]);
      }
      dial++;
    }
  }


  const addBlocks = (add) => {
    for (let i = 0; i < add; i++) {
      let random = p.int( p.random(numberOfBlocks) );
      tetrominoes.push( noiseBlocks[random] );
    }
  }

  const createMap = () => {
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (x == 0 || x == mapWidth - 1 || y == mapHeight - 1) {
          map[y * mapWidth + x] = 1;
        }
        map[y * mapWidth + x] = 0;
      }
    }
  }

  const drawForeground = () => {
    p.push();
    p.translate(gridSize/2, gridSize/2);
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (map[y * mapWidth + x] == 0) {
          ledShape( gridColor )
        } else {

          let fillColor = bg
          if (map[y * mapWidth + x] !== 1) {
            fillColor = tileColors[y * mapWidth + x]
          }

          if (blocksToRemove.length > 0) {
            for (let j = 0; j < blocksToRemove.length; j++) {
              if ((y * mapWidth + x) == blocksToRemove[j]) {
                let curTileColor = tileColors[y * mapWidth + x];

                // A formula with random numbers to create the effect when clearing rows
                curTileColor += (p.cos(curTileColor) * 3.14 * (2.71 - curTileColor) + (curTileColor * 4.66)) * 0.0001;

                let fillColor = curTileColor
                tileColors[y * mapWidth + x] = curTileColor;
              }
            }
          }
          ledShape( fillColor )
        }
        p.translate(gridSize, 0);
      }
      p.translate(0, gridSize);
      p.translate( -1 * gridSize * mapWidth , 0);
    }
    p.pop();
  }

  /*

  const drawGameOverScreen = () => {
    pushMatrix();
    p.translate(resX/2 - ((tileSize * mapWidth) / 2), 68);
    p.translate(tileSize/2, tileSize/2);
    for (let y = 0; y < mapHeight; y++)
    {
      for (let x = 0; x < mapWidth; x++)
      {
        if (map[y * mapWidth + x] == 0)
        {
          mapFillerShape.setFill(blockColour);
          shape(mapFillerShape);
        }
        p.translate(tileSize, 0);
      }
      p.translate(0, tileSize);
      p.translate(-(tileSize * mapWidth), 0);
    }
    popMatrix();
  }

  // quantum related —————————————————————————————————————————————

  */

  // Draw current falling tetronimo
  const drawFallingPiece = () => {
    p.push();
    // p.translate(resX/2 - ((gridSize * mapWidth) / 2), 68);
    p.translate(gridSize / 2, gridSize / 2);
    p.translate(gridSize * currPieceX, gridSize * currPieceY);

    for (let y = 0; y < 4; y++)
    {
      for (let x = 0; x < 4; x++)
      {
        if (tetrominoes[currPieceType].charAt(rotatef(x, y, rotationState)) == '1')
        {
          let ledFill = noiseBlockColour
          if (noiseChecker(tetrominoes[currPieceType])) {
            ledFill = blockColour;
          }
          ledShape( ledFill )
        }
        p.translate(gridSize, 0);
      }
      p.translate(0, gridSize);
      p.translate(-(gridSize * 4), 0);
    }
    p.pop();
  }

  const getNewPiece = () => {
    rowChecker++;

    if (rowChecker == numberOfBlocks) {
      addBlocks(250);
    }

    currPieceType = rowChecker;
    rotationState = 0;
    //random horizontal distribution
    currPieceX = p.int( p.map(p.random(mapWidth), 0, mapWidth, 0, mapWidth-4) );
    //currPieceY = -4;
    pushDownTimer = p.millis();

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {

        if (tetrominoes[currPieceType].charAt(rotatef(x, y, rotationState)) == '1') {
          if (y==3) {
            currPieceY = -3;
          }
          if (y==2) {
            currPieceY = -2;
          }
          if (y==1) {
            currPieceY = -1;
          }
          if ( y==0) {
            currPieceY = 0;
          }
        }
      }
    }
  }

  const noiseChecker = (input) => {

    // const validShapes= [
    //   "00010111",
    //   "00011110",
    //   "00101011",
    //   "01010101",
    //   "01110100",
    //   "10110100",
    //   "11110000"
    // ]

    const validShapes= [
      "0000001000100110",
      "0000001001100100",
      "0000010001000110",
      "0010001000100010",
      "0010011000100000",
      "0100011000100000",
      "0000011001100000"
    ]

    //true if one of 7, else false
    return validShapes.includes(input)
  }


  const moveChecker = ( dx, dy, dr ) => {

    // console.log(dx, dy, dr)

    // // Check if we are trying to rotate the piece
    if (dr != 0)
    {
      let rotateTest = rotationState;
      let maxRotate = 3; // How many states of rotation are allowed for a piece type

      if (rotateTest + dr == -1) {
        rotateTest = 3;
      } else if (rotateTest + dr > maxRotate) {
        rotateTest = 0;
      } else {
        rotateTest += dr;
      }

      console.log( checkIfPieceFits(currPieceX, currPieceY, rotateTest) )

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
      if (checkIfPieceFits(currPieceX + dx, currPieceY, rotationState)){
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
  }

  p.keyPressed = (e) => {

    let dx = 0; //Delta x
    let dy = 0; // delta y
    let dr = 0; // Delta rotate

    let isListeningToKey = false

    if( e.keyCode === p.LEFT_ARROW ) {
      dx = -1;
      isListeningToKey = true
    }
    if( e.keyCode === p.RIGHT_ARROW ) {
      dx = 1;
      isListeningToKey = true
    }

    if( e.keyCode === p.DOWN_ARROW ) { // IE
      dy = 1;
      isListeningToKey = true
    }

    if( e.keyCode === p.UP_ARROW ) { // IE
      dr = 1;
      isListeningToKey = true
    }


    moveChecker( dx, dy, dr )

    if( isListeningToKey ){
      // prevent default
      return false;
    }

  }

  const checkInputs = () => {
    dy = 1
  }

}
