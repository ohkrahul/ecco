import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { reduced } from './deck.js';

const LEATHER = '#e9e2d5';
const GLOW = new THREE.Color('#9fd3a6'); // --sage-light
const MODEL_URL = '/models/shoe.glb';
const FOV = 30;

/** Visible world width at the shoe's plane for a w×h window: the shoe is 2 units long and fills ~43% of a landscape
 *  screen (80% of a portrait one). Also used by the loading screen to size its drawing like the 3D shoe. */
export function viewWidth(w, h) {
  const perUnit = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * (w / h); // visible width at distance 1
  const share = w < h ? 0.8 : 0.43;
  return Math.max(4.6, 2 / (share * perUnit)) * perUnit;
}

/** Default pose. Each shoe slide owns one pose object and tweens it. */
export const basePose = () => ({
  rotX: 0.28, rotY: -0.6, rotZ: 0, x: 0, y: 0, scale: 1,
  sweep: 0, // 0..1 position of the x-ray cut, left → right
  xray: 0, // 0..1 glow-plane opacity
  visible: 1, // canvas opacity
  idle: 1, // 0..1 amount of idle sway + cursor tilt
});

/**
 * One fixed full-screen canvas shared by hero, craft and finale.
 * Resolves to null (and sets html.no-webgl) when WebGL or the model fails, or with ?nowebgl.
 */
