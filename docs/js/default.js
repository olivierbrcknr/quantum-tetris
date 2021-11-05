let windowTop = 0

const initSliders = () => {

  const css = getComputedStyle(document.body)
  const root = document.documentElement

  const setSlideVariables = () => {

    const container = document.querySelector('.sliderContainer')

    let slideWidth  = container.querySelector('.imageContainer').offsetWidth
    // let slideHeight = container.querySelector('.imageContainer').offsetHeight

    root.style.setProperty('--slide-width', slideWidth + "px")
    // root.style.setProperty('--slide-height', slideHeight + "px")
  }

  setSlideVariables()

  window.addEventListener('resize',setSlideVariables)

  document.querySelectorAll('.sliderContainer').forEach((container)=>{

    const btnNext = container.querySelector('.next')
    const btnPrev = container.querySelector('.previous')
    const slideCont = container.querySelector('.slidesContainer')
    const counter = container.querySelector('.counter')

    let currentSlide = 0
    let allSlides = slideCont.childElementCount

    slideCont.style.width = "calc( var(--slide-width) * "+allSlides+" )"

    const updateCounter = () => {

      let printCurr = currentSlide+1
          printCurr = printCurr <= 9 ? '0'+printCurr : printCurr
      let printAll  = allSlides <= 9 ? '0'+allSlides : allSlides

      counter.innerHTML = '#' + printCurr + '<span class="maxSlides">/'+printAll+'</span>'
    }

    const moveSlides = () => {
      slideCont.style.marginLeft = "calc( var(--slide-width) * -1 * "+currentSlide+" )"
      updateCounter()
    }

    btnNext.addEventListener('click',()=>{
      currentSlide++
      if( currentSlide >= allSlides ){
        currentSlide = 0
      }
      moveSlides()
    })
    btnPrev.addEventListener('click',()=>{
      currentSlide--
      if( currentSlide < 0 ){
        currentSlide = allSlides-1
      }
      moveSlides()
    })

    updateCounter()

  })

}

document.addEventListener("DOMContentLoaded", () => {

  // start the p5 sketch
  new p5(quantumTetris, 'tetris-game-wrapper')

  initSliders()

  document.querySelector('#toggleGrid').addEventListener('click',()=>{
    document.querySelector('#gridDisplay').classList.toggle('show')
  })

})


window.addEventListener("scroll", (e) => {
  windowTop = window.pageYOffset
})






