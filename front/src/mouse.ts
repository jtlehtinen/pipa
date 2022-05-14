import { Mouse } from './types';

let viewportHeight = window.innerHeight;

const mouse: Mouse = {
  x:  0,
  y:  0,
};

document.addEventListener('mousemove', (e) => {
  mouse.x = e.pageX;
  mouse.y = viewportHeight - e.pageY;
});

window.addEventListener('resize', () => {
  viewportHeight = window.innerHeight;
});

export default mouse;
