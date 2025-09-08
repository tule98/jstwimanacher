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
is_virtual (boolean, mặc định false)

---

## Business Rules cho Virtual Transactions

- **Virtual Transactions (Giao dịch ảo)**: Đánh dấu các giao dịch lên kế hoạch hoặc dự định
- **is_virtual = false**: Giao dịch thực tế đã thực hiện
- **is_virtual = true**: Giao dịch ảo/dự định chưa thực hiện

### Tính toán số dư:

- **Số dư hiện tại (thực tế)**: income_real - expense_real
- **Số dư tổng**: income_real - expense_real + expense_virtual

### API endpoints:

- `/api/transactions`: Lấy transactions theo tháng hoặc tất cả
- `/api/transactions/virtual`: Lấy tất cả virtual transactions (không phụ thuộc thời gian)
- `/api/stats/balance`: Trả về thống kê phân tách real/virtual cho tháng cụ thể

---

## Tổng kết

- **Categories**: Quản lý danh mục chi tiêu, dùng name làm khóa.
- **Transactions**: Quản lý các khoản chi tiêu/thu nhập, liên kết với category_id.
- **Transactions.is_resolved**: Đánh dấu giao dịch cần xem xét lại (false) hoặc đã xác nhận (true).
- **Transactions.is_virtual**: Đánh dấu giao dịch ảo/dự định (true) hoặc thực tế (false).

### Quy tắc nghiệp vụ Virtual Transactions:

1. Virtual transactions được load riêng không phụ thuộc tháng
2. Số dư thực tế chỉ tính transactions thực tế của tháng hiện tại
3. Số dư tổng bao gồm cả virtual expenses để dự báo tài chính

Các sheet này đáp ứng đầy đủ các tính năng quản lý, nhập liệu, thống kê cho app.
