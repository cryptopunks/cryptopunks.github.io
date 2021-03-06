---
layout: post
title:  "Обходим блокировку tor в несколько кликов мышью через Tor Browser"
meta_description: "Никаких конфигов - только мышь!"
date: 2020-05-18
tags: tor torbrowser block
categories: article
author: "soko1"
---

Если в твоей стране блокируется tor, то Tor Browser уже имеет все механизмы необходимые для борьбы с блокировкой, его просто необходимо об этом уведомить, нажав пару кнопок.

Мало того, Tor Browser позволяет использовать другие заблокированные в твоей стране программы (например, telegram), пропуская через себя их трафик! Но об этом в следующей статье.

## Обходим блокировку tor

Качай [Tor Browser](https://www.torproject.org/download/) для своей платформы, запускай и если в твоей стране он заблокирован, то скорее всего ты увидишь вот такое окно:

<img src="/uploads/torbrowser_connecting_to_a_relay.png" />

Нажимай **Cancel**, потом **Configure** -> **Tor is censored in my country** -> **request a bridge from tor-project.org** - > **request a bridge**, вводи капчу и получай необходимые магические циферки для обфускации (маскировки) трафика, после чего нажимай **Connect**:

<img src="/uploads/torbrowser_request_a_bridge.png" />

Всё, Tor Browser должен запуститься!

Кстати, в случае чего всегда можно в настройках Tor Browser во вкладке TOR точно так же поменять бридж на иной, если вдруг старый перестал работать.

Блокировку tor можно обойти и без Tor Browser, об этом [я писал ранее](https://cryptopunks.org/article/tor+blocking+bypass/).