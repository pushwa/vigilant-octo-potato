// ---------------------------
// Buttons fade in / Out
// ---------------------------

const black = document.getElementById('black');
const black_opacity = 0.8;

const theZoomOutButton = document.getElementById('zoomOut');
const theZoomOutButton_opacity = 0.8;

const theZoomInButton = document.getElementById('zoomIn');
const theZoomInButton_opacity = 0.8;

const infoBox = document.getElementById('info');
const infoBox_opacity = 0.8;

let detectClick = false;

fadeInOutOnClick1();
fadeInOutOnClick2();

//
//
//

//
//
//

function fadeInOutOnClick1() {
  theZoomOutButton.addEventListener('click', () => {
    infoBox.style.opacity = infoBox_opacity;
    theZoomOutButton.style.opacity = '0';
    black.style.opacity = black_opacity;

    setTimeout(() => {
      theZoomInButton.style.opacity = theZoomInButton_opacity;
    }, 300);
  });

  theZoomInButton.addEventListener('click', () => {
    theZoomInButton.style.opacity = '0';
    black.style.opacity = '0';

    setTimeout(() => {
      theZoomOutButton.style.opacity = theZoomOutButton_opacity;
    }, 1100);

    setTimeout(() => {
      infoBox.style.opacity = '0';
    }, 600);
  });
}

//
//
//

function fadeInOutOnClick2() {
  window.onscroll = () => {
    if (
      document.body.scrollTop > 10 ||
      document.documentElement.scrollTop > 10
    ) {
      if (detectClick === false) {
        theZoomOutButton.style.opacity = '0';
      }
    } else {
      if (detectClick === false) {
        theZoomOutButton.style.opacity = theZoomOutButton_opacity;
      }
    }
  };

  theZoomOutButton.onclick = function () {
    detectClick = true;
  };

  theZoomInButton.onclick = function () {
    detectClick = false;

    window.onscroll = () => {
      if (
        document.body.scrollTop > 10 ||
        document.documentElement.scrollTop > 10
      ) {
        if (detectClick === false) {
          theZoomOutButton.style.opacity = '0';
        }
      } else {
        if (detectClick === false) {
          theZoomOutButton.style.opacity = theZoomOutButton_opacity;
        }
      }
    };
  };

  theZoomOutButton.onclick = function () {
    window.onscroll = () => {
      if (
        document.body.scrollTop > 10 ||
        document.documentElement.scrollTop > 10
      ) {
        if (detectClick === false) {
          infoBox.style.opacity = '0';
          theZoomInButton.style.opacity = '0';
          black.style.opacity = '0';
        }
      } else {
        if (detectClick === false) {
          infoBox.style.opacity = infoBox_opacity;
          theZoomInButton.style.opacity = theZoomInButton_opacity;
          black.style.opacity = black_opacity;
        }
      }
    };
  };
}
