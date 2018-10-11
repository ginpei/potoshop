import * as React from 'react';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import { appHistory } from '../misc';
import * as imageUtil from '../services/imageUtil';
import './UploadImagePage.css';

type IUploadImagePagePros = any;
interface IUploadImagePageState {
  imageReady: boolean;
  noGivenImage: boolean;
  originalHeight: number;
  originalWidth: number;
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
      imageReady: false,
      noGivenImage: false,
      originalHeight: 0,
      originalWidth: 0,
      scale: 1,
    };
    this.onPaste = this.onPaste.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  public render () {
    const s = this.state;
    const onScaleChange = this.onScaleChange.bind(this);
    const onFileChange = this.onFileChange.bind(this);

    return (
      <div className="UploadImagePage">
        <AppHeader/>
        <div className="container">
          <h1>Upload image</h1>
          {!s.imageReady && s.noGivenImage && <div>
            <input type="file"
              onChange={onFileChange}
              />
          </div>}
          {s.imageReady && <div>
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
    document.addEventListener('paste', this.onPaste);
    document.addEventListener('dragover', this.onDragOver);
    document.addEventListener('dragleave', this.onDragLeave);
    document.addEventListener('drop', this.onDrop);

    const historyState = appHistory.location.state;
    const file = historyState && historyState.file;
    if (file && (file instanceof File)) {
      await this.loadImage(file);
    } else {
      this.setState({
        noGivenImage: true,
      });
    }
  }

  public componentWillUnmount () {
    document.removeEventListener('paste', this.onPaste);
    document.removeEventListener('dragover', this.onDragOver);
    document.removeEventListener('dragleave', this.onDragLeave);
    document.removeEventListener('drop', this.onDrop);
  }

  public async onPaste (event: ClipboardEvent) {
    const item = event.clipboardData.items[0];
    const file = item && item.getAsFile();
    if (file && imageUtil.isImageFile(file)) {
      await this.loadImage(file);
    } else {
      // TODO show nicer one
      window.alert('Failed to obtain an image file from what you pasted.');
    }
  }

  public async onDragOver (event: DragEvent) {
    event.preventDefault();
  }

  public async onDragLeave (event: DragEvent) {
    // TODO show something while dragging over a file
  }

  public async onDrop (event: DragEvent) {
    event.preventDefault();

    const file = event.dataTransfer && event.dataTransfer.files[0];
    if (file && imageUtil.isImageFile(file)) {
      await this.loadImage(file);
    } else {
      // TODO show nicer one
      window.alert('Failed to obtain an image file from what you pasted.');
    }
  }

  public async onFileChange (event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;
    if (!files) {
      return;
    }

    const file = files[0];
    await this.loadImage(file);
    this.setState({
      imageReady: true,
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
      imageReady: false,
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
    this.setState({
      imageReady: true,
    });
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
