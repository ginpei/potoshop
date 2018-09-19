import { Color } from 'csstype';
import * as React from 'react';
import AppHeader from '../../components/AppHeader';
import { strokeColors, strokeWidths } from '../../misc';
import './PaintMenu.css';
import { Colors, PaintMenuBody, PaintMenuContent, PaintMenuFooter, PaintMenuFooterButton, StrokeWidths } from './paintMenuMisc';

interface IPaintMenuProps {
  visible: boolean;
  onOverlayClick: () => void;
  onStrokeWidthChange: (width: number) => void;
  onColorChange: (color: Color) => void;
  onSave: () => void;
  onReset: () => void;
}
// tslint:disable-next-line:no-empty-interface
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
    this.onResetClick = this.onResetClick.bind(this);
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
            onChange={this.onStrokeWidthChange}
            />
          <Colors
            colors={strokeColors}
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
            onClick={this.onResetClick}
            >Reset</PaintMenuFooterButton>
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
    window.open('/history');
  }

  protected onResetClick (event: React.MouseEvent<HTMLButtonElement>) {
    const text = 'Are you sure you want to erase all you have drawn?';
    if (window.confirm(text)) {
      this.props.onReset();
    }
  }

  protected onAboutClick (event: React.MouseEvent<HTMLButtonElement>) {
    window.open('/about');
  }
}

export default PaintMenu;
