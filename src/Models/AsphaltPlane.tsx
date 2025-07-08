import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const AsphaltPlane = ({ ...props }) => {
  const [diffuse, normal, roughness] = useTexture([
    "/Textures/Asphalt/textures/asphalt_track_diff_1k.jpg",
    "/Textures/Asphalt/textures/asphalt_track_nor_dx_1k.jpg",
    "/Textures/Asphalt/textures/asphalt_track_rough_1k.jpg",
  ]);

  // Set texture repeat for tiling
  diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

  diffuse.repeat.set(4, 4);
  normal.repeat.set(4, 4);
  roughness.repeat.set(4, 4);

  return (
    <mesh {...props} receiveShadow>
      <planeGeometry />
      <meshStandardMaterial
        map={diffuse}
        normalMap={normal}
        roughnessMap={roughness}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default AsphaltPlane;
