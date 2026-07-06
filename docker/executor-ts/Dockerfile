FROM node:20-alpine

RUN adduser -D -u 1001 executor
WORKDIR /code
RUN chown executor:executor /code

RUN npm install -g esbuild tsx

USER executor

CMD ["sh", "/code/entrypoint.sh"]