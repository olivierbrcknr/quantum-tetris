
# https://github.com/olivierbrcknr/quantum-tetris

# Setup Raspberry Pi

# Libraries
sudo apt-get install python3-pip
sudo pip install evdev

# curl https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/rgb-matrix.sh >rgb-matrix.sh
# sudo bash rgb-matrix.sh

# Create Directory
mkdir -p quantumTetris
cd quantumTetris

# Python files
curl https://raw.githubusercontent.com/olivierbrcknr/quantum-tetris/main/hardware/quantumTetris.py > quantumTetris.py
curl https://raw.githubusercontent.com/olivierbrcknr/quantum-tetris/main/Tetris/data/TETRIS_blocks.csv > TETRIS_blocks.csv

# Shell files
