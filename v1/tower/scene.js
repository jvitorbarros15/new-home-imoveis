import {
  ACESFilmicToneMapping, AmbientLight, BoxGeometry, CanvasTexture, CircleGeometry, Color, CylinderGeometry,
  DirectionalLight, Group, IcosahedronGeometry, InstancedMesh, MathUtils, Mesh, MeshPhysicalMaterial,
  MeshStandardMaterial, Object3D, PCFShadowMap, PerspectiveCamera, PlaneGeometry, PMREMGenerator,
  RepeatWrapping, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const { clamp, lerp, smoothstep } = MathUtils;
const ease = (t) => t * t * (3 - 2 * t);
const outCubic = (t) => 1 - Math.pow(1 - t, 3);

const FLOOR_H = 0.3;
const PENT_H = 0.34;
const W = 2.9;
const D = 1.25;
const PODIUM_W = 6.2;
const PODIUM_D = 3.4;
const PODIUM_Z = 0.35;
const PODIUM_H = [0.55, 0.42];
const GROUP_GAP = [0, 1.5, 3.1];
const FLOOR_SPREAD = 0.2;
const GOLD = 0xd6ae55;

const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const boxAt = (w, h, d, x, y, z) => {
  const geometry = new BoxGeometry(w, h, d);
  geometry.translate(x, y, z);
  return geometry;
};

function windowTextures(variants, cells, random) {
  const make = (draw) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;
    draw(canvas.getContext("2d"), canvas.width, canvas.height);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.anisotropy = 4;
    return texture;
  };
  const cellW = 1024 / cells;
  const pane = (ctx, i, h, fill) => {
    ctx.fillStyle = fill;
    ctx.fillRect(i * cellW + 7, 12, cellW - 14, h - 24);
  };
  const base = make((ctx, w, h) => {
    ctx.fillStyle = "#101216";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < cells; i += 1) {
      const gradient = ctx.createLinearGradient(0, 12, 0, h - 12);
      gradient.addColorStop(0, "#3d4752");
      gradient.addColorStop(1, "#1a1f26");
      pane(ctx, i, h, gradient);
    }
  });
  const warm = ["#ffd9a0", "#ffc678", "#fff1d6", "#ffb85c"];
  const lit = Array.from({ length: variants }, () => make((ctx, w, h) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < cells; i += 1) {
      if (random() < 0.62) pane(ctx, i, h, warm[Math.floor(random() * warm.length)]);
    }
  }));
  return { base, lit };
}

const BALCONIES = [
  [[-W * 0.24, W * 0.4], [W * 0.24, W * 0.4]],
  [[0, W * 0.86]],
];

function balconyGeometries(lite) {
  const front = D / 2;
  return BALCONIES.map((segments) => {
    const slab = mergeGeometries([
      boxAt(W + 0.16, 0.05, D + 0.16, 0, 0.025, 0),
      ...segments.map(([x, w]) => boxAt(w, 0.05, 0.3, x, 0.025, front + 0.23)),
    ]);
    const guard = lite ? null : mergeGeometries(segments.map(([x, w]) => boxAt(w, 0.16, 0.012, x, 0.13, front + 0.37)));
    const rail = mergeGeometries([
      ...segments.map(([x, w]) => boxAt(w, 0.012, 0.02, x, 0.215, front + 0.37)),
      ...[-1, 1].map((side) => boxAt(0.014, FLOOR_H, 0.014, side * (W / 2 - 0.05), FLOOR_H / 2, front - 0.04)),
    ]);
    return { slab, guard, rail };
  });
}

export function createTower(canvas, options = {}) {
  const lite = !!options.lite;
  const random = rng(7);
  const renderer = new WebGLRenderer({
    canvas,
    antialias: !lite,
    alpha: true,
    powerPreference: lite ? "default" : "high-performance",
    preserveDrawingBuffer: !!options.preserve,
  });
  renderer.setPixelRatio(options.pixelRatio || 1);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();

  const camera = new PerspectiveCamera(28, 1, 0.5, 90);
  const sun = new DirectionalLight(0xffb066, 3);
  sun.castShadow = true;
  const shadowSize = lite ? 1024 : 2048;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 10, bottom: -6, near: 1, far: 70 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target, new AmbientLight(0x8d9bb8, 0.18));

  const concrete = new MeshStandardMaterial({ color: 0xcfc8b8, roughness: 0.9 });
  const darkConcrete = new MeshStandardMaterial({ color: 0x3a3733, roughness: 0.9 });
  const core = new MeshStandardMaterial({ color: 0x16181c, roughness: 0.4, metalness: 0.2 });
  const glass = new MeshPhysicalMaterial({
    color: 0x27303a, roughness: 0.06, transparent: true, opacity: 0.4, envMapIntensity: 1.4, depthWrite: false,
  });
  const gold = new MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 1 });
  const water = new MeshStandardMaterial({ color: 0x2c7782, roughness: 0.12, metalness: 0.1, emissive: 0x1a6a76, emissiveIntensity: 0.25 });
  const lawn = new MeshStandardMaterial({ color: 0x4d5d40, roughness: 1 });
  const crowns = new MeshStandardMaterial({ color: 0x55664a, roughness: 1, flatShading: true });
  const trunks = new MeshStandardMaterial({ color: 0x3b3128, roughness: 1 });
  const stone = new MeshStandardMaterial({ color: 0x9d9486, roughness: 0.95 });

  const variants = lite ? 2 : 4;
  const textures = windowTextures(variants, 6, random);
  const windowMats = textures.lit.map((emissiveMap) => new MeshStandardMaterial({
    map: textures.base, roughness: 0.3, metalness: 0.15, emissive: 0xffffff, emissiveMap, emissiveIntensity: 0,
  }));

  const fade = document.createElement("canvas");
  fade.width = fade.height = 256;
  const fadeCtx = fade.getContext("2d");
  const gradient = fadeCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(0.45, "#fff");
  gradient.addColorStop(1, "#000");
  fadeCtx.fillStyle = gradient;
  fadeCtx.fillRect(0, 0, 256, 256);
  const ground = new Mesh(
    new CircleGeometry(16, 64),
    new MeshStandardMaterial({ color: 0x2e2820, roughness: 1, transparent: true, alphaMap: new CanvasTexture(fade) }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  const solid = (mesh, cast = true, receive = true) => {
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    return mesh;
  };
  const block = (w, h, d, x, y, z, material, cast = true, receive = true) =>
    solid(new Mesh(boxAt(w, h, d, x, y, z), material), cast, receive);

  const garden = new Group();
  scene.add(garden);
  const frontEdge = PODIUM_Z + PODIUM_D / 2;
  garden.add(
    block(PODIUM_W + 1.4, 0.04, 2.1, 0, 0.02, frontEdge + 1.55, lawn, false),
    block(2.4, 0.045, 1.2, -3.4, 0.02, frontEdge + 3.6, lawn, false),
    block(1.6, 0.05, 3.6, 0, 0.025, frontEdge + 1.8, stone, false),
  );
  const treeCount = lite ? 10 : 22;
  const treeCrowns = new InstancedMesh(new IcosahedronGeometry(0.3, 1), crowns, treeCount);
  const treeTrunks = new InstancedMesh(new CylinderGeometry(0.025, 0.035, 0.3, 6), trunks, treeCount);
  const dummy = new Object3D();
  for (let i = 0; i < treeCount; i += 1) {
    const side = i % 2 ? 1 : -1;
    const x = side * (2.2 + random() * 2.6) + (random() - 0.5) * 0.6;
    const z = frontEdge + 0.7 + random() * 3.2;
    const scale = 0.7 + random() * 0.7;
    dummy.position.set(x, 0.15 * scale, z);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    treeTrunks.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 0.42 * scale, z);
    dummy.scale.set(scale, scale * 1.15, scale);
    dummy.updateMatrix();
    treeCrowns.setMatrixAt(i, dummy.matrix);
  }
  treeCrowns.castShadow = treeTrunks.castShadow = true;
  garden.add(treeCrowns, treeTrunks);

  const balconies = balconyGeometries(lite);
  const floors = [];
  const tower = new Group();
  scene.add(tower);

  const addFloor = (group, height, build) => {
    const root = new Group();
    build(root);
    tower.add(root);
    floors.push({ root, group, height, baseY: 0, index: floors.length });
  };

  const facade = (root, mat, w, h, x, y, z, flip, cells = 1) => {
    const plane = new Mesh(new PlaneGeometry(w, h), mat);
    const uv = plane.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i += 1) uv.setX(i, uv.getX(i) * cells);
    plane.position.set(x, y, z);
    if (flip) plane.rotation.y = Math.PI;
    root.add(plane);
  };

  addFloor(0, PODIUM_H[0], (root) => {
    const h = PODIUM_H[0];
    root.add(block(PODIUM_W, 0.05, PODIUM_D, 0, 0.025, PODIUM_Z, concrete));
    root.add(block(PODIUM_W - 0.3, h - 0.05, PODIUM_D - 0.3, 0, 0.05 + (h - 0.05) / 2, PODIUM_Z, core));
    facade(root, windowMats[0], PODIUM_W - 0.4, h - 0.14, 0, 0.05 + (h - 0.05) / 2, frontEdge - 0.145, false, 2);
    root.add(new Mesh(boxAt(PODIUM_W + 0.1, 0.014, 0.014, 0, h, frontEdge - 0.14), gold));
  });

  addFloor(0, PODIUM_H[1], (root) => {
    root.add(block(PODIUM_W, 0.06, PODIUM_D, 0, 0.03, PODIUM_Z, concrete));
    root.add(block(3.6, 0.02, 1.2, -0.4, 0.07, PODIUM_Z + 0.95, stone, false));
    root.add(block(3.4, 0.03, 1.0, -0.4, 0.085, PODIUM_Z + 0.95, water, false));
    for (let i = 0; i < 5; i += 1) root.add(block(0.3, 0.05, 0.12, 1.65, 0.1, PODIUM_Z + 0.35 + i * 0.28, concrete));
    root.add(new Mesh(boxAt(PODIUM_W - 0.05, 0.1, 0.012, 0, 0.11, frontEdge - 0.02), glass));
    root.add(new Mesh(boxAt(PODIUM_W - 0.05, 0.012, 0.02, 0, 0.165, frontEdge - 0.02), gold));
    [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.4], [0.45, 0.4]].forEach(([x, z]) => root.add(block(0.022, 0.34, 0.022, 2.5 + x, 0.23, PODIUM_Z + 1.2 + z, gold)));
    root.add(block(1.1, 0.02, 0.9, 2.5, 0.4, PODIUM_Z + 1.2, darkConcrete));
    for (let i = 0; i < (lite ? 2 : 4); i += 1) {
      const bush = solid(new Mesh(new IcosahedronGeometry(0.17, 1), crowns));
      bush.position.set(-2.6 + i * 0.5, 0.25, PODIUM_Z - 0.3);
      root.add(bush);
    }
  });

  const aptCount = lite ? 11 : 20;
  for (let i = 0; i < aptCount; i += 1) {
    const geo = balconies[i % 2];
    addFloor(1, FLOOR_H, (root) => {
      root.add(solid(new Mesh(geo.slab, concrete)));
      root.add(block(W - 0.1, FLOOR_H - 0.05, D - 0.1, 0, 0.05 + (FLOOR_H - 0.05) / 2, 0, core, true, false));
      if (geo.guard) root.add(new Mesh(geo.guard, glass));
      root.add(new Mesh(geo.rail, gold));
      const y = 0.05 + (FLOOR_H - 0.05) / 2;
      facade(root, windowMats[i % variants], W - 0.14, FLOOR_H - 0.11, 0, y, (D - 0.1) / 2 + 0.002, false);
      facade(root, windowMats[(i + 1) % variants], W - 0.14, FLOOR_H - 0.11, 0, y, -(D - 0.1) / 2 - 0.002, true);
    });
  }

  const pentW = W * 0.78;
  const pentD = D * 0.92;
  for (let i = 0; i < 2; i += 1) {
    addFloor(2, PENT_H, (root) => {
      const y = 0.06 + (PENT_H - 0.06) / 2;
      root.add(block(W + 0.3, 0.06, D + 0.8, 0, 0.03, 0.3, concrete));
      root.add(block(pentW, PENT_H - 0.06, pentD, 0, y, -0.12, core, true, false));
      root.add(new Mesh(boxAt(W + 0.3, 0.14, 0.012, 0, 0.13, D / 2 + 0.69), glass));
      root.add(new Mesh(boxAt(W + 0.3, 0.012, 0.02, 0, 0.205, D / 2 + 0.69), gold));
      facade(root, windowMats[(i + 2) % variants], pentW - 0.1, PENT_H - 0.14, 0, y, -0.12 + pentD / 2 + 0.002, false);
      facade(root, windowMats[i % variants], pentW - 0.1, PENT_H - 0.14, 0, y, -0.12 - pentD / 2 - 0.002, true);
      if (i === 0) {
        const plant = solid(new Mesh(new IcosahedronGeometry(0.1, 1), crowns));
        plant.position.set(W / 2 - 0.1, 0.15, D / 2 + 0.55);
        root.add(plant);
      }
    });
  }

  addFloor(2, 0.1, (root) => {
    root.add(block(W + 0.55, 0.07, D + 0.9, 0, 0.035, 0.28, concrete));
    root.add(new Mesh(boxAt(W + 0.57, 0.012, D + 0.92, 0, 0.076, 0.28), gold));
    root.add(block(0.5, 0.12, 0.3, -0.8, 0.13, -0.1, darkConcrete));
    const mast = solid(new Mesh(new CylinderGeometry(0.008, 0.016, 0.9, 8), gold));
    mast.position.set(0.7, 0.52, -0.1);
    root.add(mast);
  });

  const groups = [[], [], []];
  let stackY = 0;
  floors.forEach((floor) => {
    floor.baseY = stackY;
    floor.slot = groups[floor.group].length;
    groups[floor.group].push(floor);
    stackY += floor.height;
  });
  const towerHeight = stackY;

  const labelAnchors = {
    apartamentos: { group: 1, x: -W / 2 - 0.2, z: D / 2, ratio: 0.5 },
    coberturas: { group: 2, x: W / 2 + 0.2, z: D / 2, ratio: 0.45 },
    lazer: { group: 0, x: -PODIUM_W / 2 + 0.2, z: frontEdge, ratio: 0.8 },
  };

  const state = { assemble: options.assembled ? 1 : 0, p: 0, shift: 0.2, explode: 0 };
  const drag = { x: 0, y: 0, tx: 0, ty: 0 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let width = 1;
  let height = 1;
  let dirty = true;
  let lastKey = "";
  const sunColors = [new Color(0xffb066), new Color(0xff9a52), new Color(0x93a0e0)];
  const tmp = new Color();
  const lift = new Map();
  const target = new Vector3();
  const anchor = new Vector3();

  const explodeAt = (p) => ease(smoothstep(p, 0.24, 0.48)) * (1 - ease(smoothstep(p, 0.62, 0.84)));

  function pose() {
    const p = state.p;
    const e = explodeAt(p);
    state.explode = e;
    const rise = towerHeight * 1.15;
    floors.forEach((floor) => {
      const delay = (floor.index / floors.length) * 0.5;
      const t = outCubic(clamp((state.assemble - delay) / 0.5, 0, 1));
      const spread = e * (GROUP_GAP[floor.group] + floor.slot * FLOOR_SPREAD * (floor.group === 0 ? 2.2 : 1));
      const y = floor.baseY + spread - (1 - t) * rise;
      floor.root.position.y = y;
      floor.root.visible = t > 0;
      lift.set(floor, y);
    });

    const open = ease(p);
    const az = MathUtils.degToRad(lerp(-34, 38, open)) + drag.x * 0.9 + pointer.x * 0.07;
    const el = MathUtils.degToRad(lerp(11, 17, open) - 7 * e) + drag.y * 0.35 - pointer.y * 0.035;
    const extra = e * (GROUP_GAP[2] + 1.2 + aptCount * FLOOR_SPREAD);
    const half = Math.tan(MathUtils.degToRad(camera.fov) / 2);
    const needH = ((towerHeight + extra) * 1.02 + 0.8) / 2 / half;
    const needW = (PODIUM_W * 0.62) / (half * camera.aspect);
    const distance = Math.max(needH, needW) + 5;
    target.set(0, (towerHeight + extra) * 0.46 + 0.1, 0);
    camera.position.set(
      target.x + Math.sin(az) * Math.cos(el) * distance,
      target.y + Math.sin(el) * distance,
      target.z + Math.cos(az) * Math.cos(el) * distance,
    );
    camera.lookAt(target);
    camera.setViewOffset(width, height, -state.shift * (1 - e) * width, 0, width, height);
    camera.updateMatrixWorld();

    const dusk = smoothstep(p, 0.12, 0.92);
    const sunAz = MathUtils.degToRad(lerp(48, -20, dusk));
    const sunEl = MathUtils.degToRad(lerp(24, 7, dusk));
    sun.position.set(Math.sin(sunAz) * 22, Math.sin(sunEl) * 24 + 2, Math.cos(sunAz) * 22);
    sun.target.position.set(0, 3, 0);
    sun.color.copy(dusk < 0.5 ? tmp.lerpColors(sunColors[0], sunColors[1], dusk * 2) : tmp.lerpColors(sunColors[1], sunColors[2], (dusk - 0.5) * 2));
    sun.intensity = lerp(2.7, 1.1, dusk);
    scene.environmentIntensity = lerp(0.7, 0.5, dusk);
    renderer.toneMappingExposure = lerp(1, 1.18, dusk);

    windowMats.forEach((material, k) => {
      const start = 0.05 + k * 0.1;
      material.emissiveIntensity = 0.1 + smoothstep(p, start, start + 0.45) * 1.9;
    });
    water.emissiveIntensity = 0.2 + dusk * 0.7;
  }

  function resize(w, h, pixelRatio) {
    width = Math.max(1, Math.floor(w));
    height = Math.max(1, Math.floor(h));
    if (pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  function render(dt = 1 / 60) {
    const k = 1 - Math.exp(-dt * 7);
    [drag, pointer].forEach((axis) => {
      axis.x += (axis.tx - axis.x) * k;
      axis.y += (axis.ty - axis.y) * k;
    });
    const moving = Math.abs(drag.tx - drag.x) + Math.abs(drag.ty - drag.y) + Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.0004;
    const key = `${state.p.toFixed(4)}|${state.assemble.toFixed(4)}|${state.shift.toFixed(3)}`;
    if (!dirty && !moving && key === lastKey) return false;
    lastKey = key;
    dirty = false;
    pose();
    renderer.render(scene, camera);
    return true;
  }

  function project(name) {
    const spec = labelAnchors[name];
    const list = groups[spec.group];
    const first = list[0];
    const last = list[list.length - 1];
    const bottom = lift.get(first) ?? first.baseY;
    const top = (lift.get(last) ?? last.baseY) + last.height;
    anchor.set(spec.x, lerp(bottom, top, spec.ratio), spec.z).project(camera);
    return { x: (anchor.x * 0.5 + 0.5) * width, y: (1 - (anchor.y * 0.5 + 0.5)) * height };
  }

  return {
    state,
    render,
    resize,
    project,
    setPointer(x, y) { pointer.tx = x; pointer.ty = y; },
    drag(dx, dy) {
      drag.tx = clamp(drag.tx + dx, -0.5, 0.5);
      drag.ty = clamp(drag.ty + dy, -0.35, 0.35);
    },
    release() { drag.tx = 0; drag.ty = 0; },
    invalidate() { dirty = true; },
    dispose() {
      scene.traverse((object) => object.geometry?.dispose());
      renderer.dispose();
    },
  };
}
