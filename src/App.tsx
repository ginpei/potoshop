import * as React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import './App.css';
import ErrorOverlay from './components/ErrorOverlay';
import { appHistory } from './misc';
import AboutPage from './pages/AboutPage';
import CreateNewPage from './pages/CreateNewPage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import PaintPage from './pages/paint/PaintPage';

interface IAppState {
  errorMessage: string;
}

const ErrorNotFoundPage = () => {
  return (
    <ErrorOverlay
      title="404 Not found."
      />
  );
};

class App extends React.Component<any, IAppState> {
  protected history = appHistory;

  constructor (props: any) {
    super(props);
    this.state = {
      errorMessage: '',
    };
    this.onError = this.onError.bind(this);
    this.onIgnoreError = this.onIgnoreError.bind(this);
  }

  public render () {
    const errorPage = !this.state.errorMessage ? undefined : (
      <ErrorOverlay
        message={this.state.errorMessage}
        onIgnore={this.onIgnoreError}
        />
    );

    return (
      <Router history={this.history}>
        <div className="App">
          <Switch>
            <Route exact={true} path="/" component={HomePage}/>
            <Route exact={true} path="/paint" component={PaintPage}/>
            <Route exact={true} path="/new" component={CreateNewPage}/>
            <Route exact={true} path="/about" component={AboutPage}/>
            <Route exact={true} path="/history" component={HistoryPage}/>
            <Route component={ErrorNotFoundPage}/>
          </Switch>
          {errorPage}
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

  protected onIgnoreError () {
    this.setState({
      errorMessage: '',
    });
  }
}

export default App;
