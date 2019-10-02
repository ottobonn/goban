import * as THREE from 'three';
import {EffectComposer, EffectPass, RenderPass, ChromaticAberrationEffect} from 'postprocessing';
import OrbitControls from 'three-orbitcontrols';

import {Board} from './Board';
import {Stone} from './Stone';

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.soft = true;

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

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.4);
    directionalLight.position.set(30, 30, 50);
    directionalLight.castShadow = true;
    directionalLight.shadowCameraVisible = true;

    directionalLight.shadowCameraLeft = -250;
    directionalLight.shadowCameraRight = 250;
    directionalLight.shadowCameraTop = 250;
    directionalLight.shadowCameraBottom = -250;

    directionalLight.shadowCameraNear = 20;
    directionalLight.shadowCameraFar = 200;

    scene.add(directionalLight);

    // const lightHelper = new THREE.DirectionalLightHelper(directionalLight);
    // scene.add(lightHelper);
    //
    //
    // const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(cameraHelper);
    //
    //
    // scene.add(new THREE.AxisHelper(200));

    const light = new THREE.PointLight(0xffffff, 0.1);
    camera.add(light);
    scene.add(camera);

    // Zoom to fit
    const {width: boardWidth, height: boardHeight} = this.board.getDimensions();
    this.camera.position.z = (Math.max(boardWidth, boardHeight) / 2) / Math.tan(THREE.Math.degToRad(this.camera.fov / 2));

    scene.add(this.board.getSceneObject());

    const blackStone = new Stone({material: new THREE.MeshPhongMaterial({
      color: 0x333333,
    })}).getSceneObject();
    scene.add(blackStone);

    const whiteStone = new Stone({material: new THREE.MeshPhongMaterial({
      color: 0xffffff,
    })}).getSceneObject();
    const {x, y} = this.board.grid.gridToSceneCoordinates({row: 8, col: 8});
    whiteStone.position.x = x;
    whiteStone.position.y = y;
    scene.add(whiteStone);
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
