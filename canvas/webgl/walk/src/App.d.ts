import { OrthographicCamera, PerspectiveCamera, PlaneGeometry, WebGLRenderer } from 'three';
import CameraExtended from './ThreeExtension/CameraExtended';
import "./style.css";
export default class App {
    private static _renderer;
    static get renderer(): WebGLRenderer;
    private static _screenOverlayCamera;
    static get screenOverlayCamera(): OrthographicCamera;
    private static _screenQuadGeometry;
    static get screenQuadGeometry(): PlaneGeometry;
    private static _width;
    static get width(): number;
    static set width(value: number);
    private static _height;
    static get height(): number;
    static set height(value: number);
    private static _halfWidth;
    static get halfWidth(): number;
    static set halfWidth(value: number);
    private static _halfHeight;
    static get halfHeight(): number;
    static set halfHeight(value: number);
    static get pixelRatio(): number;
    private _camera;
    get camera(): CameraExtended;
    private _walker;
    private _skinToMaps;
    private _screen;
    private _floor;
    private _verticalLaser;
    private _skyboxOffScreenCanvasHandler;
    private _skyboxTexture;
    private _particles;
    private _particleAmount;
    private _indexShuffle;
    private _frameComposer;
    private _fogDensityTarget;
    private readonly _fogDensityTargetMin;
    private readonly _fogDensityMin;
    private _blurPass;
    private _time;
    private _timeTweenMin;
    private _timeTweenMax;
    private _timeTween;
    private _cameraControl;
    private _scene;
    private _lights;
    private _lightHandler;
    private _stats;
    private _mouseX;
    private _mouseY;
    private _isMouseDown;
    private _isPortrait;
    private _canvasSize;
    private _debugTextures;
    private _cameraNeedsUpdate;
    constructor();
    private update;
    resetFrameBuffers(camera: PerspectiveCamera): void;
    private shuffledIndex;
    private randomize;
    private handleTimeEvent;
    private setLightPosition;
    private printRendererInfo;
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    onResize(): boolean;
    private setupGUI;
}
