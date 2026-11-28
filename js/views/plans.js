(function (PP) {
  const { escapeHtml } = PP.md;
  const { closeModal, openModal, renderProgress, renderTag, showToast } = PP.ui;

  const DEPTS = ['PKD-PC', 'PKD-CV', 'PDV', 'PTC', 'PKH', 'PNV'];
  const STATUSES = ['Đang thực hiện', 'Cần chú ý / Có rủi ro', 'Đã hoàn thành'];
  const DAILY_GROUPS = [
    'Tất cả',
    'Kinh doanh Xe Du lịch',
    'Kinh doanh Xe Tải Bus',
    'Kinh doanh Xe DL đã QSD',
    'Dịch vụ Phụ tùng Du lịch',
    'Dịch vụ Phụ tùng Tải Bus',
  ];

  const ARRAY_META = [
    { key: 'Kinh doanh Xe Du lịch', source: 'vehicle', summaryId: 'v-dl-sum', unit: 'Xe', isVehicle: true },
    { key: 'Kinh doanh Xe Tải Bus', source: 'vehicle', summaryId: 'v-tb-sum', unit: 'Xe', isVehicle: true },
    { key: 'Kinh doanh Xe DL đã QSD', source: 'vehicle', summaryId: 'v-qsd-sum', unit: 'Xe', isVehicle: true },
    { key: 'Dịch vụ Phụ tùng Du lịch', source: 'dvpt', summaryId: 'dv-dl-sum', unit: 'Tr.đ', isVehicle: false },
    { key: 'Dịch vụ Phụ tùng Tải Bus', source: 'dvpt', summaryId: 'dv-tb-sum', unit: 'Tr.đ', isVehicle: false },
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

  function parseDateDMY(str) {
    const m = String(str || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return new Date(2026, 10, 27);
    return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  }

  function getMonthTimeProgress(reportDateStr) {
    const d = parseDateDMY(reportDateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const totalDays = new Date(year, month, 0).getDate();
    const pct = Number(((day / totalDays) * 100).toFixed(1));
    return { day, month, year, totalDays, pct };
  }

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
      return { badge: 'Cần theo dõi', text: `Mốc chốt báo cáo ngày: 19:00 hàng ngày (còn ${hrs} giờ ${mins} phút).` };
    }
    return { badge: 'Quá hạn chốt', text: 'Đã qua mốc 19:00 — kiểm tra các mảng chưa cập nhật và hoàn tất đánh giá ngày.' };
  }

  function getWeeklyScheduleInfo(weekly) {
    const now = new Date();
    const day = now.getDay();
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
    return {
      badge: allDone ? 'Đúng hạn' : 'Cần theo dõi',
      text: `Mốc đánh giá tuần tiếp theo: 12:00 Thứ Hai (còn ${Math.floor(diffHrs / 24)} ngày ${diffHrs % 24} giờ).`,
    };
  }

  function formatNum(val) {
    if (val === '' || val === null || val === undefined) return '';
    const n = Number(val);
    if (Number.isNaN(n)) return String(val);
    return Number.isInteger(n) ? n.toLocaleString('vi-VN') : n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  }

  function formatCellZeroBlank(val) {
    const n = Number(val || 0);
    return n === 0 ? '' : formatNum(n);
  }

  function calcPct(actual, target) {
    const t = Number(target || 0);
    const a = Number(actual || 0);
    if (t <= 0) return 0;
    return Math.round((a / t) * 100);
  }

  /**
   * So sánh từng mảng với số liệu ngày hôm trước để phát hiện mảng chưa cập nhật báo cáo ngày.
   */
  function evaluateArrayFreshness(daily) {
    const prevArrays = daily.previousDay?.arrays || {};
    const confirmedZero = new Set(daily.confirmedZeroArrays || []);

    return ARRAY_META.map((meta) => {
      const list = meta.source === 'vehicle' ? daily.vehicleRows || [] : daily.dvptRows || [];
      const row = list.find((r) => r.id === meta.summaryId) || {};
      const prev = prevArrays[meta.key] || { prevMonthActual: 0, prevContractActual: 0, prevDvscActual: 0 };

      const currMain = Number(row.monthActual || 0);
      const currSub = Number(meta.isVehicle ? row.contractActual || 0 : row.cumDvsc || 0);
      const prevSub = Number(meta.isVehicle ? prev.prevContractActual || 0 : prev.prevDvscActual || 0);
      const dayMain = Number(row.dayActual || 0);
      const daySub = Number(meta.isVehicle ? row.dayContract || 0 : row.dayDvsc || 0);

      const deltaMain = currMain - Number(prev.prevMonthActual || 0);
      const deltaSub = currSub - prevSub;
      const hasChange = deltaMain !== 0 || deltaSub !== 0;
      const isConfirmedZero = confirmedZero.has(meta.key);
      const updated = hasChange || isConfirmedZero;

      return {
        ...meta,
        row,
        prev,
        prevSub,
        currMain,
        currSub,
        dayMain,
        daySub,
        deltaMain,
        deltaSub,
        hasChange,
        isConfirmedZero,
        updated,
      };
    });
  }

  function renderVisualDailyDashboard(daily, vFiltered, dFiltered) {
    const timeInfo = getMonthTimeProgress(daily.reportDate);
    const vRows = daily.vehicleRows || [];
    const dRows = daily.dvptRows || [];
    const vBrandIds = ['v-kia', 'v-mazda', 'v-peugeot', 'v-bmw', 'v-tn', 'v-tt', 'v-tnang', 'v-bus'];
    const vBrands = vRows.filter((r) => vBrandIds.includes(r.id));
    const dvItems = dRows.filter((r) => !r.isSummary && !r.isSubRow && r.monthTarget > 0);
    const srVehicleMeta = [
      { id: 'v-sr-th', label: 'SR Thanh Hóa (DL)' },
      { id: 'v-sr-hh', label: 'SR Hoằng Hóa (DL)' },
      { id: 'v-sr-tx', label: 'SR Thọ Xuân (DL)' },
      { id: 'v-tb-hh', label: 'SR Hoằng Hóa (TB)' },
      { id: 'v-tb-tx', label: 'SR Thọ Xuân (TB)' },
    ];
    const srDvptMeta = [
      { id: 'dv-dl-xth', label: 'Xưởng Thanh Hóa (DL)' },
      { id: 'dv-dl-xtx', label: 'Xưởng Thọ Xuân (DL)' },
      { id: 'dv-tb-xhh', label: 'Xưởng Hoằng Hóa (TB)' },
      { id: 'dv-tb-xtx', label: 'Xưởng Thọ Xuân (TB)' },
    ];

    const renderPctPill = (pct) => {
      if (pct === null || pct === undefined) return '';
      const cls = pct >= 85 ? 'tag-green' : pct >= 55 ? 'tag-amber' : 'tag-red';
      return `<span class="tag ${cls}" style="padding:1px 6px; font-size:11px;">${pct}%</span>`;
    };

    const renderDualBarRow = (cfg) => {
      const pFill = Math.min(100, cfg.primaryPct);
      const sFill = Math.min(100, cfg.secondaryPct || 0);
      return `
        <div class="bar-row" ${cfg.editAttr}>
          <div class="bar-row-head">
            <span class="bar-row-name" title="${escapeHtml(cfg.name)}">${escapeHtml(cfg.name)}</span>
            <div class="bar-row-stats">
              ${cfg.dayBlueText ? `<span class="delta-pill" style="padding:0 5px; font-size:10px;">${escapeHtml(cfg.dayBlueText)}</span>` : ''}
              ${cfg.dayGreenText ? `<span class="delta-pill green" style="padding:0 5px; font-size:10px;">${escapeHtml(cfg.dayGreenText)}</span>` : ''}
              ${cfg.backlogText ? `<span class="tag tag-amber" style="padding:0 5px; font-size:10px;">${escapeHtml(cfg.backlogText)}</span>` : ''}
            </div>
          </div>
          <div class="dual-track">
            <div class="bar-metric-row">
              <div class="mini-track" title="${escapeHtml(cfg.primaryLabel)}: ${cfg.primaryPct}%">
                <div class="mini-fill primary" style="width:${pFill}%;"></div>
                <div class="pacing-marker" style="left:${timeInfo.pct}%;"></div>
              </div>
              <div class="bar-metric-val"><strong style="color:#00529b;">${escapeHtml(cfg.primaryLabel)}</strong> <strong>${cfg.primaryValText}</strong> (${cfg.primaryPct}%)</div>
            </div>
            ${
              cfg.hasSecondary
                ? `
              <div class="bar-metric-row">
                <div class="mini-track" title="${escapeHtml(cfg.secondaryLabel)}: ${cfg.secondaryPct}%">
                  <div class="mini-fill secondary" style="width:${sFill}%;"></div>
                  <div class="pacing-marker" style="left:${timeInfo.pct}%;"></div>
                </div>
                <div class="bar-metric-val"><strong style="color:#16a34a;">${escapeHtml(cfg.secondaryLabel)}</strong> <strong>${cfg.secondaryValText}</strong> (${cfg.secondaryPct}%)</div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `;
    };

    const srVehicleRows = srVehicleMeta
      .map((m) => {
        const r = vRows.find((x) => x.id === m.id);
        if (!r) return '';
        return renderDualBarRow({
          editAttr: `data-edit-vehicle="${escapeHtml(r.id)}"`,
          name: m.label,
          dayBlueText: r.dayContract > 0 ? `+${r.dayContract} Ký` : '',
          dayGreenText: r.dayActual > 0 ? `+${r.dayActual} XHĐ` : '',
          backlogText: r.backlog > 0 ? `Tồn ${r.backlog}` : '',
          primaryLabel: 'Ký',
          primaryValText: `${r.contractActual}/${r.contractTarget}`,
          primaryPct: calcPct(r.contractActual, r.contractTarget),
          hasSecondary: true,
          secondaryLabel: 'XHĐ',
          secondaryValText: `${r.monthActual}/${r.monthTarget}`,
          secondaryPct: calcPct(r.monthActual, r.monthTarget),
        });
      })
      .join('');

    const srDvptRows = srDvptMeta
      .map((m) => {
        const r = dRows.find((x) => x.id === m.id);
        if (!r) return '';
        return renderDualBarRow({
          editAttr: `data-edit-dvpt="${escapeHtml(r.id)}"`,
          name: m.label,
          dayBlueText: r.dayActual > 0 ? `+${formatNum(r.dayActual)} tr` : '',
          dayGreenText: r.dayDvsc > 0 ? `+${formatNum(r.dayDvsc)} SC` : '',
          backlogText: r.backlog > 0 ? `Tồn ${formatNum(r.backlog)}` : '',
          primaryLabel: 'Tổng',
          primaryValText: `${formatNum(r.monthActual)}/${formatNum(r.monthTarget)}`,
          primaryPct: calcPct(r.monthActual, r.monthTarget),
          hasSecondary: r.planDvsc > 0,
          secondaryLabel: 'DVSC',
          secondaryValText: `${formatNum(r.cumDvsc)}/${formatNum(r.planDvsc)}`,
          secondaryPct: calcPct(r.cumDvsc, r.planDvsc),
        });
      })
      .join('');

    return `
      <div class="report-frame-box" id="daily-report-frame">
        <!-- 3 bảng trực quan đặt sát nhau: Dòng xe | DVPT | Showroom (SR) -->
        <div class="visual-grid-3">
          <div class="visual-panel">
            <div class="visual-panel-title">
              <span>🚗 Tiến độ Dòng xe (Ký HĐ vs XHĐ)</span>
              <div class="pacing-legend">
                <span><span class="dot-swatch" style="background:#00529b;"></span>Ký HĐ</span>
                <span><span class="dot-swatch" style="background:#16a34a;"></span>XHĐ</span>
                <span><span class="dot-swatch" style="background:#dc2626;"></span>Mốc ${timeInfo.pct}%</span>
              </div>
            </div>
            ${vBrands
              .map((r) =>
                renderDualBarRow({
                  editAttr: `data-edit-vehicle="${escapeHtml(r.id)}"`,
                  name: r.name,
                  dayBlueText: r.dayContract > 0 ? `+${r.dayContract} Ký` : '',
                  dayGreenText: r.dayActual > 0 ? `+${r.dayActual} XHĐ` : '',
                  backlogText: r.backlog > 0 ? `Tồn ${r.backlog}` : '',
                  primaryLabel: 'Ký',
                  primaryValText: `${r.contractActual}/${r.contractTarget}`,
                  primaryPct: calcPct(r.contractActual, r.contractTarget),
                  hasSecondary: true,
                  secondaryLabel: 'XHĐ',
                  secondaryValText: `${r.monthActual}/${r.monthTarget}`,
                  secondaryPct: calcPct(r.monthActual, r.monthTarget),
                })
              )
              .join('')}
          </div>

          <div class="visual-panel">
            <div class="visual-panel-title">
              <span>🔧 Tiến độ DVPT theo Xưởng / Mảng</span>
              <div class="pacing-legend">
                <span><span class="dot-swatch" style="background:#00529b;"></span>Tổng DT</span>
                <span><span class="dot-swatch" style="background:#16a34a;"></span>DT DVSC</span>
                <span><span class="dot-swatch" style="background:#dc2626;"></span>Mốc ${timeInfo.pct}%</span>
              </div>
            </div>
            ${dvItems
              .map((r) =>
                renderDualBarRow({
                  editAttr: `data-edit-dvpt="${escapeHtml(r.id)}"`,
                  name: r.name,
                  dayBlueText: r.dayActual > 0 ? `+${formatNum(r.dayActual)} tr` : '',
                  dayGreenText: r.dayDvsc > 0 ? `+${formatNum(r.dayDvsc)} SC` : '',
                  backlogText: r.backlog > 0 ? `Tồn ${formatNum(r.backlog)}` : '',
                  primaryLabel: 'Tổng',
                  primaryValText: `${formatNum(r.monthActual)}/${formatNum(r.monthTarget)}`,
                  primaryPct: calcPct(r.monthActual, r.monthTarget),
                  hasSecondary: r.planDvsc > 0,
                  secondaryLabel: 'DVSC',
                  secondaryValText: `${formatNum(r.cumDvsc)}/${formatNum(r.planDvsc)}`,
                  secondaryPct: calcPct(r.cumDvsc, r.planDvsc),
                })
              )
              .join('')}
          </div>

          <div class="visual-panel">
            <div class="visual-panel-title">
              <span>🏢 Thực hiện theo Showroom (SR)</span>
              <div class="pacing-legend">
                <span><span class="dot-swatch" style="background:#00529b;"></span>Ký/Tổng</span>
                <span><span class="dot-swatch" style="background:#16a34a;"></span>XHĐ/DVSC</span>
                <span><span class="dot-swatch" style="background:#dc2626;"></span>Mốc ${timeInfo.pct}%</span>
              </div>
            </div>
            <div class="visual-sub-divider">🚗 KD Xe theo Showroom</div>
            ${srVehicleRows}
            <div class="visual-sub-divider">🔧 Xưởng DVPT theo Showroom</div>
            ${srDvptRows}
          </div>
        </div>

        <!-- Bảng chi tiết đầy đủ cột cho Kinh doanh Xe (cố định cột tên, chia màu nhóm rõ ràng) -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin:8px 0 6px;">
          <div style="font-weight:700; font-size:13px; color:var(--accent);">
            🚗 CHI TIẾT KINH DOANH XE THEO NGÀY &amp; LŨY KẾ (Nhấn vào dòng để cập nhật số liệu)
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-sm" data-capture-section="vehicle">📸 Chụp ảnh KD Xe (.png)</button>
            <button type="button" class="btn btn-blue btn-sm" data-capture-section="all">📸 Chụp toàn bộ BC (.png)</button>
          </div>
        </div>
        <div class="table-wrap" style="margin-bottom:10px;">
          <table class="exec-table">
            <thead>
              <tr>
                <th rowspan="2" class="col-name">Sản phẩm / Showroom</th>
                <th rowspan="2">TH T10<br/>/25</th>
                <th rowspan="2">Tồn<br/>T11</th>
                <th colspan="5" class="grp-plan">Chỉ tiêu Tháng ${timeInfo.month}.${timeInfo.year}</th>
                <th colspan="5" class="grp-day">Thực hiện ngày ${escapeHtml(daily.reportDate)}</th>
                <th colspan="7" class="grp-cum">Lũy kế tháng đến ${escapeHtml(daily.reportDate)}</th>
                <th colspan="4" class="grp-rem">Còn lại / HĐ tồn</th>
              </tr>
              <tr>
                <th class="grp-plan">KHQT</th><th class="grp-plan">GDTD</th><th class="grp-plan">Ký HĐ</th><th class="grp-plan">XHĐ</th><th class="grp-plan">ĐKM</th>
                <th class="grp-day">KHQT</th><th class="grp-day">GDTD</th><th class="grp-day">Ký HĐ</th><th class="grp-day">XHĐ</th><th class="grp-day">ĐKM</th>
                <th class="grp-cum">KHQT</th><th class="grp-cum">GDTD</th><th class="grp-cum">Ký HĐ</th><th class="grp-cum">%TH</th><th class="grp-cum">XHĐ</th><th class="grp-cum">%TH</th><th class="grp-cum">ĐKM</th>
                <th class="grp-rem">KHQT</th><th class="grp-rem">GDTD</th><th class="grp-rem">HĐ tồn</th><th class="grp-rem">Chưa ĐK</th>
              </tr>
            </thead>
            <tbody>
              ${vFiltered
                .map((r) => {
                  const cPct = r.contractTarget > 0 ? Math.round((r.contractActual / r.contractTarget) * 100) : null;
                  const xPct = r.monthTarget > 0 ? Math.round((r.monthActual / r.monthTarget) * 100) : null;
                  const trCls = r.isSummary ? 'is-summary' : r.isSubRow ? 'is-sub' : '';
                  return `
                  <tr class="${trCls}" data-edit-vehicle="${escapeHtml(r.id)}" style="cursor:pointer;">
                    <td class="col-name">${escapeHtml(r.name)}</td>
                    <td class="mono">${formatCellZeroBlank(r.thT10)}</td>
                    <td class="mono">${formatCellZeroBlank(r.carryOver)}</td>
                    <td class="mono">${formatCellZeroBlank(r.planKhqt)}</td>
                    <td class="mono">${formatCellZeroBlank(r.planGdtd)}</td>
                    <td class="mono">${formatCellZeroBlank(r.contractTarget)}</td>
                    <td class="mono">${formatCellZeroBlank(r.monthTarget)}</td>
                    <td class="mono">${formatCellZeroBlank(r.planDkm)}</td>
                    <td class="mono">${formatCellZeroBlank(r.dayKhqt)}</td>
                    <td class="mono">${formatCellZeroBlank(r.dayGdtd)}</td>
                    <td>${r.dayContract ? `<span class="delta-pill">+${formatNum(r.dayContract)}</span>` : ''}</td>
                    <td>${r.dayActual ? `<span class="delta-pill green">+${formatNum(r.dayActual)}</span>` : ''}</td>
                    <td class="mono">${formatCellZeroBlank(r.dayDkm)}</td>
                    <td class="mono">${formatCellZeroBlank(r.cumKhqt)}</td>
                    <td class="mono">${formatCellZeroBlank(r.cumGdtd)}</td>
                    <td class="mono" style="font-weight:700;">${formatCellZeroBlank(r.contractActual)}</td>
                    <td>${renderPctPill(cPct)}</td>
                    <td class="mono" style="font-weight:700;">${formatCellZeroBlank(r.monthActual)}</td>
                    <td>${renderPctPill(xPct)}</td>
                    <td class="mono">${formatCellZeroBlank(r.cumDkm)}</td>
                    <td class="mono">${formatCellZeroBlank(r.remKhqt)}</td>
                    <td class="mono">${formatCellZeroBlank(r.remGdtd)}</td>
                    <td>${r.backlog ? `<span class="tag ${r.backlog > 10 ? 'tag-amber' : 'tag-gray'}" style="padding:1px 6px; font-size:11px;">${formatNum(r.backlog)}</span>` : ''}</td>
                    <td class="mono">${formatCellZeroBlank(r.xhdNotDkm)}</td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Bảng chi tiết đầy đủ cột cho Kinh doanh DVPT -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin:8px 0 8px;">
          <div style="font-weight:700; font-size:13px; color:var(--accent);">
            🔧 CHI TIẾT KINH DOANH DVPT THEO NGÀY &amp; LŨY KẾ (Đvt: Triệu đồng)
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-sm" data-capture-section="dvpt">📸 Chụp ảnh DVPT (.png)</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="exec-table">
            <thead>
              <tr>
                <th rowspan="2" class="col-name">Mảng / Xưởng Dịch vụ</th>
                <th rowspan="2">TH T10<br/>/25</th>
                <th rowspan="2">Tồn<br/>T11</th>
                <th colspan="3" class="grp-plan">Chỉ tiêu Tháng ${timeInfo.month}.${timeInfo.year}</th>
                <th colspan="3" class="grp-day">Thực hiện ngày ${escapeHtml(daily.reportDate)}</th>
                <th colspan="5" class="grp-cum">Lũy kế tháng đến ${escapeHtml(daily.reportDate)}</th>
                <th colspan="2" class="grp-rem">Tồn xưởng</th>
              </tr>
              <tr>
                <th class="grp-plan">Lượt xe</th><th class="grp-plan">Tổng DT DVPT</th><th class="grp-plan">DT DVSC</th>
                <th class="grp-day">Lượt xe</th><th class="grp-day">Tổng DT</th><th class="grp-day">DT DVSC</th>
                <th class="grp-cum">Lượt xe</th><th class="grp-cum">Tổng DT DVPT</th><th class="grp-cum">%TH</th><th class="grp-cum">DT DVSC</th><th class="grp-cum">%TH</th>
                <th class="grp-rem">Lượt tồn</th><th class="grp-rem">DT tồn</th>
              </tr>
            </thead>
            <tbody>
              ${dFiltered
                .map((r) => {
                  const dtPct = r.monthTarget > 0 ? Math.round((r.monthActual / r.monthTarget) * 100) : null;
                  const scPct = r.planDvsc > 0 ? Math.round((r.cumDvsc / r.planDvsc) * 100) : null;
                  const trCls = r.isSummary ? 'is-summary' : r.isSubRow ? 'is-sub' : '';
                  return `
                  <tr class="${trCls}" data-edit-dvpt="${escapeHtml(r.id)}" style="cursor:pointer;">
                    <td class="col-name">${escapeHtml(r.name)}</td>
                    <td class="mono">${formatCellZeroBlank(r.thT10)}</td>
                    <td class="mono">${formatCellZeroBlank(r.carryOver)}</td>
                    <td class="mono">${formatCellZeroBlank(r.planVisits)}</td>
                    <td class="mono">${formatCellZeroBlank(r.monthTarget)}</td>
                    <td class="mono">${formatCellZeroBlank(r.planDvsc)}</td>
                    <td class="mono">${formatCellZeroBlank(r.dayVisits)}</td>
                    <td>${r.dayActual ? `<span class="delta-pill">+${formatNum(r.dayActual)}</span>` : ''}</td>
                    <td>${r.dayDvsc ? `<span class="delta-pill green">+${formatNum(r.dayDvsc)}</span>` : ''}</td>
                    <td class="mono">${formatCellZeroBlank(r.cumVisits)}</td>
                    <td class="mono" style="font-weight:700;">${formatCellZeroBlank(r.monthActual)}</td>
                    <td>${renderPctPill(dtPct)}</td>
                    <td class="mono" style="font-weight:700;">${formatCellZeroBlank(r.cumDvsc)}</td>
                    <td>${renderPctPill(scPct)}</td>
                    <td class="mono">${formatCellZeroBlank(r.backlogVisits)}</td>
                    <td>${r.backlog ? `<span class="tag ${r.backlog > 200 ? 'tag-amber' : 'tag-gray'}" style="padding:1px 6px; font-size:11px;">${formatNum(r.backlog)}</span>` : ''}</td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Vẽ khung hình Báo cáo Ngày ra Canvas độ phân giải cao và tải xuống file PNG.
   */
  function captureDailySnapshotPng(daily, section = 'all') {
    const vRows = daily.vehicleRows || [];
    const dRows = daily.dvptRows || [];
    const timeInfo = getMonthTimeProgress(daily.reportDate);
    const includeVehicle = section === 'all' || section === 'vehicle';
    const includeDvpt = section === 'all' || section === 'dvpt';

    const scale = 2;
    const width = 1284;
    const rowH = 22;
    const headerH = 44;
    const topBannerH = 48;
    const gap = 24;
    const vehicleBlockH = includeVehicle ? headerH + vRows.length * rowH : 0;
    const dvptBlockH = includeDvpt ? headerH + dRows.length * rowH : 0;
    const middleGap = includeVehicle && includeDvpt ? gap : 0;
    const height = topBannerH + vehicleBlockH + middleGap + dvptBlockH + 28;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header Title
    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
    ctx.fillText('THACO AUTO THANH HÓA', 16, 28);
    ctx.fillStyle = '#00529b';
    const sectionSubtitle = section === 'vehicle' ? '   |   Kinh doanh Xe' : section === 'dvpt' ? '   |   Kinh doanh DVPT' : '';
    ctx.fillText(
      `Ngày báo cáo: ${daily.reportDate}   |   Ngày ${timeInfo.day}/${timeInfo.totalDays} tháng (${timeInfo.pct}% thời gian)${sectionSubtitle}`,
      260,
      28
    );

    function drawGridTable(startY, colWidths, topHeaders, subHeaders, rows, drawRowCells) {
      let y = startY;
      const totalW = colWidths.reduce((a, b) => a + b, 0);
      const startX = 12;

      // Top merged header row
      let x = startX;
      topHeaders.forEach((h) => {
        const w = colWidths.slice(h.start, h.start + h.span).reduce((a, b) => a + b, 0);
        ctx.fillStyle = h.bg || '#fff2cc';
        ctx.fillRect(x, y, w, 22);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(x, y, w, 22);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10.5px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(h.label, x + w / 2, y + 14, w - 6);
        x += w;
      });
      y += 22;

      // Sub header row
      x = startX;
      subHeaders.forEach((lbl, idx) => {
        const w = colWidths[idx];
        ctx.fillStyle = idx === 1 ? '#ffff00' : '#fff2cc';
        ctx.fillRect(x, y, w, 22);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(x, y, w, 22);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = idx === 0 ? 'left' : 'center';
        ctx.fillText(lbl, idx === 0 ? x + 5 : x + w / 2, y + 14, w - 6);
        x += w;
      });
      y += 22;

      // Body rows
      rows.forEach((r) => {
        const cells = drawRowCells(r);
        x = startX;
        cells.forEach((cell, idx) => {
          const w = colWidths[idx];
          ctx.fillStyle = r.isSummary ? '#dbeafe' : idx === 1 ? '#ffff99' : '#ffffff';
          ctx.fillRect(x, y, w, rowH);
          ctx.strokeStyle = '#94a3b8';
          ctx.strokeRect(x, y, w, rowH);

          ctx.fillStyle = cell.color || '#111827';
          ctx.font = `${r.isSummary || cell.bold ? 'bold' : r.isSubRow && idx === 0 ? 'italic' : 'normal'} 10.5px "Segoe UI", Arial, sans-serif`;
          ctx.textAlign = idx === 0 ? 'left' : 'center';
          const padX = idx === 0 ? (r.isSubRow ? x + 16 : x + 5) : x + w / 2;
          ctx.fillText(String(cell.text ?? ''), padX, y + 14.5, w - 6);
          x += w;
        });
        y += rowH;
      });

      ctx.strokeStyle = '#00529b';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(startX, startY, totalW, y - startY);
      ctx.lineWidth = 1;
      return y;
    }

    const vWidths = [156, 46, 46, 46, 46, 52, 42, 42, 42, 42, 52, 40, 40, 46, 46, 52, 42, 42, 42, 42, 46, 46, 54, 54];
    // Total vWidths = 1260; scale slightly or pad to fit nicely inside 1480
    let currentY = topBannerH;
    if (includeVehicle) {
      currentY = drawGridTable(
        currentY,
        vWidths,
        [
          { label: 'KINH DOANH XE (xe)', start: 0, span: 1, bg: '#e8eef7' },
          { label: 'TH T10/25', start: 1, span: 1, bg: '#ffff00' },
          { label: 'Tồn T11', start: 2, span: 1 },
          { label: `Chỉ tiêu Tháng ${timeInfo.month}.${timeInfo.year}`, start: 3, span: 5 },
          { label: 'Thực hiện ngày', start: 8, span: 5 },
          { label: `Lũy kế tháng ${timeInfo.month} đến ${daily.reportDate}`, start: 13, span: 7 },
          { label: 'Còn lại', start: 20, span: 4 },
        ],
        ['Nội dung', 'T10/25', 'Tồn', 'KHQT', 'GDTD', 'Ký HĐ', 'XHĐ', 'ĐKM', 'KHQT', 'GDTD', 'Ký HĐ', 'XHĐ', 'ĐKM', 'KHQT', 'GDTD', 'Ký HĐ', '%TH', 'XHĐ', '%TH', 'ĐKM', 'KHQT', 'GDTD', 'HĐ tồn', 'ChưaĐK'],
        vRows,
        (r) => {
          const cPct = r.contractTarget > 0 ? Math.round((r.contractActual / r.contractTarget) * 100) : null;
          const xPct = r.monthTarget > 0 ? Math.round((r.monthActual / r.monthTarget) * 100) : null;
          return [
            { text: r.name, bold: r.isSummary },
            { text: formatCellZeroBlank(r.thT10), bold: true },
            { text: formatCellZeroBlank(r.carryOver) },
            { text: formatCellZeroBlank(r.planKhqt) },
            { text: formatCellZeroBlank(r.planGdtd) },
            { text: formatCellZeroBlank(r.contractTarget) },
            { text: formatCellZeroBlank(r.monthTarget) },
            { text: formatCellZeroBlank(r.planDkm) },
            { text: formatCellZeroBlank(r.dayKhqt) },
            { text: formatCellZeroBlank(r.dayGdtd) },
            { text: formatCellZeroBlank(r.dayContract) },
            { text: formatCellZeroBlank(r.dayActual) },
            { text: formatCellZeroBlank(r.dayDkm) },
            { text: formatCellZeroBlank(r.cumKhqt) },
            { text: formatCellZeroBlank(r.cumGdtd) },
            { text: formatCellZeroBlank(r.contractActual) },
            { text: cPct !== null ? `${cPct}%` : '', color: cPct !== null && cPct < 80 ? '#dc2626' : '#15803d', bold: true },
            { text: formatCellZeroBlank(r.monthActual) },
            { text: xPct !== null ? `${xPct}%` : '', color: xPct !== null && xPct < 80 ? '#dc2626' : '#15803d', bold: true },
            { text: formatCellZeroBlank(r.cumDkm) },
            { text: formatCellZeroBlank(r.remKhqt) },
            { text: formatCellZeroBlank(r.remGdtd) },
            { text: formatCellZeroBlank(r.backlog), bold: true },
            { text: formatCellZeroBlank(r.xhdNotDkm) },
          ];
        }
      );
      if (includeDvpt) currentY += gap;
    }

    const dWidths = [180, 62, 62, 68, 84, 72, 68, 72, 72, 72, 84, 58, 72, 58, 72, 72];
    if (includeDvpt) {
      drawGridTable(
        currentY,
        dWidths,
        [
          { label: 'KINH DOANH DVPT (Triệu đồng)', start: 0, span: 1, bg: '#e8eef7' },
          { label: 'TH T10/25', start: 1, span: 1, bg: '#ffff00' },
          { label: 'Tồn T11', start: 2, span: 1 },
          { label: `Chỉ tiêu Tháng ${timeInfo.month}.${timeInfo.year}`, start: 3, span: 3 },
          { label: 'Thực hiện ngày', start: 6, span: 3 },
          { label: `Lũy kế tháng ${timeInfo.month} đến ${daily.reportDate}`, start: 9, span: 5 },
          { label: 'Tồn xưởng', start: 14, span: 2 },
        ],
        ['Nội dung', 'T10/25', 'Tồn', 'Lượt xe', 'Tổng DT', 'DVSC', 'Lượt', 'Tổng DT', 'DVSC', 'Lượt', 'Tổng DT', '%TH', 'DVSC', '%TH', 'Lượt tồn', 'DT tồn'],
        dRows,
        (r) => {
          const dtPct = r.monthTarget > 0 ? Math.round((r.monthActual / r.monthTarget) * 100) : null;
          const scPct = r.planDvsc > 0 ? Math.round((r.cumDvsc / r.planDvsc) * 100) : null;
          return [
            { text: r.name, bold: r.isSummary },
            { text: formatCellZeroBlank(r.thT10), bold: true },
            { text: formatCellZeroBlank(r.carryOver) },
            { text: formatCellZeroBlank(r.planVisits) },
            { text: formatCellZeroBlank(r.monthTarget) },
            { text: formatCellZeroBlank(r.planDvsc) },
            { text: formatCellZeroBlank(r.dayVisits) },
            { text: formatCellZeroBlank(r.dayActual) },
            { text: formatCellZeroBlank(r.dayDvsc) },
            { text: formatCellZeroBlank(r.cumVisits) },
            { text: formatCellZeroBlank(r.monthActual) },
            { text: dtPct !== null ? `${dtPct}%` : '', color: dtPct !== null && dtPct < 80 ? '#dc2626' : '#15803d', bold: true },
            { text: formatCellZeroBlank(r.cumDvsc) },
            { text: scPct !== null ? `${scPct}%` : '', color: scPct !== null && scPct < 80 ? '#dc2626' : '#15803d', bold: true },
            { text: formatCellZeroBlank(r.backlogVisits) },
            { text: formatCellZeroBlank(r.backlog) },
          ];
        }
      );
    }

    const suffix = section === 'vehicle' ? '_KDXe' : section === 'dvpt' ? '_DVPT' : '';
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `BaoCaoNgay_THACO_ThanhHoa${suffix}_${daily.reportDate.replace(/\//g, '-')}.png`;
    a.click();
    const labelMap = { vehicle: 'Kinh doanh Xe', dvpt: 'Kinh doanh DVPT', all: 'Khung hình Báo cáo Ngày' };
    showToast(`Đã chụp và tải ảnh ${labelMap[section] || 'Báo cáo Ngày'} (.png)`);
  }

  function renderDailyTab(ctx) {
    const daily = ctx.data.tracking?.daily || { vehicleRows: [], dvptRows: [], checkpoints: [] };
    const sched = getDailyScheduleInfo(daily);
    const timeInfo = getMonthTimeProgress(daily.reportDate);
    const freshness = evaluateArrayFreshness(daily);
    const updatedCount = freshness.filter((f) => f.updated).length;
    const allArraysReady = updatedCount === freshness.length;

    const dlSum = (daily.vehicleRows || []).find((r) => r.id === 'v-dl-sum') || {};
    const tbSum = (daily.vehicleRows || []).find((r) => r.id === 'v-tb-sum') || {};
    const qsdSum = (daily.vehicleRows || []).find((r) => r.id === 'v-qsd-sum') || {};
    const dvDlSum = (daily.dvptRows || []).find((r) => r.id === 'dv-dl-sum') || {};
    const dvTbSum = (daily.dvptRows || []).find((r) => r.id === 'dv-tb-sum') || {};

    const totalVehiclesContractPlan = Number(dlSum.contractTarget || 0) + Number(tbSum.contractTarget || 0) + Number(qsdSum.contractTarget || 0);
    const totalVehiclesContractAct = Number(dlSum.contractActual || 0) + Number(tbSum.contractActual || 0) + Number(qsdSum.contractActual || 0);
    const totalVehiclesXhdPlan = Number(dlSum.monthTarget || 0) + Number(tbSum.monthTarget || 0) + Number(qsdSum.monthTarget || 0);
    const totalVehiclesXhdAct = Number(dlSum.monthActual || 0) + Number(tbSum.monthActual || 0) + Number(qsdSum.monthActual || 0);
    const totalBacklogHd = Number(dlSum.backlog || 0) + Number(tbSum.backlog || 0) + Number(qsdSum.backlog || 0);

    const q = state.dailySearch.trim().toLowerCase();
    const vFiltered = (daily.vehicleRows || []).filter((r) => {
      if (state.dailyGroup !== 'Tất cả' && r.group !== state.dailyGroup) return false;
      if (q && !`${r.name} ${r.group}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dFiltered = (daily.dvptRows || []).filter((r) => {
      if (state.dailyGroup !== 'Tất cả' && r.group !== state.dailyGroup) return false;
      if (q && !`${r.name} ${r.group}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const doneChk = (daily.checkpoints || []).filter((c) => c.done).length;

    return `
      <!-- Banner Ngày báo cáo, Tiến độ ngày trong tháng & Chốt 19:00 -->
      <div class="strategy-banner">
        <div class="strategy-banner-main">
          <div class="strategy-banner-title">⏱️ ĐÁNH GIÁ BÁO CÁO NGÀY — CHỐT HOÀN THÀNH 19:00 HÀNG NGÀY</div>
          <div class="strategy-banner-desc">
            <strong>Ngày báo cáo:</strong> <span class="mono">${escapeHtml(daily.reportDate)}</span>${daily.syncedAt ? ` &nbsp;•&nbsp; <strong>Đồng bộ Excel:</strong> <span class="mono">${escapeHtml(daily.syncedAt)}</span>` : ''} &nbsp;•&nbsp;
            <strong>Thời gian tháng đã qua:</strong> Ngày <strong>${timeInfo.day} / ${timeInfo.totalDays}</strong> ngày (<strong>${timeInfo.pct}%</strong> số ngày trong tháng ${timeInfo.month}/${timeInfo.year}).<br/>
            ${escapeHtml(sched.text)}
          </div>
          <div style="margin-top:8px; max-width:440px;">
            <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:3px;">Tiến độ thời gian tháng (${timeInfo.day}/${timeInfo.totalDays} ngày):</div>
            ${renderProgress(timeInfo.pct)}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
          ${renderTag(sched.badge)}
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button id="edit-report-date-btn" class="btn btn-sm" type="button">📅 Đổi ngày BC</button>
            <button id="save-prev-baseline-btn" class="btn btn-sm" type="button" title="Lưu số liệu hiện tại làm mốc ngày hôm trước để đối chiếu cho ngày mai">💾 Lưu mốc hôm nay → Hôm qua</button>
          </div>
        </div>
      </div>

      <!-- Tiêu đề Báo cáo Ngày ngay trên đầu 4 ô đánh giá theo mảng -->
      <div class="report-frame-head" style="margin: 0 0 6px; padding: 6px 10px; background: var(--bg-elevated); border: 1px solid var(--border-strong); border-radius: var(--radius-md);">
        <div>
          THACO AUTO THANH HÓA &nbsp;|&nbsp; BÁO CÁO NGÀY ${escapeHtml(daily.reportDate)}
          <span class="tag tag-blue" style="margin-left:6px; font-size:11px; padding:1px 7px;">Ngày ${timeInfo.day}/${timeInfo.totalDays} (${timeInfo.pct}% tháng)</span>
        </div>
      </div>

      <!-- 4 Ô Tổng Theo Mảng (co gọn để đẩy toàn bộ 3 bảng phía dưới lên trọn khung hình) -->
      <div class="kpi-grid compact-kpi">
        ${[
          {
            title: '🚗 KD xe Du lịch',
            delta: `Ngày: +${dlSum.dayContract} Ký / +${dlSum.dayActual} XHĐ`,
            rows: [
              { lbl: 'Ký HĐ mới', val: `${dlSum.contractActual} / ${dlSum.contractTarget} xe`, pct: calcPct(dlSum.contractActual, dlSum.contractTarget) },
              { lbl: 'Xuất hóa đơn (XHĐ)', val: `${dlSum.monthActual} / ${dlSum.monthTarget} xe`, pct: calcPct(dlSum.monthActual, dlSum.monthTarget) },
            ],
            backlogLbl: 'HĐ tồn (chưa XHĐ)',
            backlogVal: `${dlSum.backlog} HĐ`,
          },
          {
            title: '🚚 Kinh doanh xe Tải Bus',
            delta: `Ngày: +${tbSum.dayContract} Ký / +${tbSum.dayActual} XHĐ`,
            rows: [
              { lbl: 'Ký HĐ mới', val: `${tbSum.contractActual} / ${tbSum.contractTarget} xe`, pct: calcPct(tbSum.contractActual, tbSum.contractTarget) },
              { lbl: 'Xuất hóa đơn (XHĐ)', val: `${tbSum.monthActual} / ${tbSum.monthTarget} xe`, pct: calcPct(tbSum.monthActual, tbSum.monthTarget) },
            ],
            backlogLbl: 'HĐ tồn (chưa XHĐ)',
            backlogVal: `${tbSum.backlog} HĐ`,
          },
          {
            title: '🔧 KD DVPT xe Du lịch',
            delta: `Ngày: +${formatNum(dvDlSum.dayActual)} tr.đ`,
            rows: [
              { lbl: 'Tổng DT DVPT', val: `${formatNum(dvDlSum.monthActual)} / ${formatNum(dvDlSum.monthTarget)} tr.đ`, pct: calcPct(dvDlSum.monthActual, dvDlSum.monthTarget) },
              { lbl: 'DT DVSC', val: `${formatNum(dvDlSum.cumDvsc)} / ${formatNum(dvDlSum.planDvsc)} tr.đ`, pct: calcPct(dvDlSum.cumDvsc, dvDlSum.planDvsc) },
            ],
            backlogLbl: 'Tồn xưởng',
            backlogVal: `${formatNum(dvDlSum.backlog)} tr.đ (${formatNum(dvDlSum.backlogVisits)} lượt)`,
          },
          {
            title: '🛠️ KD DVPT xe Tải Bus',
            delta: `Ngày: +${formatNum(dvTbSum.dayActual)} tr.đ`,
            rows: [
              { lbl: 'Tổng DT DVPT', val: `${formatNum(dvTbSum.monthActual)} / ${formatNum(dvTbSum.monthTarget)} tr.đ`, pct: calcPct(dvTbSum.monthActual, dvTbSum.monthTarget) },
              { lbl: 'DT DVSC', val: `${formatNum(dvTbSum.cumDvsc)} / ${formatNum(dvTbSum.planDvsc)} tr.đ`, pct: calcPct(dvTbSum.cumDvsc, dvTbSum.planDvsc) },
            ],
            backlogLbl: 'Tồn xưởng',
            backlogVal: `${formatNum(dvTbSum.backlog)} tr.đ (${formatNum(dvTbSum.backlogVisits)} lượt)`,
          },
        ]
          .map(
            (card) => `
          <div class="kpi-card">
            <div class="kpi-domain-title">
              <span>${card.title}</span>
              <span class="mono kpi-domain-delta">${card.delta}</span>
            </div>
            ${card.rows
              .map(
                (row, idx) => `
              <div class="kpi-sub-block"${idx === card.rows.length - 1 ? ' style="margin-bottom:0;"' : ''}>
                <div class="kpi-sub-row"><span>${row.lbl}</span><strong>${row.val}</strong></div>
                ${renderProgress(row.pct)}
              </div>
            `
              )
              .join('')}
            <div class="kpi-backlog-line">
              <span style="color:var(--text-muted);">${card.backlogLbl}</span>
              <span class="tag tag-amber">${card.backlogVal}</span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>

      <!-- Bảng Báo cáo Ngày chi tiết ngay sát dưới 4 ô tổng -->
      <div class="toolbar compact-toolbar">
        <div class="pill-bar" style="margin-bottom:0;">
          ${DAILY_GROUPS.map((g) => `<button type="button" class="filter-pill ${state.dailyGroup === g ? 'active' : ''}" data-daily-group="${escapeHtml(g)}">${escapeHtml(g)}</button>`).join('')}
        </div>
        <div class="toolbar-group">
          <input id="daily-search" class="input" type="search" placeholder="Lọc dòng xe / showroom..." value="${escapeHtml(state.dailySearch)}" style="min-width:190px;" />
        </div>
      </div>

      ${renderVisualDailyDashboard(daily, vFiltered, dFiltered)}

      <!-- Các nội dung kiểm soát, so sánh ngày hôm trước & chờ cập nhật xuống sau -->
      <div class="panel">
        <div class="section-heading">
          <span>🔍 Kiểm soát Cập nhật Theo Mảng (So sánh với ngày hôm trước: ${escapeHtml(daily.previousDay?.reportDate || '26/11/2026')})</span>
          ${renderTag(allArraysReady ? 'Đủ điều kiện tổng hợp' : 'Chờ đủ 5 mảng')}
        </div>
        <div class="array-status-grid">
          ${freshness
            .map(
              (f) => `
            <div class="array-status-card ${f.updated ? 'ready' : 'pending'}">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:4px;">
                <strong style="font-size:12.5px;">${escapeHtml(f.key)}</strong>
                ${renderTag(f.updated ? 'Đã cập nhật' : 'Chưa cập nhật')}
              </div>
              <div class="mono" style="font-size:11.5px; color:var(--text-secondary);">
                ${
                  f.isVehicle
                    ? `Ký HĐ: +${f.daySub} (Hôm qua ${f.prev.prevContractActual} → ${f.currSub})<br/>XHĐ: +${f.dayMain} (Hôm qua ${f.prev.prevMonthActual} → ${f.currMain})`
                    : `Tổng DT: +${formatNum(f.dayMain)} (Hôm qua ${formatNum(f.prev.prevMonthActual)} → ${formatNum(f.currMain)})<br/>DT DVSC: +${formatNum(f.daySub)} (Hôm qua ${formatNum(f.prevSub)} → ${formatNum(f.currSub)})`
                }
              </div>
              ${
                !f.updated
                  ? `<button type="button" class="btn btn-sm" data-confirm-zero="${escapeHtml(f.key)}" style="margin-top:4px; font-size:11px;">✓ Xác nhận 0 phát sinh</button>`
                  : f.isConfirmedZero
                    ? `<span style="font-size:11px; color:var(--tag-green-text);">Đã xác nhận 0 phát sinh ngày ${escapeHtml(daily.reportDate)}</span>`
                    : ''
              }
            </div>
          `
            )
            .join('')}
        </div>

        ${
          allArraysReady
            ? `
          <div class="callout tip" style="margin:0;">
            <span class="callout-icon">📊</span>
            <div class="callout-body" style="width:100%;">
              <strong>TỔNG HỢP ĐÁNH GIÁ THỰC HIỆN NGÀY ${escapeHtml(daily.reportDate)} (Đã đủ 5/5 mảng — Tiến độ tháng ${timeInfo.pct}%)</strong>
              <ul style="margin:6px 0 0; padding-left:18px;">
                <li><strong>KD xe Du lịch:</strong> Ký HĐ đạt <strong>${dlSum.contractActual}/${dlSum.contractTarget} (${calcPct(dlSum.contractActual, dlSum.contractTarget)}%)</strong>, XHĐ đạt <strong>${dlSum.monthActual}/${dlSum.monthTarget} (${calcPct(dlSum.monthActual, dlSum.monthTarget)}%)</strong> so với ${timeInfo.pct}% thời gian tháng. <strong>HĐ tồn: ${dlSum.backlog} HĐ chưa XHĐ</strong> (${(daily.vehicleRows || []).filter((r) => ['v-kia', 'v-mazda', 'v-peugeot', 'v-bmw'].includes(r.id) && r.backlog > 0).map((r) => `${r.name} ${r.backlog}`).join(', ') || '0'}).</li>
                <li><strong>Kinh doanh xe Tải Bus:</strong> Ký HĐ đạt <strong>${tbSum.contractActual}/${tbSum.contractTarget} (${calcPct(tbSum.contractActual, tbSum.contractTarget)}%)</strong>, XHĐ đạt <strong>${tbSum.monthActual}/${tbSum.monthTarget} (${calcPct(tbSum.monthActual, tbSum.monthTarget)}%)</strong>. <strong>HĐ tồn: ${tbSum.backlog} HĐ chưa XHĐ</strong>.</li>
                <li><strong>Xe DL đã QSD:</strong> Ký HĐ <strong>${qsdSum.contractActual}/${qsdSum.contractTarget} (${calcPct(qsdSum.contractActual, qsdSum.contractTarget)}%)</strong>, XHĐ <strong>${qsdSum.monthActual}/${qsdSum.monthTarget} (${calcPct(qsdSum.monthActual, qsdSum.monthTarget)}%)</strong>, HĐ tồn: <strong>${qsdSum.backlog}</strong>.</li>
                <li><strong>KD DVPT xe Du lịch:</strong> Tổng DT DVPT đạt <strong>${formatNum(dvDlSum.monthActual)}/${formatNum(dvDlSum.monthTarget)} tr.đ (${calcPct(dvDlSum.monthActual, dvDlSum.monthTarget)}%)</strong>, DT DVSC đạt <strong>${formatNum(dvDlSum.cumDvsc)}/${formatNum(dvDlSum.planDvsc)} tr.đ (${calcPct(dvDlSum.cumDvsc, dvDlSum.planDvsc)}%)</strong>. <strong>Tồn xưởng: ${formatNum(dvDlSum.backlogVisits)} lượt • ${formatNum(dvDlSum.backlog)} tr.đ</strong>.</li>
                <li><strong>KD DVPT xe Tải Bus:</strong> Tổng DT DVPT đạt <strong>${formatNum(dvTbSum.monthActual)}/${formatNum(dvTbSum.monthTarget)} tr.đ (${calcPct(dvTbSum.monthActual, dvTbSum.monthTarget)}%)</strong>, DT DVSC đạt <strong>${formatNum(dvTbSum.cumDvsc)}/${formatNum(dvTbSum.planDvsc)} tr.đ (${calcPct(dvTbSum.cumDvsc, dvTbSum.planDvsc)}%)</strong>. <strong>Tồn xưởng: ${formatNum(dvTbSum.backlogVisits)} lượt • ${formatNum(dvTbSum.backlog)} tr.đ</strong>.</li>
              </ul>
            </div>
          </div>
        `
            : `
          <div class="callout warn" style="margin:0;">
            <span class="callout-icon">⏳</span>
            <div class="callout-body">
              <strong>Chờ cập nhật đầy đủ các mảng (${updatedCount}/5 mảng đã xong) trước khi tổng hợp đánh giá chính thức</strong>
              Mảng chưa ghi nhận biến động so với ngày ${escapeHtml(daily.previousDay?.reportDate || '')}: <strong>${freshness.filter((x) => !x.updated).map((x) => x.key).join(', ')}</strong>. Hãy cập nhật số liệu ở bảng trên hoặc nhấn <em>Xác nhận 0 phát sinh</em> nếu trong ngày không phát sinh giao dịch.
            </div>
          </div>
        `
        }
      </div>

      <div class="panel">
        <div class="section-heading">
          <span>☑️ Checklist Hoàn thành Đánh giá Hàng ngày (Chốt 19:00)</span>
          <span class="mono" style="font-size:12px; color:var(--text-muted);">${doneChk}/${(daily.checkpoints || []).length} đã chốt</span>
        </div>
        ${(daily.checkpoints || [])
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
                const wk = (it.byWeek && it.byWeek[activeWeek.id]) || { kh: 0, th: 0 };
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
              <th>Mã số</th><th>Tên chỉ tiêu / Mục tiêu</th><th>Phòng ban</th><th>Kỳ báo cáo</th>
              <th>Kế hoạch / Thực đạt</th><th>Tiến độ (%)</th><th>Trạng thái</th><th>Tham mưu giải pháp</th>
            </tr>
          </thead>
          <tbody>
            ${plans
              .map(
                (p) => `
              <tr>
                <td><span class="code-pill">${escapeHtml(p.code)}</span></td>
                <td style="min-width:210px;"><div class="row-title" data-edit-plan="${escapeHtml(p.id)}">${escapeHtml(p.title)}</div><div class="row-sub">Hạn: <span class="mono">${escapeHtml(p.deadline)}</span></div></td>
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
              <div class="kanban-col-head">${renderTag(status)}<span class="mono" style="color:var(--text-muted); font-weight:600;">${items.length}</span></div>
              ${
                items.length
                  ? items
                      .map(
                        (p) => `
                    <div class="kanban-card" data-edit-plan="${escapeHtml(p.id)}">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><span class="code-pill">${escapeHtml(p.code)}</span><span class="tag tag-gray">${escapeHtml(p.dept)}</span></div>
                      <div style="font-weight:600; font-size:13px; margin-bottom:6px;">${escapeHtml(p.title)}</div>
                      <div class="mono" style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">Đạt: ${escapeHtml(p.actual)} / ${escapeHtml(p.target)} ${escapeHtml(p.unit)}</div>
                      ${renderProgress(p.progress)}
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

  function openVehicleRowEditor(ctx, rowId) {
    const daily = ctx.data.tracking.daily;
    const r = (daily.vehicleRows || []).find((x) => x.id === rowId);
    if (!r) return;

    const html = `
      <form id="veh-edit-form" class="form-grid">
        <div style="font-weight:700;">${escapeHtml(r.name)} (${escapeHtml(r.group)})</div>
        <div class="form-row-2">
          <div class="form-field"><label for="ve-dc">Ký HĐ mới trong ngày</label><input id="ve-dc" class="input" type="number" required value="${escapeHtml(r.dayContract)}" /></div>
          <div class="form-field"><label for="ve-dx">XHĐ trong ngày</label><input id="ve-dx" class="input" type="number" required value="${escapeHtml(r.dayActual)}" /></div>
        </div>
        <div class="form-row-2">
          <div class="form-field"><label for="ve-cc">Lũy kế Ký HĐ tháng</label><input id="ve-cc" class="input" type="number" required value="${escapeHtml(r.contractActual)}" /></div>
          <div class="form-field"><label for="ve-cx">Lũy kế XHĐ tháng</label><input id="ve-cx" class="input" type="number" required value="${escapeHtml(r.monthActual)}" /></div>
        </div>
        <div class="form-row-2">
          <div class="form-field"><label for="ve-bl">HĐ tồn còn lại (Chưa XHĐ)</label><input id="ve-bl" class="input" type="number" required value="${escapeHtml(r.backlog)}" /></div>
          <div class="form-field"><label for="ve-dk">XHĐ chưa ĐKM</label><input id="ve-dk" class="input" type="number" required value="${escapeHtml(r.xhdNotDkm)}" /></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" id="ve-cancel">Hủy</button>
          <button type="submit" class="btn btn-blue">Lưu cập nhật</button>
        </div>
      </form>
    `;

    openModal('Cập nhật Số liệu Ngày — Kinh doanh Xe', html, (body) => {
      body.querySelector('#ve-cancel').addEventListener('click', closeModal);
      body.querySelector('#veh-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        r.dayContract = Number(body.querySelector('#ve-dc').value);
        r.dayActual = Number(body.querySelector('#ve-dx').value);
        r.contractActual = Number(body.querySelector('#ve-cc').value);
        r.monthActual = Number(body.querySelector('#ve-cx').value);
        r.backlog = Number(body.querySelector('#ve-bl').value);
        r.xhdNotDkm = Number(body.querySelector('#ve-dk').value);
        ctx.commit(`Đã cập nhật số liệu ngày: ${r.name}`);
        closeModal();
      });
    });
  }

  function openDvptRowEditor(ctx, rowId) {
    const daily = ctx.data.tracking.daily;
    const r = (daily.dvptRows || []).find((x) => x.id === rowId);
    if (!r) return;

    const html = `
      <form id="dv-edit-form" class="form-grid">
        <div style="font-weight:700;">${escapeHtml(r.name)} (${escapeHtml(r.group)})</div>
        <div class="form-row-2">
          <div class="form-field"><label for="dv-da">Tổng DT DVPT trong ngày (Tr.đ)</label><input id="dv-da" class="input" type="number" step="any" required value="${escapeHtml(r.dayActual)}" /></div>
          <div class="form-field"><label for="dv-ds">DT DVSC trong ngày (Tr.đ)</label><input id="dv-ds" class="input" type="number" step="any" required value="${escapeHtml(r.dayDvsc)}" /></div>
        </div>
        <div class="form-row-2">
          <div class="form-field"><label for="dv-ca">Lũy kế Tổng DT DVPT (Tr.đ)</label><input id="dv-ca" class="input" type="number" step="any" required value="${escapeHtml(r.monthActual)}" /></div>
          <div class="form-field"><label for="dv-cs">Lũy kế DT DVSC (Tr.đ)</label><input id="dv-cs" class="input" type="number" step="any" required value="${escapeHtml(r.cumDvsc)}" /></div>
        </div>
        <div class="form-row-2">
          <div class="form-field"><label for="dv-bv">Lượt xe tồn xưởng</label><input id="dv-bv" class="input" type="number" step="any" required value="${escapeHtml(r.backlogVisits)}" /></div>
          <div class="form-field"><label for="dv-ba">Doanh thu tồn xưởng (Tr.đ)</label><input id="dv-ba" class="input" type="number" step="any" required value="${escapeHtml(r.backlog)}" /></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" id="dv-cancel">Hủy</button>
          <button type="submit" class="btn btn-blue">Lưu cập nhật</button>
        </div>
      </form>
    `;

    openModal('Cập nhật Số liệu Ngày — DVPT', html, (body) => {
      body.querySelector('#dv-cancel').addEventListener('click', closeModal);
      body.querySelector('#dv-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        r.dayActual = Number(body.querySelector('#dv-da').value);
        r.dayDvsc = Number(body.querySelector('#dv-ds').value);
        r.monthActual = Number(body.querySelector('#dv-ca').value);
        r.cumDvsc = Number(body.querySelector('#dv-cs').value);
        r.backlogVisits = Number(body.querySelector('#dv-bv').value);
        r.backlog = Number(body.querySelector('#dv-ba').value);
        ctx.commit(`Đã cập nhật số liệu DVPT: ${r.name}`);
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
          <div class="form-field"><label for="wf-kh">Kế hoạch tuần (${escapeHtml(item.unit)})</label><input id="wf-kh" class="input" type="number" step="any" required value="${escapeHtml(wk.kh)}" /></div>
          <div class="form-field"><label for="wf-th">Thực hiện tuần (${escapeHtml(item.unit)})</label><input id="wf-th" class="input" type="number" step="any" required value="${escapeHtml(wk.th)}" /></div>
        </div>
        <div class="form-row-2">
          <div class="form-field"><label for="wf-cum">Lũy kế thực hiện tháng</label><input id="wf-cum" class="input" type="number" step="any" required value="${escapeHtml(item.cumTo22)}" /></div>
          <div class="form-field"><label for="wf-est">Ước thực hiện cả tháng</label><input id="wf-est" class="input" type="number" step="any" required value="${escapeHtml(item.estMonth)}" /></div>
        </div>
        <div class="form-field"><label for="wf-adv">Tham mưu giải pháp giao ban Thứ Hai (12:00)</label><textarea id="wf-adv" class="textarea" rows="3">${escapeHtml(item.advisory)}</textarea></div>
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
        item.byWeek[state.weekId] = { ...wk, kh: Number(body.querySelector('#wf-kh').value), th: Number(body.querySelector('#wf-th').value) };
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
      ? { id: `kh-${Date.now()}`, code: `KH-${Math.floor(100 + Math.random() * 899)}`, title: '', dept: 'PKD-PC', period: ctx.data.meta.period, target: 100, actual: 0, unit: 'Xe', deadline: '2026-11-30', progress: 0, status: 'Đang thực hiện', advisorySolution: '' }
      : ctx.data.plans.find((p) => p.id === planId);
    if (!existing) return;

    const html = `
      <form id="plan-form" class="form-grid">
        <div class="form-row-2">
          <div class="form-field"><label for="pf-code">Mã chỉ tiêu</label><input id="pf-code" class="input" required value="${escapeHtml(existing.code)}" /></div>
          <div class="form-field"><label for="pf-dept">Phòng ban</label><select id="pf-dept" class="select">${DEPTS.map((d) => `<option value="${escapeHtml(d)}" ${existing.dept === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}</select></div>
        </div>
        <div class="form-field"><label for="pf-title">Tên mục tiêu / Chỉ tiêu kế hoạch</label><input id="pf-title" class="input" required value="${escapeHtml(existing.title)}" /></div>
        <div class="form-row-2">
          <div class="form-field"><label for="pf-target">Mục tiêu (Số)</label><input id="pf-target" class="input" type="number" step="any" required value="${escapeHtml(existing.target)}" /></div>
          <div class="form-field"><label for="pf-actual">Thực đạt (Số)</label><input id="pf-actual" class="input" type="number" step="any" required value="${escapeHtml(existing.actual)}" /></div>
        </div>
        <div class="form-row-2">
          <div class="form-field"><label for="pf-unit">Đơn vị tính</label><input id="pf-unit" class="input" required value="${escapeHtml(existing.unit)}" /></div>
          <div class="form-field"><label for="pf-deadline">Hạn chót</label><input id="pf-deadline" class="input" type="date" required value="${escapeHtml(existing.deadline)}" /></div>
        </div>
        <div class="form-row-2">
          <div class="form-field"><label for="pf-status">Trạng thái</label><select id="pf-status" class="select">${STATUSES.map((s) => `<option value="${escapeHtml(s)}" ${existing.status === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}</select></div>
          <div class="form-field"><label for="pf-progress">Tiến độ (%): <span id="pf-progress-label">${existing.progress}%</span></label><input id="pf-progress" type="range" min="0" max="100" value="${existing.progress}" style="width:100%; margin-top:8px;" /></div>
        </div>
        <div class="form-field"><label for="pf-solution">Ý kiến Tham mưu của Trợ lý Kế hoạch</label><textarea id="pf-solution" class="textarea" rows="3">${escapeHtml(existing.advisorySolution)}</textarea></div>
        <div class="form-actions" style="justify-content: space-between;">
          ${!isNew ? `<button id="pf-delete-btn" type="button" class="btn" style="color:var(--tag-red-text);">Xóa chỉ tiêu</button>` : `<span></span>`}
          <div style="display:flex; gap:8px;"><button type="button" class="btn" id="pf-cancel-btn">Hủy</button><button type="submit" class="btn btn-blue">${isNew ? 'Tạo mục tiêu' : 'Lưu thay đổi'}</button></div>
        </div>
      </form>
    `;

    openModal(isNew ? 'Chỉ tiêu Kế hoạch mới' : `Chi tiết ${existing.code}`, html, (body) => {
      const range = body.querySelector('#pf-progress');
      const rangeLabel = body.querySelector('#pf-progress-label');
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
          target: Number(body.querySelector('#pf-target').value),
          actual: Number(body.querySelector('#pf-actual').value),
          unit: body.querySelector('#pf-unit').value.trim(),
          deadline: body.querySelector('#pf-deadline').value,
          status: body.querySelector('#pf-status').value,
          progress: Number(range.value),
          advisorySolution: body.querySelector('#pf-solution').value.trim(),
        };
        if (isNew) ctx.data.plans.unshift(updated);
        else ctx.data.plans = ctx.data.plans.map((p) => (p.id === updated.id ? updated : p));
        ctx.commit(isNew ? 'Đã tạo chỉ tiêu kế hoạch mới' : `Đã cập nhật ${updated.code}`);
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

      ${state.tab === 'daily' ? renderDailyTab(ctx) : state.tab === 'weekly' ? renderWeeklyTab(ctx) : renderGoalsTab(ctx)}
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
    container.querySelectorAll('[data-capture-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const section = btn.getAttribute('data-capture-section') || 'all';
        captureDailySnapshotPng(ctx.data.tracking.daily, section);
      });
    });

    container.querySelector('#edit-report-date-btn')?.addEventListener('click', () => {
      const current = ctx.data.tracking.daily.reportDate;
      openModal(
        'Cập nhật Ngày báo cáo',
        `<form id="rdate-form" class="form-grid">
          <div class="form-field">
            <label for="rd-val">Ngày báo cáo (dd/mm/yyyy)</label>
            <input id="rd-val" class="input" required value="${escapeHtml(current)}" pattern="\\d{1,2}/\\d{1,2}/\\d{4}" placeholder="27/11/2026" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn" id="rd-cancel">Hủy</button>
            <button type="submit" class="btn btn-blue">Cập nhật ngày</button>
          </div>
        </form>`,
        (body) => {
          body.querySelector('#rd-cancel').addEventListener('click', closeModal);
          body.querySelector('#rdate-form').addEventListener('submit', (e) => {
            e.preventDefault();
            ctx.data.tracking.daily.reportDate = body.querySelector('#rd-val').value.trim();
            ctx.commit('Đã cập nhật Ngày báo cáo');
            closeModal();
          });
        }
      );
    });

    container.querySelector('#save-prev-baseline-btn')?.addEventListener('click', () => {
      const daily = ctx.data.tracking.daily;
      const newPrev = {};
      ARRAY_META.forEach((meta) => {
        const list = meta.source === 'vehicle' ? daily.vehicleRows || [] : daily.dvptRows || [];
        const row = list.find((r) => r.id === meta.summaryId) || {};
        newPrev[meta.key] = {
          prevMonthActual: Number(row.monthActual || 0),
          prevContractActual: Number(meta.isVehicle ? row.contractActual || 0 : 0),
          prevDvscActual: Number(meta.isVehicle ? 0 : row.cumDvsc || 0),
        };
      });
      daily.previousDay = { reportDate: daily.reportDate, arrays: newPrev };
      daily.confirmedZeroArrays = [];
      (daily.vehicleRows || []).forEach((r) => {
        r.dayKhqt = 0; r.dayGdtd = 0; r.dayContract = 0; r.dayActual = 0; r.dayDkm = 0;
      });
      (daily.dvptRows || []).forEach((r) => {
        r.dayVisits = 0; r.dayActual = 0; r.dayDvsc = 0;
      });
      ctx.commit(`Đã lưu lũy kế ngày ${daily.reportDate} làm mốc ngày hôm trước`);
    });

    container.querySelectorAll('[data-confirm-zero]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-confirm-zero');
        const arr = ctx.data.tracking.daily.confirmedZeroArrays || [];
        if (!arr.includes(key)) arr.push(key);
        ctx.data.tracking.daily.confirmedZeroArrays = arr;
        ctx.commit(`Đã xác nhận 0 phát sinh: ${key}`);
      });
    });

    container.querySelectorAll('[data-edit-vehicle]').forEach((row) => {
      row.addEventListener('click', () => openVehicleRowEditor(ctx, row.getAttribute('data-edit-vehicle')));
    });
    container.querySelectorAll('[data-edit-dvpt]').forEach((row) => {
      row.addEventListener('click', () => openDvptRowEditor(ctx, row.getAttribute('data-edit-dvpt')));
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
