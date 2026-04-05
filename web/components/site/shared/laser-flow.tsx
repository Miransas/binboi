/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  className?: string;
  style?: React.CSSProperties;
  wispDensity?: number;
  dpr?: number;
  mouseSmoothTime?: number;
  mouseTiltStrength?: number;
  horizontalBeamOffset?: number;
  verticalBeamOffset?: number;
  flowSpeed?: number;
  verticalSizing?: number;
  horizontalSizing?: number;
  fogIntensity?: number;
  fogScale?: number;
  wispSpeed?: number;
  wispIntensity?: number;
  flowStrength?: number;
  decay?: number;
  falloffStart?: number;
  fogFallSpeed?: number;
  color?: string;
};

const VERT = `
precision highp float;
attribute vec3 position;
void main(){
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

uniform float uFlowTime;
uniform float uFogTime;

uniform float uBeamXFrac;
uniform float uBeamYFrac;

uniform float uFlowSpeed;
uniform float uHLenFactor;

uniform float uFogIntensity;
uniform float uFogScale;
uniform float uFogFallSpeed;

uniform float uWSpeed;
uniform float uWIntensity;

uniform float uHover;
uniform float uFade;

uniform vec3 uColor;

#define PI 3.14159265359

// noise
float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));

  vec2 u = f*f*(3.0-2.0*f);

  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}

// 🔥 BEAM
float beam(vec2 uv){
  float core = exp(-abs(uv.y)*4.0);

  float flow = sin(uv.x*8.0 - uFlowTime*4.0) * 0.5 + 0.5;

  float glow = exp(-abs(uv.y)*1.5) * 0.5;

  return core * mix(0.7,1.2,flow) + glow;
}

// 🔥 EDGE IMPACT (kart çarpma efekti)
float edgeImpact(vec2 uv){
  float edge = smoothstep(0.9,1.0,uv.x);
  float pulse = sin(iTime*10.0) * 0.5 + 0.5;
  return edge * pulse * 1.5;
}

// 🔥 WISPS
float wisps(vec2 uv){
  float x = uv.x + uFlowTime * uWSpeed * 0.02;

  float lines = smoothstep(0.0,0.02,abs(fract(x*4.0)-0.5));

  float fade = exp(-abs(uv.y)*3.0);

  return lines * fade * uWIntensity * 0.2;
}

// 🔥 FOG
float fog(vec2 uv){
  vec2 fuv = uv * uFogScale;

  fuv.x += uFogTime * uFogFallSpeed;

  float n = noise(fuv * 3.0);

  float fade = exp(-abs(uv.y)*2.0);

  return n * fade * uFogIntensity;
}

// 🔥 NEON TONEMAP
vec3 neon(vec3 col){
  col *= 1.5;
  col = pow(col, vec3(0.8));
  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy / iResolution.xy - 0.5) * 2.0;

  uv.x -= uBeamXFrac;
  uv.y -= uBeamYFrac;

  // 🖱 mouse tilt
  float mx = (iMouse.x / iResolution.x - 0.5) * 0.5;
  uv.y += mx;

  float speed = mix(1.0, 2.0, uHover);

  float b = beam(uv * vec2(speed,1.0));
  float w = wisps(uv);
  float f = fog(uv);
  float e = edgeImpact(uv);

  float final = b + w + f + e;

  vec3 col = neon(final * uColor);

  gl_FragColor = vec4(col * uFade, final * uFade);
}
`;

