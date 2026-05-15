// routes/users.test.ts
import Fastify from "fastify";
import { SHORT_URL_LENGTH, shortenUrl, shortenUrlRoutes } from "./server";
import Redis from "ioredis";

describe("shorten url tests", () => {
  let app: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    app = Fastify({ logger: true });
    await app.register(shortenUrlRoutes);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  // Unit test
  it("shortenUrl returns a 7 character short string ", async () => {
    const testUrl = "https://example.com";
    const shortUrl = await shortenUrl(testUrl);
    expect(shortUrl).toBeTypeOf("string");
    expect(shortUrl).toHaveLength(SHORT_URL_LENGTH);
  });

  // Integration tests
  it("POST /shorten_url returns a short URL", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/shorten_url",
      payload: { url: "https://example.com" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      status: "success",
      shortUrl: expect.any(String),
    });
  });

  it("GET /shorten_url returns full URL", async () => {
    const fullUrl = "https://example.com/full-url";
    await new Redis().set("sampleKey", fullUrl);
    const res = await app.inject({
      method: "GET",
      url: "/shorten_url/sampleKey",
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(fullUrl);
  });

  it("POST /shorten_url with invalid URL should return 404", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/shorten_url",
      payload: { url: "invalid-url" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe("FST_ERR_VALIDATION");
  });

  it("GET /shorten_url with a non-existent key returns a 404", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/shorten_url/non-existent-key",
    });

    expect(res.statusCode).toBe(404);
  });

  it("shortens a URL then resolves it back to the original", async () => {
    const originalUrl = "https://example.com/some/long/path";
    const postRes = await app.inject({
      method: "POST",
      url: "/shorten_url",
      payload: { url: originalUrl },
    });

    expect(postRes.statusCode).toBe(200);
    expect(postRes.json()).toEqual({
      status: "success",
      shortUrl: expect.any(String),
    });

    const { shortUrl } = postRes.json();
    const key = shortUrl;
    const getRes = await app.inject({
      method: "GET",
      url: `/shorten_url/${key}`,
    });

    expect(getRes.statusCode).toBe(302);
    expect(getRes.headers.location).toBe(originalUrl);
  });
});
