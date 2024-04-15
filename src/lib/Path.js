class Grid{
    constructor(properties = {}) {
        this.properties = properties;
    }

    setProperty(properties = {}) {
        Object.assign(this.properties,properties);
    }

    getProperties(property) {
        return this.properties[property];
    }

    removeProperty(properties = {}) {
        for (let property of properties) {
            delete this.properties[property];
        }
    }
}

export class SearchGird{
    constructor(w,h) {
        this.width = w;
        this.height = h;
        let num_grids = w * h;
        this.grids = Array(num_grids);
        for (let i = 0; i < num_grids; i ++) {
            this.grids[i] = new Grid();
        }
    }

    findGrid(property) {
        for (let i in this.grids) {
            if (this.grids[i].getProperties(property)) {
                return parseInt(i,10);
            }
        }
    }

    removeAll(property) {
        for (let i in this.grids){
            if (this.grids[i].properties[property]) {
                this.grids[i].removeProperty([property]);
            }
        }
    }

    neighbourGrid(grid , direction) {
        let neighbourGrid;
        switch (direction) {
            case "left":
                neighbourGrid = grid - 1;
                if ((neighbourGrid + 1) % this.width === 0) {
                    return null;
                }
                break;
            case "up":
                neighbourGrid = grid - this.width
                break;
            case "right":
                neighbourGrid = grid + 1;
                if ((neighbourGrid % this.width) === 0) {
                    return null;
                }
                break;
            case "down":
                neighbourGrid = grid + this.width;
                break;
            default:
                neighbourGrid = null;
        }

        if (neighbourGrid < 0 || neighbourGrid >= (this.width + this.height)) {
            return null;
        }
        return neighbourGrid;
    }

    distance(original,destination) {
        let distX = Math.abs(Math.floor(original / this.width) - Math.floor(destination / this.width));
        let distY = Math.abs((original % this.width) - (destination % this.width));
        return distX + distY;
    }
}

export class Agent{
    constructor(grid) {
        this.grid = grid;
        this.reset();
    }

    reset() {
        this.currentGrid = null;
        this.destinationGrid = null;
        this.steps = 0;
        this.paths = [];
        this.openList = [];
        this.closedList = [];
        this.gridData = {};
    }

    run() {
        while(this.step());
    }

    init(){
        this.reset();
        this.currentGrid = this.grid.findGrid("startPosition");
        this.destinationGrid = this.grid.findGrid("destinationPosition");
        this.closedList = [this.currentGrid];
        this.gridData = {
            [this.currentGrid]:{
                g:0,
                f:this.grid.distance(this.currentGrid,this.destinationGrid)
            }
        };
    }

    step(){
        this.steps ++;
        if (this.currentGrid == null) {
            this.init();
        }

        if (this.currentGrid === this.destinationGrid) {
            return false;
        }
        this.updateOpenList();

        if (this.openList.length === 0) {
            return false;
        }
        this.makeNextMove();
        return true;
    }

    updateOpenList() {
        let neighbourDirection = ["left","up","right","down"];
        if (this.steps % 2 === 0) {
            neighbourDirection.reverse();
        }

        neighbourDirection.forEach((direction) => {
            let neighbourGrid = this.grid.neighbourGrid(this.currentGrid,direction);
            if (neighbourGrid == null || this.grid.grids[neighbourGrid].getProperties("wall")){
                return ;
            }
            if (this.closedList.indexOf(neighbourGrid) === -1) {
                if (this.openList.indexOf(neighbourGrid) === -1) {
                    this.openList.push(neighbourGrid);
                }

                let neighbourG = this.gridData[this.currentGrid].g + 1;
                let neighbourF = this.grid.distance(neighbourGrid,this.destinationGrid) + neighbourG;
                if (this.gridData[neighbourGrid] === undefined || neighbourG < this.gridData[neighbourGrid].g) {
                    this.gridData[neighbourGrid] = {
                        g:neighbourG,
                        f:neighbourF,
                        from:this.currentGrid
                    }
                }
            }
        });
    }


    makeNextMove() {
        let bestNeighbour = null;
        for (let i = this.openList.length;i >= 0; i --) {
            let openGrid = this.openList[i];
            if (bestNeighbour == null || this.gridData[openGrid].f < this.gridData[bestNeighbour].f) {
                bestNeighbour = openGrid;
            }
        }
        this.currentGrid = bestNeighbour;
        this.closedList.push(this.currentGrid);
        let index = this.openList.indexOf(this.currentGrid);
        this.openList.splice(index,1);
        this.checkForDestination();
    }

    checkForDestination() {
        if (this.currentGrid === this.destinationGrid) {
            let pathGrid = this.currentGrid;
            while (this.gridData[pathGrid].from) {
                pathGrid = this.gridData[pathGrid].from;
                this.paths.push(pathGrid);
            }
        }
    }
}