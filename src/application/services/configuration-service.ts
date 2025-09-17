import { logger } from '../../infrastructure/logging/logger.ts';

export interface SystemConfig {
  printer: {
    preferredMode: 'auto' | 'escpos' | 'window';
    fallbackWindow: boolean;
  };
  ui: {
    drawerAutoClose: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  pos: {
    autoSave: boolean;
    taxRate: number;
    currency: 'ARS' | 'USD' | 'EUR';
  };
}

const DEFAULT_CONFIG: SystemConfig = {
  printer: {
    preferredMode: 'auto',
    fallbackWindow: true
  },
  ui: {
    drawerAutoClose: true,
    theme: 'light'
  },
  pos: {
    autoSave: true,
    taxRate: 0.21, // 21% IVA
    currency: 'ARS'
  }
};

export class ConfigurationService {
  private config: SystemConfig;
  private listeners: { [key: string]: ((config: SystemConfig) => void)[] } = {};
  private storageKey = 'pos_system_config';

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SystemConfig {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return this.mergeConfig(DEFAULT_CONFIG, parsed);
      }
    } catch (error) {
      logger.warn('Error loading system configuration:', error);
    }
    return { ...DEFAULT_CONFIG };
  }

  private mergeConfig(defaults: SystemConfig, stored: any): SystemConfig {
    return {
      printer: { ...defaults.printer, ...stored.printer },
      ui: { ...defaults.ui, ...stored.ui },
      pos: { ...defaults.pos, ...stored.pos }
    };
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      this.notifyListeners();
      logger.info('Configuration saved');
    } catch (error) {
      logger.error('Error saving configuration:', error);
      throw error;
    }
  }

  // Getters
  getConfig(): SystemConfig {
    return { ...this.config };
  }

  getPrinterConfig() {
    return { ...this.config.printer };
  }

  getUIConfig() {
    return { ...this.config.ui };
  }

  getPOSConfig() {
    return { ...this.config.pos };
  }

  // Setters
  updatePrinterConfig(updates: Partial<SystemConfig['printer']>): void {
    this.config.printer = { ...this.config.printer, ...updates };
    this.saveConfig();
  }

  updateUIConfig(updates: Partial<SystemConfig['ui']>): void {
    this.config.ui = { ...this.config.ui, ...updates };
    this.saveConfig();
  }

  updatePOSConfig(updates: Partial<SystemConfig['pos']>): void {
    this.config.pos = { ...this.config.pos, ...updates };
    this.saveConfig();
  }

  updateConfig(updates: Partial<SystemConfig>): void {
    if (updates.printer) {
      this.config.printer = { ...this.config.printer, ...updates.printer };
    }
    if (updates.ui) {
      this.config.ui = { ...this.config.ui, ...updates.ui };
    }
    if (updates.pos) {
      this.config.pos = { ...this.config.pos, ...updates.pos };
    }
    this.saveConfig();
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }

  resetPrinterConfig(): void {
    this.config.printer = { ...DEFAULT_CONFIG.printer };
    this.saveConfig();
  }

  // Event listeners
  onChange(callback: (config: SystemConfig) => void): void {
    const key = 'change';
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }

  offChange(callback: (config: SystemConfig) => void): void {
    const key = 'change';
    if (this.listeners[key]) {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    }
  }

  private notifyListeners(): void {
    const callbacks = this.listeners['change'] || [];
    callbacks.forEach(callback => {
      try {
        callback(this.config);
      } catch (error) {
        logger.error('Error in configuration change listener:', error);
      }
    });
  }

  // Export/Import configuration
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): void {
    try {
      const parsed = JSON.parse(configJson);
      this.config = this.mergeConfig(DEFAULT_CONFIG, parsed);
      this.saveConfig();
    } catch (error) {
      logger.error('Error importing configuration:', error);
      throw new Error('Invalid configuration format');
    }
  }

  // Validation
  validateConfig(config: any): boolean {
    try {
      // Basic structure validation
      if (!config || typeof config !== 'object') return false;
      
      // Validate printer config
      if (config.printer) {
        const validModes = ['auto', 'escpos', 'window'];
        if (config.printer.preferredMode && !validModes.includes(config.printer.preferredMode)) {
          return false;
        }
      }

      // Validate UI config
      if (config.ui) {
        const validThemes = ['light', 'dark', 'auto'];
        if (config.ui.theme && !validThemes.includes(config.ui.theme)) {
          return false;
        }
      }

      // Validate POS config
      if (config.pos) {
        const validCurrencies = ['ARS', 'USD', 'EUR'];
        if (config.pos.currency && !validCurrencies.includes(config.pos.currency)) {
          return false;
        }
        if (config.pos.taxRate !== undefined && (config.pos.taxRate < 0 || config.pos.taxRate > 1)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
}
