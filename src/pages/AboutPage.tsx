// import * as firebase from 'firebase';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';

type IAboutPagePros = any;
type IAboutPageState = any;

class AboutPage extends React.Component<IAboutPagePros, IAboutPageState> {
  public render () {
    return (
      <div className="AboutPage">
        <div className="AppHeader">
          <div className="container">
            <Link className="AppHeader-title" to="/">Giazo</Link>
          </div>
        </div>
        <div className="container">
          <h1>Giazoについて</h1>
          <h2>サービス</h2>
          <ul>
            <li>画像ぱぱっと描いて共有できたら便利なのか？という実験的サービスです。</li>
            <li>サービス名称は仮のものです。どうしよう。</li>
            <li>予告なく停止、終了します。</li>
          </ul>
          <h2>プライバシーポリシー</h2>
          <h3>Cookie</h3>
          <ul>
            <li>利用者同定の目的でCookieを利用しています。</li>
            <li>個人情報を本人の同意なく第三者へ提供することはしません。</li>
          </ul>
          <h3>作成された画像</h3>
          <ul>
            <li>利用者に無断で利用することはありません。</li>
            <li>管理者が閲覧する場合があります。</li>
            <li>予告なく削除されることがあります。</li>
          </ul>
          <h2>作者について</h2>
          <ul>
            <li><a href="https://github.com/ginpei">@ginpei</a></li>
            <li><a href="https://github.com/ginpei/giazo">ginpei/giazo</a></li>
          </ul>
        </div>
        <div className="AppFooter">
          <div className="container">
            <p>By Ginpei.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default AboutPage;
