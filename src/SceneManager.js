import * as THREE from 'three';
import {MeshLine, MeshLineMaterial} from 'three.meshline';
import {EffectComposer, EffectPass, RenderPass, ChromaticAberrationEffect} from 'postprocessing';

window.THREE = THREE;

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
    camera.position.z = 5;

    this.makeTestCurve(scene);
  }

  makeTestCurve(scene) {
    const points = [];
    for( var j = 0; j <= 2 * Math.PI; j += Math.PI / 30 ) {
    	var v = new THREE.Vector3( Math.cos( j ), Math.sin( j ), 0 );
    	points.push(v);
    }

    const geometry = new THREE.Geometry();
    geometry.vertices = points;

    const material = new MeshLineMaterial({
      color: 0xffffff,
      lineWidth: 0.1,
    });

    const curveObject = new MeshLine();
    curveObject.setGeometry(geometry, t => 1 - t);

    scene.add(new THREE.Mesh(curveObject.geometry, material));
  }

  animate(params) {
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
