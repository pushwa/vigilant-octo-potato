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

import { TWEEN } from './jsm/libs/tween.module.min.js';

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

// Tween
let tween, tweenMiddle, tweenBack;
let p, tg;

// Zoom button
const zoomOutButton = document.getElementById('zoomOut');
const zoomInButton = document.getElementById('zoomIn');

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

// Texture loader
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

  // -------------------------------------------

  //
  //
  //
  //
  // Tween
  function panCam() {
    const speed = 1500;
    const middleTime = 120000;

    // Tween Easing

    const currentEase = 19;
    const easing = [
      TWEEN.Easing.Quadratic.In, //     0
      TWEEN.Easing.Quadratic.Out, //    1
      TWEEN.Easing.Quadratic.InOut, //  2
      TWEEN.Easing.Cubic.In, //          3
      TWEEN.Easing.Cubic.Out, //         4
      TWEEN.Easing.Cubic.InOut, //       5
      TWEEN.Easing.Sinusoidal.in, //     6
      TWEEN.Easing.Sinusoidal.Out, //    7
      TWEEN.Easing.Sinusoidal.InOut, //  8
      TWEEN.Easing.Exponential.In, //    9
      TWEEN.Easing.Exponential.Out, //   10
      TWEEN.Easing.Exponential.InOut, // 11
      TWEEN.Easing.Circular.In, //       12
      TWEEN.Easing.Circular.Out, //      13
      TWEEN.Easing.Circular.InOut, //    14
      TWEEN.Easing.Elastic.In, //        15
      TWEEN.Easing.Elastic.Out, //       16
      TWEEN.Easing.Elastic.InOut, //     17
      TWEEN.Easing.Back.In, //           18
      TWEEN.Easing.Back.Out, //          19
      TWEEN.Easing.Back.InOut, //        20
      TWEEN.Easing.Bounce.In, //         21
      TWEEN.Easing.Bounce.Out, //        22
      TWEEN.Easing.Bounce.InOut, //      23
    ];

    tween = new TWEEN.Tween(camera.position)
      .to(tg, speed)
      .easing(easing[currentEase])
      .onComplete(function () {
        camera.position.copy(tg);
      });

    tweenMiddle = new TWEEN.Tween(camera.position)
      .to(tg, middleTime)
      .easing(easing[currentEase])
      .onComplete(function () {
        camera.position.copy(tg);
      });

    tweenBack = new TWEEN.Tween(camera.position)
      .to(p, speed)
      .easing(easing[currentEase])
      .onComplete(function () {
        camera.position.copy(p);
      });

    tween.chain(tweenMiddle);
    tweenMiddle.chain(tweenBack);
    tween.start();

    zoomInButton.addEventListener('click', () => {
      tweenBack.start();
      setTimeout(() => {
        tweenMiddle.stop();
        tweenBack.stop();
      }, speed);
    });
  }

  zoomOutButton.addEventListener('click', () => {
    panCam();
  });

  //
  //
  //
  //
  //

  // -------------------------------------------

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

  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  const sprite1 = textureLoader.load('sprites/flake1.png');
  const sprite2 = textureLoader.load('sprites/flake2.png');
  const sprite3 = textureLoader.load('sprites/flake3.png');
  const sprite4 = textureLoader.load('sprites/flake4.png');
  const sprite5 = textureLoader.load('sprites/flake5.png');

  const particleAmount = 3000;
  const particleSpaceMax = 3000;
  const particleSpaceMin = 2000;

  for (let i = 0; i < particleAmount; i++) {
    const x = Math.random() * particleSpaceMax - particleSpaceMin;
    const y = Math.random() * particleSpaceMax - particleSpaceMin;
    const z = Math.random() * particleSpaceMax - particleSpaceMin;

    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const spriteArray = [sprite2, sprite3, sprite1, sprite5, sprite4];
  const sizeArray = [6, 3, 7, 4, 5];

  const materials = [];

  for (let i = 0; i < spriteArray.length; i++) {
    const sprite = spriteArray[i];
    const size = sizeArray[i];

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
    particles.rotation.z = Math.random() * 4;

    scene.add(particles);
  }

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

  // Scroller
  const scroll = scrollY / (100 - innerHeight);

  // ----------------------------------------------------------------------------------------

  lutPass.enabled = params.enabled && Boolean(lutMap[params.lut]);
  lutPass.intensity = params.intensity;

  if (lutMap[params.lut]) {
    const lut = lutMap[params.lut];
    lutPass.lut = params.use2DLut ? lut.texture : lut.texture3D;
  }

  // 3D Lut on scroll
  params.intensity = 1 + 1.3 * scroll;

  // ----------------------------------------------------------------------------------------

  // Object animation
  const time = -performance.now() / 1000;

  for (let i = 0; i < glbObject.length; i++) {
    glbObject[i].rotation.x = (time / 4) * Math.PI;
  }

  // Object rotate on scroll
  for (let i = 0; i < glbObject.length; i++) {
    glbObject[i].rotation.z = 1.3 * scroll;
  }

  // -------------------------------------------
  // Particles

  const particleTime = Date.now() * 0.00003;

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object instanceof THREE.Points) {
      object.rotation.x = particleTime * (i < 5 ? i + 0.6 : -(i + 0.9));
      object.rotation.y = particleTime * (i < 4 ? i + 0.3 : -(i + 1));
      object.rotation.z = particleTime * (i < 3 ? i + 0.5 : -(i + 0.6));
    }
  }
  // -------------------------------------------

  // Media queries
  const mobile = window.matchMedia('(max-width: 425px)');
  const tablet = window.matchMedia('(max-width: 768px)');
  const laptop = window.matchMedia('(max-width: 1024px)');
  const laptopL = window.matchMedia('(max-width: 1440px)');

  if (mobile.matches) {
    // -------------------------------------------

    // Camera position
    const camPosMobileX = 0.2;
    const camPosMobileY = -2.5;
    const camPosMobileZ = 11;

    // Tween camera target
    const camTargetMobileX = 0;
    const camTargetMobileY = -2;
    const camTargetMobileZ = 7.7;

    // camera on scroll
    camera.position.x = camPosMobileX + -1.2 * scroll;
    camera.position.y = camPosMobileY + 1.6 * scroll;
    camera.position.z = camPosMobileZ + 8.1 * scroll;

    camera.rotation.x = 0 + -1.2 * scroll;
    camera.rotation.y = 0 + -0.1 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 500) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }

    //tween
    p = { x: camPosMobileX, y: camPosMobileY, z: camPosMobileZ }; // Must be the same as camera.positon
    tg = { x: camTargetMobileX, y: camTargetMobileY, z: camTargetMobileZ }; // Change this if you need to change the target position

    // -------------------------------------------
  } else if (tablet.matches) {
    // -------------------------------------------

    // Camera position
    const camPosTabletX = 0.1;
    const camPosTabletY = -3.5;
    const camPosTabletZ = 14;

    // Tween camera target
    const camTargetTabletX = 0;
    const camTargetTabletY = -2;
    const camTargetTabletZ = 7.5;

    // camera on scroll
    camera.position.x = camPosTabletX + -1.2 * scroll;
    camera.position.y = camPosTabletY + -2.1 * scroll;
    camera.position.z = camPosTabletZ + 8.1 * scroll;

    camera.rotation.x = 0 + -0.7 * scroll;
    camera.rotation.y = 0 + -0.1 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 600) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }

    //tween
    p = { x: camPosTabletX, y: camPosTabletY, z: camPosTabletZ }; // Must be the same as camera.positon
    tg = { x: camTargetTabletX, y: camTargetTabletY, z: camTargetTabletZ }; // Change this if you need to change the target position

    // -------------------------------------------
  } else if (laptop.matches) {
    // -------------------------------------------

    // Camera position
    const camPosLaptopX = 0.2;
    const camPosLaptopY = -2.5;
    const camPosLaptopZ = 10;

    // Tween camera target
    const camTargetLaptopX = 0;
    const camTargetLaptopY = -1.7;
    const camTargetLaptopZ = 6.5;

    // camera on scroll
    camera.position.x = camPosLaptopX + -1.2 * scroll;
    camera.position.y = camPosLaptopY + -2.1 * scroll;
    camera.position.z = camPosLaptopZ + 8 * scroll;

    camera.rotation.x = 0 + -0.51 * scroll;
    camera.rotation.y = 0 + -0.13 * scroll;
    camera.rotation.z = 0 + -0.3 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 470) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }

    //tween
    p = { x: camPosLaptopX, y: camPosLaptopY, z: camPosLaptopZ }; // Must be the same as camera.positon
    tg = { x: camTargetLaptopX, y: camTargetLaptopY, z: camTargetLaptopZ }; // Change this if you need to change the target position

    // -------------------------------------------
  } else if (laptopL.matches) {
    // -------------------------------------------

    // Camera position
    const camPosLaptopLX = 0.1;
    const camPosLaptopLY = -2.5;
    const camPosLaptopLZ = 11;

    // Tween camera target
    const camTargetLaptopLX = 0;
    const camTargetLaptopLY = -1.5;
    const camTargetLaptopLZ = 6.5;

    // camera on scroll
    camera.position.x = camPosLaptopLX + -1.2 * scroll;
    camera.position.y = camPosLaptopLY + -2.1 * scroll;
    camera.position.z = camPosLaptopLZ + 10 * scroll;

    camera.rotation.x = 0 + -0.5 * scroll;
    camera.rotation.y = 0 + -0.1 * scroll;
    camera.rotation.z = 0 + -0.3 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 450) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }

    //tween
    p = { x: camPosLaptopLX, y: camPosLaptopLY, z: camPosLaptopLZ }; // Must be the same as camera.positon
    tg = { x: camTargetLaptopLX, y: camTargetLaptopLY, z: camTargetLaptopLZ }; // Change this if you need to change the target position

    // -------------------------------------------
  } else {
    // -------------------------------------------

    // Camera position
    const camPosLaptopBigX = 0.05;
    const camPosLaptopBigY = -2.7;
    const camPosLaptopBigZ = 13;

    // Tween camera target
    const camTargetLaptopBigX = 0.1;
    const camTargetLaptopBigY = -1.4;
    const camTargetLaptopBigZ = 6.5;

    // camera on scroll
    camera.position.x = camPosLaptopBigX + -1.2 * scroll;
    camera.position.y = camPosLaptopBigY + -2.1 * scroll;
    camera.position.z = camPosLaptopBigZ + 8 * scroll;

    camera.rotation.x = 0 + -0.5 * scroll;
    camera.rotation.y = 0 + -0.1 * scroll;
    camera.rotation.z = 0 + -0.3 * scroll;

    // Fade out on scroll
    if (document.documentElement.scrollTop > 600) {
      canvas.style.opacity = 0;
    } else {
      canvas.style.opacity = 1;
    }

    //tween
    p = { x: camPosLaptopBigX, y: camPosLaptopBigY, z: camPosLaptopBigZ }; // Must be the same as camera.positon

    tg = {
      x: camTargetLaptopBigX,
      y: camTargetLaptopBigY,
      z: camTargetLaptopBigZ,
    }; // Change this if you need to change the target position
    // -------------------------------------------
  }

  // Stats
  //stats.update();

  //
  TWEEN.update();

  //
  composer.render();
}
