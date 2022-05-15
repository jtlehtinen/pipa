function createBuffer(ctx: WebGL2RenderingContext, data: Float32Array, usage: GLenum): WebGLBuffer {
  const result = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, result);
  ctx.bufferData(ctx.ARRAY_BUFFER, data, usage);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
  return result;
}

function textureUnit(ctx: WebGL2RenderingContext, unit: GLenum, texture: WebGLTexture) {
  ctx.activeTexture(unit);
  ctx.bindTexture(ctx.TEXTURE_2D, texture);
}

function createShaderProgram(ctx: WebGL2RenderingContext, vertexShader: string, fragmentShader: string): WebGLProgram | null {
  const vs = ctx.createShader(ctx.VERTEX_SHADER);
  ctx.shaderSource(vs, vertexShader);
  ctx.compileShader(vs);

  const fs = ctx.createShader(ctx.FRAGMENT_SHADER);
  ctx.shaderSource(fs, fragmentShader);
  ctx.compileShader(fs);

  const program = ctx.createProgram();
  ctx.attachShader(program, vs);
  ctx.attachShader(program, fs);
  ctx.linkProgram(program);

  return program;
}

export default { createBuffer, createShaderProgram, textureUnit };
