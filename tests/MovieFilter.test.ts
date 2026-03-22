import { mount } from "@vue/test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import MovieFilter from "@/components/Movie/MovieFilter.vue";

const movies = [
  { title: "Inception", category: "Sci-Fi", rating: 9, year: 2010, duration: 120 },
  { title: "Interstellar", category: "Sci-Fi", rating: 8, year: 2014, duration: 150 },
  { title: "Titanic", category: "Drama", rating: 7, year: 1997, duration: 180 },
];

let wrapper: ReturnType<typeof mount>;

beforeEach(() => {
  wrapper = mount(MovieFilter, { props: { movies } });
});

const emittedMovies = () => wrapper.emitted("update-movies")!;

describe("MovieFilter", () => {
  it("filtre par recherche", async () => {
    await wrapper.find("input").setValue("ince");

    expect(emittedMovies()).toBeTruthy();
    expect(emittedMovies()[0][0].length).toBe(1);
  });

  it("filtre par catégorie", async () => {
    await wrapper.find("select").setValue("Drama");

    expect(emittedMovies()[0][0][0].title).toBe("Titanic");
  });

  it("tri par titre asc", async () => {
    await wrapper.findAll("select")[1].setValue("titleAsc");

    expect(emittedMovies()[0][0][0].title).toBe("Inception");
  });

  it("filtre par rating", async () => {
    await wrapper.find("input[type='range']").setValue(8);

    expect(emittedMovies()[0][0].length).toBe(2);
  });
});
