import { set, isFunction, cacheFactory } from 'para-utils';
import { INtvCallback } from '../types/INtvDtoProtocol';
import { parseCallBackDataFromNative } from '../utils/bridgeUtils';

const webviewGroupCache = {};

function generateUniqueName(ntvMethod): string {
  if (!webviewGroupCache[ntvMethod]) {
    webviewGroupCache[ntvMethod] = cacheFactory(ntvMethod);
  }
  return webviewGroupCache[ntvMethod]();
}

export abstract class BridgePlugin<T, K>{
  protected param?: T;
  // bridge api的唯一标识
  protected pluginName: string;

  constructor(param?: T) {
    this.param = param;
  }

  /**
   * 当前bridge对应的pluginName，和ios/android之间的约定
   */
  protected get ntvPluginName(): string {
    throw new Error('Method Not Implement');
  }

  /**
   * 当前bridge插件最低可运行的Native版本支持.
   */
  protected get availableMinVersion(): string {
    throw new Error('Method Not Implement');
  }

  /**
   * Chrome浏览器运行时容器：可以实现在浏览器或者其他平台运行时执行逻辑，弥补平台调用差异性
   * @param pluginName 真实传递到Native的插件的函数调用名字window._ntv_bar_set_navbar_1
   */
  protected abstract brigeExecChrome(pluginName: string): void;

  /**
   * 插件调用失败，需要清理已经绑定的错误的注册回调函数
   * 调用端需要catch error，纠正，并重新执行绑定注册流程（插件重新初始化)
   */
  private clearBridgeMemory(pluginName) {
    if (pluginName) {
      set(window, pluginName, null);
    }
  }

  /**
   * 包装Native回调函数全局window对象的自动签名 如: _ntv_bar_set_navbar_1
   * 回调客户端签名可能是 window._ntv_bar_set_navbar_1();
   * Note: 同一个实例只注册一个pluginName方法签名.如果已经注册，则返回已有的。这意味着同一页面调用多次bridge，实际使用的是同一个实例
   * @param pluginName 注册的插件名
   * @param callbackDto 回调客户端的执行逻辑
   * @returns {string} cbUniqueName 返回生成的唯一的插件签名
   */
  protected registWebviewCb(pluginName: string, callbackDto): string {
    const cbUniqueName = generateUniqueName(pluginName);
    set(window, cbUniqueName, callbackDto);
    return cbUniqueName;
  }

  protected bridgeExec(pluginName: string): void {
    // Android: webview只能调window对象，不能申明自定义变量，在调用
    if (this.canInvokeNtv()) {

    }
    if (!isFafWebview()) {
      // 可针对不同运行环境实现特定的调用逻辑来MOCK，弥补实现差异性.
      this.brigeExecChrome(pluginName);
    }
  }

  /**
   * callbackDto 对回调的一层封装
   * todo: error 的捕获和通知
   */
  protected executeCallBack(callback?: INtvCallback<K>) {
    if (callback && isFunction(callback)) {
      const callbackDto = (...args) => {
        try {
          callback(null, parseCallBackDataFromNative<K>(args));
        } catch (error) {
          this.clearBridgeMemory(this.pluginName);
          if (callback) {
            callback(error);
          }
        }
      };
      if (!this.pluginName) {
        this.pluginName = this.registWebviewCb(
          this.pluginName, callbackDto
        );
      } else {
        // 如已经绑定过，更新回调函数为最新的传进来的callback
        set(window, `${this.pluginName}`, callbackDto);
      }
    }
    try {
      this.bridgeExec(this.pluginName);
    } catch (error) {
      this.clearBridgeMemory(this.pluginName);
      if (callback) {
        callback(error);
      }
    }
  }

  /**
   * 桥（全局变量下）绑定的唯一的回调函数，可一直存在，并被多次调用执行
   * 如：setNavBar时，前端只绑定一次，但会由ios/andorid多次触发回调，
   * 从回调中获取用户的点击动作
   * @param callback 回调函数
   * @param param 如果参数传进来，将会覆盖构造器的初始化参数
   */
  public invokeBind(callback?: INtvCallback<K>, param?: T): void {
    if (param) {
      this.param = param;
    }
    this.executeCallBack(callback);
  }

}