import * as React from 'react';
import { AnimationFrameId, emptyPos, IPos, IPosPair, unixMs } from '../misc';
import './PointerHandler.css';
import PressIndicator from './PressIndicator';

interface IPointerHandlerProps {
  children: React.ReactNode;
  containing?: boolean;
  debug?: boolean;
  duration?: number;
  moveThreshold?: number;
  size?: number;
  width?: number;
  onLongPoint?: () => void;
  onPinchEnd?: () => void;
  onPinchMove?: (pair: IPosPair, originalPair: IPosPair) => void;
  onPinchStart?: (pair: IPosPair) => void;
  onPointCancel?: () => void;
  onPointEnd?: () => void;
  onPointMove?: (pos: IPos, startedPos: IPos) => void;
  onPointStart?: (pos: IPos) => void;
  onPress?: (pos: IPos) => void;
}
interface IPointerHandlerState {
  height: number;
  longPressProgress: number;
  pointStartedPos: IPos;
  width: number;
}

class PointerHandler extends React.Component<IPointerHandlerProps, IPointerHandlerState> {
  protected el = React.createRef<HTMLDivElement>();
  protected refPressOverlap = React.createRef<HTMLCanvasElement>();
  protected refPinchOverlap = React.createRef<HTMLCanvasElement>();
  protected pointStartedAt: unixMs = 0;
  protected tmLongPressing: AnimationFrameId = 0;
  protected pinching = false;
  protected pinchOriginalPos: IPosPair = [emptyPos, emptyPos];
  protected vPressContext: CanvasRenderingContext2D | null = null; // use `pressContext` instead
  protected vPinchContext: CanvasRenderingContext2D | null = null; // use `pinchContext` instead

  protected get containing () {
    const { containing } = this.props;
    return containing !== undefined ? containing : true;
  }

  protected get duration () {
    return this.props.duration || 1000;
  }

  protected get moveThreshold () {
    return this.props.moveThreshold || 30;
  }

  protected get pressing () {
    return this.pointStartedAt !== 0;
  }

  protected get longPressing () {
    return this.tmLongPressing !== 0;
  }

  protected get pressContext (): CanvasRenderingContext2D | null {
    if (!this.vPressContext) {
      const el = this.refPressOverlap.current;
      this.vPressContext = el && el.getContext('2d');
    }
    return this.vPressContext;
  }

  protected get pinchContext (): CanvasRenderingContext2D | null {
    if (!this.vPinchContext) {
      const el = this.refPinchOverlap.current;
      this.vPinchContext = el && el.getContext('2d');
    }
    return this.vPinchContext;
  }

