import React, { useState } from 'react';
import '../styles/modal.scss';

export interface FormFieldBase<T=any> { name: keyof T & string; label: string; type?: 'text'|'number'|'textarea'|'password'|'select'; required?: boolean; placeholder?: string; }
export interface TextField<T=any> extends FormFieldBase<T> { type?: 'text'|'password'; }
export interface NumberField<T=any> extends FormFieldBase<T> { type: 'number'; min?: number; max?: number; step?: number; }
export interface TextAreaField<T=any> extends FormFieldBase<T> { type: 'textarea'; rows?: number; }
export interface SelectFieldOption { value:string; label:string; }
export interface SelectField<T=any> extends FormFieldBase<T> { type:'select'; options: SelectFieldOption[]; }
export type FormField<T=any> = TextField<T>|NumberField<T>|TextAreaField<T>|SelectField<T>;

export interface FormModalProps<T=any> { title: string; fields: FormField<T>[]; initial?: Partial<T>; onSubmit(values:T):Promise<void>|void; onClose():void; submitLabel?: string; busyLabel?: string; validate?(values:T): string | null; }

export function FormModal<T extends Record<string, any>=any>({ title, fields, initial, onSubmit, onClose, submitLabel='Guardar', busyLabel='Guardando...', validate }:FormModalProps<T>) {
  const [values,setValues] = useState<Partial<T>>(()=>({ ...(initial||{}) } as Partial<T>));
  const [error,setError] = useState<string|null>(null);
  const [busy,setBusy] = useState(false);

  function update(name:string, value:any){ setValues((v:any)=> ({...v,[name]: value})); }

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();
    setError(null);
    const casted = values as T;
    if(validate){ const msg = validate(casted); if(msg){ setError(msg); return; } }
    try {
      setBusy(true);
      await onSubmit(casted);
      onClose();
    } catch(err:any){
      setError(err?.message || 'Error guardando');
    } finally { setBusy(false); }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close" onClick={()=>!busy && onClose()}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="form-modal-body">
          {fields.map(f=>{
            const val = (values as Record<string, any>)[f.name] ?? '';
            if(f.type === 'textarea') return (
              <label key={f.name} className="form-field">
                <span>{f.label}</span>
                <textarea rows={(f as TextAreaField).rows||3} required={f.required} value={val} placeholder={f.placeholder} onChange={e=>update(f.name,e.target.value)} />
              </label>
            );
            if(f.type === 'number') return (
              <label key={f.name} className="form-field">
                <span>{f.label}</span>
                <input type="number" required={f.required} value={val} placeholder={f.placeholder} min={(f as NumberField).min} max={(f as NumberField).max} step={(f as NumberField).step||'any'} onChange={e=>update(f.name, e.target.value === '' ? '' : Number(e.target.value))} />
              </label>
            );
            if(f.type === 'select') return (
              <label key={f.name} className="form-field">
                <span>{f.label}</span>
                <select required={f.required} value={val} onChange={e=>update(f.name,e.target.value)}>
                  <option value="" disabled>{(f as SelectField).placeholder || 'Selecciona...'}</option>
                  {(f as SelectField).options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            );
            return (
              <label key={f.name} className="form-field">
                <span>{f.label}</span>
                <input type={f.type === 'password' ? 'password':'text'} required={f.required} value={val} placeholder={f.placeholder} onChange={e=>update(f.name,e.target.value)} />
              </label>
            );
          })}
          {error && <div className="form-error">{error}</div>}
          <div className="modal-footer">
            <button type="button" disabled={busy} onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={busy}>{busy ? busyLabel : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
