// ────────────────────────────────────────────────────────────────
//  setting_level.js — Fresh handcrafted maze (22 × 10)
//  v4 2025‑06‑16
//  ▸ FIX: Perimeter outline now renders — edge indices match original (1=south,2=east,3=north,4=west).
//  ▸ No interior outlines; patrol corridor unchanged.
// ────────────────────────────────────────────────────────────────

const MAP_ROWS = 22;
const MAP_COLS = 10;
const MAZE_SEED = 42;

/* --------------------------------------------------------------
 *  Maze generation  (recursive back‑tracker on a 2× grid)
 * ----------------------------------------------------------- */
function setLevel1Walls() {
  // 1) start with everything walled in
  for (let x = 0; x < MAP_ROWS; x++) {
    for (let y = 0; y < MAP_COLS; y++) {
      tiles[x][y].wall = true;
      tiles[x][y].edges.length = 0;
    }
  }

  // 2) carve out odd‑odd cells as passages
  const cellW = Math.floor((MAP_ROWS - 1) / 2);
  const cellH = Math.floor((MAP_COLS - 1) / 2);

  const visited = Array.from({ length: cellW }, () => Array(cellH).fill(false));
  const stack = [];

  function tileOfCell(cx, cy) {
    return { x: 1 + cx * 2, y: 1 + cy * 2 };
  }
  function neighbors(cx, cy) {
    const n = [];
    if (cx > 0) n.push([-1, 0]);
    if (cx < cellW - 1) n.push([1, 0]);
    if (cy > 0) n.push([0, -1]);
    if (cy < cellH - 1) n.push([0, 1]);
    n.sort(() => (pseudoRand() < 0.5 ? -1 : 1)); // deterministic shuffle
    return n;
  }

  // deterministic pseudo‑random (LCG)
  let _seed = MAZE_SEED;
  function pseudoRand() {
    _seed = (_seed * 1664525 + 1013904223) >>> 0;
    return _seed / 4294967296;
  }

  // begin at (0,0)
  stack.push([0, 0]);
  visited[0][0] = true;
  tiles[1][1].wall = false;

  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nbrs = neighbors(cx, cy).filter(([dx, dy]) => !visited[cx + dx][cy + dy]);
    if (nbrs.length) {
      const [dx, dy] = nbrs[Math.floor(pseudoRand() * nbrs.length)];
      const nx = cx + dx, ny = cy + dy;
      const t1 = tileOfCell(cx, cy);
      const t2 = tileOfCell(nx, ny);
      const wallX = (t1.x + t2.x) / 2;
      const wallY = (t1.y + t2.y) / 2;
      tiles[t2.x][t2.y].wall = false;
      tiles[wallX][wallY].wall = false;

      visited[nx][ny] = true;
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }

  // carve guarantee areas
  clearArea(2, 2, 4, 7);    // safe zone
  clearArea(17, 2, 19, 7);  // goal zone
  clearCorridor(5, 3, 15, 5);  // patrol corridor wider (5 cols)

  function clearArea(rowStart, colStart, rowEnd, colEnd) {
    for (let x = rowStart; x <= rowEnd; x++) {
      for (let y = colStart; y <= colEnd; y++) {
        tiles[x][y].wall = false;
      }
    }
  }
  function clearCorridor(rowStart, colStart, rowEnd, width = 4) {
    for (let x = rowStart; x <= rowEnd; x++) {
      for (let y = colStart; y < colStart + width; y++) {
        tiles[x][y].wall = false;
      }
    }
  }
}

/* --------------------------------------------------------------
 *  Goal & Safe tiles (mark them non‑wall, too)
 * ----------------------------------------------------------- */
function setLevel1Goal() {
  for (let x = 17; x <= 19; x++) {
    for (let y = 2; y <= 7; y++) {
      tiles[x][y].goal = true;
      tiles[x][y].wall = false;
    }
  }
}

function setLevel1SafeArea() {
  for (let x = 2; x <= 4; x++) {
    for (let y = 2; y <= 7; y++) {
      tiles[x][y].safe = true;
      tiles[x][y].wall = false;
    }
  }
}

/* --------------------------------------------------------------
 *  Convert every wall tile into a Solid for collision
 * ----------------------------------------------------------- */
function setSolids() {
  solids.length = 0;
  for (let x = 0; x < MAP_ROWS; x++) {
    for (let y = 0; y < MAP_COLS; y++) {
      if (tiles[x][y].wall) {
        solids.push(new Solid(tiles[x][y], tiles[x][y]));
      }
    }
  }
}

/* --------------------------------------------------------------
 *  Walls → Edges (visual borders)
 *  Draw only the map’s outer rectangle. Edge indices:
 *   1 = south, 2 = east, 3 = north, 4 = west
 * ----------------------------------------------------------- */
function setEdges() {
  for (let x = 0; x < MAP_ROWS; x++) {
    for (let y = 0; y < MAP_COLS; y++) {
      const t = tiles[x][y];
      t.edges.length = 0;            // clear previous data
      if (!t.wall) continue;         // only outline walls

      // south (index 1) – neighbour must be in-bounds and open
      if (x < MAP_ROWS - 1 && !tiles[x + 1][y].wall) t.edges.push(1);

      // east (index 2)
      if (y < MAP_COLS - 1 && !tiles[x][y + 1].wall) t.edges.push(2);

      // north (index 3)
      if (x > 0 && !tiles[x - 1][y].wall) t.edges.push(3);

      // west (index 4)
      if (y > 0 && !tiles[x][y - 1].wall) t.edges.push(4);
    }
  }
}

/* --------------------------------------------------------------
 *  Dots (horizontal patrols through the cleared corridor)
 * ----------------------------------------------------------- */
function setDots() {
  dots.length = 0;
  dots.push(new Dot(tiles[5][3],  tiles[15][3],  1));
  dots.push(new Dot(tiles[5][5],  tiles[15][5],  1));
  dots.push(new Dot(tiles[5][7],  tiles[15][7],  1));

  dots.push(new Dot(tiles[15][4], tiles[5][4], -1));
  dots.push(new Dot(tiles[15][6], tiles[5][6], -1));
}

/* --------------------------------------------------------------
 *  Public initialisation hook for sketch.js
 * ----------------------------------------------------------- */
function buildLevel1() {
  setLevel1Walls();
  setLevel1SafeArea();
  setLevel1Goal();
  setSolids();
  setEdges();
  setDots();
}
// End of file
