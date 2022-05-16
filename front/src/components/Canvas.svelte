<script lang='ts' setup>
  import { onMount } from 'svelte';
  import mouse from '../mouse';
  import { vertexShaderSource, fragmentShaderSource } from '../shaders';
  import math from '../math';
  import renderer from '../renderer';

  const CANVAS_WIDTH = 32;
  const CANVAS_HEIGHT = 32;

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let scale = 20.0;

  let canvas = null
  let ctx: WebGL2RenderingContext = null;
  let program = null;
  let vao = null;
  let buffer = null;
  let texture = null;
  const offset = {x: 0, y: 0};

  function render() {
    const time = Date.now() / 1000.0;
    const vw = viewportWidth;
    const vh = viewportHeight;

    ctx.clearColor(Math.sin(time) * 0.5 + 0.5, Math.cos(time) * 0.5 + 0.5, 0.0, 1.0);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
    ctx.viewport(0, 0, vw, vh);

    ctx.useProgram(program);
    ctx.uniform2f(ctx.getUniformLocation(program, 'u_resolution'), vw, vh);
    ctx.uniform2f(ctx.getUniformLocation(program, 'u_mouse'), mouse.x, mouse.y);
    ctx.uniform2f(ctx.getUniformLocation(program, 'u_offset'), offset.x, offset.y);
    ctx.uniform1f(ctx.getUniformLocation(program, 'u_scale'), scale);
    ctx.uniform1i(ctx.getUniformLocation(program, 'u_channel'), 0);

    renderer.textureUnit(ctx, ctx.TEXTURE0, texture);
    ctx.bindVertexArray(vao);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    ctx.bindVertexArray(null);
    renderer.textureUnit(ctx, ctx.TEXTURE0, null);
    ctx.useProgram(null);

    window.requestAnimationFrame(render);
  }

  onMount(() => {
    window.addEventListener('resize', () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
    });

    document.addEventListener('mousemove', event => {
      if (mouse.middle) {
        offset.x -= event.movementX;
        offset.y += event.movementY;
      }
    });

    window.addEventListener('wheel', event => {
      if (!event.shiftKey) return;

      event.preventDefault();
      const dscale = event.deltaY / 102.0;
      scale = Math.floor(math.clamp(scale + dscale, 5.0, 50.0));
    });

    ctx = canvas.getContext('webgl2');

    ctx.disable(ctx.CULL_FACE);

    program = renderer.createShaderProgram(ctx, vertexShaderSource, fragmentShaderSource);
    buffer = renderer.createBuffer(ctx, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);

    vao = ctx.createVertexArray();
    ctx.bindVertexArray(vao);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);

    const positionLocation = ctx.getAttribLocation(program, 'a_position');
    ctx.enableVertexAttribArray(positionLocation);
    ctx.vertexAttribPointer(positionLocation, 2, ctx.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
    ctx.bindVertexArray(null);

    texture = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, texture);
    ctx.texStorage2D(ctx.TEXTURE_2D, 1, ctx.RGBA8, CANVAS_WIDTH, CANVAS_HEIGHT);

    const pixels = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT * 4);
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = Math.floor(Math.random() * 255);
      pixels[i+1] = Math.floor(Math.random() * 255);
      pixels[i+2] = Math.floor(Math.random() * 255);
      pixels[i+3] = 255;
    }

    ctx.texSubImage2D(ctx.TEXTURE_2D, 0, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);
    ctx.bindTexture(ctx.TEXTURE_2D, null);

    window.requestAnimationFrame(render);
  });
</script>

<style>
canvas {
  z-index: 0;
}
</style>

<canvas
  bind:this={canvas}
  width={viewportWidth}
  height={viewportHeight}
/>
