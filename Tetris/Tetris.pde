/*
 * Thanks to Javidx9 for his tutorial on programming Tetris, it was of great help - https://www.youtube.com/watch?v=8OK8_tHeCIA
 
 TO DO LIST
 • Assign red to the 'noisy' shapes (check if shape deviates from list of 7)
 • use input from a text file to create shapes
 */
String csv[];
String myData[][];
String[] tetrominoes = new String[7];
int resX = 900;
int resY = 800;
int score = 0;
int secondsSinceStart = 0; // Seconds since pressing spacebar
float secondCounter = 0;
float pushDownTimer = 0;
float pushDownDelay = 1000; // Time between automatic pushdown of the falling piece
boolean gameOver = false;
boolean initialPause = true;
int mapWidth = resX/25;
int mapHeight = resY/25;
int bToRemove = mapWidth-2; 
color bg = color(20); //Background colour
color blockColour = color(255); //Colour of tetris block
color gridColor = color(40);

// PShape objects are used to render each different thing on screen
PShape boxShape;
PShape fillShape;
PShape mapFillerShape;
PShape pauseTextBgShape;

PImage[] textures = new PImage[7];
PImage icon;
PImage spritesheet;
PImage vignette;

ArrayList<Integer> blocksToRemove = new ArrayList<Integer>();
float blockDissolveTimer = 0;


void settings()
{
  size(resX, resY); // to be set to FX2D for super sharpness but breaks controls
}

void setup()
{
  
  // Each X marks a tile of the shape
  tetrominoes[0] =  "--1-"; // First assignment needs to be "=" to replace the initial null value
  tetrominoes[0] += "--1-";
  tetrominoes[0] += "--1-";
  tetrominoes[0] += "--1-";
  //println(tetrominoes[0]);
  tetrominoes[1] =  "--1-";
  tetrominoes[1] += "-11-";
  tetrominoes[1] += "-1--";
  tetrominoes[1] += "----";

  tetrominoes[2] =  "-1--";
  tetrominoes[2] += "-11-";
  tetrominoes[2] += "--1-";
  tetrominoes[2] += "----";

  tetrominoes[3] =  "----";
  tetrominoes[3] += "-11-";
  tetrominoes[3] += "-11-";
  tetrominoes[3] += "----";

  tetrominoes[4] =  "--1-";
  tetrominoes[4] += "-11-";
  tetrominoes[4] += "--1-";
  tetrominoes[4] += "----";

  tetrominoes[5] =  "----";
  tetrominoes[5] += "-11-";
  tetrominoes[5] += "--1-";
  tetrominoes[5] += "--1-";

  tetrominoes[6] =  "----";
  tetrominoes[6] += "-11-";
  tetrominoes[6] += "-1--";
  tetrominoes[6] += "-1--";
  shapeMode(CORNER);

  boxShape = createShape(ELLIPSE, 0, 0, tileWidth-spacer, tileHeight-spacer);

  mapFillerShape = createShape(ELLIPSE, 0, 0, tileWidth-spacer, tileHeight-spacer);

  pauseTextBgShape = createShape(RECT, 0, 0, 200, 200);

  boxShape.setStroke(false);

  mapFillerShape.setStroke(false);

  pauseTextBgShape.setFill(color(0, 0, 0));
  pauseTextBgShape.setStroke(color(255, 255, 255));
  createMap();
  getNewPiece();
}

void draw()
{
  background(bg);
  update();
  drawForeground();
  drawFallingPiece();
  drawInterface();

  if (initialPause) drawPauseScreen();

  if (gameOver) drawGameOverScreen();
}

// Main gameplay logic loop - push the current piece down, check inputs and remove full rows if they exist
void update()
{
  if (!gameOver)
  {
    if (!initialPause)
    {
      if (millis() - secondCounter >= 1000)
      {
        secondsSinceStart++;
        secondCounter = millis();
      }
      // Remove rows of blocks if there are any to be removed
      if (blocksToRemove.size() > 0)
      {
        dissolveBlocks();
        pushDownTimer = millis();
        return; // Pause until blocks have been removed
      }

      checkInputs();

      // If the falling piece wasn't manually pushed down by the player, push it down automatically after a delay
      // pushDownTimer is manipulated to control when or if the piece should be pushed down automatically
      if (millis() - pushDownTimer > pushDownDelay)
      {
        if (checkIfPieceFits(currPieceX, currPieceY + 1, rotationState))
        {
          currPieceY++;
        } else
        {
          lockCurrPieceToMap();
        }

        pushDownTimer = millis();
      }
    }
  }
}

// Checks for 10 blocks on each row
void checkForRows() //set number to 30 for now-will need to change eventually
{

  for (int y = 0; y < mapHeight - 1; y++)
  {
    int piecesInRow = 0;
    for (int x = 1; x < mapWidth - 1; x++)
    {
      if (map[y * mapWidth + x] != 0) piecesInRow++;
    }
    if (piecesInRow == bToRemove)
    {
      for (int i = 1; i < mapWidth - 1; i++)
      {
        blocksToRemove.add(y * mapWidth + i);
        blockDissolveTimer = millis();
      }
    }
  }
}

