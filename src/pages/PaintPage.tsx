// import * as firebase from 'firebase';
import { Color } from 'csstype';
import * as React from 'react';
import { Link } from 'react-router-dom';
import AppCanvas from '../AppCanvas';
import AppMenu from '../AppMenu';
import AppHeader from '../components/AppHeader';
import LongTapper from '../components/LongTapper';
import { defaultStrokeColors, defaultStrokeWidth, ISize } from '../misc';
import firebase from '../plugin/firebase';
import './PaintPage.css';

type IPaintPagePros = any;
interface IPaintPageState {
  canvasSize: ISize;
  justAfterStarted: boolean;
  menuVisible: boolean;
  resetting: boolean;
  strokeColor: Color;
  strokeWidth: number;
}

class PaintPage extends React.Component<IPaintPagePros, IPaintPageState> {
  protected currentUser: firebase.User | null;
  protected elCanvas: HTMLCanvasElement | null;
  protected storageRef = firebase.storage().ref('giazo/v1');

  constructor (props: IPaintPagePros) {
    super(props);
    this.state = {
      canvasSize: {
        height: 0,
        width: 0,
      },
      justAfterStarted: true,
      menuVisible: false,
      resetting: false,
      strokeColor: defaultStrokeColors,
      strokeWidth: defaultStrokeWidth,
    };
    this.onTutorialLongTap = this.onTutorialLongTap.bind(this);
    this.onCanvasReceive = this.onCanvasReceive.bind(this);
    this.onCanvasLongTap = this.onCanvasLongTap.bind(this);
    this.onMenuOverlayClick = this.onMenuOverlayClick.bind(this);
    this.onStrokeWidthChange = this.onStrokeWidthChange.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  public render () {
    const canvas = this.state.resetting ? undefined : (
      <AppCanvas
        size={this.state.canvasSize}
        inactive={this.state.menuVisible}
        strokeColor={this.state.strokeColor}
        strokeWidth={this.state.strokeWidth}
        onCanvasReceive={this.onCanvasReceive}
        onLongTap={this.onCanvasLongTap}
        />
      );
    const tutorialOverlay = !this.state.justAfterStarted ? undefined : (
      <LongTapper
        onLongTap={this.onTutorialLongTap}
        >
        <div className="AppTutorialOverlay">
          <AppHeader/>
          <div className="AppTutorialOverlay-body">
            <h1>Giazo</h1>
            <p>
              Where you can draw and share.
              <br/>
              Hint: long tap to open menu.
            </p>
            <p><Link to="/about">This service uses cookie.</Link></p>
            <p className="AppTutorialOverlay-emphasized">Try long tap to start.</p>
          </div>
        </div>
      </LongTapper>
    );

    if (this.state.justAfterStarted) {
      return tutorialOverlay;
    }

    return (
      <div className="PaintPage">
        {canvas}
        <AppMenu
          visible={this.state.menuVisible}
          onOverlayClick={this.onMenuOverlayClick}
          onStrokeWidthChange={this.onStrokeWidthChange}
          onColorChange={this.onColorChange}
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
      try {
        await firebase.auth().signInAnonymously();
      } catch (error) {
        const detail = JSON.parse(error.message);
        throw new Error(detail.error.message);
      }
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

  protected onStrokeWidthChange (width: number) {
    this.setState({
      strokeWidth: width,
    });
  }

  protected onColorChange (color: Color) {
    this.setState({
      strokeColor: color,
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

export default PaintPage;
