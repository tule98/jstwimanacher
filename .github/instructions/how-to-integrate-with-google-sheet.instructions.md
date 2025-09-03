---
applyTo: "**"
---

# Google Sheets Service Architecture

## Tổng quan kiến trúc

Ứng dụng jstwimoniluver sử dụng kiến trúc ba tầng để tương tác với Google Sheets:

````
Frontend Components → API Client → Backend Service4. **Handle errors** properly với try-catch và user-friendly messages
5. **Validate data** trước khi gửi lên Google Sheets
6. **Use TypeScript interfaces** để đảm bảo type safety

## Tính năng Resolved/Unresolved

Ứng dụng hỗ trợ đánh dấu trạng thái xác nhận cho các giao dịch:

### UI Features
- **Highlight**: Giao dịch cần xem xét lại (is_resolved = false) được highlight với màu vàng
- **Toggle Button**: Mỗi giao dịch có nút toggle để chuyển đổi trạng thái
- **Statistics**: Hiển thị số lượng và tổng tiền của giao dịch cần xem xét lại
- **Icons**:
  - ✅ CheckCircle: Giao dịch đã xác nhận
  - ⚠️ AlertCircle: Giao dịch cần xem xét lại

### Backend Support
- **Google Sheets**: Cột F lưu trữ giá trị TRUE/FALSE cho is_resolved
- **API**: Full support cho CRUD operations với is_resolved field
- **Default Value**: Giao dịch mới mặc định là đã xác nhận (true)

### Usage
```typescript
// Toggle resolved status
const handleToggleResolved = (index: number) => {
  const transaction = transactions[index];
  const currentResolved = transaction.is_resolved !== false;
  const newResolvedState = !currentResolved;

  API.transactions.update({
    index,
    is_resolved: newResolvedState,
  });
};
``` Google Sheets API
````

### 1. Backend Services (Server-side)

**Vị trí:** `/src/services/googleSheets/googleSheetsService.ts`

Service này xử lý tất cả các tương tác trực tiếp với Google Sheets API, bao gồm authentication và CRUD operations.

#### Authentication

```typescript
export function getGoogleAuth(readOnly = true) {
  // Đọc credentials từ file hoặc biến môi trường
  const credentials = process.env.GOOGLE_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
    : JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

  // Tạo Google Auth client
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: readOnly ? SCOPES.READ_ONLY : SCOPES.READ_WRITE,
  });

  return auth;
}
```

#### Categories Service

Xử lý tất cả các thao tác CRUD cho danh mục chi tiêu:

- `getAll()`: Lấy tất cả danh mục
- `add(name, color)`: Thêm danh mục mới
- `update(name, color)`: Cập nhật màu cho danh mục
- `delete(name)`: Xóa danh mục

#### Transactions Service

Xử lý tất cả các thao tác với dữ liệu chi tiêu:

- `getAll()`: Lấy tất cả giao dịch
- `getByMonth(month, year)`: Lấy giao dịch theo tháng/năm
- `add(amount, category_name, note, created_at)`: Thêm giao dịch mới
- `update(index, data)`: Cập nhật giao dịch
- `delete(index)`: Xóa giao dịch
- `getStatsByCategory(month, year)`: Tính toán thống kê theo danh mục trong một tháng

### 2. API Client (Client-side)

**Vị trí:** `/src/services/api/client.ts`

Client service cung cấp interface sạch để frontend components tương tác với các API endpoints, bao gồm proper TypeScript types và error handling.

#### Interfaces

```typescript
export interface Category {
  name: string;
  color: string;
}

export interface Transaction {
  amount: number;
  category_name: string;
  note?: string;
  created_at: string;
  updated_at: string;
  is_resolved?: boolean; // Trạng thái xác nhận giao dịch
}

export interface CategoryStats {
  category_name: string;
  total: number;
  percentage: number;
}
```

#### API Clients

**Categories API:**

- `getAll()`: Lấy tất cả danh mục
- `create(name, color)`: Tạo danh mục mới
- `update(name, color)`: Cập nhật danh mục
- `delete(name)`: Xóa danh mục

