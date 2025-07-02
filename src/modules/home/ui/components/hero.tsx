import Link from "next/link";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface GridDistortionProps {
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  imageSrc: string;
  className?: string;
}

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}
`;

const Hero: React.FC<GridDistortionProps> = ({
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  imageSrc,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageAspectRef = useRef<number>(1);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const initialDataRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;
    cameraRef.current = camera;

    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null as THREE.Texture | null },
      uDataTexture: { value: null as THREE.DataTexture | null },
    };

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageSrc, texture => {
      texture.minFilter = THREE.LinearFilter;
      imageAspectRef.current = texture.image.width / texture.image.height;
      uniforms.uTexture.value = texture;
      handleResize();
    });

    const size = grid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125;
      data[i * 4 + 1] = Math.random() * 255 - 125;
    }
    initialDataRef.current = new Float32Array(data);

    const dataTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const handleResize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const containerAspect = width / height;
      const imageAspect = imageAspectRef.current;

      renderer.setSize(width, height);

      const scale = Math.max(containerAspect / imageAspect, 1);
      plane.scale.set(imageAspect * scale, scale, 1);

      const frustumHeight = 1;
      const frustumWidth = frustumHeight * containerAspect;
      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      camera.updateProjectionMatrix();

      uniforms.resolution.value.set(width, height, 1, 1);
    };

    const mouseState = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      vX: 0,
      vY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      Object.assign(mouseState, { x, y, prevX: x, prevY: y });
    };

    const handleMouseLeave = () => {
      dataTexture.needsUpdate = true;
      Object.assign(mouseState, {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        vX: 0,
        vY: 0,
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);
    handleResize();

    const animate = () => {
      requestAnimationFrame(animate);
      uniforms.time.value += 0.05;

      const data = dataTexture.image.data as Float32Array;
      for (let i = 0; i < size * size; i++) {
        data[i * 4] *= relaxation;
        data[i * 4 + 1] *= relaxation;
      }

      const gridMouseX = size * mouseState.x;
      const gridMouseY = size * mouseState.y;
      const maxDist = size * mouse;

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distSq =
            Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
          if (distSq < maxDist * maxDist) {
            const index = 4 * (i + size * j);
            const power = Math.min(maxDist / Math.sqrt(distSq), 10);
            data[index] += strength * 100 * mouseState.vX * power;
            data[index + 1] -= strength * 100 * mouseState.vY * power;
          }
        }
      }

      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      dataTexture.dispose();
      if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();
    };
  }, [grid, mouse, strength, relaxation, imageSrc]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={containerRef}
        className={`relative w-full h-full opacity-35 overflow-hidden ${className}`}
      />

      {/* Overlay HTML */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none z-10 text-center">
        {/* Main Headline */}
        <h1 className="text-white/90 text-3xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2 pointer-events-auto">
          <span className="block">Experience True</span>
          <span className="block bg-gradient-to-r from-white via-gold-200 to-white bg-clip-text text-transparent">
            ELEGANCE
          </span>
          <span className="block text-2xl sm:text-lg md:text-2xl font-light text-white/80 mt-2">
            where style meets sophistication
          </span>
        </h1>

        {/* Stats & CTA */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center pointer-events-auto">
          <Link
            href="/booking"
            passHref
            className="flex flex-col items-center justify-center bg-zinc-900/80 border border-gold-400 rounded-full
               w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 hover:scale-105 transition-transform pointer-events-auto"
          >
            <span className="text-gold-400 font-bold">BOOK</span>
            <span className="text-gold-400 font-bold">NOW!</span>
          </Link>

          <div
            className="flex flex-col items-center justify-center bg-zinc-900/80 border border-gold-400 rounded-full
                  w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 hover:scale-105 transition-transform"
          >
            <div className="text-white font-bold text-xl">10+</div>
            <div className="text-zinc-400 text-xs leading-tight">
              YEARS OF
              <br />
              EXCELLENCE
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center bg-zinc-900/80 border border-gold-400 rounded-full
                  w-24 h-24  sm:w-24 sm:h-24 md:w-28 md:h-28 hover:scale-105 transition-transform"
          >
            <div className="text-white font-bold text-lg">15+</div>
            <div className="text-zinc-400 text-xs leading-tight">
              MASTER
              <br />
              STYLISTS
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center bg-zinc-900/80 border border-gold-400 rounded-full
                 w-24 h-24  sm:w-24 sm:h-24 md:w-28 md:h-28 hover:scale-105 transition-transform"
          >
            <div className="text-white font-bold text-lg">500+</div>
            <div className="text-zinc-400 text-xs leading-tight">
              ELITE
              <br />
              CLIENTELE
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-8 text-zinc-400 font-light text-xl pointer-events-auto">
          crafting excellence since{" "}
          <span className="text-gold-400 font-bold text-xl">2013</span>
        </p>
      </div>
    </div>
  );
};

export default Hero;
