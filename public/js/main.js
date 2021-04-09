//
//
const body = document.querySelector('body');
const zoomOutButton = document.getElementById('zoomOut');
const zoomInButton = document.getElementById('zoomIn');

let clicked = 0;

zoomOutButton.addEventListener('click', () => {
  zoomInButton.style.opacity = 0.5;
  zoomOutButton.style.opacity = 0;

  clicked++;

  window.onscroll = () => {
    if (clicked < 1) {
      if (document.documentElement.scrollTop > 10) {
        zoomOutButton.style.opacity = 0;
      } else {
        zoomOutButton.style.opacity = 0.5;
      }
    }
  };
});

zoomInButton.addEventListener('click', () => {
  zoomInButton.style.opacity = 0;
  zoomOutButton.style.opacity = 0.5;
});

window.onscroll = () => {
  if (clicked < 1 || clicked >= 1) {
    if (document.documentElement.scrollTop > 10) {
      zoomOutButton.style.opacity = 0;
    } else {
      zoomOutButton.style.opacity = 0.5;
    }
  }
};
