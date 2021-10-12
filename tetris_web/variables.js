// var fix = 1.0158;
var fix = 1;

//Sizing setup
var resX = 400;
var resY = 800;
var mapWidth = resX / 25;
var mapHeight = resY / 25;
var bToRemove = mapWidth - 2;
var tMap = [mapWidth * mapHeight];
var fidelity = 22;
var tileWidth = fidelity;
var tileHeight = fidelity;
var spacer = 3;
var tileColors = [mapWidth * mapHeight];
var numberOfBlocks = 150;

//Data Variables
var csv = [];
var rowChecker = 0;
var colChecker = 0; //tracks current column/run of game
var colNumber = 1; //put number of columns in source .csv file here
var tetrominoes = [];
var myData = [];
var regBlocks = [];
var regBlocksCount = 0;
var noiseBlocks = [];
var noiseBlocksCount = 0;
var secondsSinceStart = 0; // Seconds since pressing spacebar
var secondCounter = 0;
var pushDownTimer = 0;
var pushDownDelay = 800; // Time between automatic pushdown of the falling piece
var gameOver = false;

var w = false,
    a = false,
    s = false,
    d = false,
    esc = false,
    space = false;
var downHoldDelay = 70; // ms between each downwards movement tick while holding the key
var downPressTime = 0;
var strafeHoldDelay = 120;
var strafePressTime = -1;
var dx = 0,
    dy = 0; //Delta x, delta y
var dr = 0; // Delta rotate

var currPieceType = 0;
var currPieceX = mapWidth / 2;
var currPieceY = -1;
var rotationState = 0;


//Colours
var bg;
var blockColour; //Colour of tetris block
var noiseBlockColour; //Colour of 'noisy' tetris block
var gridColor;

var blocksToRemove = [];
var blockDissolveTimer = 0;
var tempVal = 0;