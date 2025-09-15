// Servicio de aplicación: maneja el estado del carrito en memoria
export class CartService {
  constructor(storageKey = 'app_cart_v1', storage = (typeof localStorage!=='undefined'? localStorage : null)) {
    this.lines = new Map(); // key: productId
    this._storageKey = storageKey;
    this._storage = storage;
    this._load();
  }

  addProduct(product) {
  if(!product || !product.id) return;
  const existing = this.lines.get(product.id);
  const unitPrice = typeof product.unitPrice === 'number' ? product.unitPrice : product.price || 0;
  const name = product.name || product.title || product.id;
    if (existing) {
      existing.qty += 1;
      existing.lineTotal = existing.qty * existing.unitPrice;
    } else {
      this.lines.set(product.id, {
        productId: product.id,
    name,
        qty: 1,
    unitPrice,
    lineTotal: unitPrice
      });
    }
  this._persist();
  }

  changeQty(productId, delta) {
    const line = this.lines.get(productId);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      this.lines.delete(productId);
    } else {
      line.lineTotal = line.qty * line.unitPrice;
    }
  this._persist();
  }

  remove(productId) {
  this.lines.delete(productId);
  this._persist();
  }

  clear() {
  this.lines.clear();
  this._persist();
  }

  toArray() {
    return Array.from(this.lines.values());
  }

  total() {
    return this.toArray().reduce((acc, l) => acc + l.lineTotal, 0);
  }

  isEmpty() {
    return this.lines.size === 0;
  }

  _persist() {
    if(!this._storage) return;
    try {
      const payload = JSON.stringify(this.toArray());
      this._storage.setItem(this._storageKey, payload);
    } catch {}
  }

  _load() {
    if(!this._storage) return;
    try {
      const raw = this._storage.getItem(this._storageKey);
      if(raw) {
        const arr = JSON.parse(raw);
        arr.forEach(l=> this.lines.set(l.productId, l));
      }
    } catch {}
  }
}