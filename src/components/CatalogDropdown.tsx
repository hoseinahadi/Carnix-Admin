"use client";
import {useEffect,useRef,useState} from 'react';
import {Check,ChevronDown,Search} from 'lucide-react';
export type DropdownOption = {value:string;label:string;depth?:number};
export function CatalogDropdown({ label, value, options, placeholder, disabled = false, searchable = false, onChange }: { label?: string; value: string; options: DropdownOption[]; placeholder: string; disabled?: boolean; searchable?: boolean; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const filtered = options.filter((option) => !searchable || option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, [open]);
  return <div className="catalog-dropdown" ref={rootRef} onKeyDown={(event)=>{if(open && event.key === 'Escape'){event.preventDefault();event.stopPropagation();setOpen(false);}}}>
    {label && <span className="catalog-dropdown-label">{label}</span>}
    <button type="button" className="catalog-dropdown-trigger" aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={() => { setOpen((current) => !current); setSearch(''); }}><span className={selected ? '' : 'placeholder'}>{selected?.label ?? placeholder}</span><ChevronDown size={16} className={open ? 'rotated' : ''} /></button>
    {open && <div className="catalog-dropdown-menu" role="listbox" aria-label={label || placeholder}>
      {searchable && <div className="catalog-dropdown-search"><Search size={15} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجو در گزینه‌ها..." /></div>}
      <div className="catalog-dropdown-options">{filtered.length ? filtered.map((option) => <button type="button" role="option" aria-selected={option.value === value} key={option.value} className={option.value === value ? 'selected' : ''} style={{ paddingRight: 12 + (option.depth ?? 0) * 16 }} onClick={() => { onChange(option.value); setOpen(false); setSearch(''); }}><span>{option.depth ? <i aria-hidden="true">↳</i> : null}{option.label}</span>{option.value === value && <Check size={15} />}</button>) : <small className="catalog-dropdown-empty">گزینه‌ای پیدا نشد.</small>}</div>
    </div>}
  </div>;
}
// Test
