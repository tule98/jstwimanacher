---
applyTo: "**"
---

# Product Requirements Document (PRD)

## App Name: jstwimanacher

### Mục tiêu

Xây dựng ứng dụng đa chức năng kết hợp quản lý tài chính cá nhân và tổ chức lịch trình thông minh. Ứng dụng sử dụng Turso (SQLite) làm backend cho phần tài chính và tích hợp Notion API cho phần quản lý lịch trình.

---

## 1. Tính năng chính

### 1.1. Quản lý danh mục (Category)

- Người dùng có thể tạo, sửa, xóa các danh mục chi tiêu/thu nhập.
- Hỗ trợ loại danh mục: 'expense' (chi tiêu) hoặc 'income' (thu nhập).
- Sử dụng Shadcn UI components (dialog, form, card, table) cho giao diện quản lý.
- Hỗ trợ chọn màu sắc cho danh mục bằng color picker.
- Hiển thị danh mục với màu sắc trực quan và icon tương ứng.
- Tối ưu hóa gọi API bằng React Query để lấy, cập nhật dữ liệu danh mục.

### 1.2. Quản lý record tiền bạc

- Form nhập liệu liên tục gồm: số tiền, chọn danh mục, ghi chú, ngày/thời gian.
- Hỗ trợ cả giao dịch thực tế (is_virtual = false) và giao dịch ảo/dự định (is_virtual = true).
- Sử dụng Shadcn UI components (input, select, button, datepicker) cho form nhập.
- Hiển thị danh sách các record với design thẻ (card) có màu tương ứng với danh mục.
- Hỗ trợ các thao tác CRUD (Create, Read, Update, Delete) cho record.
- Tích hợp Lucide Icons cho các button và hiển thị trực quan.
- Tối ưu hóa gọi API bằng React Query cho các thao tác CRUD record.
- **Đánh dấu "resolved" cho giao dịch**: Người dùng có thể đánh dấu giao dịch cần xem xét lại (unresolved) hoặc đã xác nhận (resolved).
  - Hiển thị icon cảnh báo cho các giao dịch chưa resolved.
  - Toggle đơn giản bằng icon để thay đổi trạng thái resolved.
- **Giao dịch ảo (Virtual Transactions)**:
  - Đánh dấu các giao dịch lên kế hoạch hoặc dự định (is_virtual = true).
  - Phân biệt rõ ràng với giao dịch thực tế trong UI.

### 1.3. Thống kê theo tháng và danh mục

- Tính tổng số tiền theo từng danh mục trong tháng hiện tại.
- Phân biệt giữa số dư thực tế và số dư dự kiến (bao gồm virtual transactions).
- Hiển thị bảng/tóm tắt thống kê với balance API riêng biệt.
- Biểu đồ trực quan: Pie Chart (phân bổ chi tiêu), Bar Chart (lịch sử theo tháng).
- Hỗ trợ filter theo tháng/năm, tùy chỉnh hiển thị biểu đồ.

### 1.4. Noxon Schedule Organizer

- **Tích hợp Notion API** để quản lý lịch trình thông minh.
- **3 nguồn dữ liệu chính**:
  - **Tasks**: Công việc cần làm hàng ngày (status: backlog, thisWeek, today, inProgress, inLoop).
  - **Projects**: Dự án đang triển khai (status: inProgress, filter: reachable = false).
  - **Plans**: Sự kiện và kế hoạch tương lai (status: inProgress, todo, inLoop).
- **Tạo prompt AI thông minh**:
  - Phân tích tổng quan tất cả tasks, projects, plans.
  - Lập kế hoạch chi tiết cho ngày hiện tại.
  - Cảnh báo deadline trong 14 và 30 ngày tới.
  - Đề xuất ưu tiên công việc và time-blocking.
- **Copy prompt** để sử dụng với AI assistant.
- **Refresh data** để cập nhật thông tin mới nhất từ Notion.
- **UI độc lập** không hiển thị trong navigation chính.

---

## 2. Giao diện người dùng

