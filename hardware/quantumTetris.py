#!/usr/bin/env python

import argparse
import time
import sys
import os
import math
import evdev
import threading
import csv
import random

# Matrix Setup
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))
from rgbmatrix import RGBMatrix, RGBMatrixOptions


# Arguments ————————————————————————————————————————————————

parser = argparse.ArgumentParser()
parser.add_argument("--tile-size", action="store", help="The size of a tile. Default: 4", default=4, type=int)
parser.add_argument('--dev', dest='isDev', action='store_true')
parser.set_defaults(isDev=False)


args = parser.parse_args()
IS_DEV = args.isDev
if IS_DEV: print( args )


# Define values for our matrix
options = RGBMatrixOptions()
options.rows = 32
options.cols = 64
options.hardware_mapping = "adafruit-hat"
options.gpio_slowdown = 2

matrix = RGBMatrix(options = options)

# values ———————————————————————————————————————————————————

# Constants
ROWS_NEEDED_TO_INCREASE_GAME_SPEED = 5
TILE_SIZE = args.tile_size
ROWS = int( options.cols / TILE_SIZE )
COLUMNS = int( options.rows / TILE_SIZE )

INITIAL_PUSHDOWN_DELAY = 800
GAME_SPEED_INCREMENT = INITIAL_PUSHDOWN_DELAY / 10
NUMBER_OF_BLOCKS = 150
GAME_OVER_TIMEOUT = 3000

COLOR_BG = [0,0,0]
COLOR_BLOCK = [200,200,200]
COLOR_NOISE_BLOCK = [255,0,0]
COLOR_REMOVE = [0,0,255]

# Variables
tetris_map = []
is_game_over = False
is_pause = False

# Piece Variables
rotationState = 0
currPieceType = 0
currPieceX = COLUMNS / 2
currPieceY = -1

rowChecker = 0
completedRows = 0

tetrominoes = []
regBlocks = []
noiseBlocks = []
blocksToRemove = []

# Timing
pushDownDelay = INITIAL_PUSHDOWN_DELAY
pushDownTimer = 0
blockDissolveTimer = 0
gameOverTime = 0


def mapValues( inputVal, minInput, maxInput, minOutput, maxOutput ):
  return ( inputVal - minInput ) * ( maxOutput - minOutput ) / ( maxInput - minInput ) + minOutput


def resetGameState():

  if IS_DEV: print("reset game state ✏️")

  global completedRows
  global rowChecker
  global is_game_over
  global pushDownDelay
  global INITIAL_PUSHDOWN_DELAY
  global startTime
  global gameOverTime

  completedRows = 0
  rowChecker = 0
  generateBlocks()
  createMap()
  getNewPiece()
  is_game_over = False
  gameOverTime = 0

  pushDownDelay = INITIAL_PUSHDOWN_DELAY
  startTime = int(round(time.time() * 1000))


# Blocks ———————————————————————————————————————————————

# returns false if is noise
def noiseChecker(inputValue):
  validShapes= [
    "0000001000100110",
    "0000001001100100",
    "0000010001000110",
    "0010001000100010",
    "0010011000100000",
    "0100011000100000",
    "0000011001100000"
  ]

  # true if one of 7, else false
  if inputValue in validShapes:
    return True
  else:
    return False


def generateBlocks(addBlocks = False):

  global noiseBlocks
  global regBlocks
  global tetrominoes

  # dial adds more noise blocks later
  dial = 0

  if addBlocks == False:
    # empty array
    tetrominoes.clear()

  for i in range(0,NUMBER_OF_BLOCKS):

    randomVal = int( random.uniform(0, NUMBER_OF_BLOCKS) )
    regRand = int( random.uniform(0, len( regBlocks )-1) )
    noiseRand = int( random.uniform(0, len( noiseBlocks )-1) )

    if randomVal < dial:
      tetrominoes.append(noiseBlocks[noiseRand])
    else:
      tetrominoes.append(regBlocks[regRand])

    dial += 1


