---
applyTo: "**"
---

# Google Sheets Service

Service này cung cấp các chức năng tương tác với Google Sheets API, được tách biệt để dễ dàng tái sử dụng trong toàn bộ ứng dụng jstwimoniluver.

## Cấu trúc và tính năng

### 1. Authentication

Service này tự động xử lý authentication với Google Sheets API thông qua Service Account:

```typescript
export function getGoogleAuth(readOnly = true) {
  // Đọc credentials từ file
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

  // Tạo Google Auth client
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: readOnly ? SCOPES.READ_ONLY : SCOPES.READ_WRITE,
  });

  return auth;
}
```

### 2. Categories Service

Xử lý tất cả các thao tác CRUD cho danh mục chi tiêu:

- `getAll()`: Lấy tất cả danh mục
- `add(name, color)`: Thêm danh mục mới
- `update(name, color)`: Cập nhật màu cho danh mục
- `delete(name)`: Xóa danh mục

### 3. Transactions Service

Xử lý tất cả các thao tác với dữ liệu chi tiêu:

- `getAll()`: Lấy tất cả giao dịch
- `getByMonth(month, year)`: Lấy giao dịch theo tháng/năm
- `add(amount, category_name, note)`: Thêm giao dịch mới
- `update(index, data)`: Cập nhật giao dịch
- `delete(index)`: Xóa giao dịch
- `getStatsByCategory(month, year)`: Tính toán thống kê theo danh mục trong một tháng

## Cách sử dụng

### 1. Import Service

```typescript
import {
  CategoriesService,
  TransactionsService,
} from "@/services/googleSheets/googleSheetsService";
```

### 2. Sử dụng Categories Service

```typescript
// Lấy tất cả danh mục
const categories = await CategoriesService.getAll();

// Thêm danh mục mới
await CategoriesService.add("Danh mục mới", "#FF5733");

// Cập nhật màu cho danh mục
await CategoriesService.update("Danh mục mới", "#33FF57");

// Xóa danh mục
await CategoriesService.delete("Danh mục mới");
```

### 3. Sử dụng Transactions Service

```typescript
// Lấy tất cả giao dịch
const transactions = await TransactionsService.getAll();

// Lấy giao dịch theo tháng
const augustTransactions = await TransactionsService.getByMonth(8, 2025);

// Thêm giao dịch mới
await TransactionsService.add(
  50000,
  "Thiết yếu: Ăn uống cá nhân",
  "Mua cà phê"
);

// Cập nhật giao dịch
await TransactionsService.update(0, {
  amount: 55000,
  note: "Mua cà phê và bánh",
});

// Xóa giao dịch
await TransactionsService.delete(0);

// Lấy thống kê theo danh mục trong tháng 8/2025
const stats = await TransactionsService.getStatsByCategory(8, 2025);
```

## Cấu hình

Service sử dụng các biến môi trường sau:

- `GOOGLE_SHEET_ID`: ID của Google Sheet (mặc định: "1YEg3XtyR3fxMb8rww6muDThk_qQZtCTX0NLkbO\_\_pk8")
- `GOOGLE_CREDENTIALS_FILE`: Đường dẫn đến file credentials (mặc định: "jstwimoniluver-616a249223f5.json")

Có thể cấu hình qua biến môi trường hoặc trực tiếp trong code.
