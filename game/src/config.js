// Dapur Kilat: all the tuning in one place. Times are seconds, money is coins.
export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;
export const BEST_KEY = 'dapur-kilat-best';
export const STEP = 1 / 60;

/** Prep kinds: instant goes straight on the plate, chop needs 3 clicks, grill/fry cook over time. */
export const PREP_INSTANT = 'instant';
export const PREP_CHOP = 'chop';
export const PREP_GRILL = 'grill';
export const PREP_FRY = 'fry';

export const INGREDIENTS = [
  { id: 'bun', name: 'Roti', key: '1', prep: PREP_INSTANT, color: '#e8a94e', dark: '#b97c2e' },
  { id: 'patty', name: 'Daging', key: '2', prep: PREP_GRILL, color: '#8a4b2a', dark: '#5e2f16', cookTime: 4, burnTime: 9 },
  { id: 'lettuce', name: 'Selada', key: '3', prep: PREP_CHOP, color: '#58b368', dark: '#2f7d3d', chops: 3 },
  { id: 'tomato', name: 'Tomat', key: '4', prep: PREP_CHOP, color: '#e4572e', dark: '#a92f14', chops: 3 },
  { id: 'cheese', name: 'Keju', key: '5', prep: PREP_INSTANT, color: '#ffc93c', dark: '#d99a06' },
  { id: 'egg', name: 'Telur', key: '6', prep: PREP_FRY, color: '#fff3d6', dark: '#e8b64c', cookTime: 3, burnTime: 7 },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

/** Dishes on the menu: the recipe is a multiset of ingredient ids. */
export const DISHES = [
  { id: 'burger', name: 'Burger Klasik', recipe: ['bun', 'patty', 'lettuce', 'tomato'], price: 12 },
  { id: 'cheeseburger', name: 'Cheeseburger', recipe: ['bun', 'patty', 'cheese'], price: 11 },
  { id: 'salad', name: 'Salad Segar', recipe: ['lettuce', 'tomato', 'cheese'], price: 9 },
  { id: 'eggtoast', name: 'Roti Telur', recipe: ['bun', 'egg', 'lettuce'], price: 10 },
  { id: 'double', name: 'Burger Ganda', recipe: ['bun', 'patty', 'patty', 'cheese', 'tomato'], price: 16 },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((dish) => [dish.id, dish]));

/** Order pacing by level: every 4 served dishes the kitchen gets busier. */
export function levelFor(served) {
  return 1 + Math.floor(served / 4);
}
export function spawnIntervalFor(level) {
  return Math.max(5, 9 - (level - 1) * 0.8);
}
export function orderTimeFor(level) {
  return Math.max(30, 50 - (level - 1) * 3);
}
export function dishPoolFor(level) {
  return level >= 3 ? DISHES : DISHES.slice(0, 4);
}
