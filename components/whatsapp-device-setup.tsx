"use client"
import { useState, useEffect } from "react"
import { Plus, Trash2, Settings } from "lucide-react"

interface Device {
  id: string
  name: string
  deviceId: string
  createdAt: string
}

export default function WhatsAppDeviceSetup() {
  const [devices, setDevices] = useState<Device[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newDevice, setNewDevice] = useState({ name: "", deviceId: "" })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("whatsapp_devices")
    if (saved) {
      setDevices(JSON.parse(saved))
    }
  }, [])

  const saveDevices = (updatedDevices: Device[]) => {
    setDevices(updatedDevices)
    localStorage.setItem("whatsapp_devices", JSON.stringify(updatedDevices))
  }

  const addDevice = () => {
    if (!newDevice.name || !newDevice.deviceId) return

    const device: Device = {
      id: Date.now().toString(),
      name: newDevice.name,
      deviceId: newDevice.deviceId,
      createdAt: new Date().toISOString(),
    }

    saveDevices([...devices, device])
    setNewDevice({ name: "", deviceId: "" })
    setShowForm(false)
  }

  const deleteDevice = (id: string) => {
    saveDevices(devices.filter((d) => d.id !== id))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span>Device WhatsApp ({devices.length})</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Setup Device WhatsApp</h3>

          {/* Device List */}
          <div className="mb-4 max-h-48 overflow-y-auto">
            {devices.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada device</p>
            ) : (
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-start justify-between p-2 bg-slate-50 rounded border border-slate-200"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{device.name}</p>
                      <p className="text-xs text-slate-600 font-mono">{device.deviceId}</p>
                    </div>
                    <button onClick={() => deleteDevice(device.id)} className="text-red-600 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Device Form */}
          {showForm ? (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <input
                type="text"
                placeholder="Nama Device"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Device ID"
                value={newDevice.deviceId}
                onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={addDevice}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Tambah
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium border-t border-slate-200 pt-4"
            >
              <Plus className="w-4 h-4" />
              Tambah Device
            </button>
          )}
        </div>
      )}
    </div>
  )
}
