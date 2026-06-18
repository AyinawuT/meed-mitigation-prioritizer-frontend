export function getNpmProcessArgs(args) {
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", ["npm.cmd", ...args].join(" ")],
    };
  }

  return {
    command: "npm",
    args,
  };
}
