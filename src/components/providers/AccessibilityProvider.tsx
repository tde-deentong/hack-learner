'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AccessibilitySettings {
  youngReaderMode: boolean
  highContrast: boolean
  dyslexiaFriendly: boolean
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (settings: Partial<AccessibilitySettings>) => void
  applySettings: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    youngReaderMode: false,
    highContrast: false,
    dyslexiaFriendly: false,
    fontSize: 'medium',
    reducedMotion: false,
  })

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error)
      }
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setSettings(prev => ({ ...prev, reducedMotion: prefersReducedMotion }))
  }, [])

  useEffect(() => {
    applySettings()
  }, [settings])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('accessibility-settings', JSON.stringify(updated))
      return updated
    })
  }

  const applySettings = () => {
    const root = document.documentElement
    
    // Apply class names based on settings
    if (settings.youngReaderMode) {
      root.classList.add('young-reader')
    } else {
      root.classList.remove('young-reader')
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (settings.dyslexiaFriendly) {
      root.classList.add('dyslexia-friendly')
    } else {
      root.classList.remove('dyslexia-friendly')
    }

    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Apply font size
    root.style.fontSize = settings.fontSize === 'small' ? '14px' : 
                         settings.fontSize === 'large' ? '20px' : '16px'
  }

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, applySettings }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
