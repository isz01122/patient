import { render, screen } from "@testing-library/react";
import PatientPage from "../PatientPage";

test("renders learn react link", () => {
  render(<PatientPage />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
