#!/bin/sh
# Este script recibe el archivo a ejecutar.
# El orquestador DockerRunner inyectará los inputs del test case a través de stdin (entrada estándar)

# Ejecutamos el archivo de node (en este caso index.js que se pasará como argumento)
node "$@"