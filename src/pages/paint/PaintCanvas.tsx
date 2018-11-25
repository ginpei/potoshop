import { Color } from 'csstype';
import * as React from 'react';
import { AnimationFrameId, appSpace, between, emptyPos, IPos, IPosPair, Ratio } from '../../misc';
import PointerHandler from '../../services/PointerHandlerDebug';
import './PaintCanvas.css';

interface IPaintCanvasProps {
  height: number;
  imageHeight: number;
  imageWidth: number;
  inactive: boolean;
  onCanvasReceive: (el: HTMLCanvasElement | null) => void;
  onCanvasUpdated: (imageData: ImageData) => void;
  onLongPoint: () => void;
  originalImage?: HTMLImageElement;
  strokeColor: Color;
  strokeWidth: number;
  width: number;
}
interface IPaintCanvasState {
  dScale: number;
  dTranslation: IPos;
  lining: boolean;
  pinching: boolean;
  scale: number;
  translation: IPos;
}

class PaintCanvas extends React.Component<IPaintCanvasProps, IPaintCanvasState> {
  protected refCanvas = React.createRef<HTMLCanvasElement>();
  protected tmPressing: AnimationFrameId = 0;
  protected lastPos: IPos = emptyPos;
  protected lined = false;
  protected lastImage: ImageData = new ImageData(1, 1);
  protected pinchStartedPos: IPosPair = [emptyPos, emptyPos];
  protected pinchCenter: IPos = emptyPos;
  protected pinchDistance = 0;
  protected canvasOffset: IPos = emptyPos;
  protected el = React.createRef<HTMLDivElement>();
  protected pointerHandler: PointerHandler | null = null;

  protected vCtx: CanvasRenderingContext2D | null = null;
  protected get ctx (): CanvasRenderingContext2D | null {
    if (!this.vCtx) {
      const el = this.refCanvas.current;
      if (!el) {
        return null;
      }

      this.vCtx = el.getContext('2d');
    }

    return this.vCtx;
  }

  protected get styles (): React.CSSProperties {
    return {
      filter: this.props.inactive ? 'blur(5px)' : '',
      height: this.props.height,
      width: this.props.width,
    };
  }

  protected get canvasStyle (): React.CSSProperties {
    const scale = this.pinchingScale;
    const translation = this.pinchingTranslation;
    const transform = [
      `translate(${translation.x}px, ${translation.y}px)`,
      `scale(${scale})`,
    ].join(' ');
    return {
      transform,
    };
  }

  private get pinchingScale (): Ratio {
    return this.state.scale * this.state.dScale;
  }

  private get safeMinScale (): Ratio {
    return Math.min(
      1,
      (this.props.width - appSpace * 2) / this.props.imageWidth,
      (this.props.height - appSpace * 2) / this.props.imageHeight,
    );
  }

  protected get pinchingTranslation (): IPos {
    return {
      x: this.state.translation.x + this.state.dTranslation.x,
      y: this.state.translation.y + this.state.dTranslation.y,
    };
  }

  constructor (props: IPaintCanvasProps) {
    super(props);
    this.state = {
      dScale: 1,
      dTranslation: emptyPos,
      lining: false,
      pinching: false,
      scale: 1,
      translation: emptyPos,
    };
    this.onPointStart = this.onPointStart.bind(this);
    this.onPointMove = this.onPointMove.bind(this);
    this.onPointEnd = this.onPointEnd.bind(this);
    this.onPointCancel = this.onPointCancel.bind(this);
    this.onLongPoint = this.onLongPoint.bind(this);
    this.onPinchStart = this.onPinchStart.bind(this);
    this.onPinchMove = this.onPinchMove.bind(this);
    this.onPinchEnd = this.onPinchEnd.bind(this);
  }

