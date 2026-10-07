/* =========================================================================
   HERO — real-time "energy core" drawn with a WebGL fragment shader.
   Crisp at any resolution (no video), and it reacts to the visitor:
     · move     → the core leans toward the cursor and reaches out a tendril
     · drag     → grab the core and fling it; it springs back home
     · click/tap→ shockwave + a bolt of energy fired at that point
   Colours come from the CSS variables --c1 / --c2 / --c3 (see style.css).
   Want a Spline scene instead? Paste your Spline "Code export → Viewer" URL
   (ends with .splinecode) below and the shader is replaced by it.
   ========================================================================= */
var SPLINE_SCENE = ""; // e.g. "https://prod.spline.design/XXXX/scene.splinecode"

(() => {
const canvas = document.getElementById("hero3d");
const hero = document.getElementById("hero");
if (!canvas) return;

if (SPLINE_SCENE) {
  const s = document.createElement("script");
  s.type = "module";
  s.src = "https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js";
  document.head.appendChild(s);
  const v = document.createElement("spline-viewer");
  v.setAttribute("url", SPLINE_SCENE);
  v.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  canvas.replaceWith(v);
  v.id = "hero3d";
  return;
}

const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
if (!gl) { canvas.remove(); document.documentElement.classList.add("no-webgl"); return; }

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const css = getComputedStyle(document.documentElement);
const hex = (n, f) => {
  const h = (css.getPropertyValue(n).trim() || f).replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/* ---------- shader ---------- */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uScroll;
uniform vec2 uMouse; uniform float uHover;
uniform vec2 uCore; uniform float uCoreR; uniform float uPulse; uniform float uGrab;
uniform vec3 uSat[3];
uniform vec2 uClick; uniform float uClickT;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
const mat2 R = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = R * p; a *= 0.5; } return v; }
float fbm3(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ v += a * noise(p); p = R * p; a *= 0.5; } return v; }

/* a wobbling plasma strand from a to b — returns distance to the strand */
float strand(vec2 p, vec2 a, vec2 b, float seed, float amp){
  vec2 ab = b - a; float L = max(length(ab), 1e-3); vec2 dir = ab / L; vec2 n = vec2(-dir.y, dir.x);
  float h = clamp(dot(p - a, dir) / L, 0.0, 1.0);
  float side = dot(p - a, n);
  if (abs(side) > 0.35 * L + 0.12) return 1.0;           // far away: skip the noise
  float env = sin(h * 3.14159);
  float off = (fbm3(vec2(h * 2.6 - uTime * 0.9, seed)) - 0.5) * amp * L * env
            + (noise(vec2(h * 14.0 - uTime * 4.0, seed * 3.1)) - 0.5) * 0.045 * env;
  return length(p - (a + ab * h + n * off));
}
vec3 tendril(vec2 p, vec2 a, vec2 b, float seed, float k){
  float d1 = strand(p, a, b, seed, 0.55);
  float d2 = strand(p, a, b, seed + 7.3, 0.4);
  float g = 0.0016 / (d1 + 0.002) + 0.0011 / (d2 + 0.002);
  float halo = 0.012 / (min(d1, d2) + 0.03);
  return (mix(uC2, uC3, 0.35) * halo * 0.35 + mix(uC1, vec3(1.0), 0.4) * g) * k;
}

