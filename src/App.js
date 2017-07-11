import React, { Component } from 'react';
import Maze from './logic/Maze';
import './App.css';

class App extends Component {
    constructor() {
    super();
    this.state = {
      canvasWidth: 512,
      canvasHeight: 512,
      cellSize: 16,
      columns: 32,
      rows: 31,
      text: 'Generating maze'
    };
  }

  componentDidMount () {
    this.start();
  }

  async start () {
    const canvas = this.canvas;
    const { canvasWidth, canvasHeight, columns, rows, cellSize } = this.state;
    const canvasContext = canvas.getContext('2d');
    const maze = new Maze(canvasContext, canvasWidth, canvasHeight);
    maze.generateGrid(columns, rows, cellSize);
    await maze.generateMaze()
    this.setState({text: 'Solving maze'});
    await maze.routeSearch();
    this.setState({text: 'Finished!'});
  }

  reset () {
    this.setState({
      text: 'Generating maze'
    });
    this.start();
  }

  render() {
    return (
      <div className="App">
        <h1 className="title">Recursive Backtracker + A* algorithms</h1>
        <div className="canvasWrapper">
          <canvas
            width={this.state.canvasWidth}
            height={this.state.canvasHeight}
            ref={(c) => { this.canvas = c; }}
          />
        </div>
          <h2>{this.state.text}</h2>
          { this.state.text === "Finished!"
          ? <button onClick = {() => this.reset()}>restart</button>
          : null }
      </div>
    );
  }
}

export default App;
