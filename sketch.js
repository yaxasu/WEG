// Configuration variables
const tileSize = 50;
const xoff = 80;
const yoff = 100;

// Human playing variables
let humanPlaying = false;
let left = false;
let right = false;
let up = false;
let down = false;
let p;

// Arrays
const tiles = [];
const solids = [];
const dots = [];
const savedDots = [];

let showBest = false;

let winArea; // Solid representing the win zone

// Generation replay variables
let replayGens = false;
let genPlayer;
let upToGenPos = 0;

// Population variables
const numberOfSteps = 10;
let testPopulation;

let winCounter = -1;
let flip = true;

// Population size variables
let populationSize = 500;
let popPara;
let popPlus;
let popMinus;

// Mutation rate variables
let mutationRate = 0.01;
let mrPara;
let mrPlus;
let mrMinus;

// Evolution speed variables
let evolutionSpeed = 1;
let speedPara;
let speedPlus;
let speedMinus;

// Increase moves variables
let increaseMovesBy = 5;
let movesPara;
let movesPlus;
let movesMinus;

let increaseEvery = 5;
let everyPara;
let everyPlus;
let everyMinus;

function setup() {
  createCanvas(1280, 720);
  initializeHTML();
  initializeTiles();
  setLevel1Walls();
  setLevel1Goal();
  setLevel1SafeArea();
  setEdges();
  setSolids();
  p = new Player();
  setDots();
  winArea = new Solid(tiles[17][2], tiles[19][7]);
  testPopulation = new Population(populationSize);

  // Prevent default action for specific keys
  window.addEventListener("keydown", preventDefaultForKeys, false);
}

function draw() {
  background(22, 59, 86);
  drawTiles();
  displayText();

  if (humanPlaying) {
    handleHumanPlaying();
  } else if (replayGens) {
    handleReplayGens();
  } else if (testPopulation.allPlayersDead()) {
    handlePopulationUpdate();
  } else {
    handlePopulationEvolution();
  }
}

function handleHumanPlaying() {
  if ((p.dead && p.fadeCounter <= 0) || p.reachedGoal) {
    if (p.reachedGoal) {
      winCounter = 100;
    }
    p = new Player();
    p.human = true;
    resetDots();
  } else {
    moveAndShowDots();
    p.update();
    p.show();
  }
}

function handleReplayGens() {
  if ((genPlayer.dead && genPlayer.fadeCounter <= 0) || genPlayer.reachedGoal) {
    upToGenPos++;
    if (testPopulation.genPlayers.length <= upToGenPos) {
      upToGenPos = 0;
      replayGens = false;
      loadDots();
    } else {
      genPlayer = testPopulation.genPlayers[upToGenPos].gimmeBaby();
      resetDots();
    }
  } else {
    moveAndShowDots();
    genPlayer.update();
    genPlayer.show();
  }
}

function handlePopulationUpdate() {
  testPopulation.calculateFitness();
  testPopulation.naturalSelection();
  testPopulation.mutateDemBabies();
  resetDots();

  if (testPopulation.gen % increaseEvery === 0) {
    testPopulation.increaseMoves();
  }
}

function handlePopulationEvolution() {
  for (let j = 0; j < evolutionSpeed; j++) {
    dots.forEach(dot => dot.move());
    testPopulation.update();
  }

  dots.forEach(dot => dot.show());
  testPopulation.show();
}

function moveAndShowDots() {
  dots.forEach(dot => {
    dot.move();
    dot.show();
  });
}

function resetDots() {
  dots.forEach(dot => dot.resetDot());
}

function drawTiles() {
  tiles.forEach(row => row.forEach(tile => tile.show()));
  tiles.forEach(row => row.forEach(tile => tile.showEdges()));
}

function loadDots() {
  dots.forEach((dot, i) => {
    dots[i] = savedDots[i].clone();
  });
}

function saveDots() {
  dots.forEach((dot, i) => {
    savedDots[i] = dot.clone();
  });
}

function displayText() {
  fill(255, 255, 255);
  noStroke();

  textSize(20);
  text(" \tPress P to play the game yourself", 450, 220);

  textSize(36);
  if (winCounter > 0) {
    textSize(100);
    stroke(0);
    winCounter--;
    if (winCounter % 10 === 0) {
      flip = !flip;
    }
    textSize(36);
    noStroke();
  }

  if (replayGens) {
    text(`Generation: ${genPlayer.gen}`, 200, 90);
    text(`Number of moves: ${genPlayer.brain.directions.length}`, 700, 90);
  } else if (!humanPlaying) {
    text(`Generation: ${testPopulation.gen}`, 200, 90);
    if (testPopulation.solutionFound) {
      text(`Wins in ${testPopulation.minStep} moves`, 700, 90);
    } else {
      text(`Number of moves: ${testPopulation.players[0].brain.directions.length}`, 700, 90);
    }
  } else {
    text("Enjoy!", 550, 90);
  }
}

