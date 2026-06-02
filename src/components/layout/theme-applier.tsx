'use client'
import { useEffect } from 'react'
import { useStore } from '@/hooks/useStore'

export function ThemeApplier() {
  const { data } = useStore()
  useEffect(() => {
    document.documentElement.dataset.theme = data.profile.theme
  }, [data.profile.theme])
  return null
}
