import * as THREE from 'three';
import {EffectComposer, EffectPass, RenderPass, ChromaticAberrationEffect} from 'postprocessing';
import OrbitControls from 'three-orbitcontrols';

import {Board} from './Board';

class SceneManager {
  constructor({canvas}) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    const context = canvas.getContext('webgl2');
    const renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      antialias: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio);

    const composer = new EffectComposer(renderer);

    const passes = [
      new RenderPass(scene, camera),
      // new EffectPass(camera, ...effects),
    ];

    passes[passes.length - 1].renderToScreen = true;
    passes.map(composer.addPass.bind(composer));

    this.composer = composer;
    this.clock = new THREE.Clock();
    this.canvas = canvas;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    const coneAngle = Math.PI / 2;
    // controls.minAzimuthAngle = -coneAngle;
    // controls.maxAzimuthAngle = coneAngle;

    controls.minPolarAngle = Math.PI / 2 - coneAngle;
    controls.maxPolarAngle = Math.PI / 2 + coneAngle;

    controls.maxDistance = 500;
    controls.zoomSpeed = 0.3;
    controls.enablePan = false;
    this.controls = controls;

    this.board = new Board({
      rows: 19,
      cols: 19,
    });

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add(ambientLight);

    const directionalLightPositions = [
      // [200, 200, 200],
      [-100, -100, -100],
    ];

    directionalLightPositions.forEach(position => {
      const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
      directionalLight.position.set(...position);
      scene.add(directionalLight);
    });

    // Zoom to fit
    const {width: boardWidth, height: boardHeight} = this.board.getDimensions();
    this.camera.position.z = (Math.max(boardWidth, boardHeight) / 2) / Math.tan(THREE.Math.degToRad(this.camera.fov / 2));

    scene.add(...this.board.getSceneObjects());
  }

  animate(params) {
    this.controls.update();

    const {width, height} = params;
    if (width !== this.lastWidth || height !== this.lastHeight) {
      this.composer.setSize(width, height);
      this.renderer.setSize(width, height);

      this.camera.aspect = width / height;

      this.camera.updateProjectionMatrix();
      this.lastWidth = width;
      this.lastHeight = height;
    }

    this.composer.render(this.scene, this.camera);
  }
}

export {SceneManager};
