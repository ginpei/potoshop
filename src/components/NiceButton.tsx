/**
 * @example
 * <NiceButton>Nice!</NiceButton>
 * @example
 * <NiceButton icon="thumbs-up">Nice!</NiceButton>
 * @example
 * <NiceButton icon="fa-thumbs-up">Nice!</NiceButton>
 * @example
 * <NiceButton onClick={onClick}>Nice!</NiceButton>
 */

import * as React from 'react';

interface INiceButtonProps {
  icon?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  primary?: boolean;
}
interface INiceButtonState {
}

class NiceButton extends React.Component<INiceButtonProps, INiceButtonState> {
  constructor (props: INiceButtonProps) {
    super(props);
    this.state = {
    };
    this.onClick = this.onClick.bind(this);
  }

  public render () {
    const className = [
      'NiceButton',
      'niceButtonBase',
      this.props.primary ? '-primary' : '',
    ].join(' ');

    const iconKey = this.props.icon;
    const iconClassName = iconKey && [
      'fa',
      iconKey.startsWith('fa-') ? iconKey : `fa-${iconKey}`,
      'niceButtonBase-leftIcon',
    ].join(' ');

    return (
      <button className={className} onClick={this.onClick}>
        {iconClassName && <i className={iconClassName} aria-hidden="true"/>}
        {this.props.children}
      </button>
    );
  }

  protected onClick (event: React.MouseEvent<HTMLButtonElement>) {
    this.props.onClick!(event);
  }
}

export default NiceButton;
