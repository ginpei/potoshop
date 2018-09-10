// import * as firebase from 'firebase';
import * as React from 'react';
import './ErrorPage.css';

interface IErrorPageProps {
  message: string;
}

class ErrorPage extends React.Component<IErrorPageProps> {
  // constructor (props: any) {
  //   super(props);
  //   this.state = {
  //     errorMessage: '',
  //   };
  //   this.onError = this.onError.bind(this);
  // }

  public render () {
    return (
      <div className="ErrorPage">
        <div className="container">
          <h1>Sorry, something went wrong... X(</h1>
          <p>
            Here is an emergency kitten.
            <br/>
            <img className="ErrorPage-image" src="https://cataas.com/cat"/>
          </p>
          <p className="ErrorPage-message">
            <code>{this.props.message}</code>
          </p>
        </div>
      </div>
    );
  }

  public componentWillMount () {
    window.addEventListener('error', this.onError);
  }

  public componentWillUnmount () {
    window.removeEventListener('error', this.onError);
  }

  protected onError (error: ErrorEvent) {
    this.setState({
      errorMessage: error.message,
    });
  }
}

export default ErrorPage;
