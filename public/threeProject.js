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

import Stats from './jsm/libs/stats.module.js';

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
let scene, camera, renderer, stats;

// Canvas
const canvas = document.getElementById('canvas');

// Stats
function st() {
  stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'fixed';
  stats.domElement.style.top = '50px';
  stats.domElement.style.left = '10px';
  document.body.appendChild(stats.domElement);
}
//st();

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
    envMapIntensity: 1, // Default value
  });

  return mat;
}

// Load after fully loaded
window.addEventListener('load', init, false);

// Init
function init() {
  // Scene
  scene = new THREE.Scene();

  // Fog
  scene.fog = new THREE.Fog(0x121216, 15, 20, 4000);

  // Camera
  camera = new THREE.PerspectiveCamera(65, 1, 1, 1000);
  camera.lookAt(0, 0, 0);
  //camera.position.set(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: false,
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

  // Hide GUI
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
      loader.load('blue.glb', function (glb) {
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

  // -------------------------------------------
  // Particles

  // Particles
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  const textureLoader = new THREE.TextureLoader();

  const sprite1 = textureLoader.load('sprites/flake1.png');
  const sprite2 = textureLoader.load('sprites/flake2.png');
  const sprite3 = textureLoader.load('sprites/flake3.png');
  const sprite4 = textureLoader.load('sprites/flake4.png');
  const sprite5 = textureLoader.load('sprites/flake5.png');

  const particleAmount = 3000;

  for (let i = 0; i < particleAmount; i++) {
    const x = Math.random() * 3000 - 2000;
    const y = Math.random() * 3000 - 2000;
    const z = Math.random() * 3000 - 2000;

    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const parameters = [
    [sprite2, 9],
    [sprite3, 7],
    [sprite1, 6],
    [sprite5, 8],
    [sprite4, 5],
  ];

  const materials = [];

  for (let i = 0; i < parameters.length; i++) {
    const sprite = parameters[i][0];
    const size = parameters[i][1];

    materials[i] = new THREE.PointsMaterial({
      map: sprite,
      size: size,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      color: 0xfc4a1a,
    });

    const particles = new THREE.Points(geometry, materials[i]);

    particles.rotation.x = Math.random() * 8;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 5;

    scene.add(particles);
  }

  // -------------------------------------------

  //
  render();
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
    glbObject[i].rotation.x = (time / 4) * Math.PI;
  }

  // Scroller
  const scroll = scrollY / (100 - innerHeight);

  // Object rotate on scroll
  for (let i = 0; i < glbObject.length; i++) {
    glbObject[i].rotation.z = 1.3 * scroll;
  }

  // 3D Lut on scroll
  params.intensity = 1 + 1.3 * scroll;

  // Media queries
  const mobile = window.matchMedia('(max-width: 425px)');
  const tablet = window.matchMedia('(max-width: 768px)');
  const laptop = window.matchMedia('(max-width: 1024px)');
  const laptopL = window.matchMedia('(max-width: 1440px)');

  if (mobile.matches) {
    // -------------------------------------------
    // camera on scroll
    camera.position.x = 0.2 + -1.2 * scroll;
    camera.position.y = -1.5 + 1.6 * scroll;
    camera.position.z = 11 + 8.1 * scroll;

    camera.rotation.x = 0 + -1.2 * scroll;
    camera.rotation.y = 0 + -0.1 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 500) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }
    // -------------------------------------------
  } else if (tablet.matches) {
    // -------------------------------------------
    // camera on scroll
    camera.position.x = 0.2 + -1.2 * scroll;
    camera.position.y = -3 + -2.1 * scroll;
    camera.position.z = 13 + 8.1 * scroll;

    camera.rotation.x = 0 + -0.7 * scroll;
    camera.rotation.y = 0 + -0.1 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 600) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }
    // -------------------------------------------
  } else if (laptop.matches) {
    // -------------------------------------------
    // camera on scroll
    camera.position.x = 0.2 + -1.2 * scroll;
    camera.position.y = -1 + -2.1 * scroll;
    camera.position.z = 10 + 8 * scroll;

    camera.rotation.x = 0 + -0.51 * scroll;
    camera.rotation.y = 0 + -0.13 * scroll;
    camera.rotation.z = 0 + -0.3 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 470) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }
    // -------------------------------------------
  } else if (laptopL.matches) {
    // -------------------------------------------
    // camera on scroll
    camera.position.x = 0.1 + -1.2 * scroll;
    camera.position.y = -1.3 + -2.1 * scroll;
    camera.position.z = 11 + 10 * scroll;

    camera.rotation.x = 0 + -0.5 * scroll;
    camera.rotation.y = 0 + -0.1 * scroll;
    camera.rotation.z = 0 + -0.3 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 500) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }
    // -------------------------------------------
  } else {
    // -------------------------------------------
    // camera on scroll
    camera.position.x = 0.1 + -1.2 * scroll;
    camera.position.y = -1.6 + -2.1 * scroll;
    camera.position.z = 11 + 8 * scroll;

    camera.rotation.x = 0 + -0.5 * scroll;
    camera.rotation.y = 0 + -0.1 * scroll;
    camera.rotation.z = 0 + -0.3 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 500) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }
    // -------------------------------------------
  }

  // -------------------------------------------
  // Particles
  const particleTime = Date.now() * 0.00004;

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object instanceof THREE.Points) {
      object.rotation.x = particleTime * (i < 5 ? i + 1 : -(i + 0.9));
      object.rotation.y = particleTime * (i < 4 ? i + 1 : -(i + 1));
      object.rotation.z = particleTime * (i < 3 ? i + 1 : -(i + 0.6));
    }
  }
  // -------------------------------------------

  // Stats
  //stats.update();

  //
  composer.render();
}
