import * as THREE from '../build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './jsm/loaders/RGBELoader.js';

// Main
let scene, camera, renderer;

// Canvas
const canvas = document.getElementById('canvas');

// Glb Object
const glbObject = [];

// Load textures
const textureLoader = new THREE.TextureLoader();

// Material
function glbMaterial() {
  const diffuse = textureLoader.load('./glb/blue_baseColor.png');
  diffuse.encoding = THREE.sRGBEncoding;
  diffuse.flipY = false;

  const normalMap = textureLoader.load('./glb/blue_normal.png');
  diffuse.flipY = false;

  const occRoughMet = textureLoader.load(
    './glb/blue_occlusionRoughnessMetallic.png'
  );
  occRoughMet.flipY = false;

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: diffuse,
    normalMap: normalMap,
    aoMap: occRoughMet,
    roughnessMap: occRoughMet,
    roughness: 1, // do not adjust
    metalnessMap: occRoughMet,
    metalness: 1, // do not adjust
    envMapIntensity: 1.5, // Default value
  });

  return mat;
}

// init
function init() {
  //
  // Scene
  scene = new THREE.Scene();

  // Fog
  scene.fog = new THREE.Fog(0x1d1a1a, 0.5, 12, 4000);

  // Camera
  camera = new THREE.PerspectiveCamera(65, 1, 1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(0, 0, 10);

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

  // -----------------------------------------------

  // HDR Image / Glb model
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
      loader.load(
        'glb/test.glb',
        function (glb) {
          //
          const model = glb.scene.children[0];

          model.getObjectByName('test').material = glbMaterial();

          // Push glb model to array
          glbObject.push(model.getObjectByName('test'));

          // Position
          model.position.set(0, 0, 0);

          // Rotate
          model.rotation.set(0, 0, 0);

          // Scale
          model.scale.set(1, 1, 1);

          // Add glb object to scene
          scene.add(model);

          animate();
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    });

  // -----------------------------------------------
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

  // Scroll event
  let t = scrollY / (100 - innerHeight);
  camera.position.y = 1 + 5 * t;
  camera.position.z = 10 + 12 * t;
  camera.rotation.x = 0 + -1 * t;
  camera.rotation.y = 0 + -0.2 * t;
  camera.rotation.z = 0 + -0.1 * t;

  for (let i = 0; i < glbObject.length; i++) {
    glbObject[i].rotation.z = 0 + -3 * t;
  }

  // Object animation
  const time = -performance.now() / 1000;

  for (let i = 0; i < glbObject.length; i++) {
    glbObject[i].rotation.x = (time / 3) * Math.PI;
  }

  // ---------------

  // Render scene
  renderer.render(scene, camera);
}

// Invoke
init();
animate();
