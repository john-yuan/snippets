#!/bin/sh
# @author John Yuan
# @date 2018-08-05
# @file autontfs.sh
# 本脚本文件用于 macos 系统自动挂载 NTFS 格式U盘或移动硬盘
# 本脚本会自动扫描本机所挂载的 NTFS 设备，并尝试以读写的方式进行挂载
# 使用方法，将文件保存至 autontfs.sh 并运行：
# sudo chmod +x autontfs.sh
# sudo ./autontfs.sh
# 本脚本将产生以下两个文件
# 1) /etc/fstab.autontfs.original.backup 首次使用时用于备份原始的 /etc/fstab
# 2) /etc/fstab.autontfs.backup 每次使用时用于备份上次的 /etc/fstab
# 每次执行时会更新以下文件
# 1) /etc/fstab.autontfs.backup 
# 2) /etc/fstab

# 打印提示信息
# $1 message
LogInfo() {
  printf "\033[0m[提示] ${1}\033[0m\n"
}

# 打印成功提示信息
# $1 message
LogSuccess() {
  printf "\033[1;32m[提示] ${1}\033[0m\n"
}

# 打印警告信息
# $1 message
LogWarn() {
  printf "\033[1;33m[警告] ${1}\033[0m\n"
}

# 打印错误信息
# $1 message
LogErr() {
  printf "\033[0;31m[错误] ${1}\033[0m\n"
}

# 打印错误信息并退出程序
# $1 message
LogExit() {
  LogErr "$1"
  LogErr "程序已退出"
  echo
  exit 1
}

# 打印上一个警告信息
LogLastWarn() {
  local error=$(cat $TEMP_ERR)
  if [ "$error" == "" ]; then
    error="没有捕获到错误信息"
  fi
  LogWarn "$error"
}

# 打印上一个错误信息
LogLastErr() {
  local error=$(cat $TEMP_ERR)
  if [ "$error" == "" ]; then
    error="没有捕获到错误信息"
  fi
  LogErr "$error"
}

# 获取设备名称
# $1 dev_path
GetDeviceName() {
  local device_name="$(diskutil info $1 | grep 'Volume Name:')"
  device_name=$(echo "$device_name" | cut -f2 -d':')
  device_name=$(echo "$device_name" | sed 's/^[ \t]*//;s/[ \t]*$//')
  echo "$device_name" | sed 's/ /\\\\040/g'
}

# 查找外部 NTFS 存储设备
FindExternalNtfsDevices() {
  diskutil list | grep '(external, physical):' | while read line
  do 
    if [ "$line" != "" ]; then
      dev=$(echo "$line" | cut -f1 -d' ')
      if [ "$dev" != "" ]; then
        LogInfo "正在检查外部存储设备 $dev"
        for dev_path in $(ls "$dev"*); do
          type="Partition Type:\\s+Windows_NTFS"
          ntfs=$(diskutil info $dev_path | grep -E "$type")
          if [ "$ntfs" != "" ]; then
            dev_name=$(GetDeviceName $dev_path)
            if [ "$dev_name" != "" ]; then
              LogInfo "$dev_path 的格式为 NTFS，设备名称为 $dev_name"
              UpdateDeviceFstab $dev_name $dev_path
            else
              LogInfo "$dev_path 设备名称未知，跳过此设备"
            fi
          else
            LogInfo "$dev_path 不是 NTFS 格式，跳过此设备"
          fi
        done
      fi
    fi
  done
}

# 备份原有 /etc/fstab
BackupOriginalFstab() {
  if [ ! -e "$FSTAB_ORIGINAL_BACKUP" ]; then
    LogInfo "正在备份 $FSTAB"
    if [ -e "$FSTAB" ]; then
      if cp $FSTAB $FSTAB_ORIGINAL_BACKUP > $TEMP_ERR 2>&1
      then
        LogInfo "已备份 $FSTAB => $FSTAB_ORIGINAL_BACKUP"
      else
        LogLastErr
        LogExit "备份 $FSTAB 失败"
      fi
    else
      cp /dev/null $FSTAB_ORIGINAL_BACKUP > $TEMP_ERR 2>&1
      if [ "$?" == "0" ]; then
        LogInfo "已备份空文件 $FSTAB => $FSTAB_ORIGINAL_BACKUP"
      else
        LogLastErr
        LogExit "备份 $FSTAB 失败"
      fi
    fi
  else
    LogInfo "备份已存在 $FSTAB => $FSTAB_ORIGINAL_BACKUP"
  fi
}

