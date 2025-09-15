type LogLevel = 'debug'|'info'|'warn'|'error';

interface LogEntry { level:LogLevel; msg:string; ts:string; context?:any; }

class Logger {
  private minLevelIndex: number;
  private levels: LogLevel[] = ['debug','info','warn','error'];
  constructor(min:LogLevel = (typeof process!=='undefined' && process.env && process.env.NODE_ENV==='production' ? 'info':'debug')) {
    this.minLevelIndex = this.levels.indexOf(min);
  }
  private should(level:LogLevel){ return this.levels.indexOf(level) >= this.minLevelIndex; }
  private format(entry:LogEntry){
    const base = `[${entry.ts}] ${entry.level.toUpperCase()} ${entry.msg}`;
    return entry.context? base + ' ' + JSON.stringify(entry.context): base;
  }
  debug(msg:string, context?:any){ if(this.should('debug')) console.debug(this.format({ level:'debug', msg, ts:new Date().toISOString(), context })); }
  info(msg:string, context?:any){ if(this.should('info')) console.info(this.format({ level:'info', msg, ts:new Date().toISOString(), context })); }
  warn(msg:string, context?:any){ if(this.should('warn')) console.warn(this.format({ level:'warn', msg, ts:new Date().toISOString(), context })); }
  error(msg:string, context?:any){ if(this.should('error')) console.error(this.format({ level:'error', msg, ts:new Date().toISOString(), context })); }
}

export const logger = new Logger();
export function setLogLevel(level:LogLevel){ (logger as any).minLevelIndex = (logger as any).levels.indexOf(level); }
