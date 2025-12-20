"use client";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeploymentStatus } from "./types";

interface MistyAppHeaderProps {
  appName: string;
  status: DeploymentStatus;
  publicUrl?: string;
  isDeleting: boolean;
  onDeleteClick: () => void;
}

export function MistyAppHeader({
  appName,
  status,
  publicUrl,
  isDeleting,
  onDeleteClick,
}: MistyAppHeaderProps) {
  const getStatusConfig = (status: DeploymentStatus) => {
    switch (status) {
      case "deploying":
      case "in_progress":
      case "pending":
        return {
          label: "Đang triển khai",
          bgClass: "bg-amber-100/80",
          textClass: "text-amber-800",
          glowClass: "glow-deploying",
          dotClass: "bg-amber-500",
          animate: true,
        };
      case "success":
      case "running":
        return {
          label: "Thành công",
          bgClass: "bg-emerald-100/80",
          textClass: "text-emerald-800",
          glowClass: "glow-success",
          dotClass: "bg-emerald-500",
          animate: true,
        };
      case "failed":
      case "error":
        return {
          label: "Thất bại",
          bgClass: "bg-rose-100/80",
          textClass: "text-rose-800",
          glowClass: "glow-failed",
          dotClass: "bg-rose-500",
          animate: false,
        };
      default:
        return {
          label: "Không xác định",
          bgClass: "bg-gray-100/80",
          textClass: "text-gray-800",
          glowClass: "",
          dotClass: "bg-gray-500",
          animate: false,
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="glass-card-light border-white/30 hover:bg-white/50 haptic-button"
        >
          <Link href="/apps">
            <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Quay lại
          </Link>
        </Button>

        {/* App Title & Status */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-charcoal tracking-tight">
              {appName}
            </h1>
            <p className="text-sm text-charcoal/60 mt-0.5">
              Chi tiết ứng dụng và Giám sát
            </p>
          </div>

          {/* Status Badge with Glow */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`
              inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.glowClass}
              backdrop-blur-sm border border-white/30
              font-medium text-sm
            `}
          >
            <span
              className={`
                w-2 h-2 rounded-full ${statusConfig.dotClass}
                ${statusConfig.animate ? "animate-pulse" : ""}
              `}
            />
            {statusConfig.label}
          </motion.div>

          {/* Public URL Quick Link */}
          {publicUrl && (status === "success" || status === "running") && (
            <motion.a
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-1.5 px-3 py-1.5
                text-sm text-emerald-700 hover:text-emerald-800
                link-glow transition-all duration-200
              "
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="underline-offset-2 hover:underline">Mở trang</span>
            </motion.a>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteClick}
          disabled={isDeleting}
          className="
            stop-button-reveal border-rose-200/50
            hover:border-rose-300 haptic-button
          "
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
          )}
          {isDeleting ? "Đang xóa..." : "Xóa App"}
        </Button>
      </motion.div>
    </motion.div>
  );
}







