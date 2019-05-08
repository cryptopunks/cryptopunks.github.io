---
layout: post
title:  "Безопасный и минималистичный менеджер wifi-подключений"
meta_description: "Удобный скрипт по управлению wifi-сетями и openvpn-соединениями с минимальными зависимостями"
date:   2015-11-15 
tags: wifi openvpn wpa_supplicant macchanger dhclient linux
categories: article
---

# Описание проблемы

Под Linux существует довольно скудное кол-во готовых решений по управлению Wifi-соединениями. Самые популярные из них - **Network-manager** и **Wicd**. Первый вариант обладает огромным функционалом, который не всегда нужен и иногда довольно непредсказуемо себя ведёт; второй более минималистичен, но обделён жизненно необходимыми функциями (нет поддержки VPN, весьма странно ведёт себя реконнект). <br>
Однако существует огромное кол-во консольных вариантов с минимальными зависимостями, которые в связке работают весьма неплохо, но ими не всегда удобно управлять по отдельности. Именно поэтому эта проблема решилась написанием небольшого скрипта, который объединяет всё воедино.

Перед каждым новым соединением с wifi-точкой скрипт <a href="https://github.com/cryptopunks/minsecwifi" target="_blank">minsecwifi</a> меняет MAC-адрес wifi-устройства на случайный, активирует устройство, пробует подключиться к указанным в конфиге точкам доступа, получает по DHCP IP-адрес, прописывает указанные в конфиге адреса DNS-серверов и соединяется с VPN-сервером.

# Установка

Для запуска скрипта необходимо поставить следующие пакеты, скачать репозиторий со скриптом и запустить инсталлер (если нет необходимости ставить скрипт в систему глобально, то запуск **install.sh** нужно опустить):

```
$ apt-get install openvpn wpasupplicant macchanger rfkill
$ git clone https://github.com/cryptopunks/minsecwifi && cd minsecwifi
$ sudo ./install.sh
```

# Настройка конфига minsecwifi 

На данный момент конфиг скрипта состоит из нескольких полей описывающих интерфейс устройства, путь к конфигу wps_supplicant.conf, путь к конфигу openvpn и адресам используемых DNS-серверов. Все доступные параметры приведены в файле <a href="https://github.com/cryptopunks/minsecwifi/blob/master/minsecwifi.conf.sample">minsecwifi.conf.sample</a>.

Либо просмотреть их можно выполнив:

```
$ minsecwifi --example-minsecwifi
# Wifi device (run `ifconfig -a`)
WIFI_DEV="wlp3s0"
# Wpa_supplicant configuration file
WPA_CONF="/etc/wpa_supplicant/wpa_supplicant.conf"
# DNS-servers
DNS="nameserver 208.67.222.222\nnameserver 208.67.220.220"
# OpenVPN configuration file (for client)
OVPN_CONF="/etc/openvpn/client.ovpn"
# for run to all services (argument -r)
START_SEQUENCE="killallprocess unblock interface_down change_mac interface_up fixperm connect_hotspot get_dhcp_address rewrite_dns connect_vpn"
```

Копируем пример конфигурационного файла в систему (напомню что скриптом можно пользоваться и локально, тогда никаких **/etc/minsecwifi.conf** - конфиг должен лежать локально в директории с репозиторием `./minsecwifi --example-minsecwifi > minsecwifi.conf` ):

```
$ minsecwifi --example-minsecwifi | sudo tee --append /etc/minsecwifi.conf
```

Редактируем его командой:

```
$ sudo minsecwifi -em
```

# Настройка wpa_supplicant

Настройка wpa_supplicant сводится к довольно простому конфигу вида:

```
network={
    ssid="access point 1"
        psk="password"
}
network={
        ssid="access point 2"
        psk="password"
}
```
он обычно лежит в **/etc/wpa_supplicant/wpa_supplicant.conf**.

Создать конфиг с примером можно следующей командой:

```
$ minsecwifi --example-wpasupplicant | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
```

Рекомендуется выставить правильные права доступа к конфигу, т.к. прочитав этот файл можно получить пароли от используемых вами wifi-точек:

```
$ sudo minsecwifi --fix-permissions
```

# Использование minsecwifi

Запускаем без аргументов, чтобы ознакомиться с возможностями:

```
$ minsecwifi
Usage:
./minsecwifi [OPTION] 
  -s, --scan                    scan networks
  -r, --run                     run all services 
                                (variable START_SEQUENCE in minsecwifi.conf)
  -k, --killall                 kill all services
  -ew, --edit-wpasupplicant     edit wpa_supplicant.conf
  -em, --edit-minsecwifi        edit minsecwifi.conf
  -ub, --unblock                unblock wifi adaptor
  -iu, --interface-up           wifi interface down
  -id, --interface-down         wifi interface up
  -cm, --change-mac             change mac address
  -ch, --connect-hotspot        connect to hotspot
  -gd, --get-dhcp               get dhcp address
  -rd, --rewrite-dns            rewrite dns servers
  -cv, --connect-vpn            connect to vpn server
  -xw, --example-wpasupplicant  show example config for wpa_supplicant
  -xm, --example-minsecwifi     show example config for minsecwifi
  -fp, --fix-permissions        fix permissions for wpa_supplicant.conf
```

Сканируем сети:

```
$ sudo minsecwifi -s
```

редактируем конфиг, дописав новую точку доступа и пароль к ней:

```
$ sudo minsecwifi -ew
```

Подключаемся если необходимо пошагово, либо используем ключ -r, который запускает последовательно действия описанные в переменной конфига **START_SEQUENCE**:

```
$ sudo minsecwifi -r
```

По умолчанию переменная **START_SEQUENCE** просит minsecwifi запущенным с ключом `-r` выполнить последовательно следующие действия:

* убить предыдущие процессы wpa_supplicant/openvpn;
* произвести unlock устройства;
* выключить интерфейс;
* поменять MAC-адрес устройства на случайный;
* поднять интерфейс;
* изменить права доступа к wpa_supplicant.conf;
* подключиться к точки доступа; 
* получить по DHCP адрес;
* перезаписать DNS-сервера и залочить для перезаписи **/etc/resolv.conf**;
* подключиться к vpn.

# В заключении

Следите за обновлениями и выполняйте периодически `git pull` в директории с проектом. Если скрипт установлен в систему глобально, то не забывайте повторно выполнять `sudo ./install.sh` для перезаписи старого скрипта новым.<br> Для удаления скрипта из системы используйте `sudo ./uninstall.sh`.
<br>Предложения по улучшению и багрепорты <a href="/contacts/" target="_blank">принимаются</a>.
