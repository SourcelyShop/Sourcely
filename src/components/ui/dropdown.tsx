import { ChevronDown } from 'lucide-react'

interface DropdownProps {
    label: string
    value: string
    options: { label: string; value: string }[]
    onChange: (value: string) => void
    className?: string
}

export function Dropdown({ label, value, options, onChange, className = '' }: DropdownProps) {
    const selectedLabel = options.find(opt => opt.value === value)?.label || label

    return (
        <div className={`relative group z-50 ${className}`}>
            <button
                type="button"
                className="w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white hover:bg-white/10 transition-colors justify-between"
            >
                <span className="text-sm">{selectedLabel}</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>

            <div className="absolute left-0 right-0 top-full mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50 max-h-60 overflow-y-auto">
                <div className="p-2 space-y-1">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${value === option.value
                                ? 'bg-primary/20 text-white'
                                : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
