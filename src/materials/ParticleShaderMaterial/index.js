import {
  DoubleSide,
  ShaderMaterial,
  Vector4,
  Color,
  AdditiveBlending,
  CustomBlending,
  SrcAlphaFactor,
  OneMinusSrcAlphaFactor,
} from "three";

import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

export const ParticleShaderMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  side: DoubleSide,
  uniforms: {
    uColor1: { value: new Color(0xa35330) },
    uColor2: { value: new Color(0x9f2d14) },
    uColor3: { value: new Color(0x9b7235) },
    time: { value: 0 },
    resolution: { value: new Vector4() },
    progress: { value: 0.0 },
  },
  depthTest: true,
  depthWrite: false,
  blending: AdditiveBlending, // Enable custom blending
  //   blending: CustomBlending, // Enable custom blending
  //   blendSrc: SrcAlphaFactor, // Source blending factor
  //   blendDst: OneMinusSrcAlphaFactor, // Destination blending factor
});
