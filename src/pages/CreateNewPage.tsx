import * as React from 'react';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import { appSpace } from '../misc';
import './CreateNewPage.css';

type ICreateNewPagePros = any;
interface ICreateNewPageState {
  height: number;
  width: number;
}

class CreateNewPage extends React.Component<ICreateNewPagePros, ICreateNewPageState> {
  constructor (props: ICreateNewPagePros) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
    };
    this.onChange = this.onChange.bind(this);
  }

  public render () {
    return (
      <div className="CreateNewPage">
        <AppHeader/>
        <div className="container" lang="ja">
          <h1>Create New</h1>
          <form action="/" method="GET">
            <input type="hidden" name="newType" value="size"/>
            <input className="CreateNewPage-sizeInput" type="number"
              name="width"
              value={this.state.width}
              onChange={this.onChange}
              />
            x
            <input className="CreateNewPage-sizeInput" type="number"
              name="height"
              value={this.state.height}
              onChange={this.onChange}
              />
            <button>Create new</button>
          </form>
        </div>
        <AppFooter/>
      </div>
    );
  }

  public componentWillMount () {
    const el = document.documentElement;
    this.setState({
      height: el.clientHeight - appSpace * 2,
      width: el.clientWidth - appSpace * 2,
    });
  }

  protected onChange (event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    if (name === 'height') {
      this.setState({
        height: Number(value),
      });
    } else if (name === 'width') {
      this.setState({
        width: Number(value),
      });
    } else {
      throw new Error(`Unknown input named ${name}`);
    }
  }
}

export default CreateNewPage;
