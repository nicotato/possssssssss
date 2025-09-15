export class DomainError extends Error { constructor(message:string, public code='DOMAIN_ERROR', public details?:any){ super(message); this.name='DomainError'; } }
export class ValidationError extends DomainError { constructor(message:string, details?:any){ super(message,'VALIDATION_ERROR',details); this.name='ValidationError'; } }
export class AuthError extends DomainError { constructor(message='No autorizado', details?:any){ super(message,'AUTH_ERROR',details); this.name='AuthError'; } }
export class NotFoundError extends DomainError { constructor(message='No encontrado', details?:any){ super(message,'NOT_FOUND',details); this.name='NotFoundError'; } }
export class ConflictError extends DomainError { constructor(message='Conflicto', details?:any){ super(message,'CONFLICT',details); this.name='ConflictError'; } }

export function isDomainError(e:any): e is DomainError { return e instanceof DomainError; }