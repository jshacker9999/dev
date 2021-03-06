import { Color, Matrix3, Matrix4, RawShaderMaterial, ShaderMaterialParameters, Texture } from "three";
export default class GBufferMaterial extends RawShaderMaterial {
    private _color;
    private _normalScale;
    private _metallic;
    private _roughness;
    private _timeScale;
    set roughness(value: number);
    set metallic(value: number);
    set normalScale(value: number);
    set color(value: Color);
    set texture(value: Texture | null);
    set normalMap(value: Texture | null);
    set aoRoughnessMatallicMap(value: Texture | null);
    set skinnedPosition(value: Texture | null);
    set skinnedNormal(value: Texture | null);
    set skinnedTangent(value: Texture | null);
    set modelMatrix(value: Matrix4);
    set viewMatrix(value: Matrix4);
    set modelViewMatrix(value: Matrix4);
    set projectionMatrix(value: Matrix4);
    set normalMatrix(value: Matrix3);
    set animationFrame(value: number);
    set timeScale(value: number);
    set customMap0(value: Texture);
    set customSlider0(value: number);
    constructor(params?: ShaderMaterialParameters);
    setDefine(key: string, value?: any): void;
    setUniform(id: string, value: any): void;
    updateUniforms(): void;
}
