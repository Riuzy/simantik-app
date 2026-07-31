@echo off
cd /d "D:\Project\kp\simantik-app\apps\web"
pnpm typecheck 2>&1 | findstr "error" | findstr "error:" > typecheck_errors.txt
if exist typecheck_errors.txt (
    echo TypeScript compilation errors found:
    type typecheck_errors.txt
) else (
    echo ✅ No TypeScript errors
)
env