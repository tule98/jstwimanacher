"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Save,
  X,
  Palette,
  List,
} from "lucide-react";

interface Category {
  name: string;
  color: string;
}

// API functions
const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
};

const addCategory = async (data: {
  name: string;
  color: string;
}): Promise<any> => {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to add category");
  }
  return response.json();
};

const updateCategory = async (data: {
  name: string;
  color: string;
}): Promise<any> => {
  const response = await fetch("/api/categories", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update category");
  }
  return response.json();
};

const deleteCategory = async (name: string): Promise<any> => {
  const response = await fetch(
    `/api/categories?name=${encodeURIComponent(name)}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete category");
  }
  return response.json();
};

export default function CategoryList() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", color: "#4CAF50" });
  const [editMode, setEditMode] = useState(false);
  const [originalName, setOriginalName] = useState("");

  // Query categories
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm({ name: "", color: "#4CAF50" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm({ name: "", color: "#4CAF50" });
      setEditMode(false);
      setOriginalName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editMode) {
      updateMutation.mutate({
        name: form.name,
        color: form.color,
      });
    } else {
      addMutation.mutate({
        name: form.name,
        color: form.color,
      });
    }
  };

  const handleEdit = (category: Category) => {
    setForm({ name: category.name, color: category.color });
    setOriginalName(category.name);
    setEditMode(true);
  };

  const handleDelete = (name: string) => {
    if (confirm("Bạn có chắc muốn xóa danh mục này không?")) {
      deleteMutation.mutate(name);
    }
  };

  const handleCancel = () => {
    setForm({ name: "", color: "#4CAF50" });
    setEditMode(false);
    setOriginalName("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <FolderTree size={20} />
            Quản lý danh mục chi tiêu
          </CardTitle>
          <CardDescription>
            Thêm, sửa hoặc xóa các danh mục chi tiêu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tên danh mục
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tên danh mục"
                  className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="color"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <Palette size={16} className="mr-1" />
                  Màu sắc
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="color"
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    placeholder="#RRGGBB"
                    className="flex-1 rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
                className="bg-primary hover:bg-green-700 text-white"
              >
                {addMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
                  </>
                ) : editMode ? (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Cập nhật
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Thêm mới
                  </>
                )}
              </Button>

              {editMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X className="mr-2 h-4 w-4" /> Huỷ
                </Button>
              )}
            </div>
          </form>

          {(addMutation.isError ||
            updateMutation.isError ||
            deleteMutation.isError) && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                {addMutation.isError && (
                  <p>
                    {(addMutation.error as Error)?.message ||
                      "Không thể thêm danh mục"}
                  </p>
                )}
                {updateMutation.isError && (
                  <p>
                    {(updateMutation.error as Error)?.message ||
                      "Không thể cập nhật danh mục"}
                  </p>
                )}
                {deleteMutation.isError && (
                  <p>
                    {(deleteMutation.error as Error)?.message ||
                      "Không thể xóa danh mục"}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <List size={20} />
            Danh sách danh mục
          </CardTitle>
          <CardDescription>Tất cả danh mục chi tiêu hiện có</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-green-400" />
            </div>
          ) : isError ? (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{(error as Error)?.message || "Lỗi tải dữ liệu danh mục"}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <FolderTree size={40} className="text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Chưa có danh mục nào. Hãy thêm danh mục mới!
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div
                    className="p-4 flex justify-between items-center"
                    style={{
                      backgroundColor: cat.color,
                      color: isLightColor(cat.color) ? "#000" : "#fff",
                    }}
                  >
                    <span className="font-medium text-lg">{cat.name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(cat)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(cat.name)}
                        disabled={
                          deleteMutation.isPending &&
                          deleteMutation.variables === cat.name
                        }
                      >
                        {deleteMutation.isPending &&
                        deleteMutation.variables === cat.name ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 text-xs text-gray-500 dark:text-gray-400">
                    {cat.color}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hàm hỗ trợ để kiểm tra xem màu sắc có nhạt không để đổi màu chữ
function isLightColor(color: string): boolean {
  // Chuyển đổi HEX thành RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Tính độ sáng (brightness) theo công thức YIQ
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Trả về true nếu độ sáng > 128 (màu nhạt)
  return brightness > 128;
}
