# Hướng dẫn Host & Cập nhật Website THACO AUTO Thanh Hóa bằng GitHub Desktop

Thư mục dự án trên máy: `D:\QTHT THACO AUTO THANH HOA`  
Tài khoản GitHub đích: [https://github.com/thacoautothanhhoa](https://github.com/thacoautothanhhoa)  
Link website sau khi bật Pages: `https://thacoautothanhhoa.github.io/plan-dept/`

---

## Bước 1: Thêm & Xuất bản dự án trên GitHub Desktop

1. Mở phần mềm **GitHub Desktop** trên máy tính (hệ thống đã cấu hình sẵn Git với tài khoản `THACO AUTO THANH HÓA`).
2. Trên thanh menu chọn **File $\rightarrow$ Add local repository...** $\rightarrow$ bấm **Choose...** và chọn thư mục:
   `D:\QTHT THACO AUTO THANH HOA`
3. Nhấn nút **Publish repository** ở góc trên (hoặc giữa màn hình):
   - **Name:** `plan-dept` (giống mẫu `thacoautona.github.io/plan-dept/`)
   - **Keep this code private:** **Bỏ tích** (nếu dùng gói GitHub Free để bật GitHub Pages).
4. Nhấn **Publish repository** để đẩy toàn bộ mã nguồn lên GitHub.

---

## Bước 2: Kích hoạt GitHub Pages

1. Truy cập `https://github.com/thacoautothanhhoa/plan-dept`.
2. Chọn tab **Settings** $\rightarrow$ mục **Pages** ở cột bên trái.
3. Tại phần **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** chọn **`main`** và **`/ (root)`** $\rightarrow$ nhấn **Save**.
4. Chờ 30–60 giây rồi tải lại trang (`F5`), đường link chính thức `https://thacoautothanhhoa.github.io/plan-dept/` sẽ hiển thị sẵn sàng.

---

## Bước 3: Quy trình cập nhật dữ liệu hàng tuần

1. Chỉnh sửa kế hoạch, văn bản hoặc sáng kiến ngay trên giao diện web.
2. Nhấn **Đồng bộ dữ liệu** ở góc dưới thanh bên trái $\rightarrow$ bấm **Tải file defaultData.js (Để Push GitHub)**.
3. Chép đè file `defaultData.js` vừa tải vào `D:\QTHT THACO AUTO THANH HOA\js\data\defaultData.js`.
4. Mở **GitHub Desktop** $\rightarrow$ nhập tóm tắt thay đổi (ví dụ: `Cap nhat bao cao tuan`) $\rightarrow$ nhấn **Commit to main** $\rightarrow$ nhấn **Push origin**.
