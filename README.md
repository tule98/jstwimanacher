# jstwimanacher

Ứng dụng đa chức năng kết hợp quản lý tài chính cá nhân và tổ chức lịch trình thông minh, sử dụng Next.js với Turso (LibSQL) cho tài chính và Notion API cho lịch trình.

## Tính năng

### 💰 Quản lý Tài chính
- Quản lý danh mục chi tiêu/thu nhập với màu sắc tùy chỉnh
- Nhập và theo dõi khoản chi tiêu/thu nhập (thực tế và ảo)
- Đánh dấy giao dịch resolved/unresolved
- Giao dịch ảo (Virtual Transactions) cho dự báo tài chính
- Thống kê chi tiêu theo tháng và danh mục với balance riêng biệt
- Biểu đồ trực quan (Pie Chart, Bar Chart)
- Lịch sử và xu hướng chi tiêu

### 🗓️ Noxon Schedule Organizer
- Tích hợp với Notion API để quản lý lịch trình
- Tự động lấy dữ liệu từ 3 nguồn:
  - **Tasks**: Công việc cần làm hàng ngày (status: backlog, thisWeek, today, inProgress, inLoop)
  - **Projects**: Dự án đang triển khai (status: inProgress, reachable = false)
  - **Plans**: Sự kiện và kế hoạch tương lai (status: inProgress, todo, inLoop)
- Tạo prompt AI thông minh cho việc sắp xếp lịch trình
- Phân tích tổng quan và đề xuất ưu tiên công việc
- Lập kế hoạch chi tiết cho ngày hiện tại
- Cảnh báo deadline và milestone quan trọng
- Copy prompt để sử dụng với AI assistant

### 🎨 Giao diện & Trải nghiệm
- Giao diện responsive, tối ưu mobile-first
- Hỗ trợ dark/light mode
- Thiết kế hiện đại với Shadcn UI
- Animation mượt mà và user-friendly
- Navigation intuitive giữa các module

## Công nghệ

### Frontend
- **Next.js 15**: React framework với App Router
- **TypeScript**: Type safety và developer experience
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: Component library hiện đại và accessible
- **React Query (TanStack Query)**: Data fetching và state management
- **Lucide Icons**: Icon library nhẹ và đẹp

### Backend & APIs
- **Turso (LibSQL)**: Database chính cho financial data với Drizzle ORM
- **Notion API**: Database cho tasks, projects, plans
- **Next.js API Routes**: RESTful endpoints
- **Authentication**: Protection key cho app security

### Tools & Libraries  
- **React Charts**: Biểu đồ và visualization
- **date-fns**: Xử lý ngày tháng
- **uuid**: Unique ID generation
- **ESLint + Prettier**: Code quality và formatting

## Cài đặt

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn
- Notion Account (cho workspace integration)

### Các bước cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/tule98/jstwimanacher.git
   cd jstwimanacher
   ```

2. **Cài đặt dependencies**
   ```bash
   cd app
   npm install
   ```

4. **Cấu hình Notion API**
   - Tạo Integration trên [Notion Developers](https://developers.notion.com/)
   - Lấy Integration Token
   - Share Notion database với Integration
   - Note lại Database IDs

5. **Tạo file `.env.local`**
   ```bash
   cp .env.example .env.local
   ```
   
   Sau đó chỉnh sửa `.env.local` với thông tin thực tế:
   ```bash
   # App Protection
   PROTECTION_KEY=your_secret_protection_key
   
   # Turso Database (nếu sử dụng)
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your_turso_token
   
   # Notion API
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_VERSION=2022-06-28
   
   # Notion Database IDs
   NOTION_TASKS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   NOTION_PROJECTS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   NOTION_PLANS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

6. **Chạy development server**
   ```bash
   npm run dev
   ```
   
   Truy cập: `http://localhost:3000`

## Triển khai lên Vercel

### Cấu hình Vercel
1. **Tạo tài khoản Vercel** và liên kết với GitHub
2. **Import repository** từ GitHub
3. **Cấu hình build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Root Directory: `app`

