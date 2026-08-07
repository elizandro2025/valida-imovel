@echo off
set GIT="C:\Users\eliza\AppData\Local\MinGit\cmd\git.exe"
echo === STATUS LOCAL ===
%GIT% status
echo.
echo === ARQUIVOS NAO COMMITADOS ===
%GIT% diff --name-only
echo.
echo === ARQUIVOS EM STAGING ===
%GIT% diff --cached --name-only
echo.
echo === COMMITS LOCAIS NAO ENVIADOS ===
%GIT% log origin/main..HEAD --oneline
echo.
echo === ULTIMO COMMIT LOCAL ===
%GIT% log -1 --oneline
