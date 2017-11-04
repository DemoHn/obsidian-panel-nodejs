#include "service.h"
#include <windows.h>
#include <stdio.h>
#include <iostream>
/* This is only used in Win32 */

/** set win32 service status
send service status to service handler
*/
stop_function win32_service_on_stop;

void _write_log(char* str)
{
    FILE* fd = fopen("C:\\Projects\\ttt.log", "a+");

    fwrite(str, strlen(str), 1, fd);
    fclose(fd);
}

void win32_service_set_status(DWORD state)
{
    status.dwServiceType = SERVICE_WIN32_OWN_PROCESS;
    status.dwCurrentState = state;
    status.dwCheckPoint   = 0;
    status.dwWaitHint     = 0;
    status.dwControlsAccepted = SERVICE_ACCEPT_STOP;
    status.dwWin32ExitCode = 0;
    SetServiceStatus(statusHandle, &status);
}

/* run service */
void win32_service_run()
{    
    _write_log("win32 service run");
    
    node_thread = GetCurrentThread();

    HANDLE handle = CreateThread(NULL, 0, win32_service_thread_function, NULL, 0, NULL);

    if(handle) {
        //CloseHandle(handle);
    }
}

DWORD WINAPI win32_service_thread_function(LPVOID lp)
{
    SERVICE_TABLE_ENTRY serviceTable[] = {
        { SERVICE_NAME, _service_main_function },
        {NULL, NULL}
    };


    if( StartServiceCtrlDispatcher(serviceTable) )
    {
        while (1) {
			DWORD status;
			BOOL rcode = GetExitCodeThread (node_thread, &status);

			if (! rcode)
				break;

			if (status != STILL_ACTIVE)
				break;
		}
        _write_log("ready to exit\n");
    }else {
        char buf[256];
        _snprintf_s(buf, 250, "exit error: %d", GetLastError());
        _write_log(buf);

        while(1) {
            Sleep(60000);
        }
    }

    ExitThread(0);
}

/* service ctrl handler */
void WINAPI _service_ctrl_handler(DWORD ctrl)
{
    char buf[256];
    _snprintf(buf, 250, "ctrl: %d\n", ctrl);
    _write_log(buf);
    switch(ctrl)
    {
        case SERVICE_CONTROL_STOP:
            win32_service_set_status(SERVICE_STOP_PENDING);

            //srv->onStop();
            if (NULL != win32_service_on_stop)
            {
                _write_log("A\n");
                win32_service_on_stop();
            }
            else
            {
                _write_log("B\n");
                //Sleep(100);
            }

            win32_service_set_status(SERVICE_STOPPED);
            break;
        default:
            break;
    }   
}

/* service service main function */
void WINAPI _service_main_function(DWORD argc, LPTSTR* argv)
{
    statusHandle = RegisterServiceCtrlHandler(
        SERVICE_NAME, _service_ctrl_handler
    );

    if(statusHandle == NULL)
    {
        return ;
    }
    // start the service
    win32_service_set_status(SERVICE_RUNNING);
}
