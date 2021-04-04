import * as THREE from '../build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './jsm/loaders/RGBELoader.js';

// ----------------------------------------------------------------------------------------

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { LUTPass } from './jsm/postprocessing/LUTPass.js';
import { LUTCubeLoader } from './jsm/loaders/LUTCubeLoader.js';
import { GammaCorrectionShader } from './jsm/shaders/GammaCorrectionShader.js';
import { GUI } from './jsm/libs/dat.gui.module.js';

// ----------------------------------------------------------------------------------------

let gui;
let composer, lutPass;

const params = {
  enabled: true,
  lut: 'Clayton 33.CUBE',
  intensity: 1,
  use2dLut: false,
};

const lutMap = {
  'Bourbon 64.CUBE': null,
  'Chemical 168.CUBE': null,
  'Clayton 33.CUBE': null,
  'Cubicle 99.CUBE': null,
  'Remy 24.CUBE': null,
};

// ----------------------------------------------------------------------------------------

//
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

//
init();
render();

//
function init() {
  // Scene
  scene = new THREE.Scene();

  // Fog
  scene.fog = new THREE.Fog(0x020202, 5, 12, 4000);

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

  // ----------------------------------------------------------------------------------------

  Object.keys(lutMap).forEach(name => {
    new LUTCubeLoader().load('luts/' + name, function (result) {
      lutMap[name] = result;
    });
  });

  const target = new THREE.WebGLRenderTarget({
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    encoding: THREE.sRGBEncoding,
  });

  composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ShaderPass(GammaCorrectionShader));

  lutPass = new LUTPass();
  composer.addPass(lutPass);

  gui = new GUI();
  gui.width = 250;
  gui.add(params, 'enabled');
  gui.add(params, 'lut', Object.keys(lutMap));
  gui.add(params, 'intensity').min(0).max(1);

  if (renderer.capabilities.isWebGL2) {
    gui.add(params, 'use2dLut');
  } else {
    params.use2DLut = true;
  }

  gui.hide();

  // ----------------------------------------------------------------------------------------

  // ----------------

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath('hdr/')
    .load('sunflowers_1k.hdr', function (texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;

      //scene.background = envMap;
      scene.environment = envMap;

      texture.dispose();
      pmremGenerator.dispose();

      // model
      const loader = new GLTFLoader().setPath('glb/');
      loader.load('test.glb', function (glb) {
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
      });
    });

  // ----------------
}

//
function render() {
  //
  requestAnimationFrame(render);

  // Resize
  const c = renderer.domElement;
  const width = c.clientWidth;
  const height = c.clientHeight;

  if (c.width !== width || c.height !== height) {
    renderer.setSize(width, height, false);
    // ----------------
    composer.setSize(width, height, false);
    // ----------------
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    console.log(width + ' PX');
  }

  // ----------------------------------------------------------------------------------------

  lutPass.enabled = params.enabled && Boolean(lutMap[params.lut]);
  lutPass.intensity = params.intensity;

  if (lutMap[params.lut]) {
    const lut = lutMap[params.lut];
    lutPass.lut = params.use2DLut ? lut.texture : lut.texture3D;
  }

  // ----------------------------------------------------------------------------------------

  // Object animation
  const time = -performance.now() / 1000;

  for (let i = 0; i < glbObject.length; i++) {
    glbObject[i].rotation.x = (time / 3) * Math.PI;
  }

  // Scroll event
  let t = scrollY / (100 - innerHeight);

  camera.position.y = 0 + 3 * t;
  camera.position.z = 10 + 8 * t;
  camera.rotation.x = 0 + -1 * t;
  camera.rotation.y = 0 + -0.2 * t;
  camera.rotation.z = 0 + -0.7 * t;

  params.intensity = 1 + 1.4 * t;

  for (let i = 0; i < glbObject.length; i++) {
    glbObject[i].rotation.z = 0 + -1 * t;
  }

  // Fade out on scroll
  if (document.documentElement.scrollTop > 480) {
    canvas.style.opacity = 0;
  } else {
    canvas.style.opacity = 1;
  }

  // ----------------
  composer.render();
}
