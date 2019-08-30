"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
require("firebase/app");
require("firebase/firestore");
var DocState;
(function (DocState) {
    DocState[DocState["UNDEFINED"] = 0] = "UNDEFINED";
    DocState[DocState["CONNECTING"] = 1] = "CONNECTING";
    DocState[DocState["CONNECTED"] = 2] = "CONNECTED";
    DocState[DocState["UNCONNECTED"] = 3] = "UNCONNECTED";
})(DocState || (DocState = {}));
var debugState = function (x, y, path) {
    console.debug("STATE:\t" + DocState[x] + "\t->\t" + DocState[y] + "\t(path=" + path + ")");
};
var initialState = { docs: {}, funcs: {}, docStates: {} };
var Context = react_1.default.createContext({
    subscribe: function (_) { },
    unsubscribe: function (_) { },
    getDoc: function (_) { return undefined; },
    docs: {}
});
var Provider = function (props) {
    var _a = react_1.default.useState(initialState), state = _a[0], setState = _a[1];
    var subscribe = function (path, once) {
        if (once === void 0) { once = false; }
        var docState = state.docStates[path] || DocState.UNDEFINED;
        if (docState === DocState.UNDEFINED || docState === DocState.UNCONNECTED) {
            console.debug("onSnapshot (path=" + path + " state=" + DocState[docState] + ")");
            var f_1 = props.app.firestore().doc(path).onSnapshot(function (snap) {
                var docStateNow = state.docStates[path];
                var docStateNext = DocState.CONNECTED;
                var newState = __assign({}, state);
                newState.docStates[path] = docStateNext;
                newState.docs[path] = snap;
                debugState(docStateNow, docStateNext, path);
                setState(newState);
                if (once) {
                    unsubscribe(path);
                }
            }, function (error) {
                var docStateNow = state.docStates[path];
                var docStateNext = DocState.UNDEFINED;
                console.error(error);
                f_1();
                var newState = __assign({}, state);
                newState.docStates[path] = docStateNext;
                debugState(docStateNow, docStateNext, path);
                setState(newState);
            });
            var docStateNow = docState;
            var docStateNext = DocState.CONNECTING;
            var newState = __assign({}, state);
            newState.docStates[path] = docStateNext;
            if (newState.funcs[path]) {
                newState.funcs[path]();
            }
            newState.funcs[path] = f_1;
            debugState(docStateNow, docStateNext, path);
            setState(newState);
        }
    };
    var unsubscribe = function (path) {
        var docState = state.docStates[path] || DocState.UNDEFINED;
        if (docState === DocState.CONNECTED) {
            var docStateNow = docState;
            var docStateNext = DocState.UNCONNECTED;
            state.funcs[path]();
            var newState = __assign({}, state);
            newState.docStates[path] = docStateNext;
            debugState(docStateNow, docStateNext, path);
            setState(newState);
        }
    };
    var getDoc = function (path, latest) {
        if (latest === void 0) { latest = true; }
        var doc = state.docs[path];
        if (doc && !latest) {
            return doc;
        }
        subscribe(path, !latest);
        return doc;
    };
    var docs = state.docs;
    return (react_1.default.createElement(Context.Provider, { value: { subscribe: subscribe, unsubscribe: unsubscribe, docs: docs, getDoc: getDoc } }, props.children));
};
exports.default = Provider;
exports.useDocumentsContext = function () { return react_1.default.useContext(Context); };
exports.DocumentsContext = Context;
