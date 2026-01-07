"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DatabaseType, CreateDatabaseDto } from "@/types/database.type";
import DatabaseService from "@/services/database.service";
import { Loader2, Database, HardDrive, MemoryStick } from "lucide-react";
import ErrorDialog from "./ErrorDialog";
import {
  DatabaseTypeIcon,
  LiquidStorageBar,
  CreationJourneyModal,
  EnergyCore,
  NeumorphicInput,
  EnergySlider,
  GlassPill,
  DB_TYPE_COLORS,
} from "@/components/database-detail";

// Database type option
interface DbTypeOption {
  type: DatabaseType;
  label: string;
  description: string;
  versions: string[];
}

const DB_OPTIONS: DbTypeOption[] = [
  {
    type: DatabaseType.POSTGRESQL,
    label: "PostgreSQL",
    description: "Relational database",
    versions: ["14", "15", "16"],
  },
  {
    type: DatabaseType.MYSQL,
    label: "MySQL",
    description: "Popular SQL database",
    versions: ["8.0", "8.1"],
  },
  {
    type: DatabaseType.MONGODB,
    label: "MongoDB",
    description: "NoSQL document store",
    versions: ["6.0", "7.0"],
  },
  {
    type: DatabaseType.REDIS,
    label: "Redis",
    description: "In-memory data store",
    versions: ["7", "7-alpine"],
  },
];

