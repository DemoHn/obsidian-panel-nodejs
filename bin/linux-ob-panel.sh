#!/bin/sh

DIR=$(dirname $([ -L $0 ] && readlink -f $0 || echo $0))

EXEC_BIN=$DIR/bin/obsidian

# sub-commands

install(){
  $EXEC_BIN -t os_service --command=install
}

uninstall(){
  $EXEC_BIN -t os_service --command=uninstall
}

start(){
  $EXEC_BIN -t os_service --command=start
}

stop(){
  $EXEC_BIN -t os_service --command=stop
}

restart(){
  $EXEC_BIN -t os_service --command=stop
  $EXEC_BIN -t os_service --command=start
}

debug(){
  $EXEC_BIN
}