**Transactions API:**

- `getAll()`: Lấy tất cả giao dịch
- `getByMonth(month, year)`: Lấy giao dịch theo tháng
- `create(data)`: Tạo giao dịch mới
- `update(data)`: Cập nhật giao dịch (bao gồm toggle resolved/unresolved)
- `delete(index)`: Xóa giao dịch

**Stats API:**

- `getCategoryStats(month, year)`: Lấy thống kê theo danh mục
- `getHistoricalStats(months)`: Lấy thống kê lịch sử

### 3. Usage trong Frontend Components

#### Import và sử dụng

```typescript
import API, {
  Category,
  Transaction,
  CategoryStats,
} from "@/services/api/client";

// Trong React Query
const { data: categories = [] } = useQuery<Category[]>({
  queryKey: ["categories"],
  queryFn: API.categories.getAll,
});

// Mutations
const addMutation = useMutation({
  mutationFn: API.transactions.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  },
});
```

#### Ví dụ sử dụng trong components

**Categories Management:**

```typescript
// Lấy tất cả danh mục
const categories = await API.categories.getAll();

// Thêm danh mục mới
await API.categories.create("Danh mục mới", "#FF5733");

// Cập nhật danh mục
await API.categories.update("Danh mục mới", "#33FF57");

// Xóa danh mục
await API.categories.delete("Danh mục mới");
```

**Transactions Management:**

```typescript
// Lấy tất cả giao dịch
const transactions = await API.transactions.getAll();

// Thêm giao dịch mới
await API.transactions.create({
  amount: 50000,
  category_name: "Thiết yếu: Ăn uống cá nhân",
  note: "Mua cà phê",
  created_at: new Date().toISOString(),
});

// Cập nhật giao dịch
await API.transactions.update({
  index: 0,
  amount: 55000,
  note: "Mua cà phê và bánh",
});

// Toggle trạng thái resolved/unresolved
await API.transactions.update({
  index: 0,
  is_resolved: false, // Đánh dấu cần xem xét lại
});

// Xóa giao dịch
await API.transactions.delete(0);
```

**Statistics:**

```typescript
// Lấy thống kê theo danh mục trong tháng 8/2025
const stats = await API.stats.getCategoryStats(8, 2025);

// Lấy thống kê lịch sử 6 tháng gần nhất
const historicalStats = await API.stats.getHistoricalStats(6);
```

## Cấu hình

### Biến môi trường

- `GOOGLE_SHEET_ID`: ID của Google Sheet (mặc định: "1YEg3XtyR3fxMb8rww6muDThk_qQZtCTX0NLkbO\_\_pk8")
- `GOOGLE_CREDENTIALS_FILE`: Đường dẫn đến file credentials (mặc định: "jstwimoniluver-616a249223f5.json")
- `GOOGLE_CREDENTIALS`: JSON string của credentials (ưu tiên hơn file)

### Sheet Configuration

- `CATEGORIES_SHEET_ID`: ID của sheet categories (mặc định: 0)
- `TRANSACTIONS_SHEET_ID`: ID của sheet transactions (mặc định: 454436180)

## Lợi ích của kiến trúc này

1. **Separation of Concerns**: Tách biệt rõ ràng giữa logic backend và frontend
2. **Type Safety**: Full TypeScript support với interfaces rõ ràng
3. **Reusability**: API client có thể tái sử dụng ở nhiều components
4. **Maintainability**: Dễ dàng thay đổi implementation mà không ảnh hưởng frontend
5. **Error Handling**: Centralized error handling và consistent error messages
6. **Testing**: Dễ dàng mock và test từng layer riêng biệt

## Best Practices

1. **Luôn sử dụng API client** thay vì gọi fetch trực tiếp trong components
2. **Sử dụng React Query** với API client để có caching và optimistic updates
3. **Handle errors** properly với try-catch và user-friendly messages
4. **Validate data** trước khi gửi lên Google Sheets
5. **Use TypeScript interfaces** để đảm bảo type safety
