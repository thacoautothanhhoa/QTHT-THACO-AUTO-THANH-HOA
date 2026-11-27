(function (PP) {
  const { escapeHtml } = PP.md;
  const { loadData, loadTheme, resetData, saveData, saveTheme } = PP.store;
  const { closeModal, openModal, showToast } = PP.ui;
  const views = PP.views;

  const ROUTE_TITLES = {
    overview: 'Tổng quan Điều hành',
    plans: 'Quản trị Kế hoạch',
    sops: 'Quy trình Quy định',
    org: 'Cấu trúc & Chức năng nhiệm vụ',
    digital: 'Chuyển đổi số & Cải tiến',
    guide: 'Hướng dẫn Host GitHub',
  };

  let appData = loadData();
  let currentTheme = loadTheme();

  const shellEl = document.getElementById('app');
  const pageEl = document.getElementById('page-content');
  const breadcrumbsEl = document.getElementById('breadcrumbs');

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    saveTheme(theme);
    const sun = document.getElementById('theme-icon-sun');
    const moon = document.getElementById('theme-icon-moon');
    if (sun && moon) {
      sun.classList.toggle('hidden', theme === 'light');
      moon.classList.toggle('hidden', theme === 'dark');
    }
  }

  function parseRoute() {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    const route = ROUTE_TITLES[parts[0]] ? parts[0] : 'overview';
    return { route, param: parts[1] || null };
  }

  function navigate(hash) {
    if (window.location.hash === hash) {
      render();
    } else {
      window.location.hash = hash;
    }
    shellEl.classList.remove('mobile-open');
  }

  function syncSidebarMeta(route) {
    document.getElementById('sidebar-workspace-name').textContent = appData.meta.workspaceName;
    document.getElementById('sidebar-unit-sub').textContent = appData.meta.subRole || 'Nghiệp vụ Kế hoạch';
    document.getElementById('footer-unit-name').textContent = appData.meta.workspaceName;
    document.getElementById('nav-plans-count').textContent = String(appData.plans.length);
    document.getElementById('nav-sops-count').textContent = String(appData.sops.length);
    document.getElementById('nav-digital-count').textContent = String(appData.digital.initiatives.length);

    document.querySelectorAll('.nav-item[data-route]').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-route') === route);
    });
  }

  function renderBreadcrumbs(route) {
    const baseLabel = ROUTE_TITLES[route] || 'Tổng quan Điều hành';
    breadcrumbsEl.innerHTML = `
      <a href="#/overview">🏠 ${escapeHtml(appData.meta.workspaceName)}</a>
      <span>&gt;</span>
      <span class="breadcrumb-current">${escapeHtml(baseLabel)}</span>
    `;
  }

  function createContext() {
    return {
      data: appData,
      navigate,
      rerender: render,
      commit(toastMsg) {
        saveData(appData);
        render();
        if (toastMsg) showToast(toastMsg);
      },
    };
  }

  function render() {
    const { route, param } = parseRoute();
    const ctx = createContext();

    syncSidebarMeta(route);
    renderBreadcrumbs(route);

    const view = views[route] || views.overview;
    pageEl.innerHTML = view.render(ctx, param);
    if (typeof view.bind === 'function') {
      view.bind(pageEl, ctx);
    }
  }

  /* Command Palette (Ctrl+K) */
  const commandModal = document.getElementById('command-modal');
  const commandInput = document.getElementById('command-input');
  const commandResults = document.getElementById('command-results');

  function buildSearchIndex() {
    const items = [
      { kind: 'Trang', title: 'Tổng quan Điều hành', hash: '#/overview' },
      { kind: 'Trang', title: 'Quản trị Kế hoạch & Tiến độ Mục tiêu', hash: '#/plans' },
      { kind: 'Trang', title: 'Hệ thống Quy trình Quy định', hash: '#/sops' },
      { kind: 'Trang', title: 'Cấu trúc & Chức năng nhiệm vụ', hash: '#/org' },
      { kind: 'Trang', title: 'Chuyển đổi số & Sáng kiến Cải tiến', hash: '#/digital' },
      { kind: 'Trang', title: 'Hướng dẫn Host GitHub Pages', hash: '#/guide' },
    ];
    appData.plans.forEach((p) => items.push({ kind: 'Kế hoạch', title: `${p.code} — ${p.title}`, hash: '#/plans' }));
    appData.sops.forEach((s) => items.push({ kind: 'Văn bản', title: `${s.number} — ${s.title}`, hash: '#/sops' }));
    appData.org.positions.forEach((p) => items.push({ kind: 'Chức danh', title: `${p.title} (${p.dept})`, hash: '#/org' }));
    appData.digital.initiatives.forEach((d) => items.push({ kind: 'Chuyển đổi số', title: `${d.code} — ${d.name}`, hash: '#/digital' }));
    return items;
  }

  function renderCommandResults(query) {
    const q = query.trim().toLowerCase();
    const list = buildSearchIndex().filter(
      (item) => !q || item.title.toLowerCase().includes(q) || item.kind.toLowerCase().includes(q)
    );
    if (!list.length) {
      commandResults.innerHTML = `<div style="padding:18px; text-align:center; color:var(--text-muted);">Không tìm thấy kết quả phù hợp.</div>`;
      return;
    }
    commandResults.innerHTML = list
      .slice(0, 14)
      .map(
        (item) => `
      <button type="button" class="command-item" data-cmd-hash="${escapeHtml(item.hash)}">
        <span>${escapeHtml(item.title)}</span>
        <span class="tag tag-gray">${escapeHtml(item.kind)}</span>
      </button>
    `
      )
      .join('');

    commandResults.querySelectorAll('[data-cmd-hash]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeCommandModal();
        navigate(btn.getAttribute('data-cmd-hash'));
      });
    });
  }

  function openCommandModal() {
    commandModal.classList.remove('hidden');
    commandInput.value = '';
    renderCommandResults('');
    setTimeout(() => commandInput.focus(), 20);
  }

  function closeCommandModal() {
    commandModal.classList.add('hidden');
  }

  /* Data Sync & Export Report */
  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openDataSyncModal() {
    const html = `
      <div class="form-grid">
        <div class="callout" style="margin:0;">
          <span class="callout-icon">💾</span>
          <div class="callout-body">
            <strong>Đồng bộ dữ liệu lên GitHub Desktop / GitHub Pages</strong>
            Thay đổi của bạn được lưu tự động trên trình duyệt. Hãy tải file <code>defaultData.js</code> ghi đè vào <code>D:\\QTHT THACO AUTO THANH HOA\\js\\data\\defaultData.js</code> rồi bấm <strong>Push origin</strong> trên GitHub Desktop để cập nhật toàn đơn vị.
          </div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button id="btn-export-js" class="btn btn-blue" type="button">Tải file defaultData.js (Để Push GitHub)</button>
          <button id="btn-export-json" class="btn" type="button">Tải bản sao lưu (.json)</button>
          <button id="btn-print-pdf" class="btn" type="button">In / Xuất PDF báo cáo</button>
        </div>
        <div class="form-field" style="padding-top:10px; border-top:1px solid var(--border-subtle);">
          <label for="import-json-file">Khôi phục từ file sao lưu (.json)</label>
          <input id="import-json-file" class="input" type="file" accept=".json,application/json" />
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid var(--border-subtle);">
          <button id="btn-reset-demo" class="btn" type="button" style="color:var(--tag-red-text);">Khôi phục dữ liệu mẫu ban đầu</button>
          <button id="btn-close-sync" class="btn" type="button">Đóng</button>
        </div>
      </div>
    `;

    openModal('Sao lưu & Xuất báo cáo', html, (body) => {
      body.querySelector('#btn-export-js').addEventListener('click', () => {
        const content = `// Xuất từ giao diện web lúc ${new Date().toLocaleString('vi-VN')}\nwindow.PP = window.PP || {};\nwindow.PP.DEFAULT_DATA = ${JSON.stringify(appData, null, 2)};\n`;
        downloadFile('defaultData.js', content, 'application/javascript');
        showToast('Đã tải file defaultData.js');
      });
      body.querySelector('#btn-export-json').addEventListener('click', () => {
        downloadFile('thaco-thanhhoa-backup.json', JSON.stringify(appData, null, 2), 'application/json');
        showToast('Đã tải file sao lưu JSON');
      });
      body.querySelector('#btn-print-pdf').addEventListener('click', () => {
        closeModal();
        window.print();
      });
      body.querySelector('#import-json-file').addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result));
            if (!parsed.plans || !parsed.sops) throw new Error('Invalid format');
            appData = parsed;
            saveData(appData);
            render();
            closeModal();
            showToast('Đã khôi phục dữ liệu thành công');
          } catch {
            showToast('File JSON không đúng định dạng');
          }
        };
        reader.readAsText(file);
      });
      body.querySelector('#btn-reset-demo').addEventListener('click', () => {
        appData = resetData();
        render();
        closeModal();
        showToast('Đã khôi phục về dữ liệu mẫu ban đầu');
      });
      body.querySelector('#btn-close-sync').addEventListener('click', closeModal);
    });
  }

  function openQuickAddChooser() {
    const ctx = createContext();
    openModal(
      'Thêm mới Dữ liệu Quản trị',
      `<div style="display:grid; gap:10px;">
        <button id="qa-plan" class="btn" type="button" style="justify-content:flex-start; padding:12px;">🎯 <strong>Chỉ tiêu Kế hoạch mới</strong> — Thêm mục tiêu KPI, phòng ban phụ trách &amp; ý kiến tham mưu</button>
        <button id="qa-sop" class="btn" type="button" style="justify-content:flex-start; padding:12px;">📂 <strong>Văn bản / Quy trình mới</strong> — Thêm Quy định, SOP, Thông báo, Hướng dẫn</button>
      </div>`,
      (body) => {
        body.querySelector('#qa-plan').addEventListener('click', () => {
          closeModal();
          views.plans.openPlanEditor(ctx, null);
        });
        body.querySelector('#qa-sop').addEventListener('click', () => {
          closeModal();
          views.sops.openSopCreator(ctx);
        });
      }
    );
  }

  function bindGlobalEvents() {
    window.addEventListener('hashchange', render);
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    const expandBtn = document.getElementById('sidebar-expand-btn');
    collapseBtn?.addEventListener('click', () => {
      shellEl.classList.add('sidebar-collapsed');
      expandBtn?.classList.remove('hidden');
    });
    expandBtn?.addEventListener('click', () => {
      shellEl.classList.remove('sidebar-collapsed');
      expandBtn?.classList.add('hidden');
    });

    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => shellEl.classList.toggle('mobile-open'));
    document.getElementById('sidebar-backdrop')?.addEventListener('click', () => shellEl.classList.remove('mobile-open'));

    document.getElementById('open-search-btn')?.addEventListener('click', openCommandModal);
    document.getElementById('data-sync-btn')?.addEventListener('click', openDataSyncModal);
    document.getElementById('export-report-btn')?.addEventListener('click', openDataSyncModal);
    document.getElementById('global-add-btn')?.addEventListener('click', openQuickAddChooser);
    document.getElementById('app-modal-close')?.addEventListener('click', closeModal);

    document.getElementById('app-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'app-modal') closeModal();
    });
    commandModal?.addEventListener('click', (e) => {
      if (e.target === commandModal) closeCommandModal();
    });
    commandInput?.addEventListener('input', (e) => renderCommandResults(e.target.value));

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (commandModal.classList.contains('hidden')) openCommandModal();
        else closeCommandModal();
      } else if (e.key === 'Escape') {
        closeCommandModal();
        closeModal();
      }
    });
  }

  applyTheme(currentTheme);
  bindGlobalEvents();
  render();
})((window.PP = window.PP || {}));
