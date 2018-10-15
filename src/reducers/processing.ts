const processingNames = new Set<string>();

enum Types {
  start = 'processing/start',
  stop = 'processing/stop',
  stopAll = 'processing/stopAll',
}

interface IProcessingStartAction {
  name: string;
  type: Types.start;
}

interface IProcessingStopAction {
  name: string;
  type: Types.stop;
}

interface IProcessingStopAllAction {
  type: Types.stopAll;
}

type ProcessingAction =
  IProcessingStartAction |
  IProcessingStopAction |
  IProcessingStopAllAction;

export const start = (name: string): IProcessingStartAction => {
  return {
    name,
    type: Types.start,
  };
};

export const stop = (name: string): IProcessingStopAction => {
  return {
    name,
    type: Types.stop,
  };
};

export const stopAll = () => ({
  type: Types.stopAll,
});

export const dispatchStart = (dispatch: any) => {
  const name = `auto-processing-name-${Math.random()}`;
  dispatch(start(name));
  return () => dispatch(stop(name));
};

export default (state: boolean = false, action: ProcessingAction) => {
  switch (action.type) {
    case Types.start:
      processingNames.add(action.name);
      return true;
    case Types.stop:
      processingNames.delete(action.name);
      return processingNames.size > 0;
    case Types.stopAll:
      processingNames.clear();
      return false;
    default:
      return state;
  }
};
