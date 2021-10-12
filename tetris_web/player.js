// Draw current falling tetronimo
function drawFallingPiece() {
    let tempVar;
    push();
    translate(resX / 2 - ((tileWidth * mapWidth) / 2), 68);
    translate(tileWidth / 2, tileHeight / 2);
    translate(tileWidth * currPieceX, tileHeight * currPieceY);

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (tetrominoes[currPieceType].charAt(rotatef(x, y, rotationState)) == '1') {
                if (noiseChecker(tetrominoes[currPieceType])) {
                    tempVar = blockColour;
                } else {
                    tempVar = noiseBlockColour;
                }
                boxShape(tempVar);
            }
            translate(tileWidth, 0);
        }
        translate(0, tileHeight);
        translate(-(tileWidth * 4), 0);
    }
    pop();
}

function getNewPiece() {
    rowChecker++;
    if (rowChecker == numberOfBlocks) {
        addBlocks(250);
    }
    currPieceType = rowChecker;
    rotationState = 0;
    currPieceX = 0;
    currPieceX = floor(map(random(mapWidth), 0, mapWidth, 0, mapWidth - 4)); //random horizontal distribution
    pushDownTimer = millis();

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (
                tetrominoes[currPieceType].charAt(rotatef(x, y, rotationState)) == "1"
            ) {
                if (y == 3) {
                    currPieceY = -3;
                }
                if (y == 2) {
                    currPieceY = -2;
                }
                if (y == 1) {
                    currPieceY = -1;
                }
                if (y == 0) {
                    currPieceY = 0;
                }
            }
        }
    }
}

function noiseChecker(wInput) {
    //true if one of 7, else false
    var var1 = "0000001000100110";
    var var2 = "0000001001100100";
    var var3 = "0000010001000110";
    var var4 = "0010001000100010";
    var var5 = "0010011000100000";
    var var6 = "0100011000100000";
    var var7 = "0000011001100000";

    if (
        wInput.match(var1) ||
        wInput.match(var2) ||
        wInput.match(var3) ||
        wInput.match(var4) ||
        wInput.match(var5) ||
        wInput.match(var6) ||
        wInput.match(var7)
    ) {
        return true;
    } else {
        return false;
    }
}