/* turbulent plasma ball */
vec3 plasma(vec2 p, vec2 c, float r, float seed, float k){
  vec2 d = (p - c) / r; float l = length(d);
  vec3 col = vec3(0.0);
  if (l < 1.5) {
    float z = sqrt(max(0.0, 1.0 - l * l));
    vec2 sp = d / (z + 0.55);
    float n1 = fbm(sp * 1.8 + vec2(uTime * 0.32 + seed, -uTime * 0.21));
    float n2 = fbm(sp * 3.6 - vec2(uTime * 0.45, seed - uTime * 0.12) + n1 * 1.5);
    float e = n1 * n2 * 4.0;
    float edge = smoothstep(1.3, 0.35 + 0.5 * n2, l);
    vec3 hot = mix(mix(uC2, uC3, smoothstep(0.35, 0.75, n1)), uC1, smoothstep(0.5, 0.85, n2));
    hot = mix(hot, vec3(1.0), smoothstep(1.1, 1.7, e) * 0.7);
    col += hot * pow(e, 2.2) * edge * 0.95;
    col += uC2 * 0.35 * smoothstep(1.05, 0.9, l) * smoothstep(0.6, 1.0, l); // thin rim
  }
  col += vec3(0.8, 0.9, 1.0) * exp(-l * 6.0) * 0.55;       // white-hot centre
  col += mix(uC2, uC3, 0.3) * 0.06 / (l * l * 0.7 + 0.08); // halo
  return col * k;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  uv.y -= uScroll * 0.25;

  /* click shockwave bends space */
  vec2 dc = uv - uClick; float dl = length(dc);
  float ringR = uClickT * 0.95;
  float ring = exp(-pow((dl - ringR) * 16.0, 2.0)) * exp(-uClickT * 1.5);
  uv -= dc / (dl + 1e-4) * ring * 0.035;

  vec2 par = uMouse * 0.035 * uHover;
  float t = uTime * 0.035;

  /* deep nebula */
  vec2 q = uv * 1.3 + par;
  vec2 w = vec2(fbm3(q + vec2(0.0, t)), fbm3(q + vec2(5.2, 1.3) - t));
  float fog = fbm(q + 1.8 * w + t);
  vec3 col = vec3(0.012, 0.016, 0.03);
  col += uC2 * 0.16 * smoothstep(0.35, 0.95, fog);
  col += uC1 * 0.07 * smoothstep(0.55, 1.0, fbm3(q * 0.8 + w * 2.0 - t));
  col += uC2 * 0.09 * exp(-length(uv - uCore) * 1.6);           // core lights the fog
  col += uC1 * 0.08 * fog * exp(-length(uv - uMouse) * 3.0) * uHover; // cursor lights the fog

  /* stars */
  vec2 sg = (uv + par * 2.5) * 55.0; vec2 id = floor(sg); vec2 f = fract(sg) - 0.5;
  float h = hash(id);
  float star = step(0.982, h) * smoothstep(0.09, 0.0, length(f - (vec2(hash(id + 1.3), hash(id + 2.7)) - 0.5) * 0.6));
  col += star * (0.35 + 0.35 * sin(uTime * 1.7 + h * 50.0)) * vec3(0.8, 0.88, 1.0);

  /* energy: tendrils core → satellites, → cursor, → last click */
  float boost = 1.0 + uPulse * 1.6;
  for (int i = 0; i < 3; i++) {
    vec3 s = uSat[i];
    float depth = 0.45 + 0.55 * smoothstep(0.6, 1.1, s.z);
    col += tendril(uv, uCore, s.xy, float(i) * 3.7 + 1.0, depth * boost * 0.8);
  }
  float reach = uHover * smoothstep(1.4, 0.15, length(uMouse - uCore)) * (0.55 + uGrab * 0.6);
  if (reach > 0.01) {
    col += tendril(uv, uCore, uMouse, 21.0, reach * boost);
    col += plasma(uv, uMouse, 0.022, 4.0, reach * 0.6);
  }
  float bolt = exp(-uClickT * 2.8);
  if (bolt > 0.01) col += tendril(uv, uCore, uClick, 33.0 + floor(uClickT * 9.0), bolt * 1.6);
  col += mix(uC1, vec3(1.0), 0.3) * ring * 0.45;

  /* satellites (dimmed when behind the core) then the core itself */
  for (int i = 0; i < 3; i++) {
    vec3 s = uSat[i];
    col += plasma(uv, s.xy, uCoreR * 0.32 * s.z, float(i) * 9.1, (0.35 + 0.65 * smoothstep(0.7, 1.1, s.z)) * (1.0 + uPulse));
  }
  col += plasma(uv, uCore, uCoreR * (1.0 + uPulse * 0.25 + uGrab * 0.1), 0.0, 1.0 + uPulse * 0.8);

  /* finishing: tone-map, vignette, scroll fade */
  col = 1.0 - exp(-col * 1.15);
  vec2 vq = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - dot(vq, vq) * 0.9;
  col *= 1.0 - uScroll * 0.85;
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0; // dither, no banding
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
let prog;
try {
  prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
} catch (err) {
  console.warn("[hero] shader failed, using static background", err);
  canvas.remove(); document.documentElement.classList.add("no-webgl"); return;
}
gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aP = gl.getAttribLocation(prog, "p");
gl.enableVertexAttribArray(aP);
gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
const U = {};
["uRes", "uTime", "uScroll", "uMouse", "uHover", "uCore", "uCoreR", "uPulse", "uGrab", "uSat", "uClick", "uClickT", "uC1", "uC2", "uC3"]
  .forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
gl.uniform3fv(U.uC1, hex("--c1", "#7ad7ff"));
gl.uniform3fv(U.uC2, hex("--c2", "#4d7cff"));
gl.uniform3fv(U.uC3, hex("--c3", "#a5b4fc"));

/* ---------- sizing: render below native res (the look is soft anyway) and adapt to the GPU ---------- */
let quality = window.innerWidth < 768 ? 0.55 : 0.7;
let W = 1, H = 1, aspect = 1;
function layout() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const s = Math.min(window.devicePixelRatio || 1, 2) * quality;
  W = Math.max(2, Math.round(w * s)); H = Math.max(2, Math.round(h * s));
  canvas.width = W; canvas.height = H;
  aspect = w / h;
  gl.viewport(0, 0, W, H);
  home = homeSpot();
}

