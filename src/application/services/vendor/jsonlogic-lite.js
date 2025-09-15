// MINIMAL JSONLOGIC SUBSET (solo if, >, <, var)
export default {
  apply(rule, data) {
    if (rule == null || typeof rule !== 'object') return rule;
    if (Array.isArray(rule)) return rule.map(r=>this.apply(r,data));
    const op = Object.keys(rule)[0];
    const val = rule[op];
    switch(op) {
      case 'if': {
        // format: ["cond","then","else"]
        const [cond, thenVal, elseVal] = val;
        return this.truthy(this.apply(cond,data))
          ? this.apply(thenVal,data)
          : this.apply(elseVal,data);
      }
      case '>': {
        const [a,b] = val.map(x=>this.apply(x,data));
        return a > b;
      }
      case '<': {
        const [a,b] = val.map(x=>this.apply(x,data));
        return a < b;
      }
      case 'var': {
        return this._resolveVar(val, data);
      }
      default:
        // Si no es una operación JSONLogic conocida, devolver el objeto tal como está
        // Esto permite que objetos como { discountPercentCart: 10 } pasen sin procesar
        return rule;
    }
  },
  _resolveVar(path, data) {
    if(!path) return data;
    const parts = path.split('.');
    let cur = data;
    for(const p of parts) {
      if(cur == null) return null;
      cur = cur[p];
    }
    return cur;
  },
  truthy(v) { return !!v; }
};