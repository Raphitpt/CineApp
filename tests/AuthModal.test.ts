import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthModal from "@/components/Auth/AuthModal.vue";

const loginMock = vi.fn();
const registerMock = vi.fn();

const mockStore = {
  error: null,
  loading: false,
  login: loginMock,
  register: registerMock,
};

vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => mockStore,
}));

const mountAuthModal = () => mount(AuthModal);

beforeEach(() => {
  vi.clearAllMocks();
  mockStore.error = null;
  mockStore.loading = false;
});

describe("AuthModal", () => {
  it("login success → emit close", async () => {
    loginMock.mockResolvedValue(true);

    const wrapper = mountAuthModal();

    await wrapper.find("input[type='email']").setValue("test@mail.com");
    await wrapper.find("input[type='password']").setValue("1234");
    await wrapper.find("form").trigger("submit.prevent");

    expect(loginMock).toHaveBeenCalled();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    const wrapper = mountAuthModal();

    await wrapper.find("button.mt-4").trigger("click");
    await wrapper.vm.$nextTick();

    console.log("inputs count:", wrapper.findAll("input").length);
    console.log("HTML après toggle:", wrapper.html());

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("test@mail.com");
    await inputs[1].setValue("1234");
    await inputs[2].setValue("9999");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    console.log("HTML après submit:", wrapper.html());
    console.log("store.error:", mockStore.error);
  });

  it("toggle mode fonctionne", async () => {
    const wrapper = mountAuthModal();

    expect(wrapper.text()).toContain("Connexion");
    await wrapper.find("button.mt-4").trigger("click");
    expect(wrapper.text()).toContain("Créer un compte");
  });
});
