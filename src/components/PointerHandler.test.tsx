import * as enzyme from 'enzyme';
import { shallow, ShallowWrapper } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import PointerHandler from './PointerHandler';

// possible to move to test.js?
enzyme.configure({ adapter: new Adapter() });

describe('<PointerHandler/>', () => {
  // type Wrapper = ShallowWrapper<PointerHandler['props'], PointerHandler['state'], PointerHandler>;

  describe('pressing', () => {
    describe('startPressing()', () => {
      it('does not occur any errors if no callbacks are given', () => {
        const wrapper = shallow<PointerHandler>(
          <PointerHandler>.</PointerHandler>,
        );
        wrapper.instance().startPressing({ x: 10, y: 20 });
      });

      it('invokes onPointStart callback', () => {
        const onPointStart = jest.fn();
        const wrapper = shallow<PointerHandler>(
          <PointerHandler
            onPointStart={onPointStart}
            >.</PointerHandler>,
        );
        wrapper.instance().startPressing({ x: 10, y: 20 });
        expect(onPointStart).toBeCalledWith({ x: 10, y: 20 });
      });
    });

    describe('movePressing()', () => {
      it('does not occur any errors if no callbacks are given', () => {
        const wrapper = shallow<PointerHandler>(
          <PointerHandler>.</PointerHandler>,
        );
        wrapper.instance().startPressing({ x: 10, y: 20 });
        wrapper.instance().movePressing({ x: 123, y: 234 });
      });

      it('invokes onPointMove callback', () => {
        const onPointMove = jest.fn();
        const wrapper = shallow<PointerHandler>(
          <PointerHandler
            onPointMove={onPointMove}
            >.</PointerHandler>,
        );
        wrapper.instance().startPressing({ x: 10, y: 20 });
        wrapper.instance().movePressing({ x: 123, y: 234 });
        expect(onPointMove).toBeCalledWith({ x: 123, y: 234 }, { x: 10, y: 20 });
      });
    });

    describe('stopPressing()', () => {
      it('does not occur any errors if no callbacks are given', () => {
        const wrapper = shallow<PointerHandler>(
          <PointerHandler>.</PointerHandler>,
        );
        wrapper.instance().startPressing({ x: 10, y: 20 });
        wrapper.instance().stopPressing();
      });

      it('invokes onPointEnd callback', () => {
        const onPointEnd = jest.fn();
        const wrapper = shallow<PointerHandler>(
          <PointerHandler
            onPointEnd={onPointEnd}
            >.</PointerHandler>,
        );
        wrapper.instance().startPressing({ x: 10, y: 20 });
        wrapper.instance().movePressing({ x: 123, y: 234 });
        wrapper.instance().stopPressing();
        expect(onPointEnd).toBeCalledWith();
      });
    });

    describe('cancelPressing()', () => {
      it('does not occur any errors if no callbacks are given', () => {
        const wrapper = shallow<PointerHandler>(
          <PointerHandler>.</PointerHandler>,
        );
        wrapper.instance().startPressing({ x: 10, y: 20 });
        wrapper.instance().cancelPressing();
      });

      describe('invokes callbacks', () => {
        let onPointEnd: jest.Mock;
        let onPointCancel: jest.Mock;

        beforeAll(() => {
          onPointEnd = jest.fn();
          onPointCancel = jest.fn();
          const wrapper = shallow<PointerHandler>(
            <PointerHandler
              onPointEnd={onPointEnd}
              onPointCancel={onPointCancel}
              >.</PointerHandler>,
          );
          wrapper.instance().startPressing({ x: 10, y: 20 });
          wrapper.instance().cancelPressing();
        });

        it('onPointEnd', () => {
          expect(onPointEnd).toBeCalledWith();
        });

        it('onPointCancel', () => {
          expect(onPointCancel).toBeCalledWith();
        });
      });
    });
  });

  describe('long pressing', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('invokes onLongPoint callback when enough time elapse', () => {
      const onLongPoint = jest.fn();
      const wrapper = shallow<PointerHandler>(
        <PointerHandler
          duration={0}
          onLongPoint={onLongPoint}
          >.</PointerHandler>,
      );
      wrapper.instance().startPressing({ x: 10, y: 20 });
      jest.advanceTimersByTime(1000);
      expect(onLongPoint).toBeCalledWith();
    });
  });
});
