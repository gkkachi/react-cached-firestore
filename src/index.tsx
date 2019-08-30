import React from 'react'
import 'firebase/app';
import 'firebase/firestore'

enum DocState {
  UNDEFINED,
  CONNECTING,
  CONNECTED,
  UNCONNECTED,
}

const debugState = (x: DocState, y: DocState, path?: string) => {
  console.debug(`STATE:\t${DocState[x]}\t->\t${DocState[y]}\t(path=${path})`)
}

type MyType<T> = { [path: string]: T }
type DocType = firebase.firestore.DocumentSnapshot
type FuncType = () => void
type DocsType = MyType<DocType>
type FuncsType = MyType<FuncType>
type DocStatesType = MyType<DocState>

type StateType = { docs: DocsType, funcs: FuncsType, docStates: DocStatesType }
const initialState = { docs: {}, funcs: {}, docStates: {} }

type ContextType = {
  subscribe: (path: string) => void,
  unsubscribe: (path: string) => void,
  getDoc: (path: string, latest?: boolean) => DocType | undefined,
  docs: MyType<DocType>
}
const Context = React.createContext<ContextType>({
  subscribe: _ => { },
  unsubscribe: _ => { },
  getDoc: _ => undefined,
  docs: {}
})

const Provider: React.FC<React.PropsWithChildren<{ app: firebase.app.App }>> = (props) => {
  const [state, setState] = React.useState<StateType>(initialState)

  const subscribe = (path: string, once = false) => {
    const docState = state.docStates[path] || DocState.UNDEFINED

    if (docState === DocState.UNDEFINED || docState === DocState.UNCONNECTED) {
      console.debug(`onSnapshot (path=${path} state=${DocState[docState]})`)
      const f = props.app.firestore().doc(path).onSnapshot(snap => {
        const docStateNow = state.docStates[path]
        const docStateNext = DocState.CONNECTED
        const newState: StateType = { ...state }
        newState.docStates[path] = docStateNext
        newState.docs[path] = snap
        debugState(docStateNow, docStateNext, path)
        setState(newState)
        if (once) {
          unsubscribe(path)
        }
      }, error => {
        const docStateNow = state.docStates[path]
        const docStateNext = DocState.UNDEFINED
        console.error(error)
        f()
        const newState = { ...state }
        newState.docStates[path] = docStateNext
        debugState(docStateNow, docStateNext, path)
        setState(newState)
      })
      const docStateNow = docState
      const docStateNext = DocState.CONNECTING
      const newState = { ...state }
      newState.docStates[path] = docStateNext
      if (newState.funcs[path]) {
        newState.funcs[path]()
      }
      newState.funcs[path] = f
      debugState(docStateNow, docStateNext, path)
      setState(newState)
    }
  }

  const unsubscribe = (path: string) => {
    const docState = state.docStates[path] || DocState.UNDEFINED
    if (docState === DocState.CONNECTED) {
      const docStateNow = docState
      const docStateNext = DocState.UNCONNECTED
      state.funcs[path]()
      const newState = { ...state }
      newState.docStates[path] = docStateNext
      debugState(docStateNow, docStateNext, path)
      setState(newState)
    }
  }

  const getDoc = (path: string, latest = true): DocType | undefined => {
    const doc = state.docs[path]
    if (doc && !latest) {
      return doc
    }
    subscribe(path, !latest)
    return doc
  }

  const docs = state.docs

  return (
    <Context.Provider value={{ subscribe, unsubscribe, docs, getDoc }}>
      {props.children}
    </Context.Provider>
  )
}

export default Provider
export const useDocumentsContext = () => React.useContext(Context)
export const DocumentsContext = Context
