const { 
    Engine, 
    Render, 
    Runner, 
    World, 
    Bodies,
    Body,
    Events 
 } = Matter;

const cellsHorizontal = 7;
const cellsVertical = 4;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLenghtX = width / cellsHorizontal;
const unitLenghtY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//walls

const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic:true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic:true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic:true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic:true })
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

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false)) 

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    //se eu ja visitei uma posição, então return
    if (grid[row][column]) {
        return;
    }

    //marque essa posição como visitada
    grid[row][column] = true;

    //ir para o proximo vizinho de forma aleatoria
    const neighbors = shuffle([
        [row -1, column, 'up'], //vizinho de cima
        [row, column + 1, 'right'], //vizinho da direita
        [row + 1, column, 'down'], //vizinho de baixo
        [row, column - 1, 'left'] //vizinho da esquerda
    ]);

    //para cada vizinho
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        //ver se o vizinho esta fora do tabuleiro
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
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

        stepThroughCell(nextRow, nextColumn);

    }

    //visite a proxima posição
    

};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open === true) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX / 2,
            rowIndex * unitLenghtY + unitLenghtY,
            unitLenghtX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world,wall);
    });
});

verticals.forEach((row, rowIndex) =>{
    row.forEach((open, columnIndex) =>{
        if(open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLenghtX + unitLenghtX,
            rowIndex * unitLenghtY + unitLenghtY / 2,
            5,
            unitLenghtY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall);
    });
});

// Goal
const goal = Bodies.rectangle(
    width - unitLenghtX / 2,
    height - unitLenghtY / 2,
    unitLenghtX * 0.7,
    unitLenghtY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }        
    }
);
World.add(world, goal);

// Ball
ballRadius = Math.min(unitLenghtX, unitLenghtY) / 4;
const ball = Bodies.circle(
    unitLenghtX / 2,
    unitLenghtY / 2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'yellow'
        }
    }
);
World.add(world, ball);

document.addEventListener('keydown', event =>{
    const {x, y} = ball.velocity;

    if (event.key === 'w') {
        Body.setVelocity(ball, {x, y: y-5});
    }
    if (event.key === 'd') {
        Body.setVelocity(ball, {x: x+5, y});
    }
    if (event.key === 's') {
        Body.setVelocity(ball, {x, y: y+5});
    }
    if (event.key === 'a') {
        Body.setVelocity(ball, {x: x-5, y});
    }
});

// Win Condition

Events.on(engine, 'collisionStart', event =>{
    event.pairs.forEach(collision => {
        const labels = ['ball','goal'];

        if ( labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label) ) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if ( body.label === 'wall' ) {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});