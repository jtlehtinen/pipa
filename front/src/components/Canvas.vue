<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import mouse from '../mouse';
  import { vertexShaderSource, fragmentShaderSource } from '../shaders';
  import math from '../math';
  import renderer from '../renderer';

  const CANVAS_WIDTH = 32;
  const CANVAS_HEIGHT = 32;

  const viewportWidth = ref(window.innerWidth);
  const viewportHeight = ref(window.innerHeight);
  const scale = ref(20.0);

  const canvas = ref(null);
  let ctx: WebGL2RenderingContext = null;
  let program = null;
  let vao = null;
  let buffer = null;
  let texture = null;
  const offset = {x: 0, y: 0};

  function render() {
    const time = Date.now() / 1000.0;
    const vw = viewportWidth.value;
    const vh = viewportHeight.value;

    ctx.clearColor(Math.sin(time) * 0.5 + 0.5, Math.cos(time) * 0.5 + 0.5, 0.0, 1.0);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
    ctx.viewport(0, 0, vw, vh);

    ctx.useProgram(program);
    ctx.uniform2f(ctx.getUniformLocation(program, 'u_resolution'), vw, vh);
    ctx.uniform2f(ctx.getUniformLocation(program, 'u_mouse'), mouse.x, mouse.y);
    ctx.uniform2f(ctx.getUniformLocation(program, 'u_offset'), offset.x, offset.y);
    ctx.uniform1f(ctx.getUniformLocation(program, 'u_scale'), scale.value);
    ctx.uniform1i(ctx.getUniformLocation(program, 'u_channel'), 0);

    renderer.textureUnit(ctx, ctx.TEXTURE0, texture);
    ctx.bindVertexArray(vao);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    ctx.bindVertexArray(null);
    renderer.textureUnit(ctx, ctx.TEXTURE0, null);
    ctx.useProgram(null);

    window.requestAnimationFrame(render);
  }

  onMounted(() => {
    window.addEventListener('resize', () => {
      viewportWidth.value = window.innerWidth;
      viewportHeight.value = window.innerHeight;
    });

    document.addEventListener('mousemove', event => {
      if (mouse.left) {
        offset.x -= event.movementX;
        offset.y += event.movementY;
      }
    });

    window.addEventListener('wheel', event => {
      if (!event.shiftKey) return;

      event.preventDefault();
      const dscale = event.deltaY / 102.0;
      scale.value = Math.floor(math.clamp(scale.value + dscale, 5.0, 50.0));
    });

    ctx = canvas.value.getContext('webgl2');

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

<template>
  <canvas
    ref='canvas'
    :width='viewportWidth'
    :height='viewportHeight'
    />
</template>
