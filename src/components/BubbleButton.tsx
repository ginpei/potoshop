import * as React from 'react';
import { IPos } from '../misc';
import './BubbleButton.css';
import Draggable from './Draggable';

interface IBubbleButtonProps {
  initialLeft?: number;
  initialTop?: number;
  onPress?: () => void;
}
interface IBubbleButtonState {
  dLeft: number;
  dTop: number;
  left: number;
  top: number;
}

class BubbleButton extends React.Component<IBubbleButtonProps, IBubbleButtonState> {
  constructor (props: IBubbleButtonProps) {
    super(props);
    this.state = {
      dLeft: 0,
      dTop: 0,
      left: this.props.initialLeft || 100,
      top: this.props.initialTop || 100,
    };
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  public render () {
    const style: React.CSSProperties = {
      left: this.state.left + this.state.dLeft,
      top: this.state.top + this.state.dTop,
    };

    return (
      <Draggable
        onDragMove={this.onDragMove}
        onDragEnd={this.onDragEnd}
        >
        <div className="BubbleButton" style={style}>
          {this.props.children}
        </div>
      </Draggable>
    );
  }

  public onDragMove (diff: IPos) {
    this.setState({
      dLeft: diff.x,
      dTop: diff.y,
    });
  }

  public onDragEnd () {
    this.setState({
      dLeft: 0,
      dTop: 0,
      left: this.state.left + this.state.dLeft,
      top: this.state.top + this.state.dTop,
    });
  }

  public onClick (event: React.MouseEvent<HTMLButtonElement>) {
    if (this.props.onPress) {
      this.props.onPress();
    }
  }
}

export default BubbleButton;
