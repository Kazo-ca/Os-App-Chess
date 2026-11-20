// Test harness of the end-to-end runs. Two ways to run Kazo OS:
// - On the published trimmed OS (Kazo OS ADR 0281 §5): when the CI sets KAZOOS_E2E_WWWROOT,
//   KAZOOS_E2E_PACKAGES and KAZOOS_E2E_REPOSITORY, the OS is the release users load and Chess is
//   installed in each fresh profile with `sudo kazopkg install`, through the shared harness of the
//   Kazo OS submodule (external/KazoOs/wasm2/KazoOs/build/app-e2e/kazoos-app-e2e.mjs).
// - Otherwise: the Chess host (src/Kazo.Chess.Os, built beforehand with `dotnet build -c Release`,
//   or the configuration named by CHESS_CONFIGURATION) on a free port, or CHESS_BASE_URL when it
//   points to one already running. This is the fast local loop.
// Either way, openChess opens the Chess app in a fresh Kazo OS profile.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const hostProject = path.join(root, 'src', 'Kazo.Chess.Os');
const sharedHarness = path.join(root, 'external', 'KazoOs', 'wasm2', 'KazoOs', 'build', 'app-e2e', 'kazoos-app-e2e.mjs');

/** The app's name in the launcher (manifest "name"). */
const APP_NAME = 'Chess';

// The first WebAssembly boot downloads and compiles the whole OS: give it time.
export const BOOT_TIMEOUT_MS = 120_000;

const freePort = () => new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        server.close(() => resolve(port));
    });
    server.on('error', reject);
});

const waitForHttp = async (url, timeoutMs) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return;
            }
        } catch {
            // Not listening yet.
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error(`${url} did not answer within ${timeoutMs} ms.`);
};

/**
 * The shared harness and its setup when the CI asks for the trimmed OS, null otherwise. The module
 * is imported only then: a Kazo OS submodule older than the harness (before 3.5.1) does not have it.
 * @returns {Promise<{ harness: object, setup: { wwwroot: string, packages: string, repository: string } } | null>}
 */
async function trimmedSetup() {
    const { KAZOOS_E2E_WWWROOT, KAZOOS_E2E_PACKAGES, KAZOOS_E2E_REPOSITORY } = process.env;
    if (!KAZOOS_E2E_WWWROOT || !KAZOOS_E2E_PACKAGES || !KAZOOS_E2E_REPOSITORY) {
        return null;
    }
    if (!existsSync(sharedHarness)) {
        throw new Error(`KAZOOS_E2E_* are set but the Kazo OS submodule has no shared harness (${sharedHarness}).`);
    }
    const harness = await import(pathToFileURL(sharedHarness).href);
    return { harness, setup: harness.fromEnvironment() };
}

// The trimmed setup of each running host, by address: openChess finds it from the address alone.
const trimmedHosts = new Map();

/**
 * Starts the host: the published trimmed OS when the CI asks for it, else the Chess host, or
 * CHESS_BASE_URL.
 * @returns {Promise<{ baseUrl: string, trimmed: boolean, stop: () => Promise<void> | void, assertNoFailures: () => void }>}
 *   assertNoFailures throws when a page showed an error that means the trimmed OS lacks something
 *   Chess needs (a missing member, type or file): call it once the tests are done.
 */
export async function startHost() {
    const trimmed = await trimmedSetup();
    if (trimmed) {
        const os = await trimmed.harness.startTrimmedOs(trimmed.setup);
        const failures = []; // one list per page, filled while the page runs
        trimmedHosts.set(os.baseUrl, { ...trimmed, failures });
        return {
            baseUrl: os.baseUrl,
            trimmed: true,
            stop: async () => {
                trimmedHosts.delete(os.baseUrl);
                await os.stop();
            },
            assertNoFailures: () => {
                const seen = failures.flat();
                if (seen.length > 0) {
                    throw new Error(`Chess failed on the trimmed Kazo OS:\n${seen.join('\n')}`);
                }
            },
        };
    }
    return startDotnetHost();
}

/**
 * The host for a test on a phone. The shared harness installs the app from the desktop Terminal;
 * until the Kazo OS version of the submodule also installs it on a phone (its SHELLS export names
 * "phone"), a phone test runs on the Chess host, already built by the CI.
 * @param {{ baseUrl: string, trimmed: boolean }} host The host of the other tests.
 * @returns {Promise<{ baseUrl: string, stop: () => Promise<void> | void }>} Stop it after the test.
 */
