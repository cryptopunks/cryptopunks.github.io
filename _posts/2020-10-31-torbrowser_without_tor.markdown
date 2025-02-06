---
layout: post
title:  "Используем Torbrowser без TOR"
meta_description: "Иногда хочется условной анонимности, но не хочется TOR и нет желания настраивать браузер"
date: 2020-10-31
tags: torbrowser tor
categories: article
author: "soko1"
---

Torbrowser это отличный браузер с хорошо продуманной и настроенной конфигурацией Firefox, с минимумом телеметрии и следов пребывания в сети, а так же с неплохим набором плагинов (noscript, https everywhere), которые тебя особо не будут выделять среди серой массы.

Ничего лучше мне найти пока не удалось среди всего зоопарка браузеров. А настраивать каждый раз Firefox, следя за тем что они в новой версии добавили/поломали у меня особого желания нет. Поэтому пришла в голову идея использовать в качестве основного браузера torbrowser, но без Tor. <br><br>
Почему без Tor? Потому что речь про условную анонимизацию. В повседневной жизни пускать весь трафик через Tor неудобно, т.к. это медленно, плюс ко всему выходные ноды часто находятся в чёрных списках и требуется частый ввод капчи. А это нервирует и раздражает. Поэтому torbrowser без Tor, но через VPN - неплохой компромисный вариант.

## Запускаем Torbrowser без Tor


Необходимо запустить torbrowser, присвоив переменным **TOR_SKIP_LAUNCH**, **TOR_TRANSPROXY** единицу. Они сообщат о том, что Tor запускать и использовать не нужно.

Сделать это можно несколькими способами и всё зависит от используемой платформы.

Например в Linux это делается так:

```
$ cd tor-browser_en-US/Browser
$ TOR_SKIP_LAUNCH=1 TOR_TRANSPROXY=1 ./firefox
```

В MacOS:

```
$ cd "/Applications/Tor Browser.app/Contents/MacOS"
$ TOR_SKIP_LAUNCH=1 TOR_TRANSPROXY=1 ./firefox
```

В Windows 10 это можно сделать так:

```
cd tor-browser_en-US\Browser
set TOR_SKIP_LAUNCH=1
set TOR_TRANSPROXY=1
firefox.exe
```

Далее вводим в адресной строке **about:config** и меняем зачение переменной **network.dns.disabled** на  **False**.

Всё, torbrowser должен работать без tor. Проверить можно перейдя по ссылке <a href="https://check.torproject.org/" target="_blank">https://check.torproject.org</a>.

## А что со смартфонами?

На смартфонах я бы рекомендовал не запариваться с torbrowser, а использовать **DuckDuckGo Privacy Browser**. <br>

Вот <a href="https://apps.apple.com/us/app/duckduckgo-privacy-browser/id663592361" target="_blank">версия под iOS</a>, а вот <a href="https://play.google.com/store/apps/details?id=com.duckduckgo.mobile.android&hl=en_US&gl=US" target="_blank">под Android</a>.