(function (PP) {
  const { escapeHtml } = PP.md;
  const { closeModal, openModal, renderProgress, renderTag, showToast } = PP.ui;

  const DEPTS = ['PKD-PC', 'PKD-CV', 'PDV', 'PTC', 'PKH', 'PNV'];
  const STATUSES = ['Đang thực hiện', 'Cần chú ý / Có rủi ro', 'Đã hoàn thành'];
  const DAILY_GROUPS = [
    'Tất cả',
    'Kinh doanh Xe Du lịch',
    'Kinh doanh Xe Tải Bus',
    'Dịch vụ Phụ tùng Du lịch',
    'Dịch vụ Phụ tùng Tải Bus',
  ];

  const state = {
    tab: 'daily', // 'daily' | 'weekly' | 'goals'
    dailyGroup: 'Tất cả',
    dailySearch: '',
    weekId: 'w3',
    weeklyGroup: 'Tất cả',
    mode: 'table',
    search: '',
    dept: 'all',
    status: 'all',
  };

  function getDailyScheduleInfo(daily) {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0);
    const allDone = (daily.checkpoints || []).length > 0 && daily.checkpoints.every((c) => c.done);
    if (allDone) {
      return { badge: 'Đúng hạn', text: 'Đã hoàn thành đủ đầu mối chốt 19:00 hôm nay.' };
    }
    const diffMs = cutoff.getTime() - now.getTime();
    if (diffMs > 0) {
      const hrs = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      return { badge: 'Cần theo dõi', text: `Hạn chót đánh giá ngày: 19:00 hôm nay (còn ${hrs} giờ ${mins} phút).` };
    }
    return { badge: 'Quá hạn chốt', text: 'Đã qua mốc 19:00 hôm nay — cần rà soát và khóa đánh giá ngày ngay.' };
  }

  function getWeeklyScheduleInfo(weekly) {
    const now = new Date();
    const day = now.getDay(); // 0 Sun, 1 Mon
    const allDone = (weekly.checkpoints || []).length > 0 && weekly.checkpoints.every((c) => c.done);
    if (day === 1) {
      const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
      if (allDone) return { badge: 'Đúng hạn', text: 'Đã hoàn thành đánh giá giao ban Thứ Hai (12:00).' };
      const diffMs = noon.getTime() - now.getTime();
      if (diffMs > 0) {
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        return { badge: 'Cần theo dõi', text: `Hôm nay Thứ Hai: Cần hoàn thành đánh giá tuần trước 12:00 (còn ${hrs} giờ ${mins} phút).` };
      }
      return { badge: 'Quá hạn chốt', text: 'Đã qua 12:00 Thứ Hai — cần hoàn tất biên bản đánh giá tuần.' };
    }
    const daysUntilMon = (8 - day) % 7 || 7;
    const nextMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMon, 12, 0, 0);
    const diffHrs = Math.round((nextMon.getTime() - now.getTime()) / 3600000);
    const dLeft = Math.floor(diffHrs / 24);
    const hLeft = diffHrs % 24;
    return {
      badge: allDone ? 'Đúng hạn' : 'Cần theo dõi',
      text: `Mốc đánh giá tuần tiếp theo: 12:00 Thứ Hai (còn ${dLeft} ngày ${hLeft} giờ).`,
    };
  }

  function formatNum(val) {
    const n = Number(val || 0);
    return Number.isInteger(n) ? n.toLocaleString('vi-VN') : n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  }

  function renderDailyTab(ctx) {
    const daily = ctx.data.tracking?.daily || { items: [], checkpoints: [] };
    const sched = getDailyScheduleInfo(daily);
    const q = state.dailySearch.trim().toLowerCase();
    const filtered = daily.items.filter((it) => {
      if (state.dailyGroup !== 'Tất cả' && it.group !== state.dailyGroup) return false;
      if (q && !`${it.name} ${it.group} ${it.note}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const summaryIds = ['d-dl-sum', 'd-tb-sum', 'd-dvdl-sum', 'd-dvtb-sum'];
    const summaryCards = summaryIds
      .map((id) => daily.items.find((x) => x.id === id))
      .filter(Boolean);

    const doneChk = daily.checkpoints.filter((c) => c.done).length;

    return `
      <div class="strategy-banner">
        <div class="strategy-banner-main">
          <div class="strategy-banner-title">⏱️ ĐÁNH GIÁ THỰC HIỆN HÀNG NGÀY — CHỐT 19:00 MỖI NGÀY</div>
          <div class="strategy-banner-desc">
            ${escapeHtml(sched.text)}<br/>
            Nguồn dữ liệu: <code>${escapeHtml(daily.sourceFile || '')}</code> (Cập nhật số liệu ngày <strong>${escapeHtml(daily.reportDate || '')}</strong>).
          </div>
        </div>
        <div class="strategy-metrics">
          <div>
            ${renderTag(sched.badge)}
            <div class="strategy-metric-lbl" style="margin-top:6px;">Hoàn thành: ${doneChk}/${daily.checkpoints.length} đầu mối</div>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${summaryCards
          .map((c) => {
            const pct = c.monthTarget > 0 ? Math.round((c.monthActual / c.monthTarget) * 100) : 0;
            return `
            <div class="kpi-card">
              <div class="kpi-label">${escapeHtml(c.name)}</div>
              <div class="kpi-value">${formatNum(c.monthActual)} / ${formatNum(c.monthTarget)} <span style="font-size:13px; font-weight:500; color:var(--text-muted);">${escapeHtml(c.unit)}</span></div>
              <div class="kpi-note">Trong ngày: <strong>+${formatNum(c.dayActual)}</strong> • Tồn/HĐ chờ: <strong>${formatNum(c.backlog)}</strong></div>
              <div style="margin-top:8px;">${renderProgress(pct)}</div>
            </div>
          `;
          })
          .join('')}
      </div>

      <div class="toolbar">
        <div class="pill-bar" style="margin-bottom:0;">
          ${DAILY_GROUPS.map((g) => `<button type="button" class="filter-pill ${state.dailyGroup === g ? 'active' : ''}" data-daily-group="${escapeHtml(g)}">${escapeHtml(g)}</button>`).join('')}
        </div>
        <input id="daily-search" class="input" type="search" placeholder="Lọc chỉ tiêu ngày..." value="${escapeHtml(state.dailySearch)}" style="min-width:210px;" />
      </div>

      <div class="table-wrap" style="margin-bottom:18px;">
        <table class="notion-table">
          <thead>
            <tr>
              <th>Chỉ tiêu theo dõi ngày</th>
              <th>Khối / Mảng</th>
              <th>KH Tháng</th>
              <th>TH Ngày</th>
              <th>Lũy kế Tháng</th>
              <th>% TH</th>
              <th>Tồn / HĐ chờ</th>
              <th>Đánh giá &amp; Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map((it) => {
                const pct = it.monthTarget > 0 ? Math.round((it.monthActual / it.monthTarget) * 100) : 0;
                const evalTag = pct >= 85 ? 'Đạt tiến độ' : pct >= 55 ? 'Cần theo dõi' : 'Cảnh báo (< 80%)';
                return `
                <tr data-edit-daily="${escapeHtml(it.id)}" style="cursor:pointer;">
                  <td><strong>${escapeHtml(it.name)}</strong><div class="row-sub">ĐVT: ${escapeHtml(it.unit)}</div></td>
                  <td><span class="tag tag-gray">${escapeHtml(it.group)}</span></td>
                  <td class="mono">${formatNum(it.monthTarget)}</td>
                  <td class="mono" style="color:var(--accent); font-weight:600;">+${formatNum(it.dayActual)}</td>
                  <td class="mono">${formatNum(it.monthActual)}</td>
                  <td>${renderProgress(pct)}</td>
                  <td class="mono">${formatNum(it.backlog)}</td>
                  <td style="min-width:220px;">
                    <div style="margin-bottom:3px;">${renderTag(evalTag)}</div>
                    <div class="row-sub">${escapeHtml(it.note)}</div>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="section-heading">
          <span>☑️ Checklist Hoàn thành Đánh giá Hàng ngày (Chốt 19:00)</span>
          <span class="mono" style="font-size:12px; color:var(--text-muted);">${doneChk}/${daily.checkpoints.length} đã chốt</span>
        </div>
        ${daily.checkpoints
          .map(
            (chk) => `
          <label class="checklist-item ${chk.done ? 'checked' : ''}">
            <input type="checkbox" data-daily-chk="${escapeHtml(chk.id)}" ${chk.done ? 'checked' : ''} />
            <span><strong>[${escapeHtml(chk.deadline)}] ${escapeHtml(chk.dept)}:</strong> ${escapeHtml(chk.task)}</span>
          </label>
        `
          )
          .join('')}
      </div>
    `;
  }

  function renderWeeklyTab(ctx) {
    const weekly = ctx.data.tracking?.weekly || { weeks: [], items: [], checkpoints: [], thresholds: { weeklyRedBelow: 80, monthCumByWeek: {} } };
    const sched = getWeeklyScheduleInfo(weekly);
    const activeWeek = weekly.weeks.find((w) => w.id === state.weekId) || weekly.weeks[0] || { id: 'w1', num: 1, label: 'Tuần 1' };
    const monthThreshold = weekly.thresholds?.monthCumByWeek?.[activeWeek.num] || 75;
    const redBelow = weekly.thresholds?.weeklyRedBelow || 80;

    const groups = ['Tất cả', ...new Set(weekly.items.map((i) => i.group))];
    const filtered = weekly.items.filter((i) => state.weeklyGroup === 'Tất cả' || i.group === state.weeklyGroup);
    const doneChk = weekly.checkpoints.filter((c) => c.done).length;

    return `
      <div class="strategy-banner">
        <div class="strategy-banner-main">
          <div class="strategy-banner-title">📅 ĐÁNH GIÁ THỰC HIỆN TUẦN — CHỐT 12:00 THỨ HAI HÀNG TUẦN</div>
          <div class="strategy-banner-desc">
            ${escapeHtml(sched.text)}<br/>
            Quy tắc cảnh báo chuẩn: Báo <strong>Đỏ</strong> nếu TH Tuần &lt; <strong>${redBelow}%</strong> KH Tuần; mốc lũy kế tháng ${escapeHtml(activeWeek.label)} đạt chuẩn &ge; <strong>${monthThreshold}%</strong>.
          </div>
        </div>
        <div class="strategy-metrics">
          <div>
            ${renderTag(sched.badge)}
            <div class="strategy-metric-lbl" style="margin-top:6px;">Giao ban Thứ Hai: ${doneChk}/${weekly.checkpoints.length} bước</div>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <div class="pill-bar" style="margin-bottom:0;">
          ${weekly.weeks.map((w) => `<button type="button" class="filter-pill ${state.weekId === w.id ? 'active' : ''}" data-week-id="${escapeHtml(w.id)}">${escapeHtml(w.label)}</button>`).join('')}
        </div>
        <div class="pill-bar" style="margin-bottom:0;">
          ${groups.map((g) => `<button type="button" class="filter-pill ${state.weeklyGroup === g ? 'active' : ''}" data-weekly-group="${escapeHtml(g)}">${escapeHtml(g)}</button>`).join('')}
        </div>
      </div>

      <div class="table-wrap" style="margin-bottom:18px;">
        <table class="notion-table">
          <thead>
            <tr>
              <th>Chỉ tiêu theo dõi tuần</th>
              <th>KH Tháng</th>
              <th>KH ${escapeHtml(activeWeek.label.split(' ')[0] + ' ' + activeWeek.num)}</th>
              <th>TH Tuần</th>
              <th>% TH Tuần</th>
              <th>Đánh giá Tuần</th>
              <th>LK đến 22/11</th>
              <th>Ước TH Tháng</th>
              <th>Tham mưu giải pháp</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map((it) => {
                const wk = (it.byWeek && it.byWeek[activeWeek.id]) || { kh: 0, th: 0, contractKh: 0, contractTh: 0 };
                const wkPct = wk.kh > 0 ? Math.round((wk.th / wk.kh) * 100) : wk.th > 0 ? 100 : 0;
                const cumPct = it.monthTarget > 0 ? Math.round((it.cumTo22 / it.monthTarget) * 100) : 0;
                const wkStatus = wk.kh === 0 && wk.th === 0 ? 'Cần theo dõi' : wkPct >= redBelow ? 'Đạt (>= 80%)' : 'Cảnh báo (< 80%)';
                return `
                <tr data-edit-weekly="${escapeHtml(it.id)}" style="cursor:pointer;">
                  <td><strong>${escapeHtml(it.name)}</strong><div class="row-sub">${escapeHtml(it.group)} • ĐVT: ${escapeHtml(it.unit)}</div></td>
                  <td class="mono">${formatNum(it.monthTarget)}</td>
                  <td class="mono">${formatNum(wk.kh)}</td>
                  <td class="mono" style="font-weight:700; color:var(--accent);">${formatNum(wk.th)}</td>
                  <td>${renderProgress(wkPct)}</td>
                  <td>${renderTag(wkStatus)}</td>
                  <td class="mono">${formatNum(it.cumTo22)} (${cumPct}%)</td>
                  <td class="mono">${formatNum(it.estMonth)}</td>
                  <td style="min-width:220px; font-size:12.5px; color:var(--text-secondary);">${escapeHtml(it.advisory)}</td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="section-heading">
          <span>☑️ Checklist Chốt Đánh giá Tuần (Trước 12:00 Thứ Hai)</span>
          <span class="mono" style="font-size:12px; color:var(--text-muted);">${doneChk}/${weekly.checkpoints.length} đã xong</span>
        </div>
        ${weekly.checkpoints
          .map(
            (chk) => `
          <label class="checklist-item ${chk.done ? 'checked' : ''}">
            <input type="checkbox" data-weekly-chk="${escapeHtml(chk.id)}" ${chk.done ? 'checked' : ''} />
            <span><strong>[${escapeHtml(chk.deadline)}] ${escapeHtml(chk.dept)}:</strong> ${escapeHtml(chk.task)}</span>
          </label>
        `
          )
          .join('')}
      </div>
    `;
  }

  function getFilteredGoals(plans) {
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

  function renderGoalsTab(ctx) {
    const filtered = getFilteredGoals(ctx.data.plans);
    return `
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

      ${state.mode === 'table' ? renderGoalsTable(filtered) : renderGoalsKanban(filtered)}
    `;
  }

  function renderGoalsTable(plans) {
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

  function renderGoalsKanban(plans) {
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

  function openDailyEditor(ctx, itemId) {
    const daily = ctx.data.tracking.daily;
    const item = daily.items.find((x) => x.id === itemId);
    if (!item) return;

    const html = `
      <form id="daily-edit-form" class="form-grid">
        <div style="font-weight:700;">${escapeHtml(item.name)} (${escapeHtml(item.group)})</div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="df-day">Thực hiện trong ngày (${escapeHtml(item.unit)})</label>
            <input id="df-day" class="input" type="number" step="any" required value="${escapeHtml(item.dayActual)}" />
          </div>
          <div class="form-field">
            <label for="df-month">Lũy kế tháng (${escapeHtml(item.unit)})</label>
            <input id="df-month" class="input" type="number" step="any" required value="${escapeHtml(item.monthActual)}" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="df-target">Chỉ tiêu tháng</label>
            <input id="df-target" class="input" type="number" step="any" required value="${escapeHtml(item.monthTarget)}" />
          </div>
          <div class="form-field">
            <label for="df-backlog">Tồn / HĐ chưa XHĐ</label>
            <input id="df-backlog" class="input" type="number" step="any" required value="${escapeHtml(item.backlog)}" />
          </div>
        </div>
        <div class="form-field">
          <label for="df-note">Đánh giá &amp; Ghi chú tham mưu (Chốt 19:00)</label>
          <textarea id="df-note" class="textarea" rows="3">${escapeHtml(item.note)}</textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" id="df-cancel">Hủy</button>
          <button type="submit" class="btn btn-blue">Lưu số liệu ngày</button>
        </div>
      </form>
    `;

    openModal('Cập nhật Đánh giá Hàng ngày (19:00)', html, (body) => {
      body.querySelector('#df-cancel').addEventListener('click', closeModal);
      body.querySelector('#daily-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        item.dayActual = Number(body.querySelector('#df-day').value);
        item.monthActual = Number(body.querySelector('#df-month').value);
        item.monthTarget = Number(body.querySelector('#df-target').value);
        item.backlog = Number(body.querySelector('#df-backlog').value);
        item.note = body.querySelector('#df-note').value.trim();
        ctx.commit(`Đã cập nhật số liệu ngày: ${item.name}`);
        closeModal();
      });
    });
  }

  function openWeeklyEditor(ctx, itemId) {
    const weekly = ctx.data.tracking.weekly;
    const item = weekly.items.find((x) => x.id === itemId);
    if (!item) return;
    const wk = item.byWeek[state.weekId] || { kh: 0, th: 0 };

    const html = `
      <form id="weekly-edit-form" class="form-grid">
        <div style="font-weight:700;">${escapeHtml(item.name)} — ${escapeHtml(state.weekId.toUpperCase())}</div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="wf-kh">Kế hoạch tuần (${escapeHtml(item.unit)})</label>
            <input id="wf-kh" class="input" type="number" step="any" required value="${escapeHtml(wk.kh)}" />
          </div>
          <div class="form-field">
            <label for="wf-th">Thực hiện tuần (${escapeHtml(item.unit)})</label>
            <input id="wf-th" class="input" type="number" step="any" required value="${escapeHtml(wk.th)}" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="wf-cum">Lũy kế thực hiện tháng</label>
            <input id="wf-cum" class="input" type="number" step="any" required value="${escapeHtml(item.cumTo22)}" />
          </div>
          <div class="form-field">
            <label for="wf-est">Ước thực hiện cả tháng</label>
            <input id="wf-est" class="input" type="number" step="any" required value="${escapeHtml(item.estMonth)}" />
          </div>
        </div>
        <div class="form-field">
          <label for="wf-adv">Tham mưu giải pháp giao ban Thứ Hai (12:00)</label>
          <textarea id="wf-adv" class="textarea" rows="3">${escapeHtml(item.advisory)}</textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" id="wf-cancel">Hủy</button>
          <button type="submit" class="btn btn-blue">Lưu đánh giá tuần</button>
        </div>
      </form>
    `;

    openModal('Cập nhật Đánh giá Tuần (12:00 Thứ Hai)', html, (body) => {
      body.querySelector('#wf-cancel').addEventListener('click', closeModal);
      body.querySelector('#weekly-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        item.byWeek[state.weekId] = {
          ...wk,
          kh: Number(body.querySelector('#wf-kh').value),
          th: Number(body.querySelector('#wf-th').value),
        };
        item.cumTo22 = Number(body.querySelector('#wf-cum').value);
        item.estMonth = Number(body.querySelector('#wf-est').value);
        item.advisory = body.querySelector('#wf-adv').value.trim();
        ctx.commit(`Đã lưu đánh giá tuần: ${item.name}`);
        closeModal();
      });
    });
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
            <input id="pf-unit" class="input" required value="${escapeHtml(existing.unit)}" />
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

  function render(ctx) {
    return `
      <div class="module-header">
        <div class="module-header-left">
          <div class="module-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>
          </div>
          <div>
            <h1 class="page-title">Quản trị Kế hoạch &amp; Đánh giá Thực hiện</h1>
            <p class="page-subtitle">Theo dõi thực hiện Hàng ngày (chốt 19:00), Đánh giá Tuần (12:00 Thứ Hai) và tham mưu giải pháp điều hành.</p>
          </div>
        </div>
        <button id="add-plan-btn" class="btn btn-blue" type="button">+ Thêm chỉ tiêu kế hoạch</button>
      </div>

      <div class="subtab-bar">
        <button type="button" class="subtab-btn ${state.tab === 'daily' ? 'active' : ''}" data-plans-tab="daily">⏱️ Đánh giá Hàng ngày (Chốt 19:00)</button>
        <button type="button" class="subtab-btn ${state.tab === 'weekly' ? 'active' : ''}" data-plans-tab="weekly">📅 Đánh giá Tuần (12:00 Thứ Hai)</button>
        <button type="button" class="subtab-btn ${state.tab === 'goals' ? 'active' : ''}" data-plans-tab="goals">🎯 Chỉ tiêu &amp; Tham mưu (${ctx.data.plans.length})</button>
      </div>

      ${
        state.tab === 'daily'
          ? renderDailyTab(ctx)
          : state.tab === 'weekly'
            ? renderWeeklyTab(ctx)
            : renderGoalsTab(ctx)
      }
    `;
  }

  function bind(container, ctx) {
    container.querySelectorAll('[data-plans-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.tab = btn.getAttribute('data-plans-tab');
        ctx.rerender();
      });
    });

    container.querySelectorAll('[data-daily-group]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.dailyGroup = btn.getAttribute('data-daily-group');
        ctx.rerender();
      });
    });
    container.querySelector('#daily-search')?.addEventListener('input', (e) => {
      state.dailySearch = e.target.value;
      ctx.rerender();
    });
    container.querySelectorAll('[data-edit-daily]').forEach((row) => {
      row.addEventListener('click', () => openDailyEditor(ctx, row.getAttribute('data-edit-daily')));
    });
    container.querySelectorAll('[data-daily-chk]').forEach((box) => {
      box.addEventListener('change', () => {
        const id = box.getAttribute('data-daily-chk');
        ctx.data.tracking.daily.checkpoints = ctx.data.tracking.daily.checkpoints.map((c) =>
          c.id === id ? { ...c, done: box.checked } : c
        );
        ctx.commit('Đã cập nhật trạng thái chốt 19:00 hàng ngày');
      });
    });

    container.querySelectorAll('[data-week-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.weekId = btn.getAttribute('data-week-id');
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-weekly-group]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.weeklyGroup = btn.getAttribute('data-weekly-group');
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-edit-weekly]').forEach((row) => {
      row.addEventListener('click', () => openWeeklyEditor(ctx, row.getAttribute('data-edit-weekly')));
    });
    container.querySelectorAll('[data-weekly-chk]').forEach((box) => {
      box.addEventListener('change', () => {
        const id = box.getAttribute('data-weekly-chk');
        ctx.data.tracking.weekly.checkpoints = ctx.data.tracking.weekly.checkpoints.map((c) =>
          c.id === id ? { ...c, done: box.checked } : c
        );
        ctx.commit('Đã cập nhật checklist đánh giá tuần 12:00 Thứ Hai');
      });
    });

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
