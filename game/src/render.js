// Every pixel of Dapur Kilat: the kitchen, the order board, the counter stations, the plate
// and the title / pause / game-over screens. All drawing is plain canvas 2D, no images.
import { DISH_BY_ID, INGREDIENTS, MAX_HEARTS, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

/** Layout the click handling in main.js shares with the drawing below. */
export const LAYOUT = {
  board: { x: 24, y: 80, w: 336, h: 232 },
  menu: { x: 920, y: 80, w: 336, h: 232 },
  stations: { x: 24, y: 336, w: 176, h: 168, gap: 12 },
  plate: { x: 300, y: 560, w: 420, h: 140 },
  serve: { x: 760, y: 576, w: 220, h: 72 },
  trash: { x: 1000, y: 576, w: 140, h: 72 },
};

export function stationRect(index) {
  const s = LAYOUT.stations;
  return { x: s.x + index * (s.w + s.gap), y: s.y, w: s.w, h: s.h };
}
export function orderRect(index) {
  const b = LAYOUT.board;
  return { x: b.x + 12, y: b.y + 44 + index * 58, w: b.w - 24, h: 52 };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** One ingredient, drawn as a flat vector icon. */
export function drawIngredient(ctx, id, cx, cy, size) {
  const r = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7cf8a';
    ctx.fillRect(-r * 0.55, -r * 0.28, r * 0.18, r * 0.1);
    ctx.fillRect(r * 0.1, -r * 0.45, r * 0.18, r * 0.1);
    ctx.fillStyle = '#c98a3a';
    ctx.fillRect(-r * 0.95, r * 0.15, r * 1.9, r * 0.28);
    ctx.fillStyle = '#e8a94e';
    ctx.fillRect(-r * 0.95, r * 0.43, r * 1.9, r * 0.2);
  } else if (id === 'patty') {
    ctx.fillStyle = '#8a4b2a';
    roundRect(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.4);
    ctx.fill();
    ctx.fillStyle = '#5e2f16';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.1, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.3, r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.55, -r * 0.2, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#58b368';
    for (const [dx, dy, rr] of [[-0.45, 0.1, 0.55], [0.45, 0.1, 0.55], [0, -0.4, 0.6], [0, 0.25, 0.6]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, rr * r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2f7d3d';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(0, r * 0.6);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f7d3d';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(-r * 0.4, -r * 0.95);
    ctx.lineTo(0, -r * 0.75);
    ctx.lineTo(r * 0.4, -r * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.25, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 0.6);
    ctx.lineTo(r * 0.9, r * 0.6);
    ctx.lineTo(-r * 0.9, -r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d99a06';
    ctx.beginPath();
    ctx.arc(-r * 0.25, r * 0.2, r * 0.14, 0, Math.PI * 2);
    ctx.arc(r * 0.35, r * 0.35, r * 0.11, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a007';
    ctx.beginPath();
    ctx.arc(r * 0.1, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcf4d';
    ctx.beginPath();
    ctx.arc(r * 0.02, -r * 0.08, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? '#ff5a5a' : 'rgba(255,255,255,0.25)';
  ctx.fill();
  ctx.restore();
}

function drawClock(ctx, x, y, r, fraction) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fff8ec';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fraction < 0.25 ? '#ff5a5a' : '#5b3a1e';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r - 2, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -r * 0.55);
  ctx.moveTo(0, 0);
  ctx.lineTo(r * 0.4, 0);
  ctx.stroke();
  ctx.restore();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = VIEW_WIDTH;
  canvas.height = VIEW_HEIGHT;

  function drawBackground() {
    ctx.fillStyle = '#f7e8c9';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    // Wall tiles.
    ctx.fillStyle = '#f3dfba';
    for (let x = 0; x < VIEW_WIDTH; x += 64) ctx.fillRect(x, 64, 1, 260);
    // Window with a sunny street.
    ctx.fillStyle = '#bfe3f2';
    roundRect(ctx, 560, 84, 160, 110, 10);
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(600, 118, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7fb069';
    ctx.fillRect(560, 168, 160, 26);
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 6;
    roundRect(ctx, 560, 84, 160, 110, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(640, 84);
    ctx.lineTo(640, 194);
    ctx.moveTo(560, 139);
    ctx.lineTo(720, 139);
    ctx.stroke();
    // Floor.
    ctx.fillStyle = '#d9a05b';
    ctx.fillRect(0, 540, VIEW_WIDTH, 180);
    ctx.fillStyle = '#c98d4b';
    for (let x = 0; x < VIEW_WIDTH; x += 80) ctx.fillRect(x, 540, 2, 180);
    ctx.fillRect(0, 620, VIEW_WIDTH, 2);
    // Counter band behind the stations.
    ctx.fillStyle = '#a06a35';
    roundRect(ctx, 12, 324, VIEW_WIDTH - 24, 200, 16);
    ctx.fill();
    ctx.fillStyle = '#c98d4b';
    roundRect(ctx, 12, 324, VIEW_WIDTH - 24, 26, 16);
    ctx.fill();
  }

  function drawTopBar(state) {
    ctx.fillStyle = '#4a2c14';
    ctx.fillRect(0, 0, VIEW_WIDTH, 64);
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(0, 60, VIEW_WIDTH, 4);
    text(ctx, 'DAPUR KILAT', 28, 26, 30, '#ffd27a');
    text(ctx, 'Shift masak • layani pesanan sebelum waktunya habis', 28, 50, 13, '#e8c9a0', 'normal');
    const fraction = state.timeLeft / 150;
    drawClock(ctx, 640, 32, 22, fraction);
    text(ctx, formatTime(state.timeLeft), 672, 33, 30, fraction < 0.25 ? '#ff8a7a' : '#fff8ec', 'bold');
    text(ctx, `Level ${state.level}`, 760, 33, 16, '#9be7ff');
    text(ctx, `$ ${state.coins}`, 1000, 26, 26, '#ffe066');
    text(ctx, state.streak >= 2 ? `Kombo x${state.streak}` : 'Sajikan pesanan!', 1000, 50, 13, state.streak >= 2 ? '#ffb347' : '#e8c9a0', 'normal');
    for (let i = 0; i < MAX_HEARTS; i += 1) drawHeart(ctx, 1180 + i * 30, 32, 24, i < state.hearts);
  }

  function drawOrderTicket(order, index, focused) {
    const rect = orderRect(index);
    const dish = DISH_BY_ID[order.dishId];
    const danger = order.timeLeft < 12;
    ctx.fillStyle = focused ? '#fff3c4' : '#fffaf0';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.strokeStyle = focused ? '#f2a007' : '#d9c49a';
    ctx.lineWidth = focused ? 3 : 2;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.stroke();
    text(ctx, dish.name, rect.x + 12, rect.y + 15, 16, '#4a2c14');
    const counts = {};
    for (const id of dish.recipe) counts[id] = (counts[id] ?? 0) + 1;
    let ix = rect.x + 14;
    for (const id of Object.keys(counts)) {
      drawIngredient(ctx, id, ix + 10, rect.y + 36, 18);
      if (counts[id] > 1) text(ctx, `x${counts[id]}`, ix + 22, rect.y + 40, 12, '#4a2c14');
      ix += 34;
    }
    text(ctx, `$${dish.price}`, rect.x + rect.w - 12, rect.y + 15, 16, '#2f7d3d', 'bold', 'right');
    const barW = rect.w - 24;
    ctx.fillStyle = '#eadfc8';
    roundRect(ctx, rect.x + 12, rect.y + 44, barW, 6, 3);
    ctx.fill();
    ctx.fillStyle = danger ? '#ff5a5a' : '#58b368';
    roundRect(ctx, rect.x + 12, rect.y + 44, barW * Math.max(0, order.timeLeft / order.total), 6, 3);
    ctx.fill();
  }

  function drawBoard(state) {
    const b = LAYOUT.board;
    ctx.fillStyle = 'rgba(74,44,20,0.92)';
    roundRect(ctx, b.x, b.y, b.w, b.h, 14);
    ctx.fill();
    text(ctx, 'PESANAN', b.x + 16, b.y + 24, 18, '#ffd27a');
    text(ctx, `${state.orders.length}/4`, b.x + b.w - 16, b.y + 24, 14, '#e8c9a0', 'normal', 'right');
    if (state.orders.length === 0) {
      text(ctx, 'Belum ada pesanan…', b.x + 16, b.y + 80, 15, '#e8c9a0', 'normal');
    }
    state.orders.forEach((order, index) => drawOrderTicket(order, index, order.id === state.focusedOrderId));
  }

  function drawMenu() {
    const m = LAYOUT.menu;
    ctx.fillStyle = 'rgba(74,44,20,0.92)';
    roundRect(ctx, m.x, m.y, m.w, m.h, 14);
    ctx.fill();
    text(ctx, 'MENU HARI INI', m.x + 16, m.y + 24, 18, '#ffd27a');
    const dishes = ['burger', 'cheeseburger', 'salad', 'eggtoast', 'double'];
    dishes.forEach((id, index) => {
      const dish = DISH_BY_ID[id];
      const y = m.y + 52 + index * 36;
      text(ctx, dish.name, m.x + 16, y, 14, '#fff8ec');
      let ix = m.x + 150;
      const counts = {};
      for (const item of dish.recipe) counts[item] = (counts[item] ?? 0) + 1;
      for (const item of Object.keys(counts)) {
        drawIngredient(ctx, item, ix + 8, y, 15);
        ix += 22;
      }
      text(ctx, `$${dish.price}`, m.x + m.w - 16, y, 14, '#ffe066', 'bold', 'right');
    });
  }

  function drawStation(state, index) {
    const ingredient = INGREDIENTS[index];
    const station = state.stations[ingredient.id];
    const rect = stationRect(index);
    const burnt = station.mode === 'burnt';
    const done = station.mode === 'done';
    ctx.fillStyle = burnt ? '#5b3a2a' : done ? '#fff3c4' : '#fffaf0';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.fill();
    ctx.strokeStyle = done ? '#f2a007' : burnt ? '#ff5a5a' : '#d9c49a';
    ctx.lineWidth = done || burnt ? 3 : 2;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.stroke();
    // Key badge.
    ctx.fillStyle = '#4a2c14';
    ctx.beginPath();
    ctx.arc(rect.x + 20, rect.y + 20, 13, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, ingredient.key, rect.x + 20, rect.y + 21, 14, '#ffd27a', 'bold', 'center');
    // Grill / pan glow while cooking.
    if (station.mode === 'cooking') {
      ctx.fillStyle = ingredient.prep === 'grill' ? 'rgba(255,120,40,0.25)' : 'rgba(255,200,60,0.25)';
      roundRect(ctx, rect.x + 8, rect.y + 40, rect.w - 16, 84, 10);
      ctx.fill();
    }
    drawIngredient(ctx, ingredient.id, rect.x + rect.w / 2, rect.y + 82, 72);
    if (station.mode === 'cooking') {
      const fraction = Math.min(1, station.progress / ingredient.cookTime);
      ctx.fillStyle = '#eadfc8';
      roundRect(ctx, rect.x + 20, rect.y + 128, rect.w - 40, 8, 4);
      ctx.fill();
      ctx.fillStyle = '#ff8a3c';
      roundRect(ctx, rect.x + 20, rect.y + 128, (rect.w - 40) * fraction, 8, 4);
      ctx.fill();
      text(ctx, 'MASAK…', rect.x + rect.w / 2, rect.y + 152, 12, '#a05a1e', 'bold', 'center');
    } else if (done) {
      text(ctx, 'MATANG! Ambil', rect.x + rect.w / 2, rect.y + 152, 13, '#2f7d3d', 'bold', 'center');
    } else if (burnt) {
      text(ctx, 'GOSONG! Klik buang', rect.x + rect.w / 2, rect.y + 152, 12, '#ff8a7a', 'bold', 'center');
    } else if (ingredient.prep === 'chop') {
      const pips = '●'.repeat(station.chops) + '○'.repeat(ingredient.chops - station.chops);
      text(ctx, `${ingredient.name} • potong ${pips}`, rect.x + rect.w / 2, rect.y + 152, 12, '#4a2c14', 'bold', 'center');
    } else {
      text(ctx, ingredient.name, rect.x + rect.w / 2, rect.y + 152, 14, '#4a2c14', 'bold', 'center');
    }
  }

  function drawPlate(state) {
    const p = LAYOUT.plate;
    ctx.fillStyle = 'rgba(74,44,20,0.92)';
    roundRect(ctx, p.x, p.y, p.w, p.h, 14);
    ctx.fill();
    text(ctx, 'PIRING', p.x + 16, p.y + 22, 15, '#ffd27a');
    const counts = state.plate;
    const items = INGREDIENTS.filter((item) => counts[item.id] > 0);
    if (items.length === 0) {
      text(ctx, 'Piring kosong — klik bahan di atas', p.x + 16, p.y + 70, 14, '#e8c9a0', 'normal');
    } else {
      // Stack the plate's ingredients as a little dish.
      const cx = p.x + 110;
      const baseY = p.y + 108;
      let offset = 0;
      for (const item of INGREDIENTS) {
        for (let n = 0; n < counts[item.id]; n += 1) {
          drawIngredient(ctx, item.id, cx, baseY - offset, 44);
          offset += 16;
        }
      }
      let x = p.x + 200;
      for (const item of items) {
        drawIngredient(ctx, item.id, x, p.y + 62, 30);
        text(ctx, `x${counts[item.id]}`, x + 20, p.y + 66, 13, '#fff8ec', 'bold');
        x += 62;
      }
    }
    // Serve and trash buttons.
    const s = LAYOUT.serve;
    ctx.fillStyle = '#2f9e44';
    roundRect(ctx, s.x, s.y, s.w, s.h, 12);
    ctx.fill();
    text(ctx, 'SAJIKAN', s.x + s.w / 2, s.y + 26, 22, '#ffffff', 'bold', 'center');
    text(ctx, 'Spasi / klik', s.x + s.w / 2, s.y + 52, 12, '#d3f9d8', 'normal', 'center');
    const t = LAYOUT.trash;
    ctx.fillStyle = '#868e96';
    roundRect(ctx, t.x, t.y, t.w, t.h, 12);
    ctx.fill();
    text(ctx, 'BUANG', t.x + t.w / 2, t.y + 26, 18, '#ffffff', 'bold', 'center');
    text(ctx, 'tombol X', t.x + t.w / 2, t.y + 52, 12, '#f1f3f5', 'normal', 'center');
  }

  function drawPopups(state) {
    for (const popup of state.popups) {
      ctx.globalAlpha = Math.min(1, popup.ttl);
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(74,44,20,0.85)';
      ctx.strokeText(popup.text, popup.x, popup.y);
      text(ctx, popup.text, popup.x, popup.y, 22, popup.color, 'bold', 'center');
      ctx.globalAlpha = 1;
    }
  }

  function drawHint() {
    text(ctx, 'Klik bahan (atau tombol 1–6) • Spasi sajikan • X buang piring • P jeda', VIEW_WIDTH / 2, 548, 14, '#5b3a1e', 'normal', 'center');
  }

  function overlay() {
    ctx.fillStyle = 'rgba(40,22,8,0.72)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }

  function drawTitle(state, best) {
    overlay();
    ctx.fillStyle = '#fffaf0';
    roundRect(ctx, 290, 110, 700, 500, 20);
    ctx.fill();
    ctx.strokeStyle = '#f2a007';
    ctx.lineWidth = 4;
    roundRect(ctx, 290, 110, 700, 500, 20);
    ctx.stroke();
    drawIngredient(ctx, 'bun', 640, 190, 90);
    text(ctx, 'DAPUR KILAT', 640, 250, 56, '#4a2c14', 'bold', 'center');
    text(ctx, 'Game masak berwaktu: terima pesanan, racik bahan, sajikan sebelum dingin!', 640, 292, 17, '#7a5a34', 'normal', 'center');
    const lines = [
      '1–6 / klik  —  ambil & olah bahan (daging di grill, telur di wajan, sayur dipotong)',
      'Spasi  —  sajikan piring ke pesanan yang cocok',
      'X  —  buang isi piring    •    P  —  jeda',
      'Pesanan hangus = 1 hati hilang. 3 hati habis = dapur tutup!',
    ];
    lines.forEach((line, i) => text(ctx, line, 640, 340 + i * 30, 15, '#4a2c14', 'normal', 'center'));
    text(ctx, `Skor terbaik: $ ${best}`, 640, 480, 18, '#2f7d3d', 'bold', 'center');
    text(ctx, 'Tekan ENTER atau klik untuk mulai masak', 640, 540, 20, '#e4572e', 'bold', 'center');
  }

  function drawPaused() {
    overlay();
    text(ctx, 'JEDA', 640, 330, 64, '#fff8ec', 'bold', 'center');
    text(ctx, 'Tekan P atau klik untuk lanjut', 640, 390, 20, '#e8c9a0', 'normal', 'center');
  }

  function drawOver(state, best) {
    overlay();
    ctx.fillStyle = '#fffaf0';
    roundRect(ctx, 330, 120, 620, 480, 20);
    ctx.fill();
    ctx.strokeStyle = '#f2a007';
    ctx.lineWidth = 4;
    roundRect(ctx, 330, 120, 620, 480, 20);
    ctx.stroke();
    const title = state.overReason === 'hearts' ? 'DAPUR TUTUP!' : 'SHIFT SELESAI!';
    text(ctx, title, 640, 190, 48, '#4a2c14', 'bold', 'center');
    text(
      ctx,
      state.overReason === 'hearts'
        ? 'Terlalu banyak pesanan hangus.'
        : 'Waktu shift habis. Dapur bersih, dompet terisi.',
      640, 232, 16, '#7a5a34', 'normal', 'center',
    );
    const rows = [
      ['Koin didapat', `$ ${state.coins}`],
      ['Pesanan disajikan', `${state.served}`],
      ['Pesanan hangus', `${state.missed}`],
      ['Kombo terbaik', `x${state.bestStreak}`],
      ['Level tercapai', `${state.level}`],
      ['Skor terbaik', `$ ${best}`],
    ];
    rows.forEach(([label, value], i) => {
      const y = 290 + i * 36;
      text(ctx, label, 420, y, 17, '#4a2c14', 'normal');
      text(ctx, value, 860, y, 17, '#2f7d3d', 'bold', 'right');
    });
    text(ctx, 'Tekan ENTER untuk main lagi', 640, 540, 20, '#e4572e', 'bold', 'center');
  }

  function draw(state, screen, best) {
    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.save();
    if (state.shake > 0) {
      ctx.translate((Math.random() - 0.5) * state.shake * 30, (Math.random() - 0.5) * state.shake * 30);
    }
    drawBackground();
    drawTopBar(state);
    drawBoard(state);
    drawMenu();
    INGREDIENTS.forEach((_, index) => drawStation(state, index));
    drawHint();
    drawPlate(state);
    drawPopups(state);
    ctx.restore();
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_PAUSED) drawPaused();
    else if (screen === SCREEN_OVER) drawOver(state, best);
  }

  return { draw, drawIngredient };
}
