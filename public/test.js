import * as THREE from '../build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './jsm/loaders/RGBELoader.js';

// Main
let scene, camera, renderer;

// Canvas
const canvas = document.getElementById('canvas');

//
// Load textures
const textureLoader = new THREE.TextureLoader();

//
// Material
function theMaterial() {
  const diffuse = textureLoader.load('./glb/DefaultMaterial_baseColor.png');
  diffuse.encoding = THREE.sRGBEncoding;
  diffuse.flipY = false;

  const normalMap = textureLoader.load('./glb/DefaultMaterial_normal.png');
  diffuse.flipY = false;

  const occRoughMet = textureLoader.load(
    './glb/DefaultMaterial_occlusionRoughnessMetallic.png'
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

//
const gltfObject = [];

//

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
      // GLB Model
      const loader = new GLTFLoader();
      loader.load('glb/hepp.glb', function (gltf) {
        const model = gltf.scene.children[0];

        model.getObjectByName('test').material = theMaterial();

        // Animate objects
        gltfObject.push(model.getObjectByName('test'));

        // Position all gltf objects
        model.position.set(0, 0, 0);

        // Rotate all gltf objects
        model.rotation.set(0, 0, 0);

        // Scale all gltf objects
        model.scale.set(1, 1, 1);

        // Add gltf objects to scene
        scene.add(model);

        animate();
      }); // load
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

  const time = -performance.now() / 1000;

  for (let i = 0; i < gltfObject.length; i++) {
    gltfObject[i].rotation.x = (time / 7) * Math.PI;
    gltfObject[i].rotation.z = 0 + -2 * t;
  }

  // ---------------

  // Render scene
  renderer.render(scene, camera);
}
