import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart.ts';
import { useRepos, useServices } from '../hooks/useServices.ts';
import { Modal } from '../components/Modal.tsx';
import { useToasts } from '../components/ToastProvider.tsx';
import { useConfirm } from '../components/ConfirmProvider.tsx';
import { useFormModal } from '../hooks/useFormModal.js';
import { Input, Button, Card, CardHeader, CardBody, Badge } from '../components/index.js';

import { DISCOUNT_TYPES } from '../../domain/discounts/discount-types.js';
import { PAYMENT_METHODS } from '../../domain/payments/payment-methods.js';
import { formatMoney } from '../../utils/format.ts';

export const MenuPage: React.FC = () => {
  const repos = useRepos();
  const services = useServices();
  const cart = useCart();
  const { push } = useToasts();
  const { confirm } = useConfirm();
  const showForm = useFormModal();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(()=>{ 
    (async()=>{ 
      try {
        console.log('Cargando productos...');
        const list = await repos.products.getAll(); 
        console.log('Productos obtenidos:', list);
        const productsData = list.map((d:any)=> {
          const product = d.toJSON ? d.toJSON() : d;
          console.log('Producto procesado:', product);
          return product;
        });
        setProducts(productsData);
      } catch(error) {
        console.error('Error cargando productos:', error);
        push({ type: 'error', message: 'Error cargando productos' });
      } finally {
        setLoading(false);
      }
    })(); 
  },[repos.products]);

  useEffect(()=>{ 
    (async()=>{ 
      try {
        console.log('Cargando productos...');
        const list = await repos.products.getAll(); 
        console.log('Productos obtenidos:', list);
        const productsData = list.map((d:any)=> {
          const product = d.toJSON ? d.toJSON() : d;
          console.log('Producto procesado:', product);
          return product;
        });
        setProducts(productsData);
      } catch(error) {
        console.error('Error cargando productos:', error);
        push({ type: 'error', message: 'Error cargando productos' });
      } finally {
        setLoading(false);
      }
    })(); 
  },[repos.products]);

  if (loading) {
    return <div style={{padding: '2rem', textAlign: 'center'}}>Cargando productos...</div>;
  }

  console.log('Cart canSell:', cart.canSell);
  console.log('Auth isAuthenticated:', services.auth?.isAuthenticated?.());
  console.log('Cart lines:', cart.lines);
  console.log('Products:', products.length);

  const filtered = products.filter(p=> p.name.toLowerCase().includes(search.toLowerCase()));

  const addDiscount = (form:HTMLFormElement) => {
    const data = new FormData(form);
    const type = data.get('type') as string;
    const value = parseFloat(data.get('value') as string);
    const label = data.get('label') as string;
    if(isNaN(value) || value<=0) return;
    cart.addDiscount({ type, value, label });
    setShowDiscounts(false);
  };
  const addPayment = (form:HTMLFormElement) => {
    const data = new FormData(form);
    const method = data.get('method') as string;
    const amount = parseFloat(data.get('amount') as string);
    if(isNaN(amount) || amount<=0) return;
    cart.addPayment({ method, amount });
    setShowPayments(false);
  };

  const buscarCliente = async () => {
    if(!phone) return;
    await cart.findCustomer(phone);
  };
  const nuevoCliente = async () => {
    if(!phone) return;
    await showForm<{ name:string; address:string; barrio:string }>(
      { title:'Nuevo Cliente', submitLabel:'Crear', fields:[
        { name:'name', label:'Nombre', required:true },
        { name:'address', label:'Dirección' },
        { name:'barrio', label:'Barrio' }
      ], validate:(v)=> !v.name? 'Nombre requerido': null },
      async (values)=>{
        await cart.createCustomer({ phone, name:values.name, address:values.address, barrio:values.barrio });
        push({ type:'success', message:'Cliente creado' });
      }
    );
  };

  const finalizar = async (printKitchen:boolean) => {
    try {
      const order = await cart.finalize({ printKitchen });
      push({ type:'success', message:'Venta registrada' });
    } catch(e:any) { push({ type:'error', message:e.message || 'Error finalizando' }); }
  };

  return (
    <div className="main-content">
      <section className="productos-section">
        <div className="form-group" style={{marginTop:0}}>
          <Input 
            placeholder="Buscar producto..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)} 
            variant="outline"
            leftIcon="🔍"
          />
        </div>
        <h2 className="section-title">Menú</h2>
        <div className="productos">
          {filtered.length === 0 && !loading && (
            <div style={{padding: '2rem', textAlign: 'center', color: '#666'}}>
              {search ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </div>
          )}
          {filtered.map(p=> (
            <article key={p.id} className="producto">
              <img 
                src={p.img || '/api/placeholder/250/180'} 
                alt={p.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI1MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMTgwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjEyNSIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K';
                }}
              />
              <h3>{p.name}</h3>
              <div className="precio">{formatMoney(p.price ?? p.basePrice ?? 0)}</div>
              {cart.canSell && (
                <Button 
                  variant="success" 
                  size="small"
                  onClick={async ()=> {
                    try {
                      console.log('Agregando producto:', p.id);
                      await cart.addProduct(p.id);
                      push({ type: 'success', message: `${p.name} agregado al carrito` });
                    } catch(error) {
                      console.error('Error agregando producto:', error);
                      push({ type: 'error', message: 'Error agregando producto' });
                    }
                  }}
                >
                  Agregar
                </Button>
              )}
            </article>
          ))}
        </div>
      </section>
      <aside className="carrito">
        <h2 className="section-title" style={{marginTop:0}}>Pedido 🛒</h2>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'.6rem'}}>
          <thead><tr style={{background:'#f77f00', color:'#fff'}}><th>Producto</th><th>Qty</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {cart.lines.length===0 && <tr><td colSpan={4} style={{textAlign:'center'}}>Vacío</td></tr>}
            {cart.lines.map(l=> (
              <tr key={l.productId} style={{borderBottom:'1px solid #eee'}}>
                <td>{l.name}</td>
                <td>
                  {cart.canSell && (
                    <div style={{display:'flex', gap:'.2rem', alignItems:'center'}}>
                      <Button variant="outline" size="small" onClick={()=>cart.changeQty(l.productId,-1)}>-</Button>
                      {l.qty}
                      <Button variant="outline" size="small" onClick={()=>cart.changeQty(l.productId,1)}>+</Button>
                    </div>
                  )}
                </td>
                <td>{formatMoney(l.lineTotal)}</td>
                <td>{cart.canSell && <Button variant="danger" size="small" onClick={()=>cart.removeLine(l.productId)}>×</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
  <div style={{fontSize:'.7rem', marginTop:'.4rem'}}>
          <div>SubTotal: {formatMoney(cart.pricing.subTotal)}</div>
          <div>Descuentos: -{formatMoney(cart.pricing.discountTotal)}</div>
          <div style={{fontWeight:600}}>Total: {formatMoney(cart.pricing.grandTotal)}</div>
          <div>Pagado: {formatMoney(cart.payment.amountPaid)} | Estado: {cart.payment.paymentStatus}</div>
          {cart.payment.changeDue>0 && <div>Vuelto: {formatMoney(cart.payment.changeDue)}</div>}
        </div>
  <div style={{display:'flex', gap:'.4rem', flexWrap:'wrap', marginTop:'.8rem'}}>
          <Button variant="outline" size="small" onClick={()=>setShowDiscounts(true)}>
            Descuentos ({cart.discounts.length})
          </Button>
          <Button variant="outline" size="small" onClick={()=>setShowPayments(true)}>
            Pagos ({cart.payments.length})
          </Button>
          <Button 
            variant="danger" 
            size="small" 
            disabled={!cart.canSell} 
            onClick={async ()=>{ if(await confirm({ message:'¿Vaciar carrito?' })) cart.clear(); }}
          >
            Vaciar
          </Button>
          <Button 
            variant="primary" 
            size="small" 
            disabled={!cart.canSell || cart.lines.length===0} 
            onClick={()=>finalizar(false)}
          >
            Finalizar
          </Button>
          {services.auth.hasPermission('KITCHEN_PRINT') && 
            <Button 
              variant="outline" 
              size="small" 
              disabled={!cart.canSell || cart.lines.length===0} 
              onClick={()=>finalizar(true)}
            >
              Finalizar + Comanda
            </Button>
          }
        </div>
        <div style={{marginTop:'.8rem'}}>
          <h3 style={{fontSize:'.8rem'}}>Cliente</h3>
          <div style={{display:'flex', gap:'.4rem', marginTop:'.3rem'}}>
            <Input 
              placeholder="Celular" 
              value={phone} 
              onChange={e=>setPhone(e.target.value)} 
              variant="outline"
              size="small"
            />
            <Button variant="outline" size="small" onClick={buscarCliente}>Buscar</Button>
            <Button variant="outline" size="small" onClick={nuevoCliente}>Nuevo</Button>
          </div>
          <div style={{fontSize:'.6rem', marginTop:'.3rem'}}>
            {cart.customer ? (<div><strong>{cart.customer.name}</strong><br />{cart.customer.address} - {cart.customer.barrio}</div>) : 'Sin cliente' }
          </div>
        </div>
      </aside>

      <Modal open={showDiscounts} title="Descuentos" onClose={()=>setShowDiscounts(false)}>
        <form onSubmit={e=>{ e.preventDefault(); addDiscount(e.currentTarget); e.currentTarget.reset(); }} style={{display:'flex', flexDirection:'column', gap:'.4rem'}}>
          <select name="type">{DISCOUNT_TYPES.map((d:any,idx:number)=> <option key={d.code||idx} value={d.code||d}>{d.label||d.code||d}</option>)}</select>
          <Input name="value" type="number" min={0} step={0.01} placeholder="Valor" variant="outline" />
          <Input name="label" placeholder="Etiqueta" variant="outline" />
          <Button variant="primary" type="submit">Agregar</Button>
        </form>
        <ul style={{marginTop:'.6rem', fontSize:'.6rem'}}>
          {cart.discounts.length===0 && <li>Sin descuentos</li>}
          {cart.discounts.map((d,i)=> <li key={i}>#{i+1} {d.type} {d.value} ({d.label || ''}) <Button variant="outline" size="small" onClick={()=>cart.removeDiscount(i)}>×</Button></li>)}
        </ul>
      </Modal>

      <Modal open={showPayments} title="Pagos" onClose={()=>setShowPayments(false)}>
        <form onSubmit={e=>{ e.preventDefault(); addPayment(e.currentTarget); e.currentTarget.reset(); }} style={{display:'flex', flexDirection:'column', gap:'.4rem'}}>
          <select name="method">{PAYMENT_METHODS.map(p=> <option key={p.code} value={p.code}>{p.label}</option>)}</select>
          <Input name="amount" type="number" min={0} step={0.01} placeholder="Monto" variant="outline" />
          <Button variant="primary" type="submit">Agregar</Button>
        </form>
        <ul style={{marginTop:'.6rem', fontSize:'.6rem'}}>
          {cart.payments.length===0 && <li>Sin pagos</li>}
          {cart.payments.map((p,i)=> <li key={i}>#{i+1} {p.method}: {p.amount.toFixed(2)} <Button variant="outline" size="small" onClick={()=>cart.removePayment(i)}>×</Button></li>)}
        </ul>
      </Modal>
    </div>
  );
};
