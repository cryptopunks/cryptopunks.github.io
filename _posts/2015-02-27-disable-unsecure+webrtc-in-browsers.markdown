---
layout: post
title:  "Отключение небезопасного WebRTC в браузере"
meta_description: "Звонилки от Mozilla/Google хороши, но довольно опасны - отключаем их"
date:   2015-02-26 01:15:00
categories: article
tags: firefox chromium webrtc p2p disable detect ip
---

## Краткая информация

**WebRTC** (Web Real-Time Communication) - технология с открытым исходным кодом, позволяющая передавать потоковые данные между браузерами по технологии "точка-точка" (p2p).

WebRTC встроен по умолчанию в последних версиях Firefox, Chrome/Chromium, Opera и позволяет производить соединение между двумя и более браузерами для видео/аудио-звонков и не только.

## Почему не безопасно?

Дело в том, что для соединения по принципу p2p необходимо знать реальный IP-адрес и WebRTC эту информацию бесстыдно сливает. Даже если вы сидите под **TOR**/**VPN** то не составит особого труда узнать ваш локальный IP-адрес в сети и на стороне, например, VPN-сервера. А с использованием уязвимостей можно определить ваш реальный IP, за которым вы скрываетесь.

## Как проверить

Для проверки локального IP используйте страницу: <a href="https://diafygi.github.io/webrtc-ips/" target="_blank">https://diafygi.github.io/webrtc-ips/</a>

JavaScript-код и описание доступны на следующей странице: <a href="https://github.com/diafygi/webrtc-ips" target="_blank">https://github.com/diafygi/webrtc-ips</a>

Проверить включенность камеры, звука, захвата экрана и т.д. в браузере можно по ссылке: <a href="https://www.browserleaks.com/webrtc" target="_blank">https://www.browserleaks.com/webrtc</a>

## Как отключить

### Firefox

Вызываем скрытые настройки по `about:config` в адресной строке, ищем параметр `media.peerconnection.enabled`, выставляем его в `false`.

### Chrome/Chromium

Отключается лишь установкой небольшого расширения: <a href="https://chrome.google.com/webstore/detail/webrtc-leak-prevent/eiadekoaikejlgdbkbdfeijglgfdalml?hl=en-US" target="_blank">WebRTC Leak Prevent</a>.
