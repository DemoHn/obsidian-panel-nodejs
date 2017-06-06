#!/bin/bash

DIR=$(dirname $([ -L $0 ] && readlink -f $0 || echo $0))

_realpath () {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

EXEC_BIN=$DIR/bin/obsidian

# sub-commands

install_service(){
  $EXEC_BIN -t os_service --command=install
}

uninstall_service(){
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

banner(){
  echo "+------------------------------------------------------------------------------+"
  echo "|  __  ____  ____  __  ____  __   __   __ _      ____   __   __ _  ____  __    |"  
  echo "| /  \(  _ \/ ___)(  )(    \(  ) / _\ (  ( \ ___(  _ \ / _\ (  ( \(  __)(  )   |"
  echo "|(  O )) _ (\___ \ )(  ) D ( )( /    \/    /(___)) __//    \/    / ) _) / (_/\ |"
  echo "| \__/(____/(____/(__)(____/(__)\_/\_/\_)__)    (__)  \_/\_/\_)__)(____)\____/ |"
  echo "|                                                                              |"
  echo "|                              OBSIDIAN - PANEL                                |"
  echo "|                                BY NIGSHOXIZ                                  |"
  echo "|                                    2017                                      |"
  echo "|                                 v 0. 6. 1                                    |"
  echo "+------------------------------------------------------------------------------+"
  echo ""
}

install_panel(){
  banner
  
  if [ $(id -u) -ne 0 ]; then
    echo "[PANEL] You're required to run this script as root!"
    exit 2
  fi

  # if ob-panel has not been installed
  if ! [ -x "$(command -v ob-panel)" ]; then
    read -p "[PANEL] The \`ob-panel\` command has not installed! Would you like install it? [y/N]" yn
    case $yn in
      [y]* ) 
        echo "[PANEL] Installing \`ob-panel\`..."
        ln -s $(_realpath ./ob-panel.sh) /usr/sbin/ob-panel
        install_service
        echo "[PANEL] Install finish! Now you can type \`ob-panel start\` to launch the panel!"
        ;;
      * )
        exit 1
        ;;
    esac
  else
    echo "[PANEL] The \`ob-panel\` has been installed to your local machine successfully!"
    echo "        To start/stop the panel, you can type \`ob-panel start/stop\` directly!"
    echo "        Also, if you want to check \`help\`, type \`ob-panel help\` instead!"
  fi
}

case $1 in
  install)
    banner
    install_service
    ;;
  uninstall)
    banner
    uninstall_service
    ;;
  start)
    banner
    start
    ;;
  stop)
    banner
    stop
    ;;
  restart)
    banner
    restart
    ;;
  debug)
    debug
    ;;
  *)
    install_panel
    ;;
esac
