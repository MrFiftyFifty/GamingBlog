import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tag, TagList } from "@/components/ui/tag";

describe("Tag", () => {
  it("renders plain tag", () => {
    render(<Tag name="rpg" />);
    expect(screen.getByText("#rpg")).toBeInTheDocument();
  });

  it("renders link tag when sectionSlug provided", () => {
    render(<Tag name="rpg" sectionSlug="action" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/forum/action?tag=rpg");
  });

  it("fires onRemove when remove button is clicked", async () => {
    const onRemove = jest.fn();
    const user = userEvent.setup();
    render(<Tag name="rpg" onRemove={onRemove} />);
    await user.click(screen.getByLabelText("Убрать тег rpg"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("TagList", () => {
  it("renders nothing when empty", () => {
    const { container } = render(<TagList tags={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all tags", () => {
    render(<TagList tags={["rpg", "action", "mmo"]} sectionSlug="rpg" />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });
});
