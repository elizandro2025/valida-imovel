@echo off
set GIT="C:\Users\eliza\AppData\Local\MinGit\cmd\git.exe"
%GIT% add src/pages/PixPaymentPage.tsx
%GIT% commit -m "fix(prod): adiciona import LogOut ausente em PixPaymentPage que causava crash em producao"
%GIT% push origin main
echo.
echo === Push concluido! Fazendo build ===
call npm run build
echo.
echo === Deploy Cloudflare Pages ===
call npx wrangler pages deploy dist --project-name=validaimovel --branch=main
echo.
echo === TUDO CONCLUIDO! ===
