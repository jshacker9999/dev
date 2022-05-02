import RenderToTextureHandler from "../Helpers/RenderToTextureHandler";
import {
  Camera,
  DepthTexture,
  PerspectiveCamera,
  Texture,
  WebGLMultipleRenderTargets,
  CubeTexture,
} from "three";
export declare enum DebugPassDirection {
  COMPOSITION = "COMPOSITION",
  COLOR_PASS = "COLOR_PASS",
  AO_PASS = "AO_PASS",
  NORMAL_PASS = "NORMAL_PASS",
  ROUGHNESS_PASS = "ROUGHNESS_PASS",
  METALLIC_PASS = "METALLIC_PASS",
  EMISSIVE_PASS = "EMISSIVE_PASS",
  ENV_MAP_PASS = "ENV_MAP_PASS",
  POSITION_PASS = "POSITION_PASS",
  RECONSTRUCTED_POSITION_PASS = "RECONSTRUCTED_POSITION_PASS",
  DEPTH_PASS = "DEPTH_PASS",
  SSR_PASS = "SSR_PASS",
  LIGHTING_MASK_PASS = "LIGHTING_MASK_PASS",
  FOG_MASK_PASS = "FOG_MASK_PASS",
  BLOOM_PASS = "BLOOM_PASS",
}
export declare class FrameComposer extends RenderToTextureHandler {
  private _fbo;
  get frameBuffer(): WebGLMultipleRenderTargets;
  get colorAOMap(): Texture;
  get normalRoughnessMap(): Texture;
  get positionMetallicMap(): Texture;
  get shaderParamMap(): Texture;
  get depthMap(): DepthTexture;
  private _envMap;
  get envMap(): CubeTexture;
  set envMap(value: CubeTexture);
  private _bloomMap;
  get bloomMap(): Texture;
  set bloomMap(value: Texture);
  private _ssrMaxDistance;
  get ssrMaxDistance(): number;
  set ssrMaxDistance(value: number);
  private _ssrOpacity;
  get ssrOpacity(): number;
  set ssrOpacity(value: number);
  private _ssrThickness;
  get ssrThickness(): number;
  set ssrThickness(value: number);
  private _ssrPixelStride;
  get ssrPixelStride(): number;
  set ssrPixelStride(value: number);
  private _debugPassDirection;
  get debugPassDirection(): DebugPassDirection;
  set debugPassDirection(value: DebugPassDirection);
  private _clearCoatEnabled;
  get clearCoatEnabled(): boolean;
  set clearCoatEnabled(value: boolean);
  private _ssrEnabled;
  get ssrEnabled(): boolean;
  set ssrEnabled(value: boolean);
  constructor(w: number, h: number, cameraRef: PerspectiveCamera);
  private setClearCoatEnabled;
  private setSSREnabled;
  setFogDensity(value: number): void;
  private resetDebugPassDirection;
  setDebugPassDirection(direction: DebugPassDirection): void;
  update(camera: Camera): void;
  resetBuffer(w: number, h: number, camera: PerspectiveCamera): void;
  dispose(): void;
}
