---
layout: post
title:  "SSH доступ в chroot-окружение"
meta_description: "Создаём для пользователя доступ к ssh в изолированном от основной системы chroot-окружении. Сначала максимально урезанный вариант, потом раскатим туда gentoo linux"
date: 2022-10-15
tags: linux ssh chroot 
categories: article
author: "soko1"
---

Однажды мне понадобилось создать подруге доступ к серверу, но не хотелось давать ей возможность рыться в каталогах сервера. 
И я начал размышлять о том, как это можно реализовать. Да, можно ограничить доступ к определенным каталогам, но всё равно есть базовые вещи вроде **/etc/passwd**, доступ к которым не закроешь. Да и если хранится критически важная инфа на сервере, то достаточно найти уязвимый компонент в ОС, применить эксплоит и получить root. Я решил усложнить эту задачу, засунув юзера дополнительно в chroot какого нибудь еще дистриба :)


### Чтобы не запутаться в рекурсиях

Теперь давай договоримся об обозначениях:

**myserver#** - сервер на котором мы будем организовывать чрут<br>
**chroot#** - собственно сам чрут на сервере<br>
**notebook$** - мой комп с которого я логинюсь к чруту и серверу<br>

### Создаём юзера 

Сначала всё стандартно:

```
myserver# adduser test
```

Потом надо немного пошаманить с правами доступа:

```
myserver# chown root:root /home/test
myserver# chmod 0755 /home/test
```

Если вдруг потом потребуется вход по ключу, то права должны быть такие:

```
myserver# mkdir /home/test/.ssh
myserver# echo 'ключик_для_входа' > /home/test/.ssh/authorized_keys
myserver# chown -R test:test /home/test/.ssh
```

### Шаманим с Сашкой

В конец файла **/etc/ssh/sshd_config** прописываем строчки:

```
Match User test
ChrootDirectory /home/test
```

Не забываем перезапустить:

```
myserver# systemctl restart sshd
```

### Готовим чрут

#### Урезаем до минимума

Можно вообще юзеру запретить всё кроме того что ему должно быть доступно. 
К примеру, ограничим пользователя оболочкой баша и бинарником **/bin/ls**.

Сначала смотрим от каких либ зависит наши бинарники:

```
myserver# ldd /bin/ls
        linux-vdso.so.1 (0x00007ffd40ede000)
        libselinux.so.1 => /lib/x86_64-linux-gnu/libselinux.so.1 (0x00007fb098aa1000)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007fb0986b0000)
        libpcre.so.3 => /lib/x86_64-linux-gnu/libpcre.so.3 (0x00007fb09843f000)
        libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007fb09823b000)
        /lib64/ld-linux-x86-64.so.2 (0x00007fb098eeb000)
        libpthread.so.0 => /lib/x86_64-linux-gnu/libpthread.so.0 (0x00007fb09801c000)

myserver# ldd /bin/bash
        linux-vdso.so.1 (0x00007fff881a3000)
        libtinfo.so.5 => /lib/x86_64-linux-gnu/libtinfo.so.5 (0x00007fa973cdc000)
        libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007fa973ad8000)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007fa9736e7000)
        /lib64/ld-linux-x86-64.so.2 (0x00007fa974220000)
```

Далее создаем структуру аналогичную хостовой машине:

```
myserver# cd /home/test
myserver# mkdir -p lib/x86_64-linux-gnu/ lib64 bin
```

Копируем бинарники:

```
myserver# cp /bin/bash /bin/ls /home/test/bin
```

Копируем библиотеки:

```
myserver# cp /lib/x86_64-linux-gnu/{libselinux.so.1,libc.so.6,libpcre.so.3,libdl.so.2,libpthread.so.0,libtinfo.so.5} /home/test/lib/x86_64-linux-gnu/
myserver# cp /lib64/ld-linux-x86-64.so.2 /home/test/lib64
```

Пробуем залогиниться:

```
notebook$ ssh test@myserver
...
chroot$ ls
bin  lib  lib64
chroot$ uname
-bash: uname: command not found
chroot$
```

Задача выполнена. По такой же аналогии копируем нужные бинари и получаем максимально кастрированную chroot-систему.

Еще иногда для полноценной работы бывает нужно создать какие нибудь девайсы, например:

```
myserver# mkdir /home/test/dev && cd /home/test/dev
myserver# mknod -m 666 random c 1 8
myserver# mknod -m 666 zero c 1 5
myserver# mknod -m 666 tty c 5 0
myserver# mknod -m 666 null c 1 3
```

#### Ставим полноценный дистриб

Ну а если по какой-то причине нужен полноценный линукс, то можно поставить совершенно любой. Главное чтобы архитектура была той же что и в хостовой системе.

Мне захотелось привести пример с gentoo linux. 

Посколько долго старые снапшоты генты не залёживаются, то и приводить прямого линка не буду. 
Заходим [сюда](https://mirror.ps.kz/gentoo/pub/releases/amd64/autobuilds/current-stage3-amd64-systemd/) и качаем tar.xz-архив (у меня это был **stage3-x32-openrc-20221009T170545Z.tar.xz**), кладём его в директорию **/home/test** и распаковываем:

```
myserver# cd /home/test
myserver# tar -xf stage3-x32-openrc-20221009T170545Z.tar.xz
myserver# ls
bin  boot  dev  etc  home  lib  lib64  libx32  media  mnt  opt  proc  root  run  sbin  stage3-x32-openrc-20221009T170545Z.tar.xz  sys  tmp  usr  var
```

Далее если мы приконнектимся, то получим упилинный в системном смысле, но не лишенный никаких бинарников дистрибутив:

```
notebook$ ssh test@myserver
...
chroot$ uname -a
Linux pentest 4.15.0-176-generic #185-Ubuntu SMP Tue Mar 29 17:40:04 UTC 2022 x86_64 GNU/Linux
chroot$ df -h
df: cannot read table of mounted file systems: No such file or directory
```

То есть в нем можно выполнять огромное кол-во необходимых задач, но взаимодействовать с ОС полноценно нельзя. 

Теперь сделаем работу с ОС в чруте практически идеальной. Прошу заметить, что при этом основная хостовая система станет менее безопасной.

Для начала фиксим права доступа, чтобы юзер **test** стал рутом в своем чруте:

```
myserver# chown -R test:test /home/test/*
```

Далее монтируем в чрут основные хостовые линуксовые ФС:

```
myserver# cd /home/test
myserver# mount -o bind /proc proc
myserver# mount -o bind /sys sys
myserver# mount -o bind /dev dev
myserver# mount -o bind /run run
```

Заходим, пробуем:

```
notebook$ ssh test@myserver
chroot$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            2.0G     0  2.0G   0% /dev
tmpfs           395M   41M  355M  11% /run
```

Задача выполнена!

### Немного включаем фантазию

Все эти уловки можно использовать и для другого рода задач. Например, у тебя есть сервер и ты хочешь иметь несколько дистрибов линукса на нём.

Создай несколько юзеров и поставь каждому свой дистриб. Например, юзера kali с kali linux для пентеста. 

Хотя с другой стороны всё тоже самое можно сделать и руками через root+chroot, или вообще в  docker (работая с докер не забывай [об этой ошибке](https://cryptopunks.org/article/simple-docker-attack-example/)). Но и такой способ тоже имеет право на существование!

Если вдруг тебе пришла еще какая нибудь мысль в голову как это можно использовать, то пиши [на почту](/contacts), или в комментарии к этой статье в телеграм [@cryptopunksorg](https://t.me/cryptopunksorg).
