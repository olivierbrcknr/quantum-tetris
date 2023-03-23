let windowTop = 0;

const initSliders = () => {
  const css = getComputedStyle(document.body);
  const root = document.documentElement;

  const setSlideVariables = () => {
    const container = document.querySelector(".sliderContainer");

    if (container) {
      let slideWidth = container.querySelector(".imageContainer").offsetWidth;
      // let slideHeight = container.querySelector('.imageContainer').offsetHeight

      root.style.setProperty("--slide-width", slideWidth + "px");
      // root.style.setProperty('--slide-height', slideHeight + "px")
    }
  };

  setSlideVariables();

  window.addEventListener("resize", setSlideVariables);

  document.querySelectorAll(".sliderContainer").forEach((container) => {
    const btnNext = container.querySelector(".next");
    const btnPrev = container.querySelector(".previous");
    const slideCont = container.querySelector(".slidesContainer");
    const counter = container.querySelector(".slideCounter");

    const allDescs = [];
    container.querySelectorAll(".slideDesc").forEach((el) => allDescs.push(el));

    slideCont.querySelectorAll(".slide").forEach((slide) => {
      const figNum = slide.getAttribute("figNum");
      const imgAlt = slide.querySelector("img")?.getAttribute("alt") || "";

      const imageDesc = document.createElement("div");
      imageDesc.innerText = `Fig. ${figNum}: ${imgAlt}`;
      imageDesc.classList.add("slideImageDesc");
      slide.appendChild(imageDesc);
    });

    let currentSlide = 0;
    let allSlides = slideCont.childElementCount;

    slideCont.style.width = "calc( var(--slide-width) * " + allSlides + " )";

    allDescs[0]?.classList.add("slideActive");

    const updateCounter = () => {
      let printCurr = currentSlide + 1;
      printCurr = printCurr <= 9 ? "0" + printCurr : printCurr;
      let printAll = allSlides <= 9 ? "0" + allSlides : allSlides;

      if (allDescs.length > 1 && currentSlide < allDescs.length) {
        container
          .querySelector(".slideActive")
          ?.classList.remove("slideActive");
        allDescs[currentSlide].classList.toggle("slideActive");
      }

      counter.innerHTML =
        "#" + printCurr + '<span class="maxSlides">/' + printAll + "</span>";
    };

    const moveSlides = () => {
      slideCont.style.marginLeft =
        "calc( var(--slide-width) * -1 * " + currentSlide + " )";
      updateCounter();
    };

    btnNext.addEventListener("click", () => {
      currentSlide++;
      if (currentSlide >= allSlides) {
        currentSlide = 0;
      }
      moveSlides();
    });
    btnPrev.addEventListener("click", () => {
      currentSlide--;
      if (currentSlide < 0) {
        currentSlide = allSlides - 1;
      }
      moveSlides();
    });

    updateCounter();
  });
};

const generateFootNotes = () => {
  let footrNoteNum = 0;

  document.querySelectorAll("section").forEach((s) => {
    const footnotesIndicators = s.querySelectorAll(".footnoteLabel");
    const marginalColumn = s.querySelector(".infoCol");

    const startOfArticle = s.getBoundingClientRect().top;

    let footnotesGenerated = false;

    if (marginalColumn) {
      const footnotes = marginalColumn.querySelectorAll("li");

      let lastBottom = 0;
      footnotesIndicators.forEach((fn, i) => {
        const reference = footnotes[i];

        // generate footnotes
        if (!footnotesGenerated) {
          footrNoteNum++;
          // const dataFor = fn.getAttribute("data-for");

          const fnContent = fn.innerText;
          fn.innerHTML =
            "<a href='#fn:" +
            footrNoteNum +
            "'>" +
            fnContent +
            "</a><sup>" +
            footrNoteNum +
            "</sup>";
          fn.setAttribute("id", "sup:" + footrNoteNum);

          // const reference = marginalColumn.querySelector('#fn\\:'+dataFor)
          reference.setAttribute("id", "fn:" + footrNoteNum);

          const backLink = document.createElement("a");
          backLink.href = "#sup:" + footrNoteNum;
          backLink.innerText = "↥";
          backLink.classList.add("footnoteBacklink");
          reference.appendChild(backLink);

          const noteNum = document.createElement("span");
          noteNum.innerText = footrNoteNum;
          noteNum.classList.add("footnoteNumber");
          reference.prepend(noteNum);

          fn.addEventListener("mouseenter", () => {
            reference.classList.add("isHovering");
          });
          fn.addEventListener("mouseleave", () => {
            reference.classList.remove("isHovering");
          });
        }
      });
    }
    footnotesGenerated = true;
  });

  positionFootnotes();
};

const positionFootnotes = () => {
  document.querySelectorAll("section").forEach((s) => {
    const marginalColumn = s.querySelector(".infoCol");

    if (marginalColumn) {
      let lastBottom = 0;

      const startOfArticle = s.getBoundingClientRect().top;

      const footnotes = marginalColumn.querySelectorAll("li");
      const footnotesIndicators = s.querySelectorAll(".footnoteLabel");

      footnotesIndicators.forEach((fn, i) => {
        const reference = footnotes[i];

        let topOfLink = fn.getBoundingClientRect().top - startOfArticle;
        if (topOfLink <= lastBottom) {
          topOfLink = lastBottom;
        }
        reference.style.top = topOfLink + "px";

        // save last bottom in case of overlap
        lastBottom = topOfLink + reference.getBoundingClientRect().height;
      });
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // start the p5 sketch
  new p5(quantumTetris, "tetris-game-wrapper");

  generateFootNotes();
  initSliders();

  setTimeout(positionFootnotes, 300);

  document.querySelector("#toggleGrid").addEventListener("click", () => {
    document.querySelector("#gridDisplay").classList.toggle("show");
  });
});

window.addEventListener("resize", positionFootnotes);

window.addEventListener("scroll", (e) => {
  windowTop = window.pageYOffset;
});
