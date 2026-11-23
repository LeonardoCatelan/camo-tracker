import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { FormField } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { useActionForm } from "@/hooks/use-action-form";
import { type ActionResult } from "@/types/action-result";

const schema = z.object({ name: z.string().min(1, { error: "Informe o nome." }) });
type Values = z.infer<typeof schema>;
type Action = (values: Values) => Promise<ActionResult<{ id: string }>>;

function TestForm({ action, onSuccess }: { action: Action; onSuccess?: () => void }) {
  const { form, onSubmit, successMessage } = useActionForm<Values, { id: string }>({
    schema,
    defaultValues: { name: "" },
    action,
    onSuccess,
  });
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormMessage variant="error" message={errors.root?.message} />
      <FormMessage variant="success" message={successMessage} />
      <FormField id="name" label="Nome" error={errors.name?.message} {...form.register("name")} />
      <button type="submit">Enviar</button>
    </form>
  );
}

async function submitWith(name: string) {
  if (name) await userEvent.type(screen.getByLabelText("Nome"), name);
  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
}

describe("useActionForm", () => {
  it("blocks submission when client-side validation fails", async () => {
    const action = vi.fn<Action>();
    render(<TestForm action={action} />);

    await submitWith("");

    expect(await screen.findByText("Informe o nome.")).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("calls the action and reports success", async () => {
    const action = vi.fn<Action>().mockResolvedValue({
      success: true,
      data: { id: "1" },
      message: "Salvo!",
    });
    const onSuccess = vi.fn();
    render(<TestForm action={action} onSuccess={onSuccess} />);

    await submitWith("Ana");

    expect(await screen.findByRole("status")).toHaveTextContent("Salvo!");
    expect(action).toHaveBeenCalledWith({ name: "Ana" });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("maps server failures to the form and to individual fields", async () => {
    const action = vi.fn<Action>().mockResolvedValue({
      success: false,
      error: "Dados inválidos.",
      fieldErrors: { name: ["Nome já utilizado."] },
    });
    render(<TestForm action={action} />);

    await submitWith("Ana");

    expect(await screen.findByText("Dados inválidos.")).toBeInTheDocument();
    expect(screen.getByText("Nome já utilizado.")).toBeInTheDocument();
  });

  it("shows a generic message when the action throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const action = vi.fn<Action>().mockRejectedValue(new Error("network"));
    render(<TestForm action={action} />);

    await submitWith("Ana");

    expect(
      await screen.findByText("Ocorreu um erro inesperado. Tente novamente."),
    ).toBeInTheDocument();
  });
});
