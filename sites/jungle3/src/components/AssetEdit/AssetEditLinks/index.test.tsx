// @ts-expect-error TS6133
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AssetEditLinks } from ".";
import { useAssetVersionStore } from "@store/assetVersionStore";

jest.mock("@store/assetVersionStore");

jest.mock("lucide-react", () => ({
  LucideCircleMinus: () => <svg data-testid="minus-icon" />,
  LucidePlusCircle: () => <svg data-testid="plus-icon" />,
}));

describe("AssetEditLinks", () => {
  const setLinksMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-expect-error
    (useAssetVersionStore as jest.Mock).mockReturnValue({
      setLinks: setLinksMock,
      links: [],
    });
  });

  it("renders with initial input field and can add new input fields", async () => {
    render(<AssetEditLinks />);

    expect(screen.getByPlaceholderText("Enter...")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("plus-icon"));

    await waitFor(() => {
      expect(screen.queryAllByPlaceholderText("Enter...")).toHaveLength(2);
    });
  });

  it("can remove input fields", async () => {
    render(<AssetEditLinks />);

    fireEvent.click(screen.getByTestId("plus-icon"));
    fireEvent.click(screen.getByTestId("plus-icon"));

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText("Enter...")).toHaveLength(3);
    });

    const removeButtons = screen.getAllByTestId("minus-icon");
    fireEvent.click(removeButtons[1]);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText("Enter...")).toHaveLength(2);
    });

    expect(screen.getAllByPlaceholderText("Enter...")[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("Enter...")[1]).toBeInTheDocument();
  });

  it("updates input values correctly", async () => {
    render(<AssetEditLinks />);

    fireEvent.click(screen.getByTestId("plus-icon"));

    await waitFor(() => {
      expect(screen.queryAllByPlaceholderText("Enter...")).toHaveLength(2);
    });

    fireEvent.change(screen.queryAllByPlaceholderText("Enter...")[0], {
      target: { value: "New Value" },
    });

    expect(screen.queryAllByPlaceholderText("Enter...")[0]).toHaveValue(
      "New Value",
    );
  });

  it("calls setLinks on input change", async () => {
    render(<AssetEditLinks />);

    fireEvent.click(screen.getByTestId("plus-icon"));

    await waitFor(() => {
      expect(screen.queryAllByPlaceholderText("Enter...")).toHaveLength(2);
    });

    fireEvent.change(screen.queryAllByPlaceholderText("Enter...")[0], {
      target: { value: "New Value" },
    });

    expect(setLinksMock).toHaveBeenCalledWith([
      { name: "linkInput-0", value: "New Value" },
      { name: "linkInput-1", value: "" },
    ]);
  });
});
