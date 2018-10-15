import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { Route, Router, Switch } from 'react-router-dom';
import { createStore } from 'redux';
import './App.css';
import ErrorOverlay from './components/ErrorOverlay';
import Processing from './containers/Processing';
import { appHistory } from './misc';
import AboutPage from './pages/AboutPage';
import CreateNewPage from './pages/CreateNewPage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import PaintPage from './pages/paint/PaintPage';
import UploadImagePage from './pages/UploadImagePage';
import rootReducer from './reducers/index';

interface IAppState {
  errorMessage: string;
}

const store = createStore(rootReducer);

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
    this.onUnhandledRejection = this.onUnhandledRejection.bind(this);
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
      <Provider store={store}>
        <Router history={this.history}>
          <div className="App">
            <Switch>
              <Route exact={true} path="/" component={HomePage}/>
              <Route exact={true} path="/paint" component={PaintPage}/>
              <Route exact={true} path="/new" component={CreateNewPage}/>
              <Route exact={true} path="/about" component={AboutPage}/>
              <Route exact={true} path="/history" component={HistoryPage}/>
              <Route exact={true} path="/upload" component={UploadImagePage}/>
              <Route component={ErrorNotFoundPage}/>
            </Switch>
            {errorPage}
            <Processing/>
          </div>
        </Router>
      </Provider>
    );
  }

  public componentWillMount () {
    window.addEventListener('error', this.onError);
    window.addEventListener('unhandledrejection', this.onUnhandledRejection);
  }

  public componentWillUnmount () {
    window.removeEventListener('error', this.onError);
    window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
  }

  protected onError ({ error }: ErrorEvent) {
    this.setState({
      errorMessage: error.message,
    });
  }

  protected onUnhandledRejection ({ reason }: PromiseRejectionEvent) {
    this.setState({
      errorMessage: reason.message,
    });
  }

  protected onIgnoreError () {
    this.setState({
      errorMessage: '',
    });
  }
}

export default hot(module)(App);
