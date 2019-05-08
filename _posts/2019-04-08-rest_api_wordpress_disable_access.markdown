---
layout: post
title:  "Отключение Rest API в Wordpress для неавторизированных пользователей"
meta_description: "Демонстрация уязвимости и отлючение Rest API в Wordpress для большей безопасности сайта"
date:   2019-04-08
tags: wordpress bruteforce restapi security
categories: article
author: "soko1"
---

Rest API в Wordpress — несомненно очень удобный инструмент, однако совершенно случайно я обнаружил ряд потенциально опасных лазеек, которыми могут воспользоваться хакеры при взломе вашего сайта. Одной из них я хотел бы поделиться и рассказать о том, как отключить этот функционал для неавторизированных пользователей, т.к. чаще всего Rest API либо вообще не используется, либо используется для администрирования сайта.

## Демонстрация одной из опасных проблем

В документации к [Rest API Wordpress](https://developer.wordpress.org/rest-api/using-the-rest-api/)  есть запрос следующего вида **/wp-json/wp/v2/users**. Он позволяет получить список зарегистрированных юзеров на сайте, в том числе их логины для входа.

Например, давайте получим часть логинов на xakep.ru:

```
$ curl "http://xakep.ru/wp-json/wp/v2/users"
[{"id":64,"name":"|plaintext|","url":"","description":"","link":"https:\/\/xakep.ru\/author\/plaintext\/","slug":"plaintext","avatar_urls":{"24":"http:\/\/1.gravatar.com\/avatar\/1d2b0b979683a00ea63f7e3ab319964c?s=24&d=retro&r=g","48":"http:\/\/1.gravatar.com\/avatar\/1d2b0b979683a00ea63f7e3ab319964c?s=48&d=retro&r=g","96":"http:\/\/1.gravatar.com\/avatar\/1d2b0b979683a00ea63f7e3ab319964c?s=96&d=retro&r=g"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/64"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":429154,"name":"0x25CBFC4F","url":"","description":"","link":"https:\/\/xakep.ru\/author\/0x25cbfc4f\/","slug":"0x25cbfc4f","avatar_urls":{"24":"http:\/\/1.gravatar.com\/avatar\/7f12c015398c2326135d4800f93bad20?s=24&d=retro&r=g","48":"http:\/\/1.gravatar.com\/avatar\/7f12c015398c2326135d4800f93bad20?s=48&d=retro&r=g","96":"http:\/\/1.gravatar.com\/avatar\/7f12c015398c2326135d4800f93bad20?s=96&d=retro&r=g"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/429154"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":417792,"name":"0x6d696368","url":"","description":"Computer magician","link":"https:\/\/xakep.ru\/author\/0x6d696368\/","slug":"0x6d696368","avatar_urls":{"24":"https:\/\/xakep.ru\/wp-content\/uploads\/2018\/05\/author-s.jpg","48":"https:\/\/xakep.ru\/wp-content\/uploads\/2018\/05\/author-s.jpg","96":"https:\/\/xakep.ru\/wp-content\/uploads\/2018\/05\/author-s.jpg"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/417792"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":329699,"name":"84ckf1r3","url":"","description":"","link":"https:\/\/xakep.ru\/author\/84ckf1r3\/","slug":"84ckf1r3","avatar_urls":{"24":"http:\/\/0.gravatar.com\/avatar\/3b7926f0e4a268a785b8e9c97aea91be?s=24&d=retro&r=g","48":"http:\/\/0.gravatar.com\/avatar\/3b7926f0e4a268a785b8e9c97aea91be?s=48&d=retro&r=g","96":"http:\/\/0.gravatar.com\/avatar\/3b7926f0e4a268a785b8e9c97aea91be?s=96&d=retro&r=g"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/329699"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":341793,"name":"8bit","url":"","description":"","link":"https:\/\/xakep.ru\/author\/8bit\/","slug":"8bit","avatar_urls":{"24":"http:\/\/0.gravatar.com\/avatar\/c50d7b552ac9909795ceacdf50fcbf38?s=24&d=retro&r=g","48":"http:\/\/0.gravatar.com\/avatar\/c50d7b552ac9909795ceacdf50fcbf38?s=48&d=retro&r=g","96":"http:\/\/0.gravatar.com\/avatar\/c50d7b552ac9909795ceacdf50fcbf38?s=96&d=retro&r=g"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/341793"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":339280,"name":"Al1en","url":"","description":"","link":"https:\/\/xakep.ru","slug":"al1en","avatar_urls":{"24":"http:\/\/0.gravatar.com\/avatar\/900c621598b832a109a7659db0d42de9?s=24&d=retro&r=g","48":"http:\/\/0.gravatar.com\/avatar\/900c621598b832a109a7659db0d42de9?s=48&d=retro&r=g","96":"http:\/\/0.gravatar.com\/avatar\/900c621598b832a109a7659db0d42de9?s=96&d=retro&r=g"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/339280"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":7,"name":"Alex G","url":"","description":"","link":"https:\/\/xakep.ru","slug":"fotonstep","avatar_urls":{"24":"https:\/\/xakep.ru\/wp-content\/uploads\/2016\/12\/ava-new-large.jpg","48":"https:\/\/xakep.ru\/wp-content\/uploads\/2016\/12\/ava-new-large.jpg","96":"https:\/\/xakep.ru\/wp-content\/uploads\/2016\/12\/ava-new-large.jpg"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/7"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":351044,"name":"aLLy","url":"http:\/\/russiansecurity.expert\/","description":"\u0421\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442 \u043f\u043e \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u043e\u043d\u043d\u043e\u0439 \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u0438 \u0432 ONsec.\r\nResearch, ethical hacking and Photoshop.","link":"https:\/\/xakep.ru\/author\/iamsecurity\/","slug":"iamsecurity","avatar_urls":{"24":"http:\/\/1.gravatar.com\/avatar\/78da81286e3e78c6338efbb98f47680d?s=24&d=retro&r=g","48":"http:\/\/1.gravatar.com\/avatar\/78da81286e3e78c6338efbb98f47680d?s=48&d=retro&r=g","96":"http:\/\/1.gravatar.com\/avatar\/78da81286e3e78c6338efbb98f47680d?s=96&d=retro&r=g"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/351044"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":337436,"name":"Anton Ostrokonskiy","url":"http:\/\/ostrokonskiy.com","description":"Penetration tester","link":"https:\/\/xakep.ru\/author\/pagliacci\/","slug":"pagliacci","avatar_urls":{"24":"https:\/\/xakep.ru\/wp-content\/uploads\/2017\/06\/b9909cefd3f7b9a34b8f85e1270ad11a.jpeg","48":"https:\/\/xakep.ru\/wp-content\/uploads\/2017\/06\/b9909cefd3f7b9a34b8f85e1270ad11a.jpeg","96":"https:\/\/xakep.ru\/wp-content\/uploads\/2017\/06\/b9909cefd3f7b9a34b8f85e1270ad11a.jpeg"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/337436"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}},{"id":51,"name":"ARNext.ru","url":"http:\/\/arnext.ru","description":"\u041a\u0440\u0443\u043f\u043d\u0435\u0439\u0448\u0438\u0439 \u0440\u0443\u0441\u0441\u043a\u043e\u044f\u0437\u044b\u0447\u043d\u044b\u0439 \u0440\u0435\u0441\u0443\u0440\u0441 \u043e \u0434\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u043d\u043e\u0439, \u0432\u0438\u0440\u0442\u0443\u0430\u043b\u044c\u043d\u043e\u0439 \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438 \u0438 \u0441\u043e\u043f\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0449\u0438\u0445 \u0442\u0435\u0445\u043d\u043e\u043b\u043e\u0433\u0438\u044f\u0445.","link":"https:\/\/xakep.ru\/author\/arnext\/","slug":"arnext","avatar_urls":{"24":"http:\/\/2.gravatar.com\/avatar\/e89a0ded334cee51dc273d169c028d1f?s=24&d=retro&r=g","48":"http:\/\/2.gravatar.com\/avatar\/e89a0ded334cee51dc273d169c028d1f?s=48&d=retro&r=g","96":"http:\/\/2.gravatar.com\/avatar\/e89a0ded334cee51dc273d169c028d1f?s=96&d=retro&r=g"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/51"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}}]%
```

Или можно узнать какой логин например у пользователя с **id=1** (с большой долей вероятности — администратора сайта):

```
$ curl http://xakep.ru/wp-json/wp/v2/users/1
{"id":1,"name":"wpengine","url":"http:\/\/wpengine.com","description":"This is the \"wpengine\" admin user that our staff uses to gain access to your admin area to provide support and troubleshooting. It can only be accessed by a button in our secure log that auto generates a password and dumps that password after the staff member has logged in. We have taken extreme measures to ensure that our own user is not going to be misused to harm any of our clients sites.","link":"https:\/\/xakep.ru","slug":"wpengine","avatar_urls":{"24":"http:\/\/0.gravatar.com\/avatar\/9315f6ce3baebb09c86901c4497d57b7?s=24&d=retro&r=g","48":"http:\/\/0.gravatar.com\/avatar\/9315f6ce3baebb09c86901c4497d57b7?s=48&d=retro&r=g","96":"http:\/\/0.gravatar.com\/avatar\/9315f6ce3baebb09c86901c4497d57b7?s=96&d=retro&r=g"},"meta":[],"_links":{"self":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users\/1"}],"collection":[{"href":"https:\/\/xakep.ru\/wp-json\/wp\/v2\/users"}]}}%
```

А вот и он **wpengine**.

Теперь при брутфорсинге пароля хакер может знать какой логин использовать.

## Ограничиваем доступ к Rest API Wordpress

А теперь давайте эту лазейку прикроем, разрешив использовать Rest API только авторизированным пользователям. Для этого необходимо в файлики, которые обчно не подвержены перезаписи (обновлению) и вызываются при каждом запросе к сайту добавить следующий код:

```
## Закрывает все маршруты REST API от публичного доступа
add_filter( 'rest_authentication_errors', function( $result ){

	if( empty( $result ) && ! current_user_can('edit_others_posts') ){
		return new WP_Error( 'rest_forbidden', 'You are not currently logged in.', array( 'status' => 401 ) );
	}

	return $result;
});
```

Например, можно добавить этот код в самый конец файла **wp-config.php**.

## Напоследок

Ну и разумеется, смысл в вышепреведённом коде есть при условии, что регистрация на вашем сайте отключена.
В противном случае условие это необходимо немного модифицировать по ситуации.
