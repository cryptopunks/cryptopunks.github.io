---
layout: post
title:  "Заворачиваем в TOR и SSH любой сервис на примере IRC-сервера"
meta_description: "Инструкция по быстрому поднятию любого сервиса с использованием SSH и TOR для авторизации и анонимизации"
date:   2017-01-18
tags: linux ssh irc miniircd tor
categories: article
author: "soko1"
---

Данная статья – пример того, как в TOR и SSH можно "завернуть" любой сервис. Рассмотрим сей процесс на примере простого IRC-сервера.

В последнее время развелось огромное кол-во мессенджеров (читайте "программ" - сюда подойдёт почти всё), позиционирующие себя как надёжные и безопасные. Но, как известно, чем программный продукт сложнее, тем больше в нём ошибок. А порой и специально допущенных опечаток в коде, которые довольно сложно заметить и которыми, в свою очередь, могут пользоваться те кто про них в курсе. Поэтому следует это понимать и правильно расставлять приоритеты: удобство, функциональность, или безопасность. Поэтому всё что светит портами во внешний мир по определению не может быть безопасным.

Предлагаю следующее решение: простой IRC-сервер, запущенный с открытыми портами лишь на 127.0.0.1 сервера и форвардингом портов средствами SSH и TOR.

TOR в данной связке поможет:

1. дополнительно зашифровать трафик SSH
2. скрыть местоположение сервера
3. обойти NAT'ы (если они имеются)
4. анонимизировать пользователей

А SSH обеспечит безопасную авторизацию (желательно её организовать [по ключам](/article/secure+and+comfortable+ssh/)).

## Разворачиваем IRC-сервер

Программных решений для IRC-серверов огромное кол-во. Но я решил выбрать максимально легковесное и простое в настройке решение. А именно - <a href="https://github.com/jrosdahl/miniircd" target="_blank">miniircd</a>.

Качаем:

```
$ git clone https://github.com/jrosdahl/miniircd && cd miniircd
```

Это скрипт на python с рядом аргументов командной строки без каких-либо конфигурационных файлов:

```
$ ./miniircd --help
Usage: miniircd [options]

miniircd is a small and limited IRC server.

Options:
  --version             show program's version number and exit
  -h, --help            show this help message and exit
  --channel-log-dir=X   store channel log in directory X
  -d, --daemon          fork and become a daemon
  --debug               print debug messages to stdout
  --listen=X            listen on specific IP address X
  --log-count=X         keep X log files; default: 10
  --log-file=X          store log in file X
  --log-max-size=X      set maximum log file size to X MiB; default: 10 MiB
  --motd=X              display file X as message of the day
  --pid-file=X          write PID to file X
  -p X, --password=X    require connection password X; default: no password
  --password-file=X     require connection password stored in file X; default:
                        no password
  --ports=X             listen to ports X (a list separated by comma or
                        whitespace); default: 6667 or 6697 if SSL is enabled
  -s FILE, --ssl-pem-file=FILE
                        enable SSL and use FILE as the .pem certificate+key
  --state-dir=X         save persistent channel state (topic, key) in
                        directory X
  --verbose             be verbose (print some progress messages to stdout)
  --chroot=X            change filesystem root to directory X after startup
                        (requires root)
  --setuid=U[:G]        change process user (and optionally group) after
                        startup (requires root)
```

Можно запустить его с одним-единственным аргументом:

```
$ ./miniircd --listen=localhost
```

Таким образом он запускается на локалхосте сервера и снаружи никаких открытых портов не оставляет.

По необходимости можно добавить при запуске **miniircd** дополнительные ключи, например `--channel-log-dir`. Чтобы логи со всех каналов писались в необходимую директорию. Только имейте в виду, что логи чатов пишутся в открытом виде, и к ним можно получить доступ, если вскроют сервер. Поэтому рекомендую писать их на крипто-раздел, либо вообще не вести, а оставить локальное сохранение логов в irc-клиенте для удобства.

