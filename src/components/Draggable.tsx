import * as React from 'react';
import { IPos } from '../misc';
import PointerHandler from './PointerHandler';

interface IDraggableProps {
  onDragEnd?: () => void;
  onDragMove?: (diff: IPos) => void;
  onDragStart?: () => void;
}
// tslint:disable-next-line:no-empty-interface
interface IDraggableState {
}

class Draggable extends React.Component<IDraggableProps, IDraggableState> {
  constructor (props: IDraggableProps) {
    super(props);
    this.state = {
    };
    this.onPointStart = this.onPointStart.bind(this);
    this.onPointMove = this.onPointMove.bind(this);
    this.onPointEnd = this.onPointEnd.bind(this);
  }

  public render () {
    return (
      <PointerHandler
        containing={false}
        onPointStart={this.onPointStart}
        onPointMove={this.onPointMove}
        onPointEnd={this.onPointEnd}
        >
        {this.props.children}
      </PointerHandler>
    );
  }

  protected onPointStart (pos: IPos) {
    if (this.props.onDragStart) {
      this.props.onDragStart();
    }
  }

  protected onPointMove (pos: IPos, originalPos: IPos) {
    if (this.props.onDragMove) {
      const diff: IPos = {
        x: pos.x - originalPos.x,
        y: pos.y - originalPos.y,
      };
      this.props.onDragMove(diff);
    }
  }

  protected onPointEnd () {
    if (this.props.onDragEnd) {
      this.props.onDragEnd();
    }
  }
}

export default Draggable;
