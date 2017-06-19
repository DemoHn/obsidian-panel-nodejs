@ECHO OFF
SET TMPFOLDER=%TEMP%\upgrade-obsidian-panel
SET BUNDLEDIR=%1
SET OBPANEL=%2

if exist %TMPFOLDER% (
    rmdir /s /q %TMPFOLDER%
)

obsidian.exe -t os_service --command=stop
rem unzip bundledir
mkdir %TMPFOLDER%
7za.exe x %BUNDLEDIR% -o%TMPFOLDER% -aoa

if %ERRORLEVEL% == 0 (
    RMDIR /S /Q %TMPFOLDER%\obsidian-panel\data
    DEL /Q %TMPFOLDER%\obsidian-panel\bin\config.yml
    DEL /Q %TMPFOLDER%\obsidian-panel\bin\.startup.lck
    xcopy /S /E /I /Y %TMPFOLDER%\obsidian-panel %CD%\..

    if %ERRORLEVEL% == 0 (
        rmdir /s /q %TMPFOLDER%
        obsidian.exe -t os_service --command=start
        %OBPANEL%
        exit
    ) else ( echo "FATAL ERROR<COPY>")
) else ( echo "FATAL ERROR<UNZIP>" )
