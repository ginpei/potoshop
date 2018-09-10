import * as React from 'react';
import './AppMenu.css';
import AppHeader from './components/AppHeader';
import { strokeColors, strokeWidths } from './misc';

interface IAppMenuProps {
  visible: boolean;
  onOverlayClick: () => void;
  onStrokeWidthChange: (width: number) => void;
  onColorChange: (color: string) => void;
  onSave: () => void;
  onReset: () => void;
}
// tslint:disable-next-line:no-empty-interface
interface IAppMenuState {
}

interface IStrokeWidthButtonProps {
  width: number;
  onClick: (width: number) => void;
}

function StrokeWidth (props: IStrokeWidthButtonProps) {
  const path = `
    M 40 10
    L 10 40
  `;
  const onClick = () => props.onClick(props.width);
  return (
    <span className="StrokeWidth">
      <button className="StrokeWidth-button"
        onClick={onClick}
        >
          <svg width="50" height="50">
            <path
              stroke="#333"
              strokeWidth={props.width}
              d={path}
              />
          </svg>
        </button>
    </span>
  );
}

interface IStrokeWidthsButtonProps {
  strokeWidths: number[];
  onChange: (width: number) => void;
}
function StrokeWidths (props: IStrokeWidthsButtonProps) {
  const onClick = (width: number) => {
    props.onChange(width);
  };

  const buttons = props.strokeWidths.map((width: number) => {
    return (
      <StrokeWidth
        key={width}
        width={width}
        onClick={onClick}
        />
    );
  });

  return (
    <div className="StrokeWidths">
      {buttons}
    </div>
  );
}

interface IColorButtonProps {
  color: string;
  onClick: (color: string) => void;
}

function ColorButton (props: IColorButtonProps) {
  const onClick = () => props.onClick(props.color);
  return (
    <span className="ColorButton">
      <button className="ColorButton-button"
        style={{ backgroundColor: props.color }}
        onClick={onClick}
        >{props.color}</button>
    </span>
  );
}

interface IColorsProps {
  colors: string[];
  onChange: (color: string) => void;
}
function Colors (props: IColorsProps) {
  const onClick = (color: string) => {
    props.onChange(color);
  };

  return (
    <div className="AppMenu-colors">
      <ColorButton
        color="#f33"
        onClick={onClick}
        />
      <ColorButton
        color="#090"
        onClick={onClick}
        />
      <ColorButton
        color="#36f"
        onClick={onClick}
        />
      <ColorButton
        color="#fff"
        onClick={onClick}
        />
      <ColorButton
        color="#333"
        onClick={onClick}
        />
    </div>
  );
}

class AppMenu extends React.Component<IAppMenuProps, IAppMenuState> {
  constructor (props: IAppMenuProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onStrokeWidthChange = this.onStrokeWidthChange.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
    this.onAboutClick = this.onAboutClick.bind(this);
  }

  public render () {
    return (
      <div className={`AppMenu ${this.props.visible ? '-visible' : ''}`}
        onClick={this.onClick}
        >
        <AppHeader/>
        <div className="AppMenu-close">
          <i className="fa fa-times" aria-hidden="true" />
        </div>
        <div className="AppMenu-menu">
          <button
            onClick={this.onSaveClick}
            >Save &amp; Share</button>
          <button
            onClick={this.onResetClick}
            >Reset</button>
          <button
            onClick={this.onAboutClick}
            >About</button>
        </div>
        <div className="AppMenu-penMenu">
          <StrokeWidths
            strokeWidths={strokeWidths}
            onChange={this.onStrokeWidthChange}
            />
          <Colors
            colors={strokeColors}
            onChange={this.onColorChange}
            />
        </div>
      </div>
    );
  }

  protected onClick (event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    this.props.onOverlayClick();
  }

  protected onStrokeWidthChange (width: number) {
    this.props.onStrokeWidthChange(width);
  }

  protected onColorChange (color: string) {
    this.props.onColorChange(color);
  }

  protected onSaveClick (event: React.MouseEvent<HTMLButtonElement>) {
    this.props.onSave();
  }

  protected onResetClick (event: React.MouseEvent<HTMLButtonElement>) {
    const text = 'Are you sure you want to erase all you have drawn?';
    if (window.confirm(text)) {
      this.props.onReset();
    }
  }

  protected onAboutClick (event: React.MouseEvent<HTMLButtonElement>) {
    window.open('/about');
  }
}

export default AppMenu;
