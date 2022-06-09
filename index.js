const { 
    Engine, 
    Render, 
    Runner, 
    World, 
    Bodies, 
 } = Matter;

const cells = 3;
const width = 600;
const height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: true
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 40, { isStatic:true }),
    Bodies.rectangle(width / 2, height, width, 40, { isStatic:true }),
    Bodies.rectangle(0, height / 2, 40, height, { isStatic:true }),
    Bodies.rectangle(width, height / 2, 40, height, { isStatic:true })
];
World.add(world,walls);

//maze generation

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter --;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    } 

    return arr;

};

//forma menos eficiente de preencher um array
//const grid = [];
//for (let i = 0; i < 3; i++) {
//    grid.push([]);
//    for (let j = 0; j < 3; j++) {
//        grid[i].push(false);
//    }
//}

//const grid = Array(3)
//    .fill(null)
//    .map(() => Array(3).fill(false)) 
//
//const verticals = Array(3)
//    .fill(null)
//    .map(() => Array(2).fill(false));
//
//const horizontals = Array(2)
//    .fill(null)
//    .map(() => Array(3).fill(false));

const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false)) 

const verticals = Array(cells).fill(null).map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
    .fill(null)
    .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    //se eu ja visitei uma posição, então return
    if (grid[row][column]) {
        return;
    }

    //marque essa posição como visitada
    grid[row][column] = true;

    //ir para o proximo vizinho de forma aleatoria
    const neighbors = shuffle([
        //[row -1, column, 'up'], //vizinho de cima
        //[row, column + 1, 'right'], //vizinho da direita
        [row + 1, column, 'down'], //vizinho de baixo
        //[row, column - 1, 'left'] //vizinho da esquerda
    ]);

    //para cada vizinho
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        //ver se o vizinho esta fora do tabuleiro
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
            continue; //pula o resto do conteudo de for e avança para a proxima interação
        }

        //se o vizinho ja foi visitado, avança para o proximo vizinho
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        //remove uma parede horizontal ou vertical
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

    }

    //visite a proxima posição

};

stepThroughCell(1, 1);