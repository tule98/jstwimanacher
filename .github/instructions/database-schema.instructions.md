---
applyTo: "**"
---

## 1. Table: Categories

Quản lý danh mục chi tiêu.

id (string, khóa chính)
name (string)
color (string)
type (string: 'expense' hoặc 'income')

---

## 2. Table: Transactions

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

---

## 3. Table: Assets

Quản lý các loại tài sản.

id (string, khóa chính)
name (string)
color (string)
created_at (datetime)

---

## 4. Table: Asset Conversions

Quản lý chuyển đổi tiền thành tài sản.

id (string, khóa chính)
asset_id (string, khóa ngoại)
transaction_id (string, khóa ngoại)
conversion_type (string: 'buy' hoặc 'sell')
created_at (datetime)
updated_at (datetime)

---

## Business Rules cho Asset Conversions

- **Asset Conversions**: Liên kết giao dịch tiền với tài sản
- **conversion_type = 'buy'**: Chuyển đổi tiền → tài sản (giao dịch chi tiêu)
- **conversion_type = 'sell'**: Chuyển đổi tài sản → tiền (giao dịch thu nhập)

### API endpoints mở rộng:

- `/api/assets`: CRUD quản lý tài sản
- `/api/conversions`: Quản lý chuyển đổi asset-transaction
- `/api/config`: Cấu hình chung categories và assets

---

## Tổng kết

- **Categories**: Quản lý danh mục chi tiêu, dùng name làm khóa.
- **Transactions**: Quản lý các khoản chi tiêu/thu nhập, liên kết với category_id.
- **Assets**: Quản lý các loại tài sản có thể đầu tư.
- **Asset Conversions**: Liên kết giao dịch tiền với việc mua/bán tài sản.
- **Transactions.is_resolved**: Đánh dấu giao dịch cần xem xét lại (false) hoặc đã xác nhận (true).
- **Transactions.is_virtual**: Đánh dấu giao dịch ảo/dự định (true) hoặc thực tế (false).

### Quy tắc nghiệp vụ Virtual Transactions:

1. Virtual transactions được load riêng không phụ thuộc tháng
2. Số dư thực tế chỉ tính transactions thực tế của tháng hiện tại
3. Số dư tổng bao gồm cả virtual expenses để dự báo tài chính

### Quy tắc nghiệp vụ Asset Conversions:

1. Mỗi asset conversion phải liên kết với 1 transaction
2. Buy conversion tạo transaction chi tiêu (amount âm)
3. Sell conversion tạo transaction thu nhập (amount dương)
4. Assets hiển thị danh sách tài sản đang sở hữu dựa trên buy/sell count

Các sheet này đáp ứng đầy đủ các tính năng quản lý, nhập liệu, thống kê và quản lý tài sản cho app.
