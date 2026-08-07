@echo off
echo === Fazendo build do projeto ===
call npm run build
if %errorlevel% neq 0 (
    echo ERRO no build!
    exit /b 1
)
echo.
echo === Build concluido! Fazendo deploy no Cloudflare Pages ===
call npx wrangler pages deploy dist --project-name=valida-imovel --branch=main
echo.
echo === Deploy concluido! ===