## Работа с SSH

### Настройка прав доступа

Создаём в конфиге sshd группу, которой разрешим лишь форвардить необходимый порт. Для этого добавим в конец конфига **/etc/ssh/sshd_config**:

```
Match Group securechat
   AllowTcpForwarding yes
   X11Forwarding no
   PermitTunnel no
   GatewayPorts no
   AllowAgentForwarding no
   PermitOpen localhost:6667
   ForceCommand echo 'This account can only be used for IRC'
```

Перезапустим демон sshd:

```
$ sudo /etc/ssh/sshd restart
```

Создадим новую группу:

```
$ sudo addgroup securechat
```

### Создание новых пользователей для чата

Создадим пользователя, которому будет решено пробрасывать лишь порт irc-демона, включив его в группу **securechat**:

```
$ sudo useradd -G securechat имя_пользователя
```

Зададим ему пароль:

```
$ sudo passwd имя_пользователя
```

но лучше настроить всё с использованием [авторизации по ключу](/article/secure+and+comfortable+ssh/).

### Проброс порта

У себя на компьютере выполняем:

```
$ ssh -f -N -L 6667:localhost:6667 user@remote_host
```

где **user** это пользователь которого создали выше, а **remote_host** - IP-адрес сервера с IRC. Теперь можем коннектиться любым IRC-клиентом (например, <a href="https://hexchat.github.io/" target="_blank">hexchat</a>) на **localhost/6667** (если вдруг **remote_host** без cтатического IP, либо за NAT - смотрим статью дальше до места про TOR).


## Дополнительная прослойка безопасности

Для большей безопасности можно запустить **miniircd** под отдельным пользователем, добавить использование ssl-сертификата и завернуть весь трафик в TOR.

Добавляем пользователя:

```
$ sudo useradd -m securechat
```

Переносим туда скрипт:

```
$ sudo su securechat
$ cd ~/ && git clone https://github.com/jrosdahl/miniircd && cd miniircd
```

Создаём сертификат:

```
$ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
$ cat cert.pem key.pem >server.pem
$ shred key.pem cert.pem && rm -f key.pem cert.pem
$ chmod 600 server.pem
```

Создаём скрипт запуска **/root/run_securechat.sh**:

```
#!/bin/sh
su - securechat -c 'cd /home/securechat/miniircd && ./miniircd --listen=localhost --ssl-pem-file=server.pem'
```

После чего [заворачиваем весь SSH-трафик в TOR](/article/create-onion-resource-in-tor/) (подзаголовок **Настройка TOR**).<br>
В этом случае даже выделенный IP не потребуется, достаточно будет лишь на клиенской машине запустить TOR и пробросить порт SSH следующим образом (обратите внимание, порт **6667** сменился на **6697**, т.к. мы добавили использование ssl в **miniircd**, в этом случае нужно поменять порт ещё и в **/etc/ssh/sshd_config** для группы **securechat**):

```
$ sudo apt install tor
$ sudo /etc/init.d/tor start
$ torify ssh -f -N -L 6697:localhost:6697 crptpnkdgddolfag.onion
```

где **crptpnkdgddolfag.onion** - адрес, который сгенерировался при настройке TOR [по статье приведённой выше](/article/create-onion-resource-in-tor/).

Ну и поскольку SSL-сертификат у вас самоподписанный, то скорее всего в клиенте IRC придётся указать игнорирование проверки подлинности сертификата.

Кроме того неплохо бы закрыть фаерволлом все порты кроме порта SSH, чтобы случайно не запустить **miniircd** без `--listen=localhost`. Например, про то как это сделать средствами UFW можно почитать [здесь](/article/ufw+firewall/).

## В заключениe

По такому принципу можно запускать и использовать почти любой сервис, пуская его на локальном порту (запрещая внешний) и организовывая авторизацию средством форвардинга портов SSH, используя дополнительную прослоку через TOR для обхода NAT'ов, скрытия нахождения и анонимизации использования.
