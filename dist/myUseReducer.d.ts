interface IPathObj<T> {
    [path: string]: T;
}
declare const myUseReducer: <T>() => [IPathObj<T>, (s: string, i: T) => void, (s: string) => void];
export default myUseReducer;
