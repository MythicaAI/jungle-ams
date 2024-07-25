// @ts-expect-error TS6133
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DownloadButton } from ".";
import { api } from "../../services/api";

jest.mock("../../services/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

jest.mock("../../services/backendCommon", () => ({
  translateError: jest.fn(),
  extractValidationErrors: jest.fn(() => []),
}));

const mockApiGet = api.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockApiGet.mockReset();
});

describe("DownloadButton", () => {
  it("should trigger download on button click", async () => {
    // Mock the response for a successful download
    const url = "https://example.com/file.zip";
    const name = "file.zip";

    mockApiGet.mockResolvedValueOnce({
      url,
      name,
    });

    render(<DownloadButton file_id="1" icon={<span>Download</span>} />);

    const downloadButton = screen.getByRole("button", { name: /download/i });

    const createElementMock = jest
      .spyOn(document, "createElement")
      .mockImplementation(() => {
        return {
          href: "",
          setAttribute: jest.fn(),
          click: jest.fn(),
          remove: jest.fn(),
        } as unknown as HTMLAnchorElement;
      });

    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith({ path: "/download/info/1" });
      expect(createElementMock).toHaveBeenCalledWith("a");
      const link = createElementMock.mock.results[0].value as HTMLAnchorElement;
      expect(link.setAttribute).toHaveBeenCalledWith("download", name);
      expect(link.href).toBe(url);
    });
  });
});
