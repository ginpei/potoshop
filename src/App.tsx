// import * as firebase from 'firebase';
import * as React from 'react';
import './App.css';
import AppCanvas from './AppCanvas';
import AppMenu from './AppMenu';
import LongTapper from './components/LongTapper';
import { ISize } from './misc';
import firebase from './plugin/firebase';

type IAppPros = any;
interface IAppState {
  canvasSize: ISize;
  justAfterStarted: boolean;
  menuVisible: boolean;
  resetting: boolean;
}

class App extends React.Component<IAppPros, IAppState> {
  protected currentUser: firebase.User | null;
  protected elCanvas: HTMLCanvasElement | null;
  protected storageRef = firebase.storage().ref('giazo/v1');

  constructor (props: IAppPros) {
    super(props);
    this.state = {
      canvasSize: {
        height: 0,
        width: 0,
      },
      justAfterStarted: true,
      menuVisible: false,
      resetting: false,
    };
    this.onTutorialLongTap = this.onTutorialLongTap.bind(this);
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
        inactive={this.state.menuVisible}
        onCanvasReceive={this.onCanvasReceive}
        onLongTap={this.onCanvasLongTap}
        />
      );
    const tutorialOverlay = !this.state.justAfterStarted ? undefined : (
      <LongTapper
        onLongTap={this.onTutorialLongTap}
        >
        <div className="AppTutorialOverlay">
          <h1>Giazo</h1>
          <p>
            Where you can draw and share.
            <br/>
            Hint: long tap to open menu.
          </p>
          <p><a href="/about.ja.html">This service uses cookie.</a></p>
          <p className="AppTutorialOverlay-emphasized">Try long tap to start.</p>
        </div>
      </LongTapper>
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
        {tutorialOverlay}
      </div>
    );
  }

  public async componentWillMount () {
    const el = document.documentElement;
    this.setState({
      canvasSize: {
        height: el.clientHeight,
        width: el.clientWidth,
      },
    });

    if (!firebase.auth().currentUser) {
      await firebase.auth().signInAnonymously();
    }
    this.currentUser = firebase.auth().currentUser;
  }

  protected onTutorialLongTap () {
    this.setState({
      justAfterStarted: false,
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

  protected async onSave () {
    if (!this.elCanvas) {
      throw new Error('Canvas is not ready');
    }

    const w = window.open('about:blank');
    const el = w && w.document.createElement('p');
    if (w) {
      const elHeading = w.document.createElement('p');
      elHeading.textContent = 'Uploading...';
      w.document.body.appendChild(elHeading);
      w.document.body.appendChild(el!);

      Object.assign(w.document.body.style, {
        alignItems: 'center',
        backgroundColor: 'black',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        margin: '0',
      });
    }

    const blob = await new Promise<Blob>((resolve) => {
      this.elCanvas!.toBlob(resolve as any);
    });

    const key = Date.now() + (Math.random() * 1000).toString().padStart(4, '0');
    const path = `${this.currentUser!.uid}/${key}.png`;
    const ref = this.storageRef.child(path);
    const task = ref.put(blob);
    task.on('state_changed', (s: firebase.storage.UploadTaskSnapshot) => {
      const progress = s.bytesTransferred / s.totalBytes;
      if (el) {
        el.textContent = `${Math.round(progress * 100)}%`;
      }
    });

    const url = await (await task).ref.getDownloadURL();
    (w || window).location.href = url;
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
