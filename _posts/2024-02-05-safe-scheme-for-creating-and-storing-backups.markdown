---
layout: post
title:  "Безопасная схема бэкапов СУБД"
meta_description: "Рассказываю о том как создать безопасную и удобную инфраструктуру для снятия бэкапов с СУБД"
date: 2025-02-05
tags: linux backups gpg postgresql mysql
categories: article
author: "soko1"
---

Я много лет ломал голову над тем как сделать бэкапы удобными и при этом безопасными. Уже давно вынашивал один вариант, но всё время что-то не устраивало в нём. И лишь недавно я открыл одну особенность у GnuPG, которая мне позволила осуществить давнюю мечту. 

## Кратко о схеме

Допустим, есть много серверов с базами данных и всякими другими важными файлами, которым необходимо переодически делать резервную копию. 

Идея в следующем: мы создаем одну независимую VPS и даем ей доступы ко всем нашим серверам по SSH под отдельным юзером и без доступа к шеллу (нужен только форвард портов). Она копирует к себе необходимые файлы, снимает дампы, шифрует всё это нашим публичным ключиком gpg и заливает зашифрованные файлы в облако, либо в специальное хранилище.


## Алгоритм сжатия Zlib

GPG как оказалось шифруя файлы предвартельно их сжимает, по дефолту это алгоритм сжатия zlib. И процесс сжатия весьма неплох, но больше всего поражает скорость! Ранее я делал **pg_dump** и через pipe пускал bzip2 и только потом шифровал gpg. Но оказалось что часть с bzip2 можно пропустить, потому что gpg прекрасно сожмет текстовый дамп ничуть не хуже bzip2, но при этом быстрее в раз 10! На дохлой впске 50 гиговые текстовые бекапы сжались и зашифровались gpg менее чем за 10 минут. То есть получается это минус один бесполезный, долгий и трудозатратный шаг. А значит если инфраструктура не сильно большая, то можно обойтись дешманской VPS'кой для снятия и шифрования бекапов.

## Готовим ключ GPG

Тут всё просто. Генерируем на своей личной машине пару ключей (если их еще у тебя нет, конечно):

```
macbook $ gpg --full-generate-key
gpg (GnuPG) 2.3.8; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (9) ECC (sign and encrypt) *default*
  (10) ECC (sign only)
  (14) Existing key from card
Your selection? 1
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 5y
Key expires at Tue Nov  9 16:15:50 2027 +04
Is this correct? (y/N) y

GnuPG needs to construct a user ID to identify your key.

Real name: Cryptopunks
Email address: meow@cryptopunks.org
Comment:
You selected this USER-ID:
    "Cryptopunks <meow@cryptopunks.org>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
```

Приватному ключу обязательно задаём криптостойкий пароль!

Далее экспортируем **публичную часть** ключа:

```
macbook $ gpg --list-keys
pub   rsa4096 2022-11-10 [SC] [expires: 2027-11-09]
      09C4C85DFC551EA1C582849AD2E40C9B90FA7366
uid           [ultimate] Cryptopunks <meow@cryptopunks.org>
sub   rsa4096 2022-11-10 [E] [expires: 2027-11-09]

$ gpg --export -a 09C4C85DFC551EA1C582849AD2E40C9B90FA7366 > public.key
```

## Подготовка VPS и серверов

Чтобы далее не запутаться давай введем обозначения:

**backups-vps** - это машина, которая будет ходить на сервера и собирать бэкапы. На ней же будут публичные ключи GPG для шифрования дампов.
**prod** - пример сервера с PostgreSQL на который будет ходить наша машинка backups-vps и собирать бэкапы.


### Импортируем публичный ключик 

Первым делом копируем с личной машины ранее сгенерированный публичный ключ на backups-vps. Далее импортируем его:

```
backups-vps # gpg --import public.key
gpg: key D2E40C9B90FA7366: public key "Cryptopunks <meow@cryptopunks.org>" imported
gpg: Total number processed: 1
gpg:               imported: 1
```

### Готовим вход по ключу для ssh 

Генерируем на backups-vpn RSA-ключ для входа по ssh на prod:

```
backups-vps # ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/var/root/.ssh/id_rsa):
Created directory '/var/root/.ssh'.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /var/root/.ssh/id_rsa
Your public key has been saved in /var/root/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:FiLis7/dfh2oXpGF+sZkfhJkn2cuCh1YI8ZuFpUf74c root@MacBook-Pro-lesha.local
The key's randomart image is:
+---[RSA 3072]----+
|          ..     |
|       . ....    |
|  . . . * *..o   |
| . . . + X =...  |
|  o     S B.o.o. |
|   o   + B.+.+E .|
|  .     ..O.o... |
|   . . ..+.+..   |
|    o..o+..      |
+----[SHA256]-----+
```

Предположим, что нам необходимо снимать дамп с СУБД PostgreSQL на prod. 

Логинимся на сервер prod, создаём отдельного юзера **backups** с шеллом **/bin/false**, т.к. шелл ему не нужен, мы прокинем лишь порты необходимые:

