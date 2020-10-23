---
layout: post
title:  "Canvas Fingerprint – твой уникальный цифровой след в сети"
meta_description: "Что такое Canvas Fingerprint, как он мешает быть анонимным в сети, и как его подделать"
date: 2020-10-23
tags: canvas fingerprint firefox chrome
categories: article
author: "soko1"
---


В HTML5 появился элемент Canvas. Он используется для рисования графики и анимации на сайтах с помощью сценариев JavaScript. Но многие недобросовестные сайты используют эту технологию для отслеживания своих пользователей. 

Дело в том, что можно сгенерировать невидимый текст, который будет собран из множества уникальных переменных (установленные шрифты в системе, разрешение экрана, видеокарта и тд), собрав которые можно получить уникальный слепок, который будет связан с твоей личностью. При чём этот слепок не меняется даже если ты обнулишь профиль браузера, откроешь браузер в режиме инкогнито, или сменишь айпи. Не веришь? Проверь: <a href="https://browserleaks.com/canvas" target="_blank">https://browserleaks.com/canvas</a>

<img src="/uploads/canvas_fingerprint.png" style="width: 60%;" />

Но хочу заметить что Signature не меняется в пределах одного браузера, а не вообще всех.


## Как от этого защититься?

### Firefox

У Firefox есть отличный параметр в **about:config**, который называется **privacy.resistFingerprinting** – его необходимо выставить в **true**, и тогда canvas fingerprint будет меняться каждый раз на рандомное значение. 

### Google Chrome

В хроме всё сложнее, и без дополнительного плагина вроде как не обойтись. Их существует множество, один из возможных вариантов это <a href="https://chrome.google.com/webstore/detail/canvas-blocker-fingerprin/nomnklagbgmgghhjidfhnoelnjfndfpd" target="_blank">Canvas Blocker (Fingerprint protect)</a>. Просто ставишь этот плагин, и canvas fingerprint генерируется случайным образом.


## В заключении

Когда всё поставил и настроил, то не забудь проверить Signature <a href="https://browserleaks.com/canvas" target="_blank">этой ссылке</a> еще раз, должно быть примерно вот так:

<img src="/uploads/canvas_fingerprint_uniq.png" style="width: 60%;" />