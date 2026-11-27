(function (PP) {
  function render() {
    return `
      <div class="module-header">
        <div class="module-header-left">
          <div class="module-icon-box" aria-hidden="true">☁️</div>
          <div>
            <h1 class="page-title">Hướng dẫn Xuất bản &amp; Cập nhật qua GitHub Desktop</h1>
            <p class="page-subtitle">Quy trình vận hành chuẩn cho tài khoản <code>thacoautothanhhoa</code> → link đích <code>https://thacoautothanhhoa.github.io/plan-dept/</code>.</p>
          </div>
        </div>
      </div>

      <details class="notion-toggle" open>
        <summary>Bước 1: Đẩy mã nguồn từ máy tính lên GitHub bằng GitHub Desktop</summary>
        <div class="toggle-body">
          <ol>
            <li>Mở phần mềm <strong>GitHub Desktop</strong> trên máy tính (đã đăng nhập tài khoản <code>thacoautothanhhoa</code>).</li>
            <li>Chọn menu <strong>File → Add local repository...</strong> → chọn thư mục <code>D:\\QTHT THACO AUTO THANH HOA</code>.</li>
            <li>Nhấn nút xanh <strong>Publish repository</strong>, đặt Name là <code>plan-dept</code> (bỏ tích <em>Keep this code private</em> nếu dùng GitHub Free để bật GitHub Pages) → nhấn <strong>Publish repository</strong>.</li>
          </ol>
        </div>
      </details>

      <details class="notion-toggle" open>
        <summary>Bước 2: Bật GitHub Pages để nhận đường link Website</summary>
        <div class="toggle-body">
          <ol>
            <li>Mở trình duyệt vào <code>https://github.com/thacoautothanhhoa/plan-dept</code>.</li>
            <li>Vào tab <strong>Settings</strong> → chọn mục <strong>Pages</strong> ở cột bên trái.</li>
            <li>Tại mục <strong>Branch</strong>, chọn nhánh <strong>main</strong> và thư mục <strong>/ (root)</strong> → nhấn <strong>Save</strong>.</li>
            <li>Đợi khoảng 30–60 giây và tải lại trang: website sẽ hoạt động tại <code>https://thacoautothanhhoa.github.io/plan-dept/</code>.</li>
          </ol>
        </div>
      </details>

      <details class="notion-toggle" open>
        <summary>Bước 3: Cập nhật dữ liệu mới hàng tuần</summary>
        <div class="toggle-body">
          <ol>
            <li>Chỉnh sửa trực tiếp kế hoạch/văn bản trên giao diện web → nhấn <strong>Đồng bộ dữ liệu</strong> (góc dưới thanh bên) → chọn <strong>Tải file defaultData.js</strong>.</li>
            <li>Lưu đè file vừa tải vào <code>D:\\QTHT THACO AUTO THANH HOA\\js\\data\\defaultData.js</code>.</li>
            <li>Mở <strong>GitHub Desktop</strong>, nhập nội dung thay đổi ngắn (VD: <code>Cap nhat ke hoach tuan</code>) → nhấn <strong>Commit to main</strong> → nhấn <strong>Push origin</strong>.</li>
          </ol>
        </div>
      </details>
    `;
  }

  PP.views = PP.views || {};
  PP.views.guide = { render };
})((window.PP = window.PP || {}));
