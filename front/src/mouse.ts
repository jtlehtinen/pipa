import { Mouse } from './types';

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

let viewportHeight = window.innerHeight;

const mouse: Mouse = {
  x:  0,
  y:  0,
  left: false,
  right: false,
};

document.addEventListener('mousemove', event => {
  mouse.x = event.pageX;
  mouse.y = viewportHeight - event.pageY;
});

document.addEventListener('mousedown', event => {
  if (event.button === LEFT_BUTTON) mouse.left = true;
  if (event.button === RIGHT_BUTTON) mouse.right = true;
});

document.addEventListener('mouseup', event => {
  if (event.button === LEFT_BUTTON) mouse.left = false;
  if (event.button === RIGHT_BUTTON) mouse.right = false;
});

window.addEventListener('resize', () => {
  viewportHeight = window.innerHeight;
});

export default mouse;
