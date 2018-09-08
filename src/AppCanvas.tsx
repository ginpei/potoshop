import * as React from 'react';
import './AppCanvas.css';

// tslint:disable-next-line:no-empty-interface
interface IAppCanvasProps {
}
interface IAppCanvasState {
  lastX: number;
  lastY: number;
  lining: boolean;
  offsetX: number;
  offsetY: number;
}
interface IPos {
  x: number;
  y: number;
}

class AppCanvas extends React.Component<IAppCanvasProps, IAppCanvasState> {
  protected refCanvas = React.createRef<HTMLCanvasElement>();
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

  constructor (props: IAppCanvasProps) {
    super(props);
    this.state = {
      lastX: 0,
      lastY: 0,
      lining: false,
      offsetX: 0,
      offsetY: 0,
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
      <div className="AppCanvas">
        <canvas className="AppCanvas-canvas"
          ref={this.refCanvas}
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
    }
  }

  protected onTouchEnd (event: TouchEvent) {
    if (!this.state.lining) {
      return;
    }

    this.setState({
      lining: false,
    });
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
    }
  }

  protected onMouseUp (event: MouseEvent) {
    if (!this.state.lining) {
      return;
    }

    this.setState({
      lining: false,
    });
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
}

export default AppCanvas;
