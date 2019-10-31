export type Config = {
    url: string;
    handlers: Handlers;
    ping_pong_map?: PingPongMap;
};

export type PingPongMap = {
    ping: string;
    pong: string;
};

export type Handlers = {
    /** 初始化 */
    onInit?: () => void;
    /** 接收数据 */
    onData?: (data: string) => void;
    /** 出现错误 */
    onError?: (error?: string) => void;
    /** 关闭 */
    onClose?: () => void;
    /** 重连开始 */
    onReconnect?: () => void;
    /** 重连结束 */
    onReconnected?: () => void;
    /** 断开连接 */
    onEnd?: () => void;
};

type Status = 'CONNECTING' | 'OPEN' | 'CLOSED';

/** webSocket 处理函数:> 连接+断线重连+心跳检测 */
export class WebSocketCtrl {
    public url: string;
    public handlers: Handlers;
    private ws: WebSocket;
    /** 重连次数 */
    private reconnect_count: number = 0;
    /** 重连最大次数 */
    private reconnect_max: number = 3;
    /** 重连倒计时 */
    private reconnect_timeout: number;
    /** 心跳倒计时 - timeout  */
    private heartbeat_interval: number;
    /** 心跳倒计时 - 没收到返回 timeout */
    private heartbeat_gap_timeout: number;
    /** 心跳倒计时 - 运行时间 */
    private heartbeat_time: number = 10;
    /** 心跳倒计时 - 断开连接运行时间 */
    private heartbeat_gap_time: number = 3;
    /** ping pong 对应的字符 */
    private ping_pong_map?: PingPongMap;
    public status: Status;
    constructor(config: Config) {
        this.url = config.url;
        this.handlers = config.handlers;
        this.ping_pong_map = config.ping_pong_map;
        this.connect();
    }
    public connect() {
        if (this.ws) {
            return;
        }
        const { url } = this;

        this.status = 'CONNECTING';
        const ws = new WebSocket(url);
        ws.onopen = this.onopen;
        ws.onmessage = this.onmessage;
        ws.onerror = this.onError;
        ws.onclose = this.onclose;
        this.ws = ws;

        if (this.ping_pong_map) {
            this.startHeartBeat();
        }
    }
    public send(msg: string) {
        this.ws.send(msg);
    }
    private onopen = () => {
        const { onInit, onReconnected } = this.handlers;
        /** 第一次是初始化, 后面都是重连 */
        if (typeof onInit === 'function') {
            onInit();
            this.handlers.onInit = null;
        } else {
            /** 重连成功 */
            if (typeof onReconnected === 'function') {
                this.reconnect_count = 0;
                onReconnected();
            }
        }
    }; //tslint:disable-line
    private onmessage = (ev: MessageEvent) => {
        const { onData } = this.handlers;
        const msg = ev.data;
        if (this.ping_pong_map) {
            const { ping, pong } = this.ping_pong_map;
            switch (msg) {
                case ping:
                    this.sendPong();
                    break;
                case pong:
                    this.startHeartBeat();
                    break;
            }
        }
        if (typeof onData === 'function') {
            onData(msg);
        }
    }; //tslint:disable-line
    private onError = () => {
        if (typeof this.handlers.onError === 'function') {
            this.handlers.onError();
        }
    }; //tslint:disable-line
    private onclose = () => {
        if (typeof this.handlers.onClose === 'function') {
            this.handlers.onClose();
        }
        /** 如果已经连接上的断开, 正在重连 就重试 */
        this.reconnect();
    }; //tslint:disable-line
    /**
     * 重连
     */
    public reconnect() {
        if (this.reconnect_count > this.reconnect_max) {
            this.end();
            return;
        }
        if (
            typeof this.handlers.onReconnect === 'function' &&
            this.reconnect_count === 0
        ) {
            this.handlers.onReconnect();
        }
        this.reconnect_count++;
        this.reset();

        /** 延迟两秒重连 */
        clearTimeout(this.reconnect_timeout);
        this.reconnect_timeout = setTimeout(() => {
            this.connect();
        }, 2000) as any;
    }
    public startHeartBeat() {
        const { heartbeat_time, heartbeat_gap_time } = this;

        clearInterval(this.heartbeat_interval);
        clearTimeout(this.heartbeat_gap_timeout);

        this.heartbeat_interval = setInterval(() => {
            this.heartbeat_gap_timeout = setTimeout(() => {
                this.reconnect();
            }, heartbeat_gap_time * 1000) as any;

            this.sendPing();
        }, heartbeat_time * 1000) as any;
    }
    public clearHearBeatGapTimeout() {
        clearTimeout(this.heartbeat_gap_timeout);
    }
    public sendPing() {
        if (this.ping_pong_map) {
            const { ping } = this.ping_pong_map;
            this.ws.send(ping);
        }
    }
    public sendPong() {
        if (this.ping_pong_map) {
            const { pong } = this.ping_pong_map;
            this.ws.send(pong);
        }
    }
    /**
     * 断开连接
     */
    public disconnect() {
        if (this.status === 'CLOSED') {
            return;
        }
        this.end();
    }
    /** 真正的关闭 */
    private end() {
        this.reset();
        this.status = 'CLOSED';
        if (this.handlers.onEnd) {
            this.handlers.onEnd();
        }
        this.handlers = {};
    }
    /** 清理本地数据 */
    private reset() {
        if (this.ws) {
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;

            this.ws.close();
            this.ws = null;
        }
        clearInterval(this.heartbeat_interval);
        clearTimeout(this.heartbeat_gap_timeout);
    }
}

function sleep(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time * 1000);
    });
}