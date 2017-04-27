# TODO list

Last Update: 27/04/2017


1. Add FTP Manager for multiple instances.

2. Sync FTP Account and Process Info after creating/editing new instance.

3. Add Startup Script for Linux.

4. Add Startup Script for Windows.

__________

__** Release v0.5.4 for Windows__

__________

5. Redesign log Object format to save parsing time and storing size.
   ```
   Currently:
   log = {
       "format" : "O",
       "log" : XXXX
   }

   Proposed:
   [A byte string]
   0xFF 0x23 X X X 
   ```
6. Implement unzip tool [read/zip/unzip].
