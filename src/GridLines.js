import * as THREE from 'three';

class GridLines {
  BITMAP_PIXELS_PER_MM = 10;
  DIMENSIONS = {
    lineWidth: 1,
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

  constructor({grid, margins, lineColor}) {
    this.grid = grid;
    this.margins = margins;
    this.lineColor = lineColor;
    this.cssLineColor = `#${this.lineColor.toString(16).padStart(6)}`;

    this.canvas = document.createElement('canvas');

    const {width, height} = this.grid.getDimensions();
    this.canvas.width = (width + margins.left + margins.right) * this.BITMAP_PIXELS_PER_MM;
    this.canvas.height = (height + margins.top + margins.bottom) * this.BITMAP_PIXELS_PER_MM;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
  }

  makeLine(fromX, fromY, toX, toY) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.strokeStyle = this.cssLineColor;
    ctx.lineWidth = this.DIMENSIONS.lineWidth * this.BITMAP_PIXELS_PER_MM;
    ctx.moveTo(fromX * this.BITMAP_PIXELS_PER_MM, fromY * this.BITMAP_PIXELS_PER_MM);
    ctx.lineTo(toX * this.BITMAP_PIXELS_PER_MM, toY * this.BITMAP_PIXELS_PER_MM);
    ctx.stroke();
  }

  makeCircle({x, y, radius}) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x * this.BITMAP_PIXELS_PER_MM, y * this.BITMAP_PIXELS_PER_MM, radius * this.BITMAP_PIXELS_PER_MM, 0, 2 * Math.PI);
    ctx.fillStyle = this.cssLineColor;
    ctx.fill();
  }

  makeTexture() {
    const texture = new THREE.Texture(this.canvas);

    for (let col = 0; col < this.grid.cols; col++) {
      const {x: xStart, y: yStart} = this.grid.gridToSceneCoordinates({
        row: 0,
        col,
      });
      const {x: xEnd, y: yEnd} = this.grid.gridToSceneCoordinates({
        row: this.grid.rows - 1,
        col,
      });
      this.makeLine(xStart, yStart, xEnd, yEnd);
    }

    for (let row = 0; row < this.grid.rows; row++) {
      const {x: xStart, y: yStart} = this.grid.gridToSceneCoordinates({
        row,
        col: 0,
      });
      const {x: xEnd, y: yEnd} = this.grid.gridToSceneCoordinates({
        row,
        col: this.grid.cols - 1,
      });
      this.makeLine(xStart, yStart, xEnd, yEnd);
    }

    const starPointLocations = this.DIMENSIONS.starPointLocations[this.grid.rows] || [];
    for (const {row, col} of starPointLocations) {
      const {x, y} = this.grid.gridToSceneCoordinates({row, col});
      this.makeCircle({
        x,
        y,
        radius: this.DIMENSIONS.starPointRadius,
      });
    }

    texture.needsUpdate = true;
    return texture;
  }

}

export {GridLines};
