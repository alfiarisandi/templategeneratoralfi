"use client"

interface TemplateEditorSectionProps {
  template: string
  setTemplate: (template: string) => void
}

export default function TemplateEditorSection({ template, setTemplate }: TemplateEditorSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Langkah 2: Template</h2>
        <p className="text-sm text-slate-600">Gunakan {"{{nama}}"} sebagai variable yang akan diganti</p>
      </div>

      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full h-48 p-4 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder="Masukkan template di sini..."
      />

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 font-medium">
          💡 Gunakan {"{{nama}}"} di template Anda untuk menempatkan nama penerima
        </p>
      </div>
    </div>
  )
}
