import * as React from 'react';
import { AnimationFrameId, emptyPos, IPos, unixMs } from '../misc';
import './PointerHandler.css';
import PressIndicator from './PressIndicator';

interface IPointerHandlerProps {
  children: React.ReactNode;
  containing?: boolean;
  duration?: number;
  moveThreshold?: number;
  size?: number;
  width?: number;
  onLongPoint?: () => void;
  onPointCancel?: () => void;
  onPointEnd?: () => void;
  onPointMove?: (pos: IPos, startedPos: IPos) => void;
  onPointStart?: (pos: IPos) => void;
}
interface IPointerHandlerState {
  longPressProgress: number;
  pointStartedAt: unixMs;
  pointStartedPos: IPos;
}

class PointerHandler extends React.Component<IPointerHandlerProps, IPointerHandlerState> {
  protected el = React.createRef<HTMLDivElement>();
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
    return this.state.pointStartedAt !== 0;
  }

  protected get longPressing () {
    return this.tmLongPressing !== 0;
  }

  constructor (props: IPointerHandlerProps) {
    super(props);
    this.state = {
      longPressProgress: 0,
      pointStartedAt: 0,
      pointStartedPos: emptyPos,
    };
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  public render () {
    return (
      <div className={`PointerHandler ${this.containing ? '-containing' : ''}`}
        ref={this.el}
        >
        {this.props.children}
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
    const el = this.el.current!;
    el.addEventListener('touchstart', this.onTouchStart, { passive: false });
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('touchcancel', this.onTouchEnd);
    el.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  public componentWillUnmount () {
    const el = this.el.current!;
    el.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('touchcancel', this.onTouchEnd);
    el.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  protected onTouchStart (event: TouchEvent) {
    const numTouches = event.touches.length;
    if (numTouches === 1) {
      const pos = this.getPos(event, 0);
      this.startPressing(pos);
    }
  }

  protected onTouchMove (event: TouchEvent) {
    const numTouches = event.touches.length;
    if (this.pressing && numTouches === 1) {
      const pos = this.getPos(event, 0);
      this.movePressing(pos);
    }
  }

  protected onTouchEnd (event: TouchEvent) {
    if (this.pressing) {
      this.stopPressing();
    }
  }

  protected onMouseDown (event: MouseEvent) {
    event.preventDefault();
    const pos = this.getPos(event);
    this.startPressing(pos);
  }

  protected onMouseMove (event: MouseEvent) {
    if (this.pressing) {
      const pos = this.getPos(event);
      this.movePressing(pos);
    }
  }

  protected onMouseUp (event: MouseEvent) {
    if (this.pressing) {
      this.stopPressing();
    }
    if (this.longPressing) {
      this.stopLongPressing();
    }
  }

  protected startPressing (pos: IPos) {
    this.setState({
      pointStartedAt: Date.now(),
      pointStartedPos: pos,
    });

    if (this.props.onPointStart) {
      this.props.onPointStart(pos);
    }

    if (this.props.onLongPoint) {
      this.progressLongPressing();
    }
  }

  protected movePressing (pos: IPos) {
    if (this.pressing && this.props.onPointMove) {
      const originalPos = this.state.pointStartedPos;
      this.props.onPointMove(pos, originalPos);
    }

    if (this.props.onLongPoint && this.longPressing && this.isPressMoved(pos)) {
      this.stopLongPressing();
    }
  }

  protected stopPressing () {
    if (this.pressing) {
      if (this.props.onPointEnd) {
        this.props.onPointEnd();
      }

      this.setState({
        pointStartedAt: 0,
        pointStartedPos: emptyPos,
      });
    }
  }

  protected cancelPressing () {
    if (this.pressing) {
      if (this.props.onPointCancel) {
        this.props.onPointCancel();
      }

      this.stopPressing();
    }
  }

  protected progressLongPressing () {
    const { duration } = this;
    const elapsed = Date.now() - this.state.pointStartedAt;
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

export default PointerHandler;
