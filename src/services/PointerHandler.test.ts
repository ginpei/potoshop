import { JSDOM } from 'jsdom';
import PointerHandler from './PointerHandler';

describe('PointerHandler', () => {
  let document: Document;
  let el: HTMLElement;
  let pointerHandler: PointerHandler;

  beforeEach(() => {
    const dom = new JSDOM();
    document = dom.window.document;
    el = document.createElement('div');
  });

  afterEach(() => {
    pointerHandler.stop();
  });

  describe('startPressing()', () => {
    it('does not occur any errors if no callbacks are given', () => {
      pointerHandler = new PointerHandler({
      });

      expect(() => {
        pointerHandler.start(el);
        pointerHandler.startPressing({ x: 10, y: 20 });
      }).not.toThrow();
    });

    it('invokes onPointStart callback', () => {
      const onPointStart = jest.fn();
      pointerHandler = new PointerHandler({
        onPointStart,
      });
      pointerHandler.start(el);
      pointerHandler.startPressing({ x: 10, y: 20 });
      expect(onPointStart).toBeCalledWith({ x: 10, y: 20 });
    });
  });

  describe('movePressing()', () => {
    it('does not occur any errors if no callbacks are given', () => {
      pointerHandler = new PointerHandler({
      });
      pointerHandler.start(el);
      pointerHandler.startPressing({ x: 10, y: 20 });
      pointerHandler.movePressing({ x: 123, y: 234 });
    });

    it('invokes onPointMove callback', () => {
      const onPointMove = jest.fn();
      pointerHandler = new PointerHandler({
        onPointMove,
      });
      pointerHandler.start(el);
      pointerHandler.startPressing({ x: 10, y: 20 });
      pointerHandler.movePressing({ x: 123, y: 234 });
      expect(onPointMove).toBeCalledWith({ x: 123, y: 234 }, { x: 10, y: 20 });
    });
  });

  describe('stopPressing()', () => {
    it('does not occur any errors if no callbacks are given', () => {
      pointerHandler = new PointerHandler({
      });
      pointerHandler.start(el);
      pointerHandler.startPressing({ x: 10, y: 20 });
      pointerHandler.stopPressing();
    });

    it('invokes onPointEnd callback', () => {
      const onPointEnd = jest.fn();
      pointerHandler = new PointerHandler({
        onPointEnd,
      });
      pointerHandler.start(el);
      pointerHandler.startPressing({ x: 10, y: 20 });
      pointerHandler.movePressing({ x: 123, y: 234 });
      pointerHandler.stopPressing();
      expect(onPointEnd).toBeCalledWith();
    });
  });

  describe('cancelPressing()', () => {
    it('does not occur any errors if no callbacks are given', () => {
      pointerHandler = new PointerHandler({
      });
      pointerHandler.start(el);
      pointerHandler.startPressing({ x: 10, y: 20 });
      pointerHandler.cancelPressing();
    });

    describe('invokes callbacks', () => {
      let onPointEnd: jest.Mock;
      let onPointCancel: jest.Mock;

      beforeAll(() => {
        onPointEnd = jest.fn();
        onPointCancel = jest.fn();
        pointerHandler = new PointerHandler({
          onPointCancel,
          onPointEnd,
        });
      pointerHandler.start(el);
        pointerHandler.startPressing({ x: 10, y: 20 });
        pointerHandler.cancelPressing();
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
