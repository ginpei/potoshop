import * as React from 'react';
import './App.css';
import AppCanvas from './AppCanvas';
import AppMenu from './AppMenu';
import { ISize } from './misc';

type IAppPros = any;
interface IAppState {
  canvasSize: ISize;
  menuVisible: boolean;
}

class App extends React.Component<IAppPros, IAppState> {
  constructor (props: IAppPros) {
    super(props);
    this.state = {
      canvasSize: {
        height: 0,
        width: 0,
      },
      menuVisible: false,
    };
    this.onCanvasLongTap = this.onCanvasLongTap.bind(this);
    this.onMenuOverlayClick = this.onMenuOverlayClick.bind(this);
  }

  public render () {
    return (
      <div className="App">
        <AppCanvas
          size={this.state.canvasSize}
          onLongTap={this.onCanvasLongTap}
          />
        <AppMenu
          visible={this.state.menuVisible}
          onOverlayClick={this.onMenuOverlayClick}
          />
      </div>
    );
  }

  public componentWillMount () {
    const el = document.documentElement;
    this.setState({
      canvasSize: {
        height: el.clientHeight,
        width: el.clientWidth,
      },
    });
  }

  protected onCanvasLongTap () {
    this.setState({
      menuVisible: true,
    });
  }

  protected onMenuOverlayClick () {
    this.setState({
      menuVisible: false,
    });
  }
}

export default App;