  protected get pinchOriginalCenter (): IPos {
    const [p1, p2] = this.pinchOriginalPos;
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  protected get pinchOriginalDistance () {
    const [p1, p2] = this.pinchOriginalPos;
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  constructor (props: IPointerHandlerProps) {
    super(props);
    this.state = {
      height: 0,
      longPressProgress: 0,
      pointStartedPos: emptyPos,
      width: 0,
    };
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  public render () {
    const debugPressOverlap = this.props.debug && (
      <canvas className="PointerHandler-debugCanvas"
        width={this.state.width}
        height={this.state.height}
        ref={this.refPressOverlap}
        />
    );
    const debugPinchOverlap = this.props.debug && (
      <canvas className="PointerHandler-debugCanvas"
        width={this.state.width}
        height={this.state.height}
        ref={this.refPinchOverlap}
        />
    );

    return (
      <div className={`PointerHandler ${this.containing ? '-containing' : ''}`}
        ref={this.el}
        >
        {this.props.children}
        {debugPressOverlap}
        {debugPinchOverlap}
        <PressIndicator
          pos={this.state.pointStartedPos}
          progress={this.state.longPressProgress}
          size={this.props.size}
          width={this.props.width}
          />
      </div>
    );
  }

  public componentDidMount () {
    // to enable passive:false, use reference instead of `onTouchStart` prop
    const el = this.el.current;
    if (!el) {
      // component can be instantiated without being mounted for test
      return;
    }
    el.addEventListener('touchstart', this.onTouchStart, { passive: false });

    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('touchcancel', this.onTouchEnd);
    el.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('click', this.onClick);

    this.setState({
      height: el.clientHeight,
      width: el.clientWidth,
    });
  }

  public componentWillUnmount () {
    const el = this.el.current!;
    if (!el) {
      // component can be instantiated without being mounted for test
      return;
    }

    el.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('touchcancel', this.onTouchEnd);
    el.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    el.removeEventListener('click', this.onClick);
  }

  public onTouchStart (event: TouchEvent) {
    const numTouches = event.touches.length;
    if (numTouches === 1) {
      if (this.isClickableElement(event.target)) {
        return;
      }

      if (!this.props.onPress) {
        event.preventDefault();
      }

      const pos = this.getPos(event, 0);
      this.startPressing(pos);
    } else if (this.pressing && numTouches === 2) {
      event.preventDefault();
      const pair: IPosPair = [
        this.getPos(event, 0),
        this.getPos(event, 1),
      ];
      this.startPinching(pair);
    }
  }

  public onTouchMove (event: TouchEvent) {
    const numTouches = event.touches.length;
    if (this.pressing && numTouches === 1) {
      const pos = this.getPos(event, 0);
      this.movePressing(pos);
    } else if (this.pinching && numTouches === 2) {
      const posPair: IPosPair = [this.getPos(event, 0), this.getPos(event, 1)];
      this.movePinching(posPair);
    }
  }

  public onTouchEnd (event: TouchEvent) {
    if (this.longPressing) {
      this.stopLongPressing();
    }
    if (this.pressing) {
      this.stopPressing();
    }
    if (this.pinching) {
      this.stopPinching();
    }
  }

  public onMouseDown (event: MouseEvent) {
    event.preventDefault();
    const pos = this.getPos(event);
    this.startPressing(pos);
  }

  public onMouseMove (event: MouseEvent) {
    if (this.pressing) {
      const pos = this.getPos(event);
      this.movePressing(pos);
    }
  }

  public onMouseUp (event: MouseEvent) {
    if (this.longPressing) {
      this.stopLongPressing();
    }
    if (this.pressing) {
      this.stopPressing();
    }
  }

  public onClick (event: MouseEvent) {
    if (this.props.onPress) {
      const pos = this.getPos(event);
      this.props.onPress(pos);
    }
  }

  public startPressing (pos: IPos) {
    this.pointStartedAt = Date.now();
    this.setState({
      pointStartedPos: pos,
    });

    if (this.props.debug) {
      this.clearDebugPress();
      this.putDebugPress(pos);
    }

    if (this.props.onPointStart) {
      this.props.onPointStart(pos);
    }

    if (this.props.onLongPoint) {
      this.progressLongPressing();
    }
  }

  public movePressing (pos: IPos) {
    if (this.props.debug && this.pressing) {
      this.putDebugPress(pos);
    }

    if (this.pressing && this.props.onPointMove) {
      const originalPos = this.state.pointStartedPos;
      this.props.onPointMove(pos, originalPos);
    }

    if (this.props.onLongPoint && this.longPressing && this.isPressMoved(pos)) {
      this.stopLongPressing();
    }
  }

  public stopPressing () {
    if (this.pressing) {
      if (this.props.onPointEnd) {
        this.props.onPointEnd();
      }

      this.pointStartedAt = 0;
      this.setState({
        pointStartedPos: emptyPos,
      });
    }

    if (this.props.debug) {
      setTimeout(() => this.clearDebugPress(), 500);
    }
  }

  public cancelPressing () {
    if (this.pressing) {
      if (this.props.onPointCancel) {
        this.props.onPointCancel();
      }

      this.stopPressing();
    }
  }

  protected progressLongPressing () {
    const { duration } = this;
    const elapsed = Date.now() - this.pointStartedAt;
    const progress = elapsed / duration;
    this.setState({
      longPressProgress: Math.max(0, elapsed - duration / 2) / (duration / 2),
    });

    if (progress < 1) {
      this.tmLongPressing = requestAnimationFrame(() => this.progressLongPressing());
    }
    else {
      this.cancelPressing();

      if (this.props.onLongPoint) {
        this.props.onLongPoint();
      }
    }
  }

  /**
   * This has to be called before `stopPressing`,
   * otherwise long-tap occurs because `pointStartedAt` is ages ago.
   */
  protected stopLongPressing () {
    if (!this.tmLongPressing) {
      return;
    }

    cancelAnimationFrame(this.tmLongPressing);
    this.tmLongPressing = 0;

    this.setState({
      longPressProgress: 0,
    });
  }

  protected isPressMoved (pos: IPos) {
    const p0 = this.state.pointStartedPos;
    const distance = Math.max(Math.abs(p0.x - pos.x), Math.abs(p0.y - pos.y));
    return distance > this.moveThreshold;
  }

  protected startPinching (posPair: IPosPair) {
    this.stopLongPressing();
    this.cancelPressing();

    this.pinching = true;
    this.pinchOriginalPos = posPair;

    if (this.props.debug) {
      this.putDebugPinch(posPair);
    }

    if (this.props.onPinchStart) {
      this.props.onPinchStart(posPair);
    }
  }

  protected movePinching (posPair: IPosPair) {
    if (!this.pinching) {
      return;
    }

    if (this.props.debug) {
      this.putDebugPinch(posPair);
    }

    if (this.props.onPinchMove) {
      this.props.onPinchMove(posPair, this.pinchOriginalPos);
    }
  }

  protected stopPinching () {
    if (!this.pinching) {
      return;
    }

    this.pinching = false;
    if (this.props.onPinchEnd) {
      this.props.onPinchEnd();
    }

    if (this.props.debug) {
      setTimeout(() => this.clearDebugPinch(), 500);
    }
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
    ctx.clearRect(0, 0, this.state.width, this.state.height);
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

  protected isClickableElement (element: EventTarget | null) {
    if (!(element instanceof Element)) {
      return false;
    }

    const clickableTagNames = [
      'A',
      'INPUT',
    ];
    return clickableTagNames.includes(element.tagName);
  }
}

export default PointerHandler;
