import * as React from 'react';
import './ErrorPage.css';

interface IErrorPageProps {
  message?: string;
  title?: string;
}
interface IErrorPageState {
  loading: boolean;
}

class ErrorPage extends React.Component<IErrorPageProps, IErrorPageState> {
  constructor (props: IErrorPageProps) {
    super(props);
    this.state = {
      loading: true,
    };
    this.onImageLoad = this.onImageLoad.bind(this);
  }

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
            Here is an emergency kitten, just in case.
          </p>
          <figure className="ErrorPage-imageBlock">
            <img
              src="https://cataas.com/cat"
              className={`ErrorPage-image ${this.state.loading ? '-loading' : ''}`}
              onLoad={this.onImageLoad}
              />
          </figure>
          {message}
        </div>
      </div>
    );
  }

  protected onImageLoad (event: React.SyntheticEvent<HTMLImageElement>) {
    this.setState({
      loading: false,
    });
  }
}

export default ErrorPage;
