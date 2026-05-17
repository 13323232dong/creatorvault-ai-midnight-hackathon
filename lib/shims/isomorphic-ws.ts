// Next/Webpack 在浏览器包里读取 isomorphic-ws 的命名导出时不稳定。
// Midnight indexer provider 只需要一个 WebSocket 构造器，所以这里显式给它。
export const WebSocket = globalThis.WebSocket

export default WebSocket
