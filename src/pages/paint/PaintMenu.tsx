import { Color } from 'csstype';
import * as React from 'react';
import AppHeader from '../../components/AppHeader';
import { strokeColors, strokeWidths } from '../../misc';
import * as paths from '../../services/paths';
import './PaintMenu.css';
import { Colors, PaintMenuBody, PaintMenuContent, PaintMenuFooter, PaintMenuFooterButton, StrokeWidths } from './paintMenuComponents';

interface IPaintMenuProps {
  visible: boolean;
  strokeColor: Color;
  strokeWidth: number;
  onOverlayClick: () => void;
  onStrokeWidthChange: (width: number) => void;
  onColorChange: (color: Color) => void;
  onSave: () => void;
  onNew: () => void;
}
interface IPaintMenuState {
}

class PaintMenu extends React.Component<IPaintMenuProps, IPaintMenuState> {
  constructor (props: IPaintMenuProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onStrokeWidthChange = this.onStrokeWidthChange.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.onHistoryClick = this.onHistoryClick.bind(this);
    this.onNewClick = this.onNewClick.bind(this);
    this.onAboutClick = this.onAboutClick.bind(this);
  }

  public render () {
    return (
      <div className={`PaintMenu ${this.props.visible ? '-visible' : ''}`}
        onClick={this.onClick}
        >
        <AppHeader fullscreen={true}/>
        {this.renderMainContent()}
      </div>
    );
  }

  protected renderMainContent () {
    return (
      <PaintMenuContent>
        <PaintMenuBody>
          <div className="PaintMenu-close">
            <i className="fa fa-times" aria-hidden="true" />
          </div>
        <div className="PaintMenu-penMenu">
          <StrokeWidths
            strokeWidths={strokeWidths}
            value={this.props.strokeWidth}
            onChange={this.onStrokeWidthChange}
            />
          <Colors
            colors={strokeColors}
            value={this.props.strokeColor}
            onChange={this.onColorChange}
            />
        </div>
        </PaintMenuBody>
        <PaintMenuFooter>
          <PaintMenuFooterButton
            onClick={this.onSaveClick}
            >Save &amp; Share</PaintMenuFooterButton>
          <PaintMenuFooterButton
            onClick={this.onHistoryClick}
            >History</PaintMenuFooterButton>
          <PaintMenuFooterButton
            onClick={this.onNewClick}
            >New</PaintMenuFooterButton>
          <PaintMenuFooterButton
            onClick={this.onAboutClick}
            >About</PaintMenuFooterButton>
        </PaintMenuFooter>
      </PaintMenuContent>
    );
  }

  protected onClick (event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    this.props.onOverlayClick();
  }

  protected onStrokeWidthChange (width: number) {
    this.props.onStrokeWidthChange(width);
  }

  protected onColorChange (color: Color) {
    this.props.onColorChange(color);
  }

  protected onSaveClick (event: React.MouseEvent<HTMLButtonElement>) {
    this.props.onSave();
  }

  protected onHistoryClick (event: React.MouseEvent<HTMLButtonElement>) {
    window.open(paths.historyPage);
  }

  protected onNewClick (event: React.MouseEvent<HTMLButtonElement>) {
    const text = 'Are you sure you want to leave from the image you have drawn?';
    if (window.confirm(text)) {
      this.props.onNew();
    }
  }

  protected onAboutClick (event: React.MouseEvent<HTMLButtonElement>) {
    window.open(paths.aboutPage);
  }
}

export default PaintMenu;