def getNewPiece():

  if IS_DEV: print('Get new piece 🧩')

  global rowChecker
  global currPieceType
  global rotationState
  global currPieceX
  global currPieceY
  global pushDownTimer
  global tetrominoes

  rowChecker += 1

  # add more blocks if not enough
  if rowChecker % NUMBER_OF_BLOCKS == 0:
    generateBlocks(addBlocks=True)

  currPieceType = rowChecker;

  # random rotation
  rotationState = int( random.uniform(0,3) )

  # make sure the piece would fit in the x axis
  fitsInX = False

  while fitsInX == False:
    # random horizontal distribution
    currPieceX = int( mapValues( random.uniform(0,COLUMNS), 0, COLUMNS, -2, COLUMNS-2 ) )

    if checkIfPieceFits(currPieceX,-4,rotationState):
      fitsInX = True

  # adjust y position for the piece to appear
  for y in range(0, 4):
    for x in range(0, 4):
      if tetrominoes[currPieceType][ rotatef(x, y, rotationState) ] == "1":
        currPieceY = -1 * y

  pushDownTimer = int(round(time.time() * 1000))

# Tetris ———————————————————————————————————————————————————


def createMap():

  global COLUMNS
  global ROWS
  global tetris_map

  tetris_map.clear()

  for x in range(0, COLUMNS):
    for y in range(0, ROWS):
      tetris_map.append(0)


# Thanks to Javidx9 for this algorithm - https://www.youtube.com/watch?v=8OK8_tHeCIA
def rotatef(rx, ry, rState):

  if rState == 0:
    return int( ry * 4 + rx ) # change to 2
  elif rState == 1:
    return int( 12 + ry - (rx * 4) )
  elif rState == 2:
    return int( 15 - (ry * 4) - rx )
  elif rState == 3:
    return int( 3 - ry + (rx * 4) )
  else:
    return int( 0 )


def moveChecker( dx, dy, dr ):

  global rotationState
  global currPieceX
  global currPieceY

  # Check if we are trying to rotate the piece
  if dr != 0:
    rotateTest = rotationState
    maxRotate = 3; # How many states of rotation are allowed for a piece type

    if rotateTest + dr == -1:
      rotateTest = 3
    elif rotateTest + dr > maxRotate:
      rotateTest = 0
    else:
      rotateTest += dr

    if checkIfPieceFits(currPieceX, currPieceY, rotateTest):
      rotationState = rotateTest
    elif checkIfPieceFits(currPieceX + 1, currPieceY, rotateTest):
      rotationState = rotateTest
      dx = 1
    elif checkIfPieceFits(currPieceX - 1, currPieceY, rotateTest):
      rotationState = rotateTest
      dx = -1
    elif checkIfPieceFits(currPieceX + 2, currPieceY, rotateTest):
      rotationState = rotateTest
      dx = 2
    elif checkIfPieceFits(currPieceX - 2, currPieceY, rotateTest):
      rotationState = rotateTest
      dx = -2

  # Check if we are trying to move the piece horizontally
  if dx != 0:
    if checkIfPieceFits(currPieceX + dx, currPieceY, rotationState):
      currPieceX += dx

  # Check if we are trying to move the piece vertically
  if dy != 0:
    if checkIfPieceFits(currPieceX, currPieceY + dy, rotationState):
      currPieceY += dy
    else:
      lockCurrPieceToMap()


def checkForRows():

  global COLUMNS
  global ROWS
  global tetris_map
  global blocksToRemove
  global blockDissolveTimer

  for y in range( 0, ROWS ):
    piecesInRow = 0
    for x in range( 0, COLUMNS ):
      if tetris_map[ int( y * COLUMNS + x ) ] != 0:
        piecesInRow += 1
    if piecesInRow == COLUMNS:
      for i in range( 0, COLUMNS ):
        blocksToRemove.append( int( y * COLUMNS + i ) )
        blockDissolveTimer = int(round(time.time() * 1000))


