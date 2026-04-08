export interface StepProgress {
  visited: boolean;
  progress?: number;
  sub?: string;
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
    localStorage.setItem(key(locode, step), JSON.stringify(data));
  } catch {}
}
