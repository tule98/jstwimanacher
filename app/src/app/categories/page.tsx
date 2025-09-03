/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import API, { Category } from "@/services/api/client";

export default function CategoryList() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    id: "",
    name: "",
    color: "#4CAF50",
    type: "expense" as "income" | "expense",
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Query categories
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: API.categories.getAll,
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      color: string;
      type: "income" | "expense";
    }) => API.categories.create(data.name, data.color, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm({ id: "", name: "", color: "#4CAF50", type: "expense" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      color: string;
      type: "income" | "expense";
    }) => API.categories.update(data.name, data.color, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm({ id: "", name: "", color: "#4CAF50", type: "expense" });
      setEditMode(false);
      setEditingId("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: API.categories.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editMode) {
      updateMutation.mutate({
        id: editingId,
        name: form.name,
        color: form.color,
        type: form.type,
      });
    } else {
      // Generate new ID for new category
      const newId = `cat_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      addMutation.mutate({
        id: newId,
        name: form.name,
        color: form.color,
        type: form.type,
      });
    }
  };

  const handleEdit = (category: Category) => {
    setForm({
      id: category.id,
      name: category.name,
      color: category.color,
      type: category.type,
    });
    setEditingId(category.id);
    setEditMode(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa danh mục này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setForm({ id: "", name: "", color: "#4CAF50", type: "expense" });
    setEditMode(false);
    setEditingId("");
  };

  // Filter categories by type
  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  // Get categories to display based on active tab
  const getDisplayCategories = () => {
    switch (activeTab) {
      case "income":
        return incomeCategories;
      case "expense":
        return expenseCategories;
      default:
        return categories;
    }
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
            <div className="grid gap-4 sm:grid-cols-3">
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
                  htmlFor="type"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <FolderTree size={16} className="mr-1" />
                  Loại
                </label>
                <Select
                  value={form.type}
                  onValueChange={(value: "income" | "expense") =>
                    setForm({ ...form, type: value })
                  }
                >
                  <SelectTrigger className="rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">
                      <div className="flex items-center gap-2">
                        <TrendingDown size={16} className="text-red-500" />
                        Chi tiêu
                      </div>
                    </SelectItem>
                    <SelectItem value="income">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-500" />
                        Thu nhập
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
          <CardDescription>
            Tất cả danh mục hiện có ({categories.length} danh mục)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <List size={16} />
                Tất cả ({categories.length})
              </TabsTrigger>
              <TabsTrigger value="income" className="flex items-center gap-2">
                <TrendingUp size={16} />
                Thu nhập ({incomeCategories.length})
              </TabsTrigger>
              <TabsTrigger value="expense" className="flex items-center gap-2">
                <TrendingDown size={16} />
                Chi tiêu ({expenseCategories.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <CategoryGrid
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteMutation={deleteMutation}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-4">
              <CategoryGrid
                categories={incomeCategories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteMutation={deleteMutation}
              />
            </TabsContent>

            <TabsContent value="expense" className="mt-4">
              <CategoryGrid
                categories={expenseCategories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteMutation={deleteMutation}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Component để hiển thị grid categories
function CategoryGrid({
  categories,
  onEdit,
  onDelete,
  deleteMutation,
}: {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  deleteMutation: any;
}) {
  const { isLoading, isError, error } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: API.categories.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-green-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <p>{(error as Error)?.message || "Lỗi tải dữ liệu danh mục"}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <FolderTree size={40} className="text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Chưa có danh mục nào. Hãy thêm danh mục mới!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="bg-white dark:bg-gray-800 border-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 group"
          style={{
            borderColor: cat.color,
          }}
        >
          {/* Category name on top row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Color indicator dot */}
            <div
              className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />

            {/* Category name */}
            <span
              className="font-medium text-sm truncate flex-1"
              style={{ color: cat.color }}
            >
              {cat.name}
            </span>
          </div>

          {/* Badge and buttons on bottom row */}
          <div className="flex items-center justify-between">
            {/* Type badge */}
            <Badge
              variant="outline"
              className={`text-xs border px-1.5 py-0.5 ${
                cat.type === "income"
                  ? "border-green-300 text-green-700 dark:border-green-600 dark:text-green-400"
                  : "border-red-300 text-red-700 dark:border-red-600 dark:text-red-400"
              }`}
            >
              {cat.type === "income" ? (
                <>
                  <TrendingUp size={10} className="mr-1" />
                  Thu
                </>
              ) : (
                <>
                  <TrendingDown size={10} className="mr-1" />
                  Chi
                </>
              )}
            </Badge>

            {/* Action buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onEdit(cat)}
              >
                <Edit size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                onClick={() => onDelete(cat.id)}
                disabled={
                  deleteMutation.isPending &&
                  deleteMutation.variables === cat.id
                }
              >
                {deleteMutation.isPending &&
                deleteMutation.variables === cat.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
              </Button>
            </div>
          </div>

          {/* Color code */}
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {cat.color}
          </div>
        </div>
      ))}
    </div>
  );
}
