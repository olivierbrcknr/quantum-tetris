# Tetris Game 

Import the following libraries into Processing for the game to function:

- Game Controller Plus 1.2.2 by Peter Lager 
- Processing JavaFX ( `import processing.javafx.*;` )
 

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
  // saveFrame("game/###.png"); // enable this line to take a screenshot when game ends
}

...
```
### Attribution

Tetris code adapted from https://github.com/techiew/Tetris
Thanks to Javidx9 for his tutorial on Tetris: https://www.youtube.com/watch?v=8OK8_tHeCIA
Thanks to MUO for his tutorial on configuring the controller: https://www.youtube.com/watch?v=MUM8_4mWxng&t=175s