/* ---------- scene state (shader space: y up, height = 1, centre = 0,0) ---------- */
const narrow = () => aspect < 0.95;
function homeSpot() { return narrow() ? { x: 0, y: 0.27 } : { x: aspect * 0.23, y: 0.04 }; }
let home = { x: 0.4, y: 0.04 };
const core = { x: 0.4, y: 0.04, vx: 0, vy: 0 };
const mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
let hover = 0, grab = 0, pulse = 0, dragging = false, spin = 0;
let click = { x: 9, y: 9, t: 99 };
const state = { scroll: 0 };
window.hero3d = { state };

function toShader(e) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width - 0.5) * (r.width / r.height), y: (0.5 - (e.clientY - r.top) / r.height) };
}
const coreR = () => (narrow() ? 0.1 : 0.115);
const nearCore = (p) => Math.hypot(p.x - core.x, p.y - core.y) < coreR() * 1.6;

/* cursor ring shows "DRAG" over the core (desktop only) */
const cursor = document.querySelector(".cursor");
const cursorLabel = document.querySelector(".cursor__label");
function setCursor(on) {
  if (!cursor) return;
  cursor.classList.toggle("is-grab", on);
  if (on) cursorLabel.textContent = dragging ? "FLING" : "DRAG";
}

hero.addEventListener("pointermove", (e) => {
  const p = toShader(e);
  mouse.tx = p.x; mouse.ty = p.y; mouse.inside = e.pointerType === "mouse" || e.pointerType === "pen";
  if (mouse.inside && !e.target.closest("a, button")) setCursor(dragging || nearCore(p));
});
hero.addEventListener("pointerleave", () => { mouse.inside = false; if (!dragging) setCursor(false); });
hero.addEventListener("pointerdown", (e) => {
  if (e.target.closest("a, button")) return;
  const p = toShader(e);
  if (e.pointerType !== "touch" && nearCore(p)) {
    dragging = true; hero.setPointerCapture(e.pointerId); setCursor(true);
    e.preventDefault();
  } else {
    click = { x: p.x, y: p.y, t: 0 };
    pulse = 1;
  }
});
const release = () => {
  if (!dragging) return;
  dragging = false; pulse = 1; spin = 3;
  click = { x: core.x, y: core.y, t: 0 };
  setCursor(mouse.inside && nearCore({ x: mouse.x, y: mouse.y }));
};
hero.addEventListener("pointerup", release);
hero.addEventListener("pointercancel", release);

