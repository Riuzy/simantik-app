import { AutomationLifecycle } from './enums';

const ALLOWED_TRANSITIONS: Record<AutomationLifecycle, AutomationLifecycle[]> = {
  [AutomationLifecycle.CREATED]: [AutomationLifecycle.INITIALIZED, AutomationLifecycle.FAILED, AutomationLifecycle.CANCELLED],
  [AutomationLifecycle.INITIALIZED]: [AutomationLifecycle.PREPARING, AutomationLifecycle.FAILED, AutomationLifecycle.CANCELLED],
  [AutomationLifecycle.PREPARING]: [AutomationLifecycle.RUNNING, AutomationLifecycle.FAILED, AutomationLifecycle.CANCELLED],
  [AutomationLifecycle.RUNNING]: [AutomationLifecycle.COMPLETED, AutomationLifecycle.FAILED, AutomationLifecycle.CANCELLED, AutomationLifecycle.CLEANING],
  [AutomationLifecycle.COMPLETED]: [AutomationLifecycle.CLEANING],
  [AutomationLifecycle.FAILED]: [AutomationLifecycle.CLEANING],
  [AutomationLifecycle.CANCELLED]: [AutomationLifecycle.CLEANING],
  [AutomationLifecycle.CLEANING]: [AutomationLifecycle.FINISHED, AutomationLifecycle.FAILED],
  [AutomationLifecycle.FINISHED]: [],
};

export class ExecutionState {
  private _current: AutomationLifecycle;
  private _history: Array<{ from: AutomationLifecycle; to: AutomationLifecycle; at: Date }> = [];

  constructor(initial: AutomationLifecycle = AutomationLifecycle.CREATED) {
    this._current = initial;
  }

  get current(): AutomationLifecycle {
    return this._current;
  }

  get history(): ReadonlyArray<{ from: AutomationLifecycle; to: AutomationLifecycle; at: Date }> {
    return this._history;
  }

  canTransitionTo(target: AutomationLifecycle): boolean {
    return ALLOWED_TRANSITIONS[this._current].includes(target);
  }

  transitionTo(target: AutomationLifecycle): void {
    if (!this.canTransitionTo(target)) {
      throw new Error(
        `Invalid lifecycle transition: ${this._current} → ${target}. ` +
        `Allowed transitions: ${ALLOWED_TRANSITIONS[this._current].join(', ') || 'none'}`,
      );
    }
    this._history.push({ from: this._current, to: target, at: new Date() });
    this._current = target;
  }

  reset(): void {
    this._current = AutomationLifecycle.CREATED;
    this._history = [];
  }

  isFinished(): boolean {
    return this._current === AutomationLifecycle.FINISHED;
  }

  isTerminal(): boolean {
    return [AutomationLifecycle.FINISHED, AutomationLifecycle.FAILED, AutomationLifecycle.CANCELLED].includes(this._current);
  }
}
