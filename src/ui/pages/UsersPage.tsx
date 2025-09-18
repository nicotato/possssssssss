import React, { useEffect, useState } from 'react';
import { useServices } from '../hooks/useServices.ts';
import { useToasts } from '../components/ToastProvider.tsx';
import { useConfirm } from '../components/ConfirmProvider.tsx';
import { SimpleModal } from '../components/SimpleModal.tsx';

interface User { id:string; username:string; roleId:string; active?:boolean; mustChangePassword?:boolean; }
interface Role { id:string; name:string; }

export const UsersPage: React.FC = () => {
  const { users, roles, auth } = useServices();
  const [rows, setRows] = useState<User[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { push } = useToasts();
  const { confirm } = useConfirm();

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
    // Simple prompt for now
    const temp = prompt('Nueva contraseña temporal:', 'Temp123');
    if (temp) {
      await auth.adminResetPassword?.(userId, temp);
      push({ type:'success', message:'Contraseña reseteada' });
    }
  };
  const deactivate = async (userId:string) => {
    if(await confirm({ message:'¿Desactivar usuario?' })) { await users.deactivate(userId); push({ type:'success', message:'Usuario desactivado' }); load(); }
  };
  
  const handleCreateUser = async (data: any) => {
    await users.create({ 
      username: data.username, 
      roleId: data.roleId, 
      tempPassword: data.tempPassword 
    });
    push({ type:'success', message:'Usuario creado' });
    load();
  };

  if(!auth.hasPermission('USER_VIEW')) return <p>No autorizado.</p>;

  return (
    <div style={{padding: '20px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#2c3e50',
          margin: 0,
          background: 'linear-gradient(135deg, #f77f00 0%, #d63031 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          👥 Usuarios
        </h2>
        {auth.hasPermission('USER_CREATE') && (
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f77f00 0%, #d63031 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(247, 127, 0, 0.3)',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(247, 127, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(247, 127, 0, 0.3)';
            }}
          >
            + Nuevo Usuario
          </button>
        )}
      </div>
      
      <SimpleModal
        title="Nuevo Usuario"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        fields={[
          { name: 'username', label: 'Usuario', required: true },
          { 
            name: 'roleId', 
            label: 'Rol', 
            type: 'select', 
            required: true,
            options: rolesList.map(r => ({ value: r.id, label: r.name }))
          },
          { name: 'tempPassword', label: 'Contraseña Temporal', required: true }
        ]}
        initialData={{ tempPassword: 'Temp123', roleId: rolesList[0]?.id }}
      />
      
      <table style={{
        width:'100%', 
        borderCollapse:'collapse', 
        fontSize:'0.9rem', 
        marginTop:'1rem',
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{
            background:'linear-gradient(135deg, #f77f00 0%, #d63031 100%)', 
            color:'#fff',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <th style={{padding:'16px 12px', textAlign:'left', fontSize:'0.85rem'}}>Usuario</th>
            <th style={{padding:'16px 12px', textAlign:'left', fontSize:'0.85rem'}}>Rol</th>
            <th style={{padding:'16px 12px', textAlign:'center', fontSize:'0.85rem'}}>Activo</th>
            <th style={{padding:'16px 12px', textAlign:'center', fontSize:'0.85rem'}}>Cambiar Pass</th>
            <th style={{padding:'16px 12px', textAlign:'center', fontSize:'0.85rem'}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u, index) => {
            const role = rolesList.find(r=>r.id===u.roleId);
            return (
              <tr key={u.id} style={{
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                transition: 'background-color 0.2s ease',
                borderBottom: index === rows.length - 1 ? 'none' : '1px solid #e9ecef'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff'}
              >
                <td style={{padding:'12px', fontWeight:'500', color:'#2c3e50'}}>{u.username}</td>
                <td style={{padding:'12px'}}>
                  {auth.hasPermission('USER_EDIT') ? (
                    <select 
                      value={u.roleId} 
                      onChange={e=>changeRole(u.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        fontSize: '0.85rem'
                      }}
                    >
                      {rolesList.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  ) : (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      color: '#495057'
                    }}>
                      {role?.name || u.roleId}
                    </span>
                  )}
                </td>
                <td style={{padding:'12px', textAlign:'center'}}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: u.active !== false ? '#d4edda' : '#f8d7da',
                    color: u.active !== false ? '#155724' : '#721c24'
                  }}>
                    {u.active !== false ? 'Sí' : 'No'}
                  </span>
                </td>
                <td style={{padding:'12px', textAlign:'center'}}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: u.mustChangePassword ? '#fff3cd' : '#d1ecf1',
                    color: u.mustChangePassword ? '#856404' : '#0c5460'
                  }}>
                    {u.mustChangePassword ? 'Sí' : 'No'}
                  </span>
                </td>
                <td style={{padding:'12px', textAlign:'center'}}>
                  <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                    {auth.hasPermission('USER_PASSWORD_RESET') && (
                      <button 
                        className="btn-outline btn-sm" 
                        onClick={()=>resetPass(u.id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          border: '1px solid #007bff',
                          color: '#007bff',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#007bff';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#007bff';
                        }}
                      >
                        Reset Pass
                      </button>
                    )}
                    {auth.hasPermission('USER_EDIT') && u.active!==false && (
                      <button 
                        className="btn-danger btn-sm" 
                        onClick={()=>deactivate(u.id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          border: '1px solid #dc3545',
                          color: '#dc3545',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#dc3545';
                        }}
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
