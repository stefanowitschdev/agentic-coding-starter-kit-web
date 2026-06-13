import { expect, test } from "@playwright/test";

/**
 * Database-backed flow: register a fresh account (which auto-signs-in and lands
 * on the dashboard), sign out by clearing the session cookie, then sign back in
 * with the same credentials. Exercises Better Auth + Postgres end to end.
 */
test("register, sign out, and sign back in", async ({ page }) => {
  // Unique email per run so the test is repeatable against a persistent DB.
  const email = `e2e-${Date.now()}@example.com`;
  const password = "test-password-123";

  // --- Register -----------------------------------------------------------
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  // Successful sign-up redirects to the protected dashboard.
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // --- Sign out (drop the session cookie) ---------------------------------
  await page.context().clearCookies();

  // --- Sign back in -------------------------------------------------------
  // Scope to the page form: the header also has a "Sign in" button when logged out.
  const signInForm = page.locator("#main-content");
  await page.goto("/login");
  await signInForm.getByLabel("Email").fill(email);
  await signInForm.getByLabel("Password", { exact: true }).fill(password);
  await signInForm.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
