---
layout: post
title:  "Безопасное хранение ключей OpenVPN на сервере без шифрованного диска"
meta_description: "Шифруем область с закрытыми ключами OpenVPN, или любую другую ценную информацию на чужом сервере"
date:   2015-08-03 12:49:00
categories: article
tags: openvpn vps secure keys luks
---

## Описание проблемы

Обычно <a href="/article/secure+openvpn+installer/" target="_blank">при создании OpenVPN-сервера</a> используется дешёвая VPS (Virtual Private Server) без какого-либо дискового шифрования. <br>
Опасность заключается в том, что если ваш трафик писался и VPS конфисковали - расшифровать его не составит особого труда.
Помимо этого ключи может украсть владелец сервера у которого вы купили VPS и начать "слушать" ваш трафик в реальном времени.<br>
Поскольку дисковое шифрование в бюджетных вариантах аренды серверов недоступно - можно воспользоваться шифрованными контейнерами.

Необходимо знать, что большинство vps администратор сервера может спокойно смонтировать в момент когда ваша виртуалка работает и скопировать все необходимые ключи, шифрование контейнера в данном случае ничего не решит. Поэтому дополнительно рекомендуется шифровать ключ openvpn-сервера паролем в процессе его генерации.

## От теории к практике

Существует множество вариантов, но лучшим является **LUKS** (как альтернатива - менее надёжный и медленный вариант **encfs**).

Для начала создаём luks-контейнер по <a href="/article/awesome+truecrypt+alternative+for+linux/" target="_blank">этому мануалу</a>, должно хватить контейнера объёмом 5Мб.

Монтируем его например в **/mnt/data**:

```
$ sudo cryptsetup luksOpen /root/encrypt_data decrypt_data
$ sudo mount /dev/mapper/decrypt_data /mnt/data
```

Останавливаем **openvpn**:

`$ sudo systemctl stop openvpn`

Копируем содержимое **/etc/openvpn** в контейнер:

`$ sudo cp -rpv /etc/openvpn /mnt/data`

Чистим основной каталог:

`$ sudo rm -r /etc/openvpn/*`

Выключаем контейнер:

```
$ sudo umount /mnt/data
$ sudo cryptsetup luksClose /dev/mapper/decrypt_data
```

Отключаем автостарт openvpn при загрузке:

`sudo systemctl disable openvpn`

Создаём скрипт **/root/run.sh** следующего содержания:

```
#!/bin/sh

cryptsetup luksOpen /root/encrypt_data decrypt_data
mount /dev/mapper/decrypt_data /mnt/data
mount --bind /mnt/data/openvpn /etc/openvpn
systemctl start openvpn
```

Туда же кстати можно скопировать и всякие другие секретные данные, например ключи **~/.ssh**, **~/.gnupg** и добавить в скрипт:

```
mount --bind /mnt/data/.ssh /root/.ssh
mount --bind /mnt/data/.gnupg /root/.gnupg
```

Остаётся лишь после каждой перезагрузки VPS запускать скрипт и вводить пароль от криптоконтейнера.<br>
Ну и конечно не забываем про бекапы, которые сейчас делать ещё проще: лишь один скрипт **run.sh** и файлик с контейнером.
