import { AutomationJob } from './automation-job';
import { ExecutionState } from './execution-state';
import type { AutomationConfig } from '../../config';
import type { ILogger } from '../interfaces';

export class AutomationContext {
  private readonly _state: ExecutionState;
  private readonly _temporaryStorage = new Map<string, unknown>();

  constructor(
    public readonly job: AutomationJob,
    public readonly config: AutomationConfig,
    public readonly logger: ILogger,
  ) {
    this._state = new ExecutionState();
  }

  get state(): ExecutionState {
    return this._state;
  }

  get lifecycle(): import('./enums').AutomationLifecycle {
    return this._state.current;
  }

  set(key: string, value: unknown): void {
    this._temporaryStorage.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this._temporaryStorage.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return this._temporaryStorage.has(key);
  }

  clear(): void {
    this._temporaryStorage.clear();
  }
}
