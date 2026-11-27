(function (PP) {
  const { escapeHtml } = PP.md;
  const { closeModal, openModal, renderTag, showToast } = PP.ui;

  const SCOPES = ['Tất cả văn bản', 'Văn phòng Điều hành - VPĐH', 'THACO AUTO Thanh Hóa'];
  const DEPTS = ['Tất cả', 'KDDL', 'KDTB', 'DVDL', 'DVTB', 'QSD', 'TCKT', 'HCNS', 'NVKH', 'MKT', 'NVCN'];
  const DOC_TYPES = ['Tất cả loại VB', 'Quy định', 'Quy trình / SOP', 'Thông báo', 'Hướng dẫn', 'Quy chế'];

  const state = {
    scope: 'Tất cả văn bản',
    dept: 'Tất cả',
    docType: 'Tất cả loại VB',
    search: '',
  };

  function getFiltered(sops) {
    const q = state.search.trim().toLowerCase();
    return sops.filter((s) => {
      if (state.scope !== 'Tất cả văn bản' && s.scope !== state.scope) return false;
      if (state.dept !== 'Tất cả' && s.dept !== state.dept) return false;
      if (state.docType !== 'Tất cả loại VB' && s.docType !== state.docType) return false;
      if (q) {
        const hay = `${s.number} ${s.title} ${s.summary} ${s.dept} ${s.issuerLevel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function render(ctx) {
    const all = ctx.data.sops;
    const filtered = getFiltered(all);
    const vpdhCount = all.filter((s) => s.scope === 'Văn phòng Điều hành - VPĐH').length;
    const localCount = all.filter((s) => s.scope === 'THACO AUTO Thanh Hóa').length;

    return `
      <div class="module-header">
        <div class="module-header-left">
          <div class="module-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h1 class="page-title">Hệ thống Quy trình Quy định</h1>
            <p class="page-subtitle">Kho văn bản quy chuẩn từ Văn phòng Điều hành và quy trình ban hành nội bộ tại THACO AUTO Thanh Hóa.</p>
          </div>
        </div>
        <div class="toolbar-group">
          <button id="config-gsheet-btn" class="btn" type="button">🔗 ${ctx.data.meta.googleSheetUrl ? 'Mở Google Sheets gốc' : 'Gắn link Google Sheets'}</button>
          <button id="add-sop-btn" class="btn btn-blue" type="button">+ Thêm văn bản</button>
        </div>
      </div>

      <!-- Tier 1: Scope Tabs -->
      <div class="subtab-bar">
        ${SCOPES.map((sc) => {
          const count = sc === 'Tất cả văn bản' ? all.length : sc.includes('VPĐH') ? vpdhCount : localCount;
          return `<button type="button" class="subtab-btn ${state.scope === sc ? 'active' : ''}" data-scope="${escapeHtml(sc)}">${escapeHtml(sc)} (${count})</button>`;
        }).join('')}
      </div>

      <!-- Tier 2: Department Pills -->
      <div style="font-size:11.5px; font-weight:700; color:var(--text-faint); text-transform:uppercase; margin-bottom:6px;">Lọc theo Bộ phận ban hành</div>
      <div class="pill-bar">
        ${DEPTS.map((d) => {
          const c = d === 'Tất cả' ? all.length : all.filter((s) => s.dept === d).length;
          return `<button type="button" class="filter-pill ${state.dept === d ? 'active' : ''}" data-dept="${escapeHtml(d)}">${escapeHtml(d)} (${c})</button>`;
        }).join('')}
      </div>

      <!-- Tier 3: Document Type + Search -->
      <div class="toolbar">
        <div class="pill-bar" style="margin-bottom:0;">
          ${DOC_TYPES.map((t) => `<button type="button" class="filter-pill ${state.docType === t ? 'active' : ''}" data-doctype="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('')}
        </div>
        <input id="sop-search" class="input" type="search" placeholder="Tìm theo tên, số hiệu, nội dung..." value="${escapeHtml(state.search)}" style="min-width:250px;" />
      </div>

      <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px;">
        Hiển thị <strong>${filtered.length}</strong> / ${all.length} văn bản quy chuẩn
      </div>

      <div class="table-wrap">
        <table class="notion-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Số hiệu</th>
              <th>Tên văn bản &amp; Tóm tắt nội dung</th>
              <th>Bộ phận</th>
              <th>Cấp ban hành</th>
              <th>Ngày BH</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            ${
              filtered.length
                ? filtered
                    .map(
                      (s, idx) => `
                  <tr data-open-sop="${escapeHtml(s.id)}" style="cursor:pointer;">
                    <td class="mono">${idx + 1}</td>
                    <td style="white-space:nowrap;"><span class="code-pill">${escapeHtml(s.number)}</span></td>
                    <td style="min-width:290px;">
                      <div style="display:flex; gap:6px; align-items:center; margin-bottom:3px; flex-wrap:wrap;">
                        ${renderTag(s.docType)}
                        <strong>${escapeHtml(s.title)}</strong>
                      </div>
                      <div class="row-sub">${escapeHtml(s.summary)}</div>
                    </td>
                    <td><span class="tag tag-gray">${escapeHtml(s.dept)}</span></td>
                    <td style="font-size:12.5px;">${escapeHtml(s.issuerLevel)}</td>
                    <td class="mono" style="white-space:nowrap;">${escapeHtml(s.issuedDate)}</td>
                    <td><button type="button" class="btn btn-sm">Mở chi tiết</button></td>
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

    const html = `
      <div class="form-grid">
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <span class="code-pill">${escapeHtml(s.number)}</span>
          <span class="tag tag-gray">${escapeHtml(s.dept)}</span>
          ${renderTag(s.docType)}
        </div>
        <h3 style="margin:4px 0 0; font-size:17px;">${escapeHtml(s.title)}</h3>
        <div class="roi-box">
          <div class="roi-title">Tóm tắt nội dung cốt lõi</div>
          <div style="color:var(--text-secondary); line-height:1.55;">${escapeHtml(s.summary)}</div>
        </div>
        <div class="form-row-2">
          <div class="roi-box">
            <div class="roi-title">Cấp ban hành</div>
            <div style="font-weight:600;">${escapeHtml(s.issuerLevel)}</div>
          </div>
          <div class="roi-box">
            <div class="roi-title">Người phê duyệt</div>
            <div style="font-weight:600;">${escapeHtml(s.approver)}</div>
          </div>
          <div class="roi-box">
            <div class="roi-title">Ngày ban hành</div>
            <div class="mono" style="font-weight:600;">${escapeHtml(s.issuedDate)}</div>
          </div>
          <div class="roi-box">
            <div class="roi-title">Phối hợp thực hiện</div>
            <div style="font-weight:600;">${escapeHtml(s.coordinators)}</div>
          </div>
        </div>
        ${
          s.checklist?.length
            ? `
          <div>
            <div class="roi-title" style="margin-bottom:6px;">Checklist Kiểm soát Tuân thủ</div>
            ${s.checklist
              .map(
                (c) => `
              <label class="checklist-item ${c.done ? 'checked' : ''}">
                <input type="checkbox" data-chk-id="${escapeHtml(c.id)}" ${c.done ? 'checked' : ''} />
                <span>${escapeHtml(c.text)}</span>
              </label>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
        <div class="form-actions" style="justify-content:space-between;">
          <button type="button" id="sop-del-btn" class="btn" style="color:var(--tag-red-text);">Xóa văn bản</button>
          <div style="display:flex; gap:8px;">
            ${
              s.driveUrl
                ? `<a href="${escapeHtml(s.driveUrl)}" target="_blank" rel="noopener noreferrer" class="btn">Mở file Google Drive</a>`
                : ''
            }
            <button type="button" id="sop-close-btn" class="btn btn-blue">Đóng</button>
          </div>
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
      body.querySelectorAll('[data-chk-id]').forEach((box) => {
        box.addEventListener('change', () => {
          const cid = box.getAttribute('data-chk-id');
          s.checklist = s.checklist.map((item) => (item.id === cid ? { ...item, done: box.checked } : item));
          box.closest('label').classList.toggle('checked', box.checked);
          ctx.commit('Đã cập nhật checklist tuân thủ');
        });
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
            <label for="sf-dept">Bộ phận</label>
            <select id="sf-dept" class="select">
              ${DEPTS.filter((d) => d !== 'Tất cả').map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('')}
            </select>
          </div>
          <div class="form-field">
            <label for="sf-type">Loại văn bản</label>
            <select id="sf-type" class="select">
              ${DOC_TYPES.filter((t) => t !== 'Tất cả loại VB').map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-field">
          <label for="sf-title">Tên văn bản / Quy trình</label>
          <input id="sf-title" class="input" required />
        </div>
        <div class="form-field">
          <label for="sf-summary">Tóm tắt nội dung cốt lõi</label>
          <textarea id="sf-summary" class="textarea" rows="3" required></textarea>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label for="sf-date">Ngày ban hành</label>
            <input id="sf-date" class="input" type="date" value="2026-11-27" required />
          </div>
          <div class="form-field">
            <label for="sf-drive">Link Google Drive gốc (tùy chọn)</label>
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
        const item = {
          id: `vb-${Date.now()}`,
          number: body.querySelector('#sf-num').value.trim(),
          scope: body.querySelector('#sf-scope').value,
          dept: body.querySelector('#sf-dept').value,
          docType: body.querySelector('#sf-type').value,
          title: body.querySelector('#sf-title').value.trim(),
          summary: body.querySelector('#sf-summary').value.trim(),
          issuerLevel: body.querySelector('#sf-scope').value.includes('VPĐH') ? 'Văn phòng Điều hành' : 'Ban Giám đốc Công ty',
          approver: 'Giám đốc Công ty',
          issuedDate: body.querySelector('#sf-date').value,
          coordinators: 'Các bộ phận liên quan',
          driveUrl: body.querySelector('#sf-drive').value.trim(),
          checklist: [],
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
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-dept]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.dept = btn.getAttribute('data-dept');
        ctx.rerender();
      });
    });
    container.querySelectorAll('[data-doctype]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.docType = btn.getAttribute('data-doctype');
        ctx.rerender();
      });
    });
    container.querySelector('#sop-search')?.addEventListener('input', (e) => {
      state.search = e.target.value;
      ctx.rerender();
    });
    container.querySelectorAll('[data-open-sop]').forEach((row) => {
      row.addEventListener('click', () => openSopDetail(ctx, row.getAttribute('data-open-sop')));
    });
    container.querySelector('#add-sop-btn')?.addEventListener('click', () => openSopCreator(ctx));
    container.querySelector('#config-gsheet-btn')?.addEventListener('click', () => {
      if (ctx.data.meta.googleSheetUrl) {
        window.open(ctx.data.meta.googleSheetUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      openModal(
        'Gắn link Google Sheets Quản lý Văn bản',
        `<form id="gsheet-form" class="form-grid">
          <div class="form-field">
            <label for="gs-url">Đường dẫn Google Sheets danh mục văn bản (nếu có)</label>
            <input id="gs-url" class="input" type="url" required placeholder="https://docs.google.com/spreadsheets/d/..." />
          </div>
          <div class="form-actions">
            <button type="button" class="btn" id="gs-cancel">Hủy</button>
            <button type="submit" class="btn btn-blue">Lưu liên kết</button>
          </div>
        </form>`,
        (body) => {
          body.querySelector('#gs-cancel').addEventListener('click', closeModal);
          body.querySelector('#gsheet-form').addEventListener('submit', (e) => {
            e.preventDefault();
            ctx.data.meta.googleSheetUrl = body.querySelector('#gs-url').value.trim();
            ctx.commit('Đã lưu link Google Sheets');
            closeModal();
          });
        }
      );
    });
  }

  PP.views = PP.views || {};
  PP.views.sops = { render, bind, openSopCreator };
})((window.PP = window.PP || {}));
