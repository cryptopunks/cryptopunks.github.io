---
layout: post
title:  "Создаем socks прокси-сервер с помощью openssh"
meta_description: "Создаем проксик и делимся им с друзьями и знакомыми для обхода блокировок"
date: 2020-08-22
tags: ssh socks proxy
categories: article
author: "soko1"
---


Давай создадим несколькими командами прокси-сервер и поделимся им знакомыми, чтобы они могли его использовать для обхода блокировок.

## Настройка сервера

На сервере нам необходим лишь **OpenSSH** из сервисов. 

Сначала создадим юзера и отключим ему шелл (ведь нам нужно лишь пробросить порт, в шелле необходимости нет):

```
# adduser socksuser --shell=/bin/false
```

Далее откроем порт, который будет светить наружу: 

```
# ssh -N -D 0.0.0.0:58923 socksuser@localhost
```

Вместо 58923 можно указать любую цифру от 1 до 65535.

Лучше, конечно, запускать эту команду сразу через tmux/screen, т.к. после закрытия консоли сервис отвалится. <br>
Приведу на всякий случай пример с tmux:

```
# tmux new-session -d -s "socksserver" "ssh -N -D 0.0.0.0:58923 socksuser@localhost" && tmux a
```

Всё, серверная часть готова. 

Но имей в виду, что в такой конфигурации порт 58923 будет доступен для всех и без авторизации!

## Настраиваем клиент

Тут всё просто. Почти в любой современной программе есть настройки proxy. Необходимо найти настройку с SOCKS5 и вписать туда внешний адрес твоего сервера и порт 58923. Либо вообще настроить прозрачный socks-прокси для всей системы глобально.

### Google chrome 

В некоторых программах настройка proxy запрятана очень глубоко. Например, в Google Chrome она указывается через аргумент командной строки **--proxy-server**. Приведу примеры запуска Google Chrome для Linux/MacOS/Windows.

Linux:

```
/usr/bin/google-chrome \
    --user-data-dir="$HOME/proxy-profile" \
    --proxy-server="socks5://ВНЕШНИЙ_IP:58923"
```

MacOS:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --user-data-dir="$HOME/proxy-profile" \
    --proxy-server="socks5://ВНЕШНИЙ_IP:58923"
```

Windows:

```
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" ^
    --user-data-dir="%USERPROFILE%\proxy-profile" ^
    --proxy-server="socks5://ВНЕШНИЙ_IP:58923"
```

Пути к бинарному файлу ес-но могут отличаться. Будет создан новый профиль браузера **proxy-profile**. Если необходим уже существующий - укажи его имя вместо **proxy-profile**.