// The flagship 3D scenes, as shapes for the stage engine (stage3d.ts).
// Each one is coloured by the business: uBrand is their main colour, uWarm
// their accent, uPale their light tone.

// SALONS: a glossy liquid-chrome form that drifts, ripples, dents away from
// the cursor and spreads out as you scroll.
export const LIQUID = `
#define CAM_D 5.4
vec2 map(vec3 p) {
  float t = uTime * .3, s = uScroll;
  float d = 1e9;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec3 c = vec3(sin(t * 1.1 + fi * 1.7) * (.7 + s * 1.1), cos(t * .9 + fi * 2.3) * (.45 + s * .35), sin(t * .7 + fi * 1.3) * .35);
    float r = .66 - .07 * fi + .1 * sin(t * 1.3 + fi);
    d = smin(d, length(p - c) - r, .62);
  }
  d += .028 * sin(p.x * 5. + uTime * 1.3) * sin(p.y * 4. - uTime * 1.1) * sin(p.z * 4.5 + uTime * .8);
  vec3 m = vec3(uMouse.x * 1.8, uMouse.y * 1.1, .9);
  d += .2 * exp(-dot(p - m, p - m) * 2.4);
  return vec2(d * .7, 0.);
}
vec3 shade(vec3 p, vec3 n, vec3 v, vec3 R, float m) {
  float fres = pow(1. - max(dot(n, v), 0.), 2.2);
  vec3 tint = mix(uBrand, uWarm, .5 + .5 * n.y);
  vec3 film = mix(uWarm, mix(uBrand, uPale, .5), .5 + .5 * sin(fres * 7. + uTime * .2));
  vec3 c = env(R) * mix(vec3(1.), tint, .5);
  c += film * smoothstep(.05, .45, fres) * (1. - smoothstep(.6, .95, fres)) * .45;
  c += vec3(1.) * pow(max(dot(R, normalize(vec3(-.5, .6, .6))), 0.), 50.) * 1.6;
  return c;
}
`;

// CAR WASH: a clean, badge-free car on a turntable. Scrolling through the
// section covers it in foam, rinses it, then polishes it to a sparkle.
export const CAR = `
#define CAM_D 6.4
#define CAM_Y .1
float foam() { return smoothstep(.06, .3, uScroll) * (1. - smoothstep(.4, .56, uScroll)); }
float shine() { return smoothstep(.62, .85, uScroll); }
vec2 map(vec3 p) {
  vec3 q = p - vec3(0., -.05, 0.);
  float body = sdRoundBox(q - vec3(0., -.12, 0.), vec3(1.66, .25, .72), .22);
  vec3 c = q - vec3(-.22, .27, 0.);
  float taper = clamp((c.y + .1) / .32, 0., 1.);
  c.x += taper * .12;
  float cab = sdRoundBox(c, vec3(.95 - .38 * taper, .2, .62 - .08 * taper), .19);
  body = smin(body, cab, .16);
  vec3 w = q; w.x = abs(w.x) - 1.02; w.z = abs(w.z);
  float arch = length(w.xy - vec2(0., -.36)) - .42;
  body = max(body, -max(arch, .4 - w.z));
  float f = foam();
  if (f > 0.) body -= f * (.035 + .07 * noise(p * 6.5 + vec3(0., uTime * .3, 0.)));
  vec2 res = vec2(body, 0.);
  vec3 wq = q - vec3(0., -.36, 0.); wq.x = abs(wq.x) - 1.02; wq.z = abs(wq.z) - .6;
  float tyre = sdTorus(wq.xzy, vec2(.26, .12));
  if (tyre < res.x) res = vec2(tyre, 1.);
  float rim = sdCyl(wq.xzy - vec3(0., .04, 0.), .22, .05);
  if (rim < res.x) res = vec2(rim, 2.);
  float table = sdCyl(p - vec3(0., -.84, 0.), 2.3, .05);
  if (table < res.x) res = vec2(table, 4.);
  return res;
}
vec3 shade(vec3 p, vec3 n, vec3 v, vec3 R, float m) {
  if (m > 3.5) {
    float ring = smoothstep(.02, 0., abs(length(p.xz) - 2.1));
    return mix(uDark * .6 + .04, uWarm, ring * .8) + env(R) * .08;
  }
  if (m > 1.5) return lit(vec3(.75), n, v, R, .8, .9);
  if (m > .5) return lit(vec3(.05), n, v, R, .2, 0.);
  vec3 q = p - vec3(0., -.05, 0.);
  bool glass = q.y > .16 && abs(n.y) < .82 && q.x < .62 && q.x > -1.1;
  vec3 paint = mix(uBrand, uBrand * .7, .3);
  vec3 c = glass ? lit(vec3(.03, .04, .06), n, v, R, .95, .55) : lit(paint, n, v, R, mix(.7, 1., shine()), .45);
  if (!glass) c += env(R) * pow(1. - max(dot(n, v), 0.), 3.) * .5;
  if (!glass && q.x > 1.55 && abs(q.y + .02) < .08 && abs(q.z) > .3) c = mix(c, vec3(1.4, 1.3, 1.1), .9);
  if (!glass && q.x < -1.6 && abs(q.y + .02) < .07 && abs(q.z) > .35) c = mix(c, vec3(1.2, .1, .08), .8);
  float f = foam();
  if (f > 0.) c = mix(c, vec3(1.08) * (.82 + .22 * noise(p * 14.)), smoothstep(.1, .45, f * (.7 + .6 * noise(p * 5.))));
  float wet = smoothstep(.42, .55, uScroll) * (1. - smoothstep(.6, .72, uScroll));
  c += vec3(.9) * wet * .5 * step(.82, noise(p * 34.)) * step(0., n.y);
  float sweep = exp(-pow((p.x + p.y * .6 - (mod(uTime * .9, 5.) - 2.5)) * 3.2, 2.)) * shine();
  return c + vec3(1.) * sweep * (glass ? .35 : .55) * (.4 + .6 * max(n.y, 0.));
}
`;

