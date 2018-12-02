/**
 * Handles events regarding pointer.
 * (It includes mouse and touche, but not literally PointerEvents).
 * This won't show anything.
 */

import { AnimationFrameId, emptyPos, IPos, unixMs } from '../misc';

export interface IPointerHandlerProps {
  containing?: boolean;
  // debug?: boolean;
  duration?: number;
  moveThreshold?: number;
  size?: number;
  width?: number;
  onLongPoint?: () => void;
  onPointCancel?: () => void;
  onPointEnd?: () => void;
  onPointMove?: (pos: IPos, startedPos: IPos) => void;
  onPointStart?: (pos: IPos) => void;
  onPress?: (pos: IPos) => void;
}

export interface IPointerHandlerState {
  longPressProgress: number;
}

export default class PointerHandler {
  protected props: IPointerHandlerProps;
  protected state: IPointerHandlerState;
  protected el: HTMLElement | null = null;
  protected pointStartedPos: IPos = emptyPos;
  protected pointStartedAt: unixMs = 0;
  protected tmLongPressing: AnimationFrameId = 0;

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

  constructor (props: IPointerHandlerProps) {
    this.props = props;
    this.state = {
      longPressProgress: 0,
    };
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  public setState (state: Partial<IPointerHandlerState>) {
    Object.entries(state).forEach(([key, value]) => {
      this.state[key] = value;
    });
  }

  // public render () {
  //   const debugPressOverlap = this.props.debug && (
  //     <canvas className="PointerHandler-debugCanvas"
  //       width={this.state.width}
  //       height={this.state.height}
  //       ref={this.refPressOverlap}
  //       />
  //   );
  //   const debugPinchOverlap = this.props.debug && (
  //     <canvas className="PointerHandler-debugCanvas"
  //       width={this.state.width}
  //       height={this.state.height}
  //       ref={this.refPinchOverlap}
  //       />
  //   );

  //   return (
  //     <div className={`PointerHandler ${this.containing ? '-containing' : ''}`}
  //       ref={this.el}
  //       >
  //       {this.props.children}
  //       {debugPressOverlap}
  //       {debugPinchOverlap}
  //       <PressIndicator
  //         pos={this.pointStartedPos}
  //         progress={this.state.longPressProgress}
  //         size={this.props.size}
  //         width={this.props.width}
  //         />
  //     </div>
  //   );
  // }

  public start (el: HTMLElement) {
    this.el = el;

    el.addEventListener('touchstart', this.onTouchStart, { passive: false });
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('touchcancel', this.onTouchEnd);
    el.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('click', this.onClick);
  }

  public stop () {
    const { el } = this;
    if (!el) {
      return;
    }
    this.el = null;

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
    }
  }

  public onTouchMove (event: TouchEvent) {
    const numTouches = event.touches.length;
    if (this.pressing && numTouches === 1) {
      const pos = this.getPos(event, 0);
      this.movePressing(pos);
    }
  }

  public onTouchEnd (event: TouchEvent) {
    if (this.longPressing) {
      this.stopLongPressing();
    }
    if (this.pressing) {
      this.stopPressing();
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
    this.pointStartedPos = pos;

    if (this.props.onPointStart) {
      this.props.onPointStart(pos);
    }

    if (this.props.onLongPoint) {
      this.progressLongPressing();
    }
  }

  public movePressing (pos: IPos) {
    if (this.pressing && this.props.onPointMove) {
      const originalPos = this.pointStartedPos;
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
      this.pointStartedPos = emptyPos;
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
    const p0 = this.pointStartedPos;
    const distance = Math.max(Math.abs(p0.x - pos.x), Math.abs(p0.y - pos.y));
    return distance > this.moveThreshold;
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
