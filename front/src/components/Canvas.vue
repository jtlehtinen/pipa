<script setup>
  import { onMounted, ref } from 'vue';
  import mouse from '../mouse';
  import { vertexShaderSource, fragmentShaderSource } from '../shaders';

  const CANVAS_WIDTH = 512;
  const CANVAS_HEIGHT = 512;

  const viewportWidth = ref(window.innerWidth);
  const viewportHeight = ref(window.innerHeight);
  const scale = ref(20.0);

  const canvas = ref(null);
  let ctx = null;
  let program = null;
  let vao = null;
  let buffer = null;
  let texture = null;

  function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

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
    ctx.uniform1f(ctx.getUniformLocation(program, 'u_scale'), scale.value);
    ctx.uniform1i(ctx.getUniformLocation(program, 'u_channel'), 0);

    ctx.activeTexture(ctx.TEXTURE0);
    ctx.bindTexture(ctx.TEXTURE_2D, texture);
    ctx.bindVertexArray(vao);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    ctx.bindVertexArray(null);
    ctx.bindTexture(ctx.TEXTURE_2D, null);
    ctx.useProgram(null);

    window.requestAnimationFrame(render);
  }

  onMounted(() => {
    window.addEventListener('resize', () => {
      viewportWidth.value = window.innerWidth;
      viewportHeight.value = window.innerHeight;
    });

    window.addEventListener('wheel', event => {
      if (!event.shiftKey) return;

      event.preventDefault();
      const dscale = event.deltaY / 102.0;
      scale.value = Math.floor(clamp(scale.value + dscale, 5.0, 50.0));
    });

    ctx = canvas.value.getContext('webgl2');

    ctx.disable(ctx.CULL_FACE);

    const vs = ctx.createShader(ctx.VERTEX_SHADER);
    ctx.shaderSource(vs, vertexShaderSource);
    ctx.compileShader(vs);

    const fs = ctx.createShader(ctx.FRAGMENT_SHADER);
    ctx.shaderSource(fs, fragmentShaderSource);
    ctx.compileShader(fs);

    program = ctx.createProgram();
    ctx.attachShader(program, vs);
    ctx.attachShader(program, fs);
    ctx.linkProgram(program);

    buffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, null);

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
