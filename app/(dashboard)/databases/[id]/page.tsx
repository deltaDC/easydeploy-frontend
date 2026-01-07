"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Database, DatabaseStatus } from "@/types/database.type";
import DatabaseService from "@/services/database.service";
import { Database as DatabaseIcon, Activity, Terminal, Link2, LayoutGrid } from "lucide-react";
import ErrorDialog from "@/components/database/ErrorDialog";
import DeleteConfirmDialog from "@/components/database/DeleteConfirmDialog";
import {
  MistyDatabaseHeader,
  DatabaseOverviewTab,
  DatabaseQueryTab,
  DatabaseMetricsTab,
  DatabaseLogsTab,
  DatabaseConnectionsTab,
  DatabaseTab,
} from "@/components/database-detail";

// Tab configuration
const TABS: { id: DatabaseTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Tổng quan", icon: LayoutGrid },
  { id: "query", label: "Truy vấn", icon: DatabaseIcon },
  { id: "metrics", label: "Hiệu suất", icon: Activity },
  { id: "logs", label: "Nhật ký", icon: Terminal },
  { id: "connections", label: "Kết nối", icon: Link2 },
];

// Tab Button Component
function TabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: (typeof TABS)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300
        flex items-center gap-2
      `}
      style={{
        background: isActive
          ? "rgba(255, 255, 255, 0.5)"
          : "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(10px)",
        border: isActive
          ? "1px solid rgba(146, 175, 173, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.2)",
        color: isActive ? "#4A6163" : "#64748B",
        boxShadow: isActive 
          ? "inset 0 0 20px rgba(255, 255, 255, 0.3), 0 4px 15px rgba(146, 175, 173, 0.2)" 
          : "none",
      }}
    >
      <Icon className="w-4 h-4" strokeWidth={1.5} />
      {tab.label}

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-misty-sage"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div
        className="h-32 rounded-2xl glass-shimmer"
        style={{
          background: "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(20px)",
        }}
      />

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 w-28 rounded-xl"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
            }}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div
        className="h-96 rounded-2xl glass-shimmer"
        style={{
          background: "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(20px)",
        }}
      />
    </div>
  );
}

// Not Found State
function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <DatabaseIcon className="w-10 h-10 text-charcoal/30" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-charcoal mb-2">
        Không tìm thấy cơ sở dữ liệu
      </h2>
      <p className="text-charcoal/60 mb-6">
        Cơ sở dữ liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="px-6 py-3 rounded-xl font-medium text-white"
        style={{
          background: "linear-gradient(135deg, #92AFAD, #7A9694)",
          boxShadow: "0 8px 20px rgba(146, 175, 173, 0.3)",
        }}
      >
        Quay lại danh sách
      </motion.button>
    </motion.div>
  );
}

export default function DatabaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [database, setDatabase] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DatabaseTab>("overview");
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDatabase(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDatabase = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await DatabaseService.getDatabase(id);
      setDatabase(data);
      return data;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await DatabaseService.startDatabase(id);
      pollStatus("RUNNING");
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể khởi động cơ sở dữ liệu",
      });
    }
  };

  const handleStop = async () => {
    try {
      await DatabaseService.stopDatabase(id);
      pollStatus("STOPPED");
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể dừng cơ sở dữ liệu",
      });
    }
  };

  const handleRestart = async () => {
    try {
      await DatabaseService.restartDatabase(id);
      pollStatus("RUNNING");
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể khởi động lại cơ sở dữ liệu",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await DatabaseService.deleteDatabase(id);
      router.push("/databases");
    } catch (error: any) {
      setIsDeleting(false);
      setErrorDialog({
        open: true,
        message: error.message || "Không thể xóa cơ sở dữ liệu",
      });
    }
  };

  const pollStatus = (targetStatus: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const data = await fetchDatabase(false);
      if (data && (data.status === targetStatus || attempts >= 5)) {
        clearInterval(interval);
      }
    }, 2000);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!database) {
    return <NotFoundState onBack={() => router.push("/databases")} />;
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <DatabaseOverviewTab database={database} />;
      case "query":
        return <DatabaseQueryTab database={database} />;
      case "metrics":
        return <DatabaseMetricsTab database={database} />;
      case "logs":
        return <DatabaseLogsTab database={database} />;
      case "connections":
        return <DatabaseConnectionsTab database={database} />;
      default:
        return <DatabaseOverviewTab database={database} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <MistyDatabaseHeader
        database={database}
        isDeleting={isDeleting}
        onStart={handleStart}
        onStop={handleStop}
        onRestart={handleRestart}
        onDelete={() => setDeleteDialog(true)}
      />

      {/* Tab Navigation */}
      <div
        className="flex flex-wrap gap-2 p-2 rounded-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        message={errorDialog.message}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleDelete}
        itemName={database?.name}
        message="Bạn có chắc chắn muốn xóa cơ sở dữ liệu này? Hành động này không thể hoàn tác."
      />
    </motion.div>
  );
}
