#!/usr/bin/env python
import argparse
import time
import sys
import os
import math

sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))
from rgbmatrix import RGBMatrix, RGBMatrixOptions

# Define values for our matrix
options = RGBMatrixOptions()
options.rows = 32
options.cols = 64
options.hardware_mapping = "adafruit-hat"
options.gpio_slowdown = 2

matrix = RGBMatrix(options = options)

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

def run():
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

    # calculate sin and cos once for each frame
    angle = rotation * deg_to_rad
    sin = math.sin(angle)
    cos = math.cos(angle)

    for x in range(int(min_rotate), int(max_rotate)):
      for y in range(int(min_rotate), int(max_rotate)):
        # Our rotate center is always offset by cent_x
        rot_x, rot_y = rotate(x - cent_x, y - cent_x, sin, cos)

        if x >= min_display and x < max_display and y >= min_display and y < max_display:
          x_col = col_table[x]
          y_col = col_table[y]
          offset_canvas.SetPixel(rot_x + cent_x, rot_y + cent_y, x_col, 255 - y_col, y_col)
        else:
          offset_canvas.SetPixel(rot_x + cent_x, rot_y + cent_y, 0, 0, 0)

    offset_canvas = matrix.SwapOnVSync(offset_canvas)


# Main function
if __name__ == "__main__":
  qunatumTetris = run()
  if (not qunatumTetris.process()):
    qunatumTetris.print_help()
