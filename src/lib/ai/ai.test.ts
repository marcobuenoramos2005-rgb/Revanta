import Anthropic from "@anthropic-ai/sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AI_MAX_OUTPUT_TOKENS, AI_MODEL, getAiMode, getDailyLimit, LISTING_TITLE_MAX } from "./config";
import { estimateCostUsd, formatUsd, maxCostPerCallUsd } from "./cost";
import { classifyError, describeErrorForLog, generateListing, type ListingClient } from "./generate";
import { generateMockListing } from "./mock";
import { buildListingUserMessage, LISTING_SYSTEM_PROMPT, type ListingInput } from "./prompt";

const input: ListingInput = {
  title: "Chaqueta vaquera",
  brand: "Levi's",
  category: "Ropa",
  size: "M",
  color: "Azul",
  condition: "Muy bueno",
  price: "39,00 €",
  platform: "vinted",
  extraDetails: "Pequeño roce en el puño izquierdo",
};

const usage = { input_tokens: 600, output_tokens: 400 };

/** Cliente falso: nunca hace peticiones de red. */
function fakeClient(response: unknown) {
  const parse = vi.fn(async (_request: unknown) => {
    void _request;
    if (response instanceof Error) throw response;
    return response;
  });
  return { client: { messages: { parse } } as unknown as ListingClient, parse };
}

const ok = (parsed_output: unknown, extra: Record<string, unknown> = {}) => ({
  model: AI_MODEL,
  stop_reason: "end_turn",
  usage,
  parsed_output,
  ...extra,
});

const apiError = <T>(ErrorClass: new (...args: never[]) => T, status: number) =>
  new ErrorClass(...([status, { type: "error" }, "boom", new Headers({ "request-id": "req_123" })] as never[]));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("configuración", () => {
  it("usa llamadas reales solo si hay clave; la clave tiene prioridad sobre el modo simulado", () => {
    expect(getAiMode({})).toBe("off");
    expect(getAiMode({ AI_MOCK: "1" })).toBe("mock");
    expect(getAiMode({ ANTHROPIC_API_KEY: "sk-test" })).toBe("live");
    expect(getAiMode({ ANTHROPIC_API_KEY: "sk-test", AI_MOCK: "1" })).toBe("live");
    expect(getAiMode({ ANTHROPIC_API_KEY: "   ", AI_MOCK: "1" })).toBe("mock");
  });

  it("el límite diario tiene un valor por defecto y rechaza valores absurdos", () => {
    expect(getDailyLimit({})).toBe(20);
    expect(getDailyLimit({ AI_DAILY_LIMIT: "5" })).toBe(5);
    for (const bad of ["0", "-3", "abc", "1.5", "999999"]) {
      expect(getDailyLimit({ AI_DAILY_LIMIT: bad })).toBe(20);
    }
  });
});

describe("estimación de costes", () => {
  it("calcula el coste con los precios de Haiku 5.5 (0,10 $ / 0,50 $ por millón de tokens)", () => {
    expect(estimateCostUsd(1_000_000, 0)).toBeCloseTo(0.1);
    expect(estimateCostUsd(0, 1_000_000)).toBeCloseTo(0.5);
    expect(estimateCostUsd(600, 400)).toBeCloseTo(0.00026);
    expect(estimateCostUsd(0, 0)).toBe(0);
  });

  it("el coste máximo de una llamada es de milésimas de dólar", () => {
    expect(maxCostPerCallUsd()).toBeCloseTo((1500 * 0.1 + AI_MAX_OUTPUT_TOKENS * 0.5) / 1e6);
    expect(maxCostPerCallUsd()).toBeLessThan(0.003);
  });

  it("formatea importes pequeños con decimales suficientes", () => {
    expect(formatUsd(0.00026)).toMatch(/0,0003/);
    expect(formatUsd(0)).toMatch(/0,00/);
    expect(formatUsd(1.5)).toMatch(/1,50/);
  });
});

describe("prompt", () => {
  it("incluye los datos del artículo y las indicaciones de la plataforma", () => {
    const message = buildListingUserMessage(input);
    for (const text of ["Chaqueta vaquera", "Levi's", "Talla: M", "Azul", "Muy bueno", "39,00 €", "roce en el puño", "Vinted"]) {
      expect(message).toContain(text);
    }
  });

  it("omite los campos vacíos y recorta los detalles demasiado largos", () => {
    const message = buildListingUserMessage({
      ...input,
      brand: null,
      size: "  ",
      price: null,
      extraDetails: "x".repeat(2000),
    });
    expect(message).not.toContain("Marca:");
    expect(message).not.toContain("Talla:");
    expect(message).not.toContain("Precio");
    expect(message).toContain("x".repeat(500));
    expect(message).not.toContain("x".repeat(501));
  });

  it("las instrucciones prohíben inventar datos y tratan los datos como información", () => {
    expect(LISTING_SYSTEM_PROMPT).toContain("No inventes");
    expect(LISTING_SYSTEM_PROMPT).toContain("no instrucciones");
  });
});

