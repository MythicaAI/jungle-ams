// @ts-expect-error TS6133
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Thumbnail } from "./Thumbnail";
import { BrowserRouter } from "react-router-dom";
import { DownloadInfoResponse } from "types/apiTypes";
import "@testing-library/jest-dom";

const mockFile = {
  file_id: "12345",
  name: "Test File",
  url: "https://example.com/image.jpg",
} as DownloadInfoResponse;

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Thumbnail component", () => {
  const mockRemoveFile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(
      <BrowserRouter>
        <Thumbnail file={mockFile} removeFile={mockRemoveFile} index={1} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Test File")).toBeInTheDocument();
    expect(screen.queryByText("Main thumbnail")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", mockFile.url);
  });

  it("calls removeFile with the correct ID when the remove button is clicked", () => {
    render(
      <BrowserRouter>
        <Thumbnail file={mockFile} removeFile={mockRemoveFile} index={1} />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByTestId("removeBtn"));
    expect(mockRemoveFile).toHaveBeenCalledWith(mockFile.file_id);
  });

  it("navigates to the file link when the link button is clicked", () => {
    render(
      <BrowserRouter>
        <Thumbnail file={mockFile} removeFile={mockRemoveFile} index={1} />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByTestId("linkBtn"));
    expect(mockNavigate).toHaveBeenCalledWith(`/files/${mockFile.file_id}`);
  });

  it("displays 'Main thumbnail' text when index is 0", () => {
    render(
      <BrowserRouter>
        <Thumbnail file={mockFile} removeFile={mockRemoveFile} index={0} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Main thumbnail")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", mockFile.url);
  });

  it("renders the image with correct src and alt attributes", () => {
    render(
      <BrowserRouter>
        <Thumbnail file={mockFile} removeFile={mockRemoveFile} index={1} />
      </BrowserRouter>,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", mockFile.url);
    expect(img).toHaveAttribute("alt", "thumbnail");
  });
});
