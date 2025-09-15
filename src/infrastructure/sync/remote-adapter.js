// Adaptador remoto (demostración) usando fetch a un backend Express hipotético.
// Define endpoints: /api/pull, /api/push (body: item). Autenticación con header token (simplificado).
export class RemoteAdapter {
  constructor(baseUrl, tokenProvider) {
    this.baseUrl = baseUrl;
    this.tokenProvider = tokenProvider; // function
  }

  async _headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (await this.tokenProvider())
    };
  }

  async pull() {
    const res = await fetch(this.baseUrl + '/api/pull', {
      headers: await this._headers()
    });
    if(!res.ok) throw new Error('Pull failed');
    return res.json();
  }

  async push(item) {
    const res = await fetch(this.baseUrl + '/api/push', {
      method:'POST',
      headers: await this._headers(),
      body: JSON.stringify(item)
    });
    if(!res.ok) throw new Error('Push failed');
    return res.json();
  }
}