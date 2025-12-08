"use client";

import FileUploadSection from "@/components/file-upload-section";
import NamesListSection from "@/components/names-list-section";
import PreviewSection from "@/components/preview-section";
import Spinner from "@/components/spinner";
import TemplateEditorSection from "@/components/template-editor-section";
import { Button } from "@/components/ui/button";
import WhatsAppDeviceSetup from "@/components/whatsapp-device-setup";
import { AlertCircle, CheckCircle2, Download } from "lucide-react";
import { useEffect, useState } from "react";

interface NameItem {
  id: string;
  name: string;
  phone_number: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [names, setNames] = useState<NameItem[]>([]);
  const [template, setTemplate] = useState("");
  const [selectedName, setSelectedName] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNames();
  }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (template) {
  //       saveTemplate();
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [template]);

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/template");
      if (!response.ok) throw new Error("Failed to save template");
      const data = await response.json();
      setTemplate(data.template || "");
    } catch (err) {
      console.error("[v0] Error saving template:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const saveTemplate = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      });
      if (!response.ok) throw new Error("Failed to save template");
    } catch (err) {
      console.error("[v0] Error saving template:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const loadNames = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/names");
      if (!response.ok) throw new Error("Failed to load names");
      const data = await response.json();
      setNames(data);
      if (data.length > 0) {
        setSelectedName(data[0].name);
      }

      const templateResponse = await fetch("/api/template");
      if (templateResponse.ok) {
        const templateData = await templateResponse.json();
        if (templateData.template) {
          setTemplate(templateData.template);
        }
      }
    } catch (err) {
      console.error("[v0] Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    try {
      setStatus("idle");
      setErrorMessage("");
      setFile(uploadedFile);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/read-excel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal membaca file Excel");
      }

      const data = await response.json();
      await addEntriesToDatabase(data.entries || []);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsUploading(false);
    }
  };

  const addEntriesToDatabase = async (
    entries: Array<{ name: string; phone: string }>
  ) => {
    try {
      for (const entry of entries) {
        const response = await fetch("/api/names", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: entry.name, phone_number: entry.phone }),
        });
        if (!response.ok) throw new Error("Failed to add entry");
      }
      await loadNames();
    } catch (err) {
      console.error("[v0] Error adding entries to database:", err);
      throw err;
    }
  };

  const handleAddNames = async (
    entries: Array<{ name: string; phone: string }>
  ) => {
    try {
      await addEntriesToDatabase(entries);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  const handleDeleteName = async (id: string) => {
    try {
      const response = await fetch(`/api/names/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete name");
      await loadNames();
    } catch (err) {
      console.error("[v0] Error deleting name:", err);
      setStatus("error");
      setErrorMessage("Gagal menghapus nama");
    }
  };

  const handleUpdateName = async (
    id: string,
    newName: string,
    newPhoneNumber: string
  ) => {
    try {
      const response = await fetch(`/api/names/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, phone_number: newPhoneNumber }),
      });
      if (!response.ok) throw new Error("Failed to update name");
      await loadNames();
    } catch (err) {
      console.error("[v0] Error updating name:", err);
      setStatus("error");
      setErrorMessage("Gagal mengubah nama");
    }
  };

  const handleGenerate = async () => {
    if (names.length === 0) {
      setStatus("error");
      setErrorMessage("Silakan tambah nama terlebih dahulu");
      return;
    }

    if (!file) {
      setStatus("error");
      setErrorMessage(
        "Silakan upload file Excel terlebih dahulu untuk generate"
      );
      return;
    }

    try {
      setIsGenerating(true);
      setStatus("idle");
      setErrorMessage("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("template", template);

      const response = await fetch("/api/generate-excel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal generate Excel");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hasil_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTemplate = (name: string): string => {
    return template.replace(/\{\{nama\}\}/g, name);
  };

  const handleSendWhatsApp = async (
    id: string,
    name: string,
    phone: string,
    deviceId: string
  ) => {
    const renderedText = renderTemplate(name);
    const response = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameId: id,
        phone,
        message: renderedText,
        deviceId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal mengirim pesan WhatsApp");
    }

    await loadNames();
  };

  const namesList = names.map((n) => n.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Device Setup Button */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              Generator Template Excel
            </h1>
            <p className="text-lg text-slate-600">
              Upload file Excel atau tambah nama, buat template, dan generate
              dokumen dengan mudah
            </p>
          </div>
          <WhatsAppDeviceSetup />
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-800 text-sm font-medium">
              Proses berhasil! File siap diunduh.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Top Section - Upload & Template */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <FileUploadSection
            onFileUpload={handleFileUpload}
            onAddNames={handleAddNames}
            isUploading={isUploading}
          />
          <TemplateEditorSection
            template={template}
            setTemplate={setTemplate}
            isSaving={isSaving}
            saveTemplate={saveTemplate}
          />
        </div>

        {/* Preview Section - Full Width */}
        {namesList.length > 0 && (
          <div className="mb-8">
            <PreviewSection
              names={names}
              template={template}
              selectedName={selectedName}
              setSelectedName={setSelectedName}
              renderTemplate={renderTemplate}
              onSendWhatsApp={handleSendWhatsApp}
            />
          </div>
        )}

        {/* Generate Button */}
        {namesList.length > 0 && file && (
          <div className="mb-8">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sedang Generate...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download Excel
                </>
              )}
            </Button>
          </div>
        )}

        {/* Bottom Section - Names List Full Width */}
        {!isLoading && namesList.length > 0 && (
          <NamesListSection
            names={names}
            selectedName={selectedName}
            template={template}
            renderTemplate={renderTemplate}
            onDelete={handleDeleteName}
            onUpdate={handleUpdateName}
            onSendWhatsApp={handleSendWhatsApp}
          />
        )}

        {/* Loading state for initial data */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner message="Memuat data..." />
          </div>
        )}
      </div>
    </div>
  );
}
