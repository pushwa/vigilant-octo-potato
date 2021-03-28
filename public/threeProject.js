import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './jsm/loaders/RGBELoader.js';

//
let scene, camera, renderer;
let controls;

// Canvas
const canvas = document.getElementById('canvas');

// Orbit controls
function orbitControls() {
  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  //controls.minDistance = 0.5;
  //controls.maxDistance = 0.6;
  controls.target.set(0, 0, 0);
  controls.autoRotate = false; // Set "true" for auto rotate
  controls.autoRotateSpeed = 0.5;
  controls.enableDamping = true; // If enabled, use the controls.update() function inside the animate function
  controls.dampingFactor = 0.03;
  controls.enablePan = false;
  controls.enableZoom = false;

  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
  };
}

// init
function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(65, 1, 1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(0, -1, 8);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true,
  });

  // Canvas background color
  renderer.setClearColor(0x000000, 0);

  // Tone mapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Light settings
  renderer.physicallyCorrectLights = true;

  // Shadow settings
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---------------

  // HDR Image / gltf model
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath('hdr/')
    .load('sunflowers_1k.hdr', function (texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;

      // Show/hide hdri image
      //scene.background = envMap;
      scene.environment = envMap;

      texture.dispose();
      pmremGenerator.dispose();

      animate();

      // GLB Model
      const loader = new GLTFLoader();
      loader.load('gltf/hop.glb', function (gltf) {
        gltf.scene.traverse(function (child) {
          if (child.isMesh) {
            child.position.set(0, 1, 0);
          }
        });

        scene.add(gltf.scene);
        animate();
      });
    });

  // ---------------

  // Invoke orbit controls
  orbitControls();
}

// Animate
function animate() {
  //
  // Resize
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    console.log(width + ' PX');

    // set render target sizes here
  }

  // Animation timeline
  requestAnimationFrame(animate);

  // Orbit Controls (When damping is on)
  controls.update();

  // ---------------

  // ---------------

  // Render scene
  renderer.render(scene, camera);
}

// Invoke
init();
animate();
