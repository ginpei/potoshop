import * as React from 'react';
import './AppMenu.css';

interface IAppMenuProps {
  visible: boolean;
  onOverlayClick?: () => void;
}
// tslint:disable-next-line:no-empty-interface
interface IAppMenuState {
}

class AppMenu extends React.Component<IAppMenuProps, IAppMenuState> {
  constructor (props: IAppMenuProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  public render () {
    const styles: React.CSSProperties = {
      display: this.props.visible ? 'block' : 'none',
    };

    return (
      <div className="AppMenu"
        style={styles}
        onClick={this.onClick}
        >
        <div className="AppMenu-menu">
          <button>Save &amp; Share</button>
          <button>Reset</button>
        </div>
      </div>
    );
  }

  protected onClick (event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    if (this.props.onOverlayClick) {
      this.props.onOverlayClick();
    }
  }
}

export default AppMenu;
