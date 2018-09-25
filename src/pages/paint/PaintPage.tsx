// import * as firebase from 'firebase';
import { Color } from 'csstype';
import * as React from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/AppHeader';
import PointerHandler from '../../components/PointerHandler';
import { appHistory, appSpace, defaultStrokeColors, defaultStrokeWidth, getNewType, getUrlParamOf, ISize, NewType } from '../../misc';
import firebase from '../../plugins/firebase';
import { getImageUrl, loadImage, readBlob, uploadImage } from '../../services/image';
import * as user from '../../services/user';
import PaintCanvas from './PaintCanvas';
import AppMenu from './PaintMenu';
import './PaintPage.css';

type IPaintPagePros = any;
interface IPaintPageState {
  height: number;
  imageLoading: boolean;
  imageSize: ISize;
  justAfterStarted: boolean;
  menuVisible: boolean;
  originalImage?: HTMLImageElement;
  strokeColor: Color;
  strokeWidth: number;
  width: number;
}

class PaintPage extends React.Component<IPaintPagePros, IPaintPageState> {
  protected currentUser: firebase.User | null;
  protected elCanvas: HTMLCanvasElement | null;
  protected storageRef = firebase.storage().ref('v1-images');
  protected newType = '';

  constructor (props: IPaintPagePros) {
    super(props);
    this.state = {
      height: 0,
      imageLoading: false,
      imageSize: {
        height: 0,
        width: 0,
      },
      justAfterStarted: true,
      menuVisible: true,
      originalImage: undefined,
      strokeColor: defaultStrokeColors,
      strokeWidth: defaultStrokeWidth,
      width: 0,
    };
    this.onDocumentTouchStart = this.onDocumentTouchStart.bind(this);
    this.onTutorialLongPoint = this.onTutorialLongPoint.bind(this);
    this.onCanvasReceive = this.onCanvasReceive.bind(this);
    this.onCanvasLongTap = this.onCanvasLongTap.bind(this);
    this.onMenuOverlayClick = this.onMenuOverlayClick.bind(this);
    this.onStrokeWidthChange = this.onStrokeWidthChange.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onNew = this.onNew.bind(this);
  }

  public render () {
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
        {!this.state.imageLoading && <PaintCanvas
          height={this.state.height}
          imageHeight={this.state.imageSize.height}
          imageWidth={this.state.imageSize.width}
          inactive={this.state.menuVisible}
          originalImage={this.state.originalImage}
          strokeColor={this.state.strokeColor}
          strokeWidth={this.state.strokeWidth}
          width={this.state.width}
          onCanvasReceive={this.onCanvasReceive}
          onLongPoint={this.onCanvasLongTap}
          />}
        <AppMenu
          visible={this.state.menuVisible}
          onOverlayClick={this.onMenuOverlayClick}
          onStrokeWidthChange={this.onStrokeWidthChange}
          onColorChange={this.onColorChange}
          onSave={this.onSave}
          onNew={this.onNew}
          />
        {tutorialOverlay}
      </div>
    );
  }

  public async componentWillMount () {
    this.renameMeProperlyLater();

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

    document.addEventListener('touchstart', this.onDocumentTouchStart, { passive: false });
  }

  public componentDidMount () {
    if (this.newType === NewType.history) {
      const uid = getUrlParamOf('uid', '');
      const imageId = getUrlParamOf('id', '');
      this.loadImageFromHistory(uid, imageId);
    }
  }

  public componentWillUnmount () {
    document.removeEventListener('touchstart', this.onDocumentTouchStart);
  }

  protected onDocumentTouchStart (event: TouchEvent) {
    // prevent from zooming
    if (event.touches.length >= 2) {
      event.preventDefault();
    }
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

  protected onNew () {
    appHistory.push('/new');
  }

  // TODO rename properly
  protected renameMeProperlyLater () {
    // this is called only from `componentWillMount()`

    const el = document.documentElement;
    this.setState({
      height: el.clientHeight,
      width: el.clientWidth,
    });

    let imageSize: ISize | null = null;
    const newType = getNewType();
    if (newType) {
      this.newType = newType;
      if (newType === NewType.size) {
        imageSize = {
          height: Number(getUrlParamOf('height')) || 1,
          width: Number(getUrlParamOf('width')) || 1,
        };
      } else if (newType === NewType.history) {
        this.setState({
          imageLoading: true,
        });
      } else {
        console.warn('Invalid parameters');
      }
    }

    if (!imageSize) {
      imageSize = {
        height: this.state.height! - appSpace * 2,
        width: this.state.width! - appSpace * 2,
      };
    }
    this.setState({
      imageSize,
    });
  }

  protected async loadImageFromHistory (uid: string, imageId: string) {
    if (!uid || !imageId) {
      throw new Error('User ID and image ID must be given');
    }

    const url = await getImageUrl(uid, imageId);
    try {
      const image = await loadImage(url);
      this.setState({
        imageLoading: false,
        imageSize: {
          height: image.naturalHeight,
          width: image.naturalWidth,
        },
        originalImage: image,
      });
    } catch (error) {
      throw error;
    }
  }
}

export default PaintPage;
