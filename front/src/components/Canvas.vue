<script setup>
  import { onMounted, ref } from 'vue';

  function glErrorToString(ctx, error) {
    switch (error) {
      case ctx.INVALID_ENUM: return 'INVALID_ENUM';
      case ctx.INVALID_VALUE: return 'INVALID_VALUE';
      case ctx.INVALID_OPERATION: return 'INVALID_OPERATION';
      case ctx.INVALID_FRAMEBUFFER_OPERATION: return 'INVALID_FRAMEBUFFER_OPERATION';
      case ctx.OUT_OF_MEMORY: return 'OUT_OF_MEMORY';
      case ctx.CONTEXT_LOST_WEBGL: return 'CONTEXT_LOST_WEBGL';
      default: return 'unknown gl error';
    }
  }

  function glCheck(ctx) {
    const error = ctx.getError();
    if (error !== ctx.NO_ERROR) {
      console.log(`GL ERROR: ${glErrorToString(error)}`);
    }
  }

  const vertexShaderSource = `#version 300 es
precision highp float;

in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
  `;

  const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec2 u_resolution;

out vec4 o_color;

vec4 sphere1 = vec4(0.0, 1.0, 0.0, 1.0);

vec3 nSphere(vec3 pos, vec4 sphere) {
  return (pos - sphere.xyz) / sphere.w;
}

float iSphere(vec3 ro, vec3 rd, vec4 sphere) {
  vec3 oc = ro - sphere.xyz;
  float b = 2.0 * dot(oc, rd);
  float c = dot(oc, oc) - sphere.w * sphere.w;
  float h = b * b - 4.0 * c;
  if (h < 0.0) return -1.0;
  float t = (-b - sqrt(h)) / 2.0;
  return t;
}

float intersect(vec3 ro, vec3 rd) {
  return iSphere(ro, rd, sphere1);
}

float halfLambert(vec3 N, vec3 L) {
  return pow(dot(N, L) * 0.5 + 0.5, 2.0);
}

float lambert(vec3 N, vec3 L) {
  return clamp(dot(N, L), 0.0, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;

  vec2 uv = fragCoord.xy / u_resolution.xy * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 ro = vec3(0.0, 1.0, 3.0);
  vec3 rd = normalize(vec3(uv, -1.0));

  float t = intersect(ro, rd);

  vec3 col = vec3(0.1);
  if (t > 0.0) {
    vec3 P = ro + t * rd;
    vec3 N = nSphere(P, sphere1);
    vec3 L = normalize(vec3(0.57703));

  #if 1
    col = halfLambert(N, L) * vec3(1.0);
  #else
    col = lambert(N, L) * vec3(1.0);
  #endif
  }

	o_color = vec4(sqrt(col), 1.0);
}
  `;

  const viewportWidth = ref(window.innerWidth);
  const viewportHeight = ref(window.innerHeight);

  const canvas = ref(null);
  let ctx = null;
  let program = null;
  let vao = null;
  let buffer = null;

  function render() {
    const time = Date.now() / 1000.0;
    const vw = viewportWidth.value;
    const vh = viewportHeight.value;

    ctx.clearColor(Math.sin(time) * 0.5 + 0.5, Math.cos(time) * 0.5 + 0.5, 0.0, 1.0); glCheck(ctx);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT); glCheck(ctx);
    ctx.viewport(0, 0, vw, vh); glCheck(ctx); glCheck(ctx);

    ctx.useProgram(program); glCheck(ctx);
    ctx.uniform2f(ctx.getUniformLocation(program, 'u_resolution'), vw, vh); glCheck(ctx);

    ctx.bindVertexArray(vao); glCheck(ctx);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3); glCheck(ctx);
    ctx.bindVertexArray(null); glCheck(ctx);
    ctx.useProgram(null); glCheck(ctx);

    window.requestAnimationFrame(render); glCheck(ctx);
  }

  onMounted(() => {
    window.addEventListener('resize', () => {
      viewportWidth.value = window.innerWidth;
      viewportHeight.value = window.innerHeight;
    });

    ctx = canvas.value.getContext('webgl2'); glCheck(ctx);
    ctx.disable(ctx.CULL_FACE);

    const vs = ctx.createShader(ctx.VERTEX_SHADER); glCheck(ctx);
    ctx.shaderSource(vs, vertexShaderSource); glCheck(ctx);
    ctx.compileShader(vs); glCheck(ctx);

    const fs = ctx.createShader(ctx.FRAGMENT_SHADER); glCheck(ctx);
    ctx.shaderSource(fs, fragmentShaderSource); glCheck(ctx);
    ctx.compileShader(fs); glCheck(ctx);

    program = ctx.createProgram(); glCheck(ctx);
    ctx.attachShader(program, vs); glCheck(ctx);
    ctx.attachShader(program, fs); glCheck(ctx);
    ctx.linkProgram(program); glCheck(ctx);

    buffer = ctx.createBuffer(); glCheck(ctx);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer); glCheck(ctx);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW); glCheck(ctx);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, null); glCheck(ctx);

    vao = ctx.createVertexArray(); glCheck(ctx);
    ctx.bindVertexArray(vao); glCheck(ctx);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer); glCheck(ctx);

    const positionLocation = ctx.getAttribLocation(program, 'a_position'); glCheck(ctx);
    ctx.enableVertexAttribArray(positionLocation); glCheck(ctx);
    ctx.vertexAttribPointer(positionLocation, 2, ctx.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0); glCheck(ctx);
    ctx.bindVertexArray(null); glCheck(ctx);

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
