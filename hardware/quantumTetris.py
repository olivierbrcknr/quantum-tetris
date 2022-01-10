#!/usr/bin/env python
import argparse
import time
import sys
import os
import math
import evdev
import threading
from pprint import pprint

# Matrix Setup
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))
from rgbmatrix import RGBMatrix, RGBMatrixOptions

# Define values for our matrix
options = RGBMatrixOptions()
options.rows = 32
options.cols = 64
options.hardware_mapping = "adafruit-hat"
options.gpio_slowdown = 2

matrix = RGBMatrix(options = options)

# Buttons
aBtn = 289
bBtn = 290

up = 0
down = 255
left = 0
right = 255

startBtn = 297
selectBtn = 296


# values
shiftX = 0




def controllerRead():

  # Gamepad Setup
  gamepad = evdev.InputDevice('/dev/input/event0')

  def buttonPressed( keyCode ):

    global shiftX

    if keyCode == aBtn:
      print('A')
      shiftX += 1

    if keyCode == bBtn:
      print('B')
      shiftX -= 1

    if keyCode == startBtn:
      print('Start')

    if keyCode == selectBtn:
      print('Select')

  def dPadPressed( direction ):
    # print(direction)
    if direction == "up":
      print(direction)
    elif direction == "down":
      print(direction)
    elif direction == "right":
      print(direction)
    elif direction == "left":
      print(direction)

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


"""
def run():
  print("Running")
  offset_canvas = matrix.CreateFrameCanvas()

  print(offset_canvas.height)
  print(offset_canvas.width)

  while True:
    for x in range(0, matrix.width):
      offset_canvas.SetPixel(x*2, x, 255, 255, 255)
      offset_canvas.SetPixel(offset_canvas.height - 1 - x*2, x, 255, 0, 255)

    for x in range(0, offset_canvas.width):
      offset_canvas.SetPixel(x, 0, 255, 0, 0)
      offset_canvas.SetPixel(x, offset_canvas.height - 1, 255, 255, 0)

    for y in range(0, offset_canvas.height):
      offset_canvas.SetPixel(0, y, 0, 0, 255)
      offset_canvas.SetPixel(offset_canvas.width - 1, y, 0, 255, 0)

    offset_canvas = matrix.SwapOnVSync(offset_canvas)

try:
  # Start loop
  print("Press CTRL-C to stop sample")
  run()
except KeyboardInterrupt:
  print("Exiting\n")
  sys.exit(0)
"""



def scale_col(val, lo, hi):
  if val < lo:
    return 0
  if val > hi:
    return 255
  return 255 * (val - lo) / (hi - lo)


def rotate(x, y, sin, cos):
    return x * cos - y * sin, x * sin + y * cos

def run_quantumTetris():

  global shiftX

  cent_x = matrix.width / 2
  cent_y = matrix.height / 2

  rotate_square = min(matrix.width, matrix.height) * 1.41
  min_rotate = cent_x - rotate_square / 2
  max_rotate = cent_x + rotate_square / 2

  display_square = min(matrix.width, matrix.height) * 0.7
  min_display = cent_x - display_square / 2
  max_display = cent_x + display_square / 2

  deg_to_rad = 2 * 3.14159265 / 360
  rotation = 0

  # Pre calculate colors
  col_table = []
  for x in range(int(min_rotate), int(max_rotate)):
      col_table.insert(x, scale_col(x, min_display, max_display))

  offset_canvas = matrix.CreateFrameCanvas()

  while True:
    rotation += 1
    rotation %= 360

    display_cent_x = cent_x + shiftX

    # calculate sin and cos once for each frame
    angle = rotation * deg_to_rad
    sin = math.sin(angle)
    cos = math.cos(angle)

    for x in range(int(min_rotate), int(max_rotate)):
      for y in range(int(min_rotate), int(max_rotate)):
        # Our rotate center is always offset by cent_x
        rot_x, rot_y = rotate(x - display_cent_x, y - display_cent_x, sin, cos)

        if x >= min_display and x < max_display and y >= min_display and y < max_display:
          x_col = col_table[x]
          y_col = col_table[y]
          offset_canvas.SetPixel(rot_x + display_cent_x, rot_y + cent_y, x_col, 255 - y_col, y_col)
        else:
          offset_canvas.SetPixel(rot_x + display_cent_x, rot_y + cent_y, 0, 0, 0)

    offset_canvas = matrix.SwapOnVSync(offset_canvas)


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

