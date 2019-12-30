import { PIXIBaseAsset } from './PIXIBaseAsset';
let ndgmr = require('./../etc/PIXI-ndgmr.Collision').PIXICollision;
require('./../etc/PIXICanvasInput');

import { PIXIAtlasManager } from '../atlas/PIXIAtlasManager';
import { PIXIZeroAlphaNoneInteractionPlugins } from '../plugins/PIXIZeroAlphaNoneInteractionPlugins';
import { PIXIPixelPerfectInteractionPlugIn } from '../plugins/PIXIPixelPerfectInteractionPlugIn';
import { PIXITempStore } from '../etc/PIXITempStore';
import { PIXITextMetricsPlugIn } from '../plugins/PIXITextMetricsPlugIn';
import { PIXIShortPropPlugin } from '../plugins/PIXIShortPropPlugin';
import { PIXIGraphicOverride } from '../plugins/PIXIGraphicOverride';
import { PIXIFontLoadHandler } from './PIXIFontLoadHandler';
import { pixiGetChildAt } from '../plugins/pixiGetChildAt';

class _PIXIGlobal {
    private _init: boolean;
    /** @readonly */
    baseAsset: PIXIBaseAsset;
    atlasManager: PIXIAtlasManager;
    fontLoadChecker: PIXIFontLoadHandler;

    initOnce() {
        if (this._init) return;
        this._init = true;
        this._isWebGLSupported();
        this.fontLoadChecker = new PIXIFontLoadHandler();
        //this.baseAsset = new PIXIBaseAsset();
        ndgmr.initTempObject();
        (window as any).ndgmr = ndgmr;
        PIXITempStore.init();
        this.atlasManager = new PIXIAtlasManager();
        PIXIShortPropPlugin();
        pixiGetChildAt();
        PIXIZeroAlphaNoneInteractionPlugins();
        PIXIPixelPerfectInteractionPlugIn();
        PIXITextMetricsPlugIn();
        PIXIGraphicOverride();
    }

    getNewApp(canvas: HTMLCanvasElement): PIXI.Application {
        PIXI.utils.skipHello();
        let app = new PIXI.Application({
            view: canvas,
            width: canvas.width,
            height: canvas.height,
            autoStart: false,
            // autoStart: true,
            antialias: true,
            transparent: true,
        });
        (app.stage as any).canvas = canvas;
        return app;
    }

    private _isWebGLSupported() {
        if (PIXI.utils.isWebGLSupported()) return;
        throw new Error('webgl not supported');
    }
}

export let PIXIGlobal: _PIXIGlobal = new _PIXIGlobal();
