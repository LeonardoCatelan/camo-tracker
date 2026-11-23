import { expect, test } from "@playwright/test";

test.describe("Página inicial", () => {
  test("renderiza o conteúdo principal", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Camo Tracker/);
    await expect(page.getByRole("heading", { level: 1, name: "Camo Tracker" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Estrutura configurada" })).toBeVisible();
  });

  test("navega para a página de login", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("banner").getByRole("link", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });

  test("navega para a página de cadastro", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Criar conta" }).click();

    await expect(page).toHaveURL("/sign-up");
    await expect(page.getByRole("heading", { name: "Criar conta" })).toBeVisible();
  });

  test("alterna para o tema escuro", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Alterar tema" }).click();
    await page.getByRole("menuitemradio", { name: "Escuro" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