  public render () {
    const sizeClassName = [
      'PaintCanvas-size',
      this.state.pinching ? '-active' : undefined,
    ].join(' ');

    const canvasClassName = [
      'PaintCanvas-canvas',
      this.state.lining || this.state.pinching && '-active',
    ].join(' ');

    return (
      <div className="PaintCanvas"
        ref={this.el}
        style={this.styles}
      >
        <canvas className={canvasClassName}
          style={this.canvasStyle}
          width={this.props.imageWidth}
          height={this.props.imageHeight}
          ref={this.refCanvas}
          />
        <div className={sizeClassName}>
          x{this.pinchingScale.toFixed(2)}
        </div>
      </div>
    );
  }

  public componentWillMount () {
    const scale = Math.max(this.safeMinScale, 0);
    const translation = this.getSafeTranslation(scale);
    this.setState({
      scale,
      translation,
    });
  }

  public componentDidMount () {
    const el = this.el.current;
    if (!el) {
      throw new Error('Mount but no element');
    }
    this.pointerHandler = new PointerHandler({
      // debug: window.location.search.slice(1).split('&').includes('point=1'),
      el,
      onLongPoint: this.onLongPoint,
      onPinchEnd: this.onPinchEnd,
      onPinchMove: this.onPinchMove,
      onPinchStart: this.onPinchStart,
      onPointCancel: this.onPointCancel,
      onPointEnd: this.onPointEnd,
      onPointMove: this.onPointMove,
      onPointStart: this.onPointStart,
    });
    this.pointerHandler.start();

    const { ctx } = this;
    if (!ctx) {
      throw new Error('Canvas is not ready');
    }

    if (this.props.originalImage) {
      ctx.drawImage(this.props.originalImage, 0, 0);
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, this.props.imageWidth, this.props.imageHeight);
    }
    this.props.onCanvasReceive(this.refCanvas.current);
  }

  public componentWillUnmount () {
    if (this.pointerHandler) {
      this.pointerHandler.stop();
    }

    this.props.onCanvasReceive(null);
  }

  protected onPointStart (pos: IPos) {
      this.startLining(pos);
  }

  protected onPointMove (pos: IPos) {
    if (this.state.lining) {
      this.drawLine(pos);
    }
  }

  protected onPointEnd () {
    if (this.state.lining) {
      this.stopLining();
    }
  }

  protected onPointCancel () {
    if (this.state.lining) {
      this.cancelLining();
    }
  }

  /**
   * @see #progressPressing
   */
  protected onLongPoint () {
    if (this.state.lining) {
      this.cancelLining();
    }

    this.props.onLongPoint();
  }

  protected onPinchStart (posPair: IPosPair) {
    this.startPinching(posPair);
  }

  protected onPinchMove (posPair: IPosPair) {
    this.pinch(posPair);
  }

  protected onPinchEnd () {
    this.stopPinching();
  }

  protected startLining (pos: IPos) {
    const elCanvas = this.refCanvas.current;
    const { ctx } = this;
    if (!elCanvas || !ctx) {
      return;
    }

    this.canvasOffset = {
      x: elCanvas.offsetLeft,
      y: elCanvas.offsetTop,
    };

    const canvasPos = this.convertToCanvasPos(pos);

    ctx.beginPath();
    ctx.strokeStyle = this.props.strokeColor;
    ctx.lineWidth = this.props.strokeWidth;
    ctx.lineCap = 'round';
    ctx.moveTo(canvasPos.x, canvasPos.y);

    this.lined = false;
    this.lastPos = canvasPos;
    this.setState({
      lining: true,
    });
  }

  protected drawLine (pos: IPos) {
    const { ctx } = this;
    if (!ctx) {
      return;
    }

    const canvasPos = this.convertToCanvasPos(pos);
    const lx = this.lastPos.x;
    const ly = this.lastPos.y;
    ctx.quadraticCurveTo(
      lx,
      ly,
      (lx + canvasPos.x) / 2,
      (ly + canvasPos.y) / 2,
    );
    ctx.stroke();

    this.lined = true;
    this.lastPos = canvasPos;
  }

  protected stopLining (lastStroke?: boolean) {
    const { ctx } = this;
    if (!ctx) {
      return;
    }

    if (lastStroke !== false && this.lined) {
      ctx.lineTo(
        this.lastPos.x,
        this.lastPos.y,
      );
      ctx.stroke();
    }

    this.recordHistory();
    this.setState({
      lining: false,
    });
  }

  protected cancelLining () {
    this.restoreLastImage();
    this.stopLining(false);
  }

  /**
   * Make sure `canvasOffset` is up to date before call.
   */
  protected convertToCanvasPos (screenPos: IPos) {
    const { canvasOffset } = this;
    const { scale, translation } = this.state;
    const canvasPos = {
      x: (-translation.x - canvasOffset.x + screenPos.x) / scale,
      y: (-translation.y - canvasOffset.y + screenPos.y) / scale,
    };
    return canvasPos;
  }

  protected recordHistory () {
    if (!this.ctx) {
      throw new Error('Canvas is not ready');
    }

    const { imageHeight, imageWidth } = this.props;
    this.lastImage = this.ctx.getImageData(0, 0, imageWidth, imageHeight);

    if (this.props.onCanvasUpdated) {
      this.props.onCanvasUpdated(this.lastImage);
    }
  }

  protected restoreLastImage () {
    if (!this.ctx) {
      throw new Error('Canvas is not ready');
    }

    this.ctx.putImageData(this.lastImage, 0, 0);
  }

  protected startPinching (posPair: IPosPair) {
    this.cancelLining();

    this.pinchStartedPos = posPair;
    this.pinchCenter = this.calculateCenter(posPair);
    this.pinchDistance = this.calculateDistance(posPair);

    this.setState({
      pinching: true,
    });
  }

  protected pinch (posPair: IPosPair) {
    const dScale = this.calculateDistance(posPair) / this.pinchDistance;

    const c0 = this.pinchCenter;
    const c1 = this.calculateCenter(posPair);
    const f0 = this.state.translation;
    const dTranslation = {
      x: (f0.x - c0.x) * dScale + c1.x - f0.x,
      y: (f0.y - c0.y) * dScale + c1.y - f0.y,
    };
    this.setState({ dScale, dTranslation });
  }

  protected stopPinching () {
    const scale = Math.max(this.safeMinScale, this.pinchingScale);
    const translation = this.getSafeTranslation(scale);

    this.setState({
      dScale: 1,
      dTranslation: emptyPos,
      pinching: false,
      scale,
      translation,
    });
  }

  protected getSafeTranslation (scale: Ratio): IPos {
    const p = this.props;
    const safePos = {
      x: 0,
      y: 0,
    };
    const t = this.pinchingTranslation;

    if (p.imageWidth * scale < p.width - appSpace * 2) {
      safePos.x = (p.width - p.imageWidth * scale) / 2;
    } else {
      const max = appSpace;
      const min = -p.imageWidth * scale + (p.width - appSpace);
      safePos.x = between(min, t.x, max);
    }

    if (p.imageHeight * scale < p.height - appSpace * 2) {
      safePos.y = (p.height - p.imageHeight * scale) / 2;
    } else {
      const max = appSpace;
      const min = -p.imageHeight * scale + (p.height - appSpace);
      safePos.y = between(min, t.y, max);
    }

    return safePos;
  }

  protected calculateCenter (positions: IPos[]) {
    if (positions.length !== 2) {
      throw new Error(`2 positions must be given but ${positions.length}`);
    }

    const [p1, p2] = positions;
    const center: IPos = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
    return center;
  }

  protected calculateDistance (positions: IPos[]) {
    if (positions.length !== 2) {
      throw new Error(`2 positions must be given but ${positions.length}`);
    }
    const [p1, p2] = positions;
    const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    return distance;
  }

  protected getPos (event: MouseEvent): IPos;
  protected getPos (event: TouchEvent, index: number): IPos;
  protected getPos (event: any, index?: number): IPos {
    if (event instanceof MouseEvent) {
      const pos: IPos = {
        x: event.clientX,
        y: event.clientY,
      };
      return pos;
    } else if (event instanceof TouchEvent && typeof index === 'number') {
      const t = event.touches[index];
      const pos: IPos = {
        x: t.clientX,
        y: t.clientY,
      };
      return pos;
    }

    throw new Error('Unsupported argument types');
  }
}

export default PaintCanvas;
