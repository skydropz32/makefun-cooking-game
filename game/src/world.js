// The kitchen itself: orders, the plate, the grill and the pan, coins and the shift clock.
// Everything here is plain data and rules; render.js only paints what this holds.
import {
  DISH_BY_ID,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  MAX_HEARTS,
  MAX_ORDERS,
  PREP_CHOP,
  PREP_FRY,
  PREP_GRILL,
  PREP_INSTANT,
  SHIFT_SECONDS,
  dishPoolFor,
  levelFor,
  orderTimeFor,
  spawnIntervalFor,
} from './config.js';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_OVER = 8;
export const EVENT_LEVELUP = 16;

export const PLATE_MAX = 6;

function emptyPlate() {
  return Object.fromEntries(INGREDIENTS.map((item) => [item.id, 0]));
}

function emptyStations() {
  return Object.fromEntries(
    INGREDIENTS.map((item) => [item.id, { chops: 0, mode: 'idle', progress: 0 }]),
  );
}

function recipeCounts(recipe) {
  const counts = emptyPlate();
  for (const id of recipe) counts[id] += 1;
  return counts;
}

function plateMatches(plate, recipe) {
  const wanted = recipeCounts(recipe);
  return INGREDIENTS.every((item) => plate[item.id] === wanted[item.id]);
}

function plateTotal(plate) {
  return INGREDIENTS.reduce((sum, item) => sum + plate[item.id], 0);
}

export function createWorld(random) {
  const state = {
    coins: 0,
    served: 0,
    missed: 0,
    streak: 0,
    bestStreak: 0,
    hearts: MAX_HEARTS,
    timeLeft: SHIFT_SECONDS,
    level: 1,
    orders: [],
    plate: emptyPlate(),
    stations: emptyStations(),
    focusedOrderId: null,
    spawnTimer: 4,
    nextOrderId: 1,
    popups: [],
    shake: 0,
    over: false,
    overReason: '',
    elapsed: 0,
  };

  function popup(text, x, y, color) {
    state.popups.push({ text, x, y, color, ttl: 1.4 });
    if (state.popups.length > 8) state.popups.shift();
  }

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    const dish = random.pick(dishPoolFor(state.level));
    const total = orderTimeFor(state.level);
    state.orders.push({ id: state.nextOrderId, dishId: dish.id, timeLeft: total, total });
    state.nextOrderId += 1;
  }

  function addToPlate(id) {
    if (plateTotal(state.plate) >= PLATE_MAX) {
      popup('Piring penuh!', 640, 300, '#ff8a7a');
      return false;
    }
    state.plate[id] += 1;
    return true;
  }

  function pressStation(id) {
    if (state.over) return;
    const ingredient = INGREDIENT_BY_ID[id];
    const station = state.stations[id];
    if (ingredient.prep === PREP_INSTANT) {
      addToPlate(id);
      return;
    }
    if (ingredient.prep === PREP_CHOP) {
      station.chops += 1;
      if (station.chops >= ingredient.chops) {
        station.chops = 0;
        addToPlate(id);
      }
      return;
    }
    // Grill and fry: idle -> cooking, done -> plate, burnt -> bin it.
    if (station.mode === 'idle') {
      station.mode = 'cooking';
      station.progress = 0;
    } else if (station.mode === 'done') {
      station.mode = 'idle';
      station.progress = 0;
      addToPlate(id);
    } else if (station.mode === 'burnt') {
      station.mode = 'idle';
      station.progress = 0;
    }
  }

  function servePlate() {
    if (state.over || plateTotal(state.plate) === 0) return EVENT_NONE;
    const ordered = [...state.orders].sort((a, b) =>
      (a.id === state.focusedOrderId ? -1 : 0) - (b.id === state.focusedOrderId ? -1 : 0),
    );
    const match = ordered.find((order) => plateMatches(state.plate, DISH_BY_ID[order.dishId].recipe));
    if (!match) {
      state.streak = 0;
      state.shake = 0.35;
      popup('Bukan pesanan itu!', 640, 300, '#ff8a7a');
      return EVENT_WRONG;
    }
    const dish = DISH_BY_ID[match.dishId];
    const timeBonus = Math.round(dish.price * (match.timeLeft / match.total) * 0.5);
    const streakBonus = state.streak >= 2 ? state.streak : 0;
    const earned = dish.price + timeBonus + streakBonus;
    state.coins += earned;
    state.served += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.orders = state.orders.filter((order) => order.id !== match.id);
    if (state.focusedOrderId === match.id) state.focusedOrderId = null;
    state.plate = emptyPlate();
    popup(`+$${earned} ${dish.name}!`, 640, 300, '#ffe066');
    if (state.streak >= 3) popup(`Kombo x${state.streak}!`, 640, 268, '#ffb347');
    const level = levelFor(state.served);
    if (level > state.level) {
      state.level = level;
      popup(`Level ${level}: dapur makin sibuk!`, 640, 268, '#9be7ff');
      return EVENT_SERVED | EVENT_LEVELUP;
    }
    return EVENT_SERVED;
  }

  function trashPlate() {
    if (plateTotal(state.plate) === 0) return;
    state.plate = emptyPlate();
  }

  function endShift(reason) {
    state.over = true;
    state.overReason = reason;
  }

  function step(dt) {
    if (state.over) return EVENT_NONE;
    let events = EVENT_NONE;
    state.elapsed += dt;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endShift('shift');
      return EVENT_OVER;
    }
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnOrder();
      state.spawnTimer = spawnIntervalFor(state.level);
    }
    for (const order of [...state.orders]) {
      order.timeLeft -= dt;
      if (order.timeLeft <= 0) {
        state.orders = state.orders.filter((item) => item.id !== order.id);
        if (state.focusedOrderId === order.id) state.focusedOrderId = null;
        state.missed += 1;
        state.streak = 0;
        state.hearts -= 1;
        popup(`Pesanan ${DISH_BY_ID[order.dishId].name} hangus!`, 640, 300, '#ff8a7a');
        events |= EVENT_EXPIRED;
        if (state.hearts <= 0) {
          endShift('hearts');
          return events | EVENT_OVER;
        }
      }
    }
    for (const ingredient of INGREDIENTS) {
      const station = state.stations[ingredient.id];
      if (station.mode !== 'cooking') continue;
      station.progress += dt;
      if (station.progress >= ingredient.burnTime) {
        station.mode = 'burnt';
      } else if (station.progress >= ingredient.cookTime) {
        station.mode = 'done';
      }
    }
    for (const item of [...state.popups]) {
      item.ttl -= dt;
      item.y -= 22 * dt;
      if (item.ttl <= 0) state.popups.splice(state.popups.indexOf(item), 1);
    }
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    return events;
  }

  function reset() {
    state.coins = 0;
    state.served = 0;
    state.missed = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.hearts = MAX_HEARTS;
    state.timeLeft = SHIFT_SECONDS;
    state.level = 1;
    state.orders = [];
    state.plate = emptyPlate();
    state.stations = emptyStations();
    state.focusedOrderId = null;
    state.spawnTimer = 4;
    state.nextOrderId = 1;
    state.popups = [];
    state.shake = 0;
    state.over = false;
    state.overReason = '';
    state.elapsed = 0;
    spawnOrder();
    spawnOrder();
  }

  return {
    state,
    reset,
    step,
    pressStation,
    servePlate,
    trashPlate,
    spawnOrder,
    plateTotal: () => plateTotal(state.plate),
    plateMatches,
  };
}