export async function createStage(canvas, { onProgress = () => {} } = {}) {
  if (new URLSearchParams(location.search).has('nowebgl')) return fail();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return fail();
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const key = new THREE.DirectionalLight('#ffe8cf', 2.4);
  key.position.set(2.5, 5, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 8;
  Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 20 });
  const rim = new THREE.DirectionalLight('#b8c4ca', 1.6);
  rim.position.set(-4, 2.5, -3);
  scene.add(key, rim, new THREE.AmbientLight('#ffffff', 0.2));

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.28 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const gltf = await new Promise((resolve) =>
    new GLTFLoader().load(MODEL_URL, resolve, (e) => e.total && onProgress(e.loaded / e.total), () => resolve(null)),
  );
  if (!gltf) {
    renderer.dispose();
    return fail();
  }
  onProgress(1);

  // Normalise: longest side = 2 units, centred, length along X (side profile faces the camera).
  const model = gltf.scene;
  const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  const orient = new THREE.Group();
  orient.add(model);
  if (size.z > size.x) orient.rotation.y = Math.PI / 2;
  const box = new THREE.Box3().setFromObject(orient);
  const k = 2 / Math.max(size.x, size.y, size.z);
  orient.scale.setScalar(k);
  orient.position.copy(box.getCenter(new THREE.Vector3())).multiplyScalar(-k);
  const shoe = new THREE.Group();
  shoe.add(orient);
  scene.add(shoe);

  // Leather keeps x >= cut, the glowing wireframe keeps x <= cut.
  const leatherClip = new THREE.Plane(new THREE.Vector3(1, 0, 0), 2);
  const wireClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: GLOW, wireframe: true, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, clippingPlanes: [wireClip],
  });
  const meshes = [];
  model.traverse((o) => o.isMesh && meshes.push(o));
  const wires = meshes.map((mesh) => {
    mesh.castShadow = true;
    for (const m of [mesh.material].flat()) {
      m.map = null; // drop the variant colourway: neutral cream leather, like the key visuals
      m.color.set(LEATHER);
      m.clippingPlanes = [leatherClip];
      m.clipShadows = true;
      m.needsUpdate = true;
    }
    const wire = new THREE.Mesh(mesh.geometry, wireMat);
    wire.visible = false;
    mesh.add(wire);
    return wire;
  });

  const glowMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: GLOW }, uOpacity: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
      void main(){
        float d = abs(vUv.x - 0.5) * 2.0;
        float g = exp(-d * 22.0) + exp(-d * 4.0) * 0.28;
        float fy = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
        gl_FragColor = vec4(uColor * g, g * fy * uOpacity);
      }`,
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.8), glowMat);
  glow.renderOrder = 10;
  scene.add(glow);

  // Cursor tilt (lerped every frame).
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    tilt.tx = (e.clientY / innerHeight - 0.5) * 0.18;
    tilt.ty = (e.clientX / innerWidth - 0.5) * 0.3;
  });

  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    // ponytail: pixel budget ~3.7 MP keeps 4K projectors smooth; raise if the pitch laptop has a strong GPU.
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(3.7e6 / (w * h))));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const distance = viewWidth(w, h) / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * camera.aspect);
    camera.position.set(0, 0.32, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const poses = new Map();
  const anchors = new Map(); // pose name → element the shoe stays centred on (its slide's .shoe-slot)
  const order = []; // active pose keys, most recent last
  const clock = new THREE.Clock();
  let fading = null; // pose that just left the screen; keep drawing it until its own tween fades it out
  let fadeStart = 0;
  let lost = false;

  // A projector hot-plug can reset the GPU: fall back to the still image rather than a blank hero.
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    setActive(false);
    document.documentElement.classList.add('no-webgl');
  });

  function render() {
    const name = order[order.length - 1] ?? fading;
    const p = poses.get(name);
    if (!p) return;
    if (!order.length && (p.visible < 0.01 || performance.now() - fadeStart > 1500)) {
      fading = null;
      setActive(false);
      return;
    }
    canvas.style.opacity = p.visible;
    if (p.visible < 0.001) return; // nothing to see: skip the (shadowed) render
    const t = clock.getElapsedTime();
    tilt.x += (tilt.tx - tilt.x) * 0.06;
    tilt.y += (tilt.ty - tilt.y) * 0.06;
    shoe.rotation.set(
      p.rotX + tilt.x * p.idle,
      p.rotY + (Math.sin(t * 0.4) * 0.32 + tilt.y) * p.idle,
      p.rotZ,
    );
    // Follow the anchor: in the deck the shoe glides with its slide, in scroll mode it scrolls with it.
    const box = anchors.get(name)?.getBoundingClientRect();
    if (box && (box.bottom < 0 || box.top > innerHeight)) return void (canvas.style.opacity = 0); // its slot is off screen
    const unit = viewWidth(innerWidth, innerHeight) / innerWidth; // world units per screen px
    const x = p.x + (box ? (box.left + box.width / 2 - innerWidth / 2) * unit : 0);
    const y = p.y - (box ? (box.top + box.height / 2 - innerHeight / 2) * unit : 0);
    shoe.position.set(x, y + Math.sin(t * 1.1) * 0.035 * p.idle, 0);
    shoe.scale.setScalar(p.scale);
    floor.position.y = y - 0.62 * p.scale;

    const cut = THREE.MathUtils.lerp(-1.4, 1.4, p.sweep) * p.scale + x;
    leatherClip.constant = -cut;
    wireClip.constant = cut;
    const xrayOn = p.sweep > 0.001;
    for (const w of wires) w.visible = xrayOn;
    glow.position.set(cut, y, 0.4);
    glow.visible = p.xray > 0.001;
    glowMat.uniforms.uOpacity.value = p.xray;
    renderer.render(scene, camera);
  }

  let active = false;
  function setActive(on) {
    if (lost) on = false;
    if (on === active) return;
    active = on;
    if (on) gsap.ticker.add(render);
    else {
      gsap.ticker.remove(render);
      canvas.style.opacity = 0;
    }
  }

  /** Mark a slide as on screen (the most recently shown one drives the shoe). */
  function want(name, on) {
    const wasTop = order[order.length - 1] === name;
    const i = order.indexOf(name);
    if (i >= 0) order.splice(i, 1);
    if (on) order.push(name);
    fading = !on && wasTop && !order.length && !reduced ? name : order.length ? null : fading;
    if (fading) fadeStart = performance.now();
    setActive(order.length > 0 || !!fading);
  }

  return {
    canvas,
    /** A slide arrives: reset its pose to `values`, draw it centred on `anchor`. Returns the pose to tween. */
    show(name, values = {}, anchor = null) {
      const p = poses.get(name) ?? {};
      gsap.killTweensOf(p);
      poses.set(name, Object.assign(p, basePose(), values));
      anchors.set(name, anchor);
      want(name, true);
      return p;
    },
    /** The slide is leaving: fade its shoe out. */
    hide(name) {
      const p = poses.get(name);
      if (p) gsap.to(p, { visible: 0, duration: reduced ? 0 : 0.4 });
      want(name, false);
    },
    render,
  };
}

function fail() {
  document.documentElement.classList.add('no-webgl');
  return null;
}
