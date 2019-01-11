import {BootableState, Bot, PlatformClient} from '@majobot/api';


export class Majobot implements Bot {
  private _registeredPlatformClients: Array<new() => PlatformClient> = [];
  private _platformClientInstances: Array<PlatformClient> = [];
  private _bootableState: BootableState = 'uninitialized';

  boot(): Promise<any> {
    return Promise.resolve();
  }

  bootPlatformClient(client: { new(): PlatformClient }): Promise<any> {
    if (!this._registeredPlatformClients.includes(client)) {
      return Promise.reject(new Error(`Unknown PlatformClient '${client.name}'!`));
    }
    const clientInstance = new client();
    return clientInstance
      .boot()
      .then((x: any) => {
        this._platformClientInstances.push(clientInstance);
        return x;
      });
  }

  registerPlatformClient(client: { new(): PlatformClient }): Bot {
    if (this._registeredPlatformClients.includes(client)) {
      return this;
    }
    this._registeredPlatformClients.push(client);
    return this;
  }

  registeredPlatformClients(): Array<new() => PlatformClient> {
    return this._registeredPlatformClients;
  }

  state(): BootableState {
    return this._bootableState;
  }

  teardown(): Promise<any> {
    const result = Promise.all(this._platformClientInstances.map(x => x.teardown()));
    return result;
  }

  unregisterPlatformClient(client: { new(): PlatformClient }): Bot {
    const clientIndex = this._registeredPlatformClients.indexOf(client);
    if (clientIndex === -1) {
      return this;
    }
    this.teardownPlatformClient(client);
    this._registeredPlatformClients.splice(clientIndex, 1);
    return this;
  }

  bootedPlatformClients(): Array<PlatformClient> {
    return this._platformClientInstances;
  }

  teardownPlatformClient(client: { new(): PlatformClient }): Promise<any> {
    const clientInstance = this._platformClientInstances.filter(x => x instanceof client)[0];
    if (!clientInstance) {
      return Promise.resolve();
    }
    const clientIndex = this._platformClientInstances.indexOf(clientInstance);
    this._platformClientInstances.splice(clientIndex, 1);
    return clientInstance.teardown();
  }
}