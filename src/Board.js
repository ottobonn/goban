import * as THREE from 'three';
import {MeshLine, MeshLineMaterial} from 'three.meshline';

import {Grid} from './Grid';

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
    thickness: 151.5,
    starPointRadius: 2,
    starPointLocations: {
      9: [
        {
          row: 2,
          col: 2,
        },
        {
          row: 6,
          col: 2,
        },
        {
          row: 4,
          col: 4,
        },
        {
          row: 2,
          col: 6,
        },
        {
          row: 6,
          col: 6,
        },
      ],
      13: [
        {
          row: 3,
          col: 3,
        },
        {
          row: 9,
          col: 3,
        },
        {
          row: 6,
          col: 6,
        },
        {
          row: 3,
          col: 9,
        },
        {
          row: 9,
          col: 9,
        },
      ],
      19: [
        {
          row: 3,
          col: 3,
        },
        {
          row: 9,
          col: 3,
        },
        {
          row: 15,
          col: 3,
        },
        {
          row: 3,
          col: 9,
        },
        {
          row: 9,
          col: 9,
        },
        {
          row: 15,
          col: 9,
        },
        {
          row: 3,
          col: 15,
        },
        {
          row: 9,
          col: 15,
        },
        {
          row: 15,
          col: 15,
        },
      ],
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

  makeLine(points) {
    const geometry = new THREE.Geometry();
    geometry.vertices = points;

    const material = new MeshLineMaterial({
      color: 0,
      lineWidth: 1,
    });

    const lineObject = new MeshLine();
    lineObject.setGeometry(geometry, t => 1);

    return new THREE.Mesh(lineObject.geometry, material);
  }

  makeCircle({x, y, radius}) {
    const geometry = new THREE.CircleGeometry(this.DIMENSIONS.starPointRadius, 10);
    geometry.translate(x, y, 0.01);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00});
    return new THREE.Mesh(geometry, material);
  }

  makeBoard() {
    const {width, height, depth} = this.getDimensions();
    const geometry = new THREE.BoxGeometry(width, height, depth);
    geometry.translate(0, 0, -depth / 2 - 10); // top of board is at z = 0
    const material = new THREE.MeshBasicMaterial({color: 0x9e600b});
    return new THREE.Mesh(geometry, material);
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

    const starPointLocations = this.DIMENSIONS.starPointLocations[this.rows] || [];
    const starPoints = [];
    for (const {row, col} of starPointLocations) {
      const {x, y} = this.grid.gridToSceneCoordinates({row, col});
      starPoints.push(this.makeCircle({
        x,
        y,
        radius: this.DIMENSIONS.starPointRadius,
      }));
    }

    return [
      ...verticalLines,
      ...horizontalLines,
      ...starPoints,
      this.makeBoard(),
    ];
  }

  update() {
    // do nothing
  }
}

export {Board};
