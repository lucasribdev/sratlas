import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { SearchEntry } from '@/lib/search-index'
import { moveAutocompleteIndex, searchEntryTypeLabels } from '@/lib/search-index'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type SearchAutocompleteProps = {
  className?: string
  inputClassName?: string
  label: string
  labelClassName?: string
  onQueryChange: (query: string) => void
  onSelect: (entry: SearchEntry) => void
  placeholder?: string
  query: string
  suggestions: SearchEntry[]
}

export function SearchAutocomplete({
  className,
  inputClassName,
  label,
  labelClassName,
  onQueryChange,
  onSelect,
  placeholder,
  query,
  suggestions,
}: SearchAutocompleteProps) {
  const inputId = useId()
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasQuery = query.trim().length > 0
  const isListVisible = isOpen && hasQuery
  const activeOptionId =
    isListVisible && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined

  const renderedSuggestions = useMemo(
    () =>
      suggestions.map((suggestion, index) => ({
        ...suggestion,
        optionId: `${listboxId}-option-${index}`,
      })),
    [listboxId, suggestions],
  )

  function selectEntry(entry: SearchEntry) {
    onSelect(entry)
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((currentIndex) =>
        moveAutocompleteIndex(currentIndex, suggestions.length, 1),
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((currentIndex) =>
        moveAutocompleteIndex(currentIndex, suggestions.length, -1),
      )
      return
    }

    if (event.key === 'Enter' && isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault()
      selectEntry(suggestions[activeIndex])
      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className={cn('relative grid min-w-0 gap-2', className)}>
      <label
        className={cn('grid gap-2 text-sm font-semibold text-foreground', labelClassName)}
        htmlFor={inputId}
      >
        {label}
      </label>
      <Input
        ref={inputRef}
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isListVisible}
        aria-haspopup="listbox"
        className={inputClassName}
        id={inputId}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120)
        }}
        onChange={(event) => {
          onQueryChange(event.target.value)
          setIsOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        type="search"
        value={query}
      />

      {isListVisible ? (
        <div
          className="absolute top-full right-0 left-0 z-[700] mt-1 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl shadow-slate-950/15"
          id={listboxId}
          role="listbox"
        >
          {renderedSuggestions.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto py-1">
              {renderedSuggestions.map((suggestion, index) => (
                <li
                  aria-selected={activeIndex === index}
                  id={suggestion.optionId}
                  key={suggestion.id}
                  role="option"
                >
                  <button
                    className={cn(
                      'grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                      activeIndex === index && 'bg-muted',
                    )}
                    onClick={() => selectEntry(suggestion)}
                    onMouseDown={(event) => event.preventDefault()}
                    type="button"
                  >
                    <span className="min-w-0 truncate font-medium">{suggestion.label}</span>
                    <Badge className="shrink-0" variant="secondary">
                      {searchEntryTypeLabels[suggestion.type]}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground" role="status">
              No suggestions found.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