// Preview Card Component
function PreviewCard({
  formData,
  glowIntensity,
}: {
  formData: CreateDatabaseDto;
  glowIntensity: number;
}) {
  const colors = DB_TYPE_COLORS[formData.type];

  return (
    <motion.div
      className="relative h-full min-h-[400px] rounded-3xl overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.35)",
        backdropFilter: "blur(30px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Dynamic glow based on resources */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: 0.3 + glowIntensity * 0.4,
        }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: colors.glow }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs text-charcoal/50 uppercase tracking-wider mb-2">
            Xem trước
          </p>
          <h3 className="text-lg font-serif font-semibold text-charcoal">
            {formData.name || "database-name"}
          </h3>
        </div>

        {/* Icon with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={formData.type}
            initial={{ scale: 0.5, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="mb-8"
          >
            <DatabaseTypeIcon type={formData.type} size="xl" showGlow />
          </motion.div>
        </AnimatePresence>

        {/* Version badge */}
        <motion.div
          className="px-4 py-2 rounded-full mb-6"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <span className="text-sm font-medium" style={{ color: colors.text }}>
            v{formData.version}
          </span>
        </motion.div>

        {/* Resources preview */}
        <div className="w-full max-w-xs space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal/60">Storage</span>
            <span className="font-semibold text-charcoal">{formData.storageGb} GB</span>
          </div>
          <LiquidStorageBar
            used={formData.storageGb || 1}
            total={10}
            height={8}
            showLabel={false}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal/60">Memory</span>
            <span className="font-semibold text-charcoal">{formData.memoryMb} MB</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DatabaseDeployForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [createdDbId, setCreatedDbId] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string>("");
  const [formData, setFormData] = useState<CreateDatabaseDto>({
    name: "",
    type: DatabaseType.POSTGRESQL,
    version: "14",
    storageGb: 1,
    memoryMb: 256,
  });

  // Calculate glow intensity based on resources
  const glowIntensity =
    ((formData.storageGb || 1) / 10 + (formData.memoryMb || 256) / 8192) / 2;

  // Validate database name
  const validateName = (name: string) => {
    if (name.includes(" ")) {
      setNameError("Tên database không được chứa khoảng trắng");
      return false;
    }
    setNameError("");
    return true;
  };

  const isFormValid = () => {
    return formData.name.trim().length >= 3 && !nameError;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateName(formData.name) || !isFormValid()) {
      return;
    }
    
    setLoading(true);

    try {
      const database = await DatabaseService.createDatabase(formData);
      setCreatedDbId(database.id);
      setShowJourney(true);
    } catch (error: any) {
      setLoading(false);
      setErrorDialog({
        open: true,
        message: error.message || "Không thể tạo cơ sở dữ liệu",
      });
    }
  };

  const handleJourneyComplete = () => {
    if (createdDbId) {
      router.push(`/databases/${createdDbId}`);
    }
  };

  const handleTypeChange = (type: DatabaseType) => {
    const option = DB_OPTIONS.find((o) => o.type === type);
    setFormData({
      ...formData,
      type,
      version: option?.versions[0] || "14",
    });
  };

  const currentOption = DB_OPTIONS.find((o) => o.type === formData.type);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-[4fr_6fr] gap-8"
      >
        {/* Left Column - Control Panel (4 parts) */}
        <Card
          className="border-0 shadow-sage-glow"
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(25px)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-charcoal">
              Cấu hình Database
            </CardTitle>
            <CardDescription className="text-charcoal/60">
              Thiết lập thông số cho database mới của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-charcoal font-medium">
                  Tên Database
                </Label>
                <NeumorphicInput
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData({ ...formData, name: newName });
                    validateName(newName);
                  }}
                  placeholder="my-database"
                  required
                  minLength={3}
                  maxLength={50}
                />
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-1"
                  >
                    {nameError}
                  </motion.p>
                )}
              </div>

              {/* Database Type Selection */}
              <div className="space-y-3">
                <Label className="text-charcoal font-medium">Loại Database</Label>
                <div className="grid grid-cols-2 gap-3">
                  {DB_OPTIONS.map((option) => {
                    const colors = DB_TYPE_COLORS[option.type];
                    const isSelected = formData.type === option.type;

                    return (
                      <motion.button
                        key={option.type}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTypeChange(option.type)}
                        className={`
                          relative p-4 rounded-xl text-left transition-all duration-300
                          ${isSelected ? "ring-2" : ""}
                        `}
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${colors.bg}, rgba(255,255,255,0.5))`
                            : "rgba(255, 255, 255, 0.4)",
                          backdropFilter: "blur(10px)",
                          border: `1px solid ${isSelected ? colors.border : "rgba(255,255,255,0.3)"}`,
                          boxShadow: isSelected ? `0 0 25px ${colors.glow}` : "none",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <DatabaseTypeIcon
                            type={option.type}
                            size="sm"
                            showGlow={isSelected}
                          />
                          <div>
                            <p className="font-semibold text-charcoal">{option.label}</p>
                            <p className="text-xs text-charcoal/50">{option.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Version Selection */}
              <div className="space-y-2">
                <Label className="text-charcoal font-medium">Phiên bản</Label>
                <div className="flex flex-wrap gap-2">
                  {currentOption?.versions.map((version) => (
                    <GlassPill
                      key={version}
                      label=""
                      value={`v${version}`}
                      className={formData.version === version ? "ring-2 ring-misty-sage/50" : ""}
                    />
                  ))}
                </div>
              </div>

              {/* Storage Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-charcoal font-medium flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-misty-sage" strokeWidth={1.5} />
                    Dung lượng lưu trữ
                  </Label>
                  <span className="text-sm font-semibold text-charcoal">
                    {formData.storageGb} GB
                  </span>
                </div>
                <EnergySlider
                  value={[formData.storageGb || 1]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, storageGb: value })
                  }
                  min={1}
                  max={10}
                  step={1}
                  valueLabel={`${formData.storageGb} GB`}
                />
                <div className="flex justify-between text-xs text-charcoal/40">
                  <span>1 GB</span>
                  <span>10 GB</span>
                </div>
              </div>

              {/* Memory Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-charcoal font-medium flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-misty-sage" strokeWidth={1.5} />
                    Bộ nhớ RAM
                  </Label>
                  <span className="text-sm font-semibold text-charcoal">
                    {formData.memoryMb} MB
                  </span>
                </div>
                <EnergySlider
                  value={[formData.memoryMb || 256]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, memoryMb: value })
                  }
                  min={128}
                  max={2048}
                  step={128}
                  valueLabel={`${formData.memoryMb} MB`}
                />
                <div className="flex justify-between text-xs text-charcoal/40">
                  <span>128 MB</span>
                  <span>2048 MB</span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
              >
                <Button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className="w-full py-6 text-base font-semibold rounded-xl transition-all duration-300"
                  style={{
                    background: loading || !isFormValid()
                      ? "rgba(146, 175, 173, 0.5)"
                      : "linear-gradient(135deg, #92AFAD, #7A9694)",
                    boxShadow: loading || !isFormValid()
                      ? "none"
                      : "0 10px 30px rgba(146, 175, 173, 0.4)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang kích hoạt...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Database className="w-5 h-5" strokeWidth={1.5} />
                      Triển khai Cơ sở dữ liệu
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>

        {/* Right Column - Preview Chamber (6 parts) */}
        <div className="lg:sticky lg:top-6 h-fit">
          <motion.div
            className="relative h-full min-h-[500px] rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.35)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            {/* Dynamic glow based on resources */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                opacity: 0.3 + glowIntensity * 0.4,
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl"
                style={{ backgroundColor: DB_TYPE_COLORS[formData.type].glow }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full">
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-serif font-semibold text-charcoal">
                  {formData.name || "database-name"}
                </h3>
              </div>

              {/* Energy Core */}
              <div className="flex-1 flex items-center justify-center w-full">
                <EnergyCore
                  type={formData.type}
                  memoryMb={formData.memoryMb}
                  storageGb={formData.storageGb}
                  isDeploying={loading}
                />
              </div>

              {/* Version badge */}
              <motion.div
                className="px-4 py-2 rounded-full mb-6"
                style={{
                  background: DB_TYPE_COLORS[formData.type].bg,
                  border: `1px solid ${DB_TYPE_COLORS[formData.type].border}`,
                }}
              >
                <span className="text-sm font-medium" style={{ color: DB_TYPE_COLORS[formData.type].text }}>
                  v{formData.version}
                </span>
              </motion.div>

              {/* Resources preview */}
              <div className="w-full max-w-xs space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal/60">Storage</span>
                  <span className="font-semibold text-charcoal">{formData.storageGb} GB</span>
                </div>
                <LiquidStorageBar
                  used={formData.storageGb || 1}
                  total={10}
                  height={8}
                  showLabel={false}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal/60">Memory</span>
                  <span className="font-semibold text-charcoal">{formData.memoryMb} MB</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Creation Journey Modal */}
      <CreationJourneyModal
        isOpen={showJourney}
        dbType={formData.type}
        dbName={formData.name}
        onComplete={handleJourneyComplete}
      />

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        message={errorDialog.message}
      />
    </>
  );
}
