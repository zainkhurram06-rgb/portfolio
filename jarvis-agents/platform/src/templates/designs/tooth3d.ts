// The live 3D tooth used by the dental designs. Ported from the Signature
// library's tooth3d.js: a tooth drawn entirely in a WebGL2 shader (no 3D
// library, no model file), which turns on its own and can be dragged.
// Changes: the studio lighting takes the business's own colours (--primary,
// --accent, --light), and devices without WebGL2 get the element marked
// .no-3d so the design shows their photo instead.
//
//   <canvas data-tooth-3d data-scale=".65" data-material="pearl"></canvas>  (material optional, chrome by default)
//   events on the canvas: "tooth-material" (detail "pearl" | "chrome"), "tooth-rotate"

export const TOOTH_JS = `
(function () {
  var VERT = "#version 300 es\\nprecision highp float;out vec2 vUv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=p;gl_Position=vec4(p*2.0-1.0,0.,1.);}";
  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 vUv;out vec4 fragColor;",
    "uniform vec2 uSize;uniform float uTime;uniform float uYaw;uniform float uPitch;uniform float uScale;uniform float uMaterial;",
    "uniform vec3 uBrand;uniform vec3 uWarm;uniform vec3 uPale;",
    "float ellipsoid(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/k1;}",
    "float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}",
    "mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}",
    "float sdf(vec3 p){",
    " float d=ellipsoid(p-vec3(0.,.24,0.),vec3(.73,.56,.59));",
    " for(int i=0;i<4;i++){float x=(i%2==0?-.37:.37),z=(i<2?-.29:.29);d=smin(d,ellipsoid(p-vec3(x,.64,z),vec3(.36,.34,.35)),.19);}",
    " d+=.022*cos(p.x*8.3+sin(p.y*3.5))*smoothstep(.15,.8,p.y);",
    " d=smin(d,ellipsoid(p-vec3(0.,-.31,0.),vec3(.55,.37,.44)),.30);",
    " for(int i=0;i<2;i++){float s=(i==0?-1.:1.);vec3 q=p-vec3(s*.275,-.76,-.005);q.x+=s*.26*(q.y+.62);",
    "  float taper=mix(.16,.27,clamp((q.y+.95)/.9,0.,1.));d=smin(d,ellipsoid(q,vec3(taper,.70,.255)),.15);}",
    " return d;}",
    "vec3 norm(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(sdf(p+e.xyy)-sdf(p-e.xyy),sdf(p+e.yxy)-sdf(p-e.yxy),sdf(p+e.yyx)-sdf(p-e.yyx)));}",
    "vec3 env(vec3 r){",
    " vec3 deep=mix(uBrand,vec3(.08),.38),sky=mix(mix(uBrand,uPale,.78),vec3(1.),.18);",
    " vec3 col=mix(deep,sky,smoothstep(-.75,.88,r.y));",
    " col+=vec3(.95,1.,.98)*.85*pow(max(dot(r,normalize(vec3(-.67,.52,.5))),0.),11.);",
    " col+=mix(uWarm,vec3(1.),.25)*.8*pow(max(dot(r,normalize(vec3(.88,.05,.62))),0.),18.);",
    " float ribbon=exp(-pow((r.x+.25)/.18,2.))*smoothstep(-.8,-.2,r.z);col+=vec3(.95,.97,1.)*ribbon*.75;",
    " col*=mix(.62,1.2,smoothstep(-.48,.67,r.y));return col;}",
    "void main(){",
    " vec2 uv=(gl_FragCoord.xy-.5*uSize.xy)/min(uSize.x,uSize.y);",
    " vec3 ro=vec3(0.,0.,4.6),rd=normalize(vec3(uv.x*2.0/uScale,uv.y*2.0/uScale,-3.9));",
    " ro.xz=rot(-uYaw)*ro.xz;rd.xz=rot(-uYaw)*rd.xz;ro.yz=rot(-uPitch)*ro.yz;rd.yz=rot(-uPitch)*rd.yz;",
    " float t=0.;bool hit=false;",
    " for(int i=0;i<105;i++){float d=sdf(ro+rd*t);if(d<.0012){hit=true;break;}t+=max(d*.77,.012);if(t>9.)break;}",
    " if(!hit){fragColor=vec4(0.);return;}",
    " vec3 p=ro+rd*t,n=norm(p),v=normalize(-rd);vec3 R=reflect(-v,n);R.yz=rot(uPitch)*R.yz;R.xz=rot(uYaw)*R.xz;",
    " float fres=pow(1.-max(dot(n,v),0.),3.0);vec3 light=normalize(vec3(-.4,.8,1.));float diffuse=max(dot(n,light),0.);",
    " float spec1=pow(max(dot(reflect(-light,n),v),0.),55.);float spec2=pow(max(dot(reflect(-normalize(vec3(.9,.2,.4)),n),v),0.),75.);",
    " vec3 reflection=env(R);vec3 color;",
    " if(uMaterial<.5){color=reflection*.93+mix(uBrand,vec3(1.),.35)*.19;color*=.73+.3*diffuse;",
    "  color+=vec3(.95,1.,1.)*spec1*1.1+mix(uWarm,vec3(1.),.3)*spec2*.8;color=mix(color,mix(uBrand,vec3(1.),.82),fres*.52);}",
    " else{vec3 pearl=mix(uPale,vec3(1.),.4);color=pearl*(1.25+.5*diffuse)+reflection*.2;color+=vec3(1.)*spec1*.85+mix(uBrand,vec3(1.),.6)*fres*.6;}",
    " float ridge=clamp((sdf(p+n*.075)-.06)*5.,0.,1.);color*=.9+.1*ridge;",
    " color=1.-exp(-color*1.12);color=pow(color,vec3(.85));",
    " float edge=smoothstep(0.,.22,max(dot(n,v),0.));fragColor=vec4(color,edge*.87+.13);}"
  ].join("\\n");

  function rgb(hex, fallback) {
    var m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
    if (!m) return fallback;
    var n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function init(canvas) {
    var gl = null;
    try { gl = canvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: false }); } catch (e) {}
    var host = canvas.closest("[data-3d-host]") || canvas.parentElement;
    if (!gl) { host.classList.add("no-3d"); return null; }
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
    var p = gl.createProgram(), v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!v || !f) { host.classList.add("no-3d"); return null; }
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { host.classList.add("no-3d"); return null; }
    gl.useProgram(p);
    var U = {};
    ["uSize", "uTime", "uYaw", "uPitch", "uScale", "uMaterial", "uBrand", "uWarm", "uPale"].forEach(function (s) { U[s] = gl.getUniformLocation(p, s); });
    gl.bindVertexArray(gl.createVertexArray());
    var css = getComputedStyle(canvas);
    var brand = rgb(css.getPropertyValue("--primary"), [.2, .45, .5]), warm = rgb(css.getPropertyValue("--accent"), [1, .78, .67]), pale = rgb(css.getPropertyValue("--light"), [.9, .95, .95]);
    var st = { yaw: .21, pitch: -.07, material: canvas.getAttribute("data-material") === "pearl" ? 1 : 0, drag: false }, ty = st.yaw, tp = st.pitch, last = 0, active = false, frame = 0;
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, scale = Number(canvas.getAttribute("data-scale") || "1");
    new IntersectionObserver(function (es) { active = es.some(function (e) { return e.isIntersecting; }); if (active) run(); }, { threshold: .01 }).observe(canvas);
    function render(ms) {
      if (!active) { frame = 0; return; }
      var dpr = Math.min(devicePixelRatio || 1, 1.4), r = canvas.getBoundingClientRect(), w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      st.yaw += (ty - st.yaw) * .07; st.pitch += (tp - st.pitch) * .07;
      var tt = ms * .001;
      if (!st.drag && !reduce) { ty += .0014; tp = -.05 + Math.sin(tt * .25) * .11; }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uSize, w, h); gl.uniform1f(U.uTime, tt); gl.uniform1f(U.uYaw, st.yaw); gl.uniform1f(U.uPitch, st.pitch);
      gl.uniform1f(U.uScale, scale); gl.uniform1f(U.uMaterial, st.material);
      gl.uniform3fv(U.uBrand, brand); gl.uniform3fv(U.uWarm, warm); gl.uniform3fv(U.uPale, pale);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    }
    function run() { if (!frame && active) frame = requestAnimationFrame(render); }
    canvas.addEventListener("pointerdown", function (e) { st.drag = true; last = e.clientX; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", function (e) { if (!st.drag) return; var dx = e.clientX - last; last = e.clientX; ty += dx * .008; tp = Math.max(-.75, Math.min(.75, tp + (e.movementY || 0) * .004)); });
    function end() { st.drag = false; }
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { ty += e.key === "ArrowLeft" ? -.3 : .3; e.preventDefault(); }
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") { tp += e.key === "ArrowDown" ? -.2 : .2; e.preventDefault(); }
    });
    canvas.addEventListener("tooth-material", function (e) { st.material = e.detail === "pearl" ? 1 : 0; });
    canvas.addEventListener("tooth-rotate", function () { ty += Math.PI / 2; });
    run();
    return true;
  }

  document.querySelectorAll("canvas[data-tooth-3d]").forEach(init);
  document.querySelectorAll("[data-tooth-controls]").forEach(function (box) {
    var target = document.querySelector(box.getAttribute("data-tooth-controls"));
    if (!target) return;
    box.querySelectorAll("[data-mat]").forEach(function (b) {
      b.addEventListener("click", function () {
        box.querySelectorAll("[data-mat]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        target.dispatchEvent(new CustomEvent("tooth-material", { detail: b.getAttribute("data-mat") }));
      });
    });
    var r = box.querySelector("[data-rotate]");
    if (r) r.addEventListener("click", function () { target.dispatchEvent(new Event("tooth-rotate")); });
  });
})();
`;
