interface IOptions {
    connection?: RTCConfiguration;
    wrtc?: {
        RTCPeerConnection: typeof RTCPeerConnection;
        RTCIceCandidate: typeof RTCIceCandidate;
    };
}
export default class WebRtcDataChannel {
    private rpc;
    private RTCIceCandidate;
    private candidates;
    private alisteners;
    private eventsListeners;
    private dataChannel;
    private messageNonce;
    constructor({ connection, wrtc }?: IOptions);
    on: (event: string, subscriber: (event: any) => void) => number | ((event: any) => void)[];
    emit: (event: string, data?: any) => false | void;
    getCandidates: (i?: number) => Promise<string>;
    createOffer: () => Promise<string>;
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
