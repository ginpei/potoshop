import { IPos, IPosPair } from '../misc';
import MultiPointerHandler, { IMultiPointerHandlerProps } from './MultiPointerHandler';

export default class PointerHandlerDebug extends MultiPointerHandler {
  protected elPressOverlap: HTMLCanvasElement;
  protected elPinchOverlap: HTMLCanvasElement;
  protected pressContext: CanvasRenderingContext2D;
  protected pinchContext: CanvasRenderingContext2D;

  constructor (props: IMultiPointerHandlerProps) {
    super(props);

    this.elPressOverlap = document.createElement('canvas');
    Object.assign(this.elPressOverlap.style, {
      left: '0',
      pointerEvents: 'none',
      position: 'absolute',
      top: '0',
    });

    const pressContext = this.elPressOverlap.getContext('2d');
    if (!pressContext) {
      throw new Error('Failed to get context');
    }
    this.pressContext = pressContext;

    this.elPinchOverlap = document.createElement('canvas');
    Object.assign(this.elPinchOverlap.style, {
      left: '0',
      pointerEvents: 'none',
      position: 'absolute',
      top: '0',
    });

    const pinchContext = this.elPinchOverlap.getContext('2d');
    if (!pinchContext) {
      throw new Error('Failed to get context');
    }
    this.pinchContext = pinchContext;
  }

  public start (el: HTMLElement) {
    super.start(el);

    const width = el.clientWidth;
    const height = el.clientHeight;

    this.elPressOverlap.width = width;
    this.elPressOverlap.height = height;
    el.appendChild(this.elPressOverlap);

    this.elPinchOverlap.width = width;
    this.elPinchOverlap.height = height;
    el.appendChild(this.elPinchOverlap);
  }

  public startPressing (pos: IPos) {
    super.startPressing(pos);

    this.clearDebugPress();
    this.putDebugPress(pos);
  }

  public movePressing (pos: IPos) {
    super.movePressing(pos);

    if (this.pressing) {
      this.putDebugPress(pos);
    }
  }

  public stopPressing () {
    super.stopPressing();
    setTimeout(() => this.clearDebugPress(), 500);
  }

  protected startPinching (posPair: IPosPair) {
    super.startPinching(posPair);

    this.putDebugPinch(posPair);
  }

  protected movePinching (posPair: IPosPair) {
    if (!this.pinching) {
      return;
    }
    super.movePinching(posPair);

    this.putDebugPinch(posPair);
  }

  protected stopPinching () {
    if (!this.pinching) {
      return;
    }
    super.stopPinching();

    setTimeout(() => this.clearDebugPinch(), 500);
  }

  protected putDebugPress (pos: IPos) {
    const ctx = this.pressContext;
    if (!ctx) {
      throw new Error('Canvas is not ready');
    }

    this.putDebugPoint(ctx, pos, 'red');
  }

  protected clearDebugPress () {
    const ctx = this.pressContext;
    if (!ctx) {
      throw new Error('Canvas is not ready');
    }

    this.clearDebugCanvas(ctx);
  }

  protected putDebugPinch (posPair: IPosPair) {
    const ctx = this.pinchContext;
    if (!ctx) {
      throw new Error('Canvas is not ready');
    }

    const [p1, p2] = posPair;
    const center = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };

    this.clearDebugCanvas(ctx);
    this.putDebugPoint(ctx, this.pinchOriginalPos[0], 'red');
    this.putDebugPoint(ctx, this.pinchOriginalPos[1], 'red');
    this.putDebugCross(ctx, this.pinchOriginalCenter, 'red');
    this.putDebugPoint(ctx, posPair[0], 'blue');
    this.putDebugPoint(ctx, posPair[1], 'blue');
    this.putDebugCross(ctx, center, 'blue');
  }

  protected clearDebugPinch () {
    const ctx = this.pinchContext;
    if (!ctx) {
      throw new Error('Canvas is not ready');
    }

    this.clearDebugCanvas(ctx);
  }

  protected putDebugPoint (
    ctx: CanvasRenderingContext2D,
    pos: IPos,
    style: string | CanvasGradient | CanvasPattern,
    ) {
    const size = 10;

    ctx.beginPath();
    ctx.strokeStyle = style;
    ctx.ellipse(
      pos.x,
      pos.y,
      size / 2,
      size / 2,
      0,
      0,
      2 * Math.PI);
    ctx.stroke();
  }

  protected putDebugCross (
    ctx: CanvasRenderingContext2D,
    pos: IPos,
    style: string | CanvasGradient | CanvasPattern,
    ) {
    const size = 10;

    ctx.beginPath();
    ctx.strokeStyle = style;
    ctx.moveTo(pos.x - size / 2, pos.y - size / 2);
    ctx.lineTo(pos.x + size / 2, pos.y + size / 2);
    ctx.moveTo(pos.x - size / 2, pos.y + size / 2);
    ctx.lineTo(pos.x + size / 2, pos.y - size / 2);
    ctx.stroke();
  }

  protected clearDebugCanvas (ctx: CanvasRenderingContext2D) {
    const { width, height } = this.elPressOverlap;
    ctx.clearRect(0, 0, width, height);
  }
}
