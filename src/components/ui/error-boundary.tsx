'use client'
import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-danger/15 text-danger">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="font-semibold text-fg">Bir şeyler ters gitti</p>
            <p className="mt-1 text-sm text-muted">Bu bölüm yüklenemedi.</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm text-fg transition-colors hover:border-border-hover"
          >
            <RefreshCw size={14} />
            Tekrar dene
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