```
prod # adduser -s /bin/false backups
```

Добавляем ключ для логина с vps'ки:

```
prod # mkdir /home/backups/.ssh
prod # chmod 700 /home/backups/.ssh
prod # vim /home/backups/.ssh/authorized_keys (сюда пишем содержимое **id_rsa.pub** из backups-vpns)
prod # chmod 600 /home/backups/.ssh/authorized_keys
prod # chown backups:backups -R /home/backups/
```

## Создаем ssh-туннель 

Поскольку СУБД висит обычно на локалхосте (или в докер-сети, например), а не на внешнем интерфейсе - к нему нельзя обратиться напрямую, поэтому необходимо создать туннель. Для этого на backups-vps создадим скрипт **/root/tunnel.sh** примерно такого содержания:

```
#!/bin/sh

# prod postgresql
nc -z 127.0.0.1 6661

if [ $? -eq 0 ]; then
		echo 'Ok'
	else
	ssh -N -L 127.0.0.1:6661:192.168.100.28:5432 backups@prod &
fi


###
аналогичным образом прописываем другие сервера/порты
###

# prod mysql
# nc -z 127.0.0.1 6662

# if [ $? -eq 0 ]; then
#	      echo 'Ok'
#	else
#	      ssh -N -L 127.0.0.1:6662:192.168.100.22:3306 backups@prod &
# fi
```

Этот скрипт создаст на локалхосте backups-vpn порт 6661, который будет прокидывать порт 5432 на локальном айпи 192.168.100.28 у сервера prod.

Следующий шаг - надо зайти на новый сервер руками, для того чтобы записать fingerprint и проверить все ли ок с ключом:

```
backups-vps # ssh backups@prod
...
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
...
```

Аналогичным образом можно создать туннели для других серверов в этом скрипте, если серверов СУБД несколько (и не забыть про ручной вход при первом использовании!).

Теперь тестово запускаем скрипт:

```
backups-vps # ./tunnel.sh
Ok
```

Проверяем через `telnet localhost 6661` и если все ок, значит скрипт работает как надо.

Коннект рано или поздно отвалится, поэтому вызов скрипта нужно добавить в crontab:

```
backups-vps # cronta -e
*/5 * * * * /root/tunnel.sh
```

## Первый бэкап базы и шифрование ее GPG

Можно попробовать снять дамп и зашифровать его ключами GPG:

```
pg_dump -h127.0.0.1 -p6661 -Upostgres -d finance |  gpg -e -r cryptopunks -r myfriend -o finance.gpg
```

Таким образом я сниму базу **finance** с сервера **prod** через сервер **backups-vps**, сожму ее и зашифрую ключами GPG **cryptopunks** и **myfriend**.

## Как расшифровать базу

Для этого сливаем **finance.gpg** с сервера backups-vps на компьютер где у нас находится приватный ключ cryptopunks созданный ранее и выполняем команду:

```
gpg -d finance.gpg > finance.sql
```

## Важные слова о безопасности VPS, приватных ключах и бэкапах

VPS эту надо защитить всеми возможными способами, потому что на ней будут доступы ко всему. Поэтому VPS берём у проверенного провайдера (а лучше - хостим у себя), ничего кроме ssh/gpg/pg_dump/mysqldump на ней не держим, все порты кроме SSH фаерволлом закрываем, авторизацию по паролю убираем, по возможности шифруем ей диск. На приватный ключ SSH впски ставим сложный пароль (вводим его каждый раз после перезагрузки через ssh-agent). 

Приватный ключ GPG на ней не храним ни в коем случае. Храним ключ на зашифрованной флешке и используем его на отдельном компьютере без интернета. 

На VPS проливаем лишь публичную часть ключа, которой будем шифровать бэкапы. Лучше добавить два ключа. Свой и человека, которому доверяешь (это может быть, например, коллега). Шифрованные же бекапы лучше хранить в двух разных местах и даже у разных хостеров.

По возможности никому не даем доступы на эту машину! Если людям нужны эпизодически бэкапы, то открываем им доступ **к другому серверу**, на который эти зашифрованные бэкапы переодически заливаются.


## Плюсы данного подхода

1. бэкапы храняться на отдельном сервере и их сложно удалить/модифицировать/украсть
2. для снятия бэкапов не требуется доступ к серверу с бэкапами, потому что он сам за ними ходит куда надо
3. бэкапы шифруются стойкими алгоритмами шифрования
4. на сервере бэкапов нет ключей для их расшифровки
5. можно с сервера бэкапов организовать распределение резервных копий на другие сервера и облака
6. можно распределять доступы к базам разным людям, шифруя бэкапы нужными ключами конкретных юзеров
7. не требовательно к ресурсам

## Минусы данного подхода

1. получив доступ к этой впс человек получит доступ ко всем серверам с которых эти резервные копии собираются
2. с доступом к ней можно прокинуть совершенно любой открытый порт с удаленного сервера через ssh


И да, всем привет после очень долгого затишья ;)