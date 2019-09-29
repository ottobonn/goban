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

  // TODO remove magic scaling 10
  makeLine(ctx, fromX, fromY, toX, toY, strokeWidth) {
    ctx.beginPath();
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = strokeWidth;
    ctx.moveTo(fromX * 10, fromY * 10);
    ctx.lineTo(toX * 10, toY * 10);
    ctx.stroke();
  }

  // TODO remove magic scaling 10
  makeCircle(ctx, {x, y, radius}) {
    ctx.beginPath();
    ctx.arc(x * 10, y * 10, radius * 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#0000ff';
    ctx.fill();
  }

  makeTexture() {
    const {width, height} = this.getDimensions();

    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);

    const BITMAP_PIXELS_PER_MM = 10;
    this.canvas.width = width * BITMAP_PIXELS_PER_MM;
    this.canvas.height = height * BITMAP_PIXELS_PER_MM;

    const texture = new THREE.Texture(this.canvas);
    const ctx = this.canvas.getContext('2d');
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

    for (let col = 0; col < this.cols; col++) {
      const {x: xStart, y: yStart} = this.grid.gridToSceneCoordinates({
        row: 0,
        col,
      });
      const {x: xEnd, y: yEnd} = this.grid.gridToSceneCoordinates({
        row: this.rows - 1,
        col,
      });
      this.makeLine(ctx, xStart, yStart, xEnd, yEnd, 1 * BITMAP_PIXELS_PER_MM);
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
      this.makeLine(ctx, xStart, yStart, xEnd, yEnd, 1 * BITMAP_PIXELS_PER_MM);
    }

    const starPointLocations = this.DIMENSIONS.starPointLocations[this.rows] || [];
    for (const {row, col} of starPointLocations) {
      const {x, y} = this.grid.gridToSceneCoordinates({row, col});
      this.makeCircle(ctx, {
        x,
        y,
        radius: this.DIMENSIONS.starPointRadius,
      });
    }

    texture.needsUpdate = true;
    return texture;
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
    const geometry = new THREE.BoxGeometry(width, height, depth);
    geometry.translate(0, 0, -depth / 2); // top of board is at z = 0

    const topMaterial = new THREE.MeshBasicMaterial({
      map: this.makeTexture(),
    });

    const bottomMaterial = new THREE.MeshBasicMaterial({
      color: '#ff0000',
    });

    const edgeGrainMaterial = new THREE.MeshBasicMaterial({
      color: '#00ff00',
    });

    const endGrainMaterial = new THREE.MeshBasicMaterial({
      color: '#ff0000',
    });

    return new THREE.Mesh(geometry, [
      edgeGrainMaterial,
      edgeGrainMaterial,
      endGrainMaterial,
      endGrainMaterial,
      topMaterial,
      bottomMaterial,
    ]);
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
