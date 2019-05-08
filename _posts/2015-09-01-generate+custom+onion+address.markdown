---
layout: post
title:  "Генерируем произвольный адрес onion-домена в TOR"
date:   2015-09-01 23:49:00
categories: article
tags: tor secure onion hosting forward
meta_description: "Подбираем необходимые варианты из случайностей для будущего onion-ресурса и подсчитываем приблизительные временные затраты"
---

## Борьба со "страшными" адресами TOR

При <a href="/article/create-onion-resource-in-tor/" target="_blank">создании ресурсов в сети TOR</a> генерируется хеш на базе случайносозданного ключа, который лежит в директории указанной в параметре **HiddenServiceDir** конфига **torrc** и служит доменом ресурса, имея довольно неприятный вид вроде **2rdccn3g5pz3vy7s.onion**. Эту проблему можно по крайней мере частично решить, сгенерировав нужную комбинацию символов, выбирая варианты из случайностей.

## Примерное время

При сегодняшних средних мощностях процессоров первые 1/2/3/4/5/6-символов подбираются довольно быстро (от миллисекунд до получаса).<br>
Вот таблица соответствий для процессора 1.5Гц:


|  символы   |  примерное время   |
|:----------:|:------------------:|
|         1  |   менее 1 секунды  |
|         2  |   менее 1 секунды  |
|         3  |   менее 1 секунды  |
|         4  |   2 секунды        |
|         5  |   1 минута         |
|         6  |   30 минут         |
|         7  |   1 день           |
|         8  |   25 дней          |
|         9  |   2.5 года         |
|        10  |   40 лет           |
|        11  |   640 лет          |
|        12  |   10 тыс. лет      |
|        13  |   160 тыс. лет     |
|        14  |   2.6 млн. лет     |


## Использование eschalot

Получаем последнюю версию:

```
$ git clone https://github.com/ReclaimYourPrivacy/eschalot
```

Собираем:

```
$ cd eschalot
$ make
```

Далее запускаем `./eschalot` без аргументов чтобы ознакомиться со справкой по аргументам (более подробная на странице проекта).<br><br>

Например найдём ключ с хешем "crypt" в начале адреса:

```
$ ./eschalot -t4 -r "^test"
----------------------------------------------------------------
cryptll6ahbkealh.onion
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDGDXVrSOdNFsua8tdERD+gcUMMjuGwpamV/p/+6dFBCwVJkO1H
syBmgitGPDztMVYhuos0HYooR+NFMuenbQN6UCdn6IzZU970IJDxRtvqvUg5DU3e
U/R1EKGxGI3OFkpou6QUen5u8PC4A3IqTAEmXlD8mwu9n4248XtNt2ZB+QIEAQqU
jwKBgDAu2g3kDsP2vnGjbs7VC3FMY8hpSQ4C30BbNJahzshOE959/oLC3Kg4vic/
ZDJ2rzozyJPhsyVxFWZJhMFRlUT2+l7Yu0VXFLSaf2Y6iCfjPirq0es5Wrc5NxZj
Vv+ggk5dHu1DvtWi6pAoEivoIV8iVhUybMWWzB03az2/7LjHAkEA+BM8P8+S41DI
/Xq5aKdcEkQKUTlAY2QD3tBbsahANELWOK8Pn1xyOAFQA4bymoIPDmu07NPp3fR6
VmPMUVgPdQJBAMxhIzWjJU8A/TMLw0i4PQdITxfr/D8Ph5NUUFfGDl9aLxWtFsDp
mM2uJcIbNZ7H7F/hnq69SBAd9s16ZYHhu/UCQQCJHT5H6c0rdYxV4o4alT8lY64U
SvxVaMbj9kKLHx90OBEt0ocV/dteF9w4Me7GTc74W1aI+UcAPs+goX7ZGrKjAkBn
GZA9nRfz9QdLhvVmC2049+Ucc4EsmoOPmbj5LCXWOBzmS1mr82EsgDZpYJcQt+03
fbCf8PHq55w07DjWooHjAkB2ax9z6aOJ3mTLqzVr7P3oCxLQ90bZJrbsbKhZKCjS
Wx+eQQr4ZsSx5DB/7bsOLiC8EAl3gK/5LBouyuoJadm3
-----END RSA PRIVATE KEY-----
```

или "punk" в конце:

