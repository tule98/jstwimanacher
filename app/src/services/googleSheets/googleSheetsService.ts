import { google } from "googleapis";
import path from "path";
import fs from "fs";

/**
 * Google Sheets Service
 * Service để xử lý tất cả các tương tác với Google Sheets API
 */

// Constants
const SPREADSHEET_ID =
  process.env.GOOGLE_SHEET_ID || "1YEg3XtyR3fxMb8rww6muDThk_qQZtCTX0NLkbO__pk8";
const CREDENTIALS_PATH = path.join(
  process.cwd(),
  process.env.GOOGLE_CREDENTIALS_FILE || "jstwimoniluver-616a249223f5.json"
);

// Sheet ranges
const RANGES = {
  CATEGORIES: "categories!A2:B", // Tên và màu của danh mục
  TRANSACTIONS: "transactions!A2:E", // Amount, category_name, note, created_at, updated_at
};

// Scopes
const SCOPES = {
  READ_ONLY: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  READ_WRITE: ["https://www.googleapis.com/auth/spreadsheets"],
};

/**
 * Lấy authentication cho Google Sheets API
 * @param readOnly - Nếu true, chỉ cho phép đọc dữ liệu
 * @returns Google Auth client
 */
export function getGoogleAuth(readOnly = true) {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: readOnly ? SCOPES.READ_ONLY : SCOPES.READ_WRITE,
    });
    return auth;
  } catch (error) {
    console.error("Error getting Google Auth:", error);
    throw new Error(
      "Không thể kết nối đến Google Sheets. Vui lòng kiểm tra file credentials."
    );
  }
}

/**
 * Khởi tạo Google Sheets API client
 * @param readOnly - Nếu true, chỉ cho phép đọc dữ liệu
 * @returns Google Sheets API client
 */
export function getGoogleSheetsClient(readOnly = true) {
  const auth = getGoogleAuth(readOnly);
  return google.sheets({ version: "v4", auth });
}

/**
 * Categories Service
 */
export const CategoriesService = {
  /**
   * Lấy danh sách tất cả danh mục
   * @returns Array của categories {name, color}
   */
  async getAll() {
    try {
      const sheets = getGoogleSheetsClient();
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGES.CATEGORIES,
      });

      const rows = res.data.values || [];
      return rows.map(([name, color]) => ({ name, color }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  /**
   * Thêm một danh mục mới
   * @param name - Tên danh mục
   * @param color - Mã màu hex của danh mục
   * @returns Kết quả từ Google Sheets API
   */
  async add(name: string, color: string) {
    try {
      const sheets = getGoogleSheetsClient(false); // Cần quyền write
      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGES.CATEGORIES,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[name, color]],
        },
      });
      return result.data;
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  },

  /**
   * Cập nhật một danh mục
   * @param name - Tên danh mục (primary key)
   * @param color - Mã màu mới
   * @returns Kết quả từ Google Sheets API
   */
  async update(name: string, color: string) {
    try {
      // Đầu tiên, tìm danh mục trong danh sách
      const sheets = getGoogleSheetsClient(false); // Cần quyền write
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGES.CATEGORIES,
      });

      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === name);

      if (rowIndex === -1) {
        throw new Error(`Không tìm thấy danh mục: ${name}`);
      }

      // Cập nhật màu cho danh mục
      const result = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `categories!B${rowIndex + 2}`, // +2 vì dòng đầu tiên là header và Google Sheets index bắt đầu từ 1
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[color]],
        },
      });

      return result.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  /**
   * Xóa một danh mục
   * @param name - Tên danh mục cần xóa
   * @returns Kết quả từ Google Sheets API
   */
  async delete(name: string) {
    try {
      // Tìm danh mục trong danh sách
      const sheets = getGoogleSheetsClient(false); // Cần quyền write
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGES.CATEGORIES,
      });

      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === name);

      if (rowIndex === -1) {
        throw new Error(`Không tìm thấy danh mục: ${name}`);
      }

      // Xóa dòng
      const result = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // Giả sử sheet Categories có ID là 0
                  dimension: "ROWS",
                  startIndex: rowIndex + 1, // +1 vì dòng đầu tiên là header
                  endIndex: rowIndex + 2,
                },
              },
            },
          ],
        },
      });

      return result.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

/**
 * Transactions Service
 */
