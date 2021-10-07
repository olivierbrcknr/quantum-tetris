//Import Libraries
import net.java.games.input.*;
import org.gamecontrolplus.*;
import org.gamecontrolplus.gui.*;
import processing.javafx.*;

//Sizing setup
int resX = 800;
int resY = 800;
int mapWidth = resX/25;
int mapHeight = resY/25;
int bToRemove = mapWidth-2;
int[] map = new int[mapWidth * mapHeight];
int fidelity = 22;
int tileWidth = fidelity;
int tileHeight = fidelity;
int spacer = 3;
color[] tileColors = new color[mapWidth * mapHeight]; // Keeps track of the color of all tiles
int numberOfBlocks = 100;

// controller variables
ControlIO control;
ControlDevice device;
ControlButton button;
float DLR; //D-pad L/R
float DUD; //D-pad U/D
float A; // A button
float B; // B button
float Start; // Start button
float Select; // Select button
float initialVal1 = 0.0;
float initialVal2 = 0.0;
float timerVal1 = 0.0;
float timerVal2 = 0.0;


//Data Variables
String csv[];
int rowChecker = 0;
int colChecker = 0; //tracks current column/run of game
int colNumber = 1; //put number of columns in source .csv file here
String tetrominoes[];
String myData[][];
String regBlocks[];
int regBlocksCount = 0;
String noiseBlocks[];
int noiseBlocksCount = 0;

int secondsSinceStart = 0; // Seconds since pressing spacebar
float secondCounter = 0;
float pushDownTimer = 0;
float pushDownDelay = 800; // Time between automatic pushdown of the falling piece
boolean gameOver = false;

//Colours
color bg = color(20); //Background colour
color blockColour = color(255); //Colour of tetris block
color noiseBlockColour = color(255, 0, 0); //Colour of 'noisy' tetris block
color gridColor = color(40);

// PShape objects are used to render each different thing on screen
PShape boxShape;
PShape fillShape;
PShape mapFillerShape;
ArrayList<Integer> blocksToRemove = new ArrayList<Integer>();
float blockDissolveTimer = 0;


float tempVal = 0;
void settings()
{
  size(resX, resY, FX2D);
}

void setup()
{
  // Controller set up
  //control = ControlIO.getInstance(this);
  //device = control.getMatchedDevice("NES_Suily_Controller");

  // Load Data
  csv = loadStrings("TETRIS_blocks.csv");
  myData = new String[csv.length][1];
  regBlocks = new String[0];
  noiseBlocks = new String[0];
  tetrominoes = new String[0];

  for (int i=0; i<myData.length; i++) {
    myData[i] = csv[i].split(",");
  }

  for (int i=0; i<myData.length; i++) {
    String sub1 = myData[i][0].substring(0, 2);
    String sub2 = myData[i][0].substring(2, 4);
    String sub3 = myData[i][0].substring(4, 6);
    String sub4 = myData[i][0].substring(6, 8);
    String one = "0";
    String two = "00";
    String[] StringsToJoin = {one, sub1, two, sub2, two, sub3, two, sub4, one};
    String sixteenBit = join(StringsToJoin, "");
    myData[i][0]=sixteenBit;

    if (noiseChecker(myData[i][0])) {
      regBlocks = append(regBlocks, myData[i][0]);
    } else {
      noiseBlocks = append(noiseBlocks, myData[i][0]);
    }
  }

  generateBlocks(regBlocks, noiseBlocks);

  shapeMode(CORNER);
  boxShape = createShape(ELLIPSE, 0, 0, tileWidth-spacer, tileHeight-spacer);
  mapFillerShape = createShape(ELLIPSE, 0, 0, tileWidth-spacer, tileHeight-spacer);
  boxShape.setStroke(false);
  mapFillerShape.setStroke(false);
  createMap();
  getNewPiece();
}

void draw()
{
  background(bg);
  //getUserInput();
  update();
  drawForeground();
  drawFallingPiece();

  if (gameOver) {
    gameRestart();
  }

  noStroke();
  fill(bg);
  rect(-1, -1, width+1, 68);
}

void gameRestart() {
  tempVal++;
  drawGameOverScreen();

  if (tempVal==60) {
    resetGameState();
    tempVal = 0;
    gameOver = false;
  }
}

// Main gameplay logic loop - push the current piece down, check inputs and remove full rows if they exist
void update()
{
  if (!gameOver)
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

void checkForRows()
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

void dissolveBlocks()
{
  int dissolveTime = 200;
  if (millis() - blockDissolveTimer > dissolveTime)
  {
    int startHeight = (blocksToRemove.get(blocksToRemove.size() - 1) + 1) / mapWidth;
    ArrayList<Integer> rowsToRemoveHeights = new ArrayList<Integer>();
    for (int i = 0; i < blocksToRemove.size() / bToRemove; i++)
    {
      rowsToRemoveHeights.add((blocksToRemove.get(bToRemove * i) + 1) / mapWidth);
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
      int pieceIndex = rotatef(x, y, rotationState);
      if (tetrominoes[currPieceType].charAt(pieceIndex) == '1')
      {
        int mapIndex = (currPieceY + y) * mapWidth + (currPieceX + x);
        if (mapIndex >= 0)
        {
          map[mapIndex] = currPieceType + 2;
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
  if (blocksThatFit < 0)
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
      int pieceIndex = rotatef(x, y, rotation);
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
int rotatef(int rx, int ry, int rState)
{
  switch(rState)
  {
  case 0:
    return ry * 4 + rx; //change to 2
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
  tetrominoes = new String[0];
  generateBlocks(regBlocks, noiseBlocks);
  createMap();
  getNewPiece();
  gameOver = false;
  secondsSinceStart = 0;
  secondCounter = millis();
  pushDownDelay = 1000;
}
