---
layout: post
title:  "Double VPN"
meta_description: "Связка OpenSSH с OpenVPN для быстрого создания двойного VPN"
date:   2016-08-27
tags: openvpn openssh double
categories: article
---

## Теория

Про настройку OpenVPN мы [уже рассказывали](https://cryptopunks.org/article/secure+openvpn+installer/). Сегодня речь пойдёт о двойном VPN (он же **double vpn**).<br>
Двойной VPN это принцип когда ты обращаешься к серверу *А*, а он в свою очередь перенаправляет весь трафик на сервер *Б* и сервер *Б* перенаправляет пакеты уже в интернет. Вычислив сервер *Б* его могут взломать и не увидеть в логах ничего кроме адреса на сервер *А*. Его конечно тоже можно взломать, либо конфисковать, но речь лишь о том как этот процесс усложнить. Сервер *А* будем называть *vpn-in*, а сервер *Б* - *vpn-out*.<br>
VPS-ки для *vpn-in* и *vpn-out* следует выбирать у разных хостеров и желательно в разных странах (желательно ещё и "воинствующих").

## Подготовка vpn-in

Весь трафик будем перенаправлять на *vpn-out* средставми OpenSSH.<br>
Генерируем связку ключей:

```
# ssh-keygen -b 4096
```

Создаём скрипт **/root/forward_vpn.sh**:

```
#!/bin/sh

PATH=$PATH:/bin:/sbin:/usr/bin:/usr/sbin

VPN_IN_IP='XXX.XXX.XXX.XXX'
VPN_OUT_LOCAL_IP="YYY.YYY.YYY"
VPN_OUT_IP='vpn@ZZZ.ZZZ.ZZZ.ZZZ'
VPN_IN_LOCAL_PORT='XXX'
VPN_OUT_REMOTE_PORT='XXX'

ident=`ps ax | grep ssh | grep $VPN_OUT_IP | grep $VPN_OUT_REMOTE_PORT | grep -v grep`
if [ "$ident" ]
then
        echo "$VPN_OUT_IP ... OK"
else
        command="ssh -Nf -L $VPN_IN_IP:$VPN_IN_LOCAL_PORT:$VPN_OUT_LOCAL_IP:$VPN_OUT_REMOTE_PORT $VPN_OUT_IP"
        echo $command
        $command
fi
```

где **VPN_IN_IP** - внешний адрес вашего сервера *vpn_in*, **VPN_OUT_LOCAL_IP** - локальный адрес OpenVPN на *vpn_out*, **VPN_OUT_IP** - внешний адрес *vpn_out*. **VPN_IN_LOCAL_PORT**, **VPN_OUT_REMOTE_PORT** - локальный и удалённый порт vpn (чтобы не привлекать лишнего внимания - можно настроить vpn на 443 порт).
<br><br>
Добавляем в crontab задание:

```
# crontab -l
* * * * * /bin/sh /root/forward_vpn.sh
```

## Подготовка vpn-out

*vpn-out* настраивается точно так же как и любой openvpn-сервер, для удобства можно воспользоваться скриптом [openvpn_paranoid_installer](/article/secure+openvpn+installer/).<br>
Кроме того необходимо создать пользователя *vpn*:

```
# useradd vpn
```
и добавить ему публичный ключ *vpn_in* для входа без пароля (заходим на *vpn-in* и выполняем `ssh-copy-id vpn@vpn_out`)

## Общие рекомендации для vpn-in/vpn-out

* заходить на *vpn-out* следует **исключительно** через сервер *vpn-in* (в том числе по ssh), иначе теряется смысл двойного vpn
* выполнить `netstat -tulpan` и посмотреть какие порты светят наружу, удалить/выключить всё лишнее (вроде ntpd, rpcbind)
* отключить вход по паролю для ssh
* включить [автоматическое обновление](/article/enabling+automatic+updates+in+debian/) ОС и её компонентов на *vpn-in*/*vpn-out*
* при генерации новых ключей с конфигами на *vpn-out* не забывать менять параметр **server** в конфиге на адрес **VPN_IN_IP**
* на локальном компьютере запретить доступ ко всему кроме **VPN_IN_IP**
