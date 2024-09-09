// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssetEditThumbnails } from ".";
import { useAssetVersionStore } from "@store/assetVersionStore";
import { api } from "@services/api";
import "@testing-library/jest-dom";

jest.mock("@services/api");
jest.mock("@store/assetVersionStore");

jest.mock("./Thumbnail", () => ({
  Thumbnail: ({ file, removeFile }: any) => (
    <div data-testid={`thumbnail-${file.file_id}`}>
      <button onClick={() => removeFile(file.file_id)}>Remove</button>
    </div>
  ),
}));

const mockAddThumbnails = jest.fn();
const mockRemoveThumbnails = jest.fn();

const mockOpenUploadList = jest.fn();
const mockRemoveFile = jest.fn();

const mockApiResponse = [
  {
    file_id: "file1",
    name: "File 1",
    url: "http://example.com/file1",
  },
  {
    file_id: "file2",
    name: "File 2",
    url: "http://example.com/file2",
  },
];

(useAssetVersionStore as jest.Mock).mockReturnValue({
  addThumbnails: mockAddThumbnails,
  removeThumbnails: mockRemoveThumbnails,
  thumbnails: mockApiResponse,
});

(api.get as jest.Mock).mockResolvedValue(mockApiResponse);

describe("AssetEditThumbnails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders and handles props correctly", async () => {
    render(
      <AssetEditThumbnails
        title="My Thumbnails"
        category="images"
        fileTypeFilters={["jpg", "png"]}
        openUploadList={mockOpenUploadList}
        removeFile={mockRemoveFile}
        files={mockApiResponse}
      />,
    );

    expect(screen.getByText("My Thumbnails")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(mockOpenUploadList).toHaveBeenCalledWith("images", ["jpg", "png"]);
  });

  it("fetches and displays thumbnails", async () => {
    render(
      <AssetEditThumbnails
        title="My Thumbnails"
        category="images"
        fileTypeFilters={["jpg", "png"]}
        openUploadList={mockOpenUploadList}
        removeFile={mockRemoveFile}
        files={mockApiResponse}
      />,
    );

    const thumbnails = await screen.findAllByTestId(/thumbnail-/);

    expect(thumbnails).toHaveLength(2);

    expect(thumbnails[0]).toBeInTheDocument();
    expect(thumbnails[1]).toBeInTheDocument();
  });
});
