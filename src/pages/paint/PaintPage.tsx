// import * as firebase from 'firebase';
import { Color } from 'csstype';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/AppHeader';
import BubbleButton from '../../components/BubbleButton';
import PointerHandler from '../../components/PointerHandler';
import { appHistory, appSpace, CanvasType, defaultStrokeColors, defaultStrokeWidth, getCanvasType, getUrlParamOf, ISize } from '../../misc';
import firebase from '../../plugins/firebase';
import * as processing from '../../reducers/processing';
import CanvasHistory, { HistoryType } from '../../services/CanvasHistory';
import { getImageUrl, loadImage, readBlob, uploadImage } from '../../services/image';
import * as paths from '../../services/paths';
import * as user from '../../services/user';
import PaintCanvas from './PaintCanvas';
import AppMenu from './PaintMenu';
import './PaintPage.css';

interface IPaintPagePros {
  startProcessing: () => () => void;
}

interface IPaintPageState {
  dirty: boolean;
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
  protected currentUser: firebase.User | null = null;
  protected elCanvas: HTMLCanvasElement | null = null;
  protected storageRef = firebase.storage().ref('v1-images');
  protected canvasType = '';
  protected canvasHistory = new CanvasHistory();

  constructor (props: IPaintPagePros) {
    super(props);
    this.state = {
      dirty: false,
      height: 0,
      imageLoading: false,
      imageSize: {
        height: 0,
        width: 0,
      },
      justAfterStarted: false,
      menuVisible: false,
      originalImage: undefined,
      strokeColor: defaultStrokeColors,
      strokeWidth: defaultStrokeWidth,
      width: 0,
    };
    this.onBeforeUnload = this.onBeforeUnload.bind(this);
    this.onDocumentTouchStart = this.onDocumentTouchStart.bind(this);
    this.onUndoClick = this.onUndoClick.bind(this);
    this.onRedoClick = this.onRedoClick.bind(this);
    this.onTutorialLongPoint = this.onTutorialLongPoint.bind(this);
    this.onCanvasReceive = this.onCanvasReceive.bind(this);
    this.onCanvasUpdated = this.onCanvasUpdated.bind(this);
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
          onCanvasUpdated={this.onCanvasUpdated}
          onLongPoint={this.onCanvasLongTap}
          />}
        <BubbleButton
          initialLeft={0}
          onPress={this.onUndoClick}
          >
          <i className="fa fa-undo" aria-hidden="true"/>
        </BubbleButton>
        <BubbleButton
          onPress={this.onRedoClick}
          >
          <i className="fa fa-repeat" aria-hidden="true"/>
        </BubbleButton>
        <AppMenu
          strokeColor={this.state.strokeColor}
          strokeWidth={this.state.strokeWidth}
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
    this.setUpSizes();

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
    window.addEventListener('beforeunload', this.onBeforeUnload);
  }

  public componentDidMount () {
    if (this.canvasType === CanvasType.history) {
      const uid = getUrlParamOf('uid', '');
      const imageId = getUrlParamOf('id', '');
      this.loadImageFromHistory(uid, imageId);
    } else if (this.canvasType === CanvasType.upload) {
      this.loadImageFromDisk();
    }
  }

  public componentWillUnmount () {
    document.removeEventListener('touchstart', this.onDocumentTouchStart);
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  }

  protected onBeforeUnload (event: BeforeUnloadEvent) {
    if (this.state.dirty) {
      event.preventDefault();

      // Chrome doesn't support preventDefault even not support message
      // (remove this when it supports preventDefault way)
      event.returnValue = 'Are you sure?';
    }
  }

  protected onDocumentTouchStart (event: TouchEvent) {
    // prevent from zooming
    if (event.touches.length >= 2) {
      event.preventDefault();
    }
  }

  protected onUndoClick () {
    const ctx = this.elCanvas && this.elCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const record = this.canvasHistory.goPrev();
    if (record && record.type === HistoryType.canvas) {
      ctx.putImageData(record.imageData, 0, 0);
    }
  }

  protected onRedoClick () {
    const ctx = this.elCanvas && this.elCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const record = this.canvasHistory.goNext();
    if (record && record.type === HistoryType.canvas) {
      ctx.putImageData(record.imageData, 0, 0);
    }
  }

  protected onTutorialLongPoint () {
    this.setState({
      justAfterStarted: false,
    });
  }

  protected onCanvasReceive (el: HTMLCanvasElement | null) {
    this.elCanvas = el;

    const ctx = el && el.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, el!.width, el!.height);
      this.canvasHistory.pushImageData(imageData);
    } else {
      this.canvasHistory.clear();
    }
  }

  protected onCanvasUpdated (imageData: ImageData) {
    this.canvasHistory.pushImageData(imageData);

    if (!this.state.dirty) {
      this.setState({
        dirty: true,
      });
    }
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

    const stop = this.props.startProcessing();
    try {
      await uploadImage({
        blob: await readBlob(this.elCanvas),
        height: this.elCanvas.height,
        uid: this.currentUser!.uid,
        width: this.elCanvas.width,
      });
    } catch (error) {
      stop();
      throw error;
    }

    this.setState({
      dirty: false,
    });
    appHistory.push(paths.historyPage);
  }

  protected onNew () {
    this.setState({
      dirty: false,
    });
    appHistory.push(paths.newPage);
  }

  protected setUpSizes () {
    // this is called only from `componentWillMount()`

    const el = document.documentElement!;
    const screenHeight = el.clientHeight;
    const screenWidth = el.clientWidth;
    this.setState({
      height: screenHeight,
      width: screenWidth,
    });

    let imageSize: ISize | null = null;
    const type = getCanvasType();
    if (type) {
      this.canvasType = type;
      if (type === CanvasType.size) {
        imageSize = {
          height: Number(getUrlParamOf('height')) || 1,
          width: Number(getUrlParamOf('width')) || 1,
        };
      } else if (type === CanvasType.history || type === CanvasType.upload) {
        // see `loadImageFromHistory()` and `loadImageFromDisk()`
        this.setState({
          imageLoading: true,
        });
      } else {
        console.warn('Invalid parameters', type);
      }
    }

    if (!imageSize) {
      imageSize = {
        height: screenHeight - appSpace * 2,
        width: screenWidth - appSpace * 2,
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

  protected async loadImageFromDisk () {
    const imageBlob: Blob | null = appHistory.location.state.imageBlob;
    if (!imageBlob) {
      // TODO fail more gracefully
      throw new Error('Upload type must come with image');
    }

    const image = await loadImage(imageBlob);
    this.setState({
      imageLoading: false,
      imageSize: {
        height: image.naturalHeight,
        width: image.naturalWidth,
      },
      originalImage: image,
    });
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  startProcessing: () => processing.dispatchStart(dispatch),
});

export default connect(null, mapDispatchToProps)(PaintPage);
