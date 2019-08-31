import React from 'react';

enum ActionType {
  ADD,
  DELETE,
}

interface IAction<T> {
  type: ActionType;
  path: string;
  item?: T;
}

interface IPathObj<T> {
  [path: string]: T;
}

const reducer = <T>(state: IPathObj<T>, action: IAction<T>): IPathObj<T> => {
  const newState = { ...state };
  switch (action.type) {
    case ActionType.ADD:
      newState[action.path] = action.item!;
      break;
    case ActionType.DELETE:
      delete newState[action.path];
      break;
  }
  return newState;
};

const myUseReducer = <T>(): [IPathObj<T>, (s: string, i: T) => void, (s: string) => void] => {
  const [nextState, dispatch] = React.useReducer(
    (state: IPathObj<T>, action: IAction<T>) => reducer(state, action),
    {},
  );
  const add = (path: string, item: T) => dispatch({ type: ActionType.ADD, path, item });
  const del = (path: string) => dispatch({ type: ActionType.DELETE, path });
  return [nextState, add, del];
};

export default myUseReducer;
