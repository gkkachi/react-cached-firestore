import React from 'react';
import 'firebase/app';
import 'firebase/firestore';
declare type MyType<T> = {
    [path: string]: T;
};
declare type DocType = firebase.firestore.DocumentSnapshot;
declare type ContextType = {
    subscribe: (path: string) => void;
    unsubscribe: (path: string) => void;
    getDoc: (path: string, latest?: boolean) => DocType | undefined;
    docs: MyType<DocType>;
};
declare const Provider: React.FC<React.PropsWithChildren<{
    app: firebase.app.App;
}>>;
export default Provider;
export declare const useDocumentsContext: () => ContextType;
export declare const DocumentsContext: React.Context<ContextType>;
