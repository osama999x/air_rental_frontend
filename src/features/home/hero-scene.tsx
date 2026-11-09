"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { heroMotion } from "./hero-motion";

function Cluster({ colors }: { colors: { accent: string; ink: string } }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node || !heroMotion.running) return;
    node.rotation.y += delta * 0.28;
    node.rotation.x += (heroMotion.y * 0.4 - node.rotation.x) * 0.08;
    node.rotation.z += (heroMotion.x * -0.25 - node.rotation.z) * 0.08;
  });

  return (
    <group ref={group} position={[0.2, -0.15, 0]}>
      <mesh position={[-0.72, -0.15, 0]}>
        <boxGeometry args={[0.46, 0.95, 0.46]} />
        <meshStandardMaterial color={colors.ink} flatShading />
      </mesh>
      <mesh position={[-0.16, 0.12, 0.12]}>
        <boxGeometry args={[0.4, 1.45, 0.4]} />
        <meshStandardMaterial color={colors.accent} flatShading />
      </mesh>
      <mesh position={[0.42, -0.32, -0.08]}>
        <boxGeometry args={[0.52, 0.62, 0.52]} />
        <meshStandardMaterial color={colors.ink} flatShading />
      </mesh>
      <mesh position={[0.95, 0.35, 0.2]} rotation={[0.2, 0.4, -0.5]}>
        <torusGeometry args={[0.22, 0.06, 5, 8]} />
        <meshStandardMaterial color={colors.accent} flatShading />
      </mesh>
      <mesh position={[1.28, 0.02, 0.2]} rotation={[0.2, 0.4, -0.5]}>
        <boxGeometry args={[0.46, 0.08, 0.08]} />
        <meshStandardMaterial color={colors.ink} flatShading />
      </mesh>
    </group>
  );
}

function readColors() {
  if (typeof document === "undefined") return { accent: "#2f6bff", ink: "#12305c" };
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue("--accent").trim() || "#2f6bff",
    ink: styles.getPropertyValue("--foreground").trim() || "#12305c",
  };
}

export default function HeroScene() {
  const [colors, setColors] = useState(readColors);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    const node = document.getElementById("hero-scene");
    const visibility = new IntersectionObserver(([entry]) => {
      const visible = entry?.isIntersecting ?? false;
      heroMotion.running = visible;
      setRunning(visible);
    });
    if (node) visibility.observe(node);
    return () => {
      observer.disconnect();
      visibility.disconnect();
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={running ? "always" : "never"}
      camera={{ position: [0.2, 0.35, 4.4], fov: 32 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[2.5, 3.2, 4]} intensity={1.15} />
      <Cluster colors={colors} />
    </Canvas>
  );
}
