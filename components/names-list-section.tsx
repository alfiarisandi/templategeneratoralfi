"use client";

import { Check, CheckCircle2, Copy, Edit2, Trash2, X } from "lucide-react";
import { useState, ChangeEvent } from "react";
import Pagination from "./pagination";

interface NameItem {
  id: string;
  name: string;
  phone_number?: string;
  whatsapp_status?: "pending" | "sent" | "failed";
}

interface NamesListSectionProps {
  names: NameItem[];
  selectedName: string;
  template: string;
  renderTemplate: (name: string) => string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newName: string, newPhoneNumber: string) => void;
  onSendWhatsApp: (
    id: string,
    name: string,
    phone: string,
    deviceId: string
  ) => Promise<void>;
}

const ITEMS_PER_PAGE = 12;

export default function NamesListSection({
  names,
  selectedName,
  template,
  renderTemplate,
  onDelete,
  onUpdate,
  onSendWhatsApp,
}: NamesListSectionProps) {
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState({ name: "", phone_number: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingError, setSendingError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNames = names.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredNames.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedNames = filteredNames.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCopyTemplate = (name: string) => {
    const renderedText = renderTemplate(name);
    navigator.clipboard.writeText(renderedText);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const handleShareWhatsApp = (name: string, phone: string) => {
    const renderedText = renderTemplate(name);
    const encodedText = encodeURIComponent(renderedText);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSendWhatsApp = async (
    id: string,
    name: string,
    phone: string,
    deviceId: string
  ) => {
    if (!phone) {
      setSendingError("Nomor HP tidak ditemukan");
      return;
    }

    try {
      setSendingId(id);
      setSendingError(null);
      const renderedText = renderTemplate(name);
      await onSendWhatsApp(id, name, phone, deviceId);
    } catch (err) {
      setSendingError(
        err instanceof Error ? err.message : "Gagal mengirim pesan"
      );
    } finally {
      setSendingId(null);
    }
  };

  const startEdit = (
    id: string,
    currentName: string,
    currentPhoneNumber: string
  ) => {
    setEditingId(id);
    setEditValue({ name: currentName, phone_number: currentPhoneNumber });
  };

  const saveEdit = (id: string) => {
    if (editValue.name.trim()) {
      onUpdate(id, editValue.name.trim(), editValue.phone_number.trim());
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue({ name: "", phone_number: "" });
  };

  const handleEdit = (e: ChangeEvent<HTMLInputElement>) => {
    setEditValue((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case "sent":
        return {
          color: "bg-emerald-100 text-emerald-700 border-emerald-300",
          label: "Terkirim",
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-700 border-red-300",
          label: "Gagal",
        };
      default:
        return {
          color: "bg-yellow-100 text-yellow-700 border-yellow-300",
          label: "Menunggu",
        };
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        Daftar Nama ({filteredNames.length})
      </h2>

      {sendingError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {sendingError}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Cari nama..."
          className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {paginatedNames.map((item) => {
          const statusDisplay = getStatusDisplay(item.whatsapp_status);
          return (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:border-slate-300 transition-all"
            >
              <div className="mb-3">
                {editingId === item.id ? (
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={editValue.name}
                      onChange={handleEdit}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editValue.phone_number}
                      name="phone_number"
                      onChange={handleEdit}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {item.name}
                    </p>
                    {item.phone_number && (
                      <p className="text-xs text-slate-600 truncate">
                        {item.phone_number}
                      </p>
                    )}
                    <div
                      className={`inline-block text-xs font-medium px-2 py-1 rounded-full border mt-2 ${statusDisplay.color}`}
                    >
                      {statusDisplay.label}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {editingId === item.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                      title="Simpan"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                      title="Batal"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleCopyTemplate(item.name)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Salin template"
                    >
                      {copiedName === item.name ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* <button
                      onClick={() => handleSendWhatsApp(item.id, item.name, item.phone_number || "")}
                      disabled={sendingId === item.id || !item.phone_number}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-green-100 hover:bg-green-200 text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Kirim ke WhatsApp via API"
                    >
                      {sendingId === item.id ? (
                        <div className="w-3 h-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button> */}

                    {/* <button
                      onClick={() =>
                        handleShareWhatsApp(item.name, item.phone_number || "")
                      }
                      disabled={!item.phone_number}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Share ke WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button> */}

                    <button
                      onClick={() =>
                        startEdit(item.id, item.name, item.phone_number || "")
                      }
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                      title="Edit nama"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                      title="Hapus nama"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredNames.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">
          Tidak ada nama
        </p>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
