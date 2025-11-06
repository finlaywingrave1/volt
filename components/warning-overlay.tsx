"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Warning {
  WarningID: number
  Timestamp: string
  WarnedBy: string
  Reason: string
}

interface WarningOverlayProps {
  warning: Warning
  onAccept: (warningId: number) => void
}

export function WarningOverlay({ warning, onAccept }: WarningOverlayProps) {
  const timestamp = new Date(warning.Timestamp).toLocaleString()

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-yellow-950/50 backdrop-blur-xl border-2 border-yellow-500 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-yellow-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-yellow-400" />
        </div>

        <h1 className="text-3xl font-bold text-yellow-400 mb-4">Warning Issued</h1>

        <div className="bg-black/40 rounded-2xl p-6 mb-6 text-left">
          <p className="text-white/60 text-sm mb-2">Reason:</p>
          <p className="text-white text-lg mb-4">{warning.Reason}</p>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-white/40">Issued by:</p>
              <p className="text-white/80">{warning.WarnedBy}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40">Date:</p>
              <p className="text-white/80">{timestamp}</p>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-sm mb-6">Please acknowledge this warning to continue using VoltRadio.</p>

        <Button
          onClick={() => onAccept(warning.WarningID)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-6 text-lg rounded-xl transition-all duration-200"
        >
          I Understand
        </Button>
      </div>
    </div>
  )
}
