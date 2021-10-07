void generateBlocks(String reg[], String noise[]) {
  int dial = 0;


  for (int i=0; i<numberOfBlocks; i++) {
    float random = random(numberOfBlocks);
    if (random<dial) {
      tetrominoes = append(tetrominoes, noise[i]);
    } else {
      tetrominoes = append(tetrominoes, reg[i]);
    }
    dial++;
  }
}
void createMap() //Create map border
{
  for (int y = 0; y < mapHeight; y++)
  {
    for (int x = 0; x < mapWidth; x++)
    {
      if (x == 0 || x == mapWidth - 1 || y == mapHeight - 1)
      {
        map[y * mapWidth + x] = 1;
        continue;
      }
      map[y * mapWidth + x] = 0;
    }
  }
}

void drawForeground()
{
  pushMatrix();
  translate(resX/2 - ((tileWidth * mapWidth) / 2), 68);
  translate(tileWidth/2, tileHeight/2);
  for (int y = 0; y < mapHeight; y++)
  {
    for (int x = 0; x < mapWidth; x++)
    {
      if (map[y * mapWidth + x] == 0)
      {
        mapFillerShape.setFill(gridColor);
        shape(mapFillerShape);
      } else
      {
        push();
        if (map[y * mapWidth + x] == 1)
        {
          boxShape.setFill(bg);
        } else
        {
          boxShape.setFill(tileColors[y * mapWidth + x]);
        }
        if (blocksToRemove.size() > 0)
        {
          for (int j = 0; j < blocksToRemove.size(); j++)
          {
            if ((y * mapWidth + x) == blocksToRemove.get(j))
            {
              color curTileColor = tileColors[y * mapWidth + x];

              // A formula with random numbers to create the effect when clearing rows
              curTileColor += (cos(curTileColor) * 3.14 * (2.71 - curTileColor) + (curTileColor * 4.66)) * 0.0001;

              boxShape.setFill(curTileColor);
              tileColors[y * mapWidth + x] = curTileColor;
            }
          }
        }
        shape(boxShape);
        pop();
      }
      translate(tileWidth, 0);
    }
    translate(0, tileHeight);
    translate(-(tileWidth * mapWidth), 0);
  }
  popMatrix();
}

void drawGameOverScreen()
{
  pushMatrix();
  translate(resX/2 - ((tileWidth * mapWidth) / 2), 68);
  translate(tileWidth/2, tileHeight/2);
  for (int y = 0; y < mapHeight; y++)
  {
    for (int x = 0; x < mapWidth; x++)
    {
      if (map[y * mapWidth + x] == 0)
      {
        //if (tempVal%10==0) {
        mapFillerShape.setFill(blockColour);
        //} else {
        //mapFillerShape.setFill(gridColor);
        //}
        shape(mapFillerShape);
      }
      translate(tileWidth, 0);
    }
    translate(0, tileHeight);
    translate(-(tileWidth * mapWidth), 0);
  }
  popMatrix();
}
