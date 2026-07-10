# Usamos la versión LTS ligera de Node.js
FROM node:20-alpine

# Creamos un usuario sin privilegios por razones de seguridad (aislamiento)
RUN addgroup -S runnergroup && adduser -S runneruser -G runnergroup

# Establecemos el directorio de trabajo donde el DockerRunner montará los archivos
WORKDIR /app

# Copiamos nuestro script de inicio
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh && chown runneruser:runnergroup /app/run.sh

# Cambiamos al usuario sin privilegios
USER runneruser

# Entrypoint por defecto
ENTRYPOINT ["/app/run.sh"]