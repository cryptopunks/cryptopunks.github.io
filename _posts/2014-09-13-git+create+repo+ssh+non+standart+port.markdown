---
layout: post
title:  "Создание git-репозитория на нестандартном порту SSH"
meta_description: "Инструкция по настройки с примерами"
date:   2014-09-13 01:01:00
tags: ssh git
categories: article
---

Создаём отдельного пользователя на сервере (если необходимо):

`# useradd -m -s /bin/bash -d /home/git git`

Логинимся:

`# su git`

Создаём каталог для будущего репозитория:

`$ cd; mkdir repo1`

Создаём репозиторий на который будут приходить коммиты:

`$ cd repo1; git --bare init`

На клиенте если репозиторий уже создан в корне выполняем:

`$ git remote add origin ssh://git@XXX.XXX.XXX.XXX:PORT/home/git/repo1`

Если репозитория ещё нет - клонируем его с сервера:

`$ git clone ssh://git@XXX.XXX.XXX.XXX:PORT/home/git/repo1`
