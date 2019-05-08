---
layout: post
title:  "Анонимный jabber средствами TOR на rapsberry pi"
meta_description: "Настраиваем свой анонимный сервер jabber на raspberry pi без покупки домена и без анонимного хостера"
date:   2017-05-11
tags: linux tor prosody jabber onion raspberrypi
categories: article
author: "soko1"
---

Задача вроде довольно банальная и очевидная, но меня постоянно заваливают письмами об анонимном мессенджере и вопросами вроде "какого анонимного хостера знаешь, нужен анонимный жаббер", поэтому решил вместо тысячи ответов давать линк на одну статью.

У схемы **jabber** + **tor** + **rapsberry pi** есть ряд плюсов:

1. не придётся покупать доменное имя
   * не нужно ничего оплачивать ежегодно
   * никто не отследит по денежным транзакциям кто владелец
   * домен не угонят (естественно всё относительно, ведь могут украсть ключи) и никто не забанит и не отключит домен
2. не придётся искать и покупать анонимного хостера, а если он и анонимный, то нет гарантии в отказе слива информации о вас. Плюс их услуги довольно дорогие и часто отсуствует качество предоставляемых услуг, потому как довольно маленькая конкуренция
3. дешёвое обслуживание (всего 4Вт)
4. отсутствие левых владельцев, которым следует верить, что у них всё "на самом деле отключено и ничего не сливается третьим лицам".
5. rapsberry pi может находиться за кучей натов и ей не нужно пробрасывание портов и тем более выделенный IP
6. местонахождение сервера будет никому не известно, кроме владельца

(почти все перечисленные преимущества — TOR)


## Установка необходимых пакетов