export async function phoneHost(host) {
    const trimmed = trimmedHosts.get(host.baseUrl);
    if (!trimmed || trimmed.harness.SHELLS?.includes('phone')) {
        return { baseUrl: host.baseUrl, stop: () => {} };
    }
    return startDotnetHost();
}

/**
 * Starts the Chess host (dotnet run), or reuses CHESS_BASE_URL.
 * @returns {Promise<{ baseUrl: string, trimmed: boolean, stop: () => void, assertNoFailures: () => void }>}
 */
async function startDotnetHost() {
    const none = () => {};
    if (process.env.CHESS_BASE_URL) {
        return { baseUrl: process.env.CHESS_BASE_URL, trimmed: false, stop: none, assertNoFailures: none };
    }
    const port = await freePort();
    const baseUrl = `http://127.0.0.1:${port}/`;
    const configuration = process.env.CHESS_CONFIGURATION ?? 'Release';
    const server = spawn('dotnet', ['run', '--no-build', '-c', configuration, '--urls', baseUrl], { cwd: hostProject, stdio: 'ignore' });
    await waitForHttp(baseUrl, 60_000);
    return { baseUrl, trimmed: false, stop: () => server.kill(), assertNoFailures: none };
}

/**
 * Boots Kazo OS in a fresh browser context (first boot: the administrator is created) and opens
 * the Chess app: from the Applications menu on the desktop, from "All applications" on a phone.
 * On the trimmed OS, Chess is first installed with kazopkg, as the Store installs it.
 * @param {import('playwright').Page} page A page of a new context.
 * @param {string} baseUrl The host's address.
 * @param {{ mobile?: boolean }} [options] Whether the page runs the mobile shell.
 */
export async function openChess(page, baseUrl, { mobile = false } = {}) {
    const trimmed = trimmedHosts.get(baseUrl);
    if (trimmed) {
        await openInstalledChess(page, baseUrl, trimmed);
        return;
    }
    await page.goto(baseUrl);
    const inputs = page.locator('input');
    await inputs.first().waitFor({ timeout: BOOT_TIMEOUT_MS });
    await inputs.nth(0).fill('neo');
    await inputs.nth(1).fill('Neo');
    await inputs.nth(2).fill('matrix123');
    await inputs.nth(3).fill('matrix123');
    await page.getByRole('button', { name: 'Create local profile' }).click();
    const launcher = mobile
        ? page.getByRole('button', { name: 'All applications' })
        : page.getByText('Applications', { exact: true });
    // The welcome wizard (Kazo OS ADR 0276, from 3.4.0) shows once per account: skip it when
    // this Kazo OS version has it, so the boot works on older and newer versions alike.
    const skip = page.locator('.welcome-skip');
    await skip.or(launcher).first().waitFor({ timeout: 60_000 });
    if (await skip.isVisible()) {
        await skip.click();
    }
    await launcher.click({ timeout: 60_000 });
    await page.getByText('Chess', { exact: true }).first().click();
    await page.locator('.chess-board .piece').first().waitFor({ timeout: 30_000 });
}

/**
 * The trimmed OS: first boot, `sudo kazopkg install`, then Chess from the launcher. The page's
 * errors that mean a missing member or type go to the host's failures.
 */
async function openInstalledChess(page, baseUrl, { harness, setup, failures }) {
    failures.push(harness.watchFailures(page));
    await harness.routePackages(page.context(), setup);
    await harness.bootFirstAccount(page, baseUrl);
    await harness.installApp(page, setup);
    await harness.openApp(page, APP_NAME);
    await page.locator('.chess-board .piece').first().waitFor({ timeout: harness.STEP_TIMEOUT_MS });
}

/**
 * Returns the page coordinates of the centre of a square, White at the bottom unless told otherwise.
 * @param {import('playwright').Page} page The page.
 * @param {string} square Square name, such as e2.
 * @param {'white' | 'black'} orientation The side at the bottom.
 */
export async function squareCenter(page, square, orientation = 'white') {
    const box = await page.locator('.board-svg').boundingBox();
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]) - 1;
    const column = orientation === 'white' ? file : 7 - file;
    const row = orientation === 'white' ? 7 - rank : rank;
    return { x: box.x + ((column + 0.5) * box.width) / 8, y: box.y + ((row + 0.5) * box.height) / 8 };
}
