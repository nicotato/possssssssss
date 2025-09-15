import React, { useEffect, useState } from 'react';
import { useServices } from '../hooks/useServices.ts';
import { useToasts } from '../components/ToastProvider.tsx';
import { useConfirm } from '../components/ConfirmProvider.tsx';
import { useFormModal } from '../hooks/useFormModal.js';

interface User { id:string; username:string; roleId:string; active?:boolean; mustChangePassword?:boolean; }
interface Role { id:string; name:string; }

export const UsersPage: React.FC = () => {
  const { users, roles, auth } = useServices();
  const [rows, setRows] = useState<User[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);

  const { push } = useToasts();
  const { confirm } = useConfirm();
  const showForm = useFormModal();

  const load = async () => {
    if(auth.hasPermission('USER_VIEW')) {
      const us = await users.list();
      const rs = await roles.list();
      setRows(us); setRolesList(rs);
    }
  };
  useEffect(()=>{ load(); },[]);

  const changeRole = async (userId:string, roleId:string) => {
    await users.changeRole(userId, roleId); push({ type:'success', message:'Rol actualizado' }); load();
  };
  const resetPass = async (userId:string) => {
    await showForm<{ temp:string }>({ title:'Resetear Contraseña', submitLabel:'Resetear', fields:[ { name:'temp', label:'Nueva contraseña temporal', required:true, placeholder:'Temp123' } ], initial:{ temp:'Temp123' }, validate:(v)=> !v.temp? 'Requerido': null }, async (values)=>{
  await auth.adminResetPassword?.(userId, values.temp);
      push({ type:'success', message:'Contraseña reseteada' });
    });
  };
  const deactivate = async (userId:string) => {
    if(await confirm({ message:'¿Desactivar usuario?' })) { await users.deactivate(userId); push({ type:'success', message:'Usuario desactivado' }); load(); }
  };
  const create = async () => {
    await showForm<{ username:string; roleId:string; tempPassword:string }>(
      { title:'Nuevo Usuario', submitLabel:'Crear', fields:[
        { name:'username', label:'Usuario', required:true },
        { name:'roleId', label:'Rol', type:'select', required:true, options: rolesList.map(r=>({ value:r.id, label:r.name })) },
        { name:'tempPassword', label:'Contraseña Temporal', required:true, placeholder:'Temp123' }
      ], initial:{ tempPassword:'Temp123', roleId: rolesList[0]?.id }, validate:(v)=> !v.username? 'Usuario requerido': !v.roleId? 'Rol requerido': !v.tempPassword? 'Contraseña requerida': null },
      async (values)=>{
        await users.create({ username:values.username, roleId:values.roleId, tempPassword: values.tempPassword });
        push({ type:'success', message:'Usuario creado' });
        load();
      }
    );
  };

  if(!auth.hasPermission('USER_VIEW')) return <p>No autorizado.</p>;

  return (
    <div>
      <h2 className="section-title">Usuarios</h2>
      {auth.hasPermission('USER_CREATE') && <button className="btn" onClick={create}>Nuevo Usuario</button>}
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:'.7rem', marginTop:'.6rem'}}>
        <thead>
          <tr style={{background:'#f77f00', color:'#fff'}}>
            <th>Usuario</th><th>Rol</th><th>Activo</th><th>Debe Cambiar Pass</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(u=> {
            const role = rolesList.find(r=>r.id===u.roleId);
            return (
              <tr key={u.id} style={{borderBottom:'1px solid #ddd'}}>
                <td>{u.username}</td>
                <td>
                  {auth.hasPermission('USER_EDIT') ? (
                    <select value={u.roleId} onChange={e=>changeRole(u.id, e.target.value)}>
                      {rolesList.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  ) : (role?.name || u.roleId)}
                </td>
                <td>{u.active!==false ? 'Sí':'No'}</td>
                <td>{u.mustChangePassword ? 'Sí':'No'}</td>
                <td style={{display:'flex', gap:'.3rem'}}>
                  {auth.hasPermission('USER_PASSWORD_RESET') && <button className="btn-outline btn-sm" onClick={()=>resetPass(u.id)}>Reset Pass</button>}
                  {auth.hasPermission('USER_EDIT') && u.active!==false && <button className="btn-danger btn-sm" onClick={()=>deactivate(u.id)}>Desactivar</button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
