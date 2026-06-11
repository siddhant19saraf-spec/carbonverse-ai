import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=CarbonVerse AI")).toBeVisible();
    await expect(page.locator("text=Start Tracking")).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Get Started");
    await expect(page.locator("text=Create Account")).toBeVisible();
  });

  test("should show validation errors on empty register", async ({ page }) => {
    await page.goto("/register");
    await page.click('button:has-text("Create Account")');
    await expect(page.locator("text=Username must be at least 3 characters")).toBeVisible();
  });

  test("should navigate to login page from register", async ({ page }) => {
    await page.goto("/register");
    await page.click("text=Sign in");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should navigate to register page from login", async ({ page }) => {
    await page.goto("/login");
    await page.click("text=Sign up");
    await expect(page).toHaveURL(/.*register/);
  });
});
