// The 3D stage behind the flagship designs. Like the tooth, every object is
// drawn by a small WebGL2 shader from shapes described in code: no 3D library,
// no model files, so it works the same on the platform and in saved website
// files. A scene only describes its shapes and how they look; this engine does
// the camera, the brand-coloured studio light, dragging, scroll, the cursor,
// lighter quality on phones, and the photo fallback when WebGL2 is missing.
//
//   <canvas data-stage="liquid" data-scroll="sticky" data-spin=".002"></canvas>
//   attributes: data-scale (zoom), data-yaw / data-pitch (start angle),
//     data-spin (auto turn speed), data-drag="off", data-scroll="sticky"
//     (progress through a tall sticky section instead of across the screen),
//     data-scroll="leave" (0 at the top of the section, 1 once scrolled past it),
//     data-progress=".8" (no scrolling at all, always this far along),
//     CSS --stage-zoom on the canvas scales the zoom, e.g. smaller on phones
//   events on the canvas: "stage-focus" (detail: a number, -1 for none),
//     "stage-mode" (detail: a number, eased)
//
// A scene defines   vec2 map(vec3 p)   (distance, material id)
// and               vec3 shade(vec3 p, vec3 n, vec3 v, vec3 R, float m)
// and may #define CAM_D (camera distance), CAM_Y, FOCAL before them.

