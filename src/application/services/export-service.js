export class ExportService {
  toCSV(rows, headersOrder) {
    if(!rows.length) return '';
    const headers = headersOrder || Object.keys(rows[0]);
    const escape = v => {
      if(v==null) return '';
      const s = String(v);
      if(/[",\n;]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
      return s;
    };
    const lines = [];
    lines.push(headers.map(escape).join(','));
    rows.forEach(r=>{
      lines.push(headers.map(h=>escape(r[h])).join(','));
    });
    return lines.join('\n');
  }

  downloadCSV(filename, csv) {
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;
    a.download=filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 500);
  }
}