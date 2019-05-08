---
layout: post
title:  "Поднимаем анонимный веб-ресурс в TOR"
date:   2015-08-26 12:49:00
categories: article
tags: tor secure onion hosting forward
meta_description: "Создаём собственный сайт с минимальной потерей времени и с максимальной анонимностью"
---

## Зачем вам это?

TOR может скрыть реальное местоположение сайта, а это значит что его не смогут отключить, а создателя - найти и наказать/устранить (при соблюдении определённых правил). Кроме того TOR-адрес в доменной зоне **.onion** невозможно украсть/присвоить/отозвать до тех пор пока вы не потеряете секретный ключ от этого домена (об этом чуть позже).

## Настраиваем веб-сервер

Пропускаем этот раздел и переходим к разделу настройки TOR в случае если web-сервер уже настроен.

### Однострочник на Python

Если у вас статические html-файлы с сайтом (идеальный вариант для безопасности) и не очень много ресурсов, то можно просто запустить однострочник на Python, который будет отдавать пользователю контент.<br>
Для этого перейдите в каталог с html-файлами и запустите следующую команду:

```
$ cd /var/www/site1
$ python -m SimpleHTTPServer 80
```

Можно параллельно запустить несколько сайтов, поменяв лишь каталог назначения и порт. Например:

```
$ cd /var/www/site2
$ python -m SimpleHTTPServer 81
```

### Nginx

Если сайт более сложный и ресурсов хватает - можно настроить nginx.

Ставим:

`$ sudo apt-get install nginx`

Рекомендуется в файле **/etc/nginx/nginx.conf** поменять следующие значения:

```
http {

...

        # не предоставляем версию используемого софта
        server_tokens off;
        # отключаем ведение логов
        #access_log /var/log/nginx/access.log;
        #error_log /var/log/nginx/error.log;

        error_log /dev/null crit;
...
```

Далее создаём файл нового виртуалхоста:

**/etc/nginx/sites-available/site1**

```
server {
        listen 127.0.0.1:80 default_server;
        server_name localhost;

        root /var/www/site1;
        index index.html index.htm;

        location / {
                allow 127.0.0.1;
                deny all;

        }
}
```

Включаем его:

```
$ cd /etc/nginx/sites-enabled
$ sudo ln -s ../sites-available/site1 .

```

Перезапускаем nginx и добавляем его в автозагрузку:

```
$ sudo service nginx restart
$ sudo update-rc.d enable nginx
```

Создаём каталог с будущим сайтом:

```
$ sudo mkdir /var/www/site1
```

Кладём туда необходимые файлы и сменяем владельца:

```
$ sudo chown -R www-data:www-data /var/www/site1

```

### Настройка TOR

Настройка TOR сводится лишь к его установке и добавлению 2 строчек в конфиг.

```
$ sudo apt-get install tor
```

Открываем **/etc/tor/torrc**:

```
HiddenServiceDir /var/lib/tor/site1 # каталог создаётся автоматически
HiddenServicePort 80 127.0.0.1:80
```

Перезапускаем TOR:

```
$ sudo /etc/init.d/tor restart
```

Первая строчка в конфиге указывает путь к закрытому ключу, который создаётся автоматически TOR'ом при первом запуске после модификации конфига и играет роль onion-домена. Давайте посмотрим на содержимое каталога для большего понимания:

```
$ sudo ls /var/lib/tor/site1
hostname  private_key
```

Файл **hostname** содержит адрес домена сгенерированного на базе хеша ключа **private_key**, который в свою очередь сгенерировался случайным образом при первом запуске.

```
pigf5kfufjz63s5z.onion
```

удаление/модификация файла **hostname** не влечёт никаких последствий, при следующем перезапуске TOR он вновь создаётся на основе ключа. Это скорее файл-подсказка для вас.<br><br>
А вот ключ **private_key** необходимо держать в секрете. До тех пор пока вы являетесь единственным владельцем этого файла - ваш домен никто и никогда не украдёт.<br>
Ключ имеет стандартный вид:

