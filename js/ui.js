(function (PP) {
  const { escapeHtml } = PP.md;

  const STATUS_TAG_MAP = {
    'Đã hoàn thành': 'tag-green',
    'Hoàn thành': 'tag-green',
    'Tuân thủ': 'tag-green',
    'Chuyển đổi số': 'tag-blue',
    'Đang thực hiện': 'tag-blue',
    'Đang triển khai': 'tag-blue',
    'Cần chú ý / Có rủi ro': 'tag-red',
    'Cấp thiết': 'tag-red',
    'Thử nghiệm (Pilot)': 'tag-purple',
    'Khảo sát & Thiết kế': 'tag-amber',
    'Quy định': 'tag-blue',
    'Quy trình / SOP': 'tag-green',
    'Thông báo': 'tag-amber',
    'Hướng dẫn': 'tag-purple',
    'Quy chế': 'tag-red',
    'Ủy quyền': 'tag-blue',
    'Pháp lý / ĐKKD': 'tag-purple',
    'Khác': 'tag-gray',
    'Đạt (>= 80%)': 'tag-green',
    'Đạt tiến độ': 'tag-green',
    'Cần theo dõi': 'tag-amber',
    'Cảnh báo (< 80%)': 'tag-red',
    'Quá hạn chốt': 'tag-red',
    'Đúng hạn': 'tag-green',
  };

  function renderTag(label) {
    const cls = STATUS_TAG_MAP[label] || 'tag-gray';
    return `<span class="tag ${cls}">${escapeHtml(label)}</span>`;
  }

  function renderProgress(value) {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    let barCls = '';
    if (pct >= 100) barCls = 'done';
    else if (pct < 60) barCls = 'danger';
    else if (pct < 86) barCls = 'warn';

    return `
      <div class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill ${barCls}" style="width: ${pct}%"></div>
        </div>
        <span class="progress-text">${pct}%</span>
      </div>
    `;
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function openModal(title, bodyHtml, onMount) {
    const modal = document.getElementById('app-modal');
    const titleEl = document.getElementById('app-modal-title');
    const bodyEl = document.getElementById('app-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    modal.classList.remove('hidden');
    if (typeof onMount === 'function') onMount(bodyEl);
  }

  function closeModal() {
    const modal = document.getElementById('app-modal');
    if (modal) modal.classList.add('hidden');
  }

  PP.ui = { renderTag, renderProgress, showToast, openModal, closeModal };
})((window.PP = window.PP || {}));