# 更新设备 fstab 记录
# $1 dev_name
# $2 dev_path
UpdateDeviceFstab() {
  local readonly DEV_NAME=$1
  local readonly DEV_PATH=$2
  local readonly DEV_LABEL="LABEL=$DEV_NAME none ntfs rw,auto,nobrowse"

  echo 'YES' > $TEMP_FSTAB_UPDATED
  echo 'NOT_FOUND' > $TEMP_UPDATE_STATE
  cat /dev/null > $TEMP_FSTAB

  if [ -f "$FSTAB" ]; then
    mv $FSTAB $FSTAB_BACKUP > $TEMP_ERR 2>&1  
    if [ "$?" != "0" ]; then
      LogLastErr
      LogExit "备份 $FSTAB 失败"
    else
      LogInfo "备份 $FSTAB 成功"
    fi

    fstab_content=$(cat $FSTAB_BACKUP 2>$TEMP_ERR)
    if [ "$?" != "0" ]; then
      LogLastErr
      LogExit "读取原有 fstab 记录失败"
    fi

    cat $FSTAB_BACKUP | sed 's/\\/\\\\\\\\/g' | while read -r fstab_row
    do
      fstab_row=$(echo $fstab_row | tr -s '\t' ' ' | tr -s ' ' ' ')
      if [ "$fstab_row" != "" ]; then
        existed_dev_name=$(echo $fstab_row | cut -f1 -d' ' | cut -f2 -d'=')
        existed_dev_name=$(echo $existed_dev_name | sed 's/ /\\\\040/g')
        if [ "$existed_dev_name" == "$DEV_NAME" ]; then
          if [ "$fstab_row" == "$DEV_LABEL" ]; then
            echo $DEV_LABEL >> $TEMP_FSTAB
            echo "FOUND" > $TEMP_UPDATE_STATE
          else
            echo "# Old: $fstab_row" >> $TEMP_FSTAB
            echo $DEV_LABEL >> $TEMP_FSTAB
            echo "REMOUNT" > $TEMP_UPDATE_STATE
          fi
        else
          echo $fstab_row >> $TEMP_FSTAB
        fi
      fi
    done
  fi

  if [ "$(cat $TEMP_UPDATE_STATE)" == "NOT_FOUND" ]; then
    echo "# Added at: $(date '+%Y-%m-%d %H:%M:%S')" >> $TEMP_FSTAB
    echo $DEV_LABEL >> $TEMP_FSTAB;
    echo "REMOUNT" > $TEMP_UPDATE_STATE
  fi

  cp $TEMP_FSTAB $FSTAB > $TEMP_ERR 2>&1

  if [ "$?" != "0" ]; then
    LogLastErr
    LogExit "更新 $FSTAB 失败"
  fi

  if [ "$(cat $TEMP_UPDATE_STATE)" == "REMOUNT" ]; then
    LogInfo "重新挂载 $DEV_NAME"
    diskutil unmount $DEV_PATH > $TEMP_ERR 2>&1
    if [ "$?" == "0" ]; then
      LogSuccess "卸载成功 $DEV_NAME"
    else
      LogLastWarn
      LogWarn "卸载失败 $DEV_NAME"
    fi
    diskutil mount $DEV_PATH > $TEMP_ERR 2>&1
    if [ "$?" == "0" ]; then
      LogSuccess "挂载成功 $DEV_NAME"
    else
      LogLastWarn
      LogWarn "挂载失败 $DEV_NAME"
    fi
  else
    LogWarn "设备 $DEV_NAME 已挂载，无需重新挂载，若不可用，请手动重新挂载"
  fi
}

# 在桌面创建快捷方式
CreateVolumesShortcut() {
  local WD=$(pwd)
  cd ~
  local HOME=$(pwd)
  local SHORTCUT="$HOME/Desktop/Volumes"
  cd $WD
  LogInfo "正在创建桌面快捷方式"
  LogInfo "ln -s /Volumes $SHORTCUT"
  if [ ! -e "$SHORTCUT" ]; then
    ln -s /Volumes $SHORTCUT
    LogSuccess "创建快捷方式成功"
  else
    LogInfo "快捷方式已存在"
  fi
}

# 打开挂载目录
OpenVolumes() {
  if [ "$(cat $TEMP_FSTAB_UPDATED)" == 'YES' ]; then
    LogInfo "自动挂载 NTFS 设备完毕"
    LogInfo "原始 /etc/fstab 备份：$FSTAB_ORIGINAL_BACKUP"
    LogInfo "最新 /etc/fstab 备份：$FSTAB_BACKUP"
    LogInfo "最新 /etc/fstab 内容："
    echo
    cat $FSTAB
    echo
    CreateVolumesShortcut
    LogInfo "正在打开 /Volumes"
    LogInfo "如果没有找到您的设备，请尝试重新连接"
    LogInfo "退出程序"
    sleep 0.5
    open /Volumes
  else
    LogWarn "没有找到有效的外部 NTFS 存储设备"
    LogInfo "请使用 sudo diskutil list 查看设备是否已挂载"
    LogInfo "退出程序"
  fi
}

echo

LogInfo "程序开始"

readonly FSTAB="/etc/fstab"
readonly FSTAB_ORIGINAL_BACKUP="/etc/fstab.autontfs.original.backup"
readonly FSTAB_BACKUP="/etc/fstab.autontfs.backup"
readonly TEMP_FSTAB=$(mktemp)
readonly TEMP_UPDATE_STATE=$(mktemp)
readonly TEMP_FSTAB_UPDATED=$(mktemp)
readonly TEMP_ERR=$(mktemp)

echo 'NO' > $TEMP_FSTAB_UPDATED

BackupOriginalFstab && FindExternalNtfsDevices && OpenVolumes

rm $TEMP_FSTAB > /dev/null 2>&1
rm $TEMP_UPDATE_STATE > /dev/null 2>&1
rm $TEMP_FSTAB_UPDATED > /dev/null 2>&1
rm $TEMP_ERR > /dev/null 2>&1

echo
