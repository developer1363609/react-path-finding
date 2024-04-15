import logo from './logo.svg';
import './App.css';
import {Component} from "react";
import {Agent, SearchGird} from "./lib/Path";


class App extends Component{
  constructor() {
    super(undefined);
    this.grid = new SearchGird(30,20);
    this.grid.grids[4].setProperty({
      "startPosition":true,
    });
    this.grid.grids[232].setProperty({
      "destinationPosition":true,
    });
    this.agent = new Agent(this.grid);
    this.state = {
      grid:this.grid,
      openList: this.agent.openList,
      closedList:this.agent.closedList,
      paths:this.agent.paths,
      currentGrid:this.agent.currentGrid
    }
    this.mouseAction = null;
    this.autoRun = false;
  }

  nextMove() {
    this.agent.step();
    this.setState({
      openList:this.agent.openList,
      closedList:this.agent.closedList,
      paths:this.agent.paths,
      currentGrid:this.agent.currentGrid
    });
  }

  run() {
    this.agent.run();
    this.setState({
      openList:this.agent.openList,
      closedList:this.agent.closedList,
      paths:this.agent.paths,
      currentGrid:this.agent.currentGrid
    });
  }

  reset() {
    this.agent.reset();
    this.setState({
      openList:this.agent.openList,
      closedList:this.agent.closedList,
      paths:this.agent.paths,
      currentGrid:this.agent.currentGrid,
      grid:this.grid
    });

    if (this.autoRun) {
      this.run();
    }
  }

  mouseEvent(gridIndex,evt){
    if (evt.type === "mouseup") {
      this.mouseAction = null;
      this.grid.grids[gridIndex].removeProperty(["active"]);
      this.setState({
        grid:this.grid
      });
      return;
    }
    if (evt.buttons !== 1 && evt.type !== "click") {
      this.mouseAction = null;
      return;
    }

    if (this.mouseAction == null) {
      if (this.grid.grids[gridIndex].getProperty("startPosition")) {
        this.mouseAction = function (gridIndex) {
          this.grid.removeAll("startPosition");
          this.grid.grids[gridIndex].setProperty({
            "startPosition":true
          });
        }
      } else if (this.grid.grids[gridIndex].getProperty("destinationPosition")){
        this.mouseAction = function (gridIndex) {
          this.grid.grids[gridIndex].removeProperty(["wall"]);
        }
      } else if (this.grid.grids[gridIndex].getProperty("wall")) {
        this.mouseAction = function (gridIndex) {
          this.grid.grids[gridIndex].removeProperty(["gridIndex"]);
        }
      } else {
        this.mouseAction = function (gridIndex) {
          this.grid.grids[gridIndex].setProperty({
            "wall":true
          });
        }
      }
    }
    this.grid.grids[gridIndex].setProperty({
      "active":true
    });
    this.mouseAction(gridIndex);
    this.reset();
  }

  gridStyles(gridIndex) {
    let gridStyles = [];
    if (this.state.currentGrid === gridIndex) {
      gridStyles.push("current");
    }
    if (this.state.paths.indexOf(gridIndex) >= 0) {
      gridStyles.push("paths");
    }
    if (this.state.closedList.indexOf(gridIndex) >= 0) {
      gridStyles.push("closedList");
    }
    if (this.state.openList.indexOf(gridIndex) >= 0) {
      gridStyles.push("openList");
    }
    if (this.state.grid.grids[gridIndex].getProperty("wall")) {
      gridStyles.push("wall");
    }
    gridStyles = gridStyles.concat(Object.keys(this.state.grid.grids[gridIndex].properties));
    return gridStyles;
  }

  autoRunEvent(evt) {
    this.autoRun = evt.target.checked;
    if (this.autoRun) {
      this.run();
    }
  }

  render() {
    let gridSize = 30;
    return (
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <h2>A * star path finding</h2>
          </div>
          <br/>
          <svg className={this.state.mouseAction ? "mouesActive" : ""}
               width={(this.state.grid.width * gridSize) + 1}
               height={(this.state.grid.height * gridSize) + 1}>{
            this.state.grid.grids.map((grid,gridIndex) => {
              let gridStyles = this.gridStyles(gridIndex);
              return(
                  <g key={gridIndex}>
                    onMouseDown = {this.mouseEvent.bind(this,gridIndex)}
                    onMouseOver = {this.mouseEvent.bind(this,gridIndex)}
                    onMouseUp = {this.mouseEvent.bind(this,gridIndex)}
                    <rect x={((gridIndex % this.grid.width) * gridSize + 1)}
                          y={(Math.floor(gridIndex / this.grid.width) * gridSize) + 1}
                          width={gridSize - 1}
                          height={gridSize - 1}
                          className={gridStyles.join(" ")}
                    />
                    {
                      this.agent.gridData[gridIndex] && !gridStyles.some(
                          r => ["startPosition","destinationPosition"].indexOf(r) >= 0) &&
                        <text fontSize={12}
                              x={(gridSize % this.state.grid.width) * gridSize + 6}
                              y={(Math.floor(gridIndex / this.state.grid.width) * gridSize) + 20}>
                          {this.agent.gridData[gridIndex].f}
                        </text>
                    }
                  </g>
              )
            })
          }
          </svg><br/>
          <button onClick={this.run.bind(this)}>Run</button>
          <button onClick={this.nextMove.bind(this)}>Step</button>
          <button onClick={this.reset.bind(this)}>Reset</button>
          <input id="auto-run" type="checkbox" onClick={this.autoRunEvent.bind(this)}/>
          <label htmlFor="auto-run">Run on update ? </label>
          <p>Click to add/remove walls. Drag to move start and goal positions.</p>
        </div>
    );
  }
}

export default App;
