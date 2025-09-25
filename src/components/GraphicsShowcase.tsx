import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  Clock,
  Color,
  FogExp2,
  Float32BufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  ACESFilmicToneMapping,
} from "three";

import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import styles from "../styles/GraphicsShowcase.module.css";

const PALETTE = [
  new Color("#bf5700"),
  new Color("#0b1b3a"),
  new Color("#92140c"),
  new Color("#0f4c81"),
];

const TEAM_BANDS = [
  new Color("#fdd6b5"),
  new Color("#1a2a5a"),
  new Color("#d1495b"),
  new Color("#1c335f"),
];

const PARTICLE_COUNT = 3200;
const TRAIL_COUNT = 180;

const supportsWebGL = (): boolean => {
  if (typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
    canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });

  return context !== null;
};

export const GraphicsShowcase = (): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !supportsWebGL()) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new Color("#05070b"), 0);

    const scene = new Scene();
    scene.fog = new FogExp2("#05070b", 0.55);

    const camera = new PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 1.3, 4.2);

    const ambientLight = new AmbientLight("#ffffff", 0.8);
    scene.add(ambientLight);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new BloomEffect({
      intensity: 1.1,
      mipmapBlur: true,
      luminanceThreshold: 0.2,
    });
    const chromaticAberration = new ChromaticAberrationEffect({
      offset: new Vector2(0.0012, 0.0014),
      radialModulation: true,
      modulationOffset: 0.85,
    });
    const dof = new DepthOfFieldEffect(camera, {
      focusDistance: 0.012,
      focalLength: 0.037,
      bokehScale: 2.3,
    });
    const grain = new NoiseEffect({
      blendFunction: BlendFunction.SCREEN,
      premultiply: true,
    });
    const vignette = new VignetteEffect({
      eskil: false,
      offset: 0.3,
      darkness: 0.9,
    });

    composer.addPass(new EffectPass(camera, bloom, chromaticAberration, dof, grain, vignette));

    const particleGeometry = new BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    const tempColor = new Color();

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const radius = Math.random() * 3.4;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2.4;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = height;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      tempColor.copy(PALETTE[i % PALETTE.length]);
      tempColor.offsetHSL((Math.random() - 0.5) * 0.05, 0, 0);
      tempColor.toArray(particleColors, i * 3);
    }

    particleGeometry.setAttribute("position", new Float32BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new Float32BufferAttribute(particleColors, 3));

    const particleMaterial = new PointsMaterial({
      size: 0.035,
      vertexColors: true,
      depthWrite: false,
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
    });

    const particles = new Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const trailGeometry = new SphereGeometry(0.03, 12, 12);
    const trailMaterial = new MeshBasicMaterial({
      color: "#bfd3ff",
      transparent: true,
      opacity: 0.6,
    });
    const trailMesh = new InstancedMesh(trailGeometry, trailMaterial, TRAIL_COUNT);
    const trailMatrix = new Matrix4();
    const trailBasePositions: Vector3[] = [];
    const trailPhase: number[] = [];
    const trailScale = new Vector3(1, 1, 1);
    const trailQuaternion = new Quaternion();
    const trailTempPosition = new Vector3();

    for (let i = 0; i < TRAIL_COUNT; i += 1) {
      const base = new Vector3((Math.random() - 0.5) * 2.6, Math.random() * 1.2, (Math.random() - 0.5) * 2.6);
      trailBasePositions.push(base);
      trailPhase.push(Math.random() * Math.PI * 2);
      trailMatrix.compose(base, trailQuaternion, trailScale);
      trailMesh.setMatrixAt(i, trailMatrix);
    }
    scene.add(trailMesh);

    const leagueBands = TEAM_BANDS.map((color, index) => {
      const geometry = new SphereGeometry(1.2 + index * 0.22, 48, 48);
      const material = new PointsMaterial({
        size: 0.04,
        color,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      const mesh = new Points(geometry, material);
      scene.add(mesh);
      return mesh;
    });

    const pointer = new Vector2();
    const clock = new Clock();
    let animationFrame = 0;

    const resize = () => {
      if (!container) {
        return;
      }
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      composer.setSize(clientWidth, clientHeight);
    };

    resize();
    container.appendChild(renderer.domElement);

    const handlePointer = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    };

    container.addEventListener("pointermove", handlePointer);

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      particles.rotation.y += delta * 0.15;
      particles.rotation.x = Math.sin(elapsed * 0.15) * 0.12;

      const positionsAttribute = particleGeometry.getAttribute("position") as Float32BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const ix = i * 3;
        const wave = Math.sin(elapsed * 0.8 + positionsAttribute.getY(i) * 2.1 + pointer.x * 3.2);
        const sway = Math.cos(elapsed * 0.6 + positionsAttribute.getX(i) * 1.7 + pointer.y * 2.4);
        positionsAttribute.array[ix + 2] += wave * 0.0009;
        positionsAttribute.array[ix] += sway * 0.0007;
      }
      positionsAttribute.needsUpdate = true;

      leagueBands.forEach((band, index) => {
        band.rotation.y = elapsed * (0.08 + index * 0.03);
        band.rotation.z = elapsed * 0.04;
      });

      for (let i = 0; i < TRAIL_COUNT; i += 1) {
        const base = trailBasePositions[i];
        const phase = trailPhase[i];
        trailTempPosition.set(
          base.x + Math.sin(elapsed * 0.5 + phase) * 0.18,
          base.y + Math.cos(elapsed * 0.8 + phase) * 0.12,
          base.z + Math.sin(elapsed * 0.6 + phase * 1.2) * 0.16,
        );
        trailMatrix.compose(trailTempPosition, trailQuaternion, trailScale);
        trailMesh.setMatrixAt(i, trailMatrix);
      }
      trailMesh.instanceMatrix.needsUpdate = true;

      camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (1.2 + pointer.y * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0.4, 0);

      composer.render();
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointer);
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      composer.dispose();
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      leagueBands.forEach((band) => {
        band.geometry.dispose();
        const material = band.material;
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose());
        } else {
          material.dispose();
        }
      });
      trailMesh.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      id="graphics"
      className={styles.wrapper}
      aria-labelledby="graphics-showcase-heading"
      data-testid="graphics-showcase"
    >
      <div className={styles.copy}>
        <p className={styles.kicker}>Cinematic Intelligence</p>
        <h2 id="graphics-showcase-heading" className={styles.title}>
          Championship visuals rendered live in the Blaze Intelligence command center.
        </h2>
        <p className={styles.subtitle}>
          HDR tone mapping, volumetric particles, and interactive camera parallax deliver the
          broadcast polish our analysts expect across Baseball, Football, Basketball, and Track & Field.
        </p>
      </div>
      <div className={styles.viewport} ref={containerRef} role="presentation" aria-hidden="true" />
    </section>
  );
};
