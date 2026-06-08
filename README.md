# 🚀 UTC Survey Auto-Fill Extension

**UTC Survey Auto-Fill** là một tiện ích mở rộng trên Chrome được thiết kế riêng cho sinh viên Trường Đại học Giao thông Vận tải (UTC). Công cụ này giúp tự động hóa quá trình điền khảo sát/đánh giá trên hệ thống `sis.utc.edu.vn`, giúp tiết kiệm thời gian và giảm thiểu các thao tác lặp đi lặp lại.

## ✨ Tính năng nổi bật

- **Fill Current Subject:** Tự động điền khảo sát cho môn được chọn hiện tại.
- **⚡ Auto Fill All:** Tự động điền khảo sát cho toàn bộ danh sách học phần và thực hiện gửi (Submit) tự động.
- **🔍 Intelligent Tab Detection:** 
    - Tự động nhận diện tab khảo sát UTC đang mở.
    - Nếu chưa mở trang khảo sát, extension sẽ nhắc nhở
- **🛡️ Save-to-Unlock:** Cơ chế bảo vệ giúp đảm bảo các cấu hình khảo sát được lưu trước khi thực hiện các hành động tự động.
- **📊 Status Reporting:** Hiển thị thông báo trạng thái trực quan khi bạn ở sai trang hoặc hệ thống chưa sẵn sàng.

## 🛠️ Cấu trúc dự án

```text
UTC-survey-auto-fill/
├── manifest.json         # File cấu hình extension
├── background.js        # Xử lý các tác vụ nền
├── content/
│   └── content.js       # Script tương tác trực tiếp với trang web
├── popup/               # Giao diện điều khiển (UI)
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── utils/               # Các module xử lý logic
    ├── filler.js        # Logic điền form
    ├── strategies.js    # Chiến thuật chọn câu trả lời
    └── surveyParser.js  # Phân tích cấu trúc câu hỏi
```

## 📦 Hướng dẫn cài đặt

1. **Tải mã nguồn:** Tải hoặc Clone repository này về máy tính của bạn.
2. **Mở quản lý tiện ích:** Mở Chrome và truy cập đường dẫn `chrome://extensions/`.
3. **Bật chế độ nhà phát triển:** Gạt công tắc **Developer mode** ở góc trên bên phải.
4. **Nạp tiện ích:** Nhấn vào nút **Load unpacked** và chọn thư mục `UTC-survey-auto-fill` của bạn.

## 📝 Hướng dẫn sử dụng

1. **Mở trang khảo sát:** Truy cập [sis.utc.edu.vn](https://sis.utc.edu.vn) và đăng nhập vào mục khảo sát.
2. **Mở Extension:** Nhấn vào biểu tượng extension trên thanh công cụ. 
   - *Lưu ý:* Nếu bạn chưa ở đúng trang, extension sẽ hiển thị thông báo "Bạn không ở trang khảo sát UTC".
3. **Lưu cấu hình:** Chọn các tùy chọn mong muốn và nhấn **Save**.
4. **Bắt đầu:** Nhấn nút **Auto Fill All** để hệ thống tự động điền và bạn chỉ cần **OK** đến khi hoàn tất.

## ⚠️ Lưu ý (Disclaimer)

- Công cụ này được phát triển cho mục đích học tập và hỗ trợ cá nhân. 
- Vui lòng sử dụng có trách nhiệm.
