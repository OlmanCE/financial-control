// src/components/forms/ComboboxField.tsx
import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ComboboxOption {
  id: string;
  name: string;
}

interface ComboboxFieldProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  onCreateNew?: (name: string) => Promise<ComboboxOption>;
  error?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  createLabel?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

export default function ComboboxField({
  label,
  required = false,
  placeholder = 'Seleccionar...',
  options,
  value,
  onChange,
  onCreateNew,
  error,
  disabled = false,
  allowCreate = true,
  createLabel = 'Crear',
  emptyMessage = 'No se encontraron resultados',
  searchPlaceholder = 'Buscar...',
}: ComboboxFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtrar opciones según búsqueda
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Verificar si la búsqueda coincide exactamente con una opción existente
  const exactMatch = options.find(
    (option) => option.name.toLowerCase() === searchQuery.toLowerCase()
  );

  // Obtener el nombre de la opción seleccionada
  const selectedOption = options.find((opt) => opt.id === value);
  const displayValue = selectedOption?.name || placeholder;

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchQuery('');
  };

  const handleCreateNew = async () => {
    if (!onCreateNew || !searchQuery.trim() || exactMatch) return;

    setIsCreating(true);
    try {
      const newOption = await onCreateNew(searchQuery.trim());
      onChange(newOption.id);
      setSearchQuery('');
      setIsOpen(false);
    } catch (err) {
      console.error('Error creating new option:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="w-full">
      <Label htmlFor={label} required={required}>
        {label}
      </Label>

      <div ref={dropdownRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            'input flex items-center justify-between w-full cursor-pointer',
            error && 'input-error',
            disabled && 'opacity-50 cursor-not-allowed',
            !value && 'text-muted-foreground'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{displayValue}</span>
          <div className="flex items-center gap-1">
            {value && !disabled && (
              <X
                className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={cn(
                'w-5 h-5 text-muted-foreground transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </button>

        {/* Backdrop */}
        {isOpen && <div className="combobox-backdrop" onClick={() => setIsOpen(false)} />}

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="combobox-dropdown">
            {/* Search Input */}
            <div className="p-3 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="combobox-search-input"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto flex-1">
              {filteredOptions.length > 0 ? (
                <ul className="py-1" role="listbox">
                  {filteredOptions.map((option) => (
                    <li
                      key={option.id}
                      role="option"
                      aria-selected={option.id === value}
                      onClick={() => handleSelect(option.id)}
                      className={cn(
                        'combobox-option',
                        option.id === value && 'combobox-option-selected'
                      )}
                    >
                      <span className="truncate text-sm">{option.name}</span>
                      {option.id === value && (
                        <Check className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center combobox-empty-message">
                  {emptyMessage}
                </div>
              )}
            </div>

            {/* Create New Option */}
            {allowCreate && onCreateNew && searchQuery.trim() && !exactMatch && (
              <div className="border-t border-emerald-200 p-2 bg-gradient-to-r from-emerald-50 to-emerald-100">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="combobox-create-btn"
                >
                  {isCreating ? (
                    <>
                      <div className="spinner spinner-sm" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>
                        {createLabel} "{searchQuery}"
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}