"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Upload, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Spinner from "@/components/spinner"

interface ManualEntry {
  name: string
  phone: string
}

interface FileUploadSectionProps {
  onFileUpload: (file: File) => void
  onAddNames: (entries: ManualEntry[]) => void
  isUploading?: boolean
}

export default function FileUploadSection({ onFileUpload, onAddNames, isUploading = false }: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [manualName, setManualName] = useState("")
  const [manualPhone, setManualPhone] = useState("")
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([])
  const [isAddingManual, setIsAddingManual] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (
        file.name.endsWith(".xlsx") ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFileName(file.name)
        onFileUpload(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  const handleAddEntry = async () => {
    const trimmedName = manualName.trim()
    const trimmedPhone = manualPhone.trim()

    if (trimmedName && trimmedPhone) {
      setIsAddingManual(true)
      const updatedEntries = [...manualEntries, { name: trimmedName, phone: trimmedPhone }]
      setManualEntries(updatedEntries)
      setManualName("")
      setManualPhone("")
      await onAddNames(updatedEntries)
      setIsAddingManual(false)
    }
  }

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = manualEntries.filter((_, i) => i !== index)
    setManualEntries(updatedEntries)
    onAddNames(updatedEntries)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAddingManual) {
      handleAddEntry()
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Langkah 1: Upload File atau Tambah Nama</h2>
        <p className="text-sm text-slate-600">Upload file Excel atau tambahkan nama dan nomor HP secara manual</p>
      </div>

      {isUploading ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-blue-50 border-blue-300">
          <Spinner message="Sedang membaca file Excel..." />
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all mb-6 ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-slate-400"
          }`}
        >
          <div className="mb-4">
            <Upload className={`w-12 h-12 mx-auto ${isDragActive ? "text-blue-600" : "text-slate-400"}`} />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-3"
          >
            Pilih File
          </button>

          <p className="text-sm text-slate-600 mb-1">atau drag & drop file Excel di sini</p>
          <p className="text-xs text-slate-500">Format: .xlsx dengan kolom Nama dan Nomor HP</p>

          {fileName && <p className="text-sm text-emerald-600 font-medium mt-4">✓ {fileName}</p>}

          <input ref={fileInputRef} type="file" accept=".xlsx" onChange={handleFileSelect} className="hidden" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-slate-200"></div>
        <span className="text-sm font-medium text-slate-500">ATAU</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Tambah Nama & Nomor HP Secara Manual</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Masukkan nama..."
            disabled={isAddingManual}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nomor HP (cth: 62812345678)..."
              disabled={isAddingManual}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            <Button
              onClick={handleAddEntry}
              disabled={isAddingManual}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingManual ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Tambah</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {manualEntries.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-600 mb-2">Data yang ditambahkan ({manualEntries.length}):</p>
            <div className="space-y-2">
              {manualEntries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                >
                  <div>
                    <p className="font-medium text-blue-900">{entry.name}</p>
                    <p className="text-xs text-blue-700">{entry.phone}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveEntry(index)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
