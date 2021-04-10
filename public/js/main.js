// ---------------------------
// Buttons fade in / Out
// ---------------------------

const theZoomOut = document.getElementById('zoomOut');
const theZoomIn = document.getElementById('zoomIn');
const infoBox = document.getElementById('info');

fadeInOutOnClick();

function fadeInOutOnClick() {
  theZoomOut.addEventListener('click', () => {
    infoBox.style.opacity = 1;
    theZoomOut.style.opacity = 0;

    setTimeout(() => {
      theZoomIn.style.opacity = 1;
    }, 300);
  });

  theZoomIn.addEventListener('click', () => {
    theZoomIn.style.opacity = 0;

    setTimeout(() => {
      theZoomOut.style.opacity = 1;
    }, 1100);

    setTimeout(() => {
      infoBox.style.opacity = 0;
    }, 600);
  });
}
