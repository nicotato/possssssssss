import React, { useEffect, useState } from 'react';
import { useToasts } from '../components/ToastProvider.tsx';
import { useConfirm } from '../components/ConfirmProvider.tsx';
import { useAppState } from '../AppContext.tsx';
import { useFormModal } from '../hooks/useFormModal.js';

interface ProductDoc {
  id: string;
  name: string;
  category?: string;
  basePrice?: number;
  active?: boolean;
}

export const ProductsPage: React.FC = () => {
  const { repos, services } = useAppState();
  const { push } = useToasts();
  const { confirm } = useConfirm();
  const showForm = useFormModal();
  const [docs, setDocs] = useState<any[]>([]);
  const canCreate = services.auth.hasPermission('PRODUCT_CREATE');
  const canEdit = canCreate || services.auth.hasPermission('PRODUCT_EDIT');

  const load = async () => {
    const res = await repos.products.getAll();
    setDocs(res);
  };
  useEffect(()=>{ load(); },[]);

  const onCreate = async () => {
    if(!canCreate) return;
    await showForm<{ name:string; basePrice:number; category:string; img:string }>(
      { title:'Nuevo Producto', submitLabel:'Crear', fields:[
        { name:'name', label:'Nombre', required:true },
        { name:'basePrice', label:'Precio', type:'number', required:true, placeholder:'100', },
        { name:'category', label:'Categoría', required:false, placeholder:'General' },
        { name:'img', label:'URL Imagen', required:false, placeholder:'https://...' }
      ], initial:{ basePrice:100, category:'General', img:'https://via.placeholder.com/250x180?text=Nuevo' }, validate:(v)=> !v.name? 'Nombre requerido': (v.basePrice==null||isNaN(v.basePrice))? 'Precio inválido': null },
      async (values)=>{
        const id = 'p_'+Date.now();
        await repos.products.col.insert({ id, name:values.name, basePrice: values.basePrice, category: values.category, img:values.img, active:true, createdAt:new Date().toISOString() });
        push({ type:'success', message:'Producto creado' });
        load();
      }
    );
  };

  const onEdit = async (id:string) => {
    if(!canEdit) return;
    const doc = await repos.products.findById(id);
    if(!doc) return;
    const p = doc.toJSON();
    const active = await confirm({ message:'¿Mantener activo? (Cancelar = No)' });
    await showForm<{ name:string; basePrice:number; category:string }>(
      { title:'Editar Producto', submitLabel:'Actualizar', fields:[
        { name:'name', label:'Nombre', required:true },
        { name:'basePrice', label:'Precio', type:'number', required:true },
        { name:'category', label:'Categoría' }
      ], initial:{ name:p.name, basePrice:p.basePrice ?? 0, category:p.category || '' }, validate:(v)=> !v.name? 'Nombre requerido': (v.basePrice==null||isNaN(v.basePrice))? 'Precio inválido': null },
      async (values)=>{
        await doc.incrementalPatch({ name:values.name, basePrice:values.basePrice, category:values.category, active });
        push({ type:'success', message:'Producto actualizado' });
        load();
      }
    );
  };

  return (
    <div>
      <h2 className="section-title">Productos</h2>
      {canCreate && <button className="btn" onClick={onCreate}>Nuevo Producto</button>}
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:'.75rem', marginTop:'.6rem'}}>
        <thead>
          <tr style={{background:'#f77f00', color:'#fff'}}>
            <th>Nombre</th><th>Categoria</th><th>Precio</th><th>Activo</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d:any)=>{
            const data: ProductDoc = d.toJSON ? d.toJSON() : d;
            const price = (data.basePrice!=null && !isNaN(data.basePrice)) ? data.basePrice : 0;
            return (
              <tr key={data.id} style={{borderBottom:'1px solid #ddd'}}>
                <td>{data.name}</td>
                <td>{data.category||''}</td>
                <td>${price.toFixed(2)}</td>
                <td>{data.active!==false? 'Sí':'No'}</td>
                <td>{canEdit && <button className="btn-outline btn-sm" onClick={()=>onEdit(data.id)}>Editar</button>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
