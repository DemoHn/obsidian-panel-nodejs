# TODO list

Last Update: 16/06/2017
Current Version: v0.6.1

1. Add FTP Manager for multiple instances. **[OK]**

2. Sync FTP Account and Process Info after creating/editing new instance. **[OK]**

3. Add Startup Script for Linux. **[OK]**

4. Add Startup Script for Windows. **[OK]**

5. Setup npm-based workflow. **[OK]**

6. Try to run this process under non-root user.
**[CANCEL] because we have registered this process as a service, which always starts as root.**

__________

__** Release v0.5.4 for Windows__
__** Release v0.5.4 for Linux (Package Version)__
__________

6. Redesign log Object format to save parsing time and storing size. **[OK] See 'log_buffer-v2.md' for details**
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

8. Implement unzip tool [read/zip/unzip]. **[OK]**

9. Add  managing MC-instance from MC-pack (整合包). **[OK]**
___________
__** Release v0.6.0 for Windows, Linux__
___________

**ACTUAL VERSION: v0.6.1** 


10. Redesign Dashboard display. **[OK]**

11. Add maunal update interface.

12. Add npm-based 'package' process.

13. Fix 'logout failed' bug.
___________
__** Release v0.6.3 for Windows, Linux__
___________

14. Develop an utility that can add users.

15. Create ordinary users and distributes its quota. (NOT publish)

16. Add an option of 'enable FTP users'.

17. Add custom source of downloading java.
___________
__** Release v0.6.5 for Windows, Linux__
___________ 

