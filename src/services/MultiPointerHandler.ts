import { emptyPos, IPos, IPosPair } from '../misc';
import PointerHandler, { IPointerHandlerProps } from './PointerHandler';

export interface IMultiPointerHandlerProps extends IPointerHandlerProps {
  onPinchEnd?: () => void;
  onPinchMove?: (pair: IPosPair, originalPair: IPosPair) => void;
  onPinchStart?: (pair: IPosPair) => void;
}

export default class MultiPointerHandler extends PointerHandler {
  protected props: IMultiPointerHandlerProps;
  protected pinching = false;
  protected pinchOriginalPos: IPosPair = [emptyPos, emptyPos];

  protected get pinchOriginalCenter (): IPos {
    const [p1, p2] = this.pinchOriginalPos;
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  protected get pinchOriginalDistance () {
    const [p1, p2] = this.pinchOriginalPos;
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  public constructor (props: IMultiPointerHandlerProps) {
    super(props);
    this.props = props;
  }

  public onTouchStart (event: TouchEvent) {
    const numTouches = event.touches.length;
    if (numTouches === 1) {
      super.onTouchStart(event);
    } else if (this.pressing && numTouches === 2) {
      event.preventDefault();
      const pair: IPosPair = [
        this.getPos(event, 0),
        this.getPos(event, 1),
      ];
      this.startPinching(pair);
    }
  }

  public onTouchMove (event: TouchEvent) {
    const numTouches = event.touches.length;
    if (numTouches === 1) {
      super.onTouchMove(event);
    } else if (this.pinching && numTouches === 2) {
      const posPair: IPosPair = [this.getPos(event, 0), this.getPos(event, 1)];
      this.movePinching(posPair);
    }
  }

  public onTouchEnd (event: TouchEvent) {
    super.onTouchEnd(event);

    if (this.pinching) {
      this.stopPinching();
    }
  }

  protected startPinching (posPair: IPosPair) {
    this.stopLongPressing();
    this.cancelPressing();

    this.pinching = true;
    this.pinchOriginalPos = posPair;

    if (this.props.onPinchStart) {
      this.props.onPinchStart(posPair);
    }
  }

  protected movePinching (posPair: IPosPair) {
    if (!this.pinching) {
      return;
    }

    if (this.props.onPinchMove) {
      this.props.onPinchMove(posPair, this.pinchOriginalPos);
    }
  }

  protected stopPinching () {
    if (!this.pinching) {
      return;
    }

    this.pinching = false;
    if (this.props.onPinchEnd) {
      this.props.onPinchEnd();
    }
  }
}
