import * as React from 'react';
import './AppCanvas.css';
import { AnimationFrameId, IPos, ISize, unixMs } from './misc';
import PressIndicator from './PressIndicator';

interface IAppCanvasProps {
  size: ISize;
  inactive: boolean;
  onCanvasReceive: (el: HTMLCanvasElement | null) => void;
  onLongTap: () => void;
}
interface IAppCanvasState {
  lastX: number;
  lastY: number;
  lining: boolean;
  offsetX: number;
  offsetY: number;
  pressedAt: IPos;
  pressProgress: number;
  pressStartedAt: unixMs;
}

class AppCanvas extends React.Component<IAppCanvasProps, IAppCanvasState> {
  protected refCanvas = React.createRef<HTMLCanvasElement>();
  protected tmPressing: AnimationFrameId = 0;
  protected lastImage: ImageData = new ImageData(1, 1);

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
      ...this.props.size,
      filter: this.props.inactive ? 'blur(5px)' : '',
    };
  }

  protected get pressIndicatorPos (): IPos {
    const s = this.state;
    return {
      x: s.lastX,
      y: s.lastY,
    };
  }

  constructor (props: IAppCanvasProps) {
    super(props);
    this.state = {
      lastX: 0,
      lastY: 0,
      lining: false,
      offsetX: 0,
      offsetY: 0,
      pressProgress: 0,
      pressStartedAt: 0,
      pressedAt: { x: 0, y: 0 },
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
      <div className="AppCanvas" style={this.styles}>
        <canvas className="AppCanvas-canvas"
          width={this.props.size.width}
          height={this.props.size.height}
          ref={this.refCanvas}
          />
        <PressIndicator
          pos={this.pressIndicatorPos}
          progress={this.state.pressProgress}
          size={100}
          />
      </div>
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
    this.ctx!.fillRect(0, 0, this.props.size.width, this.props.size.height);
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
      const t = touches[0];
      const pos: IPos = {
        x: t.clientX,
        y: t.clientY,
      };
      this.startLining(pos);
      this.startPressing(pos);
    }
  }

  protected onTouchMove (event: TouchEvent) {
    if (this.state.lining) {
      const { touches } = event;
      if (touches.length !== 1) {
        throw new Error('Something went wrong');
      }
      const t = touches[0];
      const pos: IPos = {
        x: t.clientX,
        y: t.clientY,
      };
      this.drawLine(pos);

      const threshold = 30;
      const at = this.state.pressedAt;
      if (Math.max(Math.abs(at.x - pos.x), Math.abs(at.y - pos.y)) > threshold) {
        this.stopPressing();
      }
    }
  }

  protected onTouchEnd (event: TouchEvent) {
    if (!this.state.lining) {
      return;
    }

    this.stopLining();
    this.stopPressing();
  }

  protected onMouseDown (event: MouseEvent) {
    event.preventDefault();
    const pos: IPos = {
      x: event.clientX,
      y: event.clientY,
    };
    this.startLining(pos);
  }

  protected onMouseMove (event: MouseEvent) {
    if (this.state.lining) {
      const pos: IPos = {
        x: event.clientX,
        y: event.clientY,
      };
      this.drawLine(pos);

      const pressingFluctuation = 30;
      const at = this.state.pressedAt;
      if (Math.abs(at.x - pos.x) > pressingFluctuation
        || Math.abs(at.y - pos.y) > pressingFluctuation) {
        this.stopPressing();
      }
    }
  }

  protected onMouseUp (event: MouseEvent) {
    if (!this.state.lining) {
      return;
    }

    this.stopLining();
    this.stopPressing();
  }

  /**
   * @see #progressPressing
   */
  protected onLongTap () {
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
    ctx.moveTo(x - offsetX, y - offsetY);

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
    ctx.lineTo(x - offsetX, y - offsetY);
    ctx.stroke();

    this.setState({
      lastX: x,
      lastY: y,
    });
  }

  protected stopLining () {
    this.stashImage();
    this.setState({
      lining: false,
    });
  }

  protected startPressing (pos: IPos) {
    this.setState({
      pressStartedAt: Date.now(),
      pressedAt: pos,
    });

    this.progressPressing();
  }

  protected progressPressing () {
    const duration = 1000;
    const elapsed = Date.now() - this.state.pressStartedAt;
    const progress = elapsed / duration;
    this.setState({
      pressProgress: Math.max(0, elapsed - duration / 2) / (duration / 2),
    });
    if (progress < 1) {
      this.tmPressing = requestAnimationFrame(() => this.progressPressing());
    }
    else {
      this.restoreLastImage();
      this.stopLining();
      this.stopPressing();
      this.onLongTap();
    }
  }

  protected stopPressing () {
    if (!this.tmPressing) {
      return;
    }

    cancelAnimationFrame(this.tmPressing);
    this.tmPressing = 0;

    this.setState({
      pressProgress: 0,
      pressStartedAt: 0,
    });
  }

  protected stashImage () {
    if (!this.ctx) {
      throw new Error('Canvas is not ready');
    }

    const { size } = this.props;
    this.lastImage = this.ctx.getImageData(0, 0, size.width, size.height);
  }

  protected restoreLastImage () {
    if (!this.ctx) {
      throw new Error('Canvas is not ready');
    }

    this.ctx.putImageData(this.lastImage, 0, 0);
  }
}

export default AppCanvas;
