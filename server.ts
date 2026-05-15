import Fastify, { FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import { nanoid } from "nanoid";
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
      url: Type.String({ format: "url" }),
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
      fastify.log.info(`Shortening URL: ${req.body.url}`);

      const shortUrl = await shortenUrl(req.body.url);
      await redis.set(shortUrl, req.body.url);

      reply.status(200).send({
        status: "success",
        shortUrl,
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

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
