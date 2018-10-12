import * as React from 'react';
import { IPos } from '../misc';
import './PressIndicator.css';

interface IPressIndicatorProps {
  pos: IPos;
  progress: number;
  size?: number;
  width?: number;
}
interface IPressIndicatorState {
}

class PressIndicator extends React.Component<IPressIndicatorProps, IPressIndicatorState> {
  protected get size () {
    return this.props.size || 150;
  }
  protected get width () {
    return this.props.width || 5;
  }

  protected get styles (): React.CSSProperties {
    return {
      display: this.props.progress ? 'block' : 'none',
      left: this.props.pos.x,
      top: this.props.pos.y,
    };
  }

  protected get path (): string {
    const progress = this.props.progress;
    const half = this.size / 2;
    const { width } = this;

    const r = half - width;
    const degreeOffset = Math.PI * -0.5;
    const degree = 2 * Math.PI * progress + degreeOffset;
    const bLargeArc = progress < 0.5 ? 0 : 1;

    const x0 = half;
    const y0 = half;
    const x1 = x0;
    const y1 = y0 - r;
    const x2 = x0 + r * Math.cos(degree);
    const y2 = y0 + r * Math.sin(degree);

    return `
      M ${x1} ${y1}
      A ${r} ${r} 0 ${bLargeArc} 1 ${x2} ${y2}
    `;
  }

  // constructor (props: IPressIndicatorProps) {
  //   super(props);
  //   this.state = {
  //   };
  // }

  public render () {
    return (
      <svg className="PressIndicator"
        style={this.styles}
        width={this.size}
        height={this.size}
        >
        <path className="PressIndicator-progress"
          d={this.path}
          strokeWidth={this.width}
          />
      </svg>
    );
  }

  public componentDidUpdate (prevProps: IPressIndicatorProps) {
    if (prevProps.progress < 1 && this.props.progress >= 1) {
      this.startPressedAnimation();
    }
  }

  protected startPressedAnimation () {
    // do something here in the future
  }
}

export default PressIndicator;
