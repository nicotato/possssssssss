import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext.tsx';
import { Input, Card, CardHeader, CardBody, Alert } from '../components/index.js';
import type { PrintMode } from '../../application/services/printing-service.ts';
import type { SystemConfig } from '../../application/services/configuration-service.ts';

export const ConfigurationPage: React.FC = () => {
  const { services } = useAppState();
  const [config, setConfig] = useState<SystemConfig['printer']>({
    preferredMode: 'auto',
    fallbackWindow: true
  });
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Cargar configuración al iniciar
  useEffect(() => {
    if (services?.config) {
      const printerConfig = services.config.getPrinterConfig();
      setConfig(printerConfig);
    }
  }, [services?.config]);

  const saveConfiguration = async () => {
    try {
      if (!services?.config) {
        throw new Error('Servicio de configuración no disponible');
      }

      // Guardar en el ConfigurationService
      services.config.updatePrinterConfig(config);
      
      // También actualizar el servicio de impresión si está disponible
      if (services?.printing) {
        if (services.printing.setPreferredMode) {
          services.printing.setPreferredMode(config.preferredMode);
        }
        if (services.printing.setFallbackWindow) {
          services.printing.setFallbackWindow(config.fallbackWindow);
        } else if ((services.printing as any).fallbackWindow !== undefined) {
          // Si no hay método setter, al menos intentar establecer la propiedad
          (services.printing as any).fallbackWindow = config.fallbackWindow;
        }
      }
      
      setStatus({ type: 'success', message: 'Configuración guardada correctamente' });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setStatus({ type: 'error', message: 'Error al guardar la configuración' });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const testPrinter = async () => {
    if (!services?.printing) {
      setStatus({ type: 'error', message: 'Servicio de impresión no disponible' });
      return;
    }

    setIsTestPrinting(true);
    setStatus({ type: 'info', message: 'Enviando página de prueba...' });

    try {
      // Crear una orden de prueba
      const testOrder = {
        id: `TEST-${Date.now()}`,
        createdAt: new Date().toISOString(),
        lines: [
          { qty: 1, name: 'Pizza Margherita', price: 12.50, lineTotal: 12.50 },
          { qty: 2, name: 'Coca Cola', price: 2.50, lineTotal: 5.00 }
        ],
        subtotal: 17.50,
        tax: 1.75,
        total: 19.25,
        customerName: 'Cliente de Prueba',
        note: 'Esta es una impresión de prueba'
      };

      await services.printing.printInvoice(testOrder as any);
      setStatus({ type: 'success', message: 'Página de prueba enviada correctamente' });
    } catch (error) {
      console.error('Error en impresión de prueba:', error);
      setStatus({ type: 'error', message: 'Error al enviar página de prueba' });
    } finally {
      setIsTestPrinting(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleConfigChange = (key: keyof SystemConfig['printer'], value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>⚙️ Configuración</h2>
        <p>Administra las configuraciones del sistema</p>
      </div>

      <Card variant="outlined" padding="large" className="mb-4">
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>🖨️ Configuración de Impresoras</h3>
        </CardHeader>
        <CardBody>
          <div className="config-form">
          <div className="form-group">
            <label>Modo de Impresión Preferido</label>
            <select 
              value={config.preferredMode} 
              onChange={(e) => handleConfigChange('preferredMode', e.target.value as PrintMode)}
              className="select-input"
            >
              <option value="auto">Automático</option>
              <option value="escpos">ESC/POS (Térmica)</option>
              <option value="window">Ventana de Navegador</option>
            </select>
            <small className="form-help">
              • <strong>Automático:</strong> Intenta ESC/POS → impresoras dedicadas → ventana (respaldo inteligente)<br/>
              • <strong>ESC/POS:</strong> Solo impresora térmica ESC/POS (modo estricto, falla si no está disponible)<br/>
              • <strong>Ventana:</strong> Siempre usa ventana del navegador (modo simple)
            </small>
          </div>

          <div className="form-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="fallbackWindow"
                checked={config.fallbackWindow}
                onChange={(e) => handleConfigChange('fallbackWindow', e.target.checked)}
                className="checkbox-input"
              />
              <label htmlFor="fallbackWindow" className="checkbox-label">
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Usar ventana como respaldo</span>
              </label>
            </div>
            <small className="form-help">
              Solo para <strong>modo ESC/POS</strong>: si la impresora térmica falla, abrir ventana automáticamente. 
              <br/>En modo <strong>Automático</strong> ya incluye respaldo inteligente.
            </small>
          </div>

          <div className="form-actions">
            <button 
              className="btn btn-primary" 
              onClick={saveConfiguration}
            >
              💾 Guardar Configuración
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={testPrinter}
              disabled={isTestPrinting}
            >
              {isTestPrinting ? '⏳ Imprimiendo...' : '🧪 Imprimir Prueba'}
            </button>
          </div>

          </div>

          {status && (
            <Alert 
              variant={status.type === 'success' ? 'success' : status.type === 'error' ? 'danger' : 'info'}
              dismissible
              onDismiss={() => setStatus(null)}
            >
              {status.message}
            </Alert>
          )}
        </CardBody>
      </Card>

      <Card variant="filled" padding="large" className="mb-4">
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>📊 Estado del Sistema</h3>
        </CardHeader>
        <CardBody>
        <div className="system-status">
          <div className="status-item">
            <strong>Servicio de Impresión:</strong> 
            <span className={services?.printing ? 'status-ok' : 'status-error'}>
              {services?.printing ? '✅ Activo' : '❌ No Disponible'}
            </span>
          </div>
          <div className="status-item">
            <strong>Modo Actual:</strong> 
            <span className="status-info">{config.preferredMode}</span>
          </div>
          <div className="status-item">
            <strong>Respaldo por Ventana:</strong> 
            <span className={config.fallbackWindow ? 'status-ok' : 'status-warning'}>
              {config.fallbackWindow ? '✅ Habilitado' : '⚠️ Deshabilitado'}
            </span>
          </div>
          </div>
        </CardBody>
      </Card>

      <Card variant="default" padding="large">
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>ℹ️ Información Técnica</h3>
        </CardHeader>
        <CardBody>
          <div className="tech-info">
          <p><strong>Tipos de Impresora Soportados:</strong></p>
          <ul>
            <li><strong>Window:</strong> Abre una ventana del navegador con el documento a imprimir. Compatible con cualquier impresora.</li>
            <li><strong>ESC/POS:</strong> Protocolo estándar para impresoras térmicas. Ideal para tickets y facturas.</li>
            <li><strong>USB:</strong> Conexión directa vía WebUSB API (experimental, requiere navegador compatible).</li>
          </ul>
          
          <p><strong>Recomendaciones:</strong></p>
          <ul>
            <li>Para uso general: Mantén el modo "Automático" activado.</li>
            <li>Para impresoras térmicas: Usa modo "ESC/POS".</li>
            <li>Como respaldo: Siempre mantén habilitada la impresión por ventana.</li>
          </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
