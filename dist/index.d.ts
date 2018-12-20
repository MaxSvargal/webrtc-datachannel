/// <reference types="node" />
import { EventEmitter } from 'events';
interface Compressor {
    compress: (a: string) => string;
    decompress: (a: string) => string;
}
interface IOptions {
    connection?: RTCConfiguration;
    compressor?: Compressor;
    wrtc?: {
        RTCPeerConnection: typeof RTCPeerConnection;
        RTCIceCandidate: typeof RTCIceCandidate;
    };
}
export default class WebRtcDataChannel extends EventEmitter {
    private compressor;
    private rpc;
    private RTCIceCandidate;
    private candidates;
    private alisteners;
    private dataChannel;
    private offer;
    private messageNonce;
    constructor({ connection, wrtc, compressor }?: IOptions);
    getCandidates: (i?: number) => Promise<string>;
    createOffer: () => Promise<string | undefined>;
    getCompressedOffer: () => string;
    decompressOffer: () => void;
    createChannel: (name?: string) => RTCDataChannel;
    setOffer: (offer: string) => Promise<string | undefined>;
    setRemote: (answer: string) => Promise<RTCSessionDescription | null>;
    addCandidates: (candidates: string) => Promise<RTCIceCandidate[]>;
    channelOpened: () => Promise<{}>;
    send: (message: any) => Promise<MessageEvent>;
    initiateConnect: () => Promise<string>;
    setAnswer: (response: string) => Promise<any>;
    initByRequest: (request: string) => Promise<string>;
}
export {};
