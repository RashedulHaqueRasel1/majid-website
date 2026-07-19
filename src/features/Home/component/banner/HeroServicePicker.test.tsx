import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { HeroServicePicker } from "./HeroServicePicker";
import type {
  IMEIService,
  ServiceCategory,
} from "@/features/shopkeeper/scanDevice/types/scanDevice.types";

const freeService: IMEIService = {
  _id: "free-service",
  serviceId: 6,
  name: "FMI Free Check",
  price: "0",
  priceLabel: "Free",
  category: "Fevourite",
  isFree: true,
  normalizedName: "fmi free check",
  currency: "USD",
};

const paidService: IMEIService = {
  _id: "paid-service",
  serviceId: 12,
  name: "Carrier Premium Check",
  price: "2",
  priceLabel: "$2.00",
  category: "Carrier",
  isFree: false,
  normalizedName: "carrier premium check",
  currency: "USD",
};

const categories: ServiceCategory[] = [
  { category: "Fevourite", services: [freeService] },
  { category: "Carrier", services: [paidService] },
];

function PickerHarness({ loading = false }: { loading?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<IMEIService | null>(
    null,
  );

  return (
    <HeroServicePicker
      categories={categories}
      isLoading={loading}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSearchTermChange={setSearchTerm}
      onSelect={setSelectedService}
      searchTerm={searchTerm}
      selectedService={selectedService}
    />
  );
}

describe("HeroServicePicker", () => {
  it("exposes its expanded state and focuses search when opened", async () => {
    render(<PickerHarness />);

    const trigger = screen.getByRole("button", { name: "Choose Service" });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => {
      expect(screen.getByRole("searchbox")).toHaveFocus();
    });
  });

  it("filters services and View All clears the filter", () => {
    render(<PickerHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Choose Service" }));

    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "carrier" } });

    expect(
      screen.getByRole("button", { name: /Carrier Premium Check/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /FMI Free Check/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View All" }));
    expect(search).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /FMI Free Check/ }),
    ).toBeInTheDocument();
  });

  it("selects a service, closes the picker, and restores trigger focus", async () => {
    render(<PickerHarness />);
    const trigger = screen.getByRole("button", { name: "Choose Service" });
    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("button", { name: /Carrier Premium Check/ }),
    );

    expect(
      screen.getByRole("button", { name: "Carrier Premium Check" }),
    ).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Carrier Premium Check" }),
      ).toHaveFocus();
    });
  });

  it("closes on Escape and restores trigger focus", async () => {
    render(<PickerHarness />);
    const trigger = screen.getByRole("button", { name: "Choose Service" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes when focus moves to an outside pointer target", () => {
    render(
      <div>
        <PickerHarness />
        <button type="button">Outside action</button>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "Choose Service" });
    fireEvent.click(trigger);
    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside action" }));

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("reserves a loading state while services are fetched", () => {
    render(<PickerHarness loading />);
    fireEvent.click(screen.getByRole("button", { name: "Choose Service" }));

    expect(
      screen.getByRole("status", { name: "Loading services" }),
    ).toBeInTheDocument();
  });
});
