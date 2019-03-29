
import { INtvCallbackResult } from '../types/INtvDtoProtocol';
import { isArray, get, parse, deepParseJson } from 'para-utils';
import { INtvCallbackParam } from '../types/INtvDtoProtocol';

/**
 * 解析从native端获取的字符串
 * @returns result 
 *    @returns {String} tagName 标识字符串，如标识用户点击事件:'click_navbar_left'
 *    @returns {Object} cbData 数据字符串CBData的结果，解析方法：deepParse(CBData),需注意parse可能导致的报错
 */
export function parseCallBackDataFromNative<K>(args?: string | string[]): INtvCallbackResult<K> {
  const result: INtvCallbackResult<K> = { tagName: '', cbData: {} as K };
  const arg: string = isArray(args) ? (args as any[])[0] : args;
  if (arg) {
    console.log('parseCallBackDataFromNative args: ', arg);
    const parseCallBackDataResult = parse(decodeURIComponent(arg)) as INtvCallbackParam;
    console.log('parsedNativeCallbackResult:', parseCallBackDataResult);
    result.tagName = get(parseCallBackDataResult, 'param.tagName', '');
    result.cbData = deepParseJson(get(parseCallBackDataResult, 'param.CBData', JSON.stringify({})) || {});
  }
  return result;
}