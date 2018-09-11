import * as React from 'react';
import './ErrorPage.css';

interface IErrorPageProps {
  message?: string;
  title?: string;
}

class ErrorPage extends React.Component<IErrorPageProps> {
  public render () {
    const title = this.props.title || 'Sorry, something went wrong... X(';
    const message = !this.props.message ? undefined : (
      <p className="ErrorPage-message">
        <code>{this.props.message}</code>
      </p>
    );

    return (
      <div className="ErrorPage">
        <div className="container">
          <h1>{title}</h1>
          <p>
            Here is an emergency kitten.
            <br/>
            <img className="ErrorPage-image" src="https://cataas.com/cat"/>
          </p>
          {message}
        </div>
      </div>
    );
  }
}

export default ErrorPage;
