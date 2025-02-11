// @ts-expect-error TS6133
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagCard } from ".";
import { Tag } from "@queries/tags/types";

describe("TagCard", () => {
  const exampleTag: Tag = {
    name: "Example Tag",
    tag_id: "",
    owner_id: "",
    created: "",
    page_priority: null,
    contents: null,
  };

  it("renders the tag name", () => {
    render(<TagCard tag={exampleTag} selectedTag="" />);
    expect(
      screen.getByRole("button", { name: "Example Tag" }),
    ).toBeInTheDocument();
  });

  it("applies 'solid' variant when tag is selected", () => {
    render(<TagCard tag={exampleTag} selectedTag="Example Tag" />);
    const button = screen.getByRole("button", { name: "Example Tag" });
    expect(button).toHaveClass("MuiButton-variantSolid");
  });

  it("applies 'soft' variant when tag is not selected", () => {
    render(<TagCard tag={exampleTag} selectedTag="Another Tag" />);
    const button = screen.getByRole("button", { name: "Example Tag" });
    expect(button).toHaveClass("MuiButton-variantSoft");
  });

  it("triggers button click event", async () => {
    const user = userEvent.setup();
    render(<TagCard tag={exampleTag} selectedTag="" />);
    const button = screen.getByRole("button", { name: "Example Tag" });
    await user.click(button);
    expect(button).toBeInTheDocument();
  });
});
