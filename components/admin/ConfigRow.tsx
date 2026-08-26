'use client'

import { useState, useRef } from 'react'

interface ConfigRowProps {
  label: string
  configKey: string
  type: 'number' | 'boolean' | 'text' | 'color'
  initialValue: string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className="relative shrink-0 transition-colors duration-200 cursor-pointer"
      style={{
        width: '40px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: checked ? '#6040d1' : '#d7d5dc',
        opacity: disabled ? 0.6 : 1,
        border: 'none',
        outline: 'none',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '4px',
          left: checked ? '20px' : '4px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          transition: 'left 0.15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}

export default function ConfigRow({
  label,
  configKey,
  type,
  initialValue,
}: ConfigRowProps) {
  const [val, setVal] = useState(initialValue)
  const [boolValue, setBoolValue] = useState(initialValue === 'true')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function save(valueToSave: string) {
    if (saveState === 'saving') return
    setSaveState('saving')

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: configKey, value: valueToSave }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setSaveState('saved')
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  async function handleToggle(v: boolean) {
    setBoolValue(v)
    await save(String(v))
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2 border-b border-[#f2f3fb] last:border-b-0">
      {/* Left: label + key */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-black">{label}</p>
        <p className="text-xs font-mono text-gray-400 mt-0.5">{configKey}</p>
        {saveState === 'error' && (
          <p className="text-xs mt-1 text-red-600 font-medium">Failed to save. Try again.</p>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {type === 'boolean' && (
          <>
            <span className="text-xs text-gray-400">{boolValue ? 'On' : 'Off'}</span>
            <ToggleSwitch checked={boolValue} onChange={handleToggle} disabled={saveState === 'saving'} />
            {saveState === 'saved' && <span className="text-xs font-bold text-green-600">✓</span>}
          </>
        )}

        {type === 'color' && (
          <>
            <input
              type="color"
              value={val || '#6040d1'}
              onChange={(e) => setVal(e.target.value)}
              className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-24 text-xs font-mono text-center rounded-lg border px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#6040d1]"
              style={{ borderColor: '#d7d5dc', backgroundColor: '#fff', color: '#000' }}
            />
            <button
              onClick={() => save(val)}
              disabled={saveState === 'saving'}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer shadow-2xs"
              style={{ backgroundColor: saveState === 'saved' ? '#16a34a' : '#6040d1' }}
            >
              {saveState === 'saving' ? '…' : saveState === 'saved' ? 'Saved ✓' : 'Save'}
            </button>
          </>
        )}

        {(type === 'number' || type === 'text') && (
          <>
            <input
              id={`config-${configKey}`}
              type={type}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save(val)}
              disabled={saveState === 'saving'}
              className={`rounded-lg border text-xs outline-none transition disabled:opacity-60 px-2.5 py-1.5 ${
                type === 'number' ? 'w-24 text-center' : 'w-48 sm:w-64 text-left'
              }`}
              style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
            />
            <button
              id={`save-${configKey}`}
              onClick={() => save(val)}
              disabled={saveState === 'saving'}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer shadow-2xs"
              style={{ backgroundColor: saveState === 'saved' ? '#16a34a' : '#6040d1', minWidth: '60px' }}
            >
              {saveState === 'saving' ? '…' : saveState === 'saved' ? 'Saved ✓' : 'Save'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
