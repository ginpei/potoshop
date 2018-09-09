// import * as firebase from 'firebase';
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { Route, Router } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';

class App extends React.Component {
  protected history = createBrowserHistory();

  public render () {
    const About = () => <h1>About</h1>;
    return (
      <Router history={this.history}>
        <div className="App">
          <Route exact={true} path="/" component={HomePage}/>
          <Route exact={true} path="/about" component={About}/>
        </div>
      </Router>
    );
  }
}

export default App;