/* ---------- loop ---------- */
let visible = true;
new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(canvas);
layout();
window.addEventListener("resize", layout);
new ResizeObserver(layout).observe(canvas);

const sats = new Float32Array(9);
let last = performance.now(), time = reduceMotion ? 14 : 0, orbit = 0;
let slowFrames = 0, fastFrames = 0;

(function tick(now) {
  requestAnimationFrame(tick);
  if (!visible) { last = now; return; }
  const dt = Math.min((now - last) / 1000, 0.05) || 0.016;
  last = now;

  /* adaptive resolution: drop quality on slow GPUs, recover when there's headroom */
  if (dt > 0.03) slowFrames++; else if (dt < 0.019) fastFrames++;
  if (slowFrames > 20 && quality > 0.35) { quality -= 0.1; slowFrames = fastFrames = 0; layout(); }
  if (fastFrames > 240 && quality < 0.7) { quality += 0.05; slowFrames = fastFrames = 0; layout(); }

  if (!reduceMotion) time += dt;
  mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 10);
  mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 10);
  hover += ((mouse.inside ? 1 : 0) - hover) * Math.min(1, dt * 4);
  grab += ((dragging ? 1 : 0) - grab) * Math.min(1, dt * 8);
  pulse *= Math.exp(-dt * 2.2);
  click.t += dt;

  /* core: spring toward home (or the cursor while dragged), leaning slightly toward the cursor */
  let tx = home.x, ty = home.y + (reduceMotion ? 0 : Math.sin(time * 0.6) * 0.015);
  if (dragging) { tx = mouse.x; ty = mouse.y; }
  else if (hover > 0.01) { tx += (mouse.x - home.x) * 0.06 * hover; ty += (mouse.y - home.y) * 0.06 * hover; }
  const k = dragging ? 140 : 38, damp = dragging ? 16 : 5.5;
  core.vx += ((tx - core.x) * k - core.vx * damp) * dt;
  core.vy += ((ty - core.y) * k - core.vy * damp) * dt;
  core.x += core.vx * dt; core.y += core.vy * dt;

  /* satellites orbit on tilted 3D rings; z drives size and depth */
  spin *= Math.exp(-dt * 1.5);
  if (!reduceMotion) orbit += dt * (1 + spin + pulse);
  const R = narrow() ? 0.2 : 0.3;
  for (let i = 0; i < 3; i++) {
    const a = orbit * (0.42 + i * 0.13) + i * 2.1;
    const rad = R * (1 + i * 0.22);
    const tilt = 0.32 + i * 0.12, roll = -0.5 + i * 0.55;
    const ox = Math.cos(a) * rad, oy = Math.sin(a) * rad * tilt, oz = Math.sin(a);
    sats[i * 3] = core.x + ox * Math.cos(roll) - oy * Math.sin(roll);
    sats[i * 3 + 1] = core.y + ox * Math.sin(roll) + oy * Math.cos(roll);
    sats[i * 3 + 2] = 0.85 + oz * 0.25;
  }

  gl.uniform2f(U.uRes, W, H);
  gl.uniform1f(U.uTime, time);
  gl.uniform1f(U.uScroll, state.scroll);
  gl.uniform2f(U.uMouse, mouse.x, mouse.y);
  gl.uniform1f(U.uHover, hover);
  gl.uniform2f(U.uCore, core.x, core.y);
  gl.uniform1f(U.uCoreR, coreR());
  gl.uniform1f(U.uPulse, pulse);
  gl.uniform1f(U.uGrab, grab);
  gl.uniform3fv(U.uSat, sats);
  gl.uniform2f(U.uClick, click.x, click.y);
  gl.uniform1f(U.uClickT, click.t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
})(performance.now());

document.documentElement.classList.add("has-3d");
})();