```
$ ./eschalot -t4 -r "punk$"
----------------------------------------------------------------
ghb6lbhn3v6zpunk.onion
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQCmD/2NmwEf2r8oJbTOhsmo1vetaoS0RTGiNqpph+rWR4rPbph/
3ACoHbznp9HEEWkiURZ9dmctZnc3PNfUl0laZA1TIKHXKASORhx4n4HqDk17TyU8
DdL9d5992SwJbFwrJRqI1SOjJUNeZrBU7p6rfSYbWtKUL/QtEOFDNyiFWwIEAQGC
XwKBgEDe1ENmpSEyVmuG4mkucKewTiIJLKbhUiuQjdWdEmWD4MVwKphZa8p3C0B1
Iq5cTLbyXkOCpj08bVsjTn3mr02XmryG/bEjvIcyx6eVGpWOLV4GqWB7kq6y76EO
QRDEH8Fn0E29HUn9i5h3QbiwW+MDDrFjK5iOcGn+Ci2C9FRTAkEA1X7vNiv77To9
VhMj/PrW4z/y6+QQCr+6zdVfwtLKByd3372tMhIrkeMLa2aED6zQV9mLI0CBzPvQ
WLk53V44NQJBAMcfjvhapiOPwI3wi+BBCnck06rorj/SnsOEAoBy0w560OCLqk7g
XgOlz9vUxaGpP3olNFb+TTrM+Rn0tMg4GU8CQH3ACezJRD3Ayh2hTAK+yrjENRjy
njNOJcROb8RQ2UZw7zdFFQOk9brO9+2EihLfRwKHws9sjwAHQaQQt0BCIIcCQEgE
z5qPSiFwN6ihvfq88DQsaK8SdkBSiDNgd5zptKcWJ94C74X1gXRLT51suQKSuxzN
ePhjmBcJOkYnqDe96OcCQQCrmMvqOnAIQrrs5RhOCWSyJDruDbFcpYGNh3SU5lYW
aBumHPUzqi6rEgYaTJPp2e93puOasc3SH0Q1JWdDRDUM
-----END RSA PRIVATE KEY-----
```

Работают все регулярные выражения.

Ключ `-c` позволяет выводить бесконечное кол-во результатов до завершения выполнения по Ctrl+c. Удобно перенаправить в файл и потом выбрать лучшие варианты.<br>
Помимо этого программа умеет делать выборки по словарю.<br><br>
Далее нам необходимо скопировать ключ понравившегося домена и заменить им основной ключ. То есть открываем к примеру **/var/lib/tor/site1/private_key**, стираем содержимое и вставляем:

```
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQCmD/2NmwEf2r8oJbTOhsmo1vetaoS0RTGiNqpph+rWR4rPbph/
3ACoHbznp9HEEWkiURZ9dmctZnc3PNfUl0laZA1TIKHXKASORhx4n4HqDk17TyU8
DdL9d5992SwJbFwrJRqI1SOjJUNeZrBU7p6rfSYbWtKUL/QtEOFDNyiFWwIEAQGC
XwKBgEDe1ENmpSEyVmuG4mkucKewTiIJLKbhUiuQjdWdEmWD4MVwKphZa8p3C0B1
Iq5cTLbyXkOCpj08bVsjTn3mr02XmryG/bEjvIcyx6eVGpWOLV4GqWB7kq6y76EO
QRDEH8Fn0E29HUn9i5h3QbiwW+MDDrFjK5iOcGn+Ci2C9FRTAkEA1X7vNiv77To9
VhMj/PrW4z/y6+QQCr+6zdVfwtLKByd3372tMhIrkeMLa2aED6zQV9mLI0CBzPvQ
WLk53V44NQJBAMcfjvhapiOPwI3wi+BBCnck06rorj/SnsOEAoBy0w560OCLqk7g
XgOlz9vUxaGpP3olNFb+TTrM+Rn0tMg4GU8CQH3ACezJRD3Ayh2hTAK+yrjENRjy
njNOJcROb8RQ2UZw7zdFFQOk9brO9+2EihLfRwKHws9sjwAHQaQQt0BCIIcCQEgE
z5qPSiFwN6ihvfq88DQsaK8SdkBSiDNgd5zptKcWJ94C74X1gXRLT51suQKSuxzN
ePhjmBcJOkYnqDe96OcCQQCrmMvqOnAIQrrs5RhOCWSyJDruDbFcpYGNh3SU5lYW
aBumHPUzqi6rEgYaTJPp2e93puOasc3SH0Q1JWdDRDUM
-----END RSA PRIVATE KEY-----
```

После чего перезапускаем TOR:

```
$ sudo /etc/init.d/tor restart
```

проверяем **/var/lib/tor/site1/hostname**, если он поменялся на нужный адрес, значит всё прошло успешно. Если же по каким-то причинам что-то пошло не так - проверьте правильно ли скопировали ключ и верно ли выставлены права доступа к ключу. В случае проблем удалите каталог **/var/lib/tor/site1/**, перезапустите TOR и попробуйте ещё раз.

## Аналоги

В случае если **eschalot** чем-то не понравился можно попробовать воспользоваться его программой-родителем - <a href="https://github.com/katmagic/Shallot" target="_blank">Shallot</a>.
