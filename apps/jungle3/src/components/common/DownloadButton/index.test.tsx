// @ts-expect-error TS6133
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DownloadButton } from "./index.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDownloadFile } from "@queries/common";

jest.mock("@queries/common", () => ({
  useDownloadFile: jest.fn(),
}));

jest.mock("@services/backendCommon", () => ({
  translateError: jest.fn(),
  extractValidationErrors: jest.fn(() => []),
}));

const mockUseDownloadFile = useDownloadFile as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();

  mockUseDownloadFile.mockReturnValue({
    data: null,
    error: null,
  });
});

describe("DownloadButton", () => {
  it("should trigger download on button click", async () => {
    const queryClient = new QueryClient();
    const url = "https://example.com/file.zip";
    const name = "file.zip";

    render(
      <QueryClientProvider client={queryClient}>
        <DownloadButton file_id="1" icon={<span>Download</span>} />
      </QueryClientProvider>,
    );

    const downloadButton = screen.getByRole("button", { name: /download/i });

    const appendChildMock = jest
      .spyOn(document.body, "appendChild")
      //@ts-ignore
      .mockImplementation(() => {});

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

    mockUseDownloadFile.mockReturnValueOnce({
      data: { url, name },
      error: null,
    });

    fireEvent.click(downloadButton);

    await waitFor(() => {
      console.log(
        "Mock return after button click:",
        mockUseDownloadFile.mock.results,
      );

      expect(createElementMock).toHaveBeenCalledWith("a");

      const link = createElementMock.mock.results[0].value as HTMLAnchorElement;
      expect(link.setAttribute).toHaveBeenCalledWith("download", name);
      expect(link.href).toBe(url);
      expect(link.click).toHaveBeenCalled();
      expect(link.remove).toHaveBeenCalled();

      expect(appendChildMock).toHaveBeenCalledWith(link);
    });

    createElementMock.mockRestore();
    appendChildMock.mockRestore();
  });
});
