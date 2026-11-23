import { expect, test } from "@playwright/test";

test.describe("Proteção de rotas", () => {
  test("redireciona visitantes do painel para o login preservando o destino", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL("/login?next=%2Fdashboard");
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });

  test("exige sessão para redefinir a senha", async ({ page }) => {
    await page.goto("/update-password");

    await expect(page).toHaveURL(/\/login\?next=%2Fupdate-password$/);
  });
});

test.describe("Formulário de login", () => {
  test("valida os campos no cliente antes de enviar", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("E-mail").fill("invalido");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
    await expect(page.getByText("Informe a senha.")).toBeVisible();
  });
});

test.describe("API", () => {
  test("health check responde com status ok", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.ok()).toBe(true);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