function hexToRGB(hex: string) {
  let c = hex.trim();
  if (c[0] === '#') c = c.slice(1);
  if (c.length === 3)
    c = c
      .split('')
      .map(x => x + x)
      .join('');
  const n = parseInt(c, 16) || 0xffffff;
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export const LaserFlow: React.FC<Props> = ({
  className,
  style,
  wispDensity = 1,
  dpr,
  mouseSmoothTime = 0.0,
  mouseTiltStrength = 0.01,
  horizontalBeamOffset = 0.1,
  verticalBeamOffset = 0.0,
  flowSpeed = 0.35,
  verticalSizing = 2.0,
  horizontalSizing = 0.5,
  fogIntensity = 0.45,
  fogScale = 0.3,
  wispSpeed = 15.0,
  wispIntensity = 5.0,
  flowStrength = 0.25,
  decay = 1.1,
  falloffStart = 1.2,
  fogFallSpeed = 0.6,
  color = '#FF79C6'
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const uniformsRef = useRef<any>(null);
  const hasFadedRef = useRef(false);
  const rectRef = useRef<DOMRect | null>(null);
  const baseDprRef = useRef<number>(1);
  const currentDprRef = useRef<number>(1);
  const lastSizeRef = useRef({ width: 0, height: 0, dpr: 0 });
  const fpsSamplesRef = useRef<number[]>([]);
  const lastFpsCheckRef = useRef<number>(performance.now());
  const emaDtRef = useRef<number>(16.7);
  const pausedRef = useRef<boolean>(false);
  const inViewRef = useRef<boolean>(true);

  const mouseSmoothTimeRef = useRef(mouseSmoothTime);
  useEffect(() => {
    mouseSmoothTimeRef.current = mouseSmoothTime;
  }, [mouseSmoothTime]);

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
      logarithmicDepthBuffer: false
    });
    rendererRef.current = renderer;

    baseDprRef.current = Math.min(dpr ?? (window.devicePixelRatio || 1), 2);
    currentDprRef.current = baseDprRef.current;

    renderer.setPixelRatio(currentDprRef.current);
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 1);
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
      uWispDensity: { value: wispDensity },
      uTiltScale: { value: mouseTiltStrength },
      uFlowTime: { value: 0 },
      uFogTime: { value: 0 },
      uBeamXFrac: { value: horizontalBeamOffset },
      uBeamYFrac: { value: verticalBeamOffset },
      uFlowSpeed: { value: flowSpeed },
      uVLenFactor: { value: verticalSizing },
      uHLenFactor: { value: horizontalSizing },
      uFogIntensity: { value: fogIntensity },
      uFogScale: { value: fogScale },
      uWSpeed: { value: wispSpeed },
      uWIntensity: { value: wispIntensity },
      uFlowStrength: { value: flowStrength },
      uDecay: { value: decay },
      uFalloffStart: { value: falloffStart },
      uFogFallSpeed: { value: fogFallSpeed },
      uColor: { value: new THREE.Vector3(1, 1, 1) },
      uFade: { value: hasFadedRef.current ? 1 : 0 }
    };
    uniformsRef.current = uniforms;

    const material = new THREE.RawShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: false,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const clock = new THREE.Clock();
    let prevTime = 0;
    let fade = hasFadedRef.current ? 1 : 0;

    const mouseTarget = new THREE.Vector2(0, 0);
    const mouseSmooth = new THREE.Vector2(0, 0);

    const setSizeNow = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      const pr = currentDprRef.current;

      const last = lastSizeRef.current;
      const sizeChanged = Math.abs(w - last.width) > 0.5 || Math.abs(h - last.height) > 0.5;
      const dprChanged = Math.abs(pr - last.dpr) > 0.01;
      if (!sizeChanged && !dprChanged) return;

      lastSizeRef.current = { width: w, height: h, dpr: pr };
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(w * pr, h * pr, pr);
      rectRef.current = canvas.getBoundingClientRect();

      if (!pausedRef.current) {
        renderer.render(scene, camera);
      }
    };

    let resizeRaf = 0;
    const scheduleResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(setSizeNow);
    };

    setSizeNow();
    const ro = new ResizeObserver(scheduleResize);
    ro.observe(mount);

    const io = new IntersectionObserver(
      entries => {
        inViewRef.current = entries[0]?.isIntersecting ?? true;
      },
      { root: null, threshold: 0 }
    );
    io.observe(mount);

    const onVis = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVis, { passive: true });

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = rectRef.current;
      if (!rect) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const ratio = currentDprRef.current;
      const hb = rect.height * ratio;
      mouseTarget.set(x * ratio, hb - y * ratio);
    };
    const onMove = (ev: PointerEvent | MouseEvent) => updateMouse(ev.clientX, ev.clientY);
    const onLeave = () => mouseTarget.set(0, 0);
    canvas.addEventListener('pointermove', onMove as any, { passive: true });
    canvas.addEventListener('pointerdown', onMove as any, { passive: true });
    canvas.addEventListener('pointerenter', onMove as any, { passive: true });
    canvas.addEventListener('pointerleave', onLeave as any, { passive: true });

    const onCtxLost = (e: Event) => {
      e.preventDefault();
      pausedRef.current = true;
    };
    const onCtxRestored = () => {
      pausedRef.current = false;
      scheduleResize();
    };
    canvas.addEventListener('webglcontextlost', onCtxLost, false);
    canvas.addEventListener('webglcontextrestored', onCtxRestored, false);

    let raf = 0;

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const dprFloor = 0.6;
    const lowerThresh = 50;
    const upperThresh = 58;
    let lastDprChange = 0;
    const dprChangeCooldown = 2000;

    const adjustDprIfNeeded = (now: number) => {
      const elapsed = now - lastFpsCheckRef.current;
      if (elapsed < 750) return;

      const samples = fpsSamplesRef.current;
      if (samples.length === 0) {
        lastFpsCheckRef.current = now;
        return;
      }
      const avgFps = samples.reduce((a, b) => a + b, 0) / samples.length;

      let next = currentDprRef.current;
      const base = baseDprRef.current;

      if (avgFps < lowerThresh) {
        next = clamp(currentDprRef.current * 0.85, dprFloor, base);
      } else if (avgFps > upperThresh && currentDprRef.current < base) {
        next = clamp(currentDprRef.current * 1.1, dprFloor, base);
      }

      if (Math.abs(next - currentDprRef.current) > 0.01 && now - lastDprChange > dprChangeCooldown) {
        currentDprRef.current = next;
        lastDprChange = now;
        setSizeNow();
      }

      fpsSamplesRef.current = [];
      lastFpsCheckRef.current = now;
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (pausedRef.current || !inViewRef.current) return;

      const t = clock.getElapsedTime();
      const dt = Math.max(0, t - prevTime);
      prevTime = t;

      const dtMs = dt * 1000;
      emaDtRef.current = emaDtRef.current * 0.9 + dtMs * 0.1;
      const instFps = 1000 / Math.max(1, emaDtRef.current);
      fpsSamplesRef.current.push(instFps);

      uniforms.iTime.value = t;

      const cdt = Math.min(0.033, Math.max(0.001, dt));
      (uniforms.uFlowTime.value as number) += cdt;
      (uniforms.uFogTime.value as number) += cdt;

      if (!hasFadedRef.current) {
        const fadeDur = 1.0;
        fade = Math.min(1, fade + cdt / fadeDur);
        uniforms.uFade.value = fade;
        if (fade >= 1) hasFadedRef.current = true;
      }

      const tau = Math.max(1e-3, mouseSmoothTimeRef.current);
      const alpha = 1 - Math.exp(-cdt / tau);
      mouseSmooth.lerp(mouseTarget, alpha);
      uniforms.iMouse.value.set(mouseSmooth.x, mouseSmooth.y, 0, 0);

      renderer.render(scene, camera);

      adjustDprIfNeeded(performance.now());
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);

      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointermove', onMove as any);
      canvas.removeEventListener('pointerdown', onMove as any);
      canvas.removeEventListener('pointerenter', onMove as any);
      canvas.removeEventListener('pointerleave', onLeave as any);
      canvas.removeEventListener('webglcontextlost', onCtxLost);
      canvas.removeEventListener('webglcontextrestored', onCtxRestored);

      scene.clear();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (mount.contains(canvas)) mount.removeChild(canvas);
    };
  }, [
    color,
    decay,
    dpr,
    falloffStart,
    flowSpeed,
    flowStrength,
    fogFallSpeed,
    fogIntensity,
    fogScale,
    horizontalBeamOffset,
    horizontalSizing,
    mouseTiltStrength,
    verticalBeamOffset,
    verticalSizing,
    wispDensity,
    wispIntensity,
    wispSpeed,
  ]);

  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;

    uniforms.uWispDensity.value = wispDensity;
    uniforms.uTiltScale.value = mouseTiltStrength;
    uniforms.uBeamXFrac.value = horizontalBeamOffset;
    uniforms.uBeamYFrac.value = verticalBeamOffset;
    uniforms.uFlowSpeed.value = flowSpeed;
    uniforms.uVLenFactor.value = verticalSizing;
    uniforms.uHLenFactor.value = horizontalSizing;
    uniforms.uFogIntensity.value = fogIntensity;
    uniforms.uFogScale.value = fogScale;
    uniforms.uWSpeed.value = wispSpeed;
    uniforms.uWIntensity.value = wispIntensity;
    uniforms.uFlowStrength.value = flowStrength;
    uniforms.uDecay.value = decay;
    uniforms.uFalloffStart.value = falloffStart;
    uniforms.uFogFallSpeed.value = fogFallSpeed;

    const { r, g, b } = hexToRGB(color || '#FFFFFF');
    uniforms.uColor.value.set(r, g, b);
  }, [
    wispDensity,
    mouseTiltStrength,
    horizontalBeamOffset,
    verticalBeamOffset,
    flowSpeed,
    verticalSizing,
    horizontalSizing,
    fogIntensity,
    fogScale,
    wispSpeed,
    wispIntensity,
    flowStrength,
    decay,
    falloffStart,
    fogFallSpeed,
    color
  ]);

  return <div ref={mountRef} className={`w-full h-full relative ${className || ''}`} style={style} />;
};

export default LaserFlow;
