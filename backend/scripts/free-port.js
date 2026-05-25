import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const port = process.env.PORT || 5001;

const freePortWindows = async () => {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const pids = new Set();

    for (const line of stdout.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== "0") pids.add(pid);
    }

    for (const pid of pids) {
      try {
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`✅ Freed port ${port} (stopped PID ${pid})`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* port already free */
  }
};

await freePortWindows();
