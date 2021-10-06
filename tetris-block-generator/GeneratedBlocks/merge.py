import random

# variable to store all shapes in
allShapes = []

shapeNames = ['L','Long','RevL','S','Square','T','Z']
bad_chars = ["'", ' ', '[', "]"]

for shape in shapeNames :

	fileName = 'Shape_'+shape+'.txt'
	file = open(fileName,'r')
	content = file.read()

	# replace the characters that we do not need
	for i in bad_chars :
		content = content.replace(i, '')

	allShapes = allShapes + content.split(",")
	file.close()

# shuffle the whole set to make it 'randomized'
random.shuffle(allShapes)

# merge into one string
printString = ""

for TETRIS in allShapes :
  printString = printString + TETRIS + '\n'

# save into the actual csv
newCSV = open('TETRIS_blocks.csv','w')
newCSV.write(printString)
newCSV.close()