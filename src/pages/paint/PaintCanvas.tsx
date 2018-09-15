import { Color } from 'csstype';
import * as React from 'react';
import LongTapper from '../../components/LongTapper';
import { AnimationFrameId, between, IPos } from '../../misc';
import './PaintCanvas.css';

interface IPaintCanvasProps {
  height: number;
  inactive: boolean;
  onCanvasReceive: (el: HTMLCanvasElement | null) => void;
  onLongTap: () => void;
  strokeColor: Color;
  strokeWidth: number;
  width: number;
}
interface IPaintCanvasState {
  dTranslation: IPos;
  dZoomPx: number;
  lastX: number;
  lastY: number;
  lining: boolean;
  offsetX: number;
  offsetY: number;
  pinching: boolean;
  translation: IPos;
  zoomPx: number;
}

class PaintCanvas extends React.Component<IPaintCanvasProps, IPaintCanvasState> {
  protected refCanvas = React.createRef<HTMLCanvasElement>();
  protected tmPressing: AnimationFrameId = 0;
  protected lastPos: IPos = { x: 0, y: 0 };
  protected lined = false;
  protected lastImage: ImageData = new ImageData(1, 1);
  protected pinchStartedAt: [IPos, IPos] = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  protected pinchCenter: IPos = { x: 0, y: 0 };
  protected pinchDistance = 0;

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
      height: this.props.height,
      width: this.props.width,
    };
  }

  protected get canvasStyle (): React.CSSProperties {
    const scale = this.pinchingScale;
    const translation = this.pinchingTranslation;
    return {
      transform: `translate(${translation.x}px, ${translation.y}px) scale(${scale})`,
    };
  }

  private get pinchingScale () {
    const width = this.props.width + this.state.zoomPx + this.state.dZoomPx;
    return width / this.props.width;
  }

  protected get pinchingTranslation (): IPos {
    return {
      x: this.state.translation.x + this.state.dTranslation.x,
      y: this.state.translation.y + this.state.dTranslation.y,
    };
  }

  protected get pressIndicatorPos (): IPos {
    const s = this.state;
    return {
      x: s.lastX,
      y: s.lastY,
    };
  }

  constructor (props: IPaintCanvasProps) {
    super(props);
    this.state = {
      dTranslation: { x: 0, y: 0 },
      dZoomPx: 0,
      lastX: 0,
      lastY: 0,
      lining: false,
      offsetX: 0,
      offsetY: 0,
      pinching: false,
      translation: { x: 0, y: 0 },
      zoomPx: 0,
    };
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onLongTap = this.onLongTap.bind(this);
  }

  public render () {
    const elSize = this.state.pinching && (
      <div className="PaintCanvas-size">
        x{this.pinchingScale.toFixed(2)}
      </div>
    );

    return (
      <LongTapper
        onLongTap={this.onLongTap}
        >
        <div className="PaintCanvas" style={this.styles}>
          <canvas className="PaintCanvas-canvas"
            style={this.canvasStyle}
            width={this.props.width}
            height={this.props.height}
            ref={this.refCanvas}
            />
          {elSize}
        </div>
      </LongTapper>
    );
  }

  public componentDidMount () {
    const elCanvas = this.refCanvas.current!;
    elCanvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('touchcancel', this.onTouchEnd);
    elCanvas.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    this.ctx!.fillStyle = '#fff';
    this.ctx!.fillRect(0, 0, this.props.width, this.props.height);
    this.props.onCanvasReceive(elCanvas);
  }

  public componentWillUnmount () {
    const elCanvas = this.refCanvas.current!;
    elCanvas.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('touchcancel', this.onTouchEnd);
    elCanvas.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    this.props.onCanvasReceive(null);
  }

  protected onTouchStart (event: TouchEvent) {
    const { touches } = event;
    if (touches.length === 1) {
      event.preventDefault();
      const pos = this.getPos(event, 0);
      this.startLining(pos);
    } else if (touches.length === 2) {
      event.preventDefault(); // to prevent from zooming in Firefox
      const pos = this.getPos(event, 1);
      this.startPinching(pos);
    }
  }

  protected onTouchMove (event: TouchEvent) {
    if (this.state.lining) {
      const { touches } = event;
      if (touches.length !== 1) {
        this.stopLining();
        throw new Error(`Number of touches must be 1 but ${touches.length}`);
      }

      const pos = this.getPos(event, 0);
      this.drawLine(pos);
    } else if (this.state.pinching) {
      const { touches } = event;
      if (touches.length !== 2) {
        // this can occur in Firefox
        // when you quickly move and suddenly up one of your fingers
        this.stopPinching();
        return;
      }

      const positions: IPos[] = [
        this.getPos(event, 0),
        this.getPos(event, 1),
      ];
      this.pinch(positions);
    }
  }

  protected onTouchEnd (event: TouchEvent) {
    if (this.state.lining) {
      this.stopLining();
    } else if (this.state.pinching) {
      this.stopPinching();
    }
  }

  protected onMouseDown (event: MouseEvent) {
    event.preventDefault();
    const pos = this.getPos(event);
    this.startLining(pos);
  }

  protected onMouseMove (event: MouseEvent) {
    if (this.state.lining) {
      const pos = this.getPos(event);
      this.drawLine(pos);
    }
  }

  protected onMouseUp (event: MouseEvent) {
    if (!this.state.lining) {
      return;
    }

    this.stopLining();
  }

  /**
   * @see #progressPressing
   */
  protected onLongTap () {
    if (this.state.lining) {
      this.restoreLastImage();
      this.stopLining(false);
    }

    this.props.onLongTap();
  }

  protected startLining ({ x, y }: IPos) {
    const elCanvas = this.refCanvas.current;
    const { ctx } = this;
    if (!elCanvas || !ctx) {
      return;
    }

    const offsetX = elCanvas.offsetLeft;
    const offsetY = elCanvas.offsetTop;
    ctx.beginPath();
    ctx.strokeStyle = this.props.strokeColor;
    ctx.lineWidth = this.props.strokeWidth;
    ctx.lineCap = 'round';
    ctx.moveTo(x - offsetX, y - offsetY);

    this.lined = false;
    this.lastPos = { x, y };
    this.setState({
      lastX: x,
      lastY: y,
      lining: true,
      offsetX,
      offsetY,
    });
  }

  protected drawLine ({ x, y }: IPos) {
    const { ctx } = this;
    if (!ctx) {
      return;
    }

    const { offsetX, offsetY } = this.state;
    const lx = this.lastPos.x;
    const ly = this.lastPos.y;
    ctx.quadraticCurveTo(
      lx - offsetX,
      ly - offsetY,
      (lx + x) / 2 - offsetX,
      (ly + y) / 2 - offsetY,
    );
    ctx.stroke();

    this.lined = true;
    this.lastPos = { x, y };
    this.setState({
      lastX: x,
      lastY: y,
    });
  }

  protected stopLining (lastStroke?: boolean) {
    const { ctx } = this;
    if (!ctx) {
      return;
    }

    if (lastStroke !== false && this.lined) {
      ctx.lineTo(
        this.lastPos.x - this.state.offsetX,
        this.lastPos.y - this.state.offsetY,
      );
      ctx.stroke();
    }

    // // {{{
    // // protected points: IPos[] = []; // expected this
    // const { points } = this;
    // ctx.strokeStyle = 'red';
    // ctx.fillStyle = 'red';
    // ctx.moveTo(points[0].x, points[0].y);
    // points.forEach((p) => {
    //   ctx.beginPath();
    //   ctx.ellipse(p.x, p.y, 3, 3, 45 * Math.PI / 180, 0, 2 * Math.PI);
    //   ctx.fill();
    // });
    // // }}}

    this.stashImage();
    this.setState({
      lining: false,
    });
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

  protected startPinching (pos: IPos) {
    this.restoreLastImage();
    this.stopLining(false);
    this.pinchStartedAt = [this.lastPos, pos];
    this.pinchCenter = {
      x: (this.lastPos.x + pos.x) / 2,
      y: (this.lastPos.y + pos.y) / 2,
    };
    this.pinchDistance = this.calculateDistance(this.pinchStartedAt);
    this.setState({
      pinching: true,
    });
  }

  protected pinch (positions: IPos[]) {
    const curDistance = this.calculateDistance(positions);
    const dDistance = curDistance - this.pinchDistance;

    const c2 = this.calculateCenter(positions);
    const diff: IPos = {
      x: c2.x - this.pinchCenter.x - dDistance,
      y: c2.y - this.pinchCenter.y - dDistance,
    };
    const dTranslation: IPos = {
      x: diff.x,
      y: diff.y,
    };

    this.setState({
      dTranslation,
      dZoomPx: dDistance * 2,
    });
  }

  protected stopPinching () {
    const zoomPx = (this.state.zoomPx + this.state.dZoomPx);
    const lessThanOriginal = zoomPx < 0;

    this.setState({
      dTranslation: { x: 0, y: 0 },
      dZoomPx: 0,
      pinching: false,
      translation: lessThanOriginal ? { x: 0, y: 0 } : this.safeTranslation,
      zoomPx: lessThanOriginal ? 0 : zoomPx,
    });
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
