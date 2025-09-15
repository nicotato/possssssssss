import React, { useEffect, useState } from 'react';
import { useServices } from '../hooks/useServices.ts';
import { Tag } from '../components/Tag.tsx';
import { Modal } from '../components/Modal.tsx';
import { useToasts } from '../components/ToastProvider.tsx';
import { useFormModal } from '../hooks/useFormModal.js';

interface Role { id:string; name:string; description?:string; permissions:string[]; }

export const RolesPage: React.FC = () => {
  const { roles, auth } = useServices();
  const [rows, setRows] = useState<Role[]>([]);
  const [editing, setEditing] = useState<Role|null>(null);
  const [permsInput, setPermsInput] = useState('');

  const { push } = useToasts();
  const showForm = useFormModal();
  const load = async () => {
    if(auth.hasPermission('ROLE_VIEW')) {
      const ls = await roles.list();
      setRows(ls);
    }
  };
  useEffect(()=>{ load(); },[]);

  const openEdit = (r:Role) => { setEditing(r); setPermsInput(r.permissions.join(',')); };
  const savePerms = async () => {
    if(!editing) return;
    const arr = permsInput.split(',').map(p=>p.trim()).filter(Boolean);
  await roles.updateRole(editing.id, { permissions: arr }, auth.getUsername());
  setEditing(null); push({ type:'success', message:'Rol actualizado' }); load();
  };

  const createRole = async () => {
    await showForm<{ name:string; description:string; permissions:string }>(
      { title:'Nuevo Rol', submitLabel:'Crear', fields:[
        { name:'name', label:'Nombre', required:true },
        { name:'description', label:'Descripción' },
        { name:'permissions', label:'Permisos (coma)', placeholder:'PRODUCT_VIEW,PRODUCT_EDIT' }
      ], validate:(v)=> !v.name? 'Nombre requerido': null },
      async (values)=>{
        const arr = values.permissions? values.permissions.split(',').map(p=>p.trim()).filter(Boolean): [];
        await roles.createRole({ name:values.name, description:values.description, permissions: arr }, auth.getUsername());
        push({ type:'success', message:'Rol creado' });
        load();
      }
    );
  };

  if(!auth.hasPermission('ROLE_VIEW')) return <p>No autorizado.</p>;

  return (
    <div>
      <h2 className="section-title">Roles</h2>
      {auth.hasPermission('ROLE_EDIT') && <button className="btn" onClick={createRole}>Nuevo Rol</button>}
      <div style={{display:'grid', gap:'1rem', marginTop:'1rem'}}>
        {rows.map(r=> (
          <div key={r.id} style={{background:'#fff', padding:'.8rem', borderRadius:8, boxShadow:'0 2px 4px rgba(0,0,0,.1)'}}>
            <strong>{r.name}</strong> - <small>{r.description}</small>
            <div style={{margin:'.5rem 0', fontSize:'.55rem', display:'flex', flexWrap:'wrap', gap:'.3rem'}}>
              {r.permissions.map(p=> <Tag key={p}>{p}</Tag>)}
            </div>
            {auth.hasPermission('ROLE_EDIT') && <button className="btn-outline btn-sm" onClick={()=>openEdit(r)}>Editar</button>}
          </div>
        ))}
      </div>

      <Modal open={!!editing} title={`Editar Rol: ${editing?.name}`} onClose={()=>setEditing(null)}>
        <div className="form-group">
          <textarea value={permsInput} onChange={e=>setPermsInput(e.target.value)} rows={4} style={{width:'100%'}} />
          <button className="btn" onClick={savePerms}>Guardar</button>
        </div>
      </Modal>
    </div>
  );
};
