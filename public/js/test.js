//
function updateCamera() {
  let body = document.querySelector('body');
  camera.position.y = 0 + window.scrollY / 150;
  camera.position.z = 10 + window.scrollY / -150;
}

window.addEventListener('scroll', updateCamera);
