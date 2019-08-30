import 'firebase/app';
import 'firebase/firestore';
import React from 'react';
interface IPathObj<T> {
    [path: string]: T;
}
interface IContextType {
    subscribe: (path: string) => void;
    unsubscribe: (path: string) => void;
    getDoc: (path: string, latest?: boolean) => firebase.firestore.DocumentSnapshot | undefined;
    docs: IPathObj<firebase.firestore.DocumentSnapshot>;
}
declare const Provider: React.FC<React.PropsWithChildren<{
    app: firebase.app.App;
}>>;
export default Provider;
export declare const useDocumentsContext: () => IContextType;
export declare const DocumentsContext: React.Context<IContextType>;
