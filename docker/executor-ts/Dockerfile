# Usamos una versión específica de node para mayor estabilidad
FROM node:20-alpine

# Crear usuario no-root
RUN adduser -D -u 1001 executor
WORKDIR /code
RUN chown executor:executor /code

# Copiamos el archivo de configuración al build image
COPY tsconfig.json /code/tsconfig.json

RUN npm install -g esbuild@0.24.2

# Cambiamos al usuario no-root para mejorar la seguridad
USER executor

CMD ["sh", "/code/entrypoint.sh"]