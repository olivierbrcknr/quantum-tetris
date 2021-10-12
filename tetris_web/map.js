function generateBlocks(reg, noise) {
    let dial = 0;
    for (var i = 0; i < numberOfBlocks; i++) {
        let randomNum = floor(random(numberOfBlocks));
        let regRand = floor(random(reg.length - 1));
        let noiseRand = floor(random(noise.length - 1));
        if (randomNum < dial) {
            tetrominoes = append(tetrominoes, noise[noiseRand]);
        } else {
            tetrominoes = append(tetrominoes, reg[regRand]);
        }
        dial++;
    }
}

function addBlocks(add) {
    for (let i = 0; i < add; i++) {
        let randomNum = floor(random(numberOfBlocks));
        tetrominoes = append(tetrominoes, noiseBlocks[randomNum]);
    }
}

function createMap() {
    //Create map border
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (x == 0 || x == mapWidth - 1 || y == mapHeight - 1) {
                tMap[y * mapWidth + x] = 1;
                continue;
            }
            tMap[y * mapWidth + x] = 0;
        }
    }
}

function drawForeground() {
    let tempVar;
    push();
    translate(resX / 2 - ((tileWidth * mapWidth) / 2), 68);
    translate(tileWidth / 2, tileHeight / 2);
    // translate(tileWidth * currPieceX, tileHeight * currPieceY);

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (tMap[y * mapWidth + x] == 0) {
                mapFillerShape(gridColor);
            } else {
                push();
                if (tMap[y * mapWidth + x] == 1) {
                    tempVar = bg;
                } else {
                    tempVar = tileColors[y * mapWidth + x];
                }
                if (blocksToRemove.length > 0) {
                    for (let j = 0; j < blocksToRemove.length; j++) {
                        if ((y * mapWidth + x) == blocksToRemove[j]) {
                            let curTileColor = tileColors[y * mapWidth + x];

                            // A formula with random numbers to create the effect when clearing rows
                            curTileColor += (cos(curTileColor) * 3.14 * (2.71 - curTileColor) + (curTileColor * 4.66)) * 0.0001;

                            boxShape(curTileColor);
                            tileColors[y * mapWidth + x] = curTileColor;
                        }
                    }
                }
                boxShape(tempVar);
                pop();
            }
            translate(tileWidth, 0);
        }
        translate(0, tileHeight);
        // translate(-(tileWidth * mapWidth), 0);
        translate(-(tileWidth*fix * mapWidth), 0);
    }
    pop();
}

function drawGameOverScreen() {
    push();
    translate(resX / 2 - ((tileWidth * mapWidth) / 2), 68);
    translate(tileWidth / 2, tileHeight / 2);
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (tMap[y * mapWidth + x] == 0) {
                mapFillerShape(blockColour);
                // shape(mapFillerShape);
            }
            translate(tileWidth, 0);
        }
        translate(0, tileHeight);
        // translate(-(tileWidth * mapWidth), 0);
        translate(-(tileWidth*fix * mapWidth), 0);
    }
    pop();
}