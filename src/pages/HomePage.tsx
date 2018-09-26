import * as React from 'react';
import { Link } from 'react-router-dom';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import './HomePage.css';

type IHomePagePros = any;
type IHomePageState = any;

class HomePage extends React.Component<IHomePagePros, IHomePageState> {
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
          </div>
        </div>
        <AppFooter/>
      </div>
    );
  }
}

export default HomePage;
