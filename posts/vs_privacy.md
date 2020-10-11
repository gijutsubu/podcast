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

#### リターゲティング広告の仕組み

筆者は物件の間取りを見るのが趣味なので、よくsuumoを開きます。

例えば、こちらのページを回覧したとします。
> https://suumo.jp/chintai/jnc_000060837140/

するとネットサーフィン中、様々なページで、先程見た物件が表示されるというというものです。

このリターゲティング広告の仕組みは、`creteo社` 等から提供されています。
> criteo: https://www.gyro-n.com/dfm/criteo/#about-criteo


### Cookieを用いて簡単にリターゲティング広告を説明すると...

#### Cookieの発行

suumoのhtml内には、

**criteo社のエンドポイントに対してリクエストを送信するタグ**が設置されています。

また、このとき、このリクエスト内には、**suumoの `000060837140` の物件が掲載されたページを訪れたという情報**が記載されています。

ex) https://~.criteo.com/event?page=suumo_000060837140

このリクエストのレスポンスとして、`criteo.com` からこのブラウザに対して **このユーザーはsuumoの000060837140の物件を見てます** という情報を持ったCookieが発行(※1)されます。

**補足 ※1**

Cookieの基本的な発行方法は、サーバー内で動作しているwebアプリケーションのレスポンスヘッダにCookieを付与することです。

*https://~.criteo.com で接続できるwebアプリケーションのエンドポイントのイメージ*
  ```js
  app.get('/event', (req, res) => {
    res.cookie('visit_identifier', '{リクエストに付与されている、訪れたページ情報}', {
      maxAge: XXXXX,
      ...
    })
    res.json({})
  })

  ```

---

これにより、suumoのページを訪れたことで、下記のようなCookieがブラウザに発行されます。

- Cookie名: `visit_identifier`
- Cookieの値: `suumo_000060837140`
- Cookieが発行されたdomain: `~.criteo.com`

#### Cookieの送信

では、この発行されたCookieはどのように用いられるのでしょうか??

現在ブラウザは `~.criteo.com` から発行された、`visit_identifier` 名のCookieを持っています。

この `visit_identifier` Cookieの値には、ユーザーが訪れたページ`suumo_000060837140` が記載され、発行元のdomainには、`~.criteo.com` が記載されています。

ここで、まとめサイト `https://na○er.com` を訪れたとします。
このページ内には、下記のようなtagが設置されることで、リターゲティング広告が成立しています。

```html

<img id="retargeting_img">

...

<script>
  const image = document.getElementById("retargeting_img");
  
  img_url = myRequest("https://~.criteo.com/retargeting")
  
  /* 以降imageタグに対して、criteoから取得したurlを指定する */
  
  ...

</script>
```

ここで先程の原則を思い出してください。


```
ブラウザがリクエストを行う際、

ブラウザ上に発行されているCookieは、Cookie自身に記録された発行元ドメインを確認し、

そのドメインがリクエスト先のドメインと一致していた場合

そのリクエストのヘッダーに付与される
```

`https://na○er.com` 内に設置されたscriptタグ内では、`criteo.com` に対してリクエストが送信されています。


```js
img_url = myRequest("https://~.criteo.com/retargeting")
```

このとき、Cookieの原則に従い、このリクエストに際し、先程発行されたCookie: `visit_identifier` が、リクエストヘッダに付与されます。

`https://~.criteo.com/retargeting` では、このリクエストヘッダの
`visit_identifier` Cookieに付与された `suumo_000060837140` に基づいて、返却するimg urlを変更しています。

*https://~.criteo.com/retargeting で接続できるwebアプリケーションのエンドポイントのイメージ*
  ```js
  app.get('/retargeting', (req, res) => {
    
    const json = res.json(req.cookies)

    if (json.visit_identifier == "suumo_000060837140") {
        const img_url = "https://suumo.jp/chintai/jnc_000060837140.img"
    } 

    ...

    res.json({
      "img_url":  
    })
  })

  ```

他にもCookieを活かした広告ビジネスは存在します。

## 成果報酬型広告






TODO safariとChromeで、右上の広告枠が違うことを確認してみましょう。