# Locks the current piece as part of the map and checks the game over condition
def lockCurrPieceToMap():

  if IS_DEV: print("Lock piece to map 🔒")

  global currPieceY
  global currPieceX
  global currPieceType
  global tetrominoes
  global COLUMNS
  global is_game_over

  blocksThatFit = 0

  for y in range(0, 4):
    for x in range(0, 4):
      pieceIndex = rotatef(x, y, rotationState)
      if tetrominoes[currPieceType][pieceIndex] == "1":
        mapIndex = int( (currPieceY + y) * COLUMNS + (currPieceX + x) )

        if mapIndex >= 0:
          tetris_map[mapIndex] = currPieceType + 2
          if noiseChecker(tetrominoes[currPieceType]):
            tetris_map[mapIndex] = 1
          else:
            tetris_map[mapIndex] = 2

          blocksThatFit = currPieceY;

  if blocksThatFit <= 0:
    is_game_over = True
  if is_game_over == False:
    checkForRows()
    getNewPiece()


# Check if the piece fits in the position it's trying to move leto
def checkIfPieceFits(movingToX, movingToY, rotation):

  global tetrominoes
  global currPieceType
  global pieceIndex
  global tetris_map

  for y in range(0, 4):
    for x in range(0, 4):
      pieceIndex = rotatef(x, y, rotation);
      mapIndex = int( (movingToY + y) * COLUMNS + (movingToX + x) )

      if tetrominoes[currPieceType][pieceIndex] == '1':
        if mapIndex >= len(tetris_map):
          print("1")
          return False

        if movingToX + x < 0 or movingToX + x > COLUMNS - 1 :
          print("2")
          return False

        if movingToX + x >= 0 and movingToX + x < COLUMNS:
          if movingToY + y >= 0 and movingToY + y <= ROWS:
            if tetris_map[mapIndex] != 0 and mapIndex > COLUMNS:
              print("3")
              return False;

          elif movingToY + y > ROWS:
            print("4")
            return False

  return True


# Instantly place the current piece at the lowest polet directly below it
def placePieceDownInstantly():

  global currPieceX
  global currPieceY
  global rotationState

  lastFitY = 0
  foundPosition = False
  y = 0

  while foundPosition == False:
    if checkIfPieceFits(currPieceX, currPieceY + y, rotationState):
      lastFitY = currPieceY + y
    else:
      foundPosition = True
      currPieceY = lastFitY
      lockCurrPieceToMap()
    y += 1


def updateGameSpeed():

  global pushDownDelay
  global completedRows
  global ROWS_NEEDED_TO_INCREASE_GAME_SPEED
  global GAME_SPEED_INCREMENT

  if pushDownDelay>100 and completedRows % ROWS_NEEDED_TO_INCREASE_GAME_SPEED == 0:
      pushDownDelay -= GAME_SPEED_INCREMENT
      if IS_DEV: print('increased game speed 🏃',pushDownDelay)


def dissolveBlocks():

  global blockDissolveTimer
  global blocksToRemove
  global COLUMNS
  global ROWS
  global completedRows
  global tetris_map

  currentTime = int(round(time.time() * 1000))

  dissolveTime = 200
  if currentTime - blockDissolveTimer > dissolveTime :

    # get rows that need to be removed
    startHeight = int( ( blocksToRemove[ len( blocksToRemove ) - 1 ] + 1 ) / COLUMNS )
    numberOfRows = int( len( blocksToRemove ) / COLUMNS )

    completedRows += numberOfRows

    # remove lines
    for i in range( 0, len(blocksToRemove) ):
      tetris_map[ blocksToRemove[i] ] = 0

    # push rows down
    for i in range( 0, numberOfRows ):
      for r in range( 0, startHeight ):

        rowIndex = startHeight - r

        # push each row from bottom
        for x in range( 0, COLUMNS ):
          tetris_map[ int( (rowIndex-1) * COLUMNS + x) ] = tetris_map[ int( (rowIndex-2) * COLUMNS + x ) ]
          tetris_map[ int( (rowIndex-2) * COLUMNS + x) ] = 0;

    blocksToRemove.clear()
    updateGameSpeed()

    print( tetris_map , len(tetris_map) )



 # // replace undefined with 0
 #  const fixMap = () => {
 #    map = map.map( el => {
 #      if ( el === undefined ){
 #        return 0
 #      }else{
 #        return el
 #      }
 #    } )
 #  }

