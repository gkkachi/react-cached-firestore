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
require("firebase/app");
require("firebase/firestore");
var react_1 = __importDefault(require("react"));
var DocState;
(function (DocState) {
    DocState[DocState["UNDEFINED"] = 0] = "UNDEFINED";
    DocState[DocState["CONNECTING"] = 1] = "CONNECTING";
    DocState[DocState["CONNECTED"] = 2] = "CONNECTED";
    DocState[DocState["UNCONNECTED"] = 3] = "UNCONNECTED";
})(DocState || (DocState = {}));
var initialState = { docs: {}, funcs: {}, docStates: {} };
var Context = react_1.default.createContext({
    docs: {},
    getDoc: function (_) { return undefined; },
    subscribe: function (_) { return _; },
    unsubscribe: function (_) { return _; },
});
var Provider = function (props) {
    var _a = react_1.default.useState(initialState), state = _a[0], setState = _a[1];
    var subscribe = function (path, once) {
        if (once === void 0) { once = false; }
        var docState = state.docStates[path] || DocState.UNDEFINED;
        if (docState === DocState.UNDEFINED || docState === DocState.UNCONNECTED) {
            var f_1 = props.app
                .firestore()
                .doc(path)
                .onSnapshot(function (snap) {
                var newState = __assign({}, state);
                newState.docStates[path] = DocState.CONNECTED;
                newState.docs[path] = snap;
                setState(newState);
                if (once) {
                    unsubscribe(path);
                }
            }, function (error) {
                f_1();
                var newState = __assign({}, state);
                newState.docStates[path] = DocState.UNDEFINED;
                setState(newState);
            });
            var newStateX = __assign({}, state);
            newStateX.docStates[path] = DocState.CONNECTING;
            if (newStateX.funcs[path]) {
                newStateX.funcs[path]();
            }
            newStateX.funcs[path] = f_1;
            setState(newStateX);
        }
    };
    var unsubscribe = function (path) {
        var docState = state.docStates[path] || DocState.UNDEFINED;
        if (docState === DocState.CONNECTED) {
            var docStateNext = DocState.UNCONNECTED;
            state.funcs[path]();
            var newState = __assign({}, state);
            newState.docStates[path] = docStateNext;
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
    return react_1.default.createElement(Context.Provider, { value: { subscribe: subscribe, unsubscribe: unsubscribe, docs: docs, getDoc: getDoc } }, props.children);
};
exports.default = Provider;
exports.useDocumentsContext = function () { return react_1.default.useContext(Context); };
exports.DocumentsContext = Context;
