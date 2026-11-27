(function (PP) {
  const { escapeHtml } = PP.md;
  const { showToast } = PP.ui;

  const state = {
    tab: 'positions', // 'positions' | 'domains' | 'hierarchy'
    search: '',
    deptFilter: 'Tất cả',
    domainCat: 'Tất cả',
    viewMode: 'card',
  };

  function renderPositionsTab(positions) {
    const depts = ['Tất cả', ...new Set(positions.map((p) => p.dept))];
    const q = state.search.trim().toLowerCase();
    const filtered = positions.filter((p) => {
      if (state.deptFilter !== 'Tất cả' && p.dept !== state.deptFilter) return false;
      if (q && !`${p.title} ${p.dept} ${p.tasks.join(' ')}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const levels = [...new Set(filtered.map((p) => p.level))].sort((a, b) => a - b);

    return `
      <div class="toolbar">
        <div class="toolbar-group">
          <input id="pos-search" class="input" type="search" placeholder="Tìm chức danh, nhiệm vụ..." value="${escapeHtml(state.search)}" style="min-width:220px;" />
          <div class="segmented">
            <button type="button" data-pos-mode="card" class="${state.viewMode === 'card' ? 'active' : ''}">Xem dạng Card</button>
            <button type="button" data-pos-mode="table" class="${state.viewMode === 'table' ? 'active' : ''}">Bảng &amp; Copy</button>
          </div>
        </div>
        <button id="copy-all-pos-btn" class="btn btn-sm" type="button">📋 Copy ${filtered.length} mục báo cáo</button>
      </div>

      <div class="pill-bar">
        ${depts.map((d) => `<button type="button" class="filter-pill ${state.deptFilter === d ? 'active' : ''}" data-pos-dept="${escapeHtml(d)}">${escapeHtml(d)}</button>`).join('')}
      </div>

      ${
        state.viewMode === 'card'
          ? levels
              .map((lvl) => {
                const group = filtered.filter((p) => p.level === lvl);
                return `
              <div style="margin-bottom:20px;">
                <div style="font-size:12.5px; font-weight:700; color:var(--cyan); margin-bottom:10px;">${escapeHtml(group[0].levelLabel)}</div>
                <div class="three-col">
                  ${group
                    .map(
                      (p) => `
                    <div class="pos-card">
                      <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start; margin-bottom:6px;">
                        <span class="tag tag-gray">${escapeHtml(p.dept)}</span>
                        <button type="button" class="btn btn-sm" data-copy-pos="${escapeHtml(p.id)}">Copy</button>
                      </div>
                      <div style="font-weight:700; font-size:14px; margin-bottom:8px;">${escapeHtml(p.title)}</div>
                      <ul style="margin:0; padding-left:16px; color:var(--text-secondary); font-size:12.5px;">
                        ${p.tasks.map((t) => `<li style="margin-bottom:4px;">${escapeHtml(t)}</li>`).join('')}
                      </ul>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `;
              })
              .join('')
          : `
        <div class="table-wrap">
          <table class="notion-table">
            <thead>
              <tr><th>Cấp bậc</th><th>Chức danh</th><th>Bộ phận</th><th>Nhiệm vụ trọng tâm</th></tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (p) => `
                <tr>
                  <td class="mono">Cấp ${p.level}</td>
                  <td><strong>${escapeHtml(p.title)}</strong></td>
                  <td><span class="tag tag-gray">${escapeHtml(p.dept)}</span></td>
                  <td><ul style="margin:0; padding-left:16px;">${p.tasks.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
      }
    `;
  }

  function renderDomainsTab(domains) {
    const cats = ['Tất cả', 'Kinh doanh', 'Nghiệp vụ Quản trị Chuyên ngành', 'Nghiệp vụ Quản trị Cơ bản'];
    const filtered = state.domainCat === 'Tất cả' ? domains : domains.filter((d) => d.category === state.domainCat);

    return `
      <div class="pill-bar">
        ${cats
          .map((c) => {
            const count = c === 'Tất cả' ? domains.length : domains.filter((d) => d.category === c).length;
            return `<button type="button" class="filter-pill ${state.domainCat === c ? 'active' : ''}" data-dom-cat="${escapeHtml(c)}">${escapeHtml(c)} (${count})</button>`;
          })
          .join('')}
      </div>
      <div class="three-col">
        ${filtered
          .map(
            (d) => `
          <div class="pos-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="code-pill">${escapeHtml(d.code)}</span>
              <span class="tag tag-blue">${escapeHtml(d.category)}</span>
            </div>
            <div style="font-weight:700; font-size:14.5px; margin-bottom:10px;">${escapeHtml(d.name)}</div>
            <div class="roi-box" style="margin-bottom:8px;">
              <div class="roi-title">Văn phòng Công ty</div>
              <div style="font-size:12.5px; color:var(--text-secondary);">${escapeHtml(d.vpDuties)}</div>
            </div>
            <div class="roi-box">
              <div class="roi-title">Showroom / Điểm bán</div>
              <div style="font-size:12.5px; color:var(--text-secondary);">${escapeHtml(d.srDuties)}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  function renderHierarchyTab(org) {
    return `
      <div class="section-heading"><span>🏛️ Mô hình Quản trị Hoạt động — Công ty THACO AUTO Thanh Hóa</span></div>
      <div class="hierarchy-grid">
        ${org.hierarchy
          .map(
            (h) => `
          <div class="hierarchy-step">
            <div class="hierarchy-step-lvl">${escapeHtml(h.level)}</div>
            <div style="font-weight:700; font-size:14px; margin-bottom:6px;">${escapeHtml(h.title)}</div>
            <div style="font-size:12.5px; color:var(--text-secondary);">${escapeHtml(h.desc)}</div>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="panel">
        <div class="section-heading">
          <span>Ma trận Phân công Trách nhiệm (RACI)</span>
          <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:12px; font-weight:400;">
            <span><span class="raci-pill raci-R">R</span> Thực thi</span>
            <span><span class="raci-pill raci-A">A</span> Chịu trách nhiệm cuối</span>
            <span><span class="raci-pill raci-C">C</span> Tham vấn</span>
            <span><span class="raci-pill raci-I">I</span> Nhận thông tin</span>
          </div>
        </div>
        <div class="table-wrap">
          <table class="notion-table">
            <thead>
              <tr>
                <th>Đầu việc Quản trị</th>
                <th style="text-align:center;">Ban Lãnh đạo</th>
                <th style="text-align:center;">NV Kế hoạch</th>
                <th style="text-align:center;">Kinh doanh</th>
                <th style="text-align:center;">Dịch vụ</th>
                <th style="text-align:center;">HC - NS</th>
                <th style="text-align:center;">TC - KT</th>
              </tr>
            </thead>
            <tbody>
              ${org.raci
                .map(
                  (r) => `
                <tr>
                  <td><strong>${escapeHtml(r.task)}</strong></td>
                  ${['BLD', 'KH', 'KD', 'DV', 'HCNS', 'TCKT']
                    .map((k) => `<td style="text-align:center;"><span class="raci-pill raci-${escapeHtml(String(r[k]).charAt(0))}">${escapeHtml(r[k])}</span></td>`)
                    .join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function render(ctx) {
    const { org } = ctx.data;
    return `
      <div class="module-header">
        <div class="module-header-left">
          <div class="module-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="4" rx="1"/><rect x="3" y="17" width="6" height="4" rx="1"/><rect x="15" y="17" width="6" height="4" rx="1"/><path d="M12 7v5M6 17v-5h12v5"/></svg>
          </div>
          <div>
            <h1 class="page-title">Cấu trúc &amp; Chức năng nhiệm vụ</h1>
            <p class="page-subtitle">Chuẩn hóa nhiệm vụ theo chức danh, chức năng các mảng kinh doanh/nghiệp vụ và ma trận phối hợp RACI.</p>
          </div>
        </div>
        <div class="toolbar-group">
          <span class="tag tag-blue">Chức danh: ${org.positions.length}</span>
          <span class="tag tag-green">Mảng chức năng: ${org.domains.length}</span>
        </div>
      </div>

      <div class="subtab-bar">
        <button type="button" class="subtab-btn ${state.tab === 'positions' ? 'active' : ''}" data-org-tab="positions">Nhiệm vụ Chức danh (${org.positions.length})</button>
        <button type="button" class="subtab-btn ${state.tab === 'domains' ? 'active' : ''}" data-org-tab="domains">Chức năng Các mảng Kinh doanh &amp; Nghiệp vụ (${org.domains.length})</button>
        <button type="button" class="subtab-btn ${state.tab === 'hierarchy' ? 'active' : ''}" data-org-tab="hierarchy">Sơ đồ Cấu trúc &amp; Ma trận RACI</button>
      </div>

      ${
        state.tab === 'positions'
          ? renderPositionsTab(org.positions)
          : state.tab === 'domains'
            ? renderDomainsTab(org.domains)
            : renderHierarchyTab(org)
      }
    `;
  }

  function bind(container, ctx) {
    container.querySelectorAll('[data-org-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.tab = btn.getAttribute('data-org-tab');
        ctx.rerender();
      });
    });
    container.querySelector('#pos-search')?.addEventListener('input', (e) => {
      state.search = e.target.value;
      ctx.rerender();
    });
    container.querySelectorAll('[data-pos-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.viewMode = btn.getAttribute('data-pos-mode');
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-pos-dept]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.deptFilter = btn.getAttribute('data-pos-dept');
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-dom-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.domainCat = btn.getAttribute('data-dom-cat');
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-copy-pos]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = ctx.data.org.positions.find((x) => x.id === btn.getAttribute('data-copy-pos'));
        if (!p || !navigator.clipboard) return;
        const txt = `${p.title} (${p.dept}):\n- ${p.tasks.join('\n- ')}`;
        navigator.clipboard.writeText(txt).then(() => showToast(`Đã copy nhiệm vụ: ${p.title}`));
      });
    });
    container.querySelector('#copy-all-pos-btn')?.addEventListener('click', () => {
      if (!navigator.clipboard) return;
      const txt = ctx.data.org.positions
        .map((p) => `${p.title} (${p.dept}):\n- ${p.tasks.join('\n- ')}`)
        .join('\n\n');
      navigator.clipboard.writeText(txt).then(() => showToast('Đã copy toàn bộ bảng chức năng nhiệm vụ'));
    });
  }

  PP.views = PP.views || {};
  PP.views.org = { render, bind };
})((window.PP = window.PP || {}));
