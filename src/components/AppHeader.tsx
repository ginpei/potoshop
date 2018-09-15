import * as React from 'react';
import { Link } from 'react-router-dom';
import './AppHeader.css';

interface IAppHeaderProps {
  fullscreen?: boolean;
}

class AppHeader extends React.Component<IAppHeaderProps> {
  public render () {
    return (
      <div className="AppHeader">
        <div className={this.props.fullscreen === true ? 'AppHeader-container' : 'container'}>
          <Link className="AppHeader-title" to="/">Potoshop</Link>
        </div>
      </div>
    );
  }
}

export default AppHeader;
