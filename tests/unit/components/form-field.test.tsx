import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FormField } from "@/components/shared/form-field";

describe("FormField", () => {
  it("associates the label with the input", async () => {
    render(<FormField id="email" label="E-mail" type="email" />);
    const input = screen.getByLabelText("E-mail");

    await userEvent.type(input, "user@example.com");

    expect(input).toHaveValue("user@example.com");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("exposes the error message accessibly", () => {
    render(<FormField id="email" label="E-mail" error="Informe um e-mail válido." />);
    const input = screen.getByLabelText("E-mail");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Informe um e-mail válido.");
    expect(screen.getByRole("alert")).toHaveTextContent("Informe um e-mail válido.");
  });

  it("shows the description only while there is no error", () => {
    const { rerender } = render(<FormField id="pwd" label="Senha" description="Dica" />);
    expect(screen.getByLabelText("Senha")).toHaveAccessibleDescription("Dica");

    rerender(<FormField id="pwd" label="Senha" description="Dica" error="Erro" />);
    expect(screen.queryByText("Dica")).not.toBeInTheDocument();
  });
});
