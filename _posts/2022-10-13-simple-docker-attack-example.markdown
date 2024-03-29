---
layout: post
title:  "Простой пример атаки на docker"
meta_description: "Многие разработчики делают эту ошибку, пуская docker у себя на локальном компьютере. Дампим базы из локалки и учимся, как пускать контейнеры правильно"
date: 2022-10-13
tags: linux docker 
categories: article
author: "soko1"
---

Многие люди по какой-то причине пускают docker у себя на локальном компьютере с очень уязвимыми параметрами, на которые никто не обращает внимание. Наверное, думают, что локальный компьютер это не страшно. Я хочу продемонстрировать как использовать эту уязвимость, чтобы ты проверил свой компьютер и устранил брешь в безопасности и помог другим ее устранить, скинув линк на статью.

### Примеры двух уязвимостей

Часто ли ты встречал в доках в интернете примерно такой пример развертывания PostgreSQL:

```
docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:10
```

?

Тут есть две серьезные ошибки. 

Первая - дефолтный пароль, который даже брутфорсить не нужно. Используй **всегда** рандомный пароль, сгенерированный какой-нибудь специальной софтиной, даже если это локальный компьютер. Например, pwgen:

```
$ pwgen 20
bohz5aa9aetoh1Iapedo doow7AiX5amai8aemewe aideiL3ooreexaiquae8
paPheeFu4aekeiDoocaa sheiloon6xuedeWoongi hoodoh4Eey1gaibahRei
iGheesie5seetieH2quo iNgei8eethie9yethecu Thie9kae9fae5eej1quu
soCiakikahngoo1sheiM re4Ea0eiph5Roo7ohCei eyar3aegeigerango6To
shanguoPh9fieFoh4te8 Leo3aen4tir3ahzeishi eewi7Haig1leeVei1oog
```

Вторая серьёзная брешь в безопасности — параметр **-p 5432:5432**. Именно о ней мы сегодня и поговорим.

### Ищем уязвимость с 0.0.0.0

Давай посмотрим, сколько потенциально уязвимых приложений запущено у тебя на компе. Запусти все свои контейнеры в docker и выполни команду:

```
$ docker ps | grep 0.0.0.0
b028f8e80d3f   postgres:10   "docker-entrypoint.s…"   21 minutes ago   Up 1 second   0.0.0.0:5432->5432/tcp   angry_aryabhata
```

Если список пуст, то всё хорошо. Если что-то вывелось - беда.

Понимаешь ли ты, что такое IP 0.0.0.0? Это адрес специального назначения, цель которого - принимать соединения **с любого сетевого интерфейса**. 
Это значит, что ты пускаешь порт PostgreSQL на **все сетевые адреса** своего компьютера. 

Если в твоем компе нет вайфая и эзернета, он стоит в шкафу, и ты никогда не планируешь выходить с его помощью в онлайн, то нет никаких проблем.
Но скорее всего он подключен к интернету, и тогда ты либо светишь портами докера наружу (что есть самый плохой из вариантов), либо - в локальную сеть со своим (чужим??) роутером.

Если со внешкой всё понятно, то проблема локальной сети для некоторых может быть не очевидной. Про это и поговорим.

### Дампим базы постгреса с локальной сети

Допустим, ты подключен к общей с Васей wifi-сети. Вася берет и сканирует весь пулл адресов вашего вайфая (например, 192.168.1.1-255) — находит твой айпи 192.168.1.3 и видит на нём открытый порт постгреса 5432. Пробует законнектится:

```
$ psql -U postgres -h192.168.1.3

psql (10.21 (Debian 10.21-1.pgdg90+1))
Type "help" for help.

postgres=#
```

Теперь делает всё тоже самое, но уже с **pg_dump**. И все твои базы у него в кармане.

### Еще одна неочевидная и очень стрёмная проблема

Хочешь еще прикол один расскажу? Ты можешь думать, что никогда не коннектишься к чужим вайфаям, твой вайфай дома сильно защищен (кстати, не верю, такого не бывает), и ты никому не говоришь пароля — но скорее всего ты когда-нибудь да пользуешься VPN! А это значит, что ты коннектишься в общую локальную сеть своего VPN-провайдера, а 0.0.0.0 в докере раздает доступ к порту 5432, в том числе в эту сеть! А значит, и другие юзеры этого VPN могут сдампить твою базу.

### Как правильно создавать контейнеры

На примере того же PostgreSQL:

```
$ docker run -e POSTGRES_PASSWORD=bohz5aa9aetoh1Iapedo -p 127.0.0.1:5432:5432 postgres:10
```

Никогда, слышишь, НИКОГДА не используй 0.0.0.0 (**-p 5432:5432**). Пускай все свои приложения сугубо на локалхосте, вот так: **-p 127.0.0.1:5432:5432**. 

И переодически делай проверку на 0.0.0.0 во избежание утечек:

```
$ docker ps | grep 0.0.0.0
```