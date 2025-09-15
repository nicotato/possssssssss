import React, { createContext, useCallback, useContext, useState } from 'react';
import { FormModal, FormField } from '../components/FormModal.js';

interface ShowFormArgs<T>{ title:string; fields: FormField<T>[]; initial?: Partial<T>; submitLabel?:string; busyLabel?:string; validate?(values:T): string | null; }
interface FormModalContextValue { showForm<T=any, R=void>(args: ShowFormArgs<T>, onSubmit:(values:T)=>Promise<R>|R): Promise<R|undefined>; }
const FormModalContext = createContext<FormModalContextValue|undefined>(undefined);

export function FormModalProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<any[]>([]);

  const showForm = useCallback(<T, R=void>(args: ShowFormArgs<T>, onSubmit:(v:T)=>Promise<R>|R)=>{
    return new Promise<R|undefined>((resolve)=>{
      const id = Math.random().toString(36).slice(2);
      const close = (result?:R)=>{ setStack(s=> s.filter(m=>m.id!==id)); resolve(result); };
      setStack(s=> [...s, { id, args, onSubmit, close }]);
    });
  },[]);

  return (
    <FormModalContext.Provider value={{ showForm }}>
      {children}
      {stack.map(entry=>{
        const { id, args, onSubmit, close } = entry;
        return (
          <FormModal key={id} title={args.title} fields={args.fields} initial={args.initial} submitLabel={args.submitLabel} busyLabel={args.busyLabel} validate={args.validate} onSubmit={async (values:any)=>{ const r = await onSubmit(values); close(r);} } onClose={()=>close(undefined)} />
        );
      })}
    </FormModalContext.Provider>
  );
}

export function useFormModal(){
  const ctx = useContext(FormModalContext);
  if(!ctx) throw new Error('useFormModal must be used inside FormModalProvider');
  return ctx.showForm;
}
