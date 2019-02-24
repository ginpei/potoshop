import * as enzyme from 'enzyme';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import OriginalPaintCanvas, { IPaintCanvasProps } from './PaintCanvas';

enzyme.configure({ adapter: new Adapter() });

describe('<PaintCanvas>', () => {
  class PaintCanvas extends OriginalPaintCanvas {
    public createEmptyImageData () {
      return {} as ImageData;
    }
  }

  const createWrapper = (options: Partial<IPaintCanvasProps>) => {
    // tslint:disable:jsx-no-lambda
    const props = Object.assign(
      {
        height: 0,
        imageHeight: 0,
        imageWidth: 0,
        inactive: false,
        onCanvasReceive: () => undefined,
        onCanvasUpdated: () => undefined,
        onLongPoint: () => undefined,
        strokeColor: '#000',
        strokeWidth: 0,
        width: 0,
      },
      options,
    );
    // tslint:enable:jsx-no-lambda

    return shallow<PaintCanvas>(<PaintCanvas {...props} />);
  };

  it('renders', () => {
    const wrapper = createWrapper({});
    expect(() => {
      expect(wrapper.prop('className')).toBe('PaintCanvas');
    }).not.toThrow();
  });
});
