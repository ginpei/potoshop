import * as React from 'react';
import { Link } from 'react-router-dom';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import { appHistory, appSpace } from '../misc';
import firebase from '../plugins/firebase';
import * as image from '../services/image';
import * as paths from '../services/paths';
import './CreateNewPage.css';

type ICreateNewPagePros = any;
interface ICreateNewPageState {
  height: number;
  imageRecords: image.IImageRecord[];
  loadingImages: boolean;
  width: number;
}

class CreateNewPage extends React.Component<ICreateNewPagePros, ICreateNewPageState> {
  protected currentUser: firebase.User | null;
  protected unsubscribes: firebase.Unsubscribe[] = [];

  protected get uid () {
    return this.currentUser ? this.currentUser.uid : '';
  }

  constructor (props: ICreateNewPagePros) {
    super(props);
    this.state = {
      height: 0,
      imageRecords: [],
      loadingImages: true,
      width: 0,
    };
  }

  public render () {
    const onChange = this.onChange.bind(this);
    const onSubmitNew = this.onSubmitNew.bind(this);
    const onFileChange = this.onFileChange.bind(this);
    const records = this.state.imageRecords;

    return (
      <div className="CreateNewPage">
        <AppHeader/>
        <div className="container">
          <h1>Create New</h1>
          <form action="/paint" method="GET" onSubmit={onSubmitNew}>
            <input className="CreateNewPage-sizeInput" type="number"
              name="width"
              value={this.state.width}
              onChange={onChange}
              />
            x
            <input className="CreateNewPage-sizeInput" type="number"
              name="height"
              value={this.state.height}
              onChange={onChange}
              />
            <button>Create new</button>
          </form>
        </div>
        <div className="container">
          <h1>Upload</h1>
          <input type="file"
            onChange={onFileChange}
            />
          <p>Or you could paste or drop image file in <Link to={paths.uploadImagePage}>the upload page</Link>.</p>
        </div>
        <div className="container">
          <h1>Edit recent item</h1>
          <p>Note: this editing creates a new image, duplicating the selected image.</p>
          <div className="CreateNewPage-recordList">
            {this.state.loadingImages ? 'Loading...' :
              records.length < 1 ? 'No images' :
              records.map((record) => (
                <Link
                  className="CreateNewPage-recordItem"
                  key={record.id}
                  to={paths.paintPage({
                    id: record.id,
                    type: 'history',
                    uid: this.uid,
                  })}
                  >
                  <img
                    className="CreateNewPage-image"
                    alt=""
                    src={record.url}
                    width={record.width}
                    height={record.height}
                    />
                </Link>
              ))
            }
          </div>
        </div>
        <AppFooter/>
      </div>
    );
  }

  public componentWillMount () {
    const el = document.documentElement!;
    this.setState({
      height: el.clientHeight - appSpace * 2,
      width: el.clientWidth - appSpace * 2,
    });

    const onAuthStateChanged = this.onAuthStateChanged.bind(this);
    this.unsubscribes.push(firebase.auth().onAuthStateChanged(onAuthStateChanged));
  }

  public componentWillUnmount () {
    this.unsubscribes.forEach(v => v());
  }

  protected onSubmitNew (event: React.FormEvent<HTMLFormElement>) {
    // it would be better to gather parameters from DOM

    const s = this.state;
    event.preventDefault();
    const path = paths.paintPage({
      height: s.height,
      type: 'size',
      width: s.width,
    });
    appHistory.push(path);
  }

  protected onFileChange (event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;
    if (!files) {
      return;
    }

    const file = files[0];
    appHistory.push(paths.uploadImagePage, {
      file,
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

  protected async onAuthStateChanged (user: firebase.User) {
    this.currentUser = user;
    this.setState({
      imageRecords: await this.fetchList(),
    });
  }

  protected async fetchList (): Promise<image.IImageRecord[]> {
    if (this.currentUser) {
      this.setState({ loadingImages: true });
      const images = await image.fetchList(this.currentUser.uid);
      this.setState({ loadingImages: false });
      return images;
    }

    this.setState({ loadingImages: false });
    return [];
  }
}

export default CreateNewPage;
