(function (PP) {
  const { escapeHtml } = PP.md;
  const { closeModal, openModal, renderProgress, renderTag, showToast } = PP.ui;

  function render(ctx) {
    const { strategyTitle, strategyDesc, initiatives } = ctx.data.digital;
    const avgPct = initiatives.length
      ? Math.round(initiatives.reduce((s, i) => s + Number(i.progress || 0), 0) / initiatives.length)
      : 0;

    return `
      <div class="module-header">
        <div class="module-header-left">
          <div class="module-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          </div>
          <div>
            <h1 class="page-title">Chuyển đổi số &amp; Sáng kiến Cải tiến Vận hành</h1>
            <p class="page-subtitle">Đầu mối tham gia triển khai công tác chuyển đổi số tại THACO AUTO Thanh Hóa, tối ưu năng suất và hiện đại hóa quản trị.</p>
          </div>
        </div>
        <button id="add-dx-btn" class="btn btn-blue" type="button">+ Đề xuất sáng kiến mới</button>
      </div>

      <div class="strategy-banner">
        <div class="strategy-banner-main">
          <div class="strategy-banner-title">💡 ${escapeHtml(strategyTitle)}</div>
          <div class="strategy-banner-desc">${escapeHtml(strategyDesc)}</div>
        </div>
        <div class="strategy-metrics">
          <div>
            <div class="strategy-metric-val">${initiatives.length}/${initiatives.length}</div>
            <div class="strategy-metric-lbl">Đề án đang chạy</div>
          </div>
          <div>
            <div class="strategy-metric-val">~${avgPct}%</div>
            <div class="strategy-metric-lbl">Tiến độ tổng thể</div>
          </div>
        </div>
      </div>

      <div class="three-col">
        ${initiatives
          .map(
            (item) => `
          <div class="dx-card">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <span class="code-pill">${escapeHtml(item.code)}</span>
              ${renderTag(item.phase)}
            </div>
            <div style="font-weight:700; font-size:15px; line-height:1.35;">${escapeHtml(item.name)}</div>
            <div style="font-size:12.5px; color:var(--text-secondary);">${escapeHtml(item.description)}</div>

            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:4px;">
                <span>Tiến độ thực hiện</span>
                <span class="mono" style="color:var(--cyan); font-weight:600;">${item.progress}%</span>
              </div>
              ${renderProgress(item.progress)}
              <input type="range" min="0" max="100" step="5" value="${item.progress}" data-dx-progress="${escapeHtml(item.id)}" style="width:100%; margin-top:6px;" aria-label="Điều chỉnh tiến độ ${escapeHtml(item.name)}" />
            </div>

            <div class="roi-box">
              <div class="roi-title">Hiệu quả định lượng (ROI / Tiết kiệm):</div>
              ${item.roiMetrics
                .map(
                  (m) => `
                <div class="roi-row">
                  <span style="color:var(--text-muted);">${escapeHtml(m.label)}:</span>
                  <span class="roi-val">${escapeHtml(m.value)}</span>
                </div>
              `
                )
                .join('')}
            </div>

            <div style="display:flex; justify-content:space-between; gap:8px; font-size:12px; margin-top:auto; padding-top:6px; border-top:1px solid var(--border-subtle);">
              <span style="color:var(--text-muted);">Phụ trách: ${escapeHtml(item.owner)}</span>
              <span class="mono" style="color:var(--accent); font-weight:600;">Mục tiêu: ${escapeHtml(item.targetDate)}</span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  function openDxModal(ctx) {
    const html = `
      <form id="dx-form" class="form-grid">
        <div class="form-row-2">
          <div class="form-field">
            <label for="dx-code">Mã sáng kiến</label>
            <input id="dx-code" class="input" required value="DX-NEW-0${ctx.data.digital.initiatives.length + 1}" />
          </div>
          <div class="form-field">
            <label for="dx-phase">Giai đoạn</label>
            <select id="dx-phase" class="select">
              <option value="Khảo sát & Thiết kế">Khảo sát &amp; Thiết kế</option>
              <option value="Đang triển khai">Đang triển khai</option>
              <option value="Thử nghiệm (Pilot)">Thử nghiệm (Pilot)</option>
            </select>
          </div>
        </div>
        <div class="form-field">
          <label for="dx-name">Tên sáng kiến / Đề án chuyển đổi số</label>
          <input id="dx-name" class="input" required />
        </div>
        <div class="form-field">
          <label for="dx-desc">Mô tả giải pháp &amp; phạm vi áp dụng</label>
          <textarea id="dx-desc" class="textarea" rows="3" required></textarea>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="dx-owner">Phụ trách chính</label>
            <input id="dx-owner" class="input" required value="Trợ lý Kế hoạch" />
          </div>
          <div class="form-field">
            <label for="dx-date">Mục tiêu hoàn thành</label>
            <input id="dx-date" class="input" type="date" required value="2027-01-31" />
          </div>
        </div>
        <div class="form-field">
          <label for="dx-roi">Hiệu quả định lượng dự kiến</label>
          <input id="dx-roi" class="input" placeholder="VD: Giảm 50% thời gian tổng hợp số liệu" required />
        </div>
        <div class="form-actions">
          <button type="button" id="dx-cancel" class="btn">Hủy</button>
          <button type="submit" class="btn btn-blue">Thêm sáng kiến</button>
        </div>
      </form>
    `;

    openModal('Đề xuất sáng kiến Chuyển đổi số mới', html, (body) => {
      body.querySelector('#dx-cancel').addEventListener('click', closeModal);
      body.querySelector('#dx-form').addEventListener('submit', (e) => {
        e.preventDefault();
        ctx.data.digital.initiatives.push({
          id: `dx-${Date.now()}`,
          code: body.querySelector('#dx-code').value.trim(),
          name: body.querySelector('#dx-name').value.trim(),
          phase: body.querySelector('#dx-phase').value,
          progress: 20,
          description: body.querySelector('#dx-desc').value.trim(),
          roiMetrics: [{ label: 'Hiệu quả dự kiến', value: body.querySelector('#dx-roi').value.trim() }],
          owner: body.querySelector('#dx-owner').value.trim(),
          targetDate: body.querySelector('#dx-date').value,
        });
        ctx.commit('Đã thêm sáng kiến chuyển đổi số');
        closeModal();
      });
    });
  }

  function bind(container, ctx) {
    container.querySelector('#add-dx-btn')?.addEventListener('click', () => openDxModal(ctx));
    container.querySelectorAll('[data-dx-progress]').forEach((slider) => {
      slider.addEventListener('change', () => {
        const id = slider.getAttribute('data-dx-progress');
        const val = Number(slider.value);
        ctx.data.digital.initiatives = ctx.data.digital.initiatives.map((item) =>
          item.id === id ? { ...item, progress: val } : item
        );
        ctx.commit('Đã cập nhật tiến độ sáng kiến');
      });
    });
  }

  PP.views = PP.views || {};
  PP.views.digital = { render, bind };
})((window.PP = window.PP || {}));
