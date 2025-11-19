import { describe, it, expect } from "vitest"
import { cn } from "../utils"

describe("cn utility", () => {
  it("returns empty string for null, undefined, empty, or falsey values", () => {
    expect(cn(null)).toBe("")
    expect(cn(undefined)).toBe("")
    expect(cn("")).toBe("")
    expect(cn(false)).toBe("")
  })

  it("splits and returns string classes", () => {
    expect(cn("btn primary")).toBe("btn primary")
  })

  it("handles arrays of class names", () => {
    expect(cn(["btn", "lg"])).toBe("btn lg")
  })

  it("handles objects with enabled/disabled class names", () => {
    expect(cn({ btn: true, lg: false, active: 1 })).toBe("btn active")
  })

  it("handles mixed inputs together", () => {
    expect(cn("btn", ["lg"], { active: true, disabled: false }))
      .toBe("btn lg active")
  })

  it("filters out falsey values inside arrays", () => {
    expect(cn(["btn", null, "lg", undefined])).toBe("btn lg")
  })

  // 🔥 NEW TESTS — these cover the final `return []` branch (line 12)
  it("returns empty string for numbers", () => {
    expect(cn(123)).toBe("")
  })

  it("returns empty string for booleans (true)", () => {
    expect(cn(true)).toBe("")
  })

  it("returns empty string for functions", () => {
    expect(cn(() => {})).toBe("")
  })

  it("returns empty string for symbols", () => {
    expect(cn(Symbol("x"))).toBe("")
  })
})
