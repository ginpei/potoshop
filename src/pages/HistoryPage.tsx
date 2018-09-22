import * as React from 'react';
import AppHeader from '../components/AppHeader';
import firebase from '../plugins/firebase';
import { IImageRecord } from '../services/image';
import * as image from '../services/image';
import './HistoryPage.css';

type IHistoryPagePros = any;
interface IHistoryPageState {
  imageRecords: IImageRecord[];
}

class HistoryPage extends React.Component<IHistoryPagePros, IHistoryPageState> {
  protected currentUser: firebase.User | null;
  protected unsubscribes: firebase.Unsubscribe[] = [];

  constructor (props: IHistoryPagePros) {
    super(props);
    this.state = {
      imageRecords: [],
    };
    this.onAuthStateChanged = this.onAuthStateChanged.bind(this);
  }

  public render () {
    const records = this.state.imageRecords;
    const elRecords = records.length < 1 ? undefined : records.map((record) => {
        return (
          <a key={record.id} href={record.url}>
            <figure className="HistoryPage-record">
              <img className="HistoryPage-image" alt="" src={record.url}/>
              <figcaption>{new Date(record.createdAt).toLocaleString()}</figcaption>
            </figure>
          </a>
        );
      });

    return (
      <div className="HistoryPage">
        <AppHeader/>
        <div className="container">
          <h1>History</h1>
          <div className="HistoryPage-recordList">
            {elRecords}
          </div>
        </div>
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
      return await image.fetchList(this.currentUser.uid);
    }

    return [];
  }
}

export default HistoryPage;
