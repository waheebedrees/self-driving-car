const canvas = document.getElementById("gameCanvas");
canvas.width = 300;
canvas.height = 600;
const ctx = canvas.getContext("2d");

const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;
networkCanvas.height = 600;

const networkCtx = networkCanvas.getContext("2d");


const road = new Road(canvas.width / 2, canvas.width * 0.9);

const N = 10; // Number of cars in population
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", getRandomSpeed(), color=getRandomColor()),
];

// Simulation state
let isRunning = false;
let generation = 0;
let startTime = 0;
let bestScore = 0;

// UI elements
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");

// Event listeners
startBtn.addEventListener("click", startSimulation);
pauseBtn.addEventListener("click", pauseSimulation);
resetBtn.addEventListener("click", resetSimulation);
saveBtn.addEventListener("click", save);
loadBtn.addEventListener("click", load);

function generateCars(N) {
    const cars = [];
    for (let i = 0; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function startSimulation() {
    isRunning = true;
    startTime = Date.now();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    saveBtn.disabled = false;
    animate();
}

function pauseSimulation() {
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetSimulation() {
    isRunning = false;
    generation = 0;
    bestScore = 0;
    startTime = 0;
    
    // Reset cars
    for (let i = 0; i < cars.length; i++) {
        cars[i] = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
    }
    bestCar = cars[0];
    
    // Reset traffic
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].y = -100 - i * 200;
        traffic[i].damaged = false;
    }
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    saveBtn.disabled = true;
    
    updateUI();
}

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function load() {
    if (localStorage.getItem("bestBrain")) {
        for (let i = 0; i < cars.length; i++) {
            cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
            if (i != 0) {
                NeuralNetwork.mutate(cars[i].brain, 0.1);
            }
        }
    }
}

function updateUI() {
    document.getElementById("generation").textContent = generation;
    document.getElementById("bestScore").textContent = Math.floor(bestScore);
    document.getElementById("carsAlive").textContent = cars.filter(car => !car.damaged).length;
    
    if (isRunning && startTime > 0) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("time").textContent = elapsed + "s";
    }
}

function nextGeneration() {
    generation++;
    
    // Find best car
    bestCar = cars.find(c => c.fitness == Math.max(...cars.map(c => c.fitness)));
    bestScore = Math.max(bestScore, bestCar.fitness);
    
    // Save best brain
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    
    // Create new generation
    for (let i = 0; i < cars.length; i++) {
        cars[i] = new Car(road.getLaneCenter(1), 100, 30, 50, "AI", );
        cars[i].brain = JSON.parse(JSON.stringify(bestCar.brain));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
    
    // Reset traffic
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].y = -100 - i * 200;
        traffic[i].damaged = false;
    }
    
    startTime = Date.now();
}

function animate() {
    if (!isRunning) return;
    
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    
    bestCar = cars.find(c => c.fitness == Math.max(...cars.map(c => c.fitness)));
    
    // Check if all cars are damaged or time limit reached
    const aliveCars = cars.filter(car => !car.damaged);
    const timeElapsed = (Date.now() - startTime) / 1000;
    
    if (aliveCars.length == 0 || timeElapsed > 30) {
        nextGeneration();
    }
    
    canvas.height = window.innerHeight;
    
    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * 0.7);
    
    road.draw(ctx);
    networkCanvas.height=window.innerHeight;
    
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx);
    }
    
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    
    bestCar.draw(ctx, true);
    
    ctx.restore();
    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    
    updateUI();
    requestAnimationFrame(animate);
}

// Initialize UI
startSimulation()
updateUI();

