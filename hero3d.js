/* =========================================================================
   HERO 3D — an interactive, noise-displaced glass orb + particle field.
   Want a Spline scene instead? Paste your Spline "Code export → Viewer" URL
   (ends with .splinecode) below and the Three.js scene is replaced by it.
   ========================================================================= */
var SPLINE_SCENE = ""; // e.g. "https://prod.spline.design/XXXX/scene.splinecode"

(() => {

const canvas = document.getElementById("hero3d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (SPLINE_SCENE) {
  canvas.remove();
  const s = document.createElement("script");
  s.type = "module";
  s.src = "https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js";
  document.head.appendChild(s);
  const v = document.createElement("spline-viewer");
  v.setAttribute("url", SPLINE_SCENE);
  document.getElementById("splineMount").appendChild(v);
} else {
  initThree();
}

function initThree() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  /* ---------- Orb with simplex-noise vertex displacement ---------- */
  const noise = /* glsl */ `
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }`;

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0.32 },
    uHover: { value: 0 },
    uColorA: { value: new THREE.Color("#5cf2ff") },
    uColorB: { value: new THREE.Color("#8b5cf6") },
    uColorC: { value: new THREE.Color("#ff7eb6") }
  };

  const orbMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uAmp; uniform float uHover;
      varying vec3 vNormal; varying vec3 vPos; varying float vDisp;
      ${noise}
      void main(){
        float n = snoise(normal * 1.35 + uTime * 0.28);
        float n2 = snoise(normal * 3.2 - uTime * 0.4) * 0.35;
        float d = (n + n2) * (uAmp + uHover * 0.22);
        vDisp = d;
        vec3 p = position + normal * d;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        vPos = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC; uniform float uTime;
      varying vec3 vNormal; varying vec3 vPos; varying float vDisp;
      void main(){
        vec3 viewDir = normalize(-vPos);
        float fres = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.4);
        float t = clamp(vDisp * 1.6 + 0.5, 0.0, 1.0);
        vec3 base = mix(uColorB, uColorA, t);
        base = mix(base, uColorC, smoothstep(0.65, 1.0, t) * 0.55);
        vec3 col = base * 0.28 + fres * mix(uColorA, uColorC, fres) * 1.25;
        float bands = smoothstep(0.48, 0.5, fract(vDisp * 9.0 + uTime * 0.12)) * 0.06;
        col += bands;
        gl_FragColor = vec4(col, 0.95);
      }`,
    transparent: true
  });

  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, window.innerWidth < 768 ? 24 : 64), orbMat);
  const group = new THREE.Group();
  group.add(orb);

  /* wireframe shell */
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.05, 2),
    new THREE.MeshBasicMaterial({ color: 0x5cf2ff, wireframe: true, transparent: true, opacity: 0.07 })
  );
  group.add(shell);

  /* orbit rings */
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.35 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.006, 8, 200), ringMat);
  ring1.rotation.x = Math.PI / 2.4;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.004, 8, 200), ringMat.clone());
  ring2.material.color.set(0x5cf2ff); ring2.material.opacity = 0.22;
  ring2.rotation.x = Math.PI / 1.8; ring2.rotation.y = 0.5;
  group.add(ring1, ring2);

  /* small satellites on ring */
  const sat = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: 0x5cf2ff }));
  const sat2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff7eb6 }));
  group.add(sat, sat2);
  scene.add(group);

  /* ---------- particle field ---------- */
  const COUNT = window.innerWidth < 768 ? 700 : 1600;
  const pos = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = 3.5 + Math.random() * 9;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
    pos[i * 3 + 2] = Math.min(r * Math.cos(ph) - 4, 2.5);
    sizes[i] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float aSize; uniform float uTime; uniform float uPR; varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(uTime*0.3 + position.x*0.5) * 0.15;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = min((aSize * 2.2 + 0.6) * uPR * (8.0 / max(-mv.z, 0.5)), 6.0 * uPR);
        vA = 0.25 + aSize * 0.6;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); if(d>0.5) discard; gl_FragColor = vec4(0.75,0.9,1.0, vA * (1.0 - d*2.0)); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ---------- interaction ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const raycaster = new THREE.Raycaster();
  let hoverTarget = 0;
  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(v, camera);
    hoverTarget = raycaster.intersectObject(orb).length ? 1 : 0;
    document.body.classList.toggle("orb-hover", hoverTarget === 1);
  });

  /* scroll-driven state, animated from main.js via GSAP */
  const state = { scroll: 0, offsetX: 0, scale: 1 };
  window.hero3d = { state, uniforms };

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    state.offsetX = w > 900 ? 2.15 : 0;
    state.baseY = w > 900 ? 0 : 0.9;
    state.baseScale = w > 900 ? 0.88 : 0.72;
  }
  layout();
  window.addEventListener("resize", layout);

  /* pause when hero is off-screen */
  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(canvas);

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    uniforms.uTime.value = reduceMotion ? 0 : t;
    uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.06;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    const s = state.scroll; // 0 → 1 while scrolling past hero
    group.position.x = state.offsetX + mouse.x * 0.25 - s * state.offsetX * 0.9;
    group.position.y = state.baseY + mouse.y * 0.2 + s * 1.2;
    const sc = state.baseScale * (1 + s * 0.6);
    group.scale.setScalar(sc);

    orb.rotation.y += dt * 0.12;
    group.rotation.x = mouse.y * 0.25 + s * 0.8;
    group.rotation.y = mouse.x * 0.35;
    shell.rotation.y -= dt * 0.05; shell.rotation.z += dt * 0.03;
    ring1.rotation.z += dt * 0.15; ring2.rotation.z -= dt * 0.1;

    sat.position.set(Math.cos(t * 0.7) * 2.45, Math.sin(t * 0.7) * 2.45 * Math.cos(Math.PI / 2.4), Math.sin(t * 0.7) * 2.45 * Math.sin(Math.PI / 2.4));
    sat2.position.set(Math.cos(-t * 0.5 + 2) * 2.75, Math.sin(-t * 0.5 + 2) * 1.2, Math.cos(t * 0.5) * 1.5);

    particles.rotation.y = t * 0.02 + mouse.x * 0.08;
    particles.rotation.x = mouse.y * 0.05;
    particles.position.y = s * 2;

    renderer.render(scene, camera);
  }
  tick();
  document.documentElement.classList.add("has-3d");
}
})();
