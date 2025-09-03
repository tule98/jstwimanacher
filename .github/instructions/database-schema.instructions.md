---
applyTo: "**"
---

## 1. Sheet: Categories

Quản lý danh mục chi tiêu.

id (string, khóa chính)
name (string)
color (string)
type (string: 'expense' hoặc 'income')

---

## 2. Sheet: Transactions

Quản lý các khoản chi tiêu/thu nhập.

id (string, khóa chính)
amount (number)
category_id (string, khóa ngoại)
note (string, optional)
created_at (datetime)
updated_at (datetime)
is_resolved (boolean, mặc định true)

---

## Tổng kết

- **Categories**: Quản lý danh mục chi tiêu, dùng name làm khóa.
- **Transactions**: Quản lý các khoản chi tiêu/thu nhập, liên kết với category_name.
- **Transactions.is_resolved**: Đánh dấu giao dịch cần xem xét lại (false) hoặc đã xác nhận (true).

Các sheet này đáp ứng đầy đủ các tính năng quản lý, nhập liệu, thống kê cho app.
