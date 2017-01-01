var canvas;
var ctx;
var cellSize = 10;
var spacer = 1;
var animate = false;
var GameAction;
(function (GameAction) {
    GameAction[GameAction["DIE"] = 0] = "DIE";
    GameAction[GameAction["BORN"] = 1] = "BORN";
    GameAction[GameAction["NOTHING"] = 2] = "NOTHING";
})(GameAction || (GameAction = {}));
var RuleSet = (function () {
    function RuleSet() {
        this.rules = new Map();
    }
    RuleSet.prototype.putRule = function (amount, action) {
        this.rules.set(amount, action);
    };
    RuleSet.prototype.getAction = function (amount) {
        if (this.rules.has(amount)) {
            return this.rules.get(amount);
        }
        else {
            return GameAction.NOTHING;
        }
    };
    return RuleSet;
}());
var Cell = (function () {
    function Cell(x, y) {
        this.x = x;
        this.y = y;
    }
    return Cell;
}());
var GameField = (function () {
    function GameField() {
        this.cells = new Map();
    }
    GameField.prototype.getWidth = function () {
        return Math.ceil(canvas.width / cellSize);
    };
    GameField.prototype.getHeight = function () {
        return Math.ceil(canvas.height / cellSize);
    };
    GameField.prototype.keyForCoordinate = function (x, y) {
        return x * 100000 + y;
    };
    GameField.prototype.keyForCell = function (cell) {
        return this.keyForCoordinate(cell.x, cell.y);
    };
    GameField.prototype.createCell = function (cell) {
        this.cells.set(this.keyForCell(cell), cell);
    };
    GameField.prototype.destroyCell = function (cell) {
        this.cells["delete"](this.keyForCell(cell));
    };
    GameField.prototype.isCellAt = function (x, y) {
        return this.cells.has(this.keyForCoordinate(x, y));
    };
    GameField.prototype.getCellAt = function (x, y) {
        return this.cells.get(this.keyForCoordinate(x, y));
    };
    GameField.prototype.countNeighbours = function (cell) {
        var result = 0;
        if (this.isCellAt(cell.x, cell.y)) {
            // Start with -1 as we are counting the cell itself
            result--;
        }
        for (var x = cell.x - 1; x <= cell.x + 1; x++) {
            for (var y = cell.y - 1; y <= cell.y + 1; y++) {
                if (this.isCellAt(x, y)) {
                    result++;
                }
            }
        }
        return result;
    };
    GameField.prototype.clear = function () {
        this.cells.clear();
    };
    return GameField;
}());
var List = (function () {
    function List() {
        this.items = [];
    }
    List.prototype.size = function () {
        return this.items.length;
    };
    List.prototype.add = function (value) {
        this.items.push(value);
    };
    List.prototype.get = function (index) {
        return this.items[index];
    };
    return List;
}());
var GameEngine = (function () {
    function GameEngine(field, ruleSetForAlive, ruleSetForDead) {
        this.generation = 0;
        this.field = field;
        this.ruleSetForDead = ruleSetForDead;
        this.ruleSetForAlive = ruleSetForAlive;
    }
    GameEngine.prototype.nextGeneration = function () {
        var toBeCreated = new List();
        var toBeDeleted = new List();
        for (var x = 0; x < this.field.getWidth(); x++) {
            for (var y = 0; y < this.field.getHeight(); y++) {
                var cell = void 0;
                var ruleSet = void 0;
                var cellExists = this.field.isCellAt(x, y);
                if (cellExists) {
                    cell = this.field.getCellAt(x, y);
                    ruleSet = this.ruleSetForAlive;
                }
                else {
                    cell = new Cell(x, y);
                    ruleSet = this.ruleSetForDead;
                }
                var neighbours = this.field.countNeighbours(cell);
                var action = ruleSet.getAction(neighbours);
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
        for (var _i = 0, _a = toBeDeleted.items; _i < _a.length; _i++) {
            var cell = _a[_i];
            this.field.destroyCell(cell);
        }
        for (var _b = 0, _c = toBeCreated.items; _b < _c.length; _b++) {
            var cell = _c[_b];
            this.field.createCell(cell);
        }
    };
    GameEngine.prototype.clear = function () {
        this.field.clear();
        this.generation = 0;
    };
    return GameEngine;
}());
var GameFieldRenderer = (function () {
    function GameFieldRenderer(field) {
        this.field = field;
    }
    GameFieldRenderer.prototype.draw = function (ctx) {
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
    };
    return GameFieldRenderer;
}());
function createConwyWorld(rsa, rsd) {
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
function createCopyWorld(rsa, rsd) {
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
function createGospersGliderGun(field) {
    var data = [
        8, 8, 43, 6, 30, 8, 43, 5, 9, 8, 22, 8, 30, 4, 23, 10,
        21, 5, 8, 7, 19, 6, 20, 11, 21, 11, 42, 6, 42, 5, 9, 7,
        20, 5, 32, 9, 32, 8, 24, 7, 32, 4, 24, 8, 24, 9, 28, 6,
        28, 7, 32, 3, 25, 8, 28, 5, 18, 9, 18, 8, 23, 6, 19, 10,
        18, 7, 29, 5, 29, 7, 29, 6
    ];
    field.clear();
    for (var i = 0; i < data.length; i += 2) {
        var x = data[i];
        var y = data[i + 1];
        field.createCell(new Cell(x, y));
    }
}
var rsa = new RuleSet();
var rsd = new RuleSet();
createConwyWorld(rsa, rsd);
var engine = new GameEngine(new GameField(), rsa, rsd);
var renderer = new GameFieldRenderer(engine.field);
createGospersGliderGun(engine.field);
function gameLoop() {
    requestAnimationFrame(gameLoop);
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();
    renderer.draw(ctx);
    if (animate) {
        engine.nextGeneration();
    }
}
function mouseDown(event) {
    var x = event.x;
    var y = event.y;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    var cellX = Math.floor(x / (cellSize + spacer));
    var cellY = Math.floor(y / (cellSize + spacer));
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
    for (var i = 0; i < 5; i++) {
        engine.nextGeneration();
    }
}
function zoomIn() {
    cellSize += 2;
    cellSize = Math.min(50, cellSize);
}
function zoomOut() {
    cellSize -= 2;
    cellSize = Math.max(2, cellSize);
}
function startAnimation() {
    animate = true;
}
function stopAnimation() {
    animate = false;
}
window.onload = function () {
    canvas = document.getElementById('cnvs');
    ctx = canvas.getContext("2d");
    gameLoop();
    canvas.addEventListener("mousedown", mouseDown, false);
    resizeCanvas();
};
// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.width = window.innerWidth - 15;
}
