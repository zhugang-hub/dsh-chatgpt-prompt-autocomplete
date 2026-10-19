// DSH ChatGPT 自动推荐续写提示词插件 - 前端注入脚本
(function () {
  if (window.__dshPromptAutocompleteLoaded) return;
  window.__dshPromptAutocompleteLoaded = true;

  console.log('[PromptAutocomplete] Initializing ChatGPT prompt completion plugin...');

  // 1. 样式定义
  const style = document.createElement('style');
  style.id = 'dsh-prompt-autocomplete-style';
  style.textContent = `
    .dsh-pac-container {
      position: absolute;
      z-index: 100000;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      box-shadow: 0 10px 28px -4px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 6px;
      min-width: 240px;
      max-width: 480px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      pointer-events: auto;
      transition: opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      transform: translateY(6px);
      display: none;
    }
    .dsh-pac-container.dsh-pac-visible {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }
    @media (prefers-color-scheme: dark) {
      .dsh-pac-container {
        background: rgba(30, 32, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
      }
    }
    .dsh-pac-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 8px 6px 8px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      margin-bottom: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #888;
      letter-spacing: 0.03em;
    }
    @media (prefers-color-scheme: dark) {
      .dsh-pac-header {
        border-bottom-color: rgba(255, 255, 255, 0.08);
        color: #aaa;
      }
    }
    .dsh-pac-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dsh-pac-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #222;
      transition: background 0.12s ease, color 0.12s ease;
      user-select: none;
    }
    @media (prefers-color-scheme: dark) {
      .dsh-pac-item {
        color: #eee;
      }
    }
    .dsh-pac-item:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    @media (prefers-color-scheme: dark) {
      .dsh-pac-item:hover {
        background: rgba(255, 255, 255, 0.07);
      }
    }
    .dsh-pac-item.dsh-pac-selected {
      background: #10a37f;
      color: #fff;
    }
    .dsh-pac-item-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 12px;
    }
    .dsh-pac-item-badge {
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      color: inherit;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      opacity: 0.85;
    }
    .dsh-pac-item.dsh-pac-selected .dsh-pac-item-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
    .dsh-pac-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 5px 8px 2px 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      margin-top: 4px;
      font-size: 11px;
      color: #999;
    }
    @media (prefers-color-scheme: dark) {
      .dsh-pac-footer {
        border-top-color: rgba(255, 255, 255, 0.08);
        color: #777;
      }
    }
    .dsh-pac-key-hint {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .dsh-pac-kbd {
      padding: 1px 4px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.12);
      font-size: 10px;
      font-family: inherit;
    }
    @media (prefers-color-scheme: dark) {
      .dsh-pac-kbd {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.16);
        color: #ddd;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. 状态机
  let activeEditor = null;
  let activeSuggestions = [];
  let selectedIndex = 0;
  let popupEl = null;

  // 3. 内置高质量 ChatGPT 提示词推荐库 (支持中英双语、代码、写作、翻译、分析与续写模式)
  const PROMPT_DATABASE = [
    // 提问/分析类
    { prefix: "请", completions: ["详细分析并解释这个问题的核心原因", "用通俗易懂的语言分步骤说明", "对比优缺点并给出具体的最佳实践建议", "帮我用图表/对比表总结上述内容", "从架构设计与工程化角度提出优化方案"] },
    { prefix: "帮我", completions: ["实现完整代码并附带详尽注释和单元测试", "重构这段代码以提高可读性和运行效率", "排查这个报错的具体根因并提供修复方案", "写一篇结构严谨、逻辑清晰的专业总结报告", "制定一份详细周密的执行落地计划清单"] },
    { prefix: "如何", completions: ["在保持向后兼容性的前提下平滑迁移？", "构建高可用、低延迟的自动化微服务架构？", "实现自动化单元测试与持续集成（CI/CD）流程？", "优雅地处理边界异常并提供可靠的重试策略？", "从零搭建一个生产级别的开源插件系统？"] },
    { prefix: "为什么", completions: ["会出现这种偶发性并发竞态问题，底层机制是什么？", "在生产环境下这种实现会导致内存泄漏或高 CPU 占用？", "官方文档推荐这种设计模式而不是直接全局单例？"] },
    { prefix: "解释", completions: ["一下这个核心技术概念的设计哲学与底层原理", "这段复杂代码的执行流以及每一步的状态变化", "这种算法相比传统暴力解法的时间与空间复杂度优势"] },
    { prefix: "总结", completions: ["上述要点为 3 个最关键的行动建议", "核心逻辑并提取出可直接复用的最佳实践", "会议/讨论纪要，标明行动项（Action Items）及负责人"] },
    { prefix: "对比", completions: ["两者在性能、易用性、学习曲线与生态支持上的异同", "不同方案的权衡（Trade-offs）并给出选型结论"] },
    { prefix: "优化", completions: ["以下代码的算法时间复杂度至 O(n) 或更优", "前端渲染首屏时间与 Core Web Vitals 核心指标", "这段 Prompt 提示词以使大模型的输出更加精准稳定"] },
    { prefix: "写一个", completions: ["健壮且类型安全的 TypeScript/JavaScript 实现函数", "生产环境可用的自动化 Dockerfile 与构建脚本", "高可用、支持自动故障转移的分布式架构方案"] },
    { prefix: "翻译", completions: ["成专业、地道的技术英语（附带专业术语对照）", "成符合中文阅读习惯的优雅译文，润色语句表达"] },
    // 英文常见续写
    { prefix: "how to", completions: ["implement this feature with clean code and best practices?", "optimize performance and reduce memory consumption?", "handle edge cases and error boundaries gracefully?"] },
    { prefix: "please", completions: ["explain the underlying mechanism step by step", "provide a comprehensive code example with unit tests", "summarize the key takeaways and actionable next steps"] },
    { prefix: "can you", completions: ["review this implementation and suggest improvements?", "help me debug this issue and find the root cause?", "convert this into a modular and reusable component?"] },
    { prefix: "explain", completions: ["the architecture pattern and trade-offs involved", "how this works under the hood with a sequence diagram"] }
  ];

  // 4. 创建浮动推荐气泡
  function createPopup() {
    if (popupEl) return popupEl;
    popupEl = document.createElement('div');
    popupEl.className = 'dsh-pac-container';
    popupEl.innerHTML = `
      <div class="dsh-pac-header">
        <span>✨ 续写提示词 (ChatGPT 推荐)</span>
        <span style="font-size:10px;font-weight:normal;opacity:0.8;">DeepSeek Harness</span>
      </div>
      <ul class="dsh-pac-list"></ul>
      <div class="dsh-pac-footer">
        <span class="dsh-pac-key-hint"><kbd class="dsh-pac-kbd">↑</kbd><kbd class="dsh-pac-kbd">↓</kbd> 切换</span>
        <span class="dsh-pac-key-hint"><kbd class="dsh-pac-kbd">Tab</kbd> 采纳</span>
        <span class="dsh-pac-key-hint"><kbd class="dsh-pac-kbd">Esc</kbd> 关闭</span>
      </div>
    `;
    document.body.appendChild(popupEl);

    // 鼠标点击某一项直接采纳
    popupEl.addEventListener('click', (e) => {
      const item = e.target.closest('.dsh-pac-item');
      if (item && item.dataset.index !== undefined) {
        selectedIndex = parseInt(item.dataset.index, 10);
        acceptCurrentSuggestion();
      }
    });

    return popupEl;
  }

  // 5. 查找当前光标所在上下文并生成续写推荐
  function generateSuggestions(currentText) {
    if (!currentText || !currentText.trim()) return [];

    const text = currentText.trim();
    const suggestions = [];

    // 精确前缀与后缀匹配
    for (const group of PROMPT_DATABASE) {
      if (text.endsWith(group.prefix) || group.prefix.startsWith(text)) {
        for (const comp of group.completions) {
          suggestions.push(comp);
        }
      } else if (text.length >= 1 && group.prefix.includes(text[text.length - 1])) {
        for (const comp of group.completions) {
          if (!suggestions.includes(comp)) suggestions.push(comp);
        }
      }
    }

    // 泛化模式匹配：如果用户输入末尾包含动词或连接词
    if (suggestions.length === 0) {
      if (/[,，、与和及]$/.test(text)) {
        suggestions.push("并给出具体的实现代码与最佳实践", "详细阐述其背后的设计哲学", "列出常见踩坑点与排错指南");
      } else if (/[?？]$/.test(text)) {
        suggestions.push("请结合具体案例深入说明", "是否有其他替代方案？各自优缺点是什么？");
      } else if (text.length >= 2) {
        // 通用自然续写提示词
        suggestions.push(
          "请结合代码给出详细的落地方案",
          "请分步骤解析并指出关键注意事项",
          "请给出性能评估与优化方案",
          "并用中文通俗易懂地解释其核心原理"
        );
      }
    }

    return suggestions.slice(0, 5);
  }

  // 6. 渲染建议弹窗
  function renderSuggestions(editorEl, suggestions) {
    activeSuggestions = suggestions;
    if (!suggestions || suggestions.length === 0) {
      hidePopup();
      return;
    }

    if (selectedIndex >= suggestions.length) {
      selectedIndex = 0;
    }

    const popup = createPopup();
    const listEl = popup.querySelector('.dsh-pac-list');
    listEl.innerHTML = '';

    suggestions.forEach((sug, idx) => {
      const li = document.createElement('li');
      li.className = `dsh-pac-item ${idx === selectedIndex ? 'dsh-pac-selected' : ''}`;
      li.dataset.index = idx;
      li.innerHTML = `
        <span class="dsh-pac-item-text">${escapeHtml(sug)}</span>
        <span class="dsh-pac-item-badge">Tab</span>
      `;
      listEl.appendChild(li);
    });

    // 计算弹窗绝对坐标（挂载在输入框上方或光标附近）
    const rect = editorEl.getBoundingClientRect();
    const popupHeight = 220;
    let top = rect.top - popupHeight - 8;
    if (top < 10) {
      top = rect.bottom + 8;
    }
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - 440));

    popup.style.top = `${Math.round(top)}px`;
    popup.style.left = `${Math.round(left)}px`;
    popup.classList.add('dsh-pac-visible');
  }

  function hidePopup() {
    if (popupEl) {
      popupEl.classList.remove('dsh-pac-visible');
    }
    activeSuggestions = [];
    selectedIndex = 0;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 7. 采纳当前高亮的推荐
  function acceptCurrentSuggestion() {
    if (!activeEditor || activeSuggestions.length === 0) return;
    const suggestion = activeSuggestions[selectedIndex];
    if (!suggestion) return;

    // 针对 ContentEditable (Lexical 编辑器)
    if (activeEditor.isContentEditable) {
      activeEditor.focus();
      // 使用 document.execCommand 保证 Lexical 触发内部 input 与 state change 侦听
      const success = document.execCommand('insertText', false, suggestion);
      if (!success) {
        // Fallback: 直接向 selection 添加文本
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const node = document.createTextNode(suggestion);
          range.insertNode(node);
          range.setStartAfter(node);
          range.setEndAfter(node);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          activeEditor.innerText += suggestion;
        }
        activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (activeEditor.tagName === 'TEXTAREA' || activeEditor.tagName === 'INPUT') {
      const val = activeEditor.value;
      const start = activeEditor.selectionStart || val.length;
      const end = activeEditor.selectionEnd || val.length;
      activeEditor.value = val.slice(0, start) + suggestion + val.slice(end);
      activeEditor.selectionStart = activeEditor.selectionEnd = start + suggestion.length;
      activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    hidePopup();
  }

  // 8. 键盘交互监听 (Tab 确认, 上下键选择, Esc 关闭)
  window.addEventListener('keydown', function (e) {
    if (!popupEl || !popupEl.classList.contains('dsh-pac-visible') || activeSuggestions.length === 0) {
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      acceptCurrentSuggestion();
      return false;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      selectedIndex = (selectedIndex + 1) % activeSuggestions.length;
      updateSelectionHighlight();
      return false;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      selectedIndex = (selectedIndex - 1 + activeSuggestions.length) % activeSuggestions.length;
      updateSelectionHighlight();
      return false;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      hidePopup();
      return false;
    }
  }, true);

  function updateSelectionHighlight() {
    if (!popupEl) return;
    const items = popupEl.querySelectorAll('.dsh-pac-item');
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('dsh-pac-selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('dsh-pac-selected');
      }
    });
  }

  // 9. 输入事件防抖监听
  let debounceTimer = null;
  function handleInput(e) {
    const target = e.target;
    if (!target) return;

    const isEditable = target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';
    if (!isEditable) return;

    activeEditor = target;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      let text = '';
      if (target.isContentEditable) {
        text = target.innerText || target.textContent || '';
      } else {
        text = target.value || '';
      }

      // 如果正在输入法拼音合成阶段，不弹出
      if (e.isComposing) {
        hidePopup();
        return;
      }

      // 提取末尾或光标前的内容
      const trimmed = text.trim();
      if (trimmed.length >= 1) {
        const sugs = generateSuggestions(trimmed);
        if (sugs.length > 0) {
          renderSuggestions(target, sugs);
          return;
        }
      }
      hidePopup();
    }, 180);
  }

  document.addEventListener('input', handleInput, true);
  document.addEventListener('compositionend', handleInput, true);

  // 点击外部关闭弹窗
  document.addEventListener('mousedown', function (e) {
    if (popupEl && !popupEl.contains(e.target) && (!activeEditor || !activeEditor.contains(e.target))) {
      hidePopup();
    }
  }, true);

  console.log('✅ [PromptAutocomplete] ChatGPT-style auto-completion successfully attached to DSH!');
})();
