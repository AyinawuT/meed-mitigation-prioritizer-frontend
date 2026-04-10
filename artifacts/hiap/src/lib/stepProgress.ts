export interface StepProgress {
  visited: boolean;
  progress?: number;
  sub?: string;
  confirmed?: boolean;
}

function key(locode: string, step: string) {
  return `hiap:${locode}:${step}`;
}

export function getStepProgress(locode: string, step: string): StepProgress {
  try {
    const raw = localStorage.getItem(key(locode, step));
    if (!raw) return { visited: false };
    return JSON.parse(raw) as StepProgress;
  } catch {
    return { visited: false };
  }
}

export function setStepProgress(locode: string, step: string, data: StepProgress) {
  try {
    const existing = getStepProgress(locode, step);
    const merged: StepProgress = { ...data };
    if (existing.confirmed && !data.confirmed) {
      merged.confirmed = true;
    }
    localStorage.setItem(key(locode, step), JSON.stringify(merged));
  } catch {}
}

export function confirmStep(locode: string, step: string) {
  const existing = getStepProgress(locode, step);
  setStepProgress(locode, step, { ...existing, confirmed: true });
}