Процесс установки опустим, т.к. по этому шагу написана не одна тысяча материалов, скажу лишь, что лучше ставить [Raspbian Lite](https://downloads.raspberrypi.org/raspbian_lite_latest), т.к. чем меньше у нас будет изначально пакетов, тем лучше.

Далее необходимо определиться с jabber-сервером. Тут варинтов не очень много, мы выберем в этой роли prosody, он молод и интенсивно развиваем.

Ставим необходимые пакеты:

```
$ sudo apt install tor prosody
```

## Генерация домена

Более подброно про генерацию доменов в TOR можно в статье, [написанной ранее](/article/generate+custom+onion+address/), но если кратко:

```
$ printf "HiddenServiceDir /var/lib/tor/jabber\nHiddenServicePort 5222 127.0.0.1:5222\n" | sudo tee /etc/tor/torrc
$ sudo systemctl tor restart
$ sudo cat /var/lib/tor/jabber/hostname
pigf5kfufjz63s5z.onion
```

**pigf5kfufjz63s5z.onion** — домен, который мы будем использовать в jabber-сервере.

Далее создаём конфиг **/etc/prosody/prosody.cfg.lua** с примерно таким содержанием:

```
admins = { "root@nsltzcvhmzfa7ypr.onion" }
modules_enabled = {

	-- Generally required
		"roster"; -- Allow users to have a roster. Recommended ;)
		"saslauth"; -- Authentication for clients and servers. Recommended if you want to log in.
		"tls"; -- Add support for secure TLS on c2s/s2s connections
		-- "dialback"; -- s2s dialback support
		-- "disco"; -- Service discovery

	-- Not essential, but recommended
		"private"; -- Private XML storage (for room bookmarks, etc.)
		"vcard"; -- Allow users to set vCards
	
	-- These are commented by default as they have a performance impact
		--"privacy"; -- Support privacy lists
		--"compression"; -- Stream compression (Debian: requires lua-zlib module to work)

	-- Nice to have
		"version"; -- Replies to server version requests
		"uptime"; -- Report how long server has been running
		"time"; -- Let others know the time here on this server
		"ping"; -- Replies to XMPP pings with pongs
		"pep"; -- Enables users to publish their mood, activity, playing music and more
		-- "register"; -- Allow users to register on this server using a client and change passwords

	-- Admin interfaces
		-- "admin_adhoc"; -- Allows administration via an XMPP client that supports ad-hoc commands
		--"admin_telnet"; -- Opens telnet console interface on localhost port 5582
	
	-- HTTP modules
		--"bosh"; -- Enable BOSH clients, aka "Jabber over HTTP"
		--"http_files"; -- Serve static files from a directory over HTTP

	-- Other specific functionality
		"posix"; -- POSIX functionality, sends server to background, enables syslog, etc.
		--"groups"; -- Shared roster support
		--"announce"; -- Send announcement to all online users
		--"welcome"; -- Welcome users who register accounts
		--"watchregistrations"; -- Alert admins of registrations
		--"motd"; -- Send a message to users when they log in
		--"legacyauth"; -- Legacy authentication. Only used by some old clients and bots.
};

modules_disabled = {
	-- "offline"; -- Store offline messages
	-- "c2s"; -- Handle client connections
	"s2s"; -- Handle server-to-server connections
};

allow_registration = true;

daemonize = true;

pidfile = "/var/run/prosody/prosody.pid";

c2s_require_encryption = true 

authentication = "internal_hashed"

log = {
	-- Log files (change 'info' to 'debug' for debug logs):
	info = "/dev/null";
	error = "/dev/null";
	-- Syslog:
	{ levels = { "error" }; to = "syslog";  };
}

VirtualHost "nsltzcvhmzfa7ypr.onion"
	enabled = true -- Remove this line to enable this host

	ssl = {
		key = "/etc/prosody/certs/host.key";
		certificate = "/etc/prosody/certs/host.crt";
	}


Include "conf.d/*.cfg.lua"
```

Все вхождения **pigf5kfufjz63s5z.onion** необходимо поменять на тот домен, который сгенерировался у вас.

## Создание ключей ssl

```
$ sudo openssl req -new -x509 -days 365 -nodes -out "/etc/prosody/certs/host.crt" -newkey rsa:2048 -keyout "/etc/prosody/certs/host.key"
```

После чего перезапускаем prosody:

```
$ sudo systemctl prosody restart
```

## Настройка клиентской стороны

На клиентской стороне ставим и запускаем TOR:

```
$ sudo apt install tor
$ sudo systemctl tor restart
```

А в клиенте jabber выбираем в свойствах соединения Socks5-прокси, в качестве **Host** указываем **127.0.0.1** в качестве **Port** — **9050**. Пишем логин (если логина ещё нет — регистрируемся, выбрав соответствующий пункт меню в клиенте), а в качестве хоста сервера указываем ваш свежесгенерированный onion-ресурс (в моём случае это pigf5kfufjz63s5z.onion).

Регистрацию так же можно сделать закрытой (для "своих") поменяв в конфиге prosody **allow_registration** с **true** на **false**, тогда регистрировать пользователей можно из консоли:

```
$ sudo prosodyctl register имя_пользоавтеля ваш_onion_домен пароль_пользователя
```

Остальные тонкости настройки [на официальной странице](https://prosody.im/doc/configure).

## Напоследок несколько важных нюансов

Не забываем на малинке поменять пароль для **pi**, **root**, настроить [соответствующим образом ssh] (/article/secure+and+comfortable+ssh/), запустить `netstat -tulpan` и убедиться что никаких левых сервисов не запущено (как правило светят наружу ненужные ntpd, avahi-daemon, dhcpcd — всё лишнее удаляем через `apt purge имя_пакета`), либо вообще запрещаем все порты кроме 9050 фаерволлом (об этом можно почитать, например, [тут](/article/ufw+firewall/). Ещё можно поставить и минимально настроить **fail2ban** и [включить автоматические обновления ОС](/article/enabling+automatic+updates+in+debian/).

Кстати, если в вашей стране TOR блокируется, то поможет вот [эта статья](/article/tor+blocking+bypass/).

Удачной анонимной и относительно безопасной переписки на личном одноплатном сервере!

<br>
Напомню, что если наши статьи вам понравились, можно [поддержать проект материально](/donate/), либо [оставив отзыв](/contacts/) (критика тоже приветствуется).
