---
layout: post
title:  "Перенаправляем весь трафик через TOR"
meta_description: "Tor-browser это хорошо, а TOR для всех программ на компьютере - ещё лучше"
date:   2015-08-24 12:49:00
categories: article
tags: tor secure forward
---

## Для чего необходимо

<p>Бывают ситуации когда необходима анонимность, но VPN под рукой нет. И VPN вряд ли можно назвать анонимным инструментом, ведь вы на него заходите как правило со своего IP (если это не двойной VPN), а значит оставляете следы, даже если не ведутся логи. Что уж говорить о VPN-услугах, которые вы покупаете у чужих людей. Они в свою очередь чаще всего ведут и логи и сниффают трафик и при любом обращении местных спецслужб эту информацию послушно предоставляют.</p>

<p>TOR - неплохой инструмент для анонимности и иногда необходимо через него пропускать не только трафик из вашего браузера (что делает например tor-browser), но и вообще трафик всей системы + не все необходимые вам программы могут поддерживать socks-прокси.</p>

## Установка и настройка TOR

Устанавливаем:

```
$ sudo apt-get install tor
```

Для настройки используется конфиг **/etc/tor/torrc**, открываем/создаём и вписываем туда следующее:

```
VirtualAddrNetworkIPv4 10.192.0.0/10
AutomapHostsOnResolve 1
TransPort 9040
DNSPort 53
# для жителей СНГ рекомендую исключить Exit-ноды следующих стран
ExcludeExitNodes {RU},{UA},{BY}
```

## Настройка DNS

Использовать ДНС-сервера от Google, либо чьи-нибудь ещё - плохая идея, т.к. они тотчас вас деанонимизируют.
Будем использовать локальный ДНС средствами TOR. Для выполним следующее:

```
$ sudo rm -f /etc/resolv.conf # удалим, т.к. иногда это сим-линк
$ echo "nameserver 127.0.0.1" | sudo tee /etc/resolv.conf
```

Поскольку всякие NetworkManager очень любят перезаписывать этот файл - лучше его вообще залочить на запись:

```
$ sudo chattr +i /etc/resolv.conf
```

(для анлока вместо +i используйте -i)


## Настройка Iptables и проверка работоспособности

Создаём скрипт **iptables_setup.sh**:

```
#!/bin/sh

### set variables
#destinations you don't want routed through Tor
_non_tor="192.168.1.0/24 192.168.0.0/24"

#the UID that Tor runs as (varies from system to system)
_tor_uid="XYZ" # XYZ меняем на UID пользователя TOR (!)

#Tor's TransPort
_trans_port="9040"

### flush iptables
iptables -F
iptables -t nat -F

### set iptables *nat
iptables -t nat -A OUTPUT -m owner --uid-owner $_tor_uid -j RETURN
iptables -t nat -A OUTPUT -p udp --dport 53 -j REDIRECT --to-ports 53

#allow clearnet access for hosts in $_non_tor
for _clearnet in $_non_tor 127.0.0.0/9 127.128.0.0/10; do
   iptables -t nat -A OUTPUT -d $_clearnet -j RETURN
done

#redirect all other output to Tor's TransPort
iptables -t nat -A OUTPUT -p tcp --syn -j REDIRECT --to-ports $_trans_port

### set iptables *filter
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

#allow clearnet access for hosts in $_non_tor
for _clearnet in $_non_tor 127.0.0.0/8; do
   iptables -A OUTPUT -d $_clearnet -j ACCEPT
done

#allow only Tor output
iptables -A OUTPUT -m owner --uid-owner $_tor_uid -j ACCEPT
iptables -A OUTPUT -j REJECT
```
Переменную `_tor_uid` меняем на uid пользователя под которым работает tor.
Определить это значение можно так:

```
$ grep tor /etc/passwd
debian-tor:x:135:145::/var/lib/tor:/bin/false
```

Первая цифра, то есть 135 - uid, меняем в скрипте

```
_tor_uid="135"
```

Запускаем:

```
$ chmod +x iptables_setup.sh
$ sudo ./iptables_setup.sh
```

Проверяем работу. Включаем tor:

```
$ sudo /etc/init.d/tor restart
```

Пробуем зайти на <a href="https://check.torproject.org/" target="_blank">https://check.torproject.org/</a>. Должны увидеть надпись "Congratulations. This browser is configured to use Tor".

Теперь останавливаем TOR:

```
$ sudo /etc/init.d/tor stop
```

И повторно пробуем зайти на сайт, либо запускаем любую другую программу (например, IM-клиент), интернет не должен работать, т.к. выключен TOR.
Если всё верно, то прописываем правила iptables в автозагрузку:

```
$ sudo iptables-save > /etc/iptables_tor
```

Открываем файл **/etc/rc.local** и перед **exit 0** вставляем:

```
iptables-restore < /etc/iptables_tor
```

Добавляем запуск TOR в автозагрузку:

```
$ sudo update-rc.d tor enable
```

## Отключение перенаправления трафика

Для того чтобы привести правила iptables к девственному виду и отключить перенаправление трафика в сеть TOR можно создать скрипт со следующим содержанием:

```
#!/bin/sh

echo "Stopping firewall and allowing everyone..."
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

```

## Несколько советов

* <p>Неплохим вариантом будет использование на хосте VPN, а в виртуальной машине TOR, но в некоторых случаях лучше действовать наоборот. Зависит от того, какие цели вы преследуете.</p>
* <p>Если необходимо скрыть от местного провайдера ваше использование TOR, то запускайте TOR внутри VPN.</p>
* <p>Если же необходима более серьёзная анонимность и постоянный IP (некоторые сайты блокируют, или не любят TOR - капчи хороший тому пример), то заведите девственно чистую виртуальную машину с <a href="/article/change+random+mac+address/" target="_blank">левым MAC-адресом сетевой платы</a>, а в ней чистый профиль браузера и под ним (ес-но тоже под TOR) зарегистрируйте либо VPS-сервер (для последующей настройки VPN), либо уже готовый VPN-сервер, пользуясь анонимной валютой (qiwi с левой симкой, либо bitcoin) и левыми ФИО и мылом (который тоже зарегайте под тором в этой виртуалке) и используйте свежезарегистрированные почту/vpn исключительно в этой виртуалке, никогда не входите под ней в свою основную почту, социальные сети и т.д. (тоже самое с свежезареганной почтой и vpn - лишь в текущей виртуалке), т.к. достаточного одного раза, чтобы ваша вторая личность была навсегда связана с основной и тогда получится что все труды были напрасны.</p>

* <p>Ещё неплохой идеей будет запускать TOR в chroot-окружении. В интернете немало информации по настройке, например: <a href="https://trac.torproject.org/projects/tor/wiki/doc/TorInChroot" target="_blank">https://trac.torproject.org/projects/tor/wiki/doc/TorInChroot</a> (единственный плохой совет в статье - ставить TOR из исходников, ставьте лишь из репозитория вашего дистрибутива и регулярно обновляйте его и всю систему). Это дополнительно обезопасит вас от критических уязвимостей найденных в системе которую вы используете и в TOR. Хотя ещё лучшей идеей будет настроить TOR на отдельном роутере в chroot окружении, но это уже если у вас true-паранойя.</p>
