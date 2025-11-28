"use client"
import { Copy, MessageCircle, CheckCircle2, Send, AlertCircle } from "lucide-react"
import { useState } from "react"
import WhatsAppDeviceSelector from "./whatsapp-device-selector"

interface PreviewSectionProps {
  names: Array<{ id: string; name: string; phone_number: string; whatsapp_status?: string }>
  template: string
  selectedName: string
  setSelectedName: (name: string) => void
  renderTemplate: (name: string) => string
  onSendWhatsApp?: (id: string, name: string, phone: string, deviceId: string) => Promise<void>
}

export default function PreviewSection({
  names,
  template,
  selectedName,
  setSelectedName,
  renderTemplate,
  onSendWhatsApp,
}: PreviewSectionProps) {
  const [copiedName, setCopiedName] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [showDeviceSelector, setShowDeviceSelector] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [pendingSend, setPendingSend] = useState<{ id: string; name: string; phone: string } | null>(null)

  const handleCopyTemplate = (name: string) => {
    const renderedText = renderTemplate(name)
    navigator.clipboard.writeText(renderedText)
    setCopiedName(name)
    setTimeout(() => setCopiedName(null), 2000)
  }

  const handleShareWhatsApp = (name: string) => {
    const renderedText = renderTemplate(name)
    const encodedText = encodeURIComponent(renderedText)
    const whatsappUrl = `https://wa.me/?text=${encodedText}`
    window.open(whatsappUrl, "_blank")
  }

  const handleDirectSend = (item: { id: string; name: string; phone_number: string }) => {
    if (!item.phone_number) {
      setSendError("Nomor handphone tidak ada")
      setTimeout(() => setSendError(null), 3000)
      return
    }
    setPendingSend(item)
    setShowDeviceSelector(true)
  }

  const handleDeviceSelected = async (deviceId: string) => {
    if (!pendingSend || !onSendWhatsApp) return

    try {
      setSendingId(pendingSend.id)
      setSendError(null)
      await onSendWhatsApp(pendingSend.id, pendingSend.name, pendingSend.phone_number, deviceId)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Gagal mengirim pesan")
      setTimeout(() => setSendError(null), 3000)
    } finally {
      setSendingId(null)
      setPendingSend(null)
    }
  }

  const filteredNames = names.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const currentItem = names.find((item) => item.name === selectedName) || filteredNames[0] || names[0]
  const rendered = currentItem ? renderTemplate(currentItem.name) : ""

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "sent":
        return "bg-emerald-50 border-emerald-200 text-emerald-700"
      case "failed":
        return "bg-red-50 border-red-200 text-red-700"
      default:
        return "bg-slate-50 border-slate-200 text-slate-600"
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "sent":
        return "Terkirim"
      case "failed":
        return "Gagal"
      default:
        return "Menunggu"
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Preview Template</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Cari atau Pilih Nama:</label>
        <input
          type="text"
          placeholder="Ketik nama untuk mencari..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (filteredNames.length > 0) {
              setSelectedName(filteredNames[0].name)
            }
          }}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
        />

        <select
          value={currentItem?.name || ""}
          onChange={(e) => setSelectedName(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {filteredNames.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {currentItem && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-600 font-medium">Nomor Handphone</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{currentItem.phone_number || "-"}</p>
          </div>
          <div className={`rounded-lg border p-3 ${getStatusColor(currentItem.whatsapp_status)}`}>
            <p className="text-xs font-medium">Status WhatsApp</p>
            <p className="text-sm font-semibold mt-1">{getStatusText(currentItem.whatsapp_status)}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 min-h-48 mb-6">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
          {rendered}
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => currentItem && handleCopyTemplate(currentItem.name)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="Salin template"
        >
          {copiedName === currentItem?.name ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Salin Template</span>
            </>
          )}
        </button>

        <button
          onClick={() => currentItem && handleDirectSend(currentItem)}
          disabled={sendingId === currentItem?.id || !currentItem?.phone_number}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Kirim langsung ke WhatsApp"
        >
          {sendingId === currentItem?.id ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
              <span>Mengirim...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Kirim Langsung</span>
            </>
          )}
        </button>

        <button
          onClick={() => currentItem && handleShareWhatsApp(currentItem.name)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
          title="Share ke WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Share Manual</span>
        </button>
      </div>

      {sendError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{sendError}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-600 font-medium">Total Nama</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{names.length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-purple-600 font-medium">Karakter</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{rendered.length}</p>
        </div>
        <div className="bg-slate-200 rounded-lg p-3 border border-slate-300">
          <p className="text-xs text-slate-600 font-medium">Baris</p>
          <p className="text-xl font-bold text-slate-700 mt-1">{rendered.split("\n").length}</p>
        </div>
      </div>

      <WhatsAppDeviceSelector
        isOpen={showDeviceSelector}
        onClose={() => setShowDeviceSelector(false)}
        onSelect={handleDeviceSelected}
        isLoading={sendingId !== null}
      />
    </div>
  )
}
