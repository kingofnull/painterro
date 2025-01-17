import { HexToRGBA } from './colorPicker';
import { trim, logError } from './utils';
import Translation, { activate } from './translation';
import { setActivePasteOptions } from './inserter';

const STORAGE_KEY = 'painterro-data';

let settings = {};

function loadSettings() {
  try {
    settings = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    console.error(`Unable get from localstorage: ${e}`);
  }
  if (!settings) {
    settings = {};
  }
}

export function setParam(name, val) {
  settings[name] = val;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error(`Unable save to localstorage: ${e}`);
  }
}

function firstDefined(...vals) {
  for (let i = 0; i < vals.length; i += 1) {
    if (vals[i] !== undefined) {
      return vals[i];
    }
  }
  return undefined;
}

export function setDefaults(parameters) {
  loadSettings();
  const params = parameters || {};
  if (params.language) {
    activate(params.language);
  }
  if (params.how_to_paste_actions) {
    setActivePasteOptions(params.how_to_paste_actions);
  }
  params.activeColor = settings.activeColor || params.activeColor || '#ff0000';
  params.activeColorAlpha = firstDefined(settings.activeColorAlpha, params.activeColorAlpha, 1.0);
  params.activeAlphaColor = HexToRGBA(params.activeColor, params.activeColorAlpha);

  params.activeFillColor = settings.activeFillColor || params.activeFillColor || '#000000';
  params.activeFillColorAlpha = firstDefined(settings.activeFillColorAlpha,
    params.activeFillColorAlpha, 0.0);
  params.activeFillAlphaColor = HexToRGBA(params.activeFillColor, params.activeFillColorAlpha);

  params.initText = params.initText || null;
  params.initTextColor = params.initTextColor || '#808080';
  params.initTextStyle = params.initTextStyle || '26px \'Open Sans\', sans-serif';
  params.defaultLineWidth = settings.defaultLineWidth || params.defaultLineWidth || 5;
  params.defaultArrowAngle = params.defaultArrowAngle || 30;
  params.defaultArrowLength = settings.defaultArrowLength || params.defaultArrowLength || 15;
  params.defaultEraserWidth = firstDefined(settings.defaultEraserWidth,
    params.defaultEraserWidth, 5);
  params.defaultFontSize = firstDefined(settings.defaultFontSize, params.defaultFontSize, 24);
  params.fontStrokeSize = firstDefined(settings.fontStrokeSize, params.fontStrokeSize, 0);
  params.backgroundFillColor = settings.backgroundFillColor || params.backgroundFillColor || '#ffffff';
  params.backgroundFillColorAlpha = firstDefined(settings.backgroundFillColorAlpha,
    params.backgroundFillColorAlpha, 1.0);
  params.backgroundFillAlphaColor = HexToRGBA(params.backgroundFillColor,
    params.backgroundFillColorAlpha);

  params.textStrokeColor = settings.textStrokeColor || params.textStrokeColor || '#ffffff';
  params.textStrokeColorAlpha = firstDefined(settings.textStrokeColorAlpha,
    params.textStrokeColorAlpha, 1.0);
  params.textStrokeAlphaColor = HexToRGBA(params.textStrokeColor, params.textStrokeColorAlpha);

  params.worklogLimit = firstDefined(params.worklogLimit, 100);

  params.defaultTool = params.defaultTool || 'select';
  params.hiddenTools = params.hiddenTools || ['redo'];
  const defaultInHiddenIndex = params.hiddenTools.indexOf(params.defaultTool);
  if (defaultInHiddenIndex > -1) {
    logError(`Can't hide default tool '${params.defaultTool}', please change default tool to another to hide it`);
    params.hiddenTools.splice(defaultInHiddenIndex, 1);
  }

  params.pixelizePixelSize = settings.pixelizePixelSize || params.pixelizePixelSize || '20%';

  params.colorScheme = params.colorScheme || {};
  params.colorScheme.main = params.colorScheme.main || '#dbebff';
  params.colorScheme.control = params.colorScheme.control || '#abc6ff';
  params.colorScheme.controlContent = params.colorScheme.controlContent || '#000000';
  params.colorScheme.hoverControl = params.colorScheme.hoverControl || params.colorScheme.control;
  params.colorScheme.hoverControlContent = params.colorScheme.hoverControlContent || '#1a3d67';
  params.colorScheme.toolControlNameColor = params.colorScheme.toolControlNameColor || 'rgba(255,255,255,0.7)';

  params.colorScheme.activeControl = params.colorScheme.activeControl || '#7485B1';
  params.colorScheme.activeControlContent = params.colorScheme.activeControlContent ||
    params.colorScheme.main;
  params.colorScheme.inputBorderColor = params.colorScheme.inputBorderColor ||
    params.colorScheme.main;
  params.colorScheme.inputBackground = params.colorScheme.inputBackground || '#ffffff';
  params.colorScheme.inputText = params.colorScheme.inputText ||
    params.colorScheme.activeControl;
  params.colorScheme.backgroundColor = params.colorScheme.backgroundColor || '#999999';
  params.colorScheme.dragOverBarColor = params.colorScheme.dragOverBarColor || '#899dff';

  params.defaultSize = params.defaultSize || 'fill';
  params.defaultPixelSize = params.defaultPixelSize || 4;
  if (typeof params.defaultSize !== 'object') {
    // otherwise its an object from localstorage
    if (params.defaultSize === 'fill') {
      params.defaultSize = {
        width: 'fill',
        height: 'fill',
      };
    } else {
      const wh = params.defaultSize.split('x');
      params.defaultSize = {
        width: trim(wh[0]),
        height: trim(wh[1]),
      };
    }
  }

  params.toolbarPosition = params.toolbarPosition || 'bottom';
  params.fixMobilePageReloader = params.fixMobilePageReloader !== undefined ?
    params.fixMobilePageReloader : true;
  if (params.translation) {
    const name = params.translation.name;
    Translation.get().addTranslation(name, params.translation.strings);
    Translation.get().activate(name);
  }

  params.styles =
    `.ptro-color-main{
        background-color: ${params.colorScheme.main};
        color: ${params.colorScheme.controlContent}}
    .ptro-color-control{
        background-color: ${params.colorScheme.control};
        color:${params.colorScheme.controlContent}}
    .ptro-tool-ctl-name{
        background-color: ${params.colorScheme.toolControlNameColor};
    }
    button.ptro-color-control:hover:not(.ptro-color-active-control):not([disabled]){
        background-color: ${params.colorScheme.hoverControl};
        color:${params.colorScheme.hoverControlContent}}    
    .ptro-bordered-control{border-color: ${params.colorScheme.activeControl}}
    input.ptro-input, input.ptro-input:focus, select.ptro-input, select.ptro-input:focus {
      border: 1px solid ${params.colorScheme.inputBorderColor};
      background-color: ${params.colorScheme.inputBackground};
      color: ${params.colorScheme.inputText}
    }
    .ptro-bar-dragover{background-color:${params.colorScheme.dragOverBarColor}}
    .ptro-color,.ptro-bordered-btn{
      border: 1px solid ${params.colorScheme.inputBorderColor};
    }
    .ptro-color-control:active:enabled {
        background-color: ${params.colorScheme.activeControl};
        color: ${params.colorScheme.activeControlContent}}
    .ptro-color-active-control{
        background-color: ${params.colorScheme.activeControl};
        color:${params.colorScheme.activeControlContent}}
    .ptro-wrapper{
      background-color:${params.colorScheme.backgroundColor};
      bottom:${params.toolbarPosition === 'top' ? '0' : '40px'};
      top:${params.toolbarPosition === 'top' ? '40px' : '0'};
    }
    .ptro-bar {
      ${params.toolbarPosition === 'top' ? 'top' : 'bottom'}: 0;
    }`;

  return params;
}
