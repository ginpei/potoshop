// import * as firebase from 'firebase';
import { Color } from 'csstype';
import * as React from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/AppHeader';
import PointerHandler from '../../components/PointerHandler';
import { appSpace, defaultStrokeColors, defaultStrokeWidth, ISize } from '../../misc';
import firebase from '../../plugins/firebase';
import { readBlob, uploadImage } from '../../services/image';
import * as user from '../../services/user';
import PaintCanvas from './PaintCanvas';
import AppMenu from './PaintMenu';
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
  protected storageRef = firebase.storage().ref('v1-images');

  constructor (props: IPaintPagePros) {
    super(props);
    this.state = {
      canvasSize: {
        height: 0,
        width: 0,
      },
      justAfterStarted: true,
      menuVisible: true,
      resetting: false,
      strokeColor: defaultStrokeColors,
      strokeWidth: defaultStrokeWidth,
    };
    this.onTutorialLongPoint = this.onTutorialLongPoint.bind(this);
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
      <PaintCanvas
        height={this.state.canvasSize.height}
        inactive={this.state.menuVisible}
        strokeColor={this.state.strokeColor}
        strokeWidth={this.state.strokeWidth}
        width={this.state.canvasSize.width}
        onCanvasReceive={this.onCanvasReceive}
        onLongPoint={this.onCanvasLongTap}
        />
      );
    const tutorialOverlay = !this.state.justAfterStarted ? undefined : (
      <PointerHandler
        onLongPoint={this.onTutorialLongPoint}
        >
        <div className="AppTutorialOverlay">
          <AppHeader fullscreen={true}/>
          <div className="AppTutorialOverlay-body">
            <h1>Potoshop</h1>
            <p>
              Where you can draw and share.
              <br/>
              Hint: long tap to open menu.
            </p>
            <p><Link to="/about">This service uses cookie.</Link></p>
            <p className="AppTutorialOverlay-emphasized">Try long tap to start.</p>
          </div>
        </div>
      </PointerHandler>
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
        height: el.clientHeight - appSpace * 2,
        width: el.clientWidth - appSpace * 2,
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
    user.saveLogin(this.currentUser!.uid);
  }

  protected onTutorialLongPoint () {
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

    await uploadImage({
      blob: await readBlob(this.elCanvas),
      uid: this.currentUser!.uid,
    });
    window.location.href = '/history';
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
