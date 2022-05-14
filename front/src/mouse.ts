import { Mouse } from './types';

let viewportHeight = window.innerHeight;

const mouse: Mouse = {
  x:  0,
  y:  0,
};

document.addEventListener('mousemove', event => {
  mouse.x = event.pageX;
  mouse.y = viewportHeight - event.pageY;
});

window.addEventListener('resize', () => {
  viewportHeight = window.innerHeight;
});

export default mouse;
