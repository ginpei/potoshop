// import * as firebase from 'firebase';
import * as React from 'react';
import AppFooter from '../components/AppFooter';
import AppHeader from '../components/AppHeader';
import './AboutPage.css';

type IAboutPagePros = any;
type IAboutPageState = any;

class AboutPage extends React.Component<IAboutPagePros, IAboutPageState> {
  public render () {
    return (
      <div className="AboutPage">
        <AppHeader/>
<div className="container" lang="ja">
          <h1>Potoshopについて</h1>
          <h2>サービス</h2>
          <ul>
            <li>画像ぱぱっと描いて共有できたら便利なのか？という実験的サービスです。</li>
            <li>予告なく停止、変更、終了します。</li>
          </ul>
          <h2>プライバシーポリシー</h2>
          <ul>
            <li>利用者同定やその他の目的でCookieを利用します。</li>
            <li>各種の個人情報を本人の同意なく第三者へ提供することはしません。</li>
          </ul>
          <h2>作成された画像</h2>
          <ul>
            <li>利用者に無断で利用することはありません。</li>
            <li>管理者が閲覧する場合があります。</li>
            <li>予告なく削除します。</li>
          </ul>
          <h2>作者について</h2>
          <ul>
            <li><a href="https://github.com/ginpei">@ginpei</a></li>
            <li><a href="https://github.com/ginpei/potoshop">ginpei/potoshop</a></li>
          </ul>
        </div>
        <AppFooter/>
      </div>
    );
  }
}

export default AboutPage;
