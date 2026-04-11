/**
 * Publishes using NODE_AUTH_TOKEN via a temporary userconfig so your global
 * npm login is not overridden and granular tokens work reliably.
 *
 * Usage (PowerShell):
 *   $env:NODE_AUTH_TOKEN = "npm_..."
 *   node scripts/publish-with-token.js
 *
 * Or: npm run publish:token
 *
 * If publish still returns 403, regenerate the granular token with:
 * - Packages: All packages (or explicitly include create-agentic-app)
 * - Permissions: Read and write
 * - Optional: Bypass two-factor authentication (if you use 2FA)
 * Remove stale credentials: npm config delete //registry.npmjs.org/:_authToken
 */
import { writeFileSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const token = process.env.NODE_AUTH_TOKEN;

if (!token) {
  console.error(
    "Missing NODE_AUTH_TOKEN. Set it to an npm token that can publish this package.",
  );
  console.error(
    "Example: $env:NODE_AUTH_TOKEN = 'npm_...'; npm run publish:token",
  );
  process.exit(1);
}

const rc = join(root, ".npmrc.publish-temp");
writeFileSync(
  rc,
  `//registry.npmjs.org/:_authToken=${token}\n`,
  "utf8",
);

const extra = process.argv.slice(2);
const args = ["publish", "--userconfig", rc, ...extra];
const isWin = process.platform === "win32";
const result = spawnSync(isWin ? "npm.cmd" : "npm", args, {
  cwd: root,
  stdio: "inherit",
  // Windows: shell is required for stdio inherit + npm.cmd to behave reliably.
  shell: isWin,
});

try {
  unlinkSync(rc);
} catch {
  // ignore
}

process.exit(result.status === null ? 1 : result.status);
