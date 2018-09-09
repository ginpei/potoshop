import * as React from 'react';
import './AppMenu.css';
import AppHeader from './components/AppHeader';

interface IAppMenuProps {
  visible: boolean;
  onOverlayClick: () => void;
  onSave: () => void;
  onReset: () => void;
}
// tslint:disable-next-line:no-empty-interface
interface IAppMenuState {
}

class AppMenu extends React.Component<IAppMenuProps, IAppMenuState> {
  constructor (props: IAppMenuProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
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
      </div>
    );
  }

  protected onClick (event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    this.props.onOverlayClick();
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
    window.open('/about.ja.html');
  }
}

export default AppMenu;
