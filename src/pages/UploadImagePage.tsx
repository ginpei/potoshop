import * as React from 'react';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import { appHistory } from '../misc';
import * as imageUtil from '../services/imageUtil';
import './UploadImagePage.css';

type IUploadImagePagePros = any;
interface IUploadImagePageState {
  originalHeight: number;
  originalWidth: number;
  ready: boolean;
  scale: number;
}

class UploadImagePage extends React.Component<IUploadImagePagePros, IUploadImagePageState> {

  protected get width () {
    return Math.floor(this.state.originalWidth * this.state.scale);
  }

  protected get height () {
    return Math.floor(this.state.originalHeight * this.state.scale);
  }
  protected refCanvas = React.createRef<HTMLCanvasElement>();
  protected originalImage = new Image();

  constructor (props: IUploadImagePagePros) {
    super(props);
    this.state = {
      originalHeight: 0,
      originalWidth: 0,
      ready: false,
      scale: 1,
    };
  }

  public render () {
    const s = this.state;
    const onScaleChange = this.onScaleChange.bind(this);

    return (
      <div className="UploadImagePage">
        <AppHeader/>
        <div className="container">
          <h1>Upload image</h1>
          {s.ready && <div>
            <p>Original size: {s.originalWidth} x {s.originalHeight}</p>
            <p>
              Resize:
              <input type="range" min="0.001" max="1" step="0.001"
                value={s.scale}
                onChange={onScaleChange}
                />
              →
              {this.width} x {this.height}
            </p>
          </div>}
          <div style={{height: this.state.originalHeight}}>
            <canvas
              className="UploadImagePage-canvas"
              ref={this.refCanvas}
              />
          </div>
        </div>
        <AppFooter/>
      </div>
    );
  }

  public async componentWillMount () {
    const { file } = appHistory.location.state;
    if (!file || !(file instanceof File)) {
      console.warn('file', file);
      throw new Error('File must be given. You got wrong locating');
    }

    await this.loadImage(file);
    this.setState({
      ready: true,
    });
  }

  public onScaleChange (event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      scale: Number(event.target.value) || 1,
    });

    this.drawImage();
  }

  protected async loadImage (file: File) {
    this.setState({
      ready: false,
    });

    if (!imageUtil.isImageFile(file)) {
      console.warn('file', file);
      throw new Error('File object must be given');
    }

    const image = await imageUtil.readImage(file);
    if (!image) {
      throw new Error('Failed to read image');
    }
    this.originalImage = image;

    this.setState({
      originalHeight: image.naturalHeight,
      originalWidth: image.naturalWidth,
    });

    this.drawImage();
  }

  protected drawImage () {
    requestAnimationFrame(() => {
      const elCanvas = this.refCanvas.current;
      const ctx = elCanvas && elCanvas.getContext('2d');
      if (!elCanvas || !ctx) {
        throw new Error('Canvas is not ready');
      }

      elCanvas.width = this.width;
      elCanvas.height = this.height;
      ctx.drawImage(this.originalImage, 0, 0, this.width, this.height);
    });
  }
}

export default UploadImagePage;
