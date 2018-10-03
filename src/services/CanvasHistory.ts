export enum HistoryType {
  create,
  comment,
  canvas,
}

// export interface ICreateHistory {
//   height: number;
//   type: HistoryType.create;
//   width: number;
// }

export interface ICommentHistory { // maybe used mainly for test
  body: string;
  type: HistoryType.comment;
}

export interface IImageHistory {
  type: HistoryType.canvas;
  imageData: ImageData;
}

export type Record = IImageHistory | ICommentHistory;

export default class CanvasHistory {
  protected history: Record[] = [];
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
    this.push({ type: HistoryType.comment, body });
  }

  public pushImageData (imageData: ImageData) {
    const type = HistoryType.canvas;
    this.push({ type, imageData });
  }

  public goPrev (): Record | null {
    if (this._index <= 0) {
      return null;
    }

    this._index -= 1;
    const record = this.history[this._index];
    return record;
  }

  public goNext (): Record | null {
    if (this._index + 1 > this.history.length - 1) {
      return null;
    }

    this._index += 1;
    const record = this.history[this._index];
    return record;
  }

  protected push (record: Record) {
    this.history.splice(this._index + 1);
    this.history.push(record);
    this._index = this.history.length - 1;
  }
}
