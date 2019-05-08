---
layout: post
title:  "Автоматически принимаем все критические обновления в Debian/Ubuntu"
meta_description: "Учим Debian/Ubuntu принимать критические обновления самостоятельно"
date:   2014-09-30
tags: debian security updates ubuntu
categories: article
---

Для того чтобы все ваши компьютеры на базе Debian/Ubuntu автоматически принимали критические обновления в безопасности самостоятельно поставьте следующие пакеты:

```
$ sudo apt-get install unattended-upgrades apt-listchanges
```

И ответьте утвердительно на команду:

```
$ sudo dpkg-reconfigure -plow unattended-upgrades
```
