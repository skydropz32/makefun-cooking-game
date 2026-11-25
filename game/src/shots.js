// The screenshot scenes behind ?shot=start|play|serve|end. Each one plays the real rules
// forward from a fresh world for a fixed amount of game time, steered by a small autopilot
// (collect what is cooked, build the first order's recipe, serve when it matches), so the
// frame is what a real game looks like and the same seed always gives the same frame.
import { DISH_BY_ID, INGREDIENTS, INGREDIENT_BY_ID, SHIFT_SECONDS, STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/** One autopilot decision per fixed step. When `serve` is false it builds but never serves. */
function autopilot(world, serve) {
  const state = world.state;
  if (state.orders.length === 0) return;
  for (const ingredient of INGREDIENTS) {
    const station = state.stations[ingredient.id];
    if (station.mode === 'done' || station.mode === 'burnt') {
      world.pressStation(ingredient.id);
      return;
    }
  }
  const order = state.orders[0];
  const dish = DISH_BY_ID[order.dishId];
  if (serve && world.plateMatches(state.plate, dish.recipe)) {
    world.servePlate();
    return;
  }
  const wanted = {};
  for (const id of dish.recipe) wanted[id] = (wanted[id] ?? 0) + 1;
  for (const id of dish.recipe) {
    if ((state.plate[id] ?? 0) < wanted[id]) {
      const ingredient = INGREDIENT_BY_ID[id];
      const station = state.stations[id];
      if (station.mode === 'cooking') return; // Wait for the grill / pan.
      world.pressStation(id);
      return;
    }
  }
}

function stepFor(world, seconds, act) {
  const steps = Math.round(seconds / STEP);
  for (let index = 0; index < steps; index += 1) {
    if (act) act();
    if (world.step(STEP) & EVENT_OVER) break;
  }
}

/** Like stepFor, but stops the moment `done()` is true (or the world ends). */
function runUntil(world, seconds, act, done) {
  const steps = Math.round(seconds / STEP);
  for (let index = 0; index < steps; index += 1) {
    if (act) act();
    if (world.step(STEP) & EVENT_OVER) return 'over';
    if (done && done()) return 'done';
  }
  return 'time';
}

/**
 * Set `world` to the named scene (start, play, serve or end; any other name is start) and
 * return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    // Title: a kitchen already busy — two orders on the board, a bun and cheese on the plate.
    stepFor(world, 6, null);
    world.pressStation('bun');
    world.pressStation('cheese');
    // The title shows a fresh shift: full clock, full hearts.
    world.state.timeLeft = SHIFT_SECONDS;
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'serve') {
    // Play properly until the second plate is served, then freeze on the coin popup.
    const servedBefore = world.state.served;
    runUntil(world, 120, () => autopilot(world, true), () => world.state.served > servedBefore + 1);
    return { screen: SCREEN_PLAY, best: world.state.coins };
  }
  if (name === 'end') {
    // Play well for a while, then stop serving: orders expire, hearts run out, shift ends.
    stepFor(world, 45, () => autopilot(world, true));
    stepFor(world, 300, null);
    return { screen: SCREEN_OVER, best: world.state.coins };
  }
  // Play: serve at least one order, then build the next plate halfway and freeze mid-assembly.
  runUntil(world, 45, () => autopilot(world, true), () => world.state.served >= 1);
  if (!world.state.over) {
    runUntil(world, 45, () => {
      if (world.plateTotal() < 2) autopilot(world, false);
    }, () => world.plateTotal() >= 2);
  }
  return { screen: world.state.over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.coins };
}
