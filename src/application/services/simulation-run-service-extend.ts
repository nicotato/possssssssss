// Extensión (puedes fusionarlo con el archivo original)
export class SimulationRunService {
  constructor(
    private repo: any,
    private audit: any,
    private auth: any,
    private promotionSimulationService?: any  // inyección circular controlada
  ) {}

  // ... método persistSimulation ya definido
  // Placeholder (si no se fusionó con implementación real) para evitar error de tipo
  async persistSimulation(scenarioInput:any, result:any, tags:string[]) {
    if(this.repo?.create) {
      const run = {
        id: 'sim_'+Date.now().toString(36),
        createdAt: new Date().toISOString(),
        scenarioInput,
        metrics: result,
        tags,
        user: this.auth?.getUsername ? this.auth.getUsername() : 'system'
      };
      await this.repo.create(run);
      return run;
    }
    return { id:'sim_mock', createdAt:new Date().toISOString() };
  }

  async reSimulate(runId: string, { persist = true, tag = 'replay' } = {}) {
    const doc = await this.repo.col.findOne(runId).exec();
    if(!doc) throw new Error('Simulation run no encontrado');
    const run = doc.toJSON();
    if(!this.promotionSimulationService) throw new Error('promotionSimulationService no inyectado');

    const newResult = await this.promotionSimulationService.simulate({
      ...run.scenarioInput,
      persist: false // evitamos doble persistir automático aquí
    });

    let replayRecord = null;
    if (persist) {
      replayRecord = await this.persistSimulation(
        { ...run.scenarioInput, replayOf: runId },
        newResult,
        [...(run.tags||[]), tag]
      );
    }
    await this.audit.log('SIMULATION_RUN_REPLAY', { original: runId, newId: replayRecord?.id });
    return { original: run, newResult, replaySaved: replayRecord };
  }
}