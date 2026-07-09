#!/bin/sh
# Este script ejecuta el comando recibido por parámetros directamente.
# El DockerRunner inyectará el comando completo, ej: ['node', 'index.js']

exec "$@"