// MECHANICS: a brake assembly (disc, hub, caliper, pads). It pulls apart as
// you scroll; picking a service lights up its part.
export const BRAKE = `
#define CAM_D 6.
float ex() { return smoothstep(.25, .75, uScroll); }
vec2 map(vec3 p) {
  float e = ex();
  vec2 res = vec2(1e9, 0.);
  // disc, spinning slowly
  vec3 q = p; q.xy *= rot(uTime * .4);
  vec3 qz = q.xzy;
  float disc = sdCyl(qz, 1.15, .08);
  disc = max(disc, -sdCyl(qz, .42, .2));
  float seg = 6.2831 / 14., rq = length(q.xy);
  float a = mod(atan(q.y, q.x) + seg * .5, seg) - seg * .5;
  disc = max(disc, -(length(rq * vec2(cos(a), sin(a)) - vec2(.82, 0.)) - .065));
  float a2 = mod(atan(q.y, q.x), seg) - seg * .5;
  disc = max(disc, -(length(rq * vec2(cos(a2), sin(a2)) - vec2(.6, 0.)) - .05));
  res = vec2(disc, 0.);
  // hub with wheel studs, slides back
  vec3 h = q - vec3(0., 0., .25 + e * 1.1);
  float hub = sdCyl(h.xzy, .46, .2);
  hub = smin(hub, sdCyl(h.xzy - vec3(0., .18, 0.), .3, .12), .05);
  float sh = 6.2831 / 5., ah = mod(atan(h.y, h.x) + sh * .5, sh) - sh * .5;
  vec2 ph = length(h.xy) * vec2(cos(ah), sin(ah));
  vec3 stud = vec3(ph - vec2(.3, 0.), h.z - .3);
  hub = min(hub, sdCyl(stud.xzy, .045, .2));
  if (hub < res.x) res = vec2(hub, 1.);
  // caliper on the top edge, lifts off
  vec3 c = p - vec3(.0, .98 + e * .75, e * .6);
  float cal = sdRoundBox(c, vec3(.5, .26, .3), .12);
  cal = max(cal, -sdBox(c - vec3(0., -.2, 0.), vec3(.62, .2, .1)));
  if (cal < res.x) res = vec2(cal, 2.);
  // the two pads, spreading apart
  vec3 pd = p - vec3(0., .9 + e * .35, 0.);
  pd.z = abs(pd.z) - .13 - e * .5;
  float pad = sdRoundBox(pd, vec3(.42, .16, .035), .02);
  if (pad < res.x) res = vec2(pad, 3.);
  return res;
}
vec3 shade(vec3 p, vec3 n, vec3 v, vec3 R, float m) {
  vec3 c;
  if (m < .5) {
    vec3 q = p; q.xy *= rot(uTime * .4);
    float streak = .85 + .15 * sin(length(q.xy) * 140.);
    c = lit(vec3(.72, .73, .76) * streak, n, v, R, .7, .45);
  } else if (m < 1.5) c = lit(vec3(.42, .43, .45), n, v, R, .5, .35);
  else if (m < 2.5) c = lit(uBrand, n, v, R, .9, .2);
  else c = lit(vec3(.12, .11, .1), n, v, R, .15, 0.);
  float on = step(abs(m - uFocus), .4);
  float fres = pow(1. - max(dot(n, v), 0.), 2.);
  c = mix(c, c * .45, (1. - on) * step(-.5, uFocus) * .7);
  c += on * uWarm * (fres * 1.6 + .25) * uHover;
  return c;
}
`;

// HOME SERVICES: a house with its roof opening like a lid to show three rooms.
// Picking a service lights up its room.
export const HOUSE = `
#define CAM_D 7.
#define CAM_Y .55
#define MAX_T 16.
float roofOpen() { return .6 + .4 * smoothstep(.05, .5, uScroll); }
int roomOf(vec3 p) { return p.x < -.4 ? 0 : (p.z < 0. ? 1 : 2); }
vec2 map(vec3 p) {
  p.xz *= rot(uMouse.x * .12);
  vec2 res = vec2(sdBox(p - vec3(0., -.06, 0.), vec3(1.65, .06, 1.15)), 1.);
  float wall = min(sdBox(p - vec3(0., .45, -1.12), vec3(1.65, .45, .04)), sdBox(p - vec3(-1.62, .45, 0.), vec3(.04, .45, 1.15)));
  wall = min(wall, sdBox(p - vec3(-.4, .28, -.3), vec3(.035, .28, .85)));
  wall = min(wall, sdBox(p - vec3(.62, .28, 0.), vec3(1., .28, .035)));
  if (wall < res.x) res = vec2(wall, 0.);
  // kitchen: counter, hob, fridge
  float k = sdRoundBox(p - vec3(-1.05, .2, -.88), vec3(.5, .2, .2), .02);
  k = min(k, sdRoundBox(p - vec3(-1.4, .42, .55), vec3(.17, .42, .2), .03));
  k = min(k, sdRoundBox(p - vec3(-.95, .2, .35), vec3(.3, .2, .25), .03));
  if (k < res.x) res = vec2(k, 3.);
  // bathroom: bath, basin, pipes
  vec3 b = p - vec3(.85, .17, -.72);
  float bath = max(sdRoundBox(b, vec3(.5, .17, .26), .1), -sdRoundBox(b - vec3(0., .12, 0.), vec3(.42, .17, .18), .08));
  bath = min(bath, sdRoundBox(p - vec3(.05, .38, -.95), vec3(.17, .05, .12), .04));
  if (bath < res.x) res = vec2(bath, 2.);
  float pipe = sdCapsule(p, vec3(-.3, .62, -1.05), vec3(1.5, .62, -1.05), .035);
  pipe = min(pipe, sdCapsule(p, vec3(.05, .62, -1.05), vec3(.05, .38, -1.02), .03));
  pipe = min(pipe, sdCapsule(p, vec3(1.3, .62, -1.05), vec3(1.3, .34, -.95), .03));
  if (pipe < res.x) res = vec2(pipe, 4.);
  // living room: fuse box, sofa, lamp
  float fuse = sdRoundBox(p - vec3(-.35, .3, .3), vec3(.03, .17, .14), .015);
  if (fuse < res.x) res = vec2(fuse, 5.);
  float sofa = sdRoundBox(p - vec3(.95, .14, .78), vec3(.48, .14, .2), .07);
  sofa = min(sofa, sdRoundBox(p - vec3(.95, .3, .93), vec3(.48, .16, .06), .05));
  if (sofa < res.x) res = vec2(sofa, 3.);
  float lamp = min(sdCapsule(p, vec3(1.45, 0., .25), vec3(1.45, .6, .25), .02), length(p - vec3(1.45, .66, .25)) - .09);
  if (lamp < res.x) res = vec2(lamp, 6.);
  // roof, floating up
  float o = roofOpen();
  vec3 r = p - vec3(0., .95 + o * .7, -1.15 - o * .55);
  r.yz *= rot(o * .75);
  r.z -= -1.15;
  float roof = max(abs(r.z) - 1.28, max(abs(r.x) * .47 + r.y * .88 - .8, -r.y));
  roof = max(roof, -max(abs(r.z) - 1.2, max(abs(r.x) * .47 + r.y * .88 - .72, -r.y + .06)));
  if (roof < res.x) res = vec2(roof, 7.);
  return res;
}
vec3 shade(vec3 p, vec3 n, vec3 v, vec3 R, float m) {
  vec3 pp = p; pp.xz *= rot(uMouse.x * .12);
  vec3 c;
  if (m < .5) c = lit(mix(uPale, vec3(.98, .96, .93), .6), n, v, R, .1, 0.);
  else if (m < 1.5) {
    float plank = .9 + .1 * step(.5, fract(pp.x * 6.));
    c = lit(mix(vec3(.78, .6, .42), uWarm, .25) * plank, n, v, R, .3, 0.);
  }
  else if (m < 2.5) c = lit(vec3(.97), n, v, R, .85, 0.);
  else if (m < 3.5) c = lit(mix(uWarm, vec3(.9), .35), n, v, R, .4, 0.);
  else if (m < 4.5) c = lit(mix(uBrand, vec3(.8, .5, .3), .3), n, v, R, .8, .8);
  else if (m < 5.5) c = lit(vec3(.2, .21, .23), n, v, R, .5, .3) + uWarm * .15;
  else if (m < 6.5) c = lit(vec3(.9, .8, .5), n, v, R, .4, .2) + vec3(.6, .45, .2) * step(.6, pp.y);
  else c = lit(mix(uBrand, uDark, .35), n, v, R, .3, .1);
  if (m < 6.5 && uFocus > -.5) {
    float on = float(roomOf(pp) == int(uFocus + .5));
    c = mix(c * .55, c + uBrand * .35 * uHover, on);
    if (m > .5 && m < 1.5) c += on * uBrand * .25 * uHover * (.6 + .4 * sin(uTime * 3.));
  }
  return c;
}
`;
