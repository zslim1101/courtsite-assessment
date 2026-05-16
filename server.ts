import Fastify, { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import { Redis } from "ioredis";
import { nanoid } from "nanoid";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Type from "typebox";

const redis = new Redis();

const fastify = Fastify({
  logger: true,
});

interface PostShortenUrlRequestBody {
  url: string;
}

const urlSchema = {
  schema: {
    body: Type.Object({
      url: Type.String(),
    }),
  },
};

export const SHORT_URL_LENGTH = 7;

export const shortenUrl = async (url: string): Promise<string> => {
  const shortUrl = nanoid(SHORT_URL_LENGTH);
  return shortUrl;
};

interface GetShortenUrlRequestQuery {
  key: string;
}

export async function shortenUrlRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: PostShortenUrlRequestBody }>(
    "/shorten_url",
    urlSchema,
    async (req, reply) => {
      let url = req.body.url;
      fastify.log.info(`Generating short code for: ${url}`);

      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }

      // Check if URL is accessible
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (!res.ok) {
          return reply.status(400).send({ error: "URL is not accessible" });
        }
      } catch (e) {
        return reply.status(400).send({ error: "URL is not reachable" });
      }

      const shortCode = await shortenUrl(url);
      await redis.set(shortCode, url);

      const fullShortUrl = `http://localhost:3000/shorten_url/${shortCode}`;

      reply.status(200).send({
        status: "success",
        shortCode,
        fullShortUrl,
      });
    },
  );

  fastify.get<{ Params: GetShortenUrlRequestQuery }>(
    "/shorten_url/:key",
    async (req, reply) => {
      fastify.log.info(`Getting full URL for: ${req.params.key}`);

      const fullUrl = await redis.get(req.params.key);

      if (!fullUrl) {
        return reply.status(404).send({
          status: "error",
          message: "URL not found",
        });
      }

      reply.redirect(fullUrl, 302);
    },
  );
}

fastify.register(shortenUrlRoutes);

const __dirname = dirname(fileURLToPath(import.meta.url));

await fastify.register(fastifyStatic, {
  root: join(__dirname, "public"),
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
