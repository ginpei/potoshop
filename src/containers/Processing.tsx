import * as React from 'react';
import { connect } from 'react-redux';
import './Processing.css';

interface IProcessingProps {
  processing: boolean;
}

class Processing extends React.Component<IProcessingProps> {
  public render () {
    return (
      <div className="Processing fade-in" data-active={this.props.processing}>
        <div className="Processing-box">
          <div className="Processing-dot">*</div>
          <div className="Processing-dot">*</div>
          <div className="Processing-dot">*</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  processing: state.processing,
});

export default connect(mapStateToProps)(Processing);
