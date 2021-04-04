import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './jsm/loaders/RGBELoader.js';

// Main vars
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

// Load textures
const textureLoader = new THREE.TextureLoader();

// push gltf Objects to empty array
const gltfObject1 = [];
const gltfObject2 = [];
const gltfObject3 = [];

// Materials
function material1() {
  const diffuse = textureLoader.load('./gltf/box1_baseColor.png');
  diffuse.encoding = THREE.sRGBEncoding;
  diffuse.flipY = false;

  const normalMap = textureLoader.load('./gltf/box1_normal.png');
  diffuse.flipY = false;

  const occRoughMet = textureLoader.load(
    './gltf/box1_occlusionRoughnessMetallic.png'
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
    envMapIntensity: 1, // Default value
  });

  return mat;
}

function material2() {
  const diffuse = textureLoader.load('./gltf/box2_baseColor.png');
  diffuse.encoding = THREE.sRGBEncoding;
  diffuse.flipY = false;

  const normalMap = textureLoader.load('./gltf/box2_normal.png');
  diffuse.flipY = false;

  const occRoughMet = textureLoader.load(
    './gltf/box2_occlusionRoughnessMetallic.png'
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
    envMapIntensity: 1, // Default
  });

  return mat;
}

function material3() {
  const diffuse = textureLoader.load('./gltf/box3_baseColor.png');
  diffuse.encoding = THREE.sRGBEncoding;
  diffuse.flipY = false;

  const normalMap = textureLoader.load('./gltf/box3_normal.png');
  diffuse.flipY = false;

  const occRoughMet = textureLoader.load(
    './gltf/box3_occlusionRoughnessMetallic.png'
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
    envMapIntensity: 1, // Default
  });

  return mat;
}

init();
render();

// init
function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(65, 1, 1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(0, 0, 4);

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

      // GLB Model
      const loader = new GLTFLoader();
      loader.load('glb/test.glb', function (glb) {
        const boxes = glb.scene.children[0];

        boxes.getObjectByName('box1').material = material1();
        boxes.getObjectByName('box2').material = material2();
        boxes.getObjectByName('box3').material = material3();

        // button hide/show object
        const btn = document.getElementById('btn');

        btn.addEventListener('click', function () {
          if (boxes.getObjectByName('box2').visible === true) {
            boxes.getObjectByName('box2').visible = false;
          } else {
            boxes.getObjectByName('box2').visible = true;
          }
        });

        // Animate objects
        gltfObject1.push(boxes.getObjectByName('box1'));

        gltfObject2.push(boxes.getObjectByName('box2'));

        gltfObject3.push(boxes.getObjectByName('box3'));

        // Position all gltf objects
        boxes.position.set(0, 0.3, 0);

        // Rotate all gltf objects
        boxes.rotation.set(-55, 85, -75);

        // Scale all gltf objects
        boxes.scale.set(0.9, 0.9, 0.9);

        // Add gltf objects to scene
        scene.add(boxes);
      });
    });

  // ---------------

  //
  orbitControls();
}

// Render
function render() {
  // Animation timeline
  requestAnimationFrame(render);

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

  // Orbit Controls (When damping is on)
  controls.update();

  // ---------------

  // Animate objects
  const time = -performance.now() / 1000;

  for (let i = 0; i < gltfObject1.length; i++) {
    gltfObject1[i].rotation.x = (time / 3) * Math.PI;
  }

  for (let i = 0; i < gltfObject2.length; i++) {
    gltfObject2[i].rotation.y = (time / 5) * Math.PI;
  }

  for (let i = 0; i < gltfObject3.length; i++) {
    gltfObject3[i].rotation.z = (time / 7) * Math.PI;
  }

  // ---------------

  // Render scene
  renderer.render(scene, camera);
}
