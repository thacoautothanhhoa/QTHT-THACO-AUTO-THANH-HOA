(function (PP) {
  const { escapeHtml } = PP.md;
  const { renderProgress, renderTag } = PP.ui;

  function render(ctx) {
    const { data } = ctx;
    const totalPlans = data.plans.length;
    const avgProgress = totalPlans
      ? (data.plans.reduce((sum, p) => sum + Number(p.progress || 0), 0) / totalPlans).toFixed(1)
      : '0.0';
    const completedPlans = data.plans.filter((p) => p.status === 'Đã hoàn thành').length;
    const riskPlans = data.plans.filter((p) => p.status === 'Cần chú ý / Có rủi ro').length;

    const vpdhCount = data.sops.filter((s) => s.scope.includes('VPĐH')).length;
    const localCount = data.sops.filter((s) => !s.scope.includes('VPĐH')).length;

    return `
      <div class="module-header">
        <div class="module-header-left">
          <div class="module-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
          </div>
          <div>
            <h1 class="page-title">Tổng quan Quản trị &amp; Điều hành Kế hoạch</h1>
            <p class="page-subtitle">Kỳ đánh giá: <strong>${escapeHtml(data.meta.period)}</strong> • Đơn vị: <strong>${escapeHtml(data.meta.unitName)}</strong></p>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Tỷ lệ hoàn thành mục tiêu</div>
          <div class="kpi-value">${avgProgress}%</div>
          <div style="margin-top:8px;">${renderProgress(avgProgress)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Mục tiêu đang giám sát</div>
          <div class="kpi-value">${totalPlans}</div>
          <div class="kpi-note">${riskPlans} cần chú ý • Đã hoàn thành: ${completedPlans} / ${totalPlans}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">VBQT Văn phòng Điều hành</div>
          <div class="kpi-value">${vpdhCount}</div>
          <div class="kpi-note"><a href="#/sops" style="color:var(--accent); font-weight:600;">Văn bản khung ban hành →</a></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">VBQT THACO AUTO Thanh Hóa</div>
          <div class="kpi-value">${localCount}</div>
          <div class="kpi-note">Văn bản nội bộ áp dụng tại đơn vị</div>
        </div>
      </div>

      <div class="panel">
        <div class="section-heading">
          <span>📌 TRỌNG TÂM THAM MƯU BAN GIÁM ĐỐC THACO AUTO THANH HÓA</span>
          <span class="tag tag-blue">${data.advisories.length} Đề xuất hành động</span>
        </div>
        <div class="three-col">
          ${data.advisories
            .map(
              (adv) => `
            <div class="callout" style="margin:0; flex-direction:column; gap:6px; background:var(--bg-subtle); border-color:var(--border-subtle);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <strong style="font-size:13px;">${escapeHtml(adv.title)}</strong>
                ${renderTag(adv.tag)}
              </div>
              <div style="font-size:12.5px; color:var(--text-secondary);">${escapeHtml(adv.detail)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="panel">
        <div class="section-heading">
          <span>🎯 Tiến độ Mục tiêu Trọng điểm (${escapeHtml(data.meta.period)})</span>
          <a href="#/plans" class="btn btn-sm">Xem tất cả mục tiêu →</a>
        </div>
        <div class="table-wrap">
          <table class="notion-table">
            <thead>
              <tr>
                <th>Mã số</th>
                <th>Mục tiêu trọng tâm</th>
                <th>Phòng ban</th>
                <th>Thực đạt / KH</th>
                <th>Tiến độ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${data.plans
                .slice(0, 4)
                .map(
                  (p) => `
                <tr data-jump-plans style="cursor:pointer;">
                  <td><span class="code-pill">${escapeHtml(p.code)}</span></td>
                  <td><strong>${escapeHtml(p.title)}</strong></td>
                  <td>${escapeHtml(p.dept)}</td>
                  <td class="mono">${escapeHtml(p.actual)} / ${escapeHtml(p.target)} ${escapeHtml(p.unit)}</td>
                  <td>${renderProgress(p.progress)}</td>
                  <td>${renderTag(p.status)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="two-col">
        <div class="panel">
          <div class="section-heading">
            <span>📂 Quy trình Quy định mới nhất (${data.sops.length} văn bản)</span>
            <a href="#/sops" class="btn btn-sm">Xem tất cả</a>
          </div>
          ${data.sops
            .slice(0, 4)
            .map(
              (s) => `
            <div style="padding:10px 0; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
              <div>
                <div style="display:flex; gap:6px; align-items:center; margin-bottom:3px;">
                  <span class="code-pill">${escapeHtml(s.number)}</span>
                  ${renderTag(s.docType)}
                </div>
                <div style="font-weight:600; font-size:13px;">${escapeHtml(s.title)}</div>
                <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">${escapeHtml(s.dept)} • ${escapeHtml(s.issuedDate)}</div>
              </div>
              <a href="#/sops" class="btn btn-sm">Xem</a>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="panel">
          <div class="section-heading">
            <span>☁️ Chuyển đổi số &amp; Tự động hóa tại THACO AUTO Thanh Hóa</span>
            <a href="#/digital" class="btn btn-sm">Chi tiết</a>
          </div>
          ${data.digital.initiatives
            .map(
              (d) => `
            <div style="padding:10px 0; border-bottom:1px solid var(--border-subtle);">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="font-weight:600; font-size:13px;">${escapeHtml(d.name)}</span>
                ${renderTag(d.phase)}
              </div>
              ${renderProgress(d.progress)}
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  function bind(container, ctx) {
    container.querySelectorAll('[data-jump-plans]').forEach((el) => {
      el.addEventListener('click', () => ctx.navigate('#/plans'));
    });
  }

  PP.views = PP.views || {};
  PP.views.overview = { render, bind };
})((window.PP = window.PP || {}));
