let windowTop = 0

document.addEventListener("DOMContentLoaded", () => {

  // start the p5 sketch
  new p5(quantumTetris, 'tetris-game-wrapper')
})


window.addEventListener("scroll", (e) => {
  windowTop = window.pageYOffset
})






