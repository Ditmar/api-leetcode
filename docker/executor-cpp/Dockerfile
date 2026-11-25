FROM alpine:3.19

# Install g++ and necessary build tools only
RUN apk add --no-cache g++ libc-dev

# Create non-root user
RUN adduser -D -u 1001 executor
WORKDIR /code
RUN chown executor:executor /code

USER executor

CMD ["sh", "/code/entrypoint.sh"]