### Biến môi trường Production
4. **Thêm Environment Variables** trong Vercel Dashboard:
   ```bash
   # App Protection
   PROTECTION_KEY=your_production_secret_key
   
   # Turso Database
   TURSO_DATABASE_URL=your_production_turso_url
   TURSO_AUTH_TOKEN=your_production_turso_token
   
   # Notion API
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_VERSION=2022-06-28
   
   # Notion Database IDs
   NOTION_TASKS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   NOTION_PROJECTS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   NOTION_PLANS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

5. **Deploy**: Vercel sẽ tự động build và deploy

### Post-deployment
- Kiểm tra các API endpoints: `/api/categories`, `/api/transactions`, `/api/noxon/*`
- Test tính năng upload và sync dữ liệu
- Verify Notion integration hoạt động chính xác

## Cấu trúc Database

### 💰 Turso (LibSQL) - Financial Management

#### Categories Table
| Column | Type | Mô tả | Ví dụ |
|--------|------|-------|-------|
| id | string (PK) | ID duy nhất | "cat-uuid-123" |
| name | string | Tên danh mục | "Ăn uống", "Lương" |
| color | string | Màu sắc hex | "#ff6b6b" |
| type | string | Loại danh mục | "expense", "income" |

#### Transactions Table  
| Column | Type | Mô tả | Ví dụ |
|--------|------|-------|-------|
| id | string (PK) | ID duy nhất | "txn-uuid-456" |
| amount | integer | Số tiền (VND) | 50000 |
| category_id | string (FK) | Liên kết danh mục | "cat-uuid-123" |
| note | string | Ghi chú | "Cơm trưa" |
| created_at | datetime | Thời gian tạo | "2025-09-09 12:00:00" |
| updated_at | datetime | Thời gian cập nhật | "2025-09-09 12:00:00" |
| is_resolved | boolean | Đã xác nhận | true/false |
| is_virtual | boolean | Giao dịch ảo | true/false |

### 🗓️ Notion Database - Schedule Management

#### Database: Main Workspace
Chứa tất cả tasks, projects và plans với các properties:

| Property | Type | Mô tả | Ví dụ |
|----------|------|-------|-------|
| title | title | Tiêu đề chính | "Hoàn thành báo cáo" |
| date | date | Ngày thực hiện/deadline | "2025-09-08" |
| status | status | Trạng thái công việc | "In progress", "Complete", "To-do" |
| projects | relation | Liên kết dự án | [project-ids] |
| plans | relation | Liên kết kế hoạch | [plan-ids] |

#### Database Properties cho filtering:
- **Tasks**: `status` in ["backlog", "thisWeek", "today", "inProgress", "inLoop"]
- **Projects**: `reachable` = false AND `status` = "inProgress"
- **Plans**: `status` in ["inProgress", "todo", "inLoop"]

## API Endpoints

### Financial Management APIs
```
GET  /api/categories          # Lấy danh sách danh mục
POST /api/categories          # Tạo danh mục mới  
PUT  /api/categories          # Cập nhật danh mục
DEL  /api/categories          # Xóa danh mục

GET  /api/transactions        # Lấy danh sách giao dịch
POST /api/transactions        # Tạo giao dịch mới
PUT  /api/transactions        # Cập nhật giao dịch
DEL  /api/transactions        # Xóa giao dịch

GET  /api/transactions/virtual # Lấy giao dịch ảo

GET  /api/stats              # Thống kê tổng quan
GET  /api/stats/balance      # Số dư hiện tại và dự kiến
```

### Noxon Schedule APIs
```
GET /api/noxon/tasks         # Lấy công việc cần làm
GET /api/noxon/projects      # Lấy dự án đang chạy  
GET /api/noxon/plans         # Lấy sự kiện tương lai
```

### Utility APIs
```
POST /api/verify-key        # Xác thực API key
POST /api/migration         # Migration dữ liệu
```

## Cách sử dụng

### 💰 Quản lý Tài chính
1. **Truy cập**: `http://localhost:3000`
2. **Tạo danh mục**: Vào `/categories` để tạo và quản lý danh mục chi tiêu/thu nhập
3. **Nhập giao dịch**: Vào `/transactions` để thêm khoản chi/thu (thực tế hoặc ảo)
4. **Xem thống kê**: Vào `/stats` để xem biểu đồ và phân tích
5. **Toggle resolved**: Click icon trên mỗi giao dịch để đánh dấu đã xác nhận
6. **Virtual transactions**: Sử dụng để lập kế hoạch tài chính dự báo

### 🗓️ Noxon Schedule Organizer  
1. **Truy cập**: `http://localhost:3000/noxon` (không hiển thị trong menu)
2. **Xem tổng quan**: Hệ thống tự động lấy dữ liệu từ Notion
   - Tasks: backlog, thisWeek, today, inProgress, inLoop
   - Projects: inProgress với reachable = false
   - Plans: inProgress, todo, inLoop
3. **Sinh prompt**: AI prompt được tạo tự động với 5 sections:
   - Đánh giá tổng quan 
   - Kế hoạch ngày mới
   - Lưu ý 14 ngày tới
   - Lưu ý 30 ngày tới  
   - Lịch biểu chi tiết
4. **Copy prompt**: Click nút "Copy Prompt" để sử dụng với AI assistant
5. **Refresh**: Click "Refresh Data" để cập nhật dữ liệu mới nhất

## Folder Structure

```
app/
├── public/                   # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── categories/ # Financial categories
│   │   │   ├── transactions/ # Financial transactions  
│   │   │   ├── stats/      # Financial statistics
│   │   │   └── noxon/      # Schedule APIs
│   │   │       ├── tasks/
│   │   │       ├── projects/
│   │   │       └── plans/
│   │   ├── categories/     # Categories management page
│   │   ├── transactions/   # Transactions management page  
│   │   ├── stats/         # Statistics & charts page
│   │   ├── noxon/         # Schedule organizer page
│   │   └── _components/   # Shared components
│   ├── components/ui/      # Shadcn UI components
│   ├── services/          # API clients & utilities
│   └── lib/              # Utility functions
├── components.json        # Shadcn UI config
└── package.json
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature` 
5. Open Pull Request

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
