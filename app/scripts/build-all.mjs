import { spawnSync } from "node:child_process";
import { getNpmProcessArgs } from "./npm-runner.mjs";

const baseEnv = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV ?? "production",
  PORT: process.env.PORT ?? "8000",
  BASE_PATH: process.env.BASE_PATH ?? "/",
};

const commands = [
  ["build", "--workspace=@workspace/hiap"],
  ["build", "--workspace=@workspace/api-server"],
];

for (const args of commands) {
  const npmProcess = getNpmProcessArgs(["run", ...args]);
  const result = spawnSync(npmProcess.command, npmProcess.args, {
    stdio: "inherit",
    env: baseEnv,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
