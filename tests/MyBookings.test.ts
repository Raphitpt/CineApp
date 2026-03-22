import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MyBookings from "@/components/Booking/MyBookings.vue";

const cancelMock = vi.fn();
const fetchMock = vi.fn();

const defaultBooking = {
  id: "1",
  seats: 2,
  created_at: "2024-01-01",
  session: {
    date_time: "2024-02-01",
    movie: { title: "Inception" },
  },
};

const mockStore = {
  bookings: [defaultBooking],
  loading: false,
  error: null,
  fetchUserBookings: fetchMock,
  cancelBooking: cancelMock,
};

vi.mock("@/stores/bookingStore", () => ({
  useBookingStore: () => mockStore,
}));

const mountMyBookings = () => mount(MyBookings);

beforeEach(() => {
  mockStore.bookings = [defaultBooking];
  mockStore.loading = false;
  mockStore.error = null;
  vi.clearAllMocks();
});

describe("MyBookings", () => {
  it("affiche les réservations", async () => {
    const wrapper = mountMyBookings();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Inception");
    expect(wrapper.text()).toContain("2 places");
  });

  it("affiche loading", async () => {
    mockStore.loading = true;
    mockStore.bookings = [];

    const wrapper = mountMyBookings();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Chargement...");
  });

  it("cancel booking flow", async () => {
    cancelMock.mockResolvedValue(true);

    const wrapper = mountMyBookings();
    await wrapper.vm.$nextTick();

    await wrapper.find("button").trigger("click");
    await wrapper.find("button").trigger("click");

    expect(cancelMock).toHaveBeenCalled();
  });
});
