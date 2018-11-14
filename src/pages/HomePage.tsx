import * as React from 'react';
import { Link } from 'react-router-dom';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import NiceButton from '../components/NiceButton';
import './HomePage.css';

type IHomePagePros = any;
interface IHomePageState {
  beforeInstallPromptEvent: Event | null;
}

class HomePage extends React.Component<IHomePagePros, IHomePageState> {
  constructor (props: IHomePagePros) {
    super(props);
    this.state = {
      beforeInstallPromptEvent: null,
    };
    this.onBeforeInstallPrompt = this.onBeforeInstallPrompt.bind(this);
    this.onInstallClick = this.onInstallClick.bind(this);
  }

  public render () {
    return (
      <div className="HomePage">
        <AppHeader/>
        <div className="container" lang="ja">
          <h1>Potoshop</h1>
          <p>Where you can draw and share images.</p>
          <div className="HomePage-menuList">
            <Link className="HomePage-menuItem" to="/paint">
              <i className="fa fa-paint-brush" aria-hidden="true"/>
              Just draw!
            </Link>
            <Link className="HomePage-menuItem" to="/new">
              <i className="fa fa-sliders" aria-hidden="true"/>
              New as...
            </Link>
            <Link className="HomePage-menuItem" to="/history">
              <i className="fa fa-history" aria-hidden="true"/>
              History
            </Link>
            <Link className="HomePage-menuItem" to="/about">
              <i className="fa fa-info-circle" aria-hidden="true"/>
              About
            </Link>
            {this.state.beforeInstallPromptEvent && <NiceButton
              icon="cloud-download"
              onClick={this.onInstallClick}
              >
              {' '}
              Install
            </NiceButton>}
          </div>
        </div>
        <AppFooter/>
      </div>
    );
  }

  public componentWillMount () {
    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
  }

  public componentWillUnmount () {
    window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
  }

  protected onBeforeInstallPrompt (event: Event) {
    this.setState({
      beforeInstallPromptEvent: event,
    });
  }

  protected onInstallClick () {
    this.install();
  }

  protected async install () {
    const event = this.state.beforeInstallPromptEvent as any;
    event.prompt();
    const result = await event.userChoice;
    if (result.outcome === 'accepted') {
      this.setState({
        beforeInstallPromptEvent: null,
      });
    }
  }
}

export default HomePage;
