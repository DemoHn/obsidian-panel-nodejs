# Log Buffer Protocol v1
# by Nigshoxiz
# 2017/6/12
 
**NOTE**: The term `log buffer` refers to the output log generated by MC Server. Differs from bare text, it is formated with additional information.
In order to improve the output performance and compress the size of log buffer, we specially designed a binary protocol.
The following content introduces the structure.

Log buffer structure:

     0    1     2     3     4     5      6          7 - N
+------------+-----+-----+------------+------+------  ...  ------+
| BUF LENGTH | PTL | VER |  INST_ID   | TYP  |     LOG BUFFER    |
+------------+-----+-----+------------+------+------  ...  ------+

**PTL = 0x01**
**VER = 0x01**

a. BUF_LENGTH [2 BIT]: indicates the total length of the buffer. The 'header' bits, such as 'VER' and 'PTL' are also included.
This is a 2-bit unsigned data.
**NOTE**: because it ownes only 2 bits, the largest number is 65535. i.e. the maximum length of log content is 65528. Exceeded bits will be trimmed for safety reasons.

b. PTL [1 BIT]: indicates the Protocol ID. _current value : 0x01_

c. VER [1 BIT]: indicates the version of this protocol. _current value: 0x01_

d. INST_ID [2 BIT]: indicates the instance ID.

e. TYP [1 BIT]: indicates the type of log buffer. This value is to classify the origin of log.
   0x01: INPUT (stdin)
   0x02: OUTPUT (stdout)
   0x03: ERROR (stderr)

f. LOG BUFFER [N BIT]: the main content of log buffer. The size is not constrained, but total length shall be matched with value 'buf_length' at first 2 bits.

Example:

Log buffer '00 10 01 01 00 02 03 60 61 62 63 64 65 66 67 68' represents for a 9-bit long string from stderr and inst_id = 0x02
