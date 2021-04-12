// ---------------------------
// Buttons fade in / Out
// ---------------------------

const black = document.getElementById('black');

const theZoomOutButton = document.getElementById('zoomOut');
const theZoomInButton = document.getElementById('zoomIn');
const infoBox = document.getElementById('info');

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
    infoBox.style.opacity = '0.8';
    theZoomOutButton.style.opacity = '0';
    black.style.opacity = '0.8';

    setTimeout(() => {
      theZoomInButton.style.opacity = '0.8';
    }, 300);
  });

  theZoomInButton.addEventListener('click', () => {
    theZoomInButton.style.opacity = '0';
    black.style.opacity = '0';

    setTimeout(() => {
      theZoomOutButton.style.opacity = '0.8';
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
        theZoomOutButton.style.opacity = '0.8';
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
          theZoomOutButton.style.opacity = '0.8';
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
          infoBox.style.opacity = '0.8';
          theZoomInButton.style.opacity = '0.8';
          black.style.opacity = '0.8';
        }
      }
    };
  };
}
