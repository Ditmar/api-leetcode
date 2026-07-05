FROM eclipse-temurin:21-jdk-alpine

RUN adduser -D -u 1001 executor
WORKDIR /code
RUN chown executor:executor /code

USER executor

CMD ["sh", "/code/entrypoint.sh"]
