import { execFile } from "node:child_process";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { config } from "./config.ts";

export class ConversionError extends Error {
  readonly code: "timeout" | "failed" | "encrypted";
  constructor(code: "timeout" | "failed" | "encrypted", message: string) {
    super(message);
    this.code = code;
  }
}

function run(bin: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    // execFile never invokes a shell, so file names can't inject commands.
    execFile(
      bin,
      args,
      { cwd, timeout: config.timeoutMs, killSignal: "SIGKILL", maxBuffer: 1024 * 1024, env: { PATH: process.env.PATH ?? "/usr/bin:/bin", HOME: cwd, LANG: "C.UTF-8" } },
      (err, stdout, stderr) => {
        if (err) {
          const e = err as NodeJS.ErrnoException & { killed?: boolean; signal?: string };
          if (e.killed || e.signal === "SIGKILL") reject(new ConversionError("timeout", "Conversion timed out"));
          else reject(new ConversionError(/password|encrypt/i.test(stderr) ? "encrypted" : "failed", stderr.slice(0, 500) || e.message));
          return;
        }
        resolve({ stdout, stderr });
      },
    );
  });
}

/**
 * LibreOffice profile that disables macros entirely. Each job gets a fresh profile so
 * concurrent conversions don't share state and nothing persists between jobs.
 */
async function writeProfile(dir: string) {
  const user = join(dir, "user");
  await mkdir(user, { recursive: true });
  await writeFile(
    join(user, "registrymodifications.xcu"),
    `<?xml version="1.0" encoding="UTF-8"?>
<oor:items xmlns:oor="http://openoffice.org/2001/registry" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="DisableMacrosExecution" oor:op="fuse"><value>true</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Misc"><prop oor:name="UseLocking" oor:op="fuse"><value>false</value></prop></item>
</oor:items>`,
  );
}

export async function officeToPdf(jobDir: string, inputPath: string): Promise<string> {
  const profile = join(jobDir, "profile");
  const out = join(jobDir, "out");
  await mkdir(out);
  await writeProfile(profile);
  await run(config.sofficeBin, [`-env:UserInstallation=${pathToFileURL(profile).href}`, "--headless", "--norestore", "--nolockcheck", "--nodefault", "--nologo", "--convert-to", "pdf", "--outdir", out, inputPath], jobDir);
  const files = (await readdir(out)).filter((f) => f.toLowerCase().endsWith(".pdf"));
  if (!files.length) throw new ConversionError("failed", "LibreOffice produced no output");
  return join(out, files[0]);
}

export async function compressPdf(jobDir: string, inputPath: string, level: "screen" | "ebook" | "printer"): Promise<string> {
  const output = join(jobDir, "compressed.pdf");
  await run(
    config.gsBin,
    ["-dSAFER", "-dBATCH", "-dNOPAUSE", "-dQUIET", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.7", `-dPDFSETTINGS=/${level}`, "-dDetectDuplicateImages=true", `-sOutputFile=${output}`, inputPath],
    jobDir,
  );
  return output;
}
