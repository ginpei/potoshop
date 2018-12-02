import * as React from 'react';
import { IPos } from '../misc';
import PointerHandler from '../services/PointerHandler';

interface IDraggableProps {
  onClick?: (pos: IPos) => void;
  onDragEnd?: () => void;
  onDragMove?: (diff: IPos) => void;
  onDragStart?: () => void;
}
interface IDraggableState {
}

class Draggable extends React.Component<IDraggableProps, IDraggableState> {
  protected el = React.createRef<HTMLDivElement>();
  protected pointerHandler: PointerHandler;

  constructor (props: IDraggableProps) {
    super(props);
    this.state = {
    };
    this.onPointStart = this.onPointStart.bind(this);
    this.onPointMove = this.onPointMove.bind(this);
    this.onPointEnd = this.onPointEnd.bind(this);

    this.pointerHandler = new PointerHandler({
      containing: false,
      onPointEnd: this.onPointEnd,
      onPointMove: this.onPointMove,
      onPointStart: this.onPointStart,
      onPress: this.props.onClick,
    });
  }

  public render () {
    return (
      <div ref={this.el}>
        {this.props.children}
      </div>
    );
  }

  public componentDidMount () {
    const el = this.el.current;
    if (!el) {
      throw new Error('Mount but no element');
    }
    this.pointerHandler.start(el);
  }

  public componentWillUnmount () {
    this.pointerHandler.stop();
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
