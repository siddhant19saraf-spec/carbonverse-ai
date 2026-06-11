import { loginSchema, registerSchema, emissionSchema } from "@/lib/validators";

describe("loginSchema", () => {
  it("validates correct login data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "pass123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "notanemail", password: "pass123" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates correct register data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      username: "johndoe",
      password: "pass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      username: "ab",
      password: "pass123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional full_name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      username: "johndoe",
      password: "pass123",
      full_name: "John Doe",
    });
    expect(result.success).toBe(true);
  });
});

describe("emissionSchema", () => {
  it("validates correct emission data", () => {
    const result = emissionSchema.safeParse({
      category: "transportation",
      amount: 100,
      unit: "km",
      subcategory: "car",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative amount", () => {
    const result = emissionSchema.safeParse({
      category: "transportation",
      amount: -10,
      unit: "km",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty category", () => {
    const result = emissionSchema.safeParse({
      category: "",
      amount: 10,
      unit: "km",
    });
    expect(result.success).toBe(false);
  });
});
