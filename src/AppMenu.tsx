import * as React from 'react';
import './AppMenu.css';
import AppHeader from './components/AppHeader';

interface IAppMenuProps {
  visible: boolean;
  onOverlayClick: () => void;
  onColorChange: (color: string) => void;
  onSave: () => void;
  onReset: () => void;
}
// tslint:disable-next-line:no-empty-interface
interface IAppMenuState {
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
          <Colors
            colors={[
              '#f33',
              '#090',
              '#36f',
              '#fff',
              '#333',
            ]}
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
