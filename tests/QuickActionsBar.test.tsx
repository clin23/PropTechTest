import { render, screen, fireEvent } from "@testing-library/react";
import QuickActionsBar from "../components/QuickActionsBar";
import { describe, it, expect, vi } from "vitest";

describe("QuickActionsBar", () => {
  it("triggers callbacks when buttons clicked", () => {
    const logExpense = vi.fn();
    const uploadDoc = vi.fn();
    const messageTenant = vi.fn();
    render(
      <QuickActionsBar
        onLogExpense={logExpense}
        onUploadDocument={uploadDoc}
        onMessageTenant={messageTenant}
      />
    );
    fireEvent.click(screen.getByText("+Expense"));
    expect(logExpense).toHaveBeenCalled();
    fireEvent.click(screen.getByText("+Upload Doc"));
    expect(uploadDoc).toHaveBeenCalled();
    fireEvent.click(screen.getByText("+Tenant Note"));
    expect(messageTenant).toHaveBeenCalled();
  });
});