- Chủ đạo màu xanh lá cây đậm, hiện đại, thân thiện.
- Giao diện sử dụng TailwindCSS, tối giản.
- Components từ Shadcn UI (dễ tiếp cận, tùy biến cao).
- Phong cách bo tròn, có shadow tăng độ tương phản.
- Hỗ trợ darkmode toàn bộ app.
- Icon từ Lucide Icons (nhẹ, vector, dễ tùy biến).
- Font chữ sử dụng: Poppins ([Google Fonts](https://fonts.google.com/specimen/Poppins)).
- Thiết kế ưu tiên mobile first, đảm bảo hoạt động tốt trên thiết bị di động và tối ưu cho desktop.
- UI thiết kế tập trung vào trải nghiệm người dùng, dễ thao tác.
- Trang nhập record: form nhập nhanh, liên tục.
- Trang quản lý danh mục: thêm/sửa/xóa danh mục.
- Trang danh sách record: hiển thị, chỉnh sửa/xóa.
  - Icon cảnh báo nổi bật cho các giao dịch chưa resolved.
  - Icon đơn giản để đánh dấu resolved/unresolved ngay trên card giao dịch.
- Trang thống kê: tổng hợp theo tháng và danh mục, hiển thị biểu đồ trực quan.

---

## 3. Công nghệ

- **Frontend**:
  - Next.js 15 (React, TypeScript)
  - TailwindCSS (giao diện tối giản, flat, phong cách Airbnb, bo tròn, shadow, darkmode)
  - Shadcn UI (components tái sử dụng, accessible, có khả năng tùy biến cao)
  - React Query (TanStack Query v5) - tối ưu hóa gọi API, cache, data fetching
  - Lucide Icons (thư viện icon nhẹ, đẹp, tùy biến màu sắc)
  - React Charts / Chart.js (biểu đồ tương tác, hiển thị dữ liệu thống kê)
- **Backend**:
  - **Turso (LibSQL)**: Database chính cho financial data (categories, transactions)
  - **Notion API**: Database cho schedule management (tasks, projects, plans)
  - **Drizzle ORM**: Type-safe ORM cho Turso database
  - **Next.js API Routes**: RESTful endpoints
- **Khác**: date-fns để xử lý ngày tháng, uuid cho unique IDs.
- **Framework**: Sử dụng Next.js 15 cho toàn bộ code.

---

## 4. Luồng hoạt động

1. Người dùng nhập record qua form.

2. Người dùng có thể xem, chỉnh sửa, xóa record.
3. Người dùng có thể đánh dấu record cần xem xét lại (unresolved) thông qua icon đơn giản và thay đổi trạng thái sau khi đã xác nhận.
4. Danh mục được quản lý riêng, có thể thêm/sửa/xóa.

5. Tất cả các thao tác lấy và cập nhật dữ liệu đều tối ưu bằng React Query.

---

## 5. Yêu cầu kỹ thuật

- Đảm bảo bảo mật dữ liệu cá nhân.
- UI responsive, tối ưu cho mobile và desktop.
- Hỗ trợ Progressive Web App (PWA): cho phép cài đặt app lên thiết bị, hoạt động offline cơ bản, icon và splash screen riêng.
- Hỗ trợ darkmode toàn bộ app.
- Phong cách bo tròn, shadow tăng độ tương phản.
- Xử lý lỗi và thông báo rõ ràng cho người dùng.
- Sử dụng React Query để quản lý trạng thái và cache dữ liệu API.
- Sử dụng Next.js 15 cho toàn bộ code.
- Sử dụng Shadcn UI cho các components với theme tùy chỉnh.
- Tích hợp Lucide Icons cho các biểu tượng nhất quán.
- Sử dụng React Charts/Chart.js cho các biểu đồ thống kê trực quan.
- Áp dụng các accessibility standards theo WCAG 2.1.

---

## 6. Triển khai

- **Frontend**: Deploy trên Vercel/Netlify
- **Database**: Turso cho financial data, Notion Database cho schedule data
- **Environment Variables**: TURSO*DATABASE_URL, TURSO_AUTH_TOKEN, NOTION_API_KEY, NOTION*\*\_DATABASE_ID

## Triển khai (Deployment)

- Ứng dụng sẽ được deploy trên Vercel để đảm bảo tốc độ, bảo mật và khả năng mở rộng.
- Hỗ trợ auto build và cập nhật mỗi khi có thay đổi trên repository.
- Tích hợp với Turso Cloud database và Notion workspace.

---

## 7. Đo lường thành công

- Người dùng nhập, quản lý, thống kê chi tiêu dễ dàng.
- Dữ liệu lưu trữ an toàn, truy xuất nhanh.
- Giao diện thân thiện, dễ sử dụng.
- Hiệu năng tốt nhờ React Query tối ưu hóa gọi API.
- Giao diện đẹp, bo tròn, shadow, darkmode hiện đại.
- Trải nghiệm người dùng tốt với Shadcn UI components.
- Biểu đồ trực quan giúp người dùng dễ dàng nắm bắt thông tin chi tiêu.
- Người dùng dễ dàng theo dõi và xử lý các giao dịch cần xem xét lại thông qua icon đơn giản.

---

## 8. Timeline đề xuất

1. Khởi tạo dự án, cấu hình màu chủ đạo.
2. Cài đặt và cấu hình Shadcn UI, Lucide Icons và React Charts/Chart.js.
3. Xây dựng UI form nhập record, quản lý danh mục sử dụng Shadcn UI components.
4. Hiển thị danh sách record, chức năng chỉnh sửa/xóa với UI thân thiện.
5. Thêm tính năng đánh dấu resolved/unresolved cho giao dịch bằng icon đơn giản.
6. Tính toán và hiển thị thống kê theo tháng/category, tích hợp biểu đồ trực quan.
7. Tích hợp Notion API cho Noxon Schedule Organizer.
8. Thêm tính năng virtual transactions và balance calculation.
9. Kiểm thử, tối ưu, triển khai.

---

## 9. Tài liệu tham khảo

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query/latest)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Chart.js](https://www.chartjs.org/) / [React Charts](https://react-charts.tanstack.com/)

---

## 10. Ghi chú

- App hướng tới cá nhân, không có chức năng chia sẻ dữ liệu.
- Có thể mở rộng thêm tính năng xuất file, nhắc nhở, v.v.
- Tính năng đánh dấu giao dịch resolved/unresolved giúp người dùng theo dõi các giao dịch cần xem xét lại.
- Virtual transactions cho phép lập kế hoạch tài chính dự báo.
- Noxon Schedule Organizer không hiển thị trong navigation chính, truy cập trực tiếp qua URL.
