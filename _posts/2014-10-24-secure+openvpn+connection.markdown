---
layout: post
title:  "Не пропускаем трафик мимо OpenVPN"
meta_description: "Инструкция по настройке OpenVPN и IPtables для запрета исходящего трафика при внеплановом отключении VPN"
date:   2014-10-24
tags: openvpn secure screen ufw
categories: article
---

[OpenVPN](https://openvpn.net/) - относительно безопасный инструмент, но лишь при его правильном использовании.

Дело в том, что запуская OpenVPN он не блокирует (и не шифрует) трафик, который может пройти мимо vpn в случае, если ваш сервер vpn по каким-то причинам стал недоступен, либо у вас временно пропала связь. Для того чтобы обезопасить отправляемую и принимаемую информацию необходимо настроить фаервол на стороне клиента таким образом, дабы ему можно было отправлять и принимать пакеты лишь с одного и на один сервер, то есть лишь на ваш vpn-сервер, все остальные подключения должны отсекаться.

## Настраиваем iptables

Cоздаём файл со следующим содержанием:

```
*filter
:INPUT DROP [145:11482]
:FORWARD DROP [0:0]
:OUTPUT DROP [18518:3426455]
-A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A OUTPUT -d XXX.XXX.XXX.XXX/32 -p tcp -j ACCEPT
-A OUTPUT -d XXX.XXX.XXX.XXX/32 -p udp -j ACCEPT
-A INPUT -i lo -j ACCEPT
-A OUTPUT -o tun0 -j ACCEPT
-A OUTPUT -o tun1 -j ACCEPT
COMMIT
```
Где **XXX.XXX.XXX.XXX** - адрес VPN-сервера.<br>

Кладём его например в **/etc/openvpn/iptables.rules**.

**NB!** обратите внимание на то, нет ли в вашем iptables каких-либо правил по команде `iptables-save`, если есть - добавьте в конфиг, иначе они затрутся; либо перепишите правила командами **iptables**

## Настраиваем ufw

Если вдруг вы вместо iptables [используете ufw](/article/ufw+firewall/), то вам необходимы следующие правила:

```
# ufw default deny incoming
# ufw default deny outgoing
# ufw allow out on XYZ to XXX.XXX.XXX.XXX
# ufw allow out on tun0
# ufw enable
```

Где **XYZ** - виртуальный интерфейс вашей сетевой карты (например **wlp3s0**, или **eth0**), а **XXX.XXX.XXX.XXX** - адрес вашего VPN-сервера.

## Пишем удобные скрипты запуска OpenVPN

По тому же адресу создаём скрипт **/etc/openvpn/vpn_up.sh**:

```bash
#!/bin/sh

# подгружаем правила
iptables-restore </etc/openvpn/iptables.rules # если у вас ufw - не пишем эту строчку
# запускаем openvpn в screen (если его нет, то ставим, либо используем nohup)
screen -dmS openvpn --config /etc/openvpn/config.ovpn
```

Где **/etc/openvpn/config.ovpn** - путь к вашему конфигу.

## Запускаем OpenVPN при загрузке системы

Добавляем в файл **/etc/rc.local** запуск скрипта:
```
...
/bin/sh /etc/openvpn/vpn_up.sh
...
```
## Смотрим статус/отключаем OpenVPN

Бывают ситуации когда OpenVPN перестаёт работать и необходимо посмотреть что произошло, либо его вообще необходимо отключить.

Логинимся под root и заходим в screen:

```bash
$ sudo su
# screen -x openvpn
```

Смотрим всё ли в порядке, если что - отключаем по сочетанию Ctrl+C.

Но поскольку фаерволл по-прежнему не пропускает трафик мимо VPN - его необходимо отключить.

Если это **iptables**, то создаём скрипт **~/.bin/iptables_flush**:

```
#!/bin/sh

echo "Stopping firewall and allowing everyone..."
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

```

и выполняем его.

Если это **ufw** - выполняем `ufw disable`.
