# jstwimoniluver

Ứng dụng quản lý tài chính cá nhân sử dụng Next.js và Google Sheets làm backend.

## Tính năng

- Quản lý danh mục chi tiêu
- Nhập khoản chi tiêu
- Thống kê theo tháng và danh mục
- Biểu đồ trực quan
- Giao diện responsive
- Hỗ trợ darkmode

## Công nghệ

- Next.js 15
- TailwindCSS
- Shadcn UI
- React Query
- Google Sheets API

## Cài đặt

1. Clone repository này
2. Cài đặt dependencies:
   ```bash
   cd app
   npm install
   ```
3. Tạo file credentials cho Google Sheets API và đặt trong thư mục app
4. Tạo file `.env.local` với nội dung:
   ```
   GOOGLE_SHEET_ID=your_sheet_id
   ```
5. Chạy phiên bản development:
   ```bash
   npm run dev
   ```

## Triển khai lên Vercel

1. Tạo tài khoản Vercel và liên kết với GitHub
2. Import repository từ GitHub
3. Cấu hình:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Root Directory: `app`
4. Thêm biến môi trường:
   - `GOOGLE_SHEET_ID`: ID của Google Sheet
   - `GOOGLE_CREDENTIALS`: Nội dung file JSON credentials (dạng chuỗi)
5. Deploy

## Cấu trúc Sheet

### Sheet Categories
Quản lý danh mục chi tiêu.

| name (string, khóa) | color (string) |
|---------------------|---------------|
| Thiết yếu: Nhà                | #B71C1C |
| Thiết yếu: Ăn uống cá nhân    | #388E3C |
| ...                           | ...     |

### Sheet Transactions
Quản lý các khoản chi tiêu/thu nhập.

| amount (number) | category_name (string, khóa ngoại) | note (string, optional) | created_at (datetime) | updated_at (datetime) |
|-----------------|------------------------------------|------------------------|----------------------|----------------------|
| 50000           | Thiết yếu: Ăn uống cá nhân         | Mua cà phê              | 2025-08-27T09:00:00  | 2025-08-27T09:00:00  |
| ...             | ...                                | ...                    | ...                  | ...                  |

## License

MIT
