# Tetris Game 

Import the following libraries into Processing for the game to function:

- Game Controller Plus 1.2.2 by Peter Lager 
- Processing JavaFX ( import processing.javafx.*; )



Edit the following variables to change the parameters of the game

```java
...

int resX = 800; // width of game
int resY = 800; // height of game
int fidelity = 22; // size of the blocks
int spacer = 3; // space between the blocks

// Set to true if controller attached, else set to false
boolean controllerActive = true; 

void resetGameState()
{
//saveFrame("game/###.png"); // enable this line to take screenshot when game ends
}

...
```