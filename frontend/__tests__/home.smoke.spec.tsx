import React from "react";
import { render } from "@testing-library/react";
import HomePage from "../app/page";



beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    })
  ) as jest.Mock;
});




describe("HomePage basic render", () => {
  it("renders without crashing", () => {
    const { container } = render(<HomePage />);
    expect(container).toBeTruthy();
  });
});
