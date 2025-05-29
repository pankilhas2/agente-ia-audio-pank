@echo off

echo Verificando versao do Node.js...
node -v

echo Baixando e instalando Node.js LTS...
start https://nodejs.org/

echo Aguarde a instalacao do Node.js e feche o terminal atual.

echo Depois de instalar o Node.js, execute:

echo npm install --save-dev next-svgr

echo e depois:

echo npm run build

echo Pressione qualquer tecla para sair...
pause
