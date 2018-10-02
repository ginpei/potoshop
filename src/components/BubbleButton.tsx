import * as React from 'react';
import { appSpace, between, IPos, ISize } from '../misc';
import './BubbleButton.css';
import Draggable from './Draggable';

interface IBubbleButtonProps {
  initialLeft?: number;
  initialTop?: number;
  onPress?: (prev: boolean) => void; // TODO remove this argument, this is only for debugging
  size?: number;
}
interface IBubbleButtonState {
  clickable: boolean;
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
      clickable: true,
      dLeft: 0,
      dTop: 0,
      dragging: false,
      left: -999,
      top: -999,
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
        <div
          className={className}
          ref={this.el}
          style={style}
          onClick={this.onClick}
          >
          {this.props.children}
        </div>
      </Draggable>
    );
  }

  public componentDidMount () {
    const p = this.props;
    const pos = this.calculateProperPos({
      x: (p.initialLeft === undefined || p.initialLeft < 0) ? Infinity : p.initialLeft,
      y: (p.initialTop === undefined || p.initialTop < 0) ? Infinity : p.initialTop,
    });
    this.setState({
      left: pos.x,
      top: pos.y,
    });
  }

  public onDragStart () {
    this.setState({
      clickable: true,
      dragging: true,
    });
  }

  public onDragMove (diff: IPos) {
    const distance = 8;
    const movedEnough = Math.max(Math.abs(diff.x), Math.abs(diff.y)) > distance;
    this.setState({
      clickable: this.state.clickable && !movedEnough,
      dLeft: diff.x,
      dTop: diff.y,
    });
  }

  public onDragEnd () {
    const pos = this.calculateProperPos({
      x: this.state.left + this.state.dLeft,
      y: this.state.top + this.state.dTop,
    });

    this.setState({
      dLeft: 0,
      dTop: 0,
      dragging: false,
      left: pos.x,
      top: pos.y,
    });
  }

  public onClick (event: React.MouseEvent<HTMLDivElement>) {
    if (this.state.clickable && this.props.onPress) {
      this.props.onPress(event.shiftKey);
    }
  }

  protected calculateProperPos (pos: IPos): IPos {
    const el = this.el.current;
    if (!el) {
      throw new Error('Element has to be mounted');
    }

    const margin = appSpace / 2;

    const size: ISize = {
      height: el.offsetHeight,
      width: el.offsetWidth,
    };
    const areaSize: ISize = {
      height: el.offsetParent.clientHeight,
      width: el.offsetParent.clientWidth,
    };
    const minPos: IPos = {
      x: margin,
      y: margin,
    };
    const maxPos: IPos = {
      x: areaSize.width - size.width - margin,
      y: areaSize.height - size.height - margin,
    };
    const inLeftSide = pos.x < (maxPos.x / 2);
    const inTopSide = pos.y < (maxPos.y / 2);
    const edgeDistance: IPos = {
      x: inLeftSide ? pos.x : maxPos.x - pos.x,
      y: inTopSide ? pos.y : maxPos.y - pos.y,
    };

    let x;
    let y;
    if (edgeDistance.x < edgeDistance.y) {
      x = inLeftSide ? minPos.x : maxPos.x;
      y = between(minPos.y, pos.y, maxPos.y);
    } else {
      x = between(minPos.x, pos.x, maxPos.x);
      y = inTopSide ? minPos.y : maxPos.y;
    }

    return { x, y };
  }
}

export default BubbleButton;
