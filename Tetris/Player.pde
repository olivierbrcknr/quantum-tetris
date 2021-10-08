int currPieceType = 0;
int currPieceX = mapWidth / 2;
int currPieceY = -1;
int rotationState = 0;


// Draw current falling tetronimo
void drawFallingPiece()
{
  pushMatrix();
  translate(resX/2 - ((tileWidth * mapWidth) / 2), 68);
  translate(tileWidth / 2, tileHeight / 2);
  translate(tileWidth * currPieceX, tileHeight * currPieceY);

  for (int y = 0; y < 4; y++)
  {
    for (int x = 0; x < 4; x++)
    {
      if (tetrominoes[currPieceType].charAt(rotatef(x, y, rotationState)) == '1')
      {
        if (noiseChecker(tetrominoes[currPieceType])) {
          boxShape.setFill(blockColour);
        } else {
          boxShape.setFill(noiseBlockColour);
        }
        shape(boxShape);
      }
      translate(tileWidth, 0);
    }
    translate(0, tileHeight);
    translate(-(tileWidth * 4), 0);
  }
  popMatrix();
}

void getNewPiece()
{
  rowChecker++;

  if (rowChecker == numberOfBlocks) {
    addBlocks(250);
  }

  currPieceType = rowChecker;
  rotationState = 0;
  currPieceX = 0;
  currPieceX = (int)map(random(mapWidth), 0, mapWidth, 0, mapWidth-4); //random horizontal distribution
  //currPieceY = -4;//or -4?
  pushDownTimer = millis();


  for (int y = 0; y < 4; y++)
  {
    for (int x = 0; x < 4; x++)
    {
      if (tetrominoes[currPieceType].charAt(rotatef(x, y, rotationState)) == '1') {
        if (y==3) {
          currPieceY = -3;
          println("4");
        }
        if (y==2) {
          currPieceY = -2;
          println("3");
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

boolean noiseChecker(String input) { //true if one of 7, else false
  String var1 = "0000001000100110";
  String var2 = "0000001001100100";
  String var3 = "0000010001000110";
  String var4 = "0010001000100010";
  String var5 = "0010011000100000";
  String var6 = "0100011000100000";
  String var7 = "0000011001100000";

  if (input.equals(var1) || input.equals(var2) || input.equals(var3) || input.equals(var4) || input.equals(var5) || input.equals(var6) || input.equals(var7))
  {
    return true;
  } else {
    return false;
  }
}
