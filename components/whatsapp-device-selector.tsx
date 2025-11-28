"use client"
import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"

interface Device {
  id: string
  name: string
  deviceId: string
}

interface WhatsAppDeviceSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (deviceId: string) => void
  isLoading?: boolean
}

export default function WhatsAppDeviceSelector({ isOpen, onClose, onSelect, isLoading }: WhatsAppDeviceSelectorProps) {
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("whatsapp_devices")
    if (saved) {
      setDevices(JSON.parse(saved))
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Pilih Device WhatsApp</h2>

        {devices.length === 0 ? (
          <p className="text-slate-600 text-sm mb-4">
            Belum ada device yang dikonfigurasi. Silakan setup device terlebih dahulu.
          </p>
        ) : (
          <div className="space-y-2 mb-4">
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => {
                  onSelect(device.deviceId)
                  onClose()
                }}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">{device.name}</p>
                  <p className="text-xs text-slate-600 font-mono">{device.deviceId}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
        >
          Batal
        </button>
      </div>
    </div>
  )
}
