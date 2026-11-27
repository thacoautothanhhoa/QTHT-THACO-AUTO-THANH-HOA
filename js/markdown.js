(function (PP) {
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatInline(escapedText) {
    return escapedText
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\$\\rightarrow\$/g, '→');
  }

  const CALLOUT_META = {
    NOTE: { cls: '', icon: '💡', defaultTitle: 'Ghi chú' },
    TIP: { cls: 'tip', icon: '✅', defaultTitle: 'Gợi ý thực hành' },
    IMPORTANT: { cls: '', icon: '📌', defaultTitle: 'Lưu ý trọng tâm' },
    WARNING: { cls: 'warn', icon: '⚠️', defaultTitle: 'Cảnh báo' },
  };

  function renderMarkdown(markdownText) {
    const lines = String(markdownText || '').split(/\r?\n/);
    const out = [];
    let inList = false;

    const closeList = () => {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        closeList();
        continue;
      }

      const calloutMatch = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING)\]\s*(.*)$/i);
      if (calloutMatch) {
        closeList();
        const type = calloutMatch[1].toUpperCase();
        const meta = CALLOUT_META[type] || CALLOUT_META.NOTE;
        const title = escapeHtml(calloutMatch[2] || meta.defaultTitle);
        const bodyLines = [];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
          i++;
          bodyLines.push(formatInline(escapeHtml(lines[i].trim().replace(/^>\s?/, ''))));
        }
        out.push(
          `<div class="callout ${meta.cls}"><span class="callout-icon">${meta.icon}</span><div class="callout-body"><strong>${title}</strong><div>${bodyLines.join('<br/>')}</div></div></div>`
        );
        continue;
      }

      if (line.startsWith('## ')) {
        closeList();
        out.push(`<h2>${formatInline(escapeHtml(line.slice(3)))}</h2>`);
        continue;
      }

      if (line.startsWith('### ')) {
        closeList();
        out.push(`<h3>${formatInline(escapeHtml(line.slice(4)))}</h3>`);
        continue;
      }

      if (line.startsWith('- ')) {
        if (!inList) {
          out.push('<ul>');
          inList = true;
        }
        out.push(`<li>${formatInline(escapeHtml(line.slice(2)))}</li>`);
        continue;
      }

      closeList();
      out.push(`<p>${formatInline(escapeHtml(line))}</p>`);
    }

    closeList();
    return out.join('\n');
  }

  PP.md = { escapeHtml, renderMarkdown };
})((window.PP = window.PP || {}));
