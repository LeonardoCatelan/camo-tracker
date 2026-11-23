import { expect, test } from "@playwright/test";

test.describe("Acesso restrito", () => {
  test("envia visitantes do painel para o login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/login");
    await expect(page).toHaveTitle(/Camo Tracker/);
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });

  test("protege a página da arma preservando o destino", async ({ page }) => {
    await page.goto("/weapons/axion/dmz");

    await expect(page).toHaveURL("/login?next=%2Fweapons%2Faxion%2Fdmz");
  });

  test("protege a página escondida da stack", async ({ page }) => {
    await page.goto("/stack");

    await expect(page).toHaveURL("/login?next=%2Fstack");
  });
});

test.describe("Tema", () => {
  test("começa no escuro e alterna para o claro", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Alterar tema" }).click();
    await page.getByRole("menuitemradio", { name: "Claro" }).click();

    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
