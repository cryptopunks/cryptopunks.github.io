---
layout: post
title:  "Генерируем произвольный адрес onion-домена в TOR"
date:   2015-09-01 23:49:00
categories: article
tags: tor secure onion hosting forward
meta_description: "Подбираем необходимые варианты из случайностей для будущего onion-ресурса и подсчитываем приблизительные временные затраты"
---

## Борьба со "страшными" адресами TOR

При <a href="/article/create-onion-resource-in-tor/" target="_blank">создании ресурсов в сети TOR</a> генерируется хеш на базе случайносозданного ключа, который лежит в директории указанной в параметре **HiddenServiceDir** конфига **torrc** и служит доменом ресурса, имея довольно неприятный вид вроде **2rdccn3g5pz3vy7s.onion**. Эту проблему можно по крайней мере частично решить, сгенерировав нужную комбинацию символов, выбирая варианты из случайностей.

## Примерное время

При сегодняшних средних мощностях процессоров первые 1/2/3/4/5/6-символов подбираются довольно быстро (от миллисекунд до получаса).<br>
Вот таблица соответствий для процессора 1.5Гц:


|  символы   |  примерное время   |
|:----------:|:------------------:|
|         1  |   менее 1 секунды  |
|         2  |   менее 1 секунды  |
|         3  |   менее 1 секунды  |
|         4  |   2 секунды        |
|         5  |   1 минута         |
|         6  |   30 минут         |
|         7  |   1 день           |
|         8  |   25 дней          |
|         9  |   2.5 года         |
|        10  |   40 лет           |
|        11  |   640 лет          |
|        12  |   10 тыс. лет      |
|        13  |   160 тыс. лет     |
|        14  |   2.6 млн. лет     |


## Использование mkp224o

Получаем последнюю версию:

```
$ git clone https://github.com/cathugger/mkp224o
```

Собираем:

```
$ sudo apt install gcc libc6-dev libsodium-dev make autoconf
$ cd mkp224o
$ ./autogen.sh
$ ./configure
$ make
```

Далее запускаем `./mkp224o` без аргументов чтобы ознакомиться со справкой по аргументам (более подробная на странице проекта).<br><br>

Теперь сгенерируем ключи с адресом **crypt** в начале:

```
$ ./mkp224o crypt
sorting filters... done.
filters:
	crypt
in total, 1 filter
using 16 threads
cryptqax2bfsch4asiq6diwgcqjahyojbr7awjih3vjmn7fcfui3tjid.onion
cryptyklb2ik3xmfsi5sz2leojzwesbgtcnvhqdm3j3hr6grtnobkdid.onion
cryptslp3iqcjwnkkhfkjvtoilj3bwnky4n572od23f33ilowwe56jyd.onion
cryptgotxkfltnxtssnmj6fxhajggzaczgczyj34jhek2tevphvbhlqd.onion
cryptkyv5fjd6mhwxnd5x347esjpnmmh5zk6hrnrq323kqeljv6xtdid.onion
cryptrie6y4iywq3ckkse3n5dli7ezgpp77h7fk7z2htepvdg6tj4did.onion
crypt7eq6e267jwtua2og55jatfpdvp4xaaa6s2nc46usw7cupisktad.onion
cryptni6j5beqdsi3mqo46lqnuucihbb7h22cc3p6grmyprr2vz5cqid.onion
...
```

Все варианты по умолчанию записываются в текущий каталог.

Далее необходимо скопировать ключи понравившегося домена в рабочий каталог TOR-сервиса. Например:

```
$ sudo cp -r cryptqax2bfsch4asiq6diwgcqjahyojbr7awjih3vjmn7fcfui3tjid.onion /var/lib/tor/site1
```

Прописывай в **/etc/tor/torrc**:

```
HiddenserviceDir /var/lib/tor/site1
HiddenServicePort 80 localhost:80
```

После чего перезапускай TOR:

```
$ sudo /etc/init.d/tor restart
```

Естественно, сервис тоже должен быть уже запущен на нужном хосте/порту (в нашем примере это **localhost:80**). 

Пробуй зайти из браузера на **cryptqax2bfsch4asiq6diwgcqjahyojbr7awjih3vjmn7fcfui3tjid.onion**. 

Если по каким-то причинам что-то пошло не так - проверь правильно ли скопировался ключ и верно ли выставлены права доступа к нему. 

