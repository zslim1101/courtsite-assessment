import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", async (req, reply) => {
  return { hello: "world" };
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
