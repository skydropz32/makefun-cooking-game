// Mouse and keyboard input: the game reads clicks and key presses once per frame.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_TRASH = 8;

export function createInput(canvas) {
  let actions = 0;
  let click = null;
  const stationKeys = new Set();
  const pressedKeys = new Set();

  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    click = toCanvas(event);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      actions |= key === ' ' ? ACTION_SERVE : ACTION_CONFIRM;
      if (key === ' ') event.preventDefault();
    } else if (key === 'p' || key === 'escape') {
      actions |= ACTION_PAUSE;
    } else if (key === 'x' || key === 'backspace' || key === 'delete') {
      actions |= ACTION_TRASH;
    } else if (key >= '1' && key <= '6') {
      stationKeys.add(key);
    }
    pressedKeys.add(key);
  });

  return {
    /** The click since the last read, or null. */
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
    /** The action bits since the last read. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Station number keys (1-6) pressed since the last read. */
    takeStationKeys() {
      const taken = [...stationKeys];
      stationKeys.clear();
      return taken;
    },
    /** -1, 0 or 1 from the arrow keys, held down. */
    direction() {
      const left = pressedKeys.has('arrowleft') || pressedKeys.has('a');
      const right = pressedKeys.has('arrowright') || pressedKeys.has('d');
      return (right ? 1 : 0) - (left ? 1 : 0);
    },
  };
}
