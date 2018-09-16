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
}
interface IPointerHandlerState {
  pos: IPos;
  progress: number;
  startedAt: unixMs;
}

class PointerHandler extends React.Component<IPointerHandlerProps, IPointerHandlerState> {
  protected el = React.createRef<HTMLDivElement>();
  protected tmPressing: AnimationFrameId = 0;

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
    return this.state.startedAt !== 0;
  }

  protected get pressIndicatorPos (): IPos {
    return {
      x: this.state.pos.x,
      y: this.state.pos.y,
    };
  }

  constructor (props: IPointerHandlerProps) {
    super(props);
    this.state = {
      pos: emptyPos,
      progress: 0,
      startedAt: 0,
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
          pos={this.pressIndicatorPos}
          progress={this.state.progress}
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
    const { touches } = event;
    if (touches.length === 1) {
      const pos = this.getPos(event, 0);
      this.startPressing(pos);
    }
  }

  protected onTouchMove (event: TouchEvent) {
    if (!this.pressing) {
      return;
    }

    const { touches } = event;
    if (touches.length !== 1) {
      this.stopPressing();
    }

    const pos = this.getPos(event, 0);
    if (this.isPressMoved(pos)) {
      this.stopPressing();
    }
  }

  protected onTouchEnd (event: TouchEvent) {
    if (!this.pressing) {
      return;
    }

    this.stopPressing();
  }

  protected onMouseDown (event: MouseEvent) {
    event.preventDefault();
    const pos = this.getPos(event);
    this.startPressing(pos);
  }

  protected onMouseMove (event: MouseEvent) {
    if (!this.pressing) {
      return;
    }

    const pos = this.getPos(event);
    if (this.isPressMoved(pos)) {
      this.stopPressing();
    }
  }

  protected onMouseUp (event: MouseEvent) {
    if (!this.pressing) {
      return;
    }

    this.stopPressing();
  }

  protected startPressing (pos: IPos) {
    this.setState({
      pos,
      startedAt: Date.now(),
    });

    if (this.props.onLongPoint) {
      this.progressPressing();
    }
  }

  protected progressPressing () {
    const { duration } = this;
    const elapsed = Date.now() - this.state.startedAt;
    const progress = elapsed / duration;
    this.setState({
      progress: Math.max(0, elapsed - duration / 2) / (duration / 2),
    });
    if (progress < 1) {
      this.tmPressing = requestAnimationFrame(() => this.progressPressing());
    }
    else {
      this.stopPressing();

      if (this.props.onLongPoint) {
        this.props.onLongPoint();
      }
    }
  }

  protected stopPressing () {
    if (!this.tmPressing) {
      return;
    }

    cancelAnimationFrame(this.tmPressing);
    this.tmPressing = 0;

    this.setState({
      progress: 0,
      startedAt: 0,
    });
  }

  protected isPressMoved (pos: IPos) {
    const p0 = this.state.pos;
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
