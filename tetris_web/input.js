function checkInputs() {
    // Check if key is still being held after a set delay
    if (millis() - downPressTime > downHoldDelay) {
        if (s) {
            dy = 1;
        }
        downPressTime = millis();
    }
    if (millis() - strafePressTime > strafeHoldDelay) {
        if (a) {
            dx = -1;
        }

        if (d) {
            dx = 1;
        }
        strafePressTime = millis();
    }

    // Check if we are trying to rotate the piece
    if (dr != 0) {
        var rotateTest = rotationState;
        var maxRotate = 3; // How many states of rotation are allowed for a piece type

        if (rotateTest + dr == -1) {
            rotateTest = 3;
        } else if (rotateTest + dr > maxRotate) {
            rotateTest = 0;
        } else {
            rotateTest += dr;
        }

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
            pushDownTimer = millis();
        } else {
            lockCurrPieceToMap();
        }
    }
    dx = 0;
    dy = 0;
    dr = 0;
}

function keyPressed() {
    if (keyCode == 87) {
        w = true;
    }
    if (keyCode == 65) {
        dx = -1;
        a = true;
        strafePressTime = millis();
    }
    if (keyCode == 83) {
        dy = 1;
        s = true;
        downPressTime = millis();
    }
    if (keyCode == 68) {
        dx = 1;
        d = true;
        strafePressTime = millis();
    }
    if (keyCode == 39) {
        dr = -1;
    }

    if (keyCode == 37) {
        dr = 1;
    }

    if (keyCode == 27) {
        esc = (esc) ? false : true;
    }

    if (keyCode == 32) // Spacebar
    {
        placePieceDownInstantly();
    }
    if (keyCode == 81) // Spacebar
    {
        gameOver = true;
    }
}

function keyReleased() {
    if (keyCode == 87) {
        w = false;
    }
    if (keyCode == 65) {
        a = false;
    }

    if (keyCode == 83) {
        s = false;
    }

    if (keyCode == 68) {
        d = false;
    }
}