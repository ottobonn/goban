import * as THREE from 'three';
import {MeshLine, MeshLineMaterial} from 'three.meshline';

import {Grid} from './Grid';
import {GridLines} from './GridLines';

class Board {
  DIMENSIONS = {
    rowHeight: 23.7,
    colWidth: 22,
    margins: {
      top: 13.95,
      left: 14.1,
      bottom: 13.95,
      right: 14.1,
    },
    thickness: 38.1,
    starPointRadius: 2,
  };

  constructor({rows, cols}) {
    this.rows = rows;
    this.cols = cols;

    this.grid = new Grid({
      width: this.DIMENSIONS.colWidth * cols,
      height: this.DIMENSIONS.rowHeight * rows,
      rows,
      cols,
    });
  }

  getDimensions() {
    const {
      width: gridWidth,
      height: gridHeight,
    } = this.grid.getDimensions();
    const {margins} = this.DIMENSIONS;
    return {
      width: gridWidth + margins.left + margins.right,
      height: gridHeight + margins.top + margins.bottom,
      depth: this.DIMENSIONS.thickness,
    };
  }

  makeBoard() {
    const {width, height, depth} = this.getDimensions();
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    geometry.translate(0, 0, -depth / 2); // top of board is at z = 0

    // Add a second material to the front face (triangles 24-30) for the lines
    geometry.addGroup(24, 6, 6);

    const surfaceMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('/assets/textures/walnut.jpg'),
      normalMap: new THREE.TextureLoader().load('/assets/textures/walnut_normal.jpg'),
    });

    const gridLines = new GridLines({
      grid: this.grid,
      margins: this.DIMENSIONS.margins,
      lineColor: 0xfbc90b,
    });
    const linesMaterial = new THREE.MeshBasicMaterial({
      map: gridLines.makeTexture(),
      transparent: true,
    });

    const edgeGrainMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('/assets/textures/walnut.jpg'),
      normalMap: new THREE.TextureLoader().load('/assets/textures/walnut_normal.jpg'),
      normalMapMode: THREE.ObjectSpaceNormalMap,
    });

    const endGrainMaterial = edgeGrainMaterial; // TODO

    const mesh = new THREE.Mesh(geometry, [
      edgeGrainMaterial,
      edgeGrainMaterial,
      endGrainMaterial,
      endGrainMaterial,
      surfaceMaterial,
      surfaceMaterial,
      linesMaterial,
    ]);
    // mesh.castShadow = true;

    return mesh;
  }

  getSceneObjects() {
    return [
      this.makeBoard(),
    ];
  }

  update() {
    // do nothing
  }
}

export {Board};
