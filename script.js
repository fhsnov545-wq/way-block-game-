const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("statusText");

const GRID_SIZE = 6;
const CELL_SIZE = canvas.width / GRID_SIZE;

// Fiqurların ilkin mövqeləri və ölçüləri (x, y, en, uzunluq, rəng, hədəf olub-olmaması)
let blocks = [
  { id: 1, x: 0, y: 2, w: 2, h: 1, color: "#2196F3", isPlayer: true }, // Əsas Mavi Fiqur
  { id: 2, x: 2, y: 0, w: 1, h: 3, color: "#E91E63", isPlayer: false }, // Qırmızı Engel (Şaquli)
  { id: 3, x: 3, y: 2, w: 2, h: 1, color: "#FF9800", isPlayer: false }, // Narıncı Engel (Üfüqi)
  { id: 4, x: 0, y: 4, w: 1, h: 2, color: "#9C27B0", isPlayer: false }  // Bənövşəyi Engel (Şaquli)
];

const TARGET_EXIT = { x: 5, y: 2 }; // Çıxış nöqtəsi (Sağ tərəf)

let selectedBlock = null;
let startX = 0;
let startY = 0;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Şəbəkə xətlərini çəkmək
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

  // Çıxış qapısını çəkmək
  ctx.fillStyle = "rgba(0, 230, 118, 0.3)";
  ctx.fillRect(TARGET_EXIT.x * CELL_SIZE, TARGET_EXIT.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawBlocks() {
  blocks.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(
      b.x * CELL_SIZE + 4, 
      b.y * CELL_SIZE + 4, 
      b.w * CELL_SIZE - 8, 
      b.h * CELL_SIZE - 8, 
      8
    );
    ctx.fill();
  });
}

function render() {
  drawGrid();
  drawBlocks();
}

// Sichan və toxunma hadisələrinin idarə olunması
canvas.addEventListener("mousedown", handleStart);
canvas.addEventListener("touchstart", handleStart, { passive: false });

function handleStart(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const clickX = Math.floor((clientX - rect.left) / CELL_SIZE);
  const clickY = Math.floor((clientY - rect.top) / CELL_SIZE);

  selectedBlock = blocks.find(b => 
    clickX >= b.x && clickX < b.x + b.w &&
    clickY >= b.y && clickY < b.y + b.h
  );

  if (selectedBlock) {
    startX = clickX;
    startY = clickY;
  }
}

canvas.addEventListener("mousemove", handleMove);
canvas.addEventListener("touchmove", handleMove, { passive: false });

function handleMove(e) {
  if (!selectedBlock) return;
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const currentX = Math.floor((clientX - rect.left) / CELL_SIZE);
  const currentY = Math.floor((clientY - rect.top) / CELL_SIZE);

  const dx = currentX - startX;
  const dy = currentY - startY;

  if (dx !== 0 || dy !== 0) {
    moveBlock(selectedBlock, dx, dy);
    startX = currentX;
    startY = currentY;
    render();
    checkWin();
  }
}

window.addEventListener("mouseup", () => selectedBlock = null);
window.addEventListener("touchend", () => selectedBlock = null);

function moveBlock(block, dx, dy) {
  // Üfüqi fiqurlar ancaq üfüqi, şaquli fiqurlar ancaq şaquli hərəkət edir
  if (block.w > block.h && dx !== 0) {
    const newX = block.x + Math.sign(dx);
    if (newX >= 0 && newX + block.w <= GRID_SIZE && !isColliding(block, newX, block.y)) {
      block.x = newX;
    }
  } else if (block.h > block.w && dy !== 0) {
    const newY = block.y + Math.sign(dy);
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