def run_quantumTetris():

  global is_game_over
  global is_pause
  global blocksToRemove
  global pushDownTimer
  global pushDownDelay
  global currPieceX
  global currPieceY
  global rotationState
  global tetris_map
  global gameOverTime
  global GAME_OVER_TIMEOUT

  global COLOR_BG
  global COLOR_BLOCK
  global COLOR_NOISE_BLOCK
  global COLOR_REMOVE

  offset_canvas = matrix.CreateFrameCanvas()
  startTime = int(round(time.time() * 1000))

  while True:

    currentTime = int(round(time.time() * 1000))
    deltaTime = currentTime - startTime

    # make step (update())
    if deltaTime >= pushDownDelay and is_pause == False:
      startTime = currentTime

      # print( tetris_map )

      if is_game_over == False:

        # Remove rows of blocks if there are any to be removed
        if len( blocksToRemove ) > 0:
          dissolveBlocks()
          pushDownTimer = currentTime

        # If the falling piece wasn't manually pushed down by the player, push it down automatically after a delay
        # pushDownTimer is manipulated to control when or if the piece should be pushed down automatically
        if currentTime - pushDownTimer > pushDownDelay:
          if checkIfPieceFits(currPieceX, currPieceY + 1, rotationState):
            currPieceY += 1
          else:
            lockCurrPieceToMap()
          pushDownTimer = currentTime


      # Game Over
      else:
        if IS_DEV: print("Game Over ☠️")

        # run game Over
        if gameOverTime != 0:
          if currentTime - gameOverTime >= GAME_OVER_TIMEOUT:
            resetGameState()

        # set game over time
        else:
          gameOverTime = currentTime



    # draw matrix
    for x in range(0, COLUMNS):
      for y in range(0, ROWS):

        mapIndex = int( x + y * COLUMNS )

        for tx in range(0, TILE_SIZE):
          for ty in range(0, TILE_SIZE):

            draw_x = x * TILE_SIZE + tx
            draw_y = y * TILE_SIZE + ty


            # draw everything else white if game is over
            if is_game_over:
              offset_canvas.SetPixel(draw_y, draw_x, COLOR_BLOCK[0],COLOR_BLOCK[1],COLOR_BLOCK[2])
            else:
              # make everyting black
              offset_canvas.SetPixel(draw_y, draw_x, COLOR_BG[0],COLOR_BG[1],COLOR_BG[2])

            isCurrentBlockPixel = False

            deltaY = y-currPieceY
            deltaX = x-currPieceX

            # draw current Piece
            if 0 <= deltaY < 4 and 0 <= deltaX < 4:

              # print( tetrominoes[currPieceType], rotatef((x-currPieceX), (y-currPieceY), rotationState) )

              if tetrominoes[currPieceType][rotatef(deltaX, deltaY, rotationState)] == "1":
                isCurrentBlockPixel = True

            if isCurrentBlockPixel:
              if noiseChecker(tetrominoes[currPieceType]):
                offset_canvas.SetPixel(draw_y, draw_x, COLOR_BLOCK[0], COLOR_BLOCK[1], COLOR_BLOCK[2])
              else:
                offset_canvas.SetPixel(draw_y, draw_x, COLOR_NOISE_BLOCK[0],COLOR_NOISE_BLOCK[1],COLOR_NOISE_BLOCK[2])

            else:

              # draw foreground
              if len( blocksToRemove ) > 0 and mapIndex in blocksToRemove:
                offset_canvas.SetPixel(draw_y, draw_x, COLOR_REMOVE[0],COLOR_REMOVE[1],COLOR_REMOVE[2])
              else:
                # draw pixel white if is block
                if tetris_map[mapIndex] == 1:
                  offset_canvas.SetPixel(draw_y, draw_x, COLOR_BLOCK[0], COLOR_BLOCK[1], COLOR_BLOCK[2])

                # draw pixel red if is noise block
                elif tetris_map[mapIndex] == 2:
                  offset_canvas.SetPixel(draw_y, draw_x, COLOR_NOISE_BLOCK[0],COLOR_NOISE_BLOCK[1],COLOR_NOISE_BLOCK[2])

        # do nothing / black

    # display one pixel in blue to indicate pause
    if is_pause:
      offset_canvas.SetPixel(0, 0, COLOR_REMOVE[0],COLOR_REMOVE[1],COLOR_REMOVE[2])

    offset_canvas = matrix.SwapOnVSync(offset_canvas)


