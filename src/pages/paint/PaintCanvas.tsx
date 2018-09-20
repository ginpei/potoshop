import { Color } from 'csstype';
import * as React from 'react';
import PointerHandler from '../../components/PointerHandler';
import { AnimationFrameId, between, emptyPos, IPos, IPosPair, Ratio } from '../../misc';
import './PaintCanvas.css';

interface IPaintCanvasProps {
  height: number;
  inactive: boolean;
  onCanvasReceive: (el: HTMLCanvasElement | null) => void;
  onLongPoint: () => void;
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

  protected vCtx: CanvasRenderingContext2D | null;
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

  protected get pinchingTranslation (): IPos {
    return {
      x: this.state.translation.x + this.state.dTranslation.x,
      y: this.state.translation.y + this.state.dTranslation.y,
    };
  }

  protected get safeTranslation (): IPos {
    const { height, width } = this.props;
    const scale = this.pinchingScale;
    const diff: IPos = {
      x: width - width * scale,
      y: height - height * scale,
    };

    if (scale < 1) {
      return {
        x: diff.x / 2,
        y: diff.y / 2,
      };
    }

    const t = this.pinchingTranslation;
    const safePos: IPos = {
      x: between(diff.x, t.x, 0),
      y: between(diff.y, t.y, 0),
    };
    return safePos;
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
    const elSize = this.state.pinching && (
      <div className="PaintCanvas-size">
        x{this.pinchingScale.toFixed(2)}
      </div>
    );

    const debug = window.location.search.slice(1).split('&').includes('point=1');
    const canvasClassName = [
      'PaintCanvas-canvas',
      this.state.lining || this.state.pinching && '-active',
    ].join(' ');

    return (
      <PointerHandler
        debug={debug}
        onPointStart={this.onPointStart}
        onPointMove={this.onPointMove}
        onPointEnd={this.onPointEnd}
        onPointCancel={this.onPointCancel}
        onLongPoint={this.onLongPoint}
        onPinchStart={this.onPinchStart}
        onPinchMove={this.onPinchMove}
        onPinchEnd={this.onPinchEnd}
        >
        <div className="PaintCanvas" style={this.styles}>
          <canvas className={canvasClassName}
            style={this.canvasStyle}
            width={this.props.width}
            height={this.props.height}
            ref={this.refCanvas}
            />
          {elSize}
        </div>
      </PointerHandler>
    );
  }

  public componentDidMount () {
    const elCanvas = this.refCanvas.current!;
    this.ctx!.fillStyle = '#fff';
    this.ctx!.fillRect(0, 0, this.props.width, this.props.height);
    this.props.onCanvasReceive(elCanvas);
  }

  public componentWillUnmount () {
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

    this.stashImage();
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

  protected stashImage () {
    if (!this.ctx) {
      throw new Error('Canvas is not ready');
    }

    const { height, width } = this.props;
    this.lastImage = this.ctx.getImageData(0, 0, width, height);
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
    this.setState({
      dScale: 1,
      dTranslation: emptyPos,
      pinching: false,
      scale: Math.max(1, this.pinchingScale),
      translation: this.pinchingScale < 1 ? emptyPos : this.safeTranslation,
    });
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
