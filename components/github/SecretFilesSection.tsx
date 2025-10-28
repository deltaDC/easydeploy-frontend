"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Plus, Upload, Trash2, Eye, EyeOff, Lock } from "lucide-react";
import { SecretFile } from "@/types/application.type";

interface SecretFilesSectionProps {
  secretFiles: SecretFile[];
  onSecretFilesChange: (secretFiles: SecretFile[]) => void;
  onError: (error: string) => void;
}

export function SecretFilesSection({
  secretFiles,
  onSecretFilesChange,
  onError,
}: SecretFilesSectionProps) {
  const [secretFileModalOpen, setSecretFileModalOpen] = useState(false);
  const [editingSecretFileIndex, setEditingSecretFileIndex] = useState<number | null>(null);
  const [secretFileName, setSecretFileName] = useState("");
  const [secretFileContent, setSecretFileContent] = useState("");
  const [hiddenSecretFiles, setHiddenSecretFiles] = useState<Set<number>>(new Set());

  const handleAddSecretFile = () => {
    if (!secretFileName || !secretFileContent) {
      onError("Vui lòng nhập tên file và nội dung");
      return;
    }

    if (editingSecretFileIndex !== null) {
      const updated = [...secretFiles];
      updated[editingSecretFileIndex] = { filename: secretFileName, content: secretFileContent };
      onSecretFilesChange(updated);
      setEditingSecretFileIndex(null);
    } else {
      onSecretFilesChange([...secretFiles, { filename: secretFileName, content: secretFileContent }]);
    }

    setSecretFileName("");
    setSecretFileContent("");
    setSecretFileModalOpen(false);
  };

  const handleRemoveSecretFile = (index: number) => {
    onSecretFilesChange(secretFiles.filter((_, i) => i !== index));
  };

  const handleEditSecretFile = (index: number) => {
    const secretFile = secretFiles[index];
    setSecretFileName(secretFile.filename);
    setSecretFileContent(secretFile.content);
    setEditingSecretFileIndex(index);
    setSecretFileModalOpen(true);
  };

  const handleOpenSecretFileModal = () => {
    setSecretFileName("");
    setSecretFileContent("");
    setEditingSecretFileIndex(null);
    setSecretFileModalOpen(true);
  };

  const handleSecretFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setSecretFileName(file.name);
      setSecretFileContent(text);
      event.target.value = '';
    } catch (err) {
      onError("Không thể đọc file");
    }
  };

  const toggleSecretFileVisibility = (index: number) => {
    setHiddenSecretFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const maskValue = (value: string, type: 'short' | 'long' = 'short') => {
    if (!value) return '';
    if (type === 'long') {
      return '••••••••••••••••••••••••••••••••••••••••••••••••••••';
    }
    return '••••••••••••••••';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <CardTitle>Secret Files</CardTitle>
        </div>
        <CardDescription>
          Store plaintext files containing secret data (such as a `.env` file or a private key). Access during builds and at runtime from your app&apos;s root, or from `/etc/secrets/&lt;filename&gt;`.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {secretFiles.map((secretFile, index) => {
          const isHidden = hiddenSecretFiles.has(index);
          return (
            <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 font-medium">
                {isHidden ? maskValue(secretFile.filename, 'long') : secretFile.filename}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleSecretFileVisibility(index)}
                type="button"
                title={isHidden ? "Show file" : "Hide file"}
              >
                {isHidden ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditSecretFile(index)}
              >
                Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveSecretFile(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        })}

        {secretFiles.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có secret file nào được thêm</p>
          </div>
        )}

        <Dialog open={secretFileModalOpen} onOpenChange={setSecretFileModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={handleOpenSecretFileModal}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Secret File
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[66vw] w-full max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Secret File</DialogTitle>
              <DialogDescription>
                Nhập tên file và nội dung cho secret file của bạn.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 flex-1 min-h-0 overflow-hidden flex flex-col">
              <div className="space-y-2">
                <Label htmlFor="secretFileName" className="text-sm font-medium">Tên file</Label>
                <Input
                  id="secretFileName"
                  placeholder="file.txt"
                  value={secretFileName}
                  onChange={(e) => setSecretFileName(e.target.value)}
                />
              </div>
              <div className="flex-1 min-h-0 flex flex-col space-y-2">
                <Label htmlFor="secretFileContent" className="text-sm font-medium">Nội dung file</Label>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Textarea
                    id="secretFileContent"
                    placeholder="Dán nội dung file vào đây..."
                    value={secretFileContent}
                    onChange={(e) => setSecretFileContent(e.target.value)}
                    className="font-mono text-sm w-full h-full resize-none overflow-auto"
                    style={{ 
                      minHeight: '400px',
                      maxHeight: '55vh'
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <input
                    type="file"
                    id="secretFileUpload"
                    onChange={handleSecretFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="secretFileUpload" className="flex items-center text-primary hover:underline cursor-pointer text-sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Chọn file
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSecretFileName("");
                setSecretFileContent("");
                setEditingSecretFileIndex(null);
                setSecretFileModalOpen(false);
              }}>
                Hủy
              </Button>
              <Button onClick={handleAddSecretFile}>
                {editingSecretFileIndex !== null ? "Cập nhật" : "Lưu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

