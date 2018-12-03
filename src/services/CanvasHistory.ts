export enum HistoryRecordType {
  create,
  comment,
  canvas,
}

// export interface ICreateHistory {
//   height: number;
//   type: HistoryType.create;
//   width: number;
// }

export interface ICommentHistoryRecord { // maybe used mainly for test
  body: string;
  type: HistoryRecordType.comment;
}

export interface IImageHistoryRecord {
  type: HistoryRecordType.canvas;
  imageData: ImageData;
}

export type HistoryRecord = IImageHistoryRecord | ICommentHistoryRecord;

export default class CanvasHistory {
  protected history: HistoryRecord[] = [];
  // TODO allow starting "_"
  // tslint:disable-next-line:variable-name
  protected _index = 0;

  public get index () {
    return this._index;
  }

  public get length () {
    return this.history.length;
  }

  public get current () {
    return this.history[this._index];
  }

  public clear () {
    this.history.length = 0;
    this._index = 0;
  }

  public pushComment (body: string) {
    this.push({ type: HistoryRecordType.comment, body });
  }

  public pushImageData (imageData: ImageData) {
    const type = HistoryRecordType.canvas;
    this.push({ type, imageData });
  }

  public goPrev (): HistoryRecord | null {
    if (this._index <= 0) {
      return null;
    }

    this._index -= 1;
    const record = this.history[this._index];
    return record;
  }

  public goNext (): HistoryRecord | null {
    if (this._index + 1 > this.history.length - 1) {
      return null;
    }

    this._index += 1;
    const record = this.history[this._index];
    return record;
  }

  protected push (record: HistoryRecord) {
    this.history.splice(this._index + 1);
    this.history.push(record);
    this._index = this.history.length - 1;
  }
}
