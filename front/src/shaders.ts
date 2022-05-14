const vertexShaderSource: string = `#version 300 es
precision highp float;

in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource: string = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_scale;

out vec4 o_color;

float sdbox(vec2 p, in vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float combine(float a, float b) {
  return max(a, b);
}

vec2 normalize_point_window_space(vec2 p) {
  vec2 result = p / u_resolution.xy * 2.0 - 1.0;
  result.x *= u_resolution.x / u_resolution.y;
  return result * u_scale;
}

float grid(vec2 point) {
  vec2 f = fract(point);
  float x = 0.15 - min(f.x, 0.15);
  float y = 0.15 - min(f.y, 0.15);
  return x + y > 0.0 ? 1.0 : 0.0;
}

vec2 cell(vec2 point) {
  return point - fract(point);
}

float mouse(vec2 point) {
  vec2 c1 = cell(point);
  vec2 c2 = cell(normalize_point_window_space(u_mouse));

  float same = abs(c1.x - c2.x) + abs(c1.y - c2.y);
  return same <= 0.0 ? 1.0 : 0.0;
}

void main() {
  vec2 uv = normalize_point_window_space(gl_FragCoord.xy);

  vec3 gridColor = vec3(1.0, 0.5, 1.0);
  vec3 mouseColor = vec3(0.0, 1.0, 0.0);

  vec3 col = vec3(0.0);
  col += gridColor * grid(uv);
  col += mouseColor * mouse(uv);

	o_color = vec4(col, 1.0);
}
`;

export { vertexShaderSource, fragmentShaderSource };
