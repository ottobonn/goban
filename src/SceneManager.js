import * as THREE from 'three';
import {EffectComposer, EffectPass, RenderPass, ChromaticAberrationEffect} from 'postprocessing';
import OrbitControls from 'three-orbitcontrols';

import {Board} from './Board';

class EffectModulator {
  constructor({effect, modulator}) {
    this.effect = effect;
    this.modulator = modulator || (() => {});
  }
  animate(params) {
    this.modulator(this.effect, params);
  }
}

class SceneManager {
  constructor({canvas}) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(76, 1, 0.1, 1000);
    const context = canvas.getContext('webgl2');
    const renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      antialias: true,
    });

    renderer.setPixelRatio(2);

    this.effectModulators = [
      new EffectModulator({
        effect: new ChromaticAberrationEffect(),
        modulator(effect, {amount}) {
          const minOffset = new THREE.Vector2(0, 0);
          const maxOffset = new THREE.Vector2(0.05, 0.05);
          const offset = minOffset.lerp(maxOffset, amount);
          effect.offset = offset;
        },
      }),
    ];

    // const effects = this.effectModulators.map(modulator => modulator.effect);

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
    const coneAngle = Math.PI / 3;
    controls.minAzimuthAngle = -coneAngle;
    controls.maxAzimuthAngle = coneAngle;

    controls.minPolarAngle = coneAngle;
    controls.maxPolarAngle = Math.PI - coneAngle;

    controls.maxDistance = 500;
    controls.zoomSpeed = 0.3;
    controls.enablePan = false;
    controls.enableDamping = true;
    this.controls = controls;

    this.board = new Board({
      scene,
      rows: 18,
      cols: 18,
    });

    // Zoom to fit
    const {width: boardWidth, height: boardHeight} = this.board.getDimensions();
    this.camera.position.z = (Math.max(boardWidth, boardHeight) / 2) / Math.tan(THREE.Math.degToRad(this.camera.fov / 2));

    scene.add(...this.board.getSceneObjects());
  }

  animate(params) {
    // this.controls.update();
    const {width, height} = params;
    if (width !== this.lastWidth || height !== this.lastHeight) {
      this.composer.setSize(width, height);
      this.renderer.setSize(width, height);

      this.camera.aspect = width / height;

      this.camera.updateProjectionMatrix();
      this.lastWidth = width;
      this.lastHeight = height;
    }
    // TODO adding to params seems to mix concerns; who should own the clock?
    params.clock = this.clock;
    params.amount = Math.random();

    // TODO render the board here



    this.effectModulators.forEach(effectModulator => effectModulator.animate(params));
    this.composer.render(this.scene, this.camera);
  }
}

export {SceneManager};
