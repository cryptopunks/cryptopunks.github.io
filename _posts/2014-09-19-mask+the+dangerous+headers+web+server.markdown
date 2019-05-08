---
layout: post
title:  "Маскируем небезопасные заголовки веб-сервера"
meta_description: "Маскируем, или убираем небезопасные системные заголовки веб-сервера, которые могут запутать и усложнить задачу хакеру"
date:   2014-09-19 01:01:00
tags:   apache nginx php security
categories: article
---

В большинстве дистрибутивов linux веб-серверы по умолчанию предоставляют очень много данных, которые могут стать отправной точкой для планирования атаки.<br>
Например, используя `curl -I ip_address` можно просмотреть служебную информацию о веб-сервере, используемых модулях и их версиях.

В Debian/Ubuntu по умолчанию доступна следующего рода информация:

```
HTTP/1.1 200 OK
Date: Fri, 19 Sep 2014 17:11:30 GMT
Server: Apache/2.2.16 (Debian)
X-Powered-By: PHP/5.3.28-1~dotdeb.0
```

После таких сведений в лучшем случае сервер превращается в плацдарм для испытания эксплойтов у хакеров, в худшем - его ломают и используют для своих нужд.

## Маскируем Apache ##

Для начала необходимо поставить пакет **libapache-mod-security** (в Ubuntu он может называться **libapache2-modsecurity**), далее - включить модуль:

`# a2enmod mod-security`

Далее открываем файл **/etc/apache2/conf.d/security** (в Ubuntu **/etc/apache2/conf-enabled/security.conf**), комментируем лишнее, добавив:

```
ServerSignature Off
ServerTokens Full
SecServerSignature "httpd (OpenBSD)"
```
После чего перезапускаем apache и проверяем поменлся ли заголовок Server:

```
# /etc/init.d/apache2 restart
...
$ curl -I localhost

HTTP/1.1 200 OK
Date: Fri, 19 Sep 2014 17:11:30 GMT
Server: httpd (OpenBSD)
X-Powered-By: PHP/5.3.28-1~dotdeb.0
```

## Скрываем версию Nginx ##

Для скрытия версии nginx достаточно создать файл **/etc/nginx/conf.d/nginx.conf** со строчкой:

```
server_tokens off;
```

и не забыть перезапустить nginx.

## Скрываем версию PHP ##

Для скрытия версии php необходимо открыть файл **/etc/php5/apache2/php.ini** и поменять значение **expose_php** с **On** на **Off**:

```
expose_php = Off
```

И перезапустить apache:

```
# /etc/init.d/apache2 restart
...
$ curl -I localhost

HTTP/1.1 200 OK
Date: Fri, 19 Sep 2014 17:11:30 GMT
Server: httpd (OpenBSD)
```
