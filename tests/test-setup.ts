// Global test setup: stub window for printing fallback to avoid noisy errors.
if(!(globalThis as any).window){
  (globalThis as any).window = {
    open: () => ({ document:{ write:()=>{}, close:()=>{} }, print:()=>{} })
  } as any;
}
