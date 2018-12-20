"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var WebRtcDataChannel = /** @class */ (function (_super) {
    __extends(WebRtcDataChannel, _super);
    function WebRtcDataChannel(_a) {
        var _b = _a === void 0 ? {} : _a, connection = _b.connection, wrtc = _b.wrtc, compressor = _b.compressor;
        var _this = _super.call(this) || this;
        _this.compressor = null;
        _this.candidates = [];
        _this.alisteners = {};
        _this.dataChannel = null;
        _this.offer = null;
        _this.messageNonce = 0;
        _this.getCandidates = function (i) {
            if (i === void 0) { i = 0; }
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (i >= 20)
                                return [2 /*return*/, Promise.reject('No connection.')];
                            if (!(this.candidates.length > 0)) return [3 /*break*/, 1];
                            return [2 /*return*/, Promise.resolve(JSON.stringify(this.candidates))];
                        case 1: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.getCandidates(++i)];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        _this.createOffer = function () { return __awaiter(_this, void 0, void 0, function () {
            var offer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rpc.createOffer()];
                    case 1:
                        offer = _a.sent();
                        return [4 /*yield*/, this.rpc.setLocalDescription(offer)];
                    case 2:
                        _a.sent();
                        this.offer = offer.sdp;
                        return [2 /*return*/, offer.sdp];
                }
            });
        }); };
        _this.getCompressedOffer = function () {
            if (!_this.offer || !_this.compressor)
                throw Error('Offer is not created yet or compressor is not defined.');
            var request = JSON.stringify([encodeURI(_this.offer), _this.candidates]);
            return _this.compressor.compress(request);
        };
        _this.decompressOffer = function () {
            if (!_this.rpc || !_this.compressor)
                throw Error('Offer is not created yet or compressor is not defined.');
        };
        _this.createChannel = function (name) {
            if (name === void 0) { name = 'chat'; }
            var channel = _this.rpc.createDataChannel(name);
            channel.onopen = function () { return _this.emit('open'); };
            channel.onclose = function () { return _this.emit('close'); };
            channel.onerror = function (error) { return _this.emit('error', error); };
            channel.onmessage = function (_a) {
                var data = _a.data;
                try {
                    var msg = JSON.parse(data);
                    var nonce = msg.nonce, message = msg.message;
                    _this.emit('message', message);
                    if (_this.alisteners[nonce]) {
                        _this.alisteners[nonce](message);
                        delete _this.alisteners[nonce];
                    }
                }
                catch (err) {
                    console.error('Message couldn\'t be parsed. It has not a valid format.');
                }
            };
            return channel;
        };
        _this.setOffer = function (offer) { return __awaiter(_this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rpc.setRemoteDescription({ type: 'offer', sdp: offer })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rpc.createAnswer()];
                    case 2:
                        answer = _a.sent();
                        return [4 /*yield*/, this.rpc.setLocalDescription(answer)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, answer.sdp];
                }
            });
        }); };
        _this.setRemote = function (answer) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rpc.setRemoteDescription({ type: 'answer', sdp: answer })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.rpc.currentRemoteDescription];
                }
            });
        }); };
        _this.addCandidates = function (candidates) { return __awaiter(_this, void 0, void 0, function () {
            var values, promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        values = JSON.parse(candidates);
                        promises = values.map(function (candidate) {
                            return _this.rpc.addIceCandidate(new _this.RTCIceCandidate(candidate));
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.candidates];
                }
            });
        }); };
        _this.channelOpened = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return _this.dataChannel ? resolve() : _this.on('datachannel', resolve); })];
            });
        }); };
        _this.send = function (message) {
            return new Promise(function (resolve, reject) {
                if (!_this.dataChannel)
                    return reject(Error('dataChannel doesn\'t opened'));
                _this.dataChannel.send(JSON.stringify({
                    nonce: ++_this.messageNonce,
                    message: message
                }));
                _this.alisteners[_this.messageNonce] = resolve;
            });
        };
        _this.initiateConnect = function () { return __awaiter(_this, void 0, void 0, function () {
            var offer, candidates, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.createChannel();
                        return [4 /*yield*/, this.createOffer()];
                    case 1:
                        offer = _a.sent();
                        return [4 /*yield*/, this.getCandidates()];
                    case 2:
                        candidates = _a.sent();
                        request = JSON.stringify([encodeURI(offer), candidates]);
                        return [2 /*return*/, request];
                }
            });
        }); };
        _this.setAnswer = function (response) { return __awaiter(_this, void 0, void 0, function () {
            var _a, encodedAnswer, decodedCandidates, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = JSON.parse(response), encodedAnswer = _a[0], decodedCandidates = _a[1];
                        return [4 /*yield*/, this.setRemote(decodeURI(encodedAnswer))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.addCandidates(decodedCandidates)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.channelOpened()];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _b.sent();
                        return [2 /*return*/, err_1];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        _this.initByRequest = function (request) { return __awaiter(_this, void 0, void 0, function () {
            var _a, encodedOffer, decodedCandidates, answer, candidates, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.createChannel();
                        _a = JSON.parse(request), encodedOffer = _a[0], decodedCandidates = _a[1];
                        return [4 /*yield*/, this.setOffer(decodeURI(encodedOffer))];
                    case 1:
                        answer = _b.sent();
                        return [4 /*yield*/, this.addCandidates(decodedCandidates)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.getCandidates()];
                    case 3:
                        candidates = _b.sent();
                        response = JSON.stringify([encodeURI(answer), candidates]);
                        return [2 /*return*/, response];
                }
            });
        }); };
        if (compressor)
            _this.compressor = compressor;
        var RTC = wrtc ? wrtc.RTCPeerConnection : RTCPeerConnection;
        _this.RTCIceCandidate = wrtc ? wrtc.RTCIceCandidate : RTCIceCandidate;
        _this.rpc = new RTC(connection);
        _this.rpc.onicecandidate = function (_a) {
            var candidate = _a.candidate;
            console.log({ candidate: candidate });
            if (candidate) {
                _this.candidates.push(candidate);
                _this.emit('icecandidate', candidate);
            }
        };
        _this.rpc.ondatachannel = function (event) {
            _this.dataChannel = event.channel;
            _this.emit('datachannel', event);
        };
        _this.rpc.onconnectionstatechange = function (event) {
            return _this.emit('connectionstatechange', event);
        };
        return _this;
    }
    return WebRtcDataChannel;
}(events_1.EventEmitter));
exports.default = WebRtcDataChannel;
//# sourceMappingURL=index.js.map