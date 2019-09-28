import * as THREE from 'three';
import {MeshLine, MeshLineMaterial} from 'three.meshline';

import {Grid} from './Grid';

class Board {
  DIMENSIONS = {
    rowHeight: 23.7,
    colWidth: 22,
    margins: {
      top: 12,
      left: 12,
      bottom: 12,
      right: 12,
    },
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
    console.log(this.grid)
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
    };
  }

  makeLine(points) {
    const geometry = new THREE.Geometry();
    geometry.vertices = points;

    const material = new MeshLineMaterial({
      color: 0x666666,
      lineWidth: 1,
    });

    const lineObject = new MeshLine();
    lineObject.setGeometry(geometry, t => 1);

    return new THREE.Mesh(lineObject.geometry, material);
  }

  getSceneObjects() {
    const verticalLines = [];
    const horizontalLines = [];

    for (let col = 0; col < this.cols; col++) {
      const {x: xStart, y: yStart} = this.grid.gridToSceneCoordinates({
        row: 0,
        col,
      });
      const {x: xEnd, y: yEnd} = this.grid.gridToSceneCoordinates({
        row: this.rows - 1,
        col,
      });
      verticalLines.push(this.makeLine([
        new THREE.Vector3(xStart, yStart, 0),
        new THREE.Vector3(xEnd, yEnd, 0),
      ]));
    }

    for (let row = 0; row < this.rows; row++) {
      const {x: xStart, y: yStart} = this.grid.gridToSceneCoordinates({
        row,
        col: 0,
      });
      const {x: xEnd, y: yEnd} = this.grid.gridToSceneCoordinates({
        row,
        col: this.cols - 1,
      });
      horizontalLines.push(this.makeLine([
        new THREE.Vector3(xStart, yStart, 0),
        new THREE.Vector3(xEnd, yEnd, 0),
      ]));
    }

    return [
      ...verticalLines,
      ...horizontalLines,
    ];
  }

  update() {
    // do nothing
  }
}

export {Board};
