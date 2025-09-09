/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NoxonData {
  id?: string;
  title: string;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  projects: any[];
  plans: any[];
}

interface APIResponse {
  success: boolean;
  data: NoxonData[];
  count: number;
}

export default function NoxonPage() {
  const [tasks, setTasks] = useState<NoxonData[]>([]);
  const [projects, setProjects] = useState<NoxonData[]>([]);
  const [plans, setPlans] = useState<NoxonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Gọi song song 3 APIs
      const [tasksRes, projectsRes, plansRes] = await Promise.all([
        fetch("/api/noxon/tasks"),
        fetch("/api/noxon/projects"),
        fetch("/api/noxon/plans"),
      ]);

      const [tasksData, projectsData, plansData]: APIResponse[] =
        await Promise.all([
          tasksRes.json(),
          projectsRes.json(),
          plansRes.json(),
        ]);

      if (tasksData.success) setTasks(tasksData.data);
      if (projectsData.success) setProjects(projectsData.data);
      if (plansData.success) setPlans(plansData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0 || projects.length > 0 || plans.length > 0) {
      generatePrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, projects, plans]);

  const generatePrompt = () => {
    const today = new Date().toISOString().split("T")[0];

    let promptText = `# Lịch trình và ưu tiên công việc cho ngày ${today}\n\n`;

    // Data overview
    promptText += `## 📊 Dữ liệu hiện tại:\n`;
    promptText += `- **${tasks.length} Tasks** (công việc cần làm)\n`;
    promptText += `- **${projects.length} Projects** (dự án đang chạy)\n`;
    promptText += `- **${plans.length} Plans** (sự kiện tương lai)\n\n`;

    // Tasks section
    if (tasks.length > 0) {
      promptText += "### 📋 Tasks - Công việc cần làm:\n";
      tasks.forEach((task, index) => {
        promptText += `${index + 1}. **${task.title}**\n`;
        promptText += `   - ID: ${task.id || "N/A"}\n`;
        if (task.date) promptText += `   - Ngày: ${task.date}\n`;
        if (task.projects.length > 0) {
          promptText += `   - Liên quan đến projects: ${task.projects.length} mục\n`;
          task.projects.forEach((proj, idx) => {
            promptText += `     + Project ${idx + 1}: ${proj.id || "N/A"}\n`;
          });
        }
        if (task.plans.length > 0) {
          promptText += `   - Liên quan đến plans: ${task.plans.length} mục\n`;
          task.plans.forEach((plan, idx) => {
            promptText += `     + Plan ${idx + 1}: ${plan.id || "N/A"}\n`;
          });
        }
        promptText += "\n";
      });
    }

    // Projects section
    if (projects.length > 0) {
      promptText += "### 🚀 Projects - Dự án đang chạy:\n";
      projects.forEach((project, index) => {
        promptText += `${index + 1}. **${project.title}**\n`;
        promptText += `   - ID: ${project.id || "N/A"}\n`;
        if (project.startDate) {
          promptText += `   - Ngày bắt đầu: ${project.startDate}\n`;
        }
        if (project.endDate) {
          promptText += `   - Ngày kết thúc: ${project.endDate}\n`;
        }
        if (project.projects.length > 0) {
          promptText += `   - Liên quan đến projects: ${project.projects.length} mục\n`;
          project.projects.forEach((proj, idx) => {
            promptText += `     + Project ${idx + 1}: ${proj.id || "N/A"}\n`;
          });
        }
        if (project.plans.length > 0) {
          promptText += `   - Liên quan đến plans: ${project.plans.length} mục\n`;
          project.plans.forEach((plan, idx) => {
            promptText += `     + Plan ${idx + 1}: ${plan.id || "N/A"}\n`;
          });
        }
        promptText += "\n";
      });
    }

    // Plans section
    if (plans.length > 0) {
      promptText += "### 📅 Plans - Sự kiện tương lai:\n";
      plans.forEach((plan, index) => {
        promptText += `${index + 1}. **${plan.title}**\n`;
        promptText += `   - ID: ${plan.id || "N/A"}\n`;
        if (plan.date) promptText += `   - Ngày: ${plan.date}\n`;
        if (plan.projects.length > 0) {
          promptText += `   - Liên quan đến projects: ${plan.projects.length} mục\n`;
          plan.projects.forEach((proj, idx) => {
            promptText += `     + Project ${idx + 1}: ${proj.id || "N/A"}\n`;
          });
        }
        if (plan.plans.length > 0) {
          promptText += `   - Liên quan đến plans: ${plan.plans.length} mục\n`;
          plan.plans.forEach((subPlan, idx) => {
            promptText += `     + Plan ${idx + 1}: ${subPlan.id || "N/A"}\n`;
          });
        }
        promptText += "\n";
      });
    }

    // Detailed analysis request
    promptText += `## 🤖 Yêu cầu phân tích và lập kế hoạch:\n\n`;

    promptText += `### 1. 🔍 Đánh giá tổng quan:\n`;
    promptText += `- Phân tích các tasks, projects, và plans hiện có\n`;
    promptText += `- Xác định những điểm bất thường hoặc xung đột về thời gian\n`;
    promptText += `- Đề xuất phương án điều chỉnh phù hợp hơn\n`;
    promptText += `- Đánh giá mức độ ưu tiên và tính khả thi\n\n`;

    promptText += `### 2. 📅 Phân tích và lên kế hoạch ngày mới:\n`;
    promptText += `- Lập danh sách ưu tiên cho ngày ${today}\n`;
    promptText += `- Phân bổ thời gian hợp lý cho từng công việc\n`;
    promptText += `- Đề xuất thời gian biểu chi tiết từng giờ\n`;
    promptText += `- Dự phong thời gian cho các công việc không lên kế hoạch\n\n`;

    promptText += `### 3. ⚠️ Điểm cần lưu ý trong 14 ngày tới:\n`;
    promptText += `- Các deadline quan trọng sắp đến hạn\n`;
    promptText += `- Các sự kiện hoặc cuộc họp đã lên lịch\n`;
    promptText += `- Các dự án cần chuẩn bị hoặc milestone quan trọng\n`;
    promptText += `- Đề xuất hành động cần thực hiện sớm\n\n`;

    promptText += `### 4. 📆 Điểm cần lưu ý trong 30 ngày tới:\n`;
    promptText += `- Tầm nhìn dài hạn cho các dự án lớn\n`;
    promptText += `- Các kế hoạch cần chuẩn bị từ sớm\n`;
    promptText += `- Phân tích xu hướng công việc và đề xuất điều chỉnh\n`;
    promptText += `- Đánh giá tài nguyên và thời gian cần thiết\n\n`;

    promptText += `### 5. 📋 Lịch biểu chi tiết được đề xuất:\n`;
    promptText += `- Tạo time-block schedule cho ngày hôm nay\n`;
    promptText += `- Sắp xếp các công việc theo độ ưu tiên và năng suất cá nhân\n`;
    promptText += `- Bao gồm thời gian nghỉ ngơi và buffer time\n`;
    promptText += `- Đề xuất cách theo dõi và điều chỉnh trong ngày\n\n`;

    promptText += `**Lưu ý**: Hãy đưa ra lời khuyên cụ thể, thực tế và có thể thực hiện được dựa trên dữ liệu thực tế ở trên.`;

    setPrompt(promptText);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateRange = (
    startDate: string | null | undefined,
    endDate: string | null | undefined
  ) => {
    if (!startDate && !endDate) return null;
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    if (startDate) {
      return `Từ ${formatDate(startDate)}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🗓️ Noxon Schedule Organizer
        </h1>
        <p className="text-gray-600 mb-4">
          Tạo prompt lịch trình thông minh từ tasks (công việc cần làm),
          projects (dự án đang chạy) và plans (sự kiện tương lai)
        </p>
        {/* Quick Stats */}
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          📊 Tổng quan: {tasks.length + projects.length + plans.length} mục dữ
          liệu
          {(tasks.length > 0 || projects.length > 0 || plans.length > 0) && (
            <span className="ml-2">
              • Tasks với ngày: {tasks.filter((t) => t.date).length}/
              {tasks.length}• Projects với timeline:{" "}
              {projects.filter((p) => p.startDate || p.endDate).length}/
              {projects.length}• Plans với ngày:{" "}
              {plans.filter((p) => p.date).length}/{plans.length}
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold text-blue-600 mb-2">📋 Tasks</h3>
          <p className="text-2xl font-bold">{tasks.length}</p>
          <p className="text-sm text-gray-500">công việc cần làm</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-green-600 mb-2">🚀 Projects</h3>
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-sm text-gray-500">dự án đang chạy</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-purple-600 mb-2">📅 Plans</h3>
          <p className="text-2xl font-bold">{plans.length}</p>
          <p className="text-sm text-gray-500">sự kiện tương lai</p>
        </Card>
      </div>

      {/* Detailed Items Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tasks */}
        <Card className="p-6">
          <h3 className="font-semibold text-blue-600 mb-4 flex items-center">
            📋 Tasks ({tasks.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <div
                  key={task.id || index}
                  className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400"
                >
                  <h4 className="font-medium text-sm text-gray-800 mb-1">
                    {task.title}
                  </h4>
                  <div className="text-xs text-gray-600">
                    {task.date ? (
                      <p>📅 {formatDate(task.date)}</p>
                    ) : (
                      <p className="text-gray-400">⚪ Chưa có ngày</p>
                    )}
                    {(task.projects.length > 0 || task.plans.length > 0) && (
                      <p className="mt-1 text-gray-500">
                        {task.projects.length > 0 &&
                          `� ${task.projects.length} project(s)`}
                        {task.projects.length > 0 &&
                          task.plans.length > 0 &&
                          " • "}
                        {task.plans.length > 0 &&
                          `📋 ${task.plans.length} plan(s)`}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">Không có tasks</p>
            )}
          </div>
        </Card>

        {/* Projects */}
        <Card className="p-6">
          <h3 className="font-semibold text-green-600 mb-4 flex items-center">
            🚀 Projects ({projects.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <div
                  key={project.id || index}
                  className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400"
                >
                  <h4 className="font-medium text-sm text-gray-800 mb-2">
                    {project.title}
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    {project.startDate || project.endDate ? (
                      <div className="space-y-1">
                        {project.startDate && (
                          <p>🚀 Bắt đầu: {formatDate(project.startDate)}</p>
                        )}
                        {project.endDate && (
                          <p>🎯 Kết thúc: {formatDate(project.endDate)}</p>
                        )}
                        {project.startDate && project.endDate && (
                          <p className="font-medium text-green-700">
                            ⏱️ Thời hạn:{" "}
                            {formatDateRange(
                              project.startDate,
                              project.endDate
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        ⚪ Không có thông tin ngày
                      </p>
                    )}
                    {(project.projects.length > 0 ||
                      project.plans.length > 0) && (
                      <p className="mt-1 text-gray-500 border-t pt-1">
                        {project.projects.length > 0 &&
                          `🔗 ${project.projects.length} project(s)`}
                        {project.projects.length > 0 &&
                          project.plans.length > 0 &&
                          " • "}
                        {project.plans.length > 0 &&
                          `📋 ${project.plans.length} plan(s)`}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">Không có projects</p>
            )}
          </div>
        </Card>

        {/* Plans */}
        <Card className="p-6">
          <h3 className="font-semibold text-purple-600 mb-4 flex items-center">
            📅 Plans ({plans.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {plans.length > 0 ? (
              plans.map((plan, index) => (
                <div
                  key={plan.id || index}
                  className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400"
                >
                  <h4 className="font-medium text-sm text-gray-800 mb-1">
                    {plan.title}
                  </h4>
                  <div className="text-xs text-gray-600">
                    {plan.date ? (
                      <p>📅 {formatDate(plan.date)}</p>
                    ) : (
                      <p className="text-gray-400">⚪ Không có ngày</p>
                    )}
                    {(plan.projects.length > 0 || plan.plans.length > 0) && (
                      <p className="mt-1 text-gray-500">
                        {plan.projects.length > 0 &&
                          `🔗 ${plan.projects.length} project(s)`}
                        {plan.projects.length > 0 &&
                          plan.plans.length > 0 &&
                          " • "}
                        {plan.plans.length > 0 &&
                          `📋 ${plan.plans.length} plan(s)`}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">Không có plans</p>
            )}
          </div>
        </Card>
      </div>

      {/* Generated Prompt */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Generated Prompt</h2>
          <Button
            onClick={copyToClipboard}
            className={`${
              copied ? "bg-green-600" : "bg-blue-600"
            } hover:bg-blue-700`}
          >
            {copied ? "✅ Đã copy!" : "📋 Copy Prompt"}
          </Button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 max-h-96 overflow-y-auto">
            {prompt || "Không có dữ liệu để tạo prompt."}
          </pre>
        </div>
      </Card>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <Button
          onClick={fetchAllData}
          className="bg-gray-600 hover:bg-gray-700"
        >
          🔄 Refresh Data
        </Button>
      </div>
    </div>
  );
}
