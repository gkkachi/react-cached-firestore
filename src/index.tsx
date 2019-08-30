import 'firebase/app';
import 'firebase/firestore';
import React from 'react';

enum DocState {
  UNDEFINED,
  CONNECTING,
  CONNECTED,
  UNCONNECTED,
}

interface IPathObj<T> {
  [path: string]: T;
}

interface IStateType {
  docs: IPathObj<firebase.firestore.DocumentSnapshot>;
  funcs: IPathObj<() => void>;
  docStates: IPathObj<DocState>;
}
const initialState = { docs: {}, funcs: {}, docStates: {} };

interface IContextType {
  subscribe: (path: string) => void;
  unsubscribe: (path: string) => void;
  getDoc: (path: string, latest?: boolean) => firebase.firestore.DocumentSnapshot | undefined;
  docs: IPathObj<firebase.firestore.DocumentSnapshot>;
}
const Context = React.createContext<IContextType>({
  docs: {},
  getDoc: _ => undefined,
  subscribe: _ => _,
  unsubscribe: _ => _,
});

const Provider: React.FC<React.PropsWithChildren<{ app: firebase.app.App }>> = props => {
  const [state, setState] = React.useState<IStateType>(initialState);

  const subscribe = (path: string, once = false) => {
    const docState = state.docStates[path] || DocState.UNDEFINED;

    if (docState === DocState.UNDEFINED || docState === DocState.UNCONNECTED) {
      const f = props.app
        .firestore()
        .doc(path)
        .onSnapshot(
          snap => {
            const newState: IStateType = { ...state };
            newState.docStates[path] = DocState.CONNECTED;
            newState.docs[path] = snap;
            setState(newState);
            if (once) {
              unsubscribe(path);
            }
          },
          error => {
            f();
            const newState = { ...state };
            newState.docStates[path] = DocState.UNDEFINED;
            setState(newState);
          },
        );
      const newStateX = { ...state };
      newStateX.docStates[path] = DocState.CONNECTING;
      if (newStateX.funcs[path]) {
        newStateX.funcs[path]();
      }
      newStateX.funcs[path] = f;
      setState(newStateX);
    }
  };

  const unsubscribe = (path: string) => {
    const docState = state.docStates[path] || DocState.UNDEFINED;
    if (docState === DocState.CONNECTED) {
      const docStateNext = DocState.UNCONNECTED;
      state.funcs[path]();
      const newState = { ...state };
      newState.docStates[path] = docStateNext;
      setState(newState);
    }
  };

  const getDoc = (path: string, latest = true): firebase.firestore.DocumentSnapshot | undefined => {
    const doc = state.docs[path];
    if (doc && !latest) {
      return doc;
    }
    subscribe(path, !latest);
    return doc;
  };

  const docs = state.docs;

  return <Context.Provider value={{ subscribe, unsubscribe, docs, getDoc }}>{props.children}</Context.Provider>;
};

export default Provider;
export const useDocumentsContext = () => React.useContext(Context);
export const DocumentsContext = Context;
