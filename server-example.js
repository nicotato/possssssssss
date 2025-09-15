// Ejemplo muy básico (NO PRODUCCIÓN) de backend Express para sync
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let remoteProducts = [];
let remoteOrders = [];

app.get('/api/pull', (req,res)=>{
  res.json({
    products: remoteProducts,
    orders: remoteOrders
  });
});

app.post('/api/push', (req,res)=>{
  const item = req.body;
  if(item.entity==='products') {
    if(item.op==='create') {
      remoteProducts.push(item.payload);
    }
  } else if(item.entity==='orders') {
    if(item.op==='create') {
      remoteOrders.push(item.payload);
    }
  }
  res.json({ ok:true });
});

app.listen(4000, ()=> console.log('Sync server demo on 4000'));