export const TransactionsService = {
  /**
   * Lấy danh sách tất cả transactions
   * @returns Array của transactions {amount, category_name, note, created_at, updated_at}
   */
  async getAll() {
    try {
      const sheets = getGoogleSheetsClient();
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGES.TRANSACTIONS,
      });

      const rows = res.data.values || [];
      return rows.map(
        ([amount, category_name, note, created_at, updated_at]) => ({
          amount: parseFloat(amount),
          category_name,
          note,
          created_at,
          updated_at,
        })
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  /**
   * Lấy transactions theo tháng
   * @param month - Tháng (1-12)
   * @param year - Năm
   * @returns Array của transactions trong tháng đó
   */
  async getByMonth(month: number, year: number) {
    try {
      const allTransactions = await this.getAll();

      return allTransactions.filter((transaction) => {
        const date = new Date(transaction.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } catch (error) {
      console.error("Error fetching transactions by month:", error);
      throw error;
    }
  },

  /**
   * Thêm một transaction mới
   * @param amount - Số tiền
   * @param category_name - Tên danh mục
   * @param note - Ghi chú (tùy chọn)
   * @returns Kết quả từ Google Sheets API
   */
  async add(amount: number, category_name: string, note: string = "") {
    try {
      const now = new Date().toISOString();
      const sheets = getGoogleSheetsClient(false); // Cần quyền write

      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGES.TRANSACTIONS,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[amount, category_name, note, now, now]],
        },
      });

      return result.data;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  },

  /**
   * Xóa một transaction dựa vào vị trí
   * @param index - Index của transaction (0-based)
   * @returns Kết quả từ Google Sheets API
   */
  async delete(index: number) {
    try {
      const sheets = getGoogleSheetsClient(false); // Cần quyền write

      // Xóa dòng
      const result = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 1, // Giả sử sheet Transactions có ID là 1
                  dimension: "ROWS",
                  startIndex: index + 1, // +1 vì dòng đầu tiên là header
                  endIndex: index + 2,
                },
              },
            },
          ],
        },
      });

      return result.data;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },

  /**
   * Cập nhật một transaction
   * @param index - Index của transaction (0-based)
   * @param data - Dữ liệu cần cập nhật {amount, category_name, note}
   * @returns Kết quả từ Google Sheets API
   */
  async update(
    index: number,
    data: { amount?: number; category_name?: string; note?: string }
  ) {
    try {
      const sheets = getGoogleSheetsClient(false); // Cần quyền write

      // Lấy dữ liệu hiện tại
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `transactions!A${index + 2}:E${index + 2}`,
      });

      const currentData = res.data.values?.[0] || [];
      if (currentData.length === 0) {
        throw new Error(`Không tìm thấy transaction tại index: ${index}`);
      }

      // Cập nhật dữ liệu
      const now = new Date().toISOString();
      const updatedData = [
        data.amount !== undefined ? data.amount : currentData[0],
        data.category_name !== undefined ? data.category_name : currentData[1],
        data.note !== undefined ? data.note : currentData[2],
        currentData[3], // created_at giữ nguyên
        now, // updated_at cập nhật
      ];

      // Gửi yêu cầu cập nhật
      const result = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `transactions!A${index + 2}:E${index + 2}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [updatedData],
        },
      });

      return result.data;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  /**
   * Thống kê chi tiêu theo danh mục trong một tháng
   * @param month - Tháng (1-12)
   * @param year - Năm
   * @returns Thống kê theo danh mục {category_name, total, percentage}
   */
  async getStatsByCategory(month: number, year: number) {
    try {
      const transactions = await this.getByMonth(month, year);

      // Tính tổng theo danh mục
      const categoryStats: Record<string, number> = {};
      let total = 0;

      transactions.forEach((transaction) => {
        const { amount, category_name } = transaction;
        categoryStats[category_name] =
          (categoryStats[category_name] || 0) + amount;
        total += amount;
      });

      // Chuyển đổi thành mảng kết quả
      return Object.entries(categoryStats).map(
        ([category_name, categoryTotal]) => ({
          category_name,
          total: categoryTotal,
          percentage: total > 0 ? (categoryTotal / total) * 100 : 0,
        })
      );
    } catch (error) {
      console.error("Error getting stats by category:", error);
      throw error;
    }
  },
};

export default {
  CategoriesService,
  TransactionsService,
};
