---
title: '3rd-party Cookieを巡る環境の変遷'
date: '2020-09-24'
presenters: ['富本']
audiences: ['谷口']
draft: true
---

# はじめに
とあるアドテクに務める富本が、技術部の二人に `3rd-party Cookie` を巡るアドテク界隈のてんやわんやについてお伝えします。

## そもそもCookieって何?

N○Tさんの言葉をお借りすると、Cookieとは、

**Webサイト（Webサーバ）側がWebブラウザを通じてアクセスしてきたパソコンやスマホにユーザを識別するためのIDや閲覧履歴などの情報を書き込み、一時的に保存する仕組みです。**
> https://www.ntt.com/personal/ocn-security/case/column/20200116.html

ざっくりCookieの目的がわかったところで、この目的がどのようにして達成されているか、実際にCookieが用いられているサイトを触りながら確認してみましょう。

## Cookieの仕組み

ここで、○mazonを開いてみましょう。

> https://www.amazon.co.jp/

このとき、

  - login画面を表示される人
  - login画面を表示されない人
  
がいるかと思います。

このことから、

**`https://www.amazon.co.jp/` は、なんらかの仕組みを用いて、ユーザーが未ログインかlogin済みか判断し、login画面のレンダリングを切り替えている**

ことがわかります。

このなんらかの仕組みというものが、Cookieを用いた仕組みのことです。

この仕組みは大まかに、

1. Cookieの発行
2. Cookieの送信

によって成り立っています。

#### Cookieの発行

要件: *ユーザーが未ログインかlogin済みか判断し、login画面のレンダリングを切り替えている* 

上記の要件を満たすために、○mazonでは

1. **loginしたかどうかを判別するための識別子を発行する**

する必要がありそうです。

この識別子が Cookie です。

デベロッパーツールを確認すると、 `https://www.amazon.co.jp/` では、login処理が行われたあと、loginしたことを証明するいくつかのCookieをブラウザに発行していることがわかります。

TODO: 画像

(試しにこれらのCookieを削除してから、再度ブラウザをreloadしてみてください。すると、login画面が再度表示されます。)

さて、実際にCookieが○mazonから発行されているのを確認できました。

現在ブラウザは、`既にログインしていることを証明するCookie` を付与されています。

では、`https://www.amazon.co.jp/` このCookieを用いて、loginを識別しているのでしょうか??

#### Cookieの送信

結論から言うと、

1. `https://www.amazon.co.jp/` にリクエストを送信した際に、先程 *ブラウザに対して発行されたログインの有無を確認するCookie* も一緒に `https://www.amazon.co.jp/` へ送信されます。

TODO: 画像

`https://www.amazon.co.jp/` は、リクエストヘッダ内に、*ブラウザに対して発行されたログインの有無を確認するCookie* があるかどうかを確認し、そのCookieの有無によって、返却するhtmlを切り替えています。


このCookieの送信には、ある原則があります。

#### Cookieの原則

Cookieは、発行された時点で、そのCookie自身に、自身の発行元であるdomainを記憶しています。

TODO: 画像

**ブラウザがリクエストを行う際、**

ex) `https://www.amazon.co.jp/` を開く等

**ブラウザ上に発行されているCookieは、Cookie自身に記録された発行元ドメインを確認し、**

ex) TODO: 画像

**そのドメインがリクエスト先のドメインと一致していた場合**

ex) TODO: 画像

**そのリクエストのヘッダーに付与** されます。

ex) TODO: 画像

さて、この知識を抑えてからが本題です。

# Cookieを用いた広告ビジネス

さて、本題ですが、

**ブラウザがリクエストを行う際、**

**ブラウザ上に発行されているCookieは、Cookie自身に記録された発行元ドメインを確認し、**

**そのドメインがリクエスト先のドメインと一致していた場合**

**そのリクエストのヘッダーに付与** 

されるというCookieの原則を用いて、いくつかの広告ビジネスが展開されていました。

## リターゲティング広告

一度見た広告が、別ページでも何度も表示されることありますよね?
これがリターゲティング広告と言われるものです。

#### 実際にリターゲティングされてみる

筆者は物件の間取りを見るのが趣味なので、よくsuumoを開きます。

例えば、こちらのページを回覧した直後にyahooのtopへ行くと、
> https://suumo.jp/chintai/jnc_000060837140/?bc=100211066222

なんと、先程みた物件の告知がyahootopに掲載されています。
> https://www.yahoo.co.jp/

このリターゲティング広告の仕組みは、`creteo社` から提供されています。
> criteo: https://www.gyro-n.com/dfm/criteo/#about-criteo
> creteo と yahoo の協業: https://www.criteo.com/jp/success-stories/yahoo-japan/


### Cookieを用いて簡単にリターゲティング広告を説明すると...

#### Cookieの発行

suumoのhtml内には、

下記のURLにリクエストを送信するtagが設置されています。

> https://sslwidget.criteo.com/event?a=6316&v=5.6.2&p0=e%3Dexd%26site_type%3Dd&p1=e%3Dvp%26p%3D100211066222&p2=e%3Dce%26m%3D%255B%255D&p3=e%3Ddis&adce=1&tld=suumo.jp&dtycbr=50443

domainを見ると、このリクエストは、リターゲティング広告の仕組みを提供する `criteo.com` 社に対してのリクエストであることがわかります。

このリクエストのレスポンスとして、`criteo.com` からこのブラウザに対して **このユーザーはsuumoをめっちゃ見てます** という情報を持ったCookieが発行(※1)されます。

TODO: 画像を貼り付け


**補足 ※1**

Cookieの基本的な発行方法は、サーバー内で動作しているwebアプリケーションのレスポンスヘッダにCookieを付与することです。

*https://sslwidget.criteo.com で接続できるwebアプリケーションのイメージ*
  ```js

  const express = require('express')
  const app = express()

  app.get('/event', (req, res) => {
    res.cookie('uid', 'fd9b...(意訳:この人はsuumoのサイトを見ていました)', {
      maxAge: XXXXX,
      ...
    })
    res.json({})
  })

  ```

#### Cookieの送信

では、この発行されたCookieはどのように用いられるのでしょうか??

ここで先程の原則を思い出してください。


```
ブラウザがリクエストを行う際、

ブラウザ上に発行されているCookieは、Cookie自身に記録された発行元ドメインを確認し、

そのドメインがリクエスト先のドメインと一致していた場合

そのリクエストのヘッダーに付与される
```

現在ブラウザは `criteo.com` から発行された、`uid` 名のCookieを持っています。この `uid` Cookieの値には、`fd9b...(意訳:この人はsuumoのサイトを見ていました)`が記載され、発行元のdomainには、`criteo.com` が記載されています。

TODO: 画像

ここで、先ほどのyahooのTOPページの、ネットワークを見てみると、criteoとの通信があることがわかります。どうやら、ここで、先程SUUMOのページを見たときに確認できたCookieが送信されているようです。






## 成果報酬型広告






TODO safariとChromeで、右上の広告枠が違うことを確認してみましょう。
