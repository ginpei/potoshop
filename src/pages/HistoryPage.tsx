import * as React from 'react';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import firebase from '../plugins/firebase';
import { IImageRecord } from '../services/image';
import * as image from '../services/image';
import './HistoryPage.css';

type IHistoryPagePros = any;
interface IHistoryPageState {
  imageRecords: IImageRecord[];
  loadingImages: boolean;
}

class HistoryPage extends React.Component<IHistoryPagePros, IHistoryPageState> {
  protected currentUser: firebase.User | null;
  protected unsubscribes: firebase.Unsubscribe[] = [];

  protected get uid () {
    return this.currentUser ? this.currentUser.uid : '';
  }

  constructor (props: IHistoryPagePros) {
    super(props);
    this.state = {
      imageRecords: [],
      loadingImages: true,
    };
    this.onAuthStateChanged = this.onAuthStateChanged.bind(this);
  }

  public render () {
    const records = this.state.imageRecords;

    return (
      <div className="HistoryPage">
        <AppHeader/>
        <div className="container">
          <h1>History</h1>
          <div className="HistoryPage-recordList">
            {this.state.loadingImages ? 'Loading...' :
              records.length < 1 ? 'No images' :
              records.map((record) => (
                <div className="HistoryPage-recordItem" key={record.id}>
                  <a href={record.url}>
                    <figure className="HistoryPage-record">
                      <img
                        className="HistoryPage-image"
                        alt=""
                        src={record.url}
                        width={record.width}
                        height={record.height}
                        />
                      <figcaption>{new Date(record.createdAt).toLocaleString()}</figcaption>
                    </figure>
                  </a>
                  <form action="/paint" method="GET">
                    <input type="hidden" name="newType" value="history"/>
                    <input type="hidden" name="uid" value={this.uid}/>
                    <input type="hidden" name="id" value={record.id}/>
                    <button>Edit this image</button>
                  </form>
                </div>
              ))
            }
          </div>
        </div>
        <AppFooter/>
      </div>
    );
  }

  public componentWillMount () {
    this.unsubscribes.push(firebase.auth().onAuthStateChanged(this.onAuthStateChanged));
  }

  public componentWillUnmount () {
    this.unsubscribes.forEach(v => v());
  }

  protected async onAuthStateChanged (user: firebase.User) {
    this.currentUser = user;
    this.setState({
      imageRecords: await this.fetchList(),
    });
  }

  protected async fetchList (): Promise<IImageRecord[]> {
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

export default HistoryPage;
