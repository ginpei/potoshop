import createBrowserHistory from 'history/createBrowserHistory';

const lastUrl = '';
let urlParams: Array<{ name: string, value: string }> = [];
export function getUrlParamsOf (name: string) {
  if (location.href !== lastUrl) {
    urlParams = location.search.slice(1).split('&')
      .map((sPair) => {
        const pair = sPair.split('=');
        return {
          name: pair[0],
          value: pair[1],
        };
      });
  }

  const values = urlParams
    .filter((q) => q.name === name)
    .map((q) => q.value);
  return values;
}

export function getUrlParamOf (name: string, defaultValue?: string): string;
export function getUrlParamOf (name: string, defaultValue?: number): number;
export function getUrlParamOf (name: string, defaultValue?: boolean): boolean;
export function getUrlParamOf (name: string, defaultValue?: any) {
  const values = getUrlParamsOf(name);
  const value = values.length > 0 ? values[0] : defaultValue;
  let converted: any;
  if (typeof defaultValue === 'number') {
    converted = Number(value);
  } else if (typeof defaultValue === 'boolean') {
    converted = (value === 'false' || value === '0') ? false : Boolean(value);
  } else {
    converted = value;
  }
  return converted;
}

export const appHistory = createBrowserHistory();
export const strokeColors = [
  '#f33',
  '#090',
  '#36f',
  '#fff',
  '#333',
];
export const defaultStrokeColors = strokeColors[4];
export const strokeWidths = [
  1,
  5,
  10,
];
export const defaultStrokeWidth = strokeWidths[1];
export type unixMs = number; // e.g. Date.now()
export type AnimationFrameId = number; // requestAnimationFrame()
export interface IPos {
  x: number;
  y: number;
}
export type IPosPair = [IPos, IPos];
export const emptyPos: IPos = Object.freeze({ x: 0, y: 0 });
export interface ISize {
  height: number;
  width: number;
}
export const appSpace = 16; // index.css
export function between (min: number, n: number, max: number) {
  if (min > max) {
    throw new Error(`Contradictory numbers: min ${min} must be`
      + ` less than or equal to max ${max}`);
  }
  return Math.max(min, Math.min(n, max));
}
export type Ratio = number; // 0 as 0%, 1 as 100%

// TODO rename
export enum NewType {
  none = '',
  size = 'size',
  history = 'history',
}
export function getNewType (str: string = getUrlParamOf('newType')) {
  for (const type in NewType) {
    if (str === type) {
      return NewType[type];
    }
  }
  return NewType.none;
}
