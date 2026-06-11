import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

describe("Card Components", () => {
  it("renders Card", () => {
    render(<Card data-testid="card"><CardContent>Content</CardContent></Card>);
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders CardHeader", () => {
    render(<Card><CardHeader data-testid="header"><CardTitle>Title</CardTitle></CardHeader></Card>);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders CardDescription", () => {
    render(<Card><CardHeader><CardDescription>Desc</CardDescription></CardHeader></Card>);
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });

  it("renders CardFooter", () => {
    render(<Card><CardFooter data-testid="footer">Footer</CardFooter></Card>);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Card className="custom-class" data-testid="card"><CardContent>x</CardContent></Card>);
    expect(screen.getByTestId("card")).toHaveClass("custom-class");
  });
});
