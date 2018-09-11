// import * as firebase from 'firebase';
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import './App.css';
import AboutPage from './pages/AboutPage';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';

interface IAppState {
  errorMessage: string;
}

const ErrorNotFoundPage = () => {
  return (
    <ErrorPage
      title="404 Not found."
      />
  );
};

class App extends React.Component<any, IAppState> {
  protected history = createBrowserHistory();

  constructor (props: any) {
    super(props);
    this.state = {
      errorMessage: '',
    };
    this.onError = this.onError.bind(this);
  }

  public render () {
    if (this.state.errorMessage) {
      return (
        <ErrorPage
          message={this.state.errorMessage}
          />
      );
    }

    return (
      <Router history={this.history}>
        <div className="App">
          <Switch>
            <Route exact={true} path="/" component={HomePage}/>
            <Route exact={true} path="/about" component={AboutPage}/>
            <Route component={ErrorNotFoundPage}/>
          </Switch>
        </div>
      </Router>
    );
  }

  public componentWillMount () {
    window.addEventListener('error', this.onError);
  }

  public componentWillUnmount () {
    window.removeEventListener('error', this.onError);
  }

  protected onError ({ error }: ErrorEvent) {
    this.setState({
      errorMessage: error.message,
    });
  }
}

export default App;
