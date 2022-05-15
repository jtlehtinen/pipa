import { Mouse } from './types';

const LEFT_BUTTON = 0;

let viewportHeight = window.innerHeight;

const mouse: Mouse = {
  x:  0,
  y:  0,
  left: false,
};

document.addEventListener('mousemove', event => {
  mouse.x = event.pageX;
  mouse.y = viewportHeight - event.pageY;
});

document.addEventListener('mousedown', event => {
  if (event.button === LEFT_BUTTON) {
    mouse.left = true;
  }
});

document.addEventListener('mouseup', event => {
  if (event.button === LEFT_BUTTON) {
    mouse.left = false;
  }
});

window.addEventListener('resize', () => {
  viewportHeight = window.innerHeight;
});

export default mouse;