# Controller ———————————————————————————————————————————————

# Buttons
aBtn = 289
bBtn = 290

up = 0
down = 255
left = 0
right = 255

startBtn = 297
selectBtn = 296

def controllerRead():

  # Gamepad Setup
  gamepad = evdev.InputDevice('/dev/input/event0')

  def buttonPressed( keyCode ):

    global is_pause
    global is_game_over

    # only allow button reads if game is running
    if is_game_over == False:

      if keyCode == aBtn and is_pause == False:
        if IS_DEV: print('🎮 A')
        moveChecker( 0, 0, 1 )

      if keyCode == bBtn and is_pause == False:
        if IS_DEV: print('🎮 B')
        moveChecker( 0, 0, -1 )

      if keyCode == startBtn and is_pause == False:
        if IS_DEV: print('🎮 Start')
        placePieceDownInstantly()

      if keyCode == selectBtn:
        if IS_DEV: print('🎮 Select')
        is_pause = not is_pause

  def dPadPressed( direction ):

    global is_pause
    global is_game_over

    # only allow button reads if game is running
    if is_game_over == False and is_pause == False:

      if IS_DEV: print("🎮",direction)
      if direction == "up":
        moveChecker( 0, 0, 1 )
      elif direction == "down":
        moveChecker( 0, 1, 0 )
      elif direction == "right":
        moveChecker( -1, 0, 0 )
      elif direction == "left":
        moveChecker( 1, 0, 0 )

  #evdev takes care of polling the controller in a loop
  for event in gamepad.read_loop():

    keyevent = evdev.util.categorize(event)

    if event.type == evdev.ecodes.EV_KEY and event.value == 1:
      buttonPressed( event.code )

    if event.type == evdev.ecodes.EV_ABS:
      if event.code == evdev.ecodes.ABS_X:
        if event.value == 0:
          dPadPressed( "left" )
        elif event.value == 255:
          dPadPressed( "right" )
      else:
        if event.value == 0:
          dPadPressed( "up" )
        elif event.value == 255:
          dPadPressed( "down" )



# Run ——————————————————————————————————————————————————————

print( "Quantum Tetris is starting 🚀")

# generate blocks
with open('/home/pi/quantumTetris/TETRIS_blocks.csv', newline='') as f:
  reader = csv.reader(f)
  for row in reader:
    blockString = row[0]

    sub1 = blockString[0:2]
    sub2 = blockString[2:4]
    sub3 = blockString[4:6]
    sub4 = blockString[6:8]
    one = "0";
    two = "00";
    StringsToJoin = [one, sub1, two, sub2, two, sub3, two, sub4, one]
    sixteenBit = ''.join(StringsToJoin)

    if noiseChecker(sixteenBit):
      regBlocks.append(sixteenBit);
    else:
      noiseBlocks.append(sixteenBit);

generateBlocks()
createMap()
getNewPiece()

# Set up threads to run both loops in parallel
thread1 = threading.Thread(target=controllerRead)
thread2 = threading.Thread(target=run_quantumTetris)

# Main function
if __name__ == "__main__":
  try:
    thread1.start()
    thread2.start()
  except (KeyboardInterrupt, SystemExit):
    print("Exiting Quantum Tetris\n")
    cleanup_stop_thread()
    sys.exit(0)