```
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQCiwfOmTC3c02kaz/BGftIXLafz4z6sTbufBpM/usaQAFdbW072
xZ0ds2ZEVbQNOjewU9QihrtA25v20ZblbEZfrLkPytKzb/ghCIEQN/mbSsnBcJ9b
JJa0OzhUy+V9uuXrO0afpk7eCB/EPNdwugfKu/G9JaBirWrRMkkAozhKjwIDAQAB
AoGBAJlFVwMzWDlN6fvy+E4a3hQvzauSRBIVPevbUE3CwX0YpSuGSE2B+Zzfth4C
K4YNXiYyO2KsSKkiZrS/2X+CQJ4WLy87VCkoF2TF5C4MKF3SOhGPorO4TCtxkhnN
7tprZFIlT7/cP45XretG+i6ZuksZtv2Oje0r1oCwxv0F4V5BAkEA0rVve2Q0x5EG
nZrBPFgsdPm6ikutuMUBFbNxv71ILbh3f+qePpH6wZIjgQ7FJXGXarC1DcyaPT52
QQWWnhGCYQJBAMW97zxTD+9klPBisZ7ClFWh88VBCPVeyz5AS2oQdNtRaJeKyiiS
JhtNIq5yPabCZ/JecqbtCoMY/pdJeJNs0u8CQFyAgG+YHz+ZYGEiRkDaqLG1zHnY
HWznN8GyJHa7fwtrVzLV6iCn74C5SlLnDA+THZkd+G4Va4UFfd6vuF6uayECQD9Q
aWFvVxLXqbiuYSDsPIKOsHbgM/YcvAban0r+qevvTQX4snH7Gah0Mj6Y5ZSXeqDo
DN3V2B/RyPK325uYpJECQQCs/Ko0Z2LIk+fDaHRsWI00DbflRK8jptnjArVTrabs
0Os5jX+UFum0kGRlNKQPV8suucP/5y6FanlmTs3RFwpt
-----END RSA PRIVATE KEY-----
```

Рекомендуется сделать копию ключа, предварительно зашифровав например GPG, используя криптостойкий пароль (либо ваш ключ) и куда-нибудь скопировать:

```
$ sudo gpg -c /var/lib/tor/site1/private_key
```

Если очистить каталог  **/var/lib/tor/site1** от ключа, то при следующем перезапуске TOR сгенерирует новый ключ с новым случайным onion-адресом.

Вернёмся к конфигу. Вторая строчка (`HiddenServicePort 80 127.0.0.1:80`) задаёт какой порт будет у onion-ресурса и какой адрес и порт будем форвардить на него. В нашем случае мы берём адрес/порт 127.0.0.1:80 и форвардим его на pigf5kfufjz63s5z.onion:80.<br>Давайте проверим так ли это. Откройте в <a href="https://www.torproject.org/projects/torbrowser.html.en" target="_blank">tor-browser</a>, либо в любом другом браузере, но <a href="/article/forward+all+the+traffic+to+tor/" target="_blank">с настроенным TOR</a> и введите адрес <a href="http://pigf5kfufjz63s5z.onion" target="_blank">http://pigf5kfufjz63s5z.onion</a>. Должна открыться страница что висит на 127.0.0.1:80.<br><br>
Если сайтов нестолько, то в конфиг дописываем, например:

```
HiddenServiceDir /var/lib/tor/site2
HiddenServicePort 80 127.0.0.1:81

HiddenServiceDir /var/lib/tor/site3
HiddenServicePort 80 127.0.0.1:82
```

перезапускаем TOR, после чего создаются ключи в соответствующих каталогах.
<br><br>
Не смотря на то что адреса генерируются случайным образом - их можно подбирать. Об этом поговорим в отдельной статье.
