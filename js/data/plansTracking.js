/**
 * Dữ liệu theo dõi & đánh giá thực hiện Kế hoạch Hàng ngày (chốt 19:00) và Hàng tuần (12:00 Thứ Hai)
 * Trích xuất từ:
 * 1) Quản trị thực hiện chỉ tiêu Tháng.2026 - Thaco Auto Thanh Hóa.xlsx (Sheet: BC NGÀY (HÀNG NGÀY))
 * 2) BC THEO DÕI THỰC HIỆN HÀNG TUẦN NĂM 2026.xlsx
 */
window.PP = window.PP || {};
window.PP.PLANS_TRACKING = {
  daily: {
    reportDate: '27/11/2026',
    cutoffTime: '19:00',
    sourceFile: 'Quản trị thực hiện chỉ tiêu Tháng.2026 - Thaco Auto Thanh Hóa.xlsx',
    items: [
      { id: 'd-dl-sum', group: 'Kinh doanh Xe Du lịch', name: 'Tổng Xe Du lịch (XHĐ)', unit: 'Xe', monthTarget: 147, dayActual: 4, monthActual: 47, contractTarget: 147, contractActual: 108, backlog: 63, note: 'Ngày 27/11: 43 KHQT, 6 GDTD, 2 Ký HĐ, 4 XHĐ, 4 ĐKM' },
      { id: 'd-dl-kia', group: 'Kinh doanh Xe Du lịch', name: 'KIA (XHĐ)', unit: 'Xe', monthTarget: 42, dayActual: 0, monthActual: 4, contractTarget: 42, contractActual: 21, backlog: 17, note: 'Đạt 9.5% XHĐ, 50.0% Ký HĐ; cần đẩy nhanh hồ sơ giao 17 HĐ tồn' },
      { id: 'd-dl-maz', group: 'Kinh doanh Xe Du lịch', name: 'MAZDA (XHĐ)', unit: 'Xe', monthTarget: 96, dayActual: 4, monthActual: 42, contractTarget: 96, contractActual: 85, backlog: 43, note: 'Đạt 43.8% XHĐ, 88.5% Ký HĐ; 43 HĐ chờ xuất hóa đơn' },
      { id: 'd-dl-pg', group: 'Kinh doanh Xe Du lịch', name: 'PEUGEOT (XHĐ)', unit: 'Xe', monthTarget: 5, dayActual: 0, monthActual: 1, contractTarget: 5, contractActual: 1, backlog: 0, note: 'Đạt 20.0% XHĐ & Ký HĐ' },
      { id: 'd-dl-bmw', group: 'Kinh doanh Xe Du lịch', name: 'BMW (XHĐ)', unit: 'Xe', monthTarget: 4, dayActual: 0, monthActual: 0, contractTarget: 4, contractActual: 1, backlog: 3, note: '3 HĐ tồn chờ hoàn tất giao xe' },
      { id: 'd-dl-srth', group: 'Kinh doanh Xe Du lịch', name: 'Showroom Thanh Hóa (DL)', unit: 'Xe', monthTarget: 86, dayActual: 1, monthActual: 28, contractTarget: 86, contractActual: 64, backlog: 38, note: '74.4% Ký HĐ, 32.6% XHĐ' },
      { id: 'd-dl-srhh', group: 'Kinh doanh Xe Du lịch', name: 'Showroom Hoằng Hóa (DL)', unit: 'Xe', monthTarget: 15, dayActual: 1, monthActual: 3, contractTarget: 15, contractActual: 13, backlog: 10, note: '86.7% Ký HĐ, 20.0% XHĐ' },
      { id: 'd-dl-srtx', group: 'Kinh doanh Xe Du lịch', name: 'Showroom Thọ Xuân (DL)', unit: 'Xe', monthTarget: 46, dayActual: 2, monthActual: 16, contractTarget: 46, contractActual: 31, backlog: 15, note: '67.4% Ký HĐ, 34.8% XHĐ' },

      { id: 'd-tb-sum', group: 'Kinh doanh Xe Tải Bus', name: 'Tổng Xe Tải, Bus (XHĐ)', unit: 'Xe', monthTarget: 72, dayActual: 6, monthActual: 49, contractTarget: 75, contractActual: 64, backlog: 15, note: 'Ngày 27/11: 13 KHQT, 3 GDTD, 1 Ký HĐ, 6 XHĐ' },
      { id: 'd-tb-tn', group: 'Kinh doanh Xe Tải Bus', name: 'Tải nhẹ (XHĐ)', unit: 'Xe', monthTarget: 50, dayActual: 5, monthActual: 38, contractTarget: 53, contractActual: 49, backlog: 11, note: '76.0% XHĐ, 92.5% Ký HĐ' },
      { id: 'd-tb-tt', group: 'Kinh doanh Xe Tải Bus', name: 'Tải trung, Ben trung (XHĐ)', unit: 'Xe', monthTarget: 15, dayActual: 1, monthActual: 10, contractTarget: 15, contractActual: 13, backlog: 3, note: '66.7% XHĐ, 86.7% Ký HĐ' },
      { id: 'd-tb-tnang', group: 'Kinh doanh Xe Tải Bus', name: 'ĐK, SMRM, Tải nặng (XHĐ)', unit: 'Xe', monthTarget: 4, dayActual: 0, monthActual: 1, contractTarget: 4, contractActual: 1, backlog: 0, note: '25.0% XHĐ' },
      { id: 'd-tb-bus', group: 'Kinh doanh Xe Tải Bus', name: 'Bus & Mini Bus (XHĐ)', unit: 'Xe', monthTarget: 3, dayActual: 0, monthActual: 0, contractTarget: 3, contractActual: 1, backlog: 1, note: '1 HĐ tồn chưa XHĐ' },
      { id: 'd-tb-srhh', group: 'Kinh doanh Xe Tải Bus', name: 'Showroom Hoằng Hóa (TB)', unit: 'Xe', monthTarget: 53, dayActual: 4, monthActual: 44, contractTarget: 56, contractActual: 59, backlog: 13, note: '83.0% XHĐ, vượt chỉ tiêu Ký HĐ (105.4%)' },
      { id: 'd-tb-srtx', group: 'Kinh doanh Xe Tải Bus', name: 'Showroom Thọ Xuân (TB)', unit: 'Xe', monthTarget: 19, dayActual: 2, monthActual: 3, contractTarget: 19, contractActual: 5, backlog: 2, note: '15.8% XHĐ, 26.3% Ký HĐ' },

      { id: 'd-dvdl-sum', group: 'Dịch vụ Phụ tùng Du lịch', name: 'Tổng DT DVPT Xe Du lịch', unit: 'Tr.đ', monthTarget: 5926, dayActual: 328, monthActual: 3106, contractTarget: 2652, contractActual: 1215, backlog: 1158, note: 'Lũy kế 52.4% (+1.158 tr.đ tồn xưởng = 72.0%); 108 lượt xe ngày 27/11' },
      { id: 'd-dvdl-kia', group: 'Dịch vụ Phụ tùng Du lịch', name: 'MGĐ Kia', unit: 'Tr.đ', monthTarget: 507, dayActual: 18, monthActual: 304, contractTarget: 308, contractActual: 202, backlog: 27, note: '60.0% KH tháng (16 lượt xe hôm nay)' },
      { id: 'd-dvdl-maz', group: 'Dịch vụ Phụ tùng Du lịch', name: 'MGĐ Mazda', unit: 'Tr.đ', monthTarget: 2765, dayActual: 128, monthActual: 1749, contractTarget: 1618, contractActual: 711, backlog: 384, note: '63.3% KH tháng (58 lượt xe hôm nay)' },
      { id: 'd-dvdl-pg', group: 'Dịch vụ Phụ tùng Du lịch', name: 'MGĐ Peugeot - BMW', unit: 'Tr.đ', monthTarget: 915, dayActual: 89, monthActual: 587, contractTarget: 403, contractActual: 189, backlog: 188, note: '64.2% KH tháng (17 lượt xe hôm nay)' },
      { id: 'd-dvdl-ds', group: 'Dịch vụ Phụ tùng Du lịch', name: 'Đồng sơn Du lịch', unit: 'Tr.đ', monthTarget: 1739, dayActual: 94, monthActual: 466, contractTarget: 323, contractActual: 113, backlog: 559, note: '26.8% đã XHĐ + 559 tr.đ tồn xưởng chờ quyết toán bảo hiểm' },

      { id: 'd-dvtb-sum', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'Tổng DT DVPT Xe Tải Bus', unit: 'Tr.đ', monthTarget: 3565, dayActual: 247, monthActual: 1631, contractTarget: 1277, contractActual: 650, backlog: 977, note: 'Lũy kế 45.8% (+977 tr.đ tồn xưởng = 73.2%); 61 lượt xe ngày 27/11' },
      { id: 'd-dvtb-t', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'MGĐ Tải', unit: 'Tr.đ', monthTarget: 1667, dayActual: 71, monthActual: 975, contractTarget: 850, contractActual: 501, backlog: 344, note: '58.5% KH tháng' },
      { id: 'd-dvtb-b', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'MGĐ Bus', unit: 'Tr.đ', monthTarget: 710, dayActual: 46, monthActual: 247, contractTarget: 265, contractActual: 85, backlog: 143, note: '34.8% KH tháng' },
      { id: 'd-dvtb-ds', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'Đồng sơn Tải Bus', unit: 'Tr.đ', monthTarget: 881, dayActual: 130, monthActual: 329, contractTarget: 162, contractActual: 64, backlog: 490, note: '37.3% đã XHĐ + 490 tr.đ tồn xưởng' },
    ],
    checkpoints: [
      { id: 'dc-1', dept: 'PKD Xe Du lịch', task: 'Cập nhật số liệu KHQT, GDTD, Ký HĐ, XHĐ, ĐKM (Kia, Mazda, Peugeot, BMW)', deadline: '17:30', done: true },
      { id: 'dc-2', dept: 'PKD Xe Tải Bus', task: 'Cập nhật số liệu Tải nhẹ, Tải trung, Tải nặng, Bus tại HH & Thọ Xuân', deadline: '17:30', done: true },
      { id: 'dc-3', dept: 'Phòng DVPT DL & TB', task: 'Chốt lượt xe, doanh thu DVSC, tổng DT DVPT và tồn xưởng cuối ngày', deadline: '18:00', done: true },
      { id: 'dc-4', dept: 'Trợ lý Kế hoạch', task: 'Kiểm tra khớp số liệu, khóa sheet BC NGÀY và gửi đánh giá thực hiện ngày', deadline: '19:00', done: false },
    ],
  },
  weekly: {
    cutoffLabel: '12:00 Thứ Hai hàng tuần',
    sourceFile: 'BC THEO DÕI THỰC HIỆN HÀNG TUẦN NĂM 2026.xlsx',
    thresholds: {
      weeklyRedBelow: 80,
      monthCumByWeek: { 1: 25, 2: 50, 3: 75, 4: 100 },
    },
    weeks: [
      { id: 'w1', num: 1, label: 'Tuần 1 (01/11 – 08/11)' },
      { id: 'w2', num: 2, label: 'Tuần 2 (09/11 – 15/11)' },
      { id: 'w3', num: 3, label: 'Tuần 3 (16/11 – 22/11)' },
      { id: 'w4', num: 4, label: 'Tuần 4 (23/11 – 30/11)' },
    ],
    items: [
      {
        id: 'w-kia', group: 'Kinh doanh Xe', name: 'Xe KIA (XHĐ)', unit: 'Xe', monthTarget: 42, cumTo22: 3, estMonth: 30,
        byWeek: {
          w1: { kh: 1, th: 0, contractKh: 7, contractTh: 6 },
          w2: { kh: 3, th: 1, contractKh: 6, contractTh: 6 },
          w3: { kh: 3, th: 2, contractKh: 9, contractTh: 7 },
          w4: { kh: 6, th: 1, contractKh: 9, contractTh: 3 },
        },
        advisory: 'Đẩy nhanh giải ngân và xuất hóa đơn các hợp đồng tồn của nhóm SUV doanh số.',
      },
      {
        id: 'w-mazda', group: 'Kinh doanh Xe', name: 'Xe MAZDA (XHĐ)', unit: 'Xe', monthTarget: 77, cumTo22: 14, estMonth: 76,
        byWeek: {
          w1: { kh: 1, th: 0, contractKh: 14, contractTh: 8 },
          w2: { kh: 4, th: 5, contractKh: 21, contractTh: 17 },
          w3: { kh: 8, th: 9, contractKh: 25, contractTh: 27 },
          w4: { kh: 31, th: 28, contractKh: 26, contractTh: 32 },
        },
        advisory: 'Tốc độ Ký HĐ đạt tốt; tập trung dồn lực giao xe Tuần 4 để đạt >= 76 xe XHĐ.',
      },
      {
        id: 'w-peugeot', group: 'Kinh doanh Xe', name: 'Xe PEUGEOT (XHĐ)', unit: 'Xe', monthTarget: 6, cumTo22: 1, estMonth: 3,
        byWeek: {
          w1: { kh: 0, th: 0, contractKh: 1, contractTh: 1 },
          w2: { kh: 1, th: 1, contractKh: 3, contractTh: 0 },
          w3: { kh: 0, th: 0, contractKh: 2, contractTh: 0 },
          w4: { kh: 2, th: 0, contractKh: 2, contractTh: 0 },
        },
        advisory: 'Cảnh báo đỏ tiến độ lũy kế; rà soát danh sách khách hàng tiềm năng 2008 & 3008.',
      },
      {
        id: 'w-bmw', group: 'Kinh doanh Xe', name: 'Xe BMW (XHĐ)', unit: 'Xe', monthTarget: 5, cumTo22: 0, estMonth: 2,
        byWeek: {
          w1: { kh: 0, th: 0, contractKh: 1, contractTh: 0 },
          w2: { kh: 0, th: 0, contractKh: 1, contractTh: 0 },
          w3: { kh: 0, th: 0, contractKh: 2, contractTh: 0 },
          w4: { kh: 1, th: 0, contractKh: 4, contractTh: 1 },
        },
        advisory: 'Bám sát lịch xe về và phối hợp tư vấn khách hàng cao cấp tại TP. Thanh Hóa.',
      },
      {
        id: 'w-tb', group: 'Kinh doanh Xe', name: 'Xe TẢI, BUS (XHĐ)', unit: 'Xe', monthTarget: 72, cumTo22: 33, estMonth: 64,
        byWeek: {
          w1: { kh: 4, th: 3, contractKh: 24, contractTh: 17 },
          w2: { kh: 9, th: 9, contractKh: 17, contractTh: 17 },
          w3: { kh: 12, th: 12, contractKh: 16, contractTh: 16 },
          w4: { kh: 46, th: 16, contractKh: 9, contractTh: 14 },
        },
        advisory: 'Duy trì nhịp Tải nhẹ, Tải trung và đẩy nhanh thủ tục hồ sơ vay cho các đơn Tải nặng/Bus.',
      },
      {
        id: 'w-dvdl', group: 'Dịch vụ Phụ tùng', name: 'Tổng DT DVPT Xe Du lịch', unit: 'Tr.đ', monthTarget: 5926, cumTo22: 2807, estMonth: 5353,
        byWeek: {
          w1: { kh: 957, th: 1034, contractKh: 406, contractTh: 553 },
          w2: { kh: 1117, th: 924, contractKh: 474, contractTh: 376 },
          w3: { kh: 891, th: 846, contractKh: 352, contractTh: 388 },
          w4: { kh: 1523, th: 299, contractKh: 601, contractTh: 108 },
        },
        advisory: 'Cần đẩy nhanh quyết toán hồ sơ bảo hiểm đồng sơn tồn xưởng (1.158 tr.đ) trong Tuần 4.',
      },
      {
        id: 'w-dvtb', group: 'Dịch vụ Phụ tùng', name: 'Tổng DT DVPT Xe Tải Bus', unit: 'Tr.đ', monthTarget: 3564, cumTo22: 1257, estMonth: 2853,
        byWeek: {
          w1: { kh: 855, th: 411, contractKh: 306, contractTh: 178 },
          w2: { kh: 855, th: 366, contractKh: 306, contractTh: 171 },
          w3: { kh: 855, th: 480, contractKh: 306, contractTh: 173 },
          w4: { kh: 716, th: 374, contractKh: 253, contractTh: 128 },
        },
        advisory: 'Tỷ lệ TH tuần dưới ngưỡng 80%; tăng cường mời xe bảo dưỡng đội xe tải/bus và xử lý tồn xưởng 977 tr.đ.',
      },
    ],
    checkpoints: [
      { id: 'wc-1', dept: 'Các Bộ phận KD & DVPT', task: 'Hoàn tất chốt số liệu tuần & giải trình nguyên nhân các chỉ tiêu dưới 80%', deadline: '09:30 Thứ Hai', done: true },
      { id: 'wc-2', dept: 'Trợ lý Kế hoạch', task: 'Đối chiếu số liệu 8 sheet trong BC THEO DÕI THỰC HIỆN HÀNG TUẦN NĂM 2026', deadline: '11:00 Thứ Hai', done: true },
      { id: 'wc-3', dept: 'Trợ lý Kế hoạch', task: 'Hoàn thành Đánh giá thực hiện Tuần & Tham mưu giải pháp trình giao ban', deadline: '12:00 Thứ Hai', done: false },
    ],
  },
};
