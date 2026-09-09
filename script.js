const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 3;
const TILE_WIDTH = 80;
const TILE_HEIGHT = 40;
const ORIGIN_X = canvas.width / 2;
const ORIGIN_Y = 120;

// Blok tipləri və bucaqları (0: Düz yol, 1: Döngə)
let grid = [
  [{ type: 1, rotation: 0 }, { type: 0, rotation: 1 }, { type: 1, rotation: 1 }],
  [{ type: 0, rotation: 0 }, { type: 1, rotation: 3 }, { type: 0, rotation: 0 }],
  [{ type: 1, rotation: 2 }, { type: 0, rotation: 1 }, { type: 1, rotation: 0 }]
];

// 2D koordinatı Izometrik (3D) koordinata çevirən funksiya
function toIso(x, y) {
  return {
    isoX: ORIGIN_X + (x - y) * (TILE_WIDTH / 2),
    isoY: ORIGIN_Y + (x + y) * (TILE_HEIGHT / 2)
  };
}

function drawTile(x, y, tile) {
  const { isoX, isoY } = toIso(x, y);

  // Kubun Üst Üzü (Lövhə)
  ctx.beginPath();
  ctx.moveTo(isoX, isoY);
  ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
  ctx.lineTo(isoX, isoY + TILE_HEIGHT);
  ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
  ctx.closePath();
  ctx.fillStyle = "#334155";
  ctx.fill();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Kubun Yan Üzləri (3D Həcm Effekti)
  ctx.beginPath();
  ctx.moveTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
  ctx.lineTo(isoX, isoY + TILE_HEIGHT);
  ctx.lineTo(isoX, isoY + TILE_HEIGHT + 20);
  ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2 + 20);
  ctx.closePath();
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(isoX, isoY + TILE_HEIGHT);
  ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
  ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2 + 20);
  ctx.lineTo(isoX, isoY + TILE_HEIGHT + 20);
  ctx.closePath();
  ctx.fillStyle = "#0f172a";
  ctx.fill();

  // Blokun üzərindəki Yolu Çəkmək
  ctx.save();
  ctx.translate(isoX, isoY + TILE_HEIGHT / 2);
  ctx.rotate((tile.rotation * 90 * Math.PI) / 180);

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 8;
  ctx.beginPath();
  if (tile.type === 0) {
    // Düz Yol
    ctx.moveTo(-TILE_WIDTH / 4, 0);
    ctx.lineTo(TILE_WIDTH / 4, 0);
  } else {
    // Döngə Yol
    ctx.moveTo(-TILE_WIDTH / 4, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, TILE_HEIGHT / 2);
  }
  ctx.stroke();
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      drawTile(c, r, grid[r][c]);
    }
  }
}

// Blokun üzərinə vuranda dönməsi
canvas.addEventListener("pointerdown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const { isoX, isoY } = toIso(c, r);
      const dist = Math.hypot(clickX - isoX, clickY - (isoY + TILE_HEIGHT / 2));
      if (dist < TILE_WIDTH / 3) {
        grid[r][c].rotation = (grid[r][c].rotation + 1) % 4;
        render();
        return;
      }
    }
  }
});

render();
