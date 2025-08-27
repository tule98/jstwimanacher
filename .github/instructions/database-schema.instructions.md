---
applyTo: '**'
---
## 1. Sheet: Categories
Quản lý danh mục chi tiêu.

| name (string, khóa) | color (string) |
|---------------------|---------------|
| Thiết yếu: Nhà                | #B71C1C |
| Thiết yếu: Ăn uống cá nhân    | #388E3C |
| Thiết yếu: Ăn uống bạn bè     | #388E3C |
| Thiết yếu: Gửi xe             | #37474F |
| Thiết yếu: Di chuyển          | #1E40AF |
| Hưởng thụ: Mua sắm            | #C5E1A5 |
| Hưởng thụ: Đi chơi            | #C5E1A5 |
| Giáo dục: Học phí             | #90CAF9 |
| Đầu tư: Vàng                  | #FFE082 |
| Tiết kiệm: Thi bằng lái       | #CE93D8 |
| Tiết kiệm: Mua quà cho ba mẹ  | #CE93D8 |
| Tiết kiệm: Bảo hiểm           | #CE93D8 |
| Tiết kiệm: Dự phòng           | #CE93D8 |
| Tiết kiệm: Khởi nghiệp        | #CE93D8 |
| Từ thiện                      | #FFCDD2 |
| Phát sinh                     | #212121 |
| Phát sinh: Người thân         | #BDBDBD |

---

## 2. Sheet: Transactions
Quản lý các khoản chi tiêu/thu nhập.

| amount (number) | category_name (string, khóa ngoại) | note (string, optional) | created_at (datetime) | updated_at (datetime) |
|-----------------|------------------------------------|------------------------|----------------------|----------------------|
| 50000           | Thiết yếu: Ăn uống cá nhân         | Mua cà phê              | 2025-08-27T09:00:00  | 2025-08-27T09:00:00  |
| ...             | ...                                | ...                    | ...                  | ...                  |

---

## Tổng kết
- **Categories**: Quản lý danh mục chi tiêu, dùng name làm khóa.
- **Transactions**: Quản lý các khoản chi tiêu/thu nhập, liên kết với category_name.

Các sheet này đáp ứng đầy đủ các tính năng quản lý, nhập liệu, thống kê cho app.
