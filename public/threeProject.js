import * as THREE from '../build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './jsm/loaders/RGBELoader.js';

// Main
let scene, camera, renderer;

// Canvas
const canvas = document.getElementById('canvas');

//
init();
animate();

// init
function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(65, 1, 1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true,
    logarithmicDepthBuffer: true,
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

  // ------------------------------------------------------------------

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
      loader.load('glb/scene.glb', function (gltf) {
        //
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);

        model.traverse(function (child) {
          if (child.isMesh) {
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        animate();
      });
    });

  // ------------------------------------------------------------------
}

// Animate
function animate() {
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

  // ---------------

  let t = scrollY / (100 - innerHeight);
  camera.position.y = 1 + 5 * t;
  camera.position.z = 10 + 10 * t;
  camera.rotation.x = 0 + -1 * t;
  camera.rotation.y = 0 + -0.2 * t;
  camera.rotation.z = 0 + -0.1 * t;

  // ---------------

  // Render scene
  renderer.render(scene, camera);
}
