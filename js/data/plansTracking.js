/**
 * Dữ liệu theo dõi & đánh giá thực hiện Kế hoạch Hàng ngày (chốt 19:00) và Hàng tuần (12:00 Thứ Hai)
 * Nguồn:
 * 1) Quản trị thực hiện chỉ tiêu Tháng.2026 - Thaco Auto Thanh Hóa.xlsx (Sheet: BC NGÀY (HÀNG NGÀY))
 * 2) BC THEO DÕI THỰC HIỆN HÀNG TUẦN NĂM 2026.xlsx
 */
window.PP = window.PP || {};
window.PP.PLANS_TRACKING = {
  daily: {
    reportDate: '27/11/2026',
    cutoffTime: '19:00',
    sourceFile: 'Quản trị thực hiện chỉ tiêu Tháng.2026 - Thaco Auto Thanh Hóa.xlsx',
    previousDay: {
      reportDate: '26/11/2026',
      arrays: {
        'Kinh doanh Xe Du lịch': { prevMonthActual: 43, prevContractActual: 106 },
        'Kinh doanh Xe Tải Bus': { prevMonthActual: 43, prevContractActual: 63 },
        'Kinh doanh Xe DL đã QSD': { prevMonthActual: 1, prevContractActual: 1 },
        'Dịch vụ Phụ tùng Du lịch': { prevMonthActual: 2778, prevDvscActual: 704 },
        'Dịch vụ Phụ tùng Tải Bus': { prevMonthActual: 1384, prevDvscActual: 416.5 },
      },
    },
    confirmedZeroArrays: [],
    vehicleRows: [
      { id: 'v-kia', group: 'Kinh doanh Xe Du lịch', name: 'KIA', thT10: 29, carryOver: 1, planKhqt: 378, planGdtd: 126, contractTarget: 42, monthTarget: 42, planDkm: 35, dayKhqt: 6, dayGdtd: 3, dayContract: 0, dayActual: 0, dayDkm: 1, cumKhqt: 119, cumGdtd: 39, contractActual: 21, monthActual: 4, cumDkm: 18, remKhqt: 434, remGdtd: 14, backlog: 17, xhdNotDkm: 0 },
      { id: 'v-mazda', group: 'Kinh doanh Xe Du lịch', name: 'MAZDA', thT10: 81, carryOver: 1, planKhqt: 864, planGdtd: 288, contractTarget: 96, monthTarget: 96, planDkm: 90, dayKhqt: 34, dayGdtd: 3, dayContract: 2, dayActual: 4, dayDkm: 3, cumKhqt: 949, cumGdtd: 162, contractActual: 85, monthActual: 42, cumDkm: 60, remKhqt: 3126, remGdtd: 137, backlog: 43, xhdNotDkm: 30 },
      { id: 'v-peugeot', group: 'Kinh doanh Xe Du lịch', name: 'PEUGEOT', thT10: 1, carryOver: 0, planKhqt: 45, planGdtd: 15, contractTarget: 5, monthTarget: 5, planDkm: 4, dayKhqt: 1, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 56, cumGdtd: 2, contractActual: 1, monthActual: 1, cumDkm: 2, remKhqt: 181, remGdtd: 4, backlog: 0, xhdNotDkm: 0 },
      { id: 'v-bmw', group: 'Kinh doanh Xe Du lịch', name: 'BMW', thT10: 2, carryOver: 2, planKhqt: 36, planGdtd: 12, contractTarget: 4, monthTarget: 4, planDkm: 3, dayKhqt: 2, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 19, cumGdtd: 0, contractActual: 1, monthActual: 0, cumDkm: 0, remKhqt: 73, remGdtd: 5, backlog: 3, xhdNotDkm: 0 },
      { id: 'v-dl-sum', group: 'Kinh doanh Xe Du lịch', name: 'Tổng xe DL', isSummary: true, thT10: 113, carryOver: 4, planKhqt: 1323, planGdtd: 441, contractTarget: 147, monthTarget: 147, planDkm: 132, dayKhqt: 43, dayGdtd: 6, dayContract: 2, dayActual: 4, dayDkm: 4, cumKhqt: 1143, cumGdtd: 203, contractActual: 108, monthActual: 47, cumDkm: 80, remKhqt: 3814, remGdtd: 160, backlog: 63, xhdNotDkm: 30 },
      { id: 'v-sr-th', group: 'Kinh doanh Xe Du lịch', name: 'SR Thanh Hóa', isSubRow: true, thT10: 68, carryOver: 2, planKhqt: 774, planGdtd: 258, contractTarget: 86, monthTarget: 86, planDkm: 78, dayKhqt: 32, dayGdtd: 1, dayContract: 1, dayActual: 1, dayDkm: 0, cumKhqt: 885, cumGdtd: 115, contractActual: 64, monthActual: 28, cumDkm: 45, remKhqt: 2895, remGdtd: 118, backlog: 38, xhdNotDkm: 25 },
      { id: 'v-sr-hh', group: 'Kinh doanh Xe Du lịch', name: 'SR Hoằng Hóa', isSubRow: true, thT10: 9, carryOver: 1, planKhqt: 135, planGdtd: 45, contractTarget: 15, monthTarget: 15, planDkm: 43, dayKhqt: 4, dayGdtd: 1, dayContract: 1, dayActual: 1, dayDkm: 0, cumKhqt: 56, cumGdtd: 18, contractActual: 13, monthActual: 3, cumDkm: 6, remKhqt: 154, remGdtd: 10, backlog: 10, xhdNotDkm: 4 },
      { id: 'v-sr-tx', group: 'Kinh doanh Xe Du lịch', name: 'SR Thọ Xuân', isSubRow: true, thT10: 36, carryOver: 1, planKhqt: 414, planGdtd: 138, contractTarget: 46, monthTarget: 46, planDkm: 11, dayKhqt: 7, dayGdtd: 4, dayContract: 0, dayActual: 2, dayDkm: 4, cumKhqt: 202, cumGdtd: 70, contractActual: 31, monthActual: 16, cumDkm: 29, remKhqt: 765, remGdtd: 32, backlog: 15, xhdNotDkm: 1 },

      { id: 'v-tn', group: 'Kinh doanh Xe Tải Bus', name: 'TẢI NHẸ', thT10: 47, carryOver: 0, planKhqt: 270, planGdtd: 110, contractTarget: 53, monthTarget: 50, planDkm: 43, dayKhqt: 10, dayGdtd: 2, dayContract: 1, dayActual: 5, dayDkm: 0, cumKhqt: 243, cumGdtd: 63, contractActual: 49, monthActual: 38, cumDkm: 4, remKhqt: 506, remGdtd: 25, backlog: 11, xhdNotDkm: 1 },
      { id: 'v-tt', group: 'Kinh doanh Xe Tải Bus', name: 'TẢI TRUNG, BEN TRUNG', thT10: 10, carryOver: 0, planKhqt: 59, planGdtd: 30, contractTarget: 15, monthTarget: 15, planDkm: 8, dayKhqt: 3, dayGdtd: 1, dayContract: 0, dayActual: 1, dayDkm: 0, cumKhqt: 60, cumGdtd: 18, contractActual: 13, monthActual: 10, cumDkm: 1, remKhqt: 106, remGdtd: 7, backlog: 3, xhdNotDkm: 0 },
      { id: 'v-tnang', group: 'Kinh doanh Xe Tải Bus', name: 'ĐK, SMRM, TẢI NẶNG', thT10: 0, carryOver: 0, planKhqt: 18, planGdtd: 8, contractTarget: 4, monthTarget: 4, planDkm: 5, dayKhqt: 0, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 7, cumGdtd: 2, contractActual: 1, monthActual: 1, cumDkm: 0, remKhqt: 14, remGdtd: 0, backlog: 0, xhdNotDkm: 0 },
      { id: 'v-bus', group: 'Kinh doanh Xe Tải Bus', name: 'BUS & MINI BUS', thT10: 1, carryOver: 0, planKhqt: 14, planGdtd: 4, contractTarget: 3, monthTarget: 3, planDkm: 5, dayKhqt: 0, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 5, cumGdtd: 3, contractActual: 1, monthActual: 0, cumDkm: 0, remKhqt: 16, remGdtd: 1, backlog: 1, xhdNotDkm: 0 },
      { id: 'v-tb-sum', group: 'Kinh doanh Xe Tải Bus', name: 'Tổng xe TB', isSummary: true, thT10: 58, carryOver: 0, planKhqt: 361, planGdtd: 152, contractTarget: 75, monthTarget: 72, planDkm: 61, dayKhqt: 13, dayGdtd: 3, dayContract: 1, dayActual: 6, dayDkm: 0, cumKhqt: 315, cumGdtd: 86, contractActual: 64, monthActual: 49, cumDkm: 5, remKhqt: 642, remGdtd: 33, backlog: 15, xhdNotDkm: 1 },
      { id: 'v-tb-hh', group: 'Kinh doanh Xe Tải Bus', name: 'SR Hoằng Hóa', isSubRow: true, thT10: 48, carryOver: 0, planKhqt: 255, planGdtd: 114, contractTarget: 56, monthTarget: 53, planDkm: 45, dayKhqt: 7, dayGdtd: 2, dayContract: 1, dayActual: 4, dayDkm: 0, cumKhqt: 241, cumGdtd: 75, contractActual: 59, monthActual: 44, cumDkm: 4, remKhqt: 437, remGdtd: 25, backlog: 13, xhdNotDkm: 1 },
      { id: 'v-tb-tx', group: 'Kinh doanh Xe Tải Bus', name: 'SR Thọ Xuân', isSubRow: true, thT10: 10, carryOver: 0, planKhqt: 106, planGdtd: 38, contractTarget: 19, monthTarget: 19, planDkm: 16, dayKhqt: 6, dayGdtd: 1, dayContract: 0, dayActual: 2, dayDkm: 0, cumKhqt: 74, cumGdtd: 11, contractActual: 5, monthActual: 3, cumDkm: 1, remKhqt: 205, remGdtd: 8, backlog: 2, xhdNotDkm: 0 },

      { id: 'v-qsd-kia', group: 'Kinh doanh Xe DL đã QSD', name: 'KIA (QSD)', thT10: 0, carryOver: 0, planKhqt: 0, planGdtd: 0, contractTarget: 1, monthTarget: 1, planDkm: 0, dayKhqt: 0, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 0, cumGdtd: 0, contractActual: 0, monthActual: 0, cumDkm: 0, remKhqt: 0, remGdtd: 0, backlog: 0, xhdNotDkm: 0 },
      { id: 'v-qsd-maz', group: 'Kinh doanh Xe DL đã QSD', name: 'MAZDA (QSD)', thT10: 2, carryOver: 0, planKhqt: 0, planGdtd: 0, contractTarget: 2, monthTarget: 2, planDkm: 0, dayKhqt: 0, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 0, cumGdtd: 0, contractActual: 1, monthActual: 1, cumDkm: 0, remKhqt: 0, remGdtd: 0, backlog: 0, xhdNotDkm: 0 },
      { id: 'v-qsd-pg', group: 'Kinh doanh Xe DL đã QSD', name: 'PEUGEOT (QSD)', thT10: 0, carryOver: 0, planKhqt: 0, planGdtd: 0, contractTarget: 1, monthTarget: 1, planDkm: 0, dayKhqt: 0, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 0, cumGdtd: 0, contractActual: 0, monthActual: 0, cumDkm: 0, remKhqt: 0, remGdtd: 0, backlog: 0, xhdNotDkm: 0 },
      { id: 'v-qsd-bmw', group: 'Kinh doanh Xe DL đã QSD', name: 'BMW (QSD)', thT10: 0, carryOver: 0, planKhqt: 0, planGdtd: 0, contractTarget: 0, monthTarget: 0, planDkm: 0, dayKhqt: 0, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 0, cumGdtd: 0, contractActual: 0, monthActual: 0, cumDkm: 0, remKhqt: 0, remGdtd: 0, backlog: 0, xhdNotDkm: 0 },
      { id: 'v-qsd-sum', group: 'Kinh doanh Xe DL đã QSD', name: 'Tổng xe DL đã QSD', isSummary: true, thT10: 2, carryOver: 0, planKhqt: 0, planGdtd: 0, contractTarget: 4, monthTarget: 4, planDkm: 0, dayKhqt: 0, dayGdtd: 0, dayContract: 0, dayActual: 0, dayDkm: 0, cumKhqt: 0, cumGdtd: 0, contractActual: 1, monthActual: 1, cumDkm: 0, remKhqt: 0, remGdtd: 0, backlog: 0, xhdNotDkm: 0 },
    ],
    dvptRows: [
      { id: 'dv-dl-kia', group: 'Dịch vụ Phụ tùng Du lịch', name: 'MGĐ Kia', thT10: 504, carryOver: 0, planVisits: 308, monthTarget: 507, planDvsc: 95, dayVisits: 16, dayActual: 18, dayDvsc: 5, cumVisits: 202, monthActual: 304, cumDvsc: 73, backlogVisits: 18, backlog: 27 },
      { id: 'dv-dl-maz', group: 'Dịch vụ Phụ tùng Du lịch', name: 'MGĐ Mazda', thT10: 2791, carryOver: 27, planVisits: 1618, monthTarget: 2765, planDvsc: 592, dayVisits: 58, dayActual: 128, dayDvsc: 29, cumVisits: 711, monthActual: 1749, cumDvsc: 382, backlogVisits: 84, backlog: 384 },
      { id: 'dv-dl-pg', group: 'Dịch vụ Phụ tùng Du lịch', name: 'MGĐ Peugeot - BMW', thT10: 1060, carryOver: 32, planVisits: 403, monthTarget: 915, planDvsc: 218, dayVisits: 17, dayActual: 89, dayDvsc: 13, cumVisits: 189, monthActual: 587, cumDvsc: 111, backlogVisits: 31, backlog: 188 },
      { id: 'dv-dl-ds', group: 'Dịch vụ Phụ tùng Du lịch', name: 'Đồng sơn', thT10: 1376, carryOver: 110, planVisits: 323, monthTarget: 1739, planDvsc: 552, dayVisits: 17, dayActual: 94, dayDvsc: 47, cumVisits: 113, monthActual: 466, cumDvsc: 231, backlogVisits: 57, backlog: 559 },
      { id: 'dv-dl-sum', group: 'Dịch vụ Phụ tùng Du lịch', name: 'Tổng DVPT DL', isSummary: true, thT10: 5731, carryOver: 169, planVisits: 2652, monthTarget: 5926, planDvsc: 1457, dayVisits: 108, dayActual: 328, dayDvsc: 94, cumVisits: 1215, monthActual: 3106, cumDvsc: 798, backlogVisits: 190, backlog: 1158 },
      { id: 'dv-dl-xth', group: 'Dịch vụ Phụ tùng Du lịch', name: 'Xưởng Thanh Hóa', isSubRow: true, thT10: 4895, carryOver: 139, planVisits: 2184, monthTarget: 5010, planDvsc: 1242, dayVisits: 82, dayActual: 282, dayDvsc: 80, cumVisits: 956, monthActual: 2643, cumDvsc: 659, backlogVisits: 166, backlog: 974 },
      { id: 'dv-dl-xtx', group: 'Dịch vụ Phụ tùng Du lịch', name: 'Xưởng Thọ Xuân', isSubRow: true, thT10: 797, carryOver: 30, planVisits: 469, monthTarget: 916, planDvsc: 215, dayVisits: 25, dayActual: 44, dayDvsc: 14, cumVisits: 255, monthActual: 471, cumDvsc: 131, backlogVisits: 22, backlog: 183 },
      { id: 'dv-dl-xhh', group: 'Dịch vụ Phụ tùng Du lịch', name: 'Xưởng Hoằng Hóa', isSubRow: true, thT10: 39, carryOver: 0, planVisits: 0, monthTarget: 0, planDvsc: 0, dayVisits: 2, dayActual: 3, dayDvsc: 1, cumVisits: 21, monthActual: 36, cumDvsc: 8, backlogVisits: 2, backlog: 1 },

      { id: 'dv-tb-t', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'MGĐ Tải', thT10: 1482, carryOver: 37, planVisits: 850, monthTarget: 1667, planDvsc: 479, dayVisits: 42, dayActual: 71, dayDvsc: 10.6, cumVisits: 501, monthActual: 975, cumDvsc: 250, backlogVisits: 140, backlog: 344 },
      { id: 'dv-tb-b', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'MGĐ Bus', thT10: 681, carryOver: 12, planVisits: 265, monthTarget: 710, planDvsc: 237, dayVisits: 10, dayActual: 46, dayDvsc: 16.9, cumVisits: 85, monthActual: 247, cumDvsc: 93, backlogVisits: 31, backlog: 143 },
      { id: 'dv-tb-ds', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'Đồng Sơn (TB)', thT10: 789, carryOver: 254, planVisits: 162, monthTarget: 881, planDvsc: 382, dayVisits: 9, dayActual: 130, dayDvsc: 31.1, cumVisits: 64, monthActual: 329, cumDvsc: 132, backlogVisits: 23, backlog: 490 },
      { id: 'dv-tb-bl', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'Bán lẻ PT-VT', thT10: 116, carryOver: 0, planVisits: 0, monthTarget: 306, planDvsc: 0, dayVisits: 0, dayActual: 1, dayDvsc: 0, cumVisits: 0, monthActual: 80, cumDvsc: 0, backlogVisits: 0, backlog: 0 },
      { id: 'dv-tb-sum', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'Tổng DVPT TB', isSummary: true, thT10: 3068, carryOver: 303, planVisits: 1277, monthTarget: 3565, planDvsc: 1098, dayVisits: 61, dayActual: 247, dayDvsc: 58.5, cumVisits: 650, monthActual: 1631, cumDvsc: 475, backlogVisits: 194, backlog: 977 },
      { id: 'dv-tb-xhh', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'Xưởng Hoằng Hóa', isSubRow: true, thT10: 2500, carryOver: 302, planVisits: 987, monthTarget: 2918, planDvsc: 942, dayVisits: 48, dayActual: 231, dayDvsc: 56.0, cumVisits: 468, monthActual: 1184, cumDvsc: 378, backlogVisits: 170, backlog: 878 },
      { id: 'dv-tb-xtx', group: 'Dịch vụ Phụ tùng Tải Bus', name: 'Xưởng Thọ Xuân', isSubRow: true, thT10: 568, carryOver: 1, planVisits: 290, monthTarget: 646, planDvsc: 156, dayVisits: 13, dayActual: 17, dayDvsc: 2.5, cumVisits: 182, monthActual: 447, cumDvsc: 98, backlogVisits: 24, backlog: 100 },
    ],
    checkpoints: [
      { id: 'dc-1', dept: 'PKD Xe Du lịch', task: 'Cập nhật Ký HĐ mới, XHĐ, HĐ chưa XHĐ (Kia, Mazda, Peugeot, BMW)', deadline: '17:30', done: true },
      { id: 'dc-2', dept: 'PKD Xe Tải Bus', task: 'Cập nhật Ký HĐ mới, XHĐ, HĐ chưa XHĐ tại SR Hoằng Hóa & Thọ Xuân', deadline: '17:30', done: true },
      { id: 'dc-3', dept: 'Phòng DVPT DL & TB', task: 'Chốt lượt xe, tổng DT DVPT, DT DVSC và tồn xưởng cuối ngày', deadline: '18:00', done: true },
      { id: 'dc-4', dept: 'Trợ lý Kế hoạch', task: 'Kiểm tra đủ 5/5 mảng, tổng hợp đánh giá và chụp khung hình báo cáo ngày', deadline: '19:00', done: false },
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