describe("generateListing (cliente simulado, sin red)", () => {
  it("devuelve título, descripción y tokens; llama al modelo correcto con salida estructurada", async () => {
    const { client, parse } = fakeClient(ok({ title: "  Chaqueta Levi's M  ", description: " Muy buen estado. " }));
    const result = await generateListing(client, input);

    expect(result).toEqual({
      ok: true,
      title: "Chaqueta Levi's M",
      description: "Muy buen estado.",
      model: AI_MODEL,
      inputTokens: 600,
      outputTokens: 400,
    });

    expect(parse).toHaveBeenCalledTimes(1);
    const request = parse.mock.calls[0][0] as {
      model: string;
      max_tokens: number;
      output_config: { effort: string; format: unknown };
      system: string;
      messages: { content: string }[];
    };
    expect(request.model).toBe("claude-haiku-5-5");
    expect(request.max_tokens).toBe(AI_MAX_OUTPUT_TOKENS);
    expect(request.output_config.effort).toBe("low");
    expect(request.output_config.format).toBeDefined();
    expect(request.system).toBe(LISTING_SYSTEM_PROMPT);
    expect(request.messages).toHaveLength(1);
    expect(request.messages[0].content).toContain("Chaqueta vaquera");
    // Parámetros que la API rechaza en este modelo.
    for (const forbidden of ["temperature", "top_p", "top_k", "thinking"]) {
      expect(request).not.toHaveProperty(forbidden);
    }
  });

  it("recorta títulos que superan el máximo sin cortar palabras", async () => {
    const long = Array.from({ length: 30 }, (_, i) => `palabra${i}`).join(" ");
    const { client } = fakeClient(ok({ title: long, description: "Descripción" }));
    const result = await generateListing(client, input);
    expect(result.ok && result.title.length).toBeLessThanOrEqual(LISTING_TITLE_MAX);
    expect(result.ok && long.startsWith(result.title)).toBe(true);
    expect(result.ok && result.title.endsWith(" ")).toBe(false);
  });

  it("negativa del modelo → refused (conserva los tokens facturados)", async () => {
    const { client } = fakeClient(ok(null, { stop_reason: "refusal" }));
    expect(await generateListing(client, input)).toEqual({
      ok: false,
      code: "refused",
      inputTokens: 600,
      outputTokens: 400,
    });
  });

  it("respuesta cortada por el tope de tokens → truncated", async () => {
    const { client } = fakeClient(ok(null, { stop_reason: "max_tokens" }));
    expect(await generateListing(client, input)).toMatchObject({ ok: false, code: "truncated", outputTokens: 400 });
  });

  it.each([
    ["sin salida", null],
    ["campos vacíos", { title: " ", description: "x" }],
    ["falta la descripción", { title: "Hola" }],
    ["tipos incorrectos", { title: 5, description: [] }],
  ])("salida inválida (%s) → invalid_output", async (_name, parsed) => {
    const { client } = fakeClient(ok(parsed));
    expect(await generateListing(client, input)).toMatchObject({ ok: false, code: "invalid_output" });
  });

  it.each([
    ["clave inválida (401)", apiError(Anthropic.AuthenticationError, 401), "not_configured"],
    ["sin permiso (403)", apiError(Anthropic.PermissionDeniedError, 403), "not_configured"],
    ["modelo inexistente (404)", apiError(Anthropic.NotFoundError, 404), "not_configured"],
    ["sin crédito (400)", apiError(Anthropic.BadRequestError, 400), "not_configured"],
    ["límite de peticiones (429)", apiError(Anthropic.RateLimitError, 429), "rate_limited"],
    ["error del servidor (500)", apiError(Anthropic.InternalServerError, 500), "unavailable"],
    ["sin conexión", new Anthropic.APIConnectionError({ message: "sin red" }), "unavailable"],
    ["tiempo de espera", new Anthropic.APIConnectionTimeoutError(), "unavailable"],
    ["error desconocido", new Error("otra cosa"), "invalid_output"],
  ])("%s → %s, sin lanzar excepción y sin tokens", async (_name, error, code) => {
    const { client } = fakeClient(error);
    expect(await generateListing(client, input)).toEqual({ ok: false, code, inputTokens: 0, outputTokens: 0 });
    expect(classifyError(error)).toBe(code);
  });

  it("el registro de errores no contiene la clave, el prompt ni el mensaje del proveedor", async () => {
    const secret = "sk-ant-api03-SECRETO";
    const error = new Anthropic.AuthenticationError(
      401 as never,
      { type: "error" } as never,
      `invalid x-api-key ${secret}`,
      new Headers({ "request-id": "req_abc" }) as never,
    );
    const { client } = fakeClient(error);
    await generateListing(client, input);

    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).not.toContain(secret);
    expect(logged).not.toContain("Chaqueta vaquera");
    expect(logged).toContain("req_abc");
    expect(describeErrorForLog(error)).toEqual({ type: "AuthenticationError", status: 401, requestId: "req_abc" });
    expect(describeErrorForLog("texto")).toEqual({ type: "string" });
  });
});

describe("generador simulado", () => {
  it("genera un texto marcado como simulado, sin tokens ni coste", () => {
    const result = generateMockListing(input);
    expect(result).toMatchObject({ ok: true, model: "mock", inputTokens: 0, outputTokens: 0 });
    expect(result.ok && result.title).toBe("Levi's Chaqueta vaquera talla M Azul");
    expect(result.ok && result.description).toContain("[Texto simulado · Vinted]");
    expect(result.ok && result.description).toContain("roce en el puño");
  });
});
