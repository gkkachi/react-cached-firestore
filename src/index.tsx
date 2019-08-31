import 'firebase/app';
import 'firebase/firestore';
import React from 'react';

import myUseReducer from './myUseReducer';

enum DocState {
  UNDEFINED,
  CONNECTING,
  CONNECTED,
  UNCONNECTED,
}

interface IContextType {
  subscribe: (path: string) => void;
  unsubscribe: (path: string) => void;
  getDoc: (path: string, latest?: boolean) => firebase.firestore.DocumentSnapshot | undefined;
}
const Context = React.createContext<IContextType>({
  getDoc: _ => undefined,
  subscribe: _ => _,
  unsubscribe: _ => _,
});

const Provider: React.FC<React.PropsWithChildren<{ app: firebase.app.App }>> = props => {
  const [docs, setDoc] = myUseReducer<firebase.firestore.DocumentSnapshot>();
  const [funcs, addFunc, delFunc] = myUseReducer<() => void>();
  const [docStates, setDocState] = myUseReducer<DocState>();

  const subscribe = (path: string, once = false) => {
    const docState = docStates[path] || DocState.UNDEFINED;

    if (docState === DocState.UNDEFINED || docState === DocState.UNCONNECTED) {
      setDocState(path, DocState.CONNECTING);
      console.debug(`onSnapshot:\t(path=${path})`)
      const f = props.app
        .firestore()
        .doc(path)
        .onSnapshot(
          snap => {
            setDocState(path, DocState.CONNECTED);
            setDoc(path, snap);
            if (once) {
              unsubscribe(path);
            }
          },
          error => {
            setDocState(path, DocState.UNDEFINED);
            f();
          },
        );
      addFunc(path, f);
    }
  };

  const unsubscribe = (path: string) => {
    const docState = docStates[path] || DocState.UNDEFINED;
    if (docState === DocState.CONNECTED) {
      setDocState(path, DocState.UNCONNECTED);
      funcs[path]();
      delFunc(path);
    }
  };

  const getDoc = (path: string, latest = true): firebase.firestore.DocumentSnapshot | undefined => {
    const doc = docs[path];
    if (doc && !latest) {
      return doc;
    }
    subscribe(path, !latest);
    return doc;
  };

  return <Context.Provider value={{ subscribe, unsubscribe, getDoc }}>{props.children}</Context.Provider>;
};

export default Provider;
export const useDocumentsContext = () => React.useContext(Context);
export const DocumentsContext = Context;
