import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import "jest-axe/extend-expect";
import HomePage from "../app/page";

describe("Accessibility - HomePage", () => {
  beforeAll(() => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => [],
    })) as unknown as typeof fetch;
  });

  it("should have no accessibility violations", async () => {
    const { container } = render(<HomePage />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
