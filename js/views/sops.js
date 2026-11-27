(function (PP) {
  const { escapeHtml } = PP.md;
  const { closeModal, openModal, renderTag } = PP.ui;

  const SCOPES = ['Tất cả văn bản', 'Văn phòng Điều hành - VPĐH', 'THACO AUTO Thanh Hóa'];
  const DOMAIN_ORDER = [
    'Tất cả mảng',
    'Kinh doanh xe DL',
    'Kinh doanh xe QSD',
    'DV&PT xe DL',
    'Kinh doanh xe Tải bus',
    'DV&PT xe Tải bus',
    'Tài chính Kế toán',
    'Nhân sự',
    'Kế hoạch',
    'Marketing-VHTT',
    'Hành chính',
    'Kho xe & GNVC',
    'Quản lý chất lượng',
    'XDCB & Layout vận hành',
    'Ủy quyền & ĐKKD',
  ];
  const DOC_TYPES = ['Tất cả loại VB', 'Quy định', 'Quy trình / SOP', 'Thông báo', 'Hướng dẫn', 'Ủy quyền', 'Pháp lý / ĐKKD', 'Khác'];
  const PAGE_SIZE = 50;

  const state = {
    scope: 'Tất cả văn bản',
    domain: 'Tất cả mảng',
    docType: 'Tất cả loại VB',
    search: '',
    page: 1,
  };

  function deriveDownloadUrl(url) {
    if (!url) return '';
    let m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
    m = url.match(/drive\.google\.com\/open\?id=([^&#]+)/);
    if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
    m = url.match(/docs\.google\.com\/spreadsheets\/d\/([^/?#]+)/);
    if (m) return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=xlsx`;
    m = url.match(/docs\.google\.com\/(document|presentation)\/d\/([^/?#]+)/);
    if (m) return `https://docs.google.com/${m[1]}/d/${m[2]}/export?format=pdf`;
    return url;
  }

  function getAttachments(s) {
    if (Array.isArray(s.attachments) && s.attachments.length) return s.attachments;
    if (s.driveUrl) {
      return [{ label: 'Tài liệu', viewUrl: s.driveUrl, downloadUrl: s.downloadUrl || deriveDownloadUrl(s.driveUrl) }];
    }
    return [];
  }

  function getFiltered(sops) {
    const q = state.search.trim().toLowerCase();
    return sops.filter((s) => {
      if (state.scope !== 'Tất cả văn bản' && s.scope !== state.scope) return false;
      const dom = s.domain || s.dept;
      if (state.domain !== 'Tất cả mảng' && dom !== state.domain) return false;
      if (state.docType !== 'Tất cả loại VB' && s.docType !== state.docType) return false;
      if (q) {
        const hay = `${s.number} ${s.title} ${s.summary || ''} ${dom} ${s.issuerLevel || ''} ${s.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderAttachmentButtons(s) {
    const atts = getAttachments(s);
    if (!atts.length) {
      return `<span style="font-size:12px; color:var(--text-faint);">Chưa có link</span>`;
    }
    return atts
      .map((att, idx) => {
        const labelPrefix = atts.length > 1 ? `${escapeHtml(att.label)}: ` : '';
        return `
          <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap; ${idx > 0 ? 'margin-top:4px;' : ''}">
            <a href="${escapeHtml(att.viewUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" data-stop-row title="Mở xem tài liệu trên Google Drive/Docs">${labelPrefix}Mở xem</a>
            <a href="${escapeHtml(att.downloadUrl || att.viewUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-blue btn-sm" data-stop-row title="Tải trực tiếp file đính kèm">⬇ Tải về</a>
          </div>
        `;
      })
      .join('');
  }

  function render(ctx) {
    const all = ctx.data.sops;
    const filtered = getFiltered(all);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = 1;
    const startIdx = (state.page - 1) * PAGE_SIZE;
    const paged = filtered.slice(startIdx, startIdx + PAGE_SIZE);

    const vpdhCount = all.filter((s) => s.scope === 'Văn phòng Điều hành - VPĐH').length;
    const localCount = all.filter((s) => s.scope === 'THACO AUTO Thanh Hóa').length;

    const existingDomains = new Set(all.map((s) => s.domain || s.dept));
    const domainList = DOMAIN_ORDER.filter((d) => d === 'Tất cả mảng' || existingDomains.has(d));

    return `
      <div class="module-header">
        <div class="module-header-left">
          <div class="module-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h1 class="page-title">Hệ thống Quy trình Quy định theo Mảng hoạt động</h1>
            <p class="page-subtitle">Đồng bộ từ Google Sheets THACO AUTO Thanh Hóa — hỗ trợ lọc theo mảng, tra cứu nhanh và tải trực tiếp file đính kèm.</p>
          </div>
        </div>
        <div class="toolbar-group">
          <button id="config-gsheet-btn" class="btn" type="button">🔗 Mở Google Sheets gốc</button>
          <button id="add-sop-btn" class="btn btn-blue" type="button">+ Thêm văn bản</button>
        </div>
      </div>

      <div class="subtab-bar">
        ${SCOPES.map((sc) => {
          const count = sc === 'Tất cả văn bản' ? all.length : sc.includes('VPĐH') ? vpdhCount : localCount;
          return `<button type="button" class="subtab-btn ${state.scope === sc ? 'active' : ''}" data-scope="${escapeHtml(sc)}">${escapeHtml(sc)} (${count})</button>`;
        }).join('')}
      </div>

      <div style="font-size:11.5px; font-weight:700; color:var(--text-faint); text-transform:uppercase; margin-bottom:6px;">Lọc theo Mảng hoạt động (${domainList.length - 1} mảng)</div>
      <div class="pill-bar">
        ${domainList
          .map((d) => {
            const c = d === 'Tất cả mảng' ? all.length : all.filter((s) => (s.domain || s.dept) === d).length;
            return `<button type="button" class="filter-pill ${state.domain === d ? 'active' : ''}" data-domain="${escapeHtml(d)}">${escapeHtml(d)} (${c})</button>`;
          })
          .join('')}
      </div>

      <div class="toolbar">
        <div class="pill-bar" style="margin-bottom:0;">
          ${DOC_TYPES.map((t) => `<button type="button" class="filter-pill ${state.docType === t ? 'active' : ''}" data-doctype="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('')}
        </div>
        <input id="sop-search" class="input" type="search" placeholder="Tìm tên văn bản, số hiệu, ghi chú..." value="${escapeHtml(state.search)}" style="min-width:250px;" />
      </div>

      <div class="toolbar" style="margin-bottom:10px;">
        <div style="font-size:12.5px; color:var(--text-muted);">
          Hiển thị <strong>${paged.length}</strong> mục (${startIdx + (paged.length ? 1 : 0)}–${startIdx + paged.length}) trong tổng số <strong>${filtered.length}</strong> / ${all.length} văn bản
        </div>
        ${
          totalPages > 1
            ? `
          <div class="toolbar-group">
            <button type="button" class="btn btn-sm" data-sop-page="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>← Trước</button>
            <span class="mono" style="font-size:12px;">Trang ${state.page} / ${totalPages}</span>
            <button type="button" class="btn btn-sm" data-sop-page="${state.page + 1}" ${state.page >= totalPages ? 'disabled' : ''}>Sau →</button>
          </div>
        `
            : ''
        }
      </div>

      <div class="table-wrap">
        <table class="notion-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Số hiệu</th>
              <th>Tên văn bản &amp; Ghi chú</th>
              <th>Mảng hoạt động</th>
              <th>Cấp phê duyệt</th>
              <th>Ngày BH</th>
              <th>Link đính kèm / Tải về</th>
            </tr>
          </thead>
          <tbody>
            ${
              paged.length
                ? paged
                    .map(
                      (s, idx) => `
                  <tr data-open-sop="${escapeHtml(s.id)}" style="cursor:pointer;">
                    <td class="mono">${startIdx + idx + 1}</td>
                    <td style="white-space:nowrap;"><span class="code-pill">${escapeHtml(s.number)}</span></td>
                    <td style="min-width:270px;">
                      <div style="display:flex; gap:6px; align-items:center; margin-bottom:3px; flex-wrap:wrap;">
                        ${renderTag(s.docType)}
                        <strong>${escapeHtml(s.title)}</strong>
                      </div>
                      ${s.notes ? `<div class="row-sub">Ghi chú: ${escapeHtml(s.notes)}</div>` : ''}
                    </td>
                    <td style="white-space:nowrap;"><span class="tag tag-gray">${escapeHtml(s.domain || s.dept)}</span></td>
                    <td style="font-size:12.5px;">${escapeHtml(s.approver || s.issuerLevel)}</td>
                    <td class="mono" style="white-space:nowrap;">${escapeHtml(s.issuedDate || '—')}</td>
                    <td style="min-width:155px;">${renderAttachmentButtons(s)}</td>
                  </tr>
                `
                    )
                    .join('')
                : `<tr><td colspan="7" style="text-align:center; padding:28px; color:var(--text-muted);">Không có văn bản nào khớp điều kiện lọc.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;
  }

  function openSopDetail(ctx, sopId) {
    const s = ctx.data.sops.find((item) => item.id === sopId);
    if (!s) return;
    const atts = getAttachments(s);

    const html = `
      <div class="form-grid">
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <span class="code-pill">${escapeHtml(s.number)}</span>
          <span class="tag tag-gray">${escapeHtml(s.domain || s.dept)}</span>
          ${renderTag(s.docType)}
          <span class="tag tag-blue">${escapeHtml(s.scope)}</span>
        </div>
        <h3 style="margin:4px 0 0; font-size:17px;">${escapeHtml(s.title)}</h3>
        <div class="roi-box">
          <div class="roi-title">Ghi chú / Tóm tắt nội dung</div>
          <div style="color:var(--text-secondary); line-height:1.55;">${escapeHtml(s.notes || s.summary || 'Tài liệu áp dụng theo quy định hiện hành.')}</div>
        </div>
        <div class="form-row-2">
          <div class="roi-box">
            <div class="roi-title">Mảng hoạt động</div>
            <div style="font-weight:600;">${escapeHtml(s.domain || s.dept)}</div>
          </div>
          <div class="roi-box">
            <div class="roi-title">Cấp phê duyệt</div>
            <div style="font-weight:600;">${escapeHtml(s.approver || s.issuerLevel)}</div>
          </div>
          <div class="roi-box">
            <div class="roi-title">Ngày ban hành</div>
            <div class="mono" style="font-weight:600;">${escapeHtml(s.issuedDate || '—')}</div>
          </div>
          <div class="roi-box">
            <div class="roi-title">Phạm vi áp dụng</div>
            <div style="font-weight:600;">${escapeHtml(s.scope)}</div>
          </div>
        </div>

        <div class="roi-box">
          <div class="roi-title">Tệp &amp; Liên kết đính kèm (${atts.length})</div>
          ${
            atts.length
              ? atts
                  .map(
                    (att) => `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
                  <span style="font-weight:600;">📎 ${escapeHtml(att.label)}</span>
                  <div style="display:flex; gap:6px;">
                    <a href="${escapeHtml(att.viewUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm">Mở xem</a>
                    <a href="${escapeHtml(att.downloadUrl || att.viewUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-blue btn-sm">⬇ Tải xuống</a>
                  </div>
                </div>
              `
                  )
                  .join('')
              : `<div style="color:var(--text-muted);">Văn bản này chưa có link đính kèm trên bảng tính.</div>`
          }
        </div>

        <div class="form-actions" style="justify-content:space-between;">
          <button type="button" id="sop-del-btn" class="btn" style="color:var(--tag-red-text);">Xóa văn bản</button>
          <button type="button" id="sop-close-btn" class="btn btn-blue">Đóng</button>
        </div>
      </div>
    `;

    openModal('Chi tiết Văn bản Quản trị', html, (body) => {
      body.querySelector('#sop-close-btn').addEventListener('click', closeModal);
      body.querySelector('#sop-del-btn').addEventListener('click', () => {
        ctx.data.sops = ctx.data.sops.filter((x) => x.id !== s.id);
        ctx.commit('Đã xóa văn bản');
        closeModal();
      });
    });
  }

  function openSopCreator(ctx) {
    const html = `
      <form id="sop-create-form" class="form-grid">
        <div class="form-row-2">
          <div class="form-field">
            <label for="sf-num">Số hiệu văn bản</label>
            <input id="sf-num" class="input" required placeholder="VD: 18/2026/QT-TH" />
          </div>
          <div class="form-field">
            <label for="sf-scope">Phạm vi ban hành</label>
            <select id="sf-scope" class="select">
              <option value="THACO AUTO Thanh Hóa">THACO AUTO Thanh Hóa</option>
              <option value="Văn phòng Điều hành - VPĐH">Văn phòng Điều hành - VPĐH</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="sf-domain">Mảng hoạt động</label>
            <select id="sf-domain" class="select">
              ${DOMAIN_ORDER.filter((d) => d !== 'Tất cả mảng')
                .map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`)
                .join('')}
            </select>
          </div>
          <div class="form-field">
            <label for="sf-type">Loại văn bản</label>
            <select id="sf-type" class="select">
              ${DOC_TYPES.filter((t) => t !== 'Tất cả loại VB')
                .map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`)
                .join('')}
            </select>
          </div>
        </div>
        <div class="form-field">
          <label for="sf-title">Tên văn bản / Quy trình</label>
          <input id="sf-title" class="input" required />
        </div>
        <div class="form-field">
          <label for="sf-summary">Ghi chú / Tóm tắt nội dung</label>
          <textarea id="sf-summary" class="textarea" rows="2"></textarea>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="sf-date">Ngày ban hành</label>
            <input id="sf-date" class="input" placeholder="dd/mm/yyyy" value="27/11/2026" required />
          </div>
          <div class="form-field">
            <label for="sf-drive">Link Google Drive / File đính kèm</label>
            <input id="sf-drive" class="input" type="url" placeholder="https://drive.google.com/..." />
          </div>
        </div>
        <div class="form-actions">
          <button type="button" id="sf-cancel" class="btn">Hủy</button>
          <button type="submit" class="btn btn-blue">Lưu văn bản</button>
        </div>
      </form>
    `;

    openModal('Văn bản / Quy trình mới', html, (body) => {
      body.querySelector('#sf-cancel').addEventListener('click', closeModal);
      body.querySelector('#sop-create-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const url = body.querySelector('#sf-drive').value.trim();
        const dl = deriveDownloadUrl(url);
        const domain = body.querySelector('#sf-domain').value;
        const item = {
          id: `vb-${Date.now()}`,
          number: body.querySelector('#sf-num').value.trim(),
          scope: body.querySelector('#sf-scope').value,
          domain,
          dept: domain,
          docType: body.querySelector('#sf-type').value,
          title: body.querySelector('#sf-title').value.trim(),
          notes: body.querySelector('#sf-summary').value.trim(),
          summary: body.querySelector('#sf-summary').value.trim() || `Tài liệu thuộc mảng ${domain}`,
          issuerLevel: body.querySelector('#sf-scope').value,
          approver: 'Ban Giám đốc Công ty',
          issuedDate: body.querySelector('#sf-date').value.trim(),
          driveUrl: url,
          downloadUrl: dl,
          attachments: url ? [{ label: 'TÀI LIỆU', viewUrl: url, downloadUrl: dl }] : [],
        };
        ctx.data.sops.unshift(item);
        ctx.commit(`Đã thêm văn bản ${item.number}`);
        closeModal();
      });
    });
  }

  function bind(container, ctx) {
    container.querySelectorAll('[data-scope]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.scope = btn.getAttribute('data-scope');
        state.page = 1;
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-domain]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.domain = btn.getAttribute('data-domain');
        state.page = 1;
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-doctype]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.docType = btn.getAttribute('data-doctype');
        state.page = 1;
        ctx.rerender();
      });
    });
    container.querySelector('#sop-search')?.addEventListener('input', (e) => {
      state.search = e.target.value;
      state.page = 1;
      ctx.rerender();
    });
    container.querySelectorAll('[data-sop-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = Number(btn.getAttribute('data-sop-page'));
        if (next >= 1) {
          state.page = next;
          ctx.rerender();
        }
      });
    });
    container.querySelectorAll('[data-stop-row]').forEach((el) => {
      el.addEventListener('click', (e) => e.stopPropagation());
    });
    container.querySelectorAll('[data-open-sop]').forEach((row) => {
      row.addEventListener('click', () => openSopDetail(ctx, row.getAttribute('data-open-sop')));
    });
    container.querySelector('#add-sop-btn')?.addEventListener('click', () => openSopCreator(ctx));
    container.querySelector('#config-gsheet-btn')?.addEventListener('click', () => {
      if (ctx.data.meta.googleSheetUrl) {
        window.open(ctx.data.meta.googleSheetUrl, '_blank', 'noopener,noreferrer');
      }
    });
  }

  PP.views = PP.views || {};
  PP.views.sops = { render, bind, openSopCreator };
})((window.PP = window.PP || {}));
