var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;
var generation: HTMLElement;

var cellSize = 10;
let spacer = 1;
var animate = false;

enum GameAction {
    DIE,
    BORN,
    NOTHING
}

class RuleSet {
    private rules : Map<number, GameAction> = new Map();

    putRule(amount: number, action: GameAction) {
        this.rules.set(amount, action);
    }

    getAction(amount: number) {
        if (this.rules.has(amount)) {
            return this.rules.get(amount);
        }
        else {
            return GameAction.NOTHING;
        }
    }
}

class Cell {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class GameField {
    cells : Map<number, Cell> = new Map();

    getWidth() {
        return Math.ceil(canvas.width / cellSize);
    }

    getHeight() {
        return Math.ceil(canvas.height / cellSize);
    }

    keyForCoordinate(x: number, y: number) {
        return x * 100000 + y;
    }

    keyForCell(cell: Cell) {
        return this.keyForCoordinate(cell.x, cell.y);
    }

    createCell(cell: Cell) {
        this.cells.set(this.keyForCell(cell), cell);
    }

    destroyCell(cell: Cell) {
        this.cells.delete(this.keyForCell(cell));
    }

    isCellAt(x: number, y: number) {
        return this.cells.has(this.keyForCoordinate(x, y));
    }

    getCellAt(x: number, y: number) {
        return this.cells.get(this.keyForCoordinate(x, y));
    }

    countNeighbours(cell: Cell) {
        var result: number = 0;

		if (this.isCellAt(cell.x, cell.y)) {
			// Start with -1 as we are counting the cell itself
			result--;
		}

		for (var x: number = cell.x - 1; x <= cell.x + 1; x++) {
			for (var y: number = cell.y - 1; y <= cell.y + 1; y++) {
				if (this.isCellAt(x, y)) {
					result++;
				}
			}	
		}

        return result;
    }

    clear() {
        this.cells.clear();
    }
}

class List<T> {
    items: Array<T>;

    constructor() {
        this.items = [];
    }

    size(): number {
        return this.items.length;
    }

    add(value: T): void {
        this.items.push(value);
    }

    get(index: number): T {
        return this.items[index];
    }
}

class GameEngine {
    field: GameField;
    ruleSetForDead: RuleSet;
    ruleSetForAlive: RuleSet;
    generation: number = 0;

    constructor(field: GameField, ruleSetForAlive: RuleSet, ruleSetForDead: RuleSet) {
        this.field = field;
        this.ruleSetForDead = ruleSetForDead;
        this.ruleSetForAlive = ruleSetForAlive;
    }

    nextGeneration() {
        let toBeCreated: List<Cell> = new List<Cell>();
        let toBeDeleted: List<Cell> = new List<Cell>();

        for (var x = 0; x < this.field.getWidth(); x++) {
            for (var y = 0; y < this.field.getHeight(); y++) {
                let cell: Cell;
                let ruleSet: RuleSet;
                let cellExists = this.field.isCellAt(x, y);

                if (cellExists) {
                    cell = this.field.getCellAt(x, y);
                    ruleSet = this.ruleSetForAlive;
                }
                else {
                    cell = new Cell(x, y);
                    ruleSet = this.ruleSetForDead;
                }

                let neighbours = this.field.countNeighbours(cell);
                let action = ruleSet.getAction(neighbours);

                switch (action) {
                    case GameAction.DIE:
                        if (cellExists) {
                            toBeDeleted.add(cell);
                        }
                        break;
                    case GameAction.BORN:
                        toBeCreated.add(cell);
                        break;
                    default:
                        break;
                }
            }
        }

        for (let cell of toBeDeleted.items) {
            this.field.destroyCell(cell);
        }
        for (let cell of toBeCreated.items) {
            this.field.createCell(cell);
        }

        this.generation++;
        this.updateGeneration();
    }

    clear() {
        this.field.clear();
        this.generation = 0;
        this.updateGeneration();
    }

    updateGeneration() {
        generation.innerText = "Generation: " + this.generation;
    }
}

class GameFieldRenderer {

    field: GameField;

