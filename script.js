const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("statusText");

const GRID_SIZE = 6;
const CELL_SIZE = canvas.width / GRID_SIZE;

// Bloklar
let blocks = [
  { id: 1, x: 0, y: 2, w: 2, h: 1, color: "#2196F3", isPlayer: true }, // Mavi Fiqur
  { id: 2, x: 2, y: 0, w: 1, h: 3, color: "#E91E63", isPlayer: false }, // Qırmızı
  { id: 3, x: 3, y: 2, w: 2, h: 1, color: "#FF9800", isPlayer: false }, // Narıncı
  { id: 4, x: 0, y: 4, w: 1, h: 2, color: "#9C27B0", isPlayer: false }  // Bənövşəyi
];

const TARGET_EXIT = { x: 5, y: 2 };

let selectedBlock = null;
let startCellX = 0;
let startCellY = 0;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = "#2a2a35";
  ctx.lineWidth = 2;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvas.width, i * CELL_SIZE);
    ctx.stroke();
  }

  // Çıxış nöqtəsi (Yaşıl)
  ctx.fillStyle = "#00e676";
  ctx.fillRect(TARGET_EXIT.x * CELL_SIZE + 4, TARGET_EXIT.y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
}

function drawBlocks() {
  blocks.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.rect(
      b.x * CELL_SIZE + 4, 
      b.y * CELL_SIZE + 4, 
      b.w * CELL_SIZE - 8, 
      b.h * CELL_SIZE - 8
    );
    ctx.fill();
  });
}

function render() {
  drawGrid();
  drawBlocks();
}

// Mobil və Kompyuter üçün vahid Pointer Hadisələri
canvas.addEventListener("pointerdown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const clickX = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_SIZE);
  const clickY = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_SIZE);

  selectedBlock = blocks.find(b => 
    clickX >= b.x && clickX < b.x + b.w &&
    clickY >= b.y && clickY < b.y + b.h
  );

  if (selectedBlock) {
    startCellX = clickX;
    startCellY = clickY;
    canvas.setPointerCapture(e.pointerId);
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!selectedBlock) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const currentCellX = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_SIZE);
  const currentCellY = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_SIZE);

  const dx = currentCellX - startCellX;
  const dy = currentCellY - startCellY;

  if (dx !== 0 || dy !== 0) {
    moveBlock(selectedBlock, dx, dy);
    startCellX = selectedBlock.x;
    startCellY = selectedBlock.y;
    render();
    checkWin();
  }
});

function releasePointer(e) {
  if (selectedBlock) {
    selectedBlock = null;
    canvas.releasePointerCapture(e.pointerId);
  }
}

canvas.addEventListener("pointerup", releasePointer);
canvas.addEventListener("pointercancel", releasePointer);

function moveBlock(block, dx, dy) {
  // Üfüqi fiqurlar yalnız üfüqi, şaquli fiqurlar yalnız şaquli sürüşür
  if (block.w > block.h && dx !== 0) {
    const step = Math.sign(dx);
    const newX = block.x + step;
    if (newX >= 0 && newX + block.w <= GRID_SIZE && !isColliding(block, newX, block.y)) {
      block.x = newX;
    }
  } else if (block.h > block.w && dy !== 0) {
    const step = Math.sign(dy);
    const newY = block.y + step;
    if (newY >= 0 && newY + block.h <= GRID_SIZE && !isColliding(block, block.x, newY)) {
      block.y = newY;
    }
  }
}

function isColliding(current, nextX, nextY) {
  return blocks.some(b => {
    if (b.id === current.id) return false;
    return (
      nextX < b.x + b.w &&
      nextX + current.w > b.x &&
      nextY < b.y + b.h &&
      nextY + current.h > b.y
    );
  });
}

function checkWin() {
  const player = blocks.find(b => b.isPlayer);
  if (player.x + player.w - 1 === TARGET_EXIT.x && player.y === TARGET_EXIT.y) {
    statusText.innerText = "Təbriklər! Mərhələni keçdiniz! 🎉";
  }
}

render();
