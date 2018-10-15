/**
 * @example
 * <NiceFileInput>Nice!</NiceFileInput>
 * @example
 * <NiceFileInput icon="thumbs-up">Nice!</NiceFileInput>
 * @example
 * <NiceFileInput icon="fa-thumbs-up">Nice!</NiceFileInput>
 * @example
 * <NiceFileInput onClick={onClick}>Nice!</NiceFileInput>
 */

import * as React from 'react';
import './NiceFileInput.css';

interface INiceFileInputProps {
  accept?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
interface INiceFileInputState {
}

class NiceFileInput extends React.Component<INiceFileInputProps, INiceFileInputState> {
  constructor (props: INiceFileInputProps) {
    super(props);
    this.state = {
    };
    this.onChange = this.onChange.bind(this);
  }

  public render () {
    return (
      <label className="NiceFileInput niceButtonBase">
        <i className="fa fa-cloud-upload niceButtonBase-leftIcon" aria-hidden="true"/>
        Select file
        <input className="NiceFileInput-input" type="file"
          accept={this.props.accept}
          onChange={this.onChange}
          />
      </label>
    );
  }

  protected onChange (event: React.ChangeEvent<HTMLInputElement>) {
    this.props.onChange!(event);
  }
}

export default NiceFileInput;
