/**
 * bytemd 插件与语言包装配，编辑器与只读视图共用。
 */
import type { BytemdLocale, BytemdPlugin } from 'bytemd';
import type { HLJSApi } from 'highlight.js';
import gfm from '@bytemd/plugin-gfm';
import bytemdZh from 'bytemd/locales/zh_Hans.json';
import gfmZh from '@bytemd/plugin-gfm/locales/zh_Hans.json';

/** 以 zh 开头的语言使用简体中文，其余使用插件内置英文 */
function isChinese(locale: string): boolean {
  return locale.toLowerCase().startsWith('zh');
}

let highlighter: Promise<HLJSApi> | undefined;

/**
 * 只注册控制台用到的语言（json、yaml、markdown），避免整包引入 highlight.js（约 1 MB）。
 * 首次遇到代码块时才加载，加载后在页面生命周期内复用；未注册的语言按纯文本显示。
 */
function loadHighlighter(): Promise<HLJSApi> {
  highlighter ??= (async () => {
    const [core, json, yaml, markdown] = await Promise.all([
      import('highlight.js/lib/core'),
      import('highlight.js/lib/languages/json'),
      import('highlight.js/lib/languages/yaml'),
      import('highlight.js/lib/languages/markdown'),
    ]);
    const hljs = core.default;
    hljs.registerLanguage('json', json.default);
    hljs.registerLanguage('yaml', yaml.default);
    hljs.registerLanguage('markdown', markdown.default);
    return hljs;
  })();
  return highlighter;
}

/** 代码高亮：渲染后对 `pre > code` 着色 */
function highlight(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      const blocks = markdownBody.querySelectorAll<HTMLElement>('pre > code');
      if (blocks.length === 0) return;
      void loadHighlighter().then((hljs) => blocks.forEach((block) => hljs.highlightElement(block)));
    },
  };
}

export function markdownPlugins(locale: string): BytemdPlugin[] {
  return [gfm(isChinese(locale) ? { locale: gfmZh } : {}), highlight()];
}

export function editorLocale(locale: string): Partial<BytemdLocale> | undefined {
  return isChinese(locale) ? bytemdZh : undefined;
}
