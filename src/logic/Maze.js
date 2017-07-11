import Cell from './Cell';


export default class Maze {
  constructor(ctx, canvasWidth, canvasHeight) {
    this.grid = [];
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.generateGrid = this.generateGrid.bind(this);
    this.current = 0;
    this.stack = [];
    this.unvisited = [];
    this.openSet = [0];
    this.closedSet = [];
  }

  generateGrid(columns, rows, cellSize) {
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const x = column * cellSize;
        const y = row * cellSize;
        const neighbours = [
          this.getIndex(columns, rows, column, row - 1),
          this.getIndex(columns, rows, column + 1, row),
          this.getIndex(columns, rows, column, row + 1),
          this.getIndex(columns, rows, column - 1, row),
        ];
        const index = column + (columns * row);
        const centerX = x + (cellSize / 2);
        const centerY = y + (cellSize / 2);
        const cell = new Cell(x, y, cellSize, row, column, neighbours, index, centerX, centerY);
        this.grid.push(cell);
        const exitCellIndex = this.grid.length - 1;
        this.grid.forEach((item, ind) => {
          item.h = this.distanceBetweenIndexes(ind, exitCellIndex);
        });
      }
    }
  }

  getIndex(maxCols, maxRows, col, row) {
    if (col >= 0 && col < maxCols && row >= 0 && row < maxRows) {
      return col + (maxCols * row);
    }
    return null;
  }

  markAsVisited(i) {
    this.grid[i].visited = true;
  }

  checkNeighbours(cell) {
    for (let i = 0; i < cell.neighbours.length; i += 1) {
      const checking = cell.neighbours[i];
      if (checking && !this.grid[checking].visited) {
        this.stack.push(checking);
      }
    }
  }

  getRandomNeighbour(neighbours) {
    if (neighbours) {
      const selected = Math.floor(Math.random() * neighbours.length);
      return neighbours[selected];
    }
    return null;
  }

  getUnvistedCells() {
    return this.grid.filter((item) => !item.visited)
                    .map((item) => item.index);
  }

  removeWalls(current, next) {
    const currentRow = this.grid[current].row;
    const currentCol = this.grid[current].column;
    const nextRow = this.grid[next].row;
    const nextCol = this.grid[next].column;
    if (currentRow < nextRow) {
      this.grid[current].walls[2] = false;
      this.grid[next].walls[0] = false;
    }
    if (currentRow > nextRow) {
      this.grid[current].walls[0] = false;
      this.grid[next].walls[2] = false;
    }
    if (currentCol < nextCol) {
      this.grid[current].walls[1] = false;
      this.grid[next].walls[3] = false;
    }
    if (currentCol > nextCol) {
      this.grid[current].walls[3] = false;
      this.grid[next].walls[1] = false;
    }
  }

  getUnvisitedNeighbours(i) {
    return this.grid[i].neighbours.filter((item) => item && !this.grid[item].visited);
  }

  generateMaze () {
    return new Promise((resolve, reject) => {
      let unvisited = this.getUnvistedCells();
      let current = 0;
      const stack = [];
      this.clearGrid();
      const timer = setInterval(() => {
        if (unvisited.length) {
          this.markAsVisited(current);
          const unvistedNeighbours = this.getUnvisitedNeighbours(current);
          if (unvistedNeighbours.length) {
            const next = this.getRandomNeighbour(unvistedNeighbours);
            stack.push(current);
            this.removeWalls(current, next);
            this.clearCell(current);
            this.clearCell(next);
            this.drawCell(current);
            this.drawCell(next);
            current = next;
            this.fillCurrent(current, '#FF4136');
          } else {
            this.clearCell(current, '#FF4136');
            this.drawCell(current);
            current = stack.pop();
            this.fillCurrent(current, '#FF4136');
          }
          unvisited = this.getUnvistedCells();
        } else {
          clearInterval(timer);
          this.drawGrid();
          resolve();
        }
      }, 1000 / 60);
    });
  }

  clearCell(i) {
    const { x, y, cellSize } = this.grid[i];
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(x, y, cellSize, cellSize);
  }

  fillCurrent(i, color) {
    const { x, y, cellSize } = this.grid[i];
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, cellSize, cellSize);
  }

  drawCell(i) {
    const { x, y, cellSize, walls } = this.grid[i];
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    if (walls[0]) {
      this.ctx.lineTo(x + cellSize, y);
    } else {
      this.ctx.moveTo(x + cellSize, y);
    }
    if (walls[1]) {
      this.ctx.lineTo(x + cellSize, y + cellSize);
    } else {
      this.ctx.moveTo(x + cellSize, y + cellSize);
    }
    if (walls[2]) {
      this.ctx.lineTo(x, y + cellSize);
    } else {
      this.ctx.moveTo(x, y + cellSize);
    }
    if (walls[3]) {
      this.ctx.lineTo(x, y);
    } else {
      this.ctx.moveTo(x, y);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }

  clearGrid() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  drawGrid() {
    this.ctx.strokeStyle = 'black';
    this.clearGrid();
    for (let i = 0; i < this.grid.length; i += 1) {
      this.drawCell(i);
    }
  }

  refillWalls() {
    for (let i = 0; i < this.grid.length; i += 1) {
      this.drawCell(i);
    }
  }

  distanceBetweenIndexes(index1, index2) {
    const x1 = this.grid[index1].centerX;
    const y1 = this.grid[index1].centerY;
    const x2 = this.grid[index2].centerX;
    const y2 = this.grid[index2].centerY;
    const x = (x2 - x1) * (x2 - x1);
    const y = (y2 - y1) * (y2 - y1);
    return Math.sqrt(x + y);
  }

  drawRoute(route, resolve) {
    let position = 0;
    this.fillCurrent(0, '#01FF70');
    this.drawCell(route[0]);
    const timer = setInterval(() => {
      if (position < route.length) {
        this.fillCurrent(route[position], '#01FF70');
        this.drawCell(route[position]);
        position += 1;
      } else {
        clearInterval(timer);
        this.fillCurrent(this.grid.length - 1, '#01FF70');
        this.drawCell(this.grid.length - 1);
        resolve();
      }
    }, 1000 / 60);
  }

  routeSearch() {
    return new Promise((resolve, reject) => {
      this.grid[0].g = 0; // not in loop;
      const timer = setInterval(() => {
        if (this.openSet.length) {
          this.openSet.sort((a, b) => this.grid[a].f - this.grid[b].f);
          const current = this.openSet[0];
          if (current === this.grid.length - 1) {
            clearInterval(timer);
            const route = [];
            let comingFrom = this.grid[this.grid.length - 1].comingFrom;
            while (comingFrom) {
              route.unshift(comingFrom);
              comingFrom = this.grid[comingFrom].comingFrom;
              this.drawRoute(route, resolve);
            }
          }
          this.closedSet.push(current);
          this.openSet.shift();
          const neighbours = this.grid[current].neighbours;
          neighbours.forEach((item, index) => {
            if (item && !this.closedSet.includes(item) && !this.grid[current].walls[index]) {
              const tentativeG = this.grid[current].g + 1;
              if (this.openSet.includes(item)) {
                if (this.grid[item].g > tentativeG) {
                  this.grid[item].g = tentativeG;
                  this.grid[item].cameFrom = current;
                }
              } else {
                this.openSet.push(item);
                this.grid[item].g = tentativeG;
                this.grid[item].comingFrom = current;
              }
              this.grid[item].f = this.grid[item].h + this.grid[item].g;
            }
          });
        } else {
          clearInterval(timer);
          console.log('no solution found');
        }
      }, 1000 / 1000);
    });
  }
}