"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("firebase/app");
require("firebase/firestore");
var react_1 = __importDefault(require("react"));
var myUseReducer_1 = __importDefault(require("./myUseReducer"));
var DocState;
(function (DocState) {
    DocState[DocState["UNDEFINED"] = 0] = "UNDEFINED";
    DocState[DocState["CONNECTING"] = 1] = "CONNECTING";
    DocState[DocState["CONNECTED"] = 2] = "CONNECTED";
    DocState[DocState["UNCONNECTED"] = 3] = "UNCONNECTED";
})(DocState || (DocState = {}));
var Context = react_1.default.createContext({
    getDoc: function (_) { return undefined; },
    subscribe: function (_) { return _; },
    unsubscribe: function (_) { return _; },
});
var Provider = function (props) {
    var _a = myUseReducer_1.default(), docs = _a[0], setDoc = _a[1];
    var _b = myUseReducer_1.default(), funcs = _b[0], addFunc = _b[1], delFunc = _b[2];
    var _c = myUseReducer_1.default(), docStates = _c[0], setDocState = _c[1];
    var subscribe = function (path, once) {
        if (once === void 0) { once = false; }
        var docState = docStates[path] || DocState.UNDEFINED;
        if (docState === DocState.UNDEFINED || docState === DocState.UNCONNECTED) {
            setDocState(path, DocState.CONNECTING);
            console.debug("onSnapshot:\t(path=" + path + ")");
            var f_1 = props.app
                .firestore()
                .doc(path)
                .onSnapshot(function (snap) {
                setDocState(path, DocState.CONNECTED);
                setDoc(path, snap);
                if (once) {
                    unsubscribe(path);
                }
            }, function (error) {
                setDocState(path, DocState.UNDEFINED);
                f_1();
            });
            addFunc(path, f_1);
        }
    };
    var unsubscribe = function (path) {
        var docState = docStates[path] || DocState.UNDEFINED;
        if (docState === DocState.CONNECTED) {
            setDocState(path, DocState.UNCONNECTED);
            funcs[path]();
            delFunc(path);
        }
    };
    var getDoc = function (path, latest) {
        if (latest === void 0) { latest = true; }
        var doc = docs[path];
        if (doc && !latest) {
            return doc;
        }
        subscribe(path, !latest);
        return doc;
    };
    return react_1.default.createElement(Context.Provider, { value: { subscribe: subscribe, unsubscribe: unsubscribe, getDoc: getDoc } }, props.children);
};
exports.default = Provider;
exports.useDocumentsContext = function () { return react_1.default.useContext(Context); };
exports.DocumentsContext = Context;