// Removes rows of blocks and moves all the tiles above down N amount of steps
// The basic logic:
// 1. Find the height for each row we need to remove
// 2. Start by removing the lowest row we need to remove
// 3. Displace all blocks above the rows we remove
// 4. How much we displace the blocks needs to be increased by 1 for each removed row below it
void dissolveBlocks()
{
  int dissolveTime = 200;

  if (millis() - blockDissolveTimer > dissolveTime)
  {
    int startHeight = (blocksToRemove.get(blocksToRemove.size() - 1) + 1) / mapWidth;

    ArrayList<Integer> rowsToRemoveHeights = new ArrayList<Integer>();

    for (int i = 0; i < blocksToRemove.size() / 10; i++)
    {
      rowsToRemoveHeights.add((blocksToRemove.get(10 * i) + 1) / mapWidth);
    }

    int numRowsToDisplace = 0;

    for (int y = startHeight; y >= 0; y--)
    {
      boolean doDisplace = true;

      for (int j = 0; j < rowsToRemoveHeights.size(); j++)
      {

        if (y == rowsToRemoveHeights.get(j))
        {
          numRowsToDisplace++;
          doDisplace = false;
        }
      }

      for (int x = 1; x < mapWidth - 1; x++)
      {

        if (doDisplace)
        {
          map[(y + numRowsToDisplace) * mapWidth + x] = map[y * mapWidth + x]; //ERROR
          tileColors[(y + numRowsToDisplace) * mapWidth + x] = tileColors[y * mapWidth + x];
        }

        map[y * mapWidth + x] = 0;
        tileColors[y * mapWidth + x] = color(0, 0, 0, 255);
      }
    }

    blocksToRemove.clear();
  }
}

// Locks the current piece as part of the map and checks the game over condition
void lockCurrPieceToMap()
{
  int blocksThatFit = 0;
  for (int y = 0; y < 4; y++)
  {
    for (int x = 0; x < 4; x++)
    {
      int pieceIndex = rotate(x, y, rotationState);

      if (tetrominoes[currPieceType].charAt(pieceIndex) == '1')
      {
        int mapIndex = (currPieceY + y) * mapWidth + (currPieceX + x);

        if (mapIndex >= 0)
        {
          map[mapIndex] = currPieceType + 2;
          tileColors[mapIndex] = blockColour;
          blocksThatFit++;
        }
      }
    }
  }

  if (blocksThatFit != 4)
  {
    gameOver = true;
  }

  if (!gameOver)
  {
    checkForRows();
    updateGameSpeed();
    getNewPiece();
  }
}

// Check if the piece fits in the position it's trying to move into
boolean checkIfPieceFits(int movingToX, int movingToY, int rotation)
{
  for (int y = 0; y < 4; y++)
  {

    for (int x = 0; x < 4; x++)
    {
      int pieceIndex = rotate(x, y, rotation);

      int mapIndex = (movingToY + y) * mapWidth + (movingToX + x);

      if (movingToX + x <= 0 || movingToX + x >= mapWidth - 1)
      {

        if (tetrominoes[currPieceType].charAt(pieceIndex) == '1')
        {
          return false;
        }
      }
      if (movingToX + x >= 0 && movingToX + x < mapWidth)
      {

        if (movingToY + y >= 0 && movingToY + y < mapHeight)
        {

          if (tetrominoes[currPieceType].charAt(pieceIndex) == '1' && map[mapIndex] != 0)
          {
            return false;
          }
        }
      }
    }
  }
  return true;
}

// Instantly place the current piece at the lowest point directly below it
void placePieceDownInstantly()
{
  int lastFitY = 0;
  for (int y = 0; y < mapHeight + 2; y++)
  {
    if (checkIfPieceFits(currPieceX, currPieceY + y, rotationState))
    {
      lastFitY = currPieceY + y;
    } else
    {
      currPieceY = lastFitY;
      lockCurrPieceToMap();
      break;
    }
  }
}

// Changes speed of automatic pushdown according to time elapsed, somewhat in tune with the music
void updateGameSpeed()
{
  if (secondsSinceStart >= 248)
  {
    pushDownDelay = 70;
  } else if (secondsSinceStart >= 180)
  {
    pushDownDelay = 300;
  } else if (secondsSinceStart >= 120)
  {
    pushDownDelay = 500;
  } else if (secondsSinceStart >= 60)
  {
    pushDownDelay = 700;
  }
}

// Thanks to Javidx9 for this algorithm - https://www.youtube.com/watch?v=8OK8_tHeCIA
int rotate(int rx, int ry, int rState)
{
  switch(rState)
  {
  case 0:
    return ry * 4 + rx;
  case 1:
    return 12 + ry - (rx * 4);
  case 2:
    return 15 - (ry * 4) - rx;
  case 3:
    return 3 - ry + (rx * 4);
  }
  return 0;
}

void resetGameState()
{
  createMap();
  getNewPiece();
  gameOver = false;
  initialPause = true;
  secondsSinceStart = 0;
  secondCounter = millis();
  pushDownDelay = 1000;
}