const HEAD = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uSize; uniform float uTime; uniform float uYaw; uniform float uPitch; uniform float uScale;
uniform float uScroll; uniform float uFocus; uniform float uMode; uniform float uHover; uniform vec2 uMouse;
uniform vec3 uBrand; uniform vec3 uWarm; uniform vec3 uPale; uniform vec3 uDark;
float smin(float a, float b, float k) { float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.); }
float sdRoundBox(vec3 p, vec3 b, float r) { return sdBox(p, b - r) - r; }
float sdCyl(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.) + length(max(d, 0.)); }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h) - r; }
float hash3(vec3 p) { p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z); }
// a soft photo studio lit in the business's colours
vec3 env(vec3 r) {
  vec3 deep = mix(uBrand, vec3(.08), .38), sky = mix(mix(uBrand, uPale, .78), vec3(1.), .18);
  vec3 col = mix(deep, sky, smoothstep(-.75, .88, r.y));
  col += vec3(.95, 1., .98) * .85 * pow(max(dot(r, normalize(vec3(-.67, .52, .5))), 0.), 11.);
  col += mix(uWarm, vec3(1.), .25) * .8 * pow(max(dot(r, normalize(vec3(.88, .05, .62))), 0.), 18.);
  float ribbon = exp(-pow((r.x + .25) / .18, 2.)) * smoothstep(-.8, -.2, r.z); col += vec3(.95, .97, 1.) * ribbon * .75;
  return col * mix(.62, 1.2, smoothstep(-.48, .67, r.y));
}
// paint, plastic or metal: base colour, how glossy (0..1), how metallic (0..1)
vec3 lit(vec3 base, vec3 n, vec3 v, vec3 R, float gloss, float metal) {
  vec3 L1 = normalize(vec3(-.4, .8, 1.)), L2 = normalize(vec3(.9, .2, .4));
  float dif = max(dot(n, L1), 0.) * .8 + max(dot(n, L2), 0.) * .25 + .22;
  float fres = pow(1. - max(dot(n, v), 0.), 4.);
  float sp = pow(max(dot(reflect(-L1, n), v), 0.), mix(8., 90., gloss)) * gloss;
  vec3 refl = env(R);
  vec3 c = mix(base * dif, base * refl, metal);
  c += refl * mix(.04, .6, gloss) * (fres * (1. - metal) + .15 * gloss);
  c += vec3(1.) * sp * 1.2;
  return c;
}
`;

const FOOT = `
#ifndef CAM_D
#define CAM_D 4.6
#endif
#ifndef CAM_Y
#define CAM_Y 0.
#endif
#ifndef FOCAL
#define FOCAL 3.9
#endif
#ifndef MAX_T
#define MAX_T 12.
#endif
vec3 calcN(vec3 p) { vec2 e = vec2(.0015, 0.); return normalize(vec3(map(p + e.xyy).x - map(p - e.xyy).x, map(p + e.yxy).x - map(p - e.yxy).x, map(p + e.yyx).x - map(p - e.yyx).x)); }
void main() {
  vec2 uv = (gl_FragCoord.xy - .5 * uSize) / min(uSize.x, uSize.y);
  vec3 ro = vec3(0., CAM_Y, CAM_D), rd = normalize(vec3(uv * 2. / uScale, -FOCAL));
  rd.yz = rot(-uPitch) * rd.yz; ro.yz = rot(-uPitch) * ro.yz;
  ro.xz = rot(-uYaw) * ro.xz; rd.xz = rot(-uYaw) * rd.xz;
  float t = 0.; vec2 h = vec2(1., 0.); bool hit = false;
  for (int i = 0; i < STEPS; i++) { h = map(ro + rd * t); if (h.x < .0015 * (1. + t)) { hit = true; break; } t += h.x * .85; if (t > MAX_T) break; }
  if (!hit) { fragColor = vec4(0.); return; }
  vec3 p = ro + rd * t, n = calcN(p), v = -rd, R = reflect(rd, n);
  vec3 c = shade(p, n, v, R, h.y);
  c = 1. - exp(-c * 1.15); c = pow(c, vec3(.88));
  fragColor = vec4(c, 1.);
}
`;

// the scene's GLSL, ready to sit in a page as a script
export const stageScene = (name: string, glsl: string) =>
  `(window.STAGES = window.STAGES || {})[${JSON.stringify(name)}] = ${JSON.stringify(glsl)};\n`;

export const STAGE_JS = `
(function () {
  var HEAD = ${JSON.stringify(HEAD)}, FOOT = ${JSON.stringify(FOOT)};
  var VERT = "#version 300 es\\nprecision highp float;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0.,1.);}";
  var phone = matchMedia("(pointer: coarse)").matches || innerWidth < 760;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function rgb(hex, fb) { var m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim()); if (!m) return fb; var n = parseInt(m[1], 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  function init(canvas) {
    var scene = (window.STAGES || {})[canvas.getAttribute("data-stage")];
    var host = canvas.closest("[data-3d-host]") || canvas.parentElement;
    var gl = null;
    try { gl = canvas.getContext("webgl2", { alpha: true, antialias: !phone, premultipliedAlpha: false }); } catch (e) {}
    if (!gl || !scene) { host.classList.add("no-3d"); return; }
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; } return o; }
    var prog = gl.createProgram(), v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, HEAD.replace("out vec4", "#define STEPS " + (phone ? 72 : 120) + "\\nout vec4") + scene + FOOT);
    if (!v || !f) { host.classList.add("no-3d"); return; }
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { host.classList.add("no-3d"); return; }
    gl.useProgram(prog); gl.bindVertexArray(gl.createVertexArray());
    var U = {};
    "uSize uTime uYaw uPitch uScale uScroll uFocus uMode uHover uMouse uBrand uWarm uPale uDark".split(" ").forEach(function (s) { U[s] = gl.getUniformLocation(prog, s); });
    var css = getComputedStyle(canvas);
    var colours = [rgb(css.getPropertyValue("--primary"), [.2, .45, .5]), rgb(css.getPropertyValue("--accent"), [1, .78, .67]), rgb(css.getPropertyValue("--light"), [.9, .95, .95]), rgb(css.getPropertyValue("--dark"), [.1, .1, .1])];
    var num = function (a, d) { var x = parseFloat(canvas.getAttribute(a)); return x === x ? x : d; };
    var yaw = num("data-yaw", .3), pitch = num("data-pitch", -.08), ty = yaw, tp = pitch, spin = reduce ? 0 : num("data-spin", .0016);
    var scale = num("data-scale", 1), mode0 = canvas.getAttribute("data-scroll") || "", fixed = num("data-progress", -1), canDrag = canvas.getAttribute("data-drag") !== "off";
    var zoom = 1, readZoom = function () { var z = parseFloat(getComputedStyle(canvas).getPropertyValue("--stage-zoom")); zoom = z === z ? z : 1; };
    readZoom(); addEventListener("resize", readZoom);
    var scroll = fixed >= 0 ? fixed : 0, mouse = [0, 0], tm = [0, 0], focus = -1, mode = 0, tmode = 0, hover = 0, drag = false, lastX = 0, lastY = 0, active = false, frame = 0;
    new IntersectionObserver(function (es) { active = es.some(function (e) { return e.isIntersecting; }); if (active && !frame) frame = requestAnimationFrame(render); }, { threshold: 0 }).observe(canvas);
    function progress() {
      if (fixed >= 0) return fixed;
      var r = host.getBoundingClientRect(), vh = innerHeight;
      var p = mode0 === "sticky" ? -r.top / Math.max(1, r.height - vh) : mode0 === "leave" ? -r.top / Math.max(1, r.height) : (vh - r.top) / (r.height + vh);
      return Math.max(0, Math.min(1, p));
    }
    addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      tm = [Math.max(-1.5, Math.min(1.5, ((e.clientX - r.left) / r.width) * 2 - 1)), Math.max(-1.5, Math.min(1.5, 1 - ((e.clientY - r.top) / r.height) * 2))];
    }, { passive: true });
    if (canDrag) {
      canvas.addEventListener("pointerdown", function (e) { drag = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener("pointermove", function (e) { if (!drag) return; ty += (e.clientX - lastX) * .008; tp = Math.max(-.7, Math.min(.5, tp + (e.clientY - lastY) * .004)); lastX = e.clientX; lastY = e.clientY; });
      var end = function () { drag = false; };
      canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
      canvas.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { ty += e.key === "ArrowLeft" ? -.3 : .3; e.preventDefault(); } });
    }
    canvas.addEventListener("stage-focus", function (e) { focus = Number(e.detail); hover = 0; });
    canvas.addEventListener("stage-mode", function (e) { tmode = Number(e.detail); });
    function render(ms) {
      if (!active) { frame = 0; return; }
      var dpr = Math.min(devicePixelRatio || 1, phone ? 1 : 1.25), r = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      if (!drag) ty += spin;
      yaw += (ty - yaw) * .07; pitch += (tp - pitch) * .07;
      scroll += (progress() - scroll) * .1;
      mouse[0] += (tm[0] - mouse[0]) * .06; mouse[1] += (tm[1] - mouse[1]) * .06;
      mode += (tmode - mode) * .08; hover += (1 - hover) * .08;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uSize, w, h); gl.uniform1f(U.uTime, reduce ? 0 : ms * .001);
      gl.uniform1f(U.uYaw, yaw); gl.uniform1f(U.uPitch, pitch); gl.uniform1f(U.uScale, scale * zoom);
      gl.uniform1f(U.uScroll, scroll); gl.uniform1f(U.uFocus, focus); gl.uniform1f(U.uMode, mode); gl.uniform1f(U.uHover, hover);
      gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform3fv(U.uBrand, colours[0]); gl.uniform3fv(U.uWarm, colours[1]); gl.uniform3fv(U.uPale, colours[2]); gl.uniform3fv(U.uDark, colours[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    }
  }
  document.querySelectorAll("canvas[data-stage]").forEach(init);
  // buttons that point the stage at something: <button data-stage-focus="2" data-target="#id">
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-stage-focus],[data-stage-mode]") : null;
    if (!b) return;
    var c = document.querySelector(b.getAttribute("data-target"));
    if (!c) return;
    if (b.hasAttribute("data-stage-focus")) c.dispatchEvent(new CustomEvent("stage-focus", { detail: b.getAttribute("data-stage-focus") }));
    if (b.hasAttribute("data-stage-mode")) c.dispatchEvent(new CustomEvent("stage-mode", { detail: b.getAttribute("data-stage-mode") }));
  });
})();
`;
