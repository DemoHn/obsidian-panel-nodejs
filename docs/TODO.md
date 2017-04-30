# TODO list

Last Update: 27/04/2017


1. Add FTP Manager for multiple instances. **[OK]**

2. Sync FTP Account and Process Info after creating/editing new instance. **[OK]**

3. Add Startup Script for Linux.

4. Add Startup Script for Windows.

5. Setup npm-based workflow.

6. Try to run this process under non-root user.
__________

__** Release v0.5.4 for Windows__
__** Release v0.5.4 for Linux (Package Version)__
__________

6. Redesign log Object format to save parsing time and storing size.
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
7. Implement store and read MC log operation.

8. Implement unzip tool [read/zip/unzip].

9. Add  managing MC-instance from MC-pack (整合包).
___________
__** Release v0.6.0 for Windows, Linux__
___________


