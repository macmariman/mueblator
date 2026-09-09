import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Model } from '@/lib/build';
import {
  createBasinGeometry,
  createCountertopGeometry,
} from '@/lib/fixtures/basin-geometry';
import type { BasinFixture, MaterialSpec, Part, Vec3 } from '@/lib/spec';

export type ViewName = 'perspective' | 'front' | 'side' | 'top';

export type ViewOptions = {
  dimensions: boolean;
  walls: boolean;
  fixtures: boolean;
  open: boolean;
  exploded: boolean;
  selected: string | null;
};

export type ViewHandle = {
  snapshot: () => string;
  view: (name: ViewName) => void;
  zoom: (factor: number) => void;
};

type Props = {
  model: Model;
  options: ViewOptions;
  onSelect: (id: string) => void;
  onReady: () => void;
};

type Rig = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  apply: (o: ViewOptions) => void;
};

const vec = (v: Vec3) => new THREE.Vector3(...v);

/**
 * Three.js view of a built model. Everything it draws — boards, walls,
 * fixtures, dimensions and camera — comes from the model, so a new design
 * only needs a new specification.
 */
const CabinetView = forwardRef<ViewHandle, Props>(function CabinetView(
  { model, options, onSelect, onReady },
  ref,
) {
  const host = useRef<HTMLDivElement>(null),
    rig = useRef<Rig | null>(null),
    latest = useRef(options),
    modelRef = useRef(model),
    selectRef = useRef(onSelect),
    readyRef = useRef(onReady);
  useEffect(() => {
    latest.current = options;
    modelRef.current = model;
    selectRef.current = onSelect;
    readyRef.current = onReady;
  }, [options, model, onSelect, onReady]);
  const [error, setError] = useState('');
  useImperativeHandle(
    ref,
    () => ({
      snapshot() {
        const r = rig.current;
        if (!r) return '';
        const { camera: rigCamera } = modelRef.current;
        const pos = r.camera.position.clone(),
          target = r.controls.target.clone(),
          aspect = r.camera.aspect,
          size = r.renderer.getSize(new THREE.Vector2()),
          ratio = r.renderer.getPixelRatio();
        // The printed picture is always the assembled piece with its dimensions.
        r.apply({
          ...latest.current,
          dimensions: true,
          walls: false,
          open: false,
          exploded: false,
          selected: null,
          fixtures: true,
        });
        r.renderer.setPixelRatio(1);
        r.renderer.setSize(1500, 1050, false);
        r.camera.aspect = 1500 / 1050;
        r.camera.position.set(...rigCamera.views.print);
        r.controls.target.set(...rigCamera.target);
        r.camera.lookAt(r.controls.target);
        r.camera.updateProjectionMatrix();
        r.renderer.render(r.scene, r.camera);
        const url = r.renderer.domElement.toDataURL('image/png');
        r.renderer.setPixelRatio(ratio);
        r.renderer.setSize(size.x, size.y, false);
        r.camera.aspect = aspect;
        r.camera.position.copy(pos);
        r.controls.target.copy(target);
        r.camera.lookAt(target);
        r.camera.updateProjectionMatrix();
        r.apply(latest.current);
        r.renderer.render(r.scene, r.camera);
        return url;
      },
      view(name) {
        const r = rig.current;
        if (!r) return;
        const { camera: rigCamera } = modelRef.current;
        r.camera.position.set(
          ...(rigCamera.views[name] ?? rigCamera.views.perspective),
        );
        r.controls.target.set(...rigCamera.target);
        r.controls.update();
      },
      zoom(factor) {
        const r = rig.current;
        if (!r) return;
        const { camera: rigCamera } = modelRef.current;
        const v = r.camera.position
          .clone()
          .sub(r.controls.target)
          .multiplyScalar(factor);
        if (v.length() > rigCamera.minDistance && v.length() < rigCamera.maxDistance) {
          r.camera.position.copy(r.controls.target).add(v);
          r.controls.update();
        }
      },
    }),
    [],
  );
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const built = model;
    const { frame, camera: rigCamera } = built;
    const materials = new Map<string, MaterialSpec>(
      built.spec.materials.map((m) => [m.id, m]),
    );
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
      });
    } catch {
      queueMicrotask(() =>
        setError(
          'No se pudo iniciar el visor 3D. Probá activar la aceleración gráfica o abrir la web en otro navegador. La lista de piezas sigue disponible.',
        ),
      );
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor('#eaf1f4');
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      'aria-label',
      'Modelo tridimensional del mueble. Arrastrar para girar, pellizcar para acercar y tocar para seleccionar una pieza.',
    );
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(36, 1, 1, 12000);
    camera.position.set(...rigCamera.views.perspective);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...rigCamera.target);
    controls.enableDamping = true;
    controls.minDistance = rigCamera.minDistance;
    controls.maxDistance = rigCamera.maxDistance;
    controls.maxPolarAngle = Math.PI * 0.94;
    controls.update();
    const reach = rigCamera.maxDistance;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x83929b, 2.2));
    const sun = new THREE.DirectionalLight(0xfff6e9, 3.3);
    sun.position.set(frame.width, frame.topHeight * 2, frame.depth * 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -reach / 3.3,
      right: reach / 3.3,
      top: reach / 2.8,
      bottom: -reach / 3.5,
      near: 10,
      far: reach * 1.2,
    });
    sun.shadow.normalBias = 1.5;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xc1e5ff, 1.4);
    fill.position.set(-frame.width * 1.25, frame.topHeight, -frame.depth * 1.8);
    scene.add(fill);
    const group = new THREE.Group(),
      wallGroup = new THREE.Group(),
      fixtureGroup = new THREE.Group(),
      dims = new THREE.Group();
    scene.add(group, wallGroup, fixtureGroup, dims);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(rigCamera.floorSize, rigCamera.floorSize),
      new THREE.MeshStandardMaterial({ color: '#e0e9ed', roughness: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(
      rigCamera.gridSize,
      rigCamera.gridDivisions,
      0xc4d2da,
      0xd5e0e5,
    );
    grid.position.y = 0.2;
    scene.add(grid);
    const basin = built.fixtures.find(
      (f): f is BasinFixture => f.kind === 'basin-with-faucet',
    );
    const top = built.parts.find((p) => p.role === 'countertop');
    const meshes = new Map<string, THREE.Mesh>(),
      doorPivots: { pivot: THREE.Group; part: Part }[] = [];
    for (const part of built.parts) {
      const spec = materials.get(part.materialId)!;
      const geometry =
        part.role === 'countertop'
          ? createCountertopGeometry(part, part.machining && basin ? basin : null)
          : new THREE.BoxGeometry(...part.size);
      const material = new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: spec.roughness,
        metalness: 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...part.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.partId = part.id;
      mesh.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry, 25),
          new THREE.LineBasicMaterial({
            color: spec.edgeColor,
            transparent: true,
            opacity: spec.edgeOpacity,
          }),
        ),
      );
      if (part.role === 'door' && part.side) {
        const side = part.side;
        // Hinge on the outer edge of the leaf so it opens against its own upright.
        const pivot = new THREE.Group();
        pivot.position.set(
          part.position[0] + (side * part.size[0]) / 2,
          part.position[1],
          part.position[2],
        );
        mesh.position.set((-side * part.size[0]) / 2, 0, 0);
        pivot.add(mesh);
        group.add(pivot);
        doorPivots.push({ pivot, part });
        if (part.handle) {
          const handle = new THREE.Mesh(
            new THREE.BoxGeometry(7, 90, 16),
            new THREE.MeshStandardMaterial({
              color: '#24333c',
              roughness: 0.3,
              metalness: 0.7,
            }),
          );
          handle.position.set(
            -side * (part.size[0] / 2 - 35),
            part.size[1] / 2 - 100,
            part.size[2] / 2 + 8,
          );
          mesh.add(handle);
        }
      } else group.add(mesh);
      meshes.set(part.id, mesh);
    }
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: '#b5cad3',
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    for (const box of built.walls) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(...box.size),
        wallMaterial,
      );
      wall.position.set(...box.position);
      wallGroup.add(wall);
      wall.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(wall.geometry),
          new THREE.LineBasicMaterial({
            color: 0x8fa8b5,
            transparent: true,
            opacity: 0.45,
          }),
        ),
      );
    }
    const metal = new THREE.MeshStandardMaterial({
      color: '#1e272c',
      metalness: 0.65,
      roughness: 0.32,
    });
    function cylinder(
      radius: number,
      height: number,
      x: number,
      y: number,
      z: number,
    ) {
      const o = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 24),
        metal,
      );
      o.position.set(x, y, z);
      o.castShadow = true;
      fixtureGroup.add(o);
      return o;
    }
    if (basin && top) {
      const ceramic = new THREE.MeshStandardMaterial({
        color: '#fffdfa',
        roughness: 0.23,
        metalness: 0.03,
        side: THREE.DoubleSide,
      });
      const bowl = new THREE.Mesh(createBasinGeometry(basin), ceramic);
      bowl.scale.x = basin.scaleX;
      const surfaceY = top.position[1] + top.size[1] / 2;
      bowl.position.set(basin.x, surfaceY + basin.lift, basin.z);
      bowl.castShadow = true;
      fixtureGroup.add(bowl);
      const bottomY =
        surfaceY + basin.lift + Math.min(...basin.profile.map(([, y]) => y));
      if (basin.faucet !== false) {
        cylinder(16, 130, basin.x, surfaceY + 70, basin.z - 175);
        const spout = new THREE.Mesh(new THREE.BoxGeometry(26, 18, 86), metal);
        spout.position.set(basin.x, surfaceY + 99, basin.z - 140);
        fixtureGroup.add(spout);
      }
      if (basin.trap !== false) {
        cylinder(25, 5, basin.x, bottomY + 12, basin.z);
        const trapY = bottomY - 120;
        const pipe = new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(basin.x, bottomY - 4, basin.z),
              new THREE.Vector3(basin.x, trapY, basin.z),
              new THREE.Vector3(basin.x, trapY - 35, basin.z - 70),
              new THREE.Vector3(basin.x, trapY, basin.z - 170),
              new THREE.Vector3(basin.x, trapY, frame.backZ + 10),
            ]),
            45,
            16,
            12,
            false,
          ),
          new THREE.MeshStandardMaterial({ color: '#aeb8bd', roughness: 0.65 }),
        );
        fixtureGroup.add(pipe);
      }
    }
    function label(text: string, position: THREE.Vector3, color = '#256377') {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 104;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.fillRect(0, 0, 640, 104);
      ctx.fillStyle = color;
      ctx.font = '600 42px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 320, 54);
      const texture = new THREE.CanvasTexture(c);
      texture.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture, depthTest: false }),
      );
      sprite.scale.set(245, 40, 1);
      sprite.position.copy(position);
      sprite.renderOrder = 10;
      dims.add(sprite);
    }
    for (const line of built.dimensions) {
      const a = vec(line.from),
        b = vec(line.to);
      const direction = b.clone().sub(a).normalize(),
        tick =
          Math.abs(direction.y) > 0.5
            ? new THREE.Vector3(12, 0, 0)
            : new THREE.Vector3(0, 12, 0);
      dims.add(
        new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints([
            a,
            b,
            a.clone().sub(tick),
            a.clone().add(tick),
            b.clone().sub(tick),
            b.clone().add(tick),
          ]),
          new THREE.LineBasicMaterial({ color: 0x31718a, depthTest: false }),
        ),
      );
      label(
        line.text,
        a.clone().add(b).multiplyScalar(0.5).add(vec(line.offset)),
      );
    }
    for (const note of built.annotations) label(note.text, vec(note.at));
    const apply = (o: ViewOptions) => {
      wallGroup.visible = o.walls;
      fixtureGroup.visible = o.fixtures && !o.exploded;
      dims.visible = o.dimensions;
      for (const p of built.parts) {
        const m = meshes.get(p.id)!;
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.emissive.set(o.selected === p.id ? '#00a8be' : '#000000');
        mat.emissiveIntensity = o.selected === p.id ? 0.3 : 0;
        if (p.role !== 'door')
          m.position.set(
            ...(p.position.map((v, i) => v + (o.exploded ? p.explode[i] : 0)) as Vec3),
          );
      }
      for (const { pivot, part } of doorPivots) {
        const side = part.side ?? 1;
        pivot.position.set(
          part.position[0] +
            (side * part.size[0]) / 2 +
            (o.exploded ? part.explode[0] : 0),
          part.position[1] + (o.exploded ? part.explode[1] : 0),
          part.position[2] + (o.exploded ? part.explode[2] : 0),
        );
        pivot.rotation.y = o.open && !o.exploded ? side * Math.PI * 0.47 : 0;
      }
    };
    rig.current = { scene, camera, renderer, controls, apply };
    apply(latest.current);
    const resize = new ResizeObserver(() => {
      const w = el.clientWidth,
        h = el.clientHeight;
      if (w && h) {
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
    resize.observe(el);
    renderer.setSize(el.clientWidth, el.clientHeight);
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    const pointerDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const pointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects([...meshes.values()], false);
      if (hits[0]) selectRef.current(hits[0].object.userData.partId);
    };
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    readyRef.current();
    return () => {
      cancelAnimationFrame(frameId);
      resize.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      const geos = new Set<THREE.BufferGeometry>(),
        mats = new Set<THREE.Material>(),
        textures = new Set<THREE.Texture>();
      scene.traverse((o) => {
        if (
          o instanceof THREE.Mesh ||
          o instanceof THREE.LineSegments ||
          o instanceof THREE.Sprite
        ) {
          if (o.geometry) geos.add(o.geometry);
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            mats.add(m);
            if (m.map) textures.add(m.map);
          }
        }
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      rig.current = null;
    };
    // The scene is rebuilt from scratch when the design changes: see the key in App.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    rig.current?.apply(options);
  }, [options]);
  return (
    <div className="canvas-host" ref={host}>
      {error && (
        <p className="webgl-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
export default CabinetView;
