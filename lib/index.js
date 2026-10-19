import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLIENT_JS_PATH = path.join(PACKAGE_ROOT, 'lib', 'client.js')

const name = 'dsh-chatgpt-prompt-autocomplete'
const inject = ['webServer']

function apply(ctx) {
  const disposers = []

  let clientScript = ''
  try {
    clientScript = fs.readFileSync(CLIENT_JS_PATH, 'utf-8')
  } catch (err) {
    console.error('[PromptAutocomplete] Failed to read client.js:', err)
  }

  // 1. 注册静态脚本路由
  if (ctx.webServer && typeof ctx.webServer.register === 'function') {
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-plugins/chatgpt-prompt-autocomplete.js',
      handler: (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-store',
        })
        res.end(clientScript)
      },
    }))
  }

  // 2. 注入 HTML 入口页面
  if (ctx.webServer && typeof ctx.webServer.tapIndex === 'function') {
    disposers.push(ctx.webServer.tapIndex((html) => {
      const scriptUrl = '/dsh-plugins/chatgpt-prompt-autocomplete.js'
      if (html.indexOf(scriptUrl) !== -1) return html
      const tag = `<script defer src="${scriptUrl}"></script>`
      if (html.indexOf('</body>') !== -1) {
        return html.replace('</body>', tag + '</body>')
      }
      return html + tag
    }))
  }

  ctx.effect(() => () => {
    for (const d of disposers) {
      try { d() } catch (err) {}
    }
  })
}

export { name, inject, apply }
