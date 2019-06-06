---
layout: post
title:  "Автоматическое обновление Wordpress"
meta_description: "Краткая информация о том как автоматизировать процесс обновления Wordpress с помощью инструмента wp-cli"
date:   2016-07-20
tags: wordpress wp-cli update crontab
categories: article
---

## О Wordpress

[Wordpress](https://wordpress.org/) - самый популярный бесплатный блоговый движок и, соответственно, один из самых часто ломаемых. Для лучшей защиты его необходимо постоянно обновлять, но ещё важнее обновлять плагины, т.к. обычно именно в них находят серьёзные уязвимости.<br>
Если сайт один, то особых сложностей ручное обновление не вызовет, но если сайтов много, то логиниться каждый раз в админку каждого из сайтов и производить монотонные действия - сомнительное удовольствие.

## Инструмент wp-cli

[wp-cli](http://wp-cli.org/) - инструмент, который позволяет управлять Wordpress из консоли.
А именно:

* Скачивать свежую версию Wordpress
* Устанавливать плагины/темы
* Активировать/деактивировать плагины/темы
* Обновлять ядро Wordpress/плагинов/тем
* Создавать запросы к БД
* Производить бекап БД/файлов Wordpress
* Управлять записями/пользователями
* ...и многое другое (весь список доступных команд по `wp help`)

Но сегодня поговорим лишь об обновлении CMS и установленных в ней плагинов.

## Установка wp-cli

```
$ curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
$ chmod +x wp-cli.phar
$ sudo mv wp-cli.phar /usr/local/bin/wp
```

## Автоматизация обновления Wordpress и плагинов

Переходим в каталог с установленным Wordpress:

`$ cd /home/site1/wordpress/`

Обновляем ядро WP:

`$ wp core update`

Обновляем БД, если требуется:

`$ wp core update-db`

Обновляем все установленные плагины:

`$ wp plugin update --all`

Если всё выполнилось без ошибок, то формируем скрипт **/root/wordpress_update.sh**:

```
#!/bin/sh

SITES="/home/site1/wordpress /home/site2/wordpress /home/site3/wordpress"

for site in $SITES; do
  cd $site
  wp core update
  wp core update-db
  wp plugin update --all
done
```

Запускаем и если ошибок не возникло - формируем crontab-правило следующего содержания:

```
$ crontab -l
@daily /root/wordpress_update.sh
```

Теперь все установленные вордпрессы и плагины будут обновляться ежедневно.
