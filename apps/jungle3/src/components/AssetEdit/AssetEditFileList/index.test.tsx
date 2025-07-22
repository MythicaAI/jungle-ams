// @ts-expect-error TS6133
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AssetEditFileList } from ".";
import { BrowserRouter } from "react-router-dom";

describe("AssetEditFileList", () => {
  const mockOpenUploadList = jest.fn();
  const mockRemoveFile = jest.fn();
  const mockFiles = {
    file1: { file_id: "1", file_name: "File 1", content_hash: "", size: 0 },
    file2: { file_id: "2", file_name: "File 2", content_hash: "", size: 0 },
  };

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <AssetEditFileList
          title="Test Title"
          category="Test Category"
          fileTypeFilters={["image/png", "image/jpeg"]}
          openUploadList={mockOpenUploadList}
          removeFile={mockRemoveFile}
          files={mockFiles}
        />
      </BrowserRouter>,
    );

  it("renders the component with the provided title and files", () => {
    renderComponent();

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getAllByTestId("assetFileEditable")).toHaveLength(2);
  });

  it("calls openUploadList when the add button is clicked", () => {
    renderComponent();

    fireEvent.click(screen.getByTestId("add-btn"));
    expect(mockOpenUploadList).toHaveBeenCalledWith("Test Category", [
      "image/png",
      "image/jpeg",
    ]);
  });

  it("calls removeFile when the remove button is clicked", () => {
    renderComponent();

    const removeButton1 = screen.getByTestId("remove-button-1");
    fireEvent.click(removeButton1);

    expect(mockRemoveFile).toHaveBeenCalledWith("1");
  });
});
