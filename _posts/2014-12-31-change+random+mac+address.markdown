---
layout: post
title:  "Меняем MAC-адрес сетевого устройства на случайный"
meta_description: "Инструкция по смене MAC-адреса сетевого устройства на случайный при каждой загрузке, либо вручную"
date:   2014-12-31 12:15:00
categories: article
tags: mac wifi security
---

## Необходимое ПО

Для *смены MAC-адреса* обычно используется macchanger:

```
$ sudo apt-get install macchanger
```

## Разовая смена адреса

Можно посмотреть текущие адреса:

```
$ /sbin/ifconfig | grep HWaddr
eth0      Link encap:Ethernet  HWaddr c4:ba:e9:45:d0:0b
wlan0     Link encap:Ethernet  HWaddr e2:0c:b6:44:b6:eb
```

Перед сменой адреса необходимо убить все процессы, которые используют сетевую карту (возьмём для примера интерфейс eth0). Проще всего выключить временно интерфейс и произвести смену:

```
$ sudo ifconfig eth0 down
$ sudo macchanger -r eth0
$ sudo ifconfig eth0 up
```

NB! Имейте в виду, если действия производятся по SSH, то вы потеряете связь  с компьютером; при удалённой работе лучше использовать способ со сменой MAC-адреса при загрузке (описан ниже).

Повторно проверяем:

```
$ /sbin/ifconfig | grep HWaddr
eth0      Link encap:Ethernet  HWaddr c5:bb:e0:14:d2:1b
wlan0     Link encap:Ethernet  HWaddr e2:0c:b6:44:b6:eb
```

адрес должен измениться.

## Смена адреса при каждой загрузке системы

Создадим скрипт **/etc/network/if-pre-up.d/macchanger** со следующим содержимым:

```
#!/bin/sh

/usr/bin/macchanger -r "$IFACE"
```

Сделаем скрипт исполняемым:

```
chmod +x /etc/network/if-pre-up.d/macchanger
```

Теперь при загрузке системы все сетевые интерфейсы будут иметь не повторяющиеся случайные адреса.
