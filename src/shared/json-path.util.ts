/**
 * 在 JSON 文本中定位某个路径对应的字符区间，用于把校验结果标注到编辑器里。
 * 只扫描结构，不构造对象；文本不是合法 JSON 时尽量定位，失败返回 undefined。
 *
 * @example
 * const text = '{"tools":{"get_list":{"sideEffect":"READ"}}}';
 * locateJsonPath(text, ['tools', 'get_list', 'sideEffect']); // { from: 35, to: 41 }（值 "READ" 的区间）
 * locateJsonPath(text, ['tools', 'missing']);                 // { from: 9, to: 43 }（退回最近的已存在节点）
 */

export interface TextRange {
  from: number;
  to: number;
}

type Segment = string | number;

/** 跳过空白，返回下一个非空白字符的位置 */
function skipSpace(text: string, i: number): number {
  while (i < text.length && /\s/.test(text[i])) i++;
  return i;
}

/** 读取字符串字面量，返回结束位置（不含）与解码后的值 */
function readString(text: string, i: number): { end: number; value: string } {
  let j = i + 1;
  while (j < text.length && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
  const raw = text.slice(i, j + 1);
  let value = raw.slice(1, -1);
  try {
    value = JSON.parse(raw) as string;
  } catch {
    // 保留原文
  }
  return { end: j + 1, value };
}

/** 跳过一个完整的值，返回结束位置（不含） */
function skipValue(text: string, i: number): number {
  i = skipSpace(text, i);
  const c = text[i];
  if (c === '"') return readString(text, i).end;
  if (c === '{' || c === '[') {
    const close = c === '{' ? '}' : ']';
    let j = i + 1;
    for (;;) {
      j = skipSpace(text, j);
      if (j >= text.length) return j;
      if (text[j] === close) return j + 1;
      if (text[j] === ',') {
        j++;
        continue;
      }
      if (c === '{') {
        j = readString(text, j).end;
        j = skipSpace(text, j);
        if (text[j] === ':') j++;
      }
      j = skipValue(text, j);
    }
  }
  let j = i;
  while (j < text.length && !/[\s,\]}]/.test(text[j])) j++;
  return j;
}

/** 在位置 i 的值中查找子节点，返回子值起点；找不到返回 undefined */
function child(text: string, i: number, segment: Segment): number | undefined {
  const open = text[i];
  if (open !== '{' && open !== '[') return undefined;
  let j = i + 1;
  let index = 0;
  for (;;) {
    j = skipSpace(text, j);
    if (j >= text.length || text[j] === '}' || text[j] === ']') return undefined;
    if (text[j] === ',') {
      j++;
      continue;
    }
    if (open === '{') {
      const key = readString(text, j);
      j = skipSpace(text, key.end);
      if (text[j] === ':') j++;
      j = skipSpace(text, j);
      if (key.value === String(segment)) return j;
    } else if (index === segment) {
      return j;
    } else {
      index++;
    }
    j = skipValue(text, j);
  }
}

/** 定位路径；中途缺失时退回最近的已存在节点 */
export function locateJsonPath(text: string, path: readonly Segment[]): TextRange | undefined {
  let start = skipSpace(text, 0);
  if (start >= text.length) return undefined;
  for (const segment of path) {
    const next = child(text, start, segment);
    if (next === undefined) break;
    start = next;
  }
  return { from: start, to: skipValue(text, start) };
}
