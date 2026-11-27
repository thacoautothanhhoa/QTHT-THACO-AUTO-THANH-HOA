(function (PP) {
  const { escapeHtml } = PP.md;
  const { closeModal, openModal, renderProgress, renderTag, showToast } = PP.ui;

  const DEPTS = ['PKD-PC', 'PKD-CV', 'PDV', 'PTC', 'PKH', 'PNV'];
  const STATUSES = ['Đang thực hiện', 'Cần chú ý / Có rủi ro', 'Đã hoàn thành'];

  const state = {
    mode: 'table',
    search: '',
    dept: 'all',
    status: 'all',
  };

  function getFiltered(plans) {
    const q = state.search.trim().toLowerCase();
    return plans.filter((p) => {
      if (state.dept !== 'all' && p.dept !== state.dept) return false;
      if (state.status !== 'all' && p.status !== state.status) return false;
      if (q) {
        const hay = `${p.code} ${p.title} ${p.dept} ${p.advisorySolution}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderTable(plans) {
    if (!plans.length) {
      return `<div class="panel" style="text-align:center; color:var(--text-muted); padding:32px;">Không có chỉ tiêu kế hoạch phù hợp bộ lọc.</div>`;
    }
    return `
      <div class="table-wrap">
        <table class="notion-table">
          <thead>
            <tr>
              <th>Mã số</th>
              <th>Tên chỉ tiêu / Mục tiêu</th>
              <th>Phòng ban</th>
              <th>Kỳ báo cáo</th>
              <th>Kế hoạch / Thực đạt</th>
              <th>Tiến độ (%)</th>
              <th>Trạng thái</th>
              <th>Tham mưu giải pháp</th>
            </tr>
          </thead>
          <tbody>
            ${plans
              .map(
                (p) => `
              <tr>
                <td><span class="code-pill">${escapeHtml(p.code)}</span></td>
                <td style="min-width:210px;">
                  <div class="row-title" data-edit-plan="${escapeHtml(p.id)}">${escapeHtml(p.title)}</div>
                  <div class="row-sub">Hạn: <span class="mono">${escapeHtml(p.deadline)}</span></div>
                </td>
                <td><span class="tag tag-gray">${escapeHtml(p.dept)}</span></td>
                <td style="white-space:nowrap;">${escapeHtml(p.period)}</td>
                <td class="mono" style="white-space:nowrap;">${escapeHtml(p.actual)} / ${escapeHtml(p.target)} ${escapeHtml(p.unit)}</td>
                <td>${renderProgress(p.progress)}</td>
                <td>${renderTag(p.status)}</td>
                <td style="min-width:220px; font-size:12.5px; color:var(--text-secondary);">${escapeHtml(p.advisorySolution)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderKanban(plans) {
    return `
      <div class="kanban-grid">
        ${STATUSES.map((status) => {
          const items = plans.filter((p) => p.status === status);
          return `
            <div class="kanban-col">
              <div class="kanban-col-head">
                ${renderTag(status)}
                <span class="mono" style="color:var(--text-muted); font-weight:600;">${items.length}</span>
              </div>
              ${
                items.length
                  ? items
                      .map(
                        (p) => `
                    <div class="kanban-card" data-edit-plan="${escapeHtml(p.id)}">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span class="code-pill">${escapeHtml(p.code)}</span>
                        <span class="tag tag-gray">${escapeHtml(p.dept)}</span>
                      </div>
                      <div style="font-weight:600; font-size:13px; margin-bottom:6px;">${escapeHtml(p.title)}</div>
                      <div class="mono" style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">
                        Đạt: ${escapeHtml(p.actual)} / ${escapeHtml(p.target)} ${escapeHtml(p.unit)}
                      </div>
                      ${renderProgress(p.progress)}
                      ${
                        p.advisorySolution
                          ? `<div style="font-size:12px; color:var(--text-secondary); margin-top:8px; padding-top:7px; border-top:1px solid var(--border-subtle);">💡 ${escapeHtml(p.advisorySolution)}</div>`
                          : ''
                      }
                    </div>
                  `
                      )
                      .join('')
                  : `<div style="font-size:12px; color:var(--text-faint); padding:8px 4px;">Chưa có chỉ tiêu</div>`
              }
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function render(ctx) {
    const filtered = getFiltered(ctx.data.plans);
    return `
      <div class="module-header">
        <div class="module-header-left">
          <div class="module-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>
          </div>
          <div>
            <h1 class="page-title">Quản trị Kế hoạch &amp; Tiến độ Mục tiêu</h1>
            <p class="page-subtitle">Theo dõi thực đạt chỉ tiêu theo từng phòng ban, cảnh báo rủi ro và tham mưu giải pháp điều hành.</p>
          </div>
        </div>
        <button id="add-plan-btn" class="btn btn-blue" type="button">+ Thêm chỉ tiêu kế hoạch</button>
      </div>

      <div class="toolbar">
        <div class="toolbar-group">
          <input id="plan-search" class="input" type="search" placeholder="Lọc mã hoặc tên chỉ tiêu..." value="${escapeHtml(state.search)}" style="min-width:210px;" />
          <select id="plan-dept-filter" class="select" aria-label="Lọc theo phòng ban">
            <option value="all" ${state.dept === 'all' ? 'selected' : ''}>Tất cả phòng ban</option>
            ${DEPTS.map((d) => `<option value="${escapeHtml(d)}" ${state.dept === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
          </select>
          <select id="plan-status-filter" class="select" aria-label="Lọc theo trạng thái">
            <option value="all" ${state.status === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
            ${STATUSES.map((s) => `<option value="${escapeHtml(s)}" ${state.status === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
          </select>
        </div>

        <div class="segmented" role="group" aria-label="Chế độ xem">
          <button type="button" data-view-mode="table" class="${state.mode === 'table' ? 'active' : ''}">Bảng chi tiết</button>
          <button type="button" data-view-mode="kanban" class="${state.mode === 'kanban' ? 'active' : ''}">Bảng Kanban</button>
        </div>
      </div>

      ${state.mode === 'table' ? renderTable(filtered) : renderKanban(filtered)}
    `;
  }

  function openPlanEditor(ctx, planId) {
    const isNew = !planId;
    const existing = isNew
      ? {
          id: `kh-${Date.now()}`,
          code: `KH-${Math.floor(100 + Math.random() * 899)}`,
          title: '',
          dept: 'PKD-PC',
          period: ctx.data.meta.period,
          target: 100,
          actual: 0,
          unit: 'Xe',
          deadline: '2026-11-30',
          progress: 0,
          status: 'Đang thực hiện',
          advisorySolution: '',
        }
      : ctx.data.plans.find((p) => p.id === planId);

    if (!existing) return;

    const html = `
      <form id="plan-form" class="form-grid">
        <div class="form-row-2">
          <div class="form-field">
            <label for="pf-code">Mã chỉ tiêu</label>
            <input id="pf-code" class="input" required value="${escapeHtml(existing.code)}" />
          </div>
          <div class="form-field">
            <label for="pf-dept">Phòng ban</label>
            <select id="pf-dept" class="select">
              ${DEPTS.map((d) => `<option value="${escapeHtml(d)}" ${existing.dept === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-field">
          <label for="pf-title">Tên mục tiêu / Chỉ tiêu kế hoạch</label>
          <input id="pf-title" class="input" required value="${escapeHtml(existing.title)}" />
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="pf-target">Mục tiêu (Số)</label>
            <input id="pf-target" class="input" type="number" step="any" required value="${escapeHtml(existing.target)}" />
          </div>
          <div class="form-field">
            <label for="pf-actual">Thực đạt (Số)</label>
            <input id="pf-actual" class="input" type="number" step="any" required value="${escapeHtml(existing.actual)}" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="pf-unit">Đơn vị tính</label>
            <input id="pf-unit" class="input" required value="${escapeHtml(existing.unit)}" placeholder="Xe, Lượt xe, Triệu VNĐ, %..." />
          </div>
          <div class="form-field">
            <label for="pf-deadline">Hạn chót</label>
            <input id="pf-deadline" class="input" type="date" required value="${escapeHtml(existing.deadline)}" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="pf-status">Trạng thái</label>
            <select id="pf-status" class="select">
              ${STATUSES.map((s) => `<option value="${escapeHtml(s)}" ${existing.status === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
            </select>
          </div>
          <div class="form-field">
            <label for="pf-progress">Tiến độ (%): <span id="pf-progress-label">${existing.progress}%</span></label>
            <input id="pf-progress" type="range" min="0" max="100" value="${existing.progress}" style="width:100%; margin-top:8px;" />
          </div>
        </div>
        <div class="form-field">
          <label for="pf-solution">Ý kiến Tham mưu của Trợ lý Kế hoạch</label>
          <textarea id="pf-solution" class="textarea" rows="3">${escapeHtml(existing.advisorySolution)}</textarea>
        </div>
        <div class="form-actions" style="justify-content: space-between;">
          ${!isNew ? `<button id="pf-delete-btn" type="button" class="btn" style="color:var(--tag-red-text);">Xóa chỉ tiêu</button>` : `<span></span>`}
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn" id="pf-cancel-btn">Hủy</button>
            <button type="submit" class="btn btn-blue">${isNew ? 'Tạo mục tiêu' : 'Lưu thay đổi'}</button>
          </div>
        </div>
      </form>
    `;

    openModal(isNew ? 'Chỉ tiêu Kế hoạch mới' : `Chi tiết ${existing.code}`, html, (body) => {
      const range = body.querySelector('#pf-progress');
      const rangeLabel = body.querySelector('#pf-progress-label');
      const targetIn = body.querySelector('#pf-target');
      const actualIn = body.querySelector('#pf-actual');

      const syncAutoPct = () => {
        const t = Number(targetIn.value);
        const a = Number(actualIn.value);
        if (t > 0) {
          const pct = Math.min(100, Math.round((a / t) * 100));
          range.value = String(pct);
          rangeLabel.textContent = `${pct}%`;
        }
      };
      targetIn.addEventListener('input', syncAutoPct);
      actualIn.addEventListener('input', syncAutoPct);
      range.addEventListener('input', () => {
        rangeLabel.textContent = `${range.value}%`;
      });

      body.querySelector('#pf-cancel-btn').addEventListener('click', closeModal);
      body.querySelector('#pf-delete-btn')?.addEventListener('click', () => {
        ctx.data.plans = ctx.data.plans.filter((p) => p.id !== existing.id);
        ctx.commit('Đã xóa chỉ tiêu kế hoạch');
        closeModal();
      });

      body.querySelector('#plan-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const updated = {
          ...existing,
          code: body.querySelector('#pf-code').value.trim(),
          dept: body.querySelector('#pf-dept').value,
          title: body.querySelector('#pf-title').value.trim(),
          target: Number(targetIn.value),
          actual: Number(actualIn.value),
          unit: body.querySelector('#pf-unit').value.trim(),
          deadline: body.querySelector('#pf-deadline').value,
          status: body.querySelector('#pf-status').value,
          progress: Number(range.value),
          advisorySolution: body.querySelector('#pf-solution').value.trim(),
        };
        if (isNew) {
          ctx.data.plans.unshift(updated);
          showToast('Đã tạo chỉ tiêu kế hoạch mới');
        } else {
          ctx.data.plans = ctx.data.plans.map((p) => (p.id === updated.id ? updated : p));
          showToast(`Đã cập nhật ${updated.code}`);
        }
        ctx.commit();
        closeModal();
      });
    });
  }

  function bind(container, ctx) {
    container.querySelector('#plan-search')?.addEventListener('input', (e) => {
      state.search = e.target.value;
      ctx.rerender();
    });
    container.querySelector('#plan-dept-filter')?.addEventListener('change', (e) => {
      state.dept = e.target.value;
      ctx.rerender();
    });
    container.querySelector('#plan-status-filter')?.addEventListener('change', (e) => {
      state.status = e.target.value;
      ctx.rerender();
    });
    container.querySelectorAll('[data-view-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.mode = btn.getAttribute('data-view-mode');
        ctx.rerender();
      });
    });
    container.querySelector('#add-plan-btn')?.addEventListener('click', () => openPlanEditor(ctx, null));
    container.querySelectorAll('[data-edit-plan]').forEach((el) => {
      el.addEventListener('click', () => openPlanEditor(ctx, el.getAttribute('data-edit-plan')));
    });
  }

  PP.views = PP.views || {};
  PP.views.plans = { render, bind, openPlanEditor };
})((window.PP = window.PP || {}));
