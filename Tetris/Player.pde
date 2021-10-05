int currPieceType = 0;
int currPieceX = mapWidth / 2;
int currPieceY = -1;
int rotationState = 0;


// Draw current falling tetronimo
void drawFallingPiece()
{
  if (initialPause) return;

  pushMatrix();
  translate(resX/2 - ((tileWidth * mapWidth) / 2), 68);
  translate(tileWidth / 2, tileHeight / 2);
  translate(tileWidth * currPieceX, tileHeight * currPieceY);

  for (int y = 0; y < 4; y++)
  {
    for (int x = 0; x < 4; x++)
    {
      if (tetrominoes[currPieceType].charAt(rotate(x, y, rotationState)) == '1')
      {
        boxShape.setFill(blockColour);
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
  currPieceType = int(random(0, 6));
  rotationState = 0;
  currPieceX = 0;
  currPieceX = (int)map(random(mapWidth), 0, mapWidth, 0, mapWidth-4);
  //currPieceX = mapWidth / 2 - 2;

  if (currPieceType == 0 || currPieceType == 5 || currPieceType == 6)
  {
    // Makes it a little bit more fair for long pieces that would usually spawn in contact with the top of the playfield
    currPieceY = -5;
  } else
  {
    currPieceY = -4;
  }
  pushDownTimer = millis();
}
