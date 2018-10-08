import * as paths from './paths';

describe('paths', () => {
  describe('paintPage', () => {
    it('returns base path when no params givens', () => {
      expect(paths.paintPage()).toBe('/paint');
    });

    it('returns path for size', () => {
      expect(paths.paintPage({
        height: 123,
        type: 'size',
        width: 234,
      })).toBe('/paint?height=123&type=size&width=234');
    });

    it('returns path for history', () => {
      expect(paths.paintPage({
        id: '123',
        type: 'history',
        uid: '234',
      })).toBe('/paint?id=123&type=history&uid=234');
    });
  });
});
