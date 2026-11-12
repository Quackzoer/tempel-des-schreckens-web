import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { shuffle } from "../src/index.ts";

const sorted = (arr: number[]) => [...arr].sort((a, b) => a - b);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("shuffle", () => {
  test("returns a permutation of the input", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle([...input]);
    expect(result).toHaveLength(input.length);
    expect(sorted(result)).toEqual(input);
  });

  test("keeps duplicates", () => {
    const input = [1, 1, 2, 2, 2, 3];
    expect(sorted(shuffle([...input]))).toEqual(input);
  });

  test.each([[[]], [[1]]])("handles trivial arrays %j", (input) => {
    expect(shuffle([...input])).toEqual(input);
  });

  test("shuffles in place and returns the same array", () => {
    const input = [1, 2, 3, 4];
    expect(shuffle(input)).toBe(input);
  });

  test("is deterministic for a given random source", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(shuffle([1, 2, 3, 4])).toEqual([2, 3, 4, 1]);
  });

  test("leaves the array unchanged when random always picks the current index", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(shuffle([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  test("produces every permutation with roughly equal frequency", () => {
    const counts = new Map<string, number>();
    const runs = 6000;
    for (let i = 0; i < runs; i++) {
      const key = shuffle([1, 2, 3]).join("");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6); // 3! permutacji
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(800); // oczekiwane ~1000, odchylenie standardowe ~29
      expect(count).toBeLessThan(1200);
    }
  });
});
