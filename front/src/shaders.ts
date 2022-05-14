const vertexShaderSource: string = `#version 300 es
precision highp float;

in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource: string = `#version 300 es
precision highp float;

// @NOTE: Signed distance field functions are from
// Inigo Quilez blog. See: https://iquilezles.org/articles/distfunctions2d/

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_scale;

float thickness = 0.15;

out vec4 o_color;

float sd_box(vec2 p, in vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sd_rounded_box(vec2 p, vec2 b, vec4 r) {
  r.xy = (p.x > 0.0) ? r.xy : r.zw;
  r.x  = (p.y > 0.0) ? r.x : r.y;
  vec2 q = abs(p) - b + r.x;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
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
  vec2 f = fract(point + vec2(thickness * 0.5));
  float x = thickness - min(f.x, thickness);
  float y = thickness - min(f.y, thickness);
  return x + y > 0.0 ? 1.0 : 0.0;
}

vec2 cell(vec2 point) {
  return point - fract(point);
}

float mouse(vec2 point) {
  vec2 mouse_position = normalize_point_window_space(u_mouse);

  vec2 c1 = cell(point);
  vec2 c2 = cell(mouse_position);

  float same = abs(c1.x - c2.x) + abs(c1.y - c2.y);
  if (same != 0.0) return 0.0;

  vec2 point_fract = fract(point);
  if (point_fract.x > 0.4 && point_fract.x < 0.6) return 0.0;
  if (point_fract.y > 0.4 && point_fract.y < 0.6) return 0.0;

  vec2 grid_center = (mouse_position - fract(mouse_position) + 0.5);
  float d = sd_rounded_box(point - grid_center, vec2(0.5), vec4(0.1));

  return 1.0 - smoothstep(d, -0.2, -0.15);
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
