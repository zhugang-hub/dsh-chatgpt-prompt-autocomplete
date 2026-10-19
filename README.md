# dsh-chatgpt-prompt-autocomplete

为 **DeepSeek Harness（DSH）** 输入框提供 ChatGPT 风格的提示词自动补全：在你输入时弹出候选面板，给出 1–5 条可继续输入的提示词，**Tab** 采纳、**↑ / ↓** 切换、**Esc** 关闭。

## 功能

- 输入框上方弹出候选面板，跟随输入内容更新；面板自适应浅色 / 深色主题。
- **Tab** 采纳当前候选（写入输入框，不直接发送）。
- **↑ / ↓** 切换到上一条 / 下一条候选。
- **Esc** 关闭面板。
- 纯前端注入，**不发起模型请求、无新增运行依赖**；候选来自 `lib/client.js` 内置规则（常见前缀模板 + 上下文启发式）。

## 安装

需要 DSH Desktop / dsh，无需构建。

**方式一：从源码目录 link 安装**

```powershell
dsh plugin --profile desktop add "link:C:/Users/gonge/.dsh/plugins-src/dsh-chatgpt-prompt-autocomplete"
```

如果 profile 没有自动挂载，在该 profile 的 `cordis.patch.yml` 中补一条 insert：

```yaml
- insert:
    - id: dsh-chatgpt-prompt-autocomplete
      name: dsh-chatgpt-prompt-autocomplete
```

**方式二：从 GitHub Release 安装**

从 [Releases](https://github.com/zhugang-hub/dsh-chatgpt-prompt-autocomplete/releases) 下载 `.tgz`，在 DSH 左侧「插件 → 添加插件」中填入安装包完整路径，启用后重启 DSH。

安装后重启 DSH Desktop 生效。

## 结构

```text
package.json          # DSH bundle 声明：dsh.bundle.patch + dsh.client
cordis.patch.yml      # 把本插件挂进 profile 的 patch
lib/index.js          # Host 半边：注册静态脚本路由、注入 <script>
lib/client.js         # Client 半边：候选面板、键盘交互、采纳逻辑
```

## 说明

- Host 半边只做两件事：把 `lib/client.js` 作为静态脚本挂到 `/dsh-plugins/chatgpt-prompt-autocomplete.js`，并在 index 页面注入该 `<script>`。
- 候选生成在浏览器内完成，是**规则补全**而非模型续写；如需模型级续写，可参考同作者的 `dsh-plugin-composer-predictions`。
- 不收集、不上传任何输入内容。

## 许可

[MIT](LICENSE)。
