import CanvasHistory, { HistoryType, ICommentHistory } from './CanvasHistory';

describe('CanvasHistory', () => {
  let history: CanvasHistory;

  beforeEach(() => {
    history = new CanvasHistory();
  });

  describe('traverse', () => {
    describe('when empty', () => {
      it('length is 0', () => {
        expect(history.length).toBe(0);
      });

      it('index is 0', () => {
        expect(history.index).toBe(0);
      });

      it('does not go prev', () => {
        const record = history.goPrev();
        expect(history.index).toBe(0);
        expect(record).toBeNull();
      });

      it('does not go next', () => {
        const record = history.goNext();
        expect(history.index).toBe(0);
        expect(record).toBeNull();
      });
    });

    describe('when has 1', () => {
      beforeEach(() => {
        history.pushComment('Hello');
      });

      it('length is 1', () => {
        expect(history.length).toBe(1);
      });

      it('index is 0', () => {
        expect(history.index).toBe(0);
      });

      it('current', () => {
        const record = history.current;
        expect(record.type).toBe(HistoryType.comment);
        expect((record as ICommentHistory).body).toBe('Hello');
      });

      it('does not go prev', () => {
        const record = history.goPrev();
        expect(history.index).toBe(0);
        expect(record).toBeNull();
      });

      it('does not go next', () => {
        const record = history.goNext();
        expect(history.index).toBe(0);
        expect(record).toBeNull();
      });
    });

    describe('when has 3', () => {
      beforeEach(() => {
        history.pushComment('Hello');
        history.pushComment('Beautiful');
        history.pushComment('World!');
      });

      describe('and be at the end', () => {
        it('length is 3', () => {
          expect(history.length).toBe(3);
        });

        it('index is 2', () => {
          expect(history.index).toBe(2);
        });

        it('current', () => {
          const record = history.current;
          expect(record.type).toBe(HistoryType.comment);
          expect((record as ICommentHistory).body).toBe('World!');
        });

        it('goes to prev', () => {
          const record = history.goPrev();
          expect((record as ICommentHistory).body).toBe('Beautiful');
          expect(history.index).toBe(1);
        });

        it('does not go next', () => {
          const record = history.goNext();
          expect(record).toBeNull();
          expect(history.index).toBe(2);
        });
      });

      describe('and be at the second record', () => {
        beforeEach(() => {
          history.goPrev();
        });

        it('length is still 3', () => {
          expect(history.length).toBe(3);
        });

        it('index is 1', () => {
          expect(history.index).toBe(1);
        });

        it('current', () => {
          const record = history.current;
          expect(record.type).toBe(HistoryType.comment);
          expect((record as ICommentHistory).body).toBe('Beautiful');
        });

        it('goes to prev', () => {
          const record = history.goPrev();
          expect((record as ICommentHistory).body).toBe('Hello');
          expect(history.index).toBe(0);
        });

        it('does not go next', () => {
          const record = history.goNext();
          expect((record as ICommentHistory).body).toBe('World!');
          expect(history.index).toBe(2);
        });
      });
    });
  });
});
