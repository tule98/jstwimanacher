"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AppCard } from "@/components/ui/app-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Link2,
  Plus,
  ArrowRight,
  Coins,
  Calendar,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/ui/page-layout";
import { formatDate, formatNumber } from "@/lib/utils";
import API, { AssetConversion, AssetPortfolio } from "@/services/api/client";

export default function ConversionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const queryClient = useQueryClient();

  // Fetch all conversions
  const {
    data: conversions = [],
    isLoading: isLoadingConversions,
    isError: isErrorConversions,
    error: conversionsError,
  } = useQuery({
    queryKey: ["conversions"],
    queryFn: API.conversions.getAll,
  });

  // Fetch assets
  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: API.assets.getAll,
  });

  // Fetch asset portfolio
  const {
    data: portfolio = [],
    isLoading: isLoadingPortfolio,
    isError: isErrorPortfolio,
  } = useQuery({
    queryKey: ["portfolio"],
    queryFn: API.assets.getPortfolio,
  });

  // Conversion form state
  const [conversionForm, setConversionForm] = useState({
    assetId: "",
    amount: "",
    quantity: "",
    categoryId: "",
    note: "",
    conversionType: "buy" as "buy" | "sell",
  });

  // Fetch income and expense categories for the form
  const { data: incomeCategories = [], isLoading: isLoadingIncomeCategories } =
    useQuery({
      queryKey: ["categories", "income"],
      queryFn: () => API.categories.getByType("income"),
    });

  const {
    data: expenseCategories = [],
    isLoading: isLoadingExpenseCategories,
  } = useQuery({
    queryKey: ["categories", "expense"],
    queryFn: () => API.categories.getByType("expense"),
  });

  // Create conversion mutation
  const createConversionMutation = useMutation({
    mutationFn: API.conversions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversions"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsDialogOpen(false);
      resetConversionForm();
    },
  });

  // Reset conversion form
  const resetConversionForm = () => {
    setConversionForm({
      assetId: "",
      amount: "",
      quantity: "",
      categoryId: "",
      note: "",
      conversionType: "buy",
    });
  };

  // Handle conversion form submission
  const handleConversionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createConversionMutation.mutate({
      assetId: conversionForm.assetId,
      amount: parseFloat(conversionForm.amount),
      quantity: parseFloat(conversionForm.quantity),
      categoryId: conversionForm.categoryId,
      note: conversionForm.note,
      conversionType: conversionForm.conversionType,
    });
  };

  // Filter conversions based on selected asset and type
  const filteredConversions = conversions.filter((conversion) => {
    if (selectedAsset !== "all" && conversion.asset_id !== selectedAsset) {
      return false;
    }
    if (selectedType !== "all" && conversion.conversion_type !== selectedType) {
      return false;
    }
    return true;
  });

  // Calculate used assets (for the filter dropdown)
  const usedAssetIds = [...new Set(conversions.map((c) => c.asset_id))];
  const usedAssets = assets.filter((asset) => usedAssetIds.includes(asset.id));

  return (
    <AppLayout className="p-4 sm:p-6">
      {/* Asset Portfolio Summary */}
      <AppCard
        title="Danh mục tài sản"
        description="Tổng quan về các tài sản đang sở hữu"
        icon={Wallet}
        className="mb-6"
      >
        {isLoadingPortfolio ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : isErrorPortfolio ? (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>Lỗi tải dữ liệu danh mục tài sản</p>
          </div>
        ) : portfolio.length === 0 ? (
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
            <Coins className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Chưa có tài sản nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Tạo giao dịch chuyển đổi để bắt đầu xây dựng danh mục tài sản
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio
              .filter(
                (asset) =>
                  asset.current_status === "owned" && asset.total_quantity > 0
              )
              .map((asset) => (
                <AssetPortfolioCard key={asset.asset_id} asset={asset} />
              ))}
          </div>
        )}
      </AppCard>

      {/* Conversions Management */}
      <AppCard
        title="Quản lý chuyển đổi"
        description="Chuyển đổi tiền thành tài sản và ngược lại"
        icon={Link2}
        footer={
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md ml-auto"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo chuyển đổi
          </Button>
        }
      >
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="w-full sm:w-[180px] border-border">
                <SelectValue placeholder="Chọn tài sản" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tài sản</SelectItem>
                {usedAssets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[140px] border-border">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="buy">Mua</SelectItem>
                <SelectItem value="sell">Bán</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversions List */}
        {isLoadingConversions ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : isErrorConversions ? (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>
              {(conversionsError as Error)?.message ||
                "Lỗi tải dữ liệu chuyển đổi"}
            </p>
          </div>
        ) : filteredConversions.length === 0 ? (
          <AppCard
            title="Chưa có chuyển đổi nào"
            description="Tạo chuyển đổi đầu tiên để liên kết giao dịch với tài sản"
            icon={Coins}
            footer={
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md mx-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo chuyển đổi đầu tiên
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredConversions.map((conversion) => (
              <ConversionItem key={conversion.id} conversion={conversion} />
            ))}
          </div>
        )}
      </AppCard>

      {/* Create Conversion Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tạo chuyển đổi mới</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleConversionSubmit} className="space-y-4 mt-4">
            {/* Conversion Type */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                className={`flex items-center justify-center gap-2 py-6 ${
                  conversionForm.conversionType === "buy"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
                onClick={() =>
                  setConversionForm({
                    ...conversionForm,
                    conversionType: "buy",
                    categoryId: "", // Reset category when changing type
                  })
                }
              >
                <TrendingDown className="h-5 w-5" />
                Mua tài sản
              </Button>

              <Button
                type="button"
                className={`flex items-center justify-center gap-2 py-6 ${
                  conversionForm.conversionType === "sell"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
                onClick={() =>
                  setConversionForm({
                    ...conversionForm,
                    conversionType: "sell",
                    categoryId: "", // Reset category when changing type
                  })
                }
              >
                <TrendingUp className="h-5 w-5" />
                Bán tài sản
              </Button>
            </div>

            {/* Asset */}
            <div className="space-y-2">
              <Label htmlFor="asset">Tài sản</Label>
              <Select
                value={conversionForm.assetId}
                onValueChange={(value) =>
                  setConversionForm({ ...conversionForm, assetId: value })
                }
              >
                <SelectTrigger id="asset" className="w-full border-input">
                  <SelectValue placeholder="Chọn tài sản" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: asset.color }}
                        />
                        {asset.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền (VND)</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  value={conversionForm.amount}
                  onChange={(e) =>
                    setConversionForm({
                      ...conversionForm,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Nhập số tiền"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                value={conversionForm.quantity}
                onChange={(e) =>
                  setConversionForm({
                    ...conversionForm,
                    quantity: e.target.value,
                  })
                }
                placeholder="Số lượng"
                required
              />
              {conversionForm.assetId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Đơn vị:{" "}
                  {assets.find((a) => a.id === conversionForm.assetId)?.unit ||
                    "đơn vị"}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={conversionForm.categoryId}
                onValueChange={(value) =>
                  setConversionForm({ ...conversionForm, categoryId: value })
                }
              >
                <SelectTrigger id="category" className="w-full border-input">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {conversionForm.conversionType === "buy" ? (
                    isLoadingExpenseCategories ? (
                      <SelectItem value="" disabled>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tải...
                      </SelectItem>
                    ) : (
                      expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))
                    )
                  ) : isLoadingIncomeCategories ? (
                    <SelectItem value="" disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải...
                    </SelectItem>
                  ) : (
                    incomeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="note"
                value={conversionForm.note}
                onChange={(e) =>
                  setConversionForm({ ...conversionForm, note: e.target.value })
                }
                placeholder="Thêm ghi chú"
                className="min-h-[80px]"
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                <X className="h-4 w-4 mr-2" /> Hủy
              </Button>
              <Button
                type="submit"
                className={`w-full sm:w-auto order-1 sm:order-2 ${
                  conversionForm.conversionType === "buy"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={createConversionMutation.isPending}
              >
                {createConversionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {conversionForm.conversionType === "buy"
                      ? "Mua tài sản"
                      : "Bán tài sản"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// Asset Portfolio Card Component
function AssetPortfolioCard({ asset }: { asset: AssetPortfolio }) {
  return (
    <Card className="p-4 border border-border bg-background shadow hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-4 h-4 rounded-full shadow-sm"
          style={{ backgroundColor: asset.asset_color }}
        />
        <h3 className="font-semibold text-foreground">{asset.asset_name}</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Số lượng:</span>
          <span className="font-medium">
            {formatNumber(asset.total_quantity)} {asset.unit}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Đã đầu tư:</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            {formatNumber(asset.total_invested)} VNĐ
          </span>
        </div>

        {asset.total_received > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Đã thu:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatNumber(asset.total_received)} VNĐ
            </span>
          </div>
        )}

        <div className="pt-2 mt-2 border-t border-border">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Trạng thái:</span>
            <Badge
              variant="outline"
              className={`${
                asset.current_status === "owned"
                  ? "border-green-300 text-green-700 dark:border-green-600 dark:text-green-400"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-400"
              }`}
            >
              {asset.current_status === "owned" ? "Đang sở hữu" : "Đã bán hết"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Conversion Item Component
function ConversionItem({ conversion }: { conversion: AssetConversion }) {
  return (
    <Card className="p-4 border border-border bg-background shadow-lg rounded-lg hover:shadow-xl transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Asset Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: conversion.asset.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {conversion.asset.name}
                </span>
                <Badge variant="outline" className="text-xs border-border">
                  {conversion.quantity} {conversion.asset.unit}
                </Badge>
              </div>
              <Badge
                variant={
                  conversion.conversion_type === "buy"
                    ? "destructive"
                    : "default"
                }
                className="text-xs mt-1"
              >
                {conversion.conversion_type === "buy" ? "Mua" : "Bán"}
              </Badge>
            </div>
          </div>

          {/* Conversion Arrow */}
          <ArrowRight className="h-4 w-4 text-secondary-foreground hidden sm:block" />

          {/* Transaction Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: conversion.transaction.category.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {formatNumber(Math.abs(conversion.transaction.amount))} VNĐ
                </span>
                <Badge variant="outline" className="text-xs border-border">
                  {conversion.transaction.category.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(conversion.transaction.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Note */}
      {conversion.transaction.note && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-secondary-foreground">
            <span className="font-medium">Ghi chú:</span>{" "}
            {conversion.transaction.note}
          </p>
        </div>
      )}
    </Card>
  );
}
