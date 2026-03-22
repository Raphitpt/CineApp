import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";

import MovieList from "@/components/Movie/MovieList.vue";

const mockStore = {
  movies: [],
  loading: false,
  error: null,
  fetchMovies: vi.fn(),
};

vi.mock("@/stores/movieStore", () => ({
  useMoviesStore: () => mockStore,
}));

const mountMovieList = () =>
  mount(MovieList, {
    global: {
      stubs: {
        Movie: {
          template: '<div class="movie-stub">{{ movie.title }}</div>',
          props: ["movie"],
        },
        MovieFilter: true,
        RouterLink: true,
      },
    },
  });

beforeEach(() => {
  mockStore.movies = [];
  mockStore.loading = false;
  mockStore.error = null;
  mockStore.fetchMovies = vi.fn();
});

describe("MovieList", () => {
  it("affiche une liste de films", async () => {
    mockStore.movies = [
      { id: "1", title: "Inception", poster: "img1.jpg" },
      { id: "2", title: "Interstellar", poster: "img2.jpg" },
    ];

    const wrapper = mountMovieList();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".grid > *").length).toBe(2);
    expect(wrapper.text()).toContain("Inception");
    expect(wrapper.text()).toContain("Interstellar");
  });

  it("affiche un message de chargement", async () => {
    mockStore.loading = true;

    const wrapper = mountMovieList();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Chargement...");
  });

  it("affiche un message d'erreur", async () => {
    mockStore.error = "Erreur de chargement";

    const wrapper = mountMovieList();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Erreur de chargement");
  });
});
