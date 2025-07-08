import { Stats, Grid, GizmoHelper, GizmoViewport } from "@react-three/drei";

/**
 * Debug Tools Component
 * Contains all debugging utilities for the 3D scene:
 * - Performance stats (FPS, memory)
 * - Reference grid for spatial orientation
 * - 3D gizmo for axis visualization
 */
export function DebugTools() {
  return (
    <>
      {/* Performance Stats - FPS, memory usage, render time */}
      <Stats />

      {/* Reference Grid - helps with positioning and scale */}
      <Grid
        position={[0, -5, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6e6e6e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d4b4b"
      />

      {/* 3D Orientation Gizmo - shows X(red), Y(green), Z(blue) axes */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["red", "green", "blue"]}
          labelColor="black"
        />
      </GizmoHelper>
    </>
  );
}
