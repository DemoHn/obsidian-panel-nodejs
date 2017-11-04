#ifndef SERVICE_H
#define SERVICE_H

#include <windows.h>

#define SERVICE_NAME TEXT("obsidian-panel")

// stop function
typedef void (*stop_function)();

// variables
static SERVICE_STATUS_HANDLE statusHandle;
static SERVICE_STATUS status;
extern stop_function win32_service_on_stop;

static HANDLE node_thread;

void win32_service_run();

void win32_service_set_status(DWORD status);

DWORD WINAPI win32_service_thread_function(LPVOID lp);

// internal functions
void WINAPI _service_ctrl_handler(DWORD ctrl);

void WINAPI _service_main_function(DWORD argc, LPTSTR* argv);

void _write_log(char* str);
#endif