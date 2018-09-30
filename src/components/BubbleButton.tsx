import * as React from 'react';
import { between, IPos, ISize } from '../misc';
import './BubbleButton.css';
import Draggable from './Draggable';

interface IBubbleButtonProps {
  initialLeft?: number;
  initialTop?: number;
  onPress?: () => void;
  size?: number;
}
interface IBubbleButtonState {
  dLeft: number;
  dTop: number;
  dragging: boolean;
  left: number;
  top: number;
}

class BubbleButton extends React.Component<IBubbleButtonProps, IBubbleButtonState> {
  protected el = React.createRef<HTMLDivElement>();

  protected get size () {
    return this.props.size || 50;
  }

  constructor (props: IBubbleButtonProps) {
    super(props);
    this.state = {
      dLeft: 0,
      dTop: 0,
      dragging: false,
      left: this.props.initialLeft || 0,
      top: this.props.initialTop || 0,
    };
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  public render () {
    const className = [
      'BubbleButton',
      this.state.dragging ? '-dragging' : undefined,
    ].join(' ');
    const style: React.CSSProperties = {
      ['--bubble-button--size' as any]: `${this.size}px`,
      left: this.state.left + this.state.dLeft,
      top: this.state.top + this.state.dTop,
    };

    return (
      <Draggable
        onDragStart={this.onDragStart}
        onDragMove={this.onDragMove}
        onDragEnd={this.onDragEnd}
        >
        <div className={className} ref={this.el} style={style}>
          {this.props.children}
        </div>
      </Draggable>
    );
  }

  public onDragStart () {
    this.setState({
      dragging: true,
    });
  }

  public onDragMove (diff: IPos) {
    this.setState({
      dLeft: diff.x,
      dTop: diff.y,
    });
  }

  public onDragEnd () {
    const el = this.el.current;
    if (!el) {
      throw new Error('Element has to be not mounted');
    }

    const size: ISize = {
      height: el.offsetHeight,
      width: el.offsetWidth,
    };
    const areaSize: ISize = {
      height: el.offsetParent.clientHeight,
      width: el.offsetParent.clientWidth,
    };
    const endPos: IPos = {
      x: areaSize.width - size.width,
      y: areaSize.height - size.height,
    };

    const left = this.state.left + this.state.dLeft;
    const top = this.state.top + this.state.dTop;

    this.setState({
      dLeft: 0,
      dTop: 0,
      dragging: false,
      left: between(0, left, endPos.x),
      top: between(0, top, endPos.y),
    });
  }

  public onClick (event: React.MouseEvent<HTMLButtonElement>) {
    if (this.props.onPress) {
      this.props.onPress();
    }
  }
}

export default BubbleButton;
