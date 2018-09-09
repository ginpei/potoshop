import * as React from 'react';
import './App.css';
import AppCanvas from './AppCanvas';
import AppMenu from './AppMenu';
import { ISize } from './misc';

type IAppPros = any;
interface IAppState {
  canvasSize: ISize;
  menuVisible: boolean;
  resetting: boolean;
}

class App extends React.Component<IAppPros, IAppState> {
  protected elCanvas: HTMLCanvasElement | null;

  constructor (props: IAppPros) {
    super(props);
    this.state = {
      canvasSize: {
        height: 0,
        width: 0,
      },
      menuVisible: false,
      resetting: false,
    };
    this.onCanvasReceive = this.onCanvasReceive.bind(this);
    this.onCanvasLongTap = this.onCanvasLongTap.bind(this);
    this.onMenuOverlayClick = this.onMenuOverlayClick.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  public render () {
    const canvas = this.state.resetting ? undefined : (
      <AppCanvas
        size={this.state.canvasSize}
        onCanvasReceive={this.onCanvasReceive}
        onLongTap={this.onCanvasLongTap}
        />
      );

    return (
      <div className="App">
        {canvas}
        <AppMenu
          visible={this.state.menuVisible}
          onOverlayClick={this.onMenuOverlayClick}
          onSave={this.onSave}
          onReset={this.onReset}
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

  protected onCanvasReceive (el: HTMLCanvasElement | null) {
    this.elCanvas = el;
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

  protected onSave () {
    if (!this.elCanvas) {
      throw new Error('Canvas is not ready');
    }

    const w = window.open()!;
    const elImage = w.document.createElement('img');
    elImage.src = this.elCanvas.toDataURL();
    w.document.title = (new Date()).toString();
    Object.assign(w.document.body.style, {
      alignItems: 'center',
      backgroundColor: 'black',
      display: 'flex',
      justifyContent: 'center',
      margin: '0',
    });
    w.document.body.appendChild(elImage);
  }

  protected onReset () {
    this.setState({
      resetting: true,
    });

    setTimeout(() => {
      this.setState({
        menuVisible: false,
        resetting: false,
      });
    }, 1);
  }
}

export default App;
