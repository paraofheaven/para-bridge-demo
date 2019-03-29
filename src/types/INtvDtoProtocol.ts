/**
 * 转换Native返回的数据结构
 */
export interface INtvCallbackResult<K> {
  tagName?: string;
  cbData: K;
}

/**
 * 统一定义callback函数签名协议
 */
export type INtvCallback<K> = (err: null | Error, data?: INtvCallbackResult<K>) => void;

/**
 * 调用Native插件回调协议
 * 全局客户端回调接受也是一个字符串, 经解析后的对象格式
 */
export interface INtvCallbackParam {
  pluginName?: string;
  param?: {
    tagName?: string;
    CBData?: string;
    isStop?: string;
  }
}