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


# remove all 00000000 from the arrays to prevent errors
allShapes = list(filter(('00000000').__ne__, allShapes
	))

# merge into one string
printString = ""

for TETRIS in allShapes :
  printString = printString + TETRIS + '\n'

# save into the actual csv
newCSV = open('TETRIS_blocks.csv','w')
newCSV.write(printString)
newCSV.close()


# merge into one string for JSON
printString_JSON = "["

for TETRIS in allShapes :
  printString_JSON = printString_JSON + '\"' + TETRIS + '\",'

printString_JSON = printString_JSON[:-1] # remove last ,
printString_JSON = printString_JSON + "]"

# save into the actual json
newCSV = open('TETRIS_blocks.json','w')
newCSV.write(printString_JSON)
newCSV.close()