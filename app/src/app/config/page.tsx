"use client";

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AppCard } from "@/components/ui/app-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Tag,
  Coins,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Save,
  Palette,
  TrendingUp,
  TrendingDown,
  List,
  FolderTree,
} from "lucide-react";
import { AppLayout } from "@/components/ui/page-layout";
import API, { Asset, AssetCreateData, Category } from "@/services/api/client";

export default function ConfigPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    color: "#4CAF50",
    type: "expense" as "income" | "expense",
  });
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [categoryEditMode, setCategoryEditMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Asset form state
  const [assetForm, setAssetForm] = useState<AssetCreateData>({
    name: "",
    color: "#6366f1",
    unit: "đơn vị",
  });
  const [editMode, setEditMode] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(""); // Fetch assets
  const {
    data: assets = [],
    isLoading: isLoadingAssets,
    isError: isErrorAssets,
    error: assetsError,
  } = useQuery({
    queryKey: ["assets"],
    queryFn: API.assets.getAll,
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: API.categories.getAll,
  });

  // Mutations for asset CRUD operations
  const addAssetMutation = useMutation({
    mutationFn: API.assets.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      resetAssetForm();
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: API.assets.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      resetAssetForm();
      setEditMode(false);
      setEditingAssetId("");
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: API.assets.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  // Mutations for category CRUD operations
  const addCategoryMutation = useMutation({
    mutationFn: (data: {
      name: string;
      color: string;
      type: "income" | "expense";
    }) => API.categories.create(data.name, data.color, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetCategoryForm();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      color: string;
      type: "income" | "expense";
    }) => API.categories.update(data.id, data.name, data.color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetCategoryForm();
      setCategoryEditMode(false);
      setEditingCategoryId("");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: API.categories.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Reset asset form
  const resetAssetForm = () => {
    setAssetForm({
      name: "",
      color: "#6366f1",
      unit: "đơn vị",
    });
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      color: "#4CAF50",
      type: "expense",
    });
  };

  // Handle asset form submission
  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editMode) {
      updateAssetMutation.mutate({
        id: editingAssetId,
        ...assetForm,
      });
    } else {
      addAssetMutation.mutate(assetForm);
    }
  };

  // Handle category form submission
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (categoryEditMode) {
      updateCategoryMutation.mutate({
        id: editingCategoryId,
        name: categoryForm.name,
        color: categoryForm.color,
        type: categoryForm.type,
      });
    } else {
      addCategoryMutation.mutate(categoryForm);
    }
  };

  // Handle asset edit
  const handleEditAsset = (asset: Asset) => {
    setAssetForm({
      name: asset.name,
      color: asset.color,
      unit: asset.unit || "đơn vị",
    });
    setEditingAssetId(asset.id);
    setEditMode(true);
  };

  // Handle asset delete
  const handleDeleteAsset = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa tài sản này không?")) {
      deleteAssetMutation.mutate(id);
    }
  };

  // Handle cancel edit
  const handleCancelAssetEdit = () => {
    resetAssetForm();
    setEditMode(false);
    setEditingAssetId("");
  };

  // Handle category edit
  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      color: category.color,
      type: category.type,
    });
    setEditingCategoryId(category.id);
    setCategoryEditMode(true);
  };

  // Handle category delete
  const handleDeleteCategory = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa danh mục này không?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  // Handle cancel category edit
  const handleCancelCategoryEdit = () => {
    resetCategoryForm();
    setCategoryEditMode(false);
    setEditingCategoryId("");
  };

  return (
    <AppLayout className="p-4 sm:p-6">
      <AppCard
        title="Cấu hình hệ thống"
        description="Quản lý danh mục và tài sản"
        icon={Settings}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Tag className="h-4 w-4" />
              Danh mục
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Coins className="h-4 w-4" />
              Tài sản
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <AppCard
              title="Quản lý danh mục"
              description="Tạo, chỉnh sửa và xóa các danh mục chi tiêu/thu nhập"
              icon={Tag}
            >
              <form className="space-y-4" onSubmit={handleCategorySubmit}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="category-name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Tên danh mục
                    </label>
                    <input
                      id="category-name"
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Tên danh mục"
                      className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="category-type"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                    >
                      <Tag size={16} className="mr-1" />
                      Loại
                    </label>
                    <select
                      id="category-type"
                      value={categoryForm.type}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          type: e.target.value as "income" | "expense",
                        })
                      }
                      className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    >
                      <option value="expense">Chi tiêu</option>
                      <option value="income">Thu nhập</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="category-color"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                    >
                      <Palette size={16} className="mr-1" />
                      Màu sắc
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="category-color"
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            color: e.target.value,
                          })
                        }
                        className="w-10 h-10 min-w-[40px] rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={categoryForm.color}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            color: e.target.value,
                          })
                        }
                        placeholder="#RRGGBB"
                        className="flex-1 min-w-0 rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={
                      addCategoryMutation.isPending ||
                      updateCategoryMutation.isPending
                    }
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addCategoryMutation.isPending ||
                    updateCategoryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                        xử lý
                      </>
                    ) : categoryEditMode ? (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Cập nhật
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
                      </>
                    )}
                  </Button>

                  {categoryEditMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelCategoryEdit}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <X className="mr-2 h-4 w-4" /> Huỷ
                    </Button>
                  )}
                </div>
              </form>

              {(addCategoryMutation.isError ||
                updateCategoryMutation.isError ||
                deleteCategoryMutation.isError) && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    {addCategoryMutation.isError && (
                      <p>
                        {(addCategoryMutation.error as Error)?.message ||
                          "Không thể thêm danh mục"}
                      </p>
                    )}
                    {updateCategoryMutation.isError && (
                      <p>
                        {(updateCategoryMutation.error as Error)?.message ||
                          "Không thể cập nhật danh mục"}
                      </p>
                    )}
                    {deleteCategoryMutation.isError && (
                      <p>
                        {(deleteCategoryMutation.error as Error)?.message ||
                          "Không thể xóa danh mục"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </AppCard>

            <AppCard
              title="Danh sách danh mục"
              description={`Tất cả danh mục hiện có (${categories.length} danh mục)`}
              icon={List}
            >
              {isLoadingCategories ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-green-400" />
                </div>
              ) : isErrorCategories ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>
                    {(categoriesError as Error)?.message ||
                      "Lỗi tải dữ liệu danh mục"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Filter tabs */}
                  <Tabs
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger
                        value="all"
                        className="flex items-center gap-2"
                      >
                        <List size={16} />
                        Tất cả ({categories.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="income"
                        className="flex items-center gap-2"
                      >
                        <TrendingUp size={16} />
                        Thu nhập (
                        {categories.filter((c) => c.type === "income").length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="expense"
                        className="flex items-center gap-2"
                      >
                        <TrendingDown size={16} />
                        Chi tiêu (
                        {categories.filter((c) => c.type === "expense").length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4">
                      <CategoryGrid
                        categories={categories}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        deleteMutation={deleteCategoryMutation}
                      />
                    </TabsContent>

                    <TabsContent value="income" className="mt-4">
                      <CategoryGrid
                        categories={categories.filter(
                          (c) => c.type === "income"
                        )}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        deleteMutation={deleteCategoryMutation}
                      />
                    </TabsContent>

                    <TabsContent value="expense" className="mt-4">
                      <CategoryGrid
                        categories={categories.filter(
                          (c) => c.type === "expense"
                        )}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        deleteMutation={deleteCategoryMutation}
                      />
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </AppCard>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <AppCard
              title="Quản lý tài sản"
              description="Tạo, chỉnh sửa và xóa các loại tài sản có thể đầu tư"
              icon={Coins}
            >
              <form className="space-y-4 mb-6" onSubmit={handleAssetSubmit}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="asset-name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Tên tài sản
                    </label>
                    <input
                      id="asset-name"
                      type="text"
                      value={assetForm.name}
                      onChange={(e) =>
                        setAssetForm({ ...assetForm, name: e.target.value })
                      }
                      placeholder="Tên tài sản"
                      className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="asset-unit"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Đơn vị
                    </label>
                    <input
                      id="asset-unit"
                      type="text"
                      value={assetForm.unit}
                      onChange={(e) =>
                        setAssetForm({ ...assetForm, unit: e.target.value })
                      }
                      placeholder="Đơn vị tính (gram, cổ, đồng, ...)"
                      className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="asset-color"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                    >
                      <Palette size={16} className="mr-1" />
                      Màu sắc
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="asset-color"
                        type="color"
                        value={assetForm.color}
                        onChange={(e) =>
                          setAssetForm({ ...assetForm, color: e.target.value })
                        }
                        className="w-10 h-10 min-w-[40px] rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={assetForm.color}
                        onChange={(e) =>
                          setAssetForm({ ...assetForm, color: e.target.value })
                        }
                        placeholder="#RRGGBB"
                        className="flex-1 min-w-0 rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={
                      addAssetMutation.isPending ||
                      updateAssetMutation.isPending
                    }
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addAssetMutation.isPending ||
                    updateAssetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                        xử lý
                      </>
                    ) : editMode ? (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Cập nhật
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Thêm tài sản
                      </>
                    )}
                  </Button>

                  {editMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelAssetEdit}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <X className="mr-2 h-4 w-4" /> Huỷ
                    </Button>
                  )}
                </div>
              </form>

              {(addAssetMutation.isError ||
                updateAssetMutation.isError ||
                deleteAssetMutation.isError) && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    {addAssetMutation.isError && (
                      <p>
                        {(addAssetMutation.error as Error)?.message ||
                          "Không thể thêm tài sản"}
                      </p>
                    )}
                    {updateAssetMutation.isError && (
                      <p>
                        {(updateAssetMutation.error as Error)?.message ||
                          "Không thể cập nhật tài sản"}
                      </p>
                    )}
                    {deleteAssetMutation.isError && (
                      <p>
                        {(deleteAssetMutation.error as Error)?.message ||
                          "Không thể xóa tài sản"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </AppCard>

            <AppCard
              title="Danh sách tài sản"
              description={`Tất cả tài sản hiện có (${assets.length} tài sản)`}
              icon={List}
            >
              {isLoadingAssets ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-green-400" />
                </div>
              ) : isErrorAssets ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>
                    {(assetsError as Error)?.message ||
                      "Lỗi tải dữ liệu tài sản"}
                  </p>
                </div>
              ) : (
                <AssetGrid
                  assets={assets}
                  onEdit={handleEditAsset}
                  onDelete={handleDeleteAsset}
                  deleteMutation={deleteAssetMutation}
                />
              )}
            </AppCard>
          </TabsContent>
        </Tabs>
      </AppCard>
    </AppLayout>
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
  deleteMutation: UseMutationResult<void, Error, string, unknown>;
}) {
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

// Component để hiển thị grid assets
function AssetGrid({
  assets,
  onEdit,
  onDelete,
  deleteMutation,
}: {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  deleteMutation: UseMutationResult<void, Error, string, unknown>;
}) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <Coins size={40} className="text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Chưa có tài sản nào. Hãy thêm tài sản mới!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="bg-white dark:bg-gray-800 border-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 group"
          style={{
            borderColor: asset.color,
          }}
        >
          {/* Asset name on top row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Color indicator dot */}
            <div
              className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0"
              style={{ backgroundColor: asset.color }}
            />

            {/* Asset name */}
            <span
              className="font-medium text-sm truncate flex-1"
              style={{ color: asset.color }}
            >
              {asset.name}
            </span>
          </div>

          {/* Buttons and action row */}
          <div className="flex items-center justify-end">
            {/* Action buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onEdit(asset)}
              >
                <Edit size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                onClick={() => onDelete(asset.id)}
                disabled={
                  deleteMutation.isPending &&
                  deleteMutation.variables === asset.id
                }
              >
                {deleteMutation.isPending &&
                deleteMutation.variables === asset.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
              </Button>
            </div>
          </div>

          {/* Color code */}
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
            <span>{asset.color}</span>
            <Badge variant="outline" className="text-xs">
              {asset.unit || "đơn vị"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
