export default class Cell {
  constructor(x, y, cellSize, row, column, neighbours, index, centerX, centerY) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.column = column;
    this.cellSize = cellSize;
    this.neighbours = neighbours;
    this.index = index;
    this.visited = false;
    this.wallTop = true;
    this.wallRight = true;
    this.wallBottom = true;
    this.wallLeft = true;
    this.walls = [true, true, true, true];
    this.centerX = centerX;
    this.centerY = centerY;
    this.h = null;
    this.g = null;
    this.f = null;
    this.comingFrom = null;
  }
}

