import * as misc from './misc';

describe('misc', () => {
  describe('getUrlParamsOf()', () => {
    beforeEach(() => {
      history.pushState({}, '', '/?foo=123&arr=1&arr=2');
    });

    it('returns a single value', () => {
      expect(misc.getUrlParamsOf('foo')).toEqual(['123']);
    });

    it('returns multiple values', () => {
      expect(misc.getUrlParamsOf('arr')).toEqual(['1', '2']);
    });

    it('returns empty value', () => {
      expect(misc.getUrlParamsOf('no')).toEqual([]);
    });

    it('updates values automatically when you move URL', () => {
      history.pushState({}, '', '/?foo=hello');
      expect(misc.getUrlParamsOf('foo')).toEqual(['hello']);
    });
  });

  describe('getUrlParamOf()', () => {
    it('returns a single value', () => {
      history.pushState({}, '', '/?s=string');
      expect(misc.getUrlParamOf('s')).toBe('string');
    });

    it('returns a single string value', () => {
      history.pushState({}, '', '/?s=hello');
      expect(misc.getUrlParamOf('s', 'hula')).toBe('hello');
    });

    it('returns a default string value', () => {
      history.pushState({}, '', '/');
      expect(misc.getUrlParamOf('s', 'hula')).toBe('hula');
    });

    it('returns a single number value', () => {
      history.pushState({}, '', '/?n=123');
      expect(misc.getUrlParamOf('n', 99)).toBe(123);
    });

    it('returns a default number value', () => {
      history.pushState({}, '', '/');
      expect(misc.getUrlParamOf('n', 99)).toBe(99);
    });

    it('returns true for "true"', () => {
      history.pushState({}, '', '/?b=true');
      expect(misc.getUrlParamOf('b', false)).toBe(true);
    });

    it('returns false for "false"', () => {
      history.pushState({}, '', '/?b=false');
      expect(misc.getUrlParamOf('b', true)).toBe(false);
    });

    it('returns true for "1"', () => {
      history.pushState({}, '', '/?b=1');
      expect(misc.getUrlParamOf('b', false)).toBe(true);
    });

    it('returns false for "0"', () => {
      history.pushState({}, '', '/?b=0');
      expect(misc.getUrlParamOf('b', true)).toBe(false);
    });
  });

  describe('between()', () => {
    it('return the minimum value', () => {
      expect(misc.between(10, 0, 20)).toBe(10);
    });

    it('return the given value', () => {
      expect(misc.between(10, 15, 20)).toBe(15);
    });

    it('return the maximum value', () => {
      expect(misc.between(10, 99, 20)).toBe(20);
    });

    it('throws is min is greater than max', () => {
      expect(() => misc.between(10, 10, 9)).toThrow();
    });
  });
});
