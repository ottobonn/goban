class Grid {
  constructor({width, height, rows, cols}) {
    this.width = width;
    this.height = height;
    this.rows = rows;
    this.cols = cols;

    // If the grid has 19 row lines, it really has 18 "rows"
    this.rowHeight = height / (rows - 1);
    this.colWidth = width / (cols - 1);
  }
  gridToSceneCoordinates({row, col}) {
    return {
      x: (col * this.colWidth) - (this.width / 2),
      y: (row * this.rowHeight) - (this.height / 2),
    }
  }
  getDimensions() {
    return {
      width: this.width,
      height: this.height,
    };
  }
  // nearestGridCoordinate({x, y}) {
  //   x + (this.width / 2)
  // }
}

export {Grid};