function keyPressed() {
  if (humanPlaying) {
    handleHumanKeyPressed();
  }

  if (key === "P") {
    toggleHumanPlaying();
  }
}

function keyReleased() {
  if (humanPlaying) {
    handleHumanKeyReleased();
  }
}

function handleHumanKeyPressed() {
  switch (keyCode) {
    case UP_ARROW:
      up = true;
      break;
    case DOWN_ARROW:
      down = true;
      break;
    case RIGHT_ARROW:
      right = true;
      break;
    case LEFT_ARROW:
      left = true;
      break;
  }
  switch (key) {
    case "W":
      up = true;
      break;
    case "S":
      down = true;
      break;
    case "D":
      right = true;
      break;
    case "A":
      left = true;
      break;
  }
  setPlayerVelocity();
}

function handleHumanKeyReleased() {
  switch (keyCode) {
    case UP_ARROW:
      up = false;
      break;
    case DOWN_ARROW:
      down = false;
      break;
    case RIGHT_ARROW:
      right = false;
      break;
    case LEFT_ARROW:
      left = false;
      break;
  }
  switch (key) {
    case "W":
      up = false;
      break;
    case "S":
      down = false;
      break;
    case "D":
      right = false;
      break;
    case "A":
      left = false;
      break;
  }
  setPlayerVelocity();
}

function setPlayerVelocity() {
  p.vel.y = up ? -1 : down ? 1 : 0;
  p.vel.x = left ? -1 : right ? 1 : 0;
}

function initializeHTML() {
  document.getElementById("popPlus").addEventListener("click", plusPopSize);
  document.getElementById("popMinus").addEventListener("click", minusPopSize);
  document.getElementById("mrPlus").addEventListener("click", plusmr);
  document.getElementById("mrMinus").addEventListener("click", minusmr);
  document.getElementById("speedPlus").addEventListener("click", plusSpeed);
  document.getElementById("speedMinus").addEventListener("click", minusSpeed);
  document.getElementById("movesPlus").addEventListener("click", plusMoves);
  document.getElementById("movesMinus").addEventListener("click", minusMoves);
  document.getElementById("everyPlus").addEventListener("click", plusEvery);
  document.getElementById("everyMinus").addEventListener("click", minusEvery);
}

function minusPopSize() {
  if (populationSize > 100) {
    populationSize -= 100;
    document.getElementById("popPara").textContent = `Population Size: ${populationSize}`;
  }
}

function plusPopSize() {
  if (populationSize < 10000) {
    populationSize += 100;
    document.getElementById("popPara").textContent = `Population Size: ${populationSize}`;
  }
}

function minusmr() {
  if (mutationRate > 0.0001) {
    mutationRate /= 2.0;
    document.getElementById("mrPara").textContent = `Mutation Rate: ${mutationRate}`;
  }
}

function plusmr() {
  if (mutationRate <= 0.5) {
    mutationRate *= 2.0;
    document.getElementById("mrPara").textContent = `Mutation Rate: ${mutationRate}`;
  }
}

function minusSpeed() {
  if (evolutionSpeed > 1) {
    evolutionSpeed -= 1;
    document.getElementById("speedPara").textContent = `Evolution Player Speed: ${evolutionSpeed}`;
  }
}

function plusSpeed() {
  if (evolutionSpeed <= 5) {
    evolutionSpeed += 1;
    document.getElementById("speedPara").textContent = `Evolution Player Speed: ${evolutionSpeed}`;
  }
}

function minusMoves() {
  if (increaseMovesBy >= 1) {
    increaseMovesBy -= 1;
    updateMovesText();
  }
}

function plusMoves() {
  if (increaseMovesBy <= 500) {
    increaseMovesBy += 1;
    updateMovesText();
  }
}

function minusEvery() {
  if (increaseEvery > 1) {
    increaseEvery -= 1;
    updateMovesText();
  }
}

function plusEvery() {
  if (increaseEvery <= 100) {
    increaseEvery += 1;
    updateMovesText();
  }
}

function updateMovesText() {
  document.getElementById("movesPara").textContent = `Increase moves by: ${increaseMovesBy}`;
  document.getElementById("everyPara").textContent = `Increase every ${increaseEvery} generations`;
  document.querySelector("h3").textContent = `Increase number of player moves by ${increaseMovesBy} every ${increaseEvery} generations`;
}

function preventDefaultForKeys(e) {
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
}

function toggleHumanPlaying() {
  if (humanPlaying) {
    humanPlaying = false;
    loadDots();
  } else {
    if (replayGens) {
      upToGenPos = 0;
      replayGens = false;
    }
    humanPlaying = true;
    p = new Player();
    p.human = true;
    saveDots();
    resetDots();
  }
}

function initializeTiles() {
  for (let i = 0; i < 22; i++) {
    tiles[i] = [];
    for (let j = 0; j < 10; j++) {
      tiles[i][j] = new Tile(i, j);
    }
  }
}