    constructor(field: GameField) {
        this.field = field;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        for (var x = 0; x < this.field.getWidth(); x++) {
            for (var y = 0; y < this.field.getHeight(); y++) {
                if (this.field.isCellAt(x, y)) {
                    ctx.fillStyle = "blue";
                    ctx.beginPath();
                    ctx.fillRect(x * (cellSize + spacer), y * (cellSize + spacer), cellSize, cellSize);
                    ctx.closePath();
                }
            }
        }

        ctx.restore();
    }
}

function createConwyWorld(rsa: RuleSet, rsd: RuleSet) {
    rsa.putRule(0, GameAction.DIE);
    rsa.putRule(1, GameAction.DIE);

    rsa.putRule(2, GameAction.NOTHING);
    rsa.putRule(3, GameAction.NOTHING);

    rsa.putRule(4, GameAction.DIE);
    rsa.putRule(5, GameAction.DIE);
    rsa.putRule(6, GameAction.DIE);
    rsa.putRule(7, GameAction.DIE);
    rsa.putRule(8, GameAction.DIE);

    rsd.putRule(3, GameAction.BORN);
}

function createCopyWorld(rsa: RuleSet, rsd: RuleSet) {
    rsa.putRule(0, GameAction.DIE);
    rsa.putRule(2, GameAction.DIE);
    rsa.putRule(4, GameAction.DIE);
    rsa.putRule(6, GameAction.DIE);
    rsa.putRule(8, GameAction.DIE);

    rsd.putRule(1, GameAction.BORN);
    rsd.putRule(3, GameAction.BORN);
    rsd.putRule(5, GameAction.BORN);
    rsd.putRule(7, GameAction.BORN);
}

function createGospersGliderGun(field: GameField) {
    var data: number[] = [
            8,8, 43,6, 30,8, 43,5, 9,8, 22,8, 30,4, 23,10,
            21,5, 8,7, 19,6, 20,11, 21,11, 42,6, 42,5, 9,7,
            20,5, 32,9, 32,8, 24,7, 32,4, 24,8, 24,9, 28,6,
            28,7, 32,3, 25,8, 28,5, 18,9, 18,8, 23,6, 19,10,
            18,7, 29,5, 29,7, 29,6
        ];
    
    applyData(data, field);
}

function _createBat(field: GameField) {
        var data: number[] = [
            21,26, 21,25, 21,24, 23,24, 23,25, 23,26, 22,27
        ];
    
    applyData(data, field);
}

function _createSpaceship(field: GameField) {
        var data: number[] = [
            2,3, 3,3, 4,3, 5,3, 1,4, 1,6, 5,4, 5,5, 4,6, 1,12, 
            2,11, 3,11, 4,11, 5,11, 6,11, 6,12, 6,13, 5,14, 
            1,14, 3,15, 1,22, 2,21, 3,21, 4,21, 5,21, 6,21, 
            7,21, 7,22, 7,23, 6,24, 4,25, 3,25, 1,24
        ];
    
    applyData(data, field);
}

function applyData(data: number[], field: GameField) {
    field.clear();

    for (let i: number = 0; i < data.length; i+=2) {
        let x = data[i];
        let y = data[i + 1];

        field.createCell(new Cell(x, y));
    }
}


let rsa: RuleSet = new RuleSet();
let rsd: RuleSet = new RuleSet();

createConwyWorld(rsa, rsd);
let engine: GameEngine = new GameEngine(new GameField(), rsa, rsd);
let renderer: GameFieldRenderer = new GameFieldRenderer(engine.field);

createGospersGliderGun(engine.field);

function gameLoop(): void {
    requestAnimationFrame(gameLoop);

    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();

    renderer.draw(ctx);

    if (animate) {
        engine.nextGeneration();
    }
}

function mouseDown(event: MouseEvent): void {
    var x: number = event.x;
    var y: number = event.y;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    let cellX = Math.floor(x / (cellSize + spacer));
    let cellY = Math.floor(y / (cellSize + spacer));

    if (engine.field.isCellAt(cellX, cellY)) {
        engine.field.destroyCell(engine.field.getCellAt(cellX, cellY));
    }
    else {
        engine.field.createCell(new Cell(cellX, cellY));
    }
}

function nextGeneration() {
     animate = false;
    engine.nextGeneration();
}

function nextGeneration5() {
    animate = false;
    for (let i: number = 0; i < 5; i++) {
        engine.nextGeneration();
    }
}

function createGliderGun() {
    engine.clear();
    createGospersGliderGun(engine.field);
}

function createBat() {
    engine.clear();
    _createBat(engine.field);
}

function createSpaceship() {
    engine.clear();
    _createSpaceship(engine.field);
}

function clearField() {
    engine.clear();
}

function zoomIn() {
    cellSize += 2;
    cellSize = Math.min(50, cellSize);
}

function zoomOut() {
    cellSize -= 2;
    cellSize = Math.max(2, cellSize);
}

function toggleAnimation() {
    animate = !animate;
    updatePlayImage();
}

function dump() {
    var result = "";
    engine.field.cells.forEach(cell => {
        result += cell.x + "," + cell.y + ", ";
    });

    generation.innerText = result;
}

function updatePlayImage() {
    var play = <HTMLImageElement>document.getElementById('playimage');
    if (animate) {
        play.src = "stop.png";
    }
    else {
        play.src = "play.png";
    }
}

window.onload = () => {
    canvas = <HTMLCanvasElement>document.getElementById('cnvs');
    ctx = canvas.getContext("2d");

    generation = document.getElementById('generation');

    updatePlayImage();

    engine.updateGeneration();
    gameLoop();

    canvas.addEventListener("mousedown", mouseDown, false);
    resizeCanvas();
};

// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
       canvas.width = window.innerWidth - 15;
}

