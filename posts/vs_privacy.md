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

いわゆるアフィリエイトというものです。

ASPと呼ばれる、Affiliate Service Provider が、
このCookieの仕組みを用いて、Affiliateの仕組みを展開しています。

---

住みやすい街を紹介する、タウンブログ `https://town-blog.net` があるとしましょう。

その中で、**〇〇町のおすすめの物件を探すならsuumoが1番!!** という記事`https://town-blog.net/article/00123` があり、その記事を見て、suumoでおすすめの物件を探そうと思いました。

...

タウンブログを見た数日後、実際にsuumoで、〇〇町の物件の内見予約をしました。

タウンブログのおかげで、suumoが集客できたというわけです。

suumo側からこのタウンブログに対して、どうにかお礼がしたいものですが、それを判別するには、**suumoで内見予約をしたユーザーが、実際にタウンブログを訪れていることを確認する仕組み** が必要です。

各ASPは、この仕組みを、Cookieを用いて実現しています。


## Cookieの発行

タウンブログの、**〇〇町のおすすめの物件を探すならsuumoが1番!!** という記事内には、

**Affiliate Service Provider のエンドポイント `https://asp.net` に対してリクエストを送信するタグ**が設置されています。

また、このとき、このリクエスト内には、タウンブログの、**「〇〇町のおすすめの物件を探すならsuumoが1番!!」の記事を訪れたという情報** が記載されています。

ex) https://asp.net/event?article=townblog00123

このリクエストのレスポンスとして、`asp.net` からこのブラウザに対して ***「〇〇町のおすすめの物件を探すならsuumoが1番!!」の記事を訪れた** という情報を持ったCookieが発行されます。

- Cookie名: `visit_article`
- Cookieの値: `townblog00123`
- Cookieが発行されたdomain: `asp.net`

## Cookieの送信

さて、ここで、suumoの予約予約完了ページに、`asp.net` へリクエストを送信するタグを設置してみます。

```html

<script>
    
  myRequest("https://asp.net/conversion")

</script>

```

この際、ブラウザに発行されているCookie `visit_article` は、Cookieの原則に基づき、上記のリクエストのヘッダに付与され、`asp.net`に Cookieが送信されます。

その際、ASPのエンドポイント `https://asp.net/conversion` では、`townblog00123` を値として持つ、`visit_article`を受け取ることができます。


**suumoの予約予約完了ページ**から、`townblog00123`を値に持つCookieを受け取ることで、**「〇〇町のおすすめの物件を探すならsuumoが1番!!」の記事を訪れたユーザー** が、suumoの内見予約を行ったことを、ASP `asp.net` は把握することができます。

# Cookieを用いた広告ビジネスに対する規制

これまでに、とあるサイトを訪れたとき、既にブラウザに対して発行されている、**訪れたサイトとは異なるドメインのCookie**を、発行元のドメインに送信することによって、広告ビジネスの仕組みが提供されていることを確認しました。

ex) リタゲ
  - `na○er.com` に訪れたとき、`criteo.com` から発行されたCookieを、発行元である`criteo.com` に送信する

ex) アフィ
  - `suumo.jp` に訪れたとき、`asp.net` から発行されたCookieを、発行元である`asp.net` に送信する
  
## 3rd-party Cookie とは
Cookieは、訪れているページと、発行元によって、呼称が異なります。

今回のケースのように、訪れているページとは、異なるドメインから発行されているCookieのことを、第三者というニュアンスを込めて、**3rd-party Cookie** と呼びます。

今回のケースでは、

- `na○er.com` のページを訪れている際、第三者である `criteo.com` から発行されているCookieは、`3rd-party Cookie` となります。

- `suumo.jp` のページを訪れている際、第三者である `asp.net` から発行されているCookieは、`3rd-party Cookie` となります。

どのページを訪れているかによって、ブラウザに発行されているCookieの呼称は変わります。

`suumo.jp` を訪れているときは、`asp.net` から発行されたCookieは`3rd-party Cookie` ですが、`asp.net` を訪れているとき、そのCookieは `3rd-party Cookie` ではありません。

## 3rd-party Cookie に対する規制

近年Safariを始めとして、この **3rd-party Cookieの送信がブロック** されています。

具体的には、

`suumo.jp` に訪れたとき、ブラウザに対して `asp.net` から発行されているCookieを持っていた場合、

そのページ内で  `asp.net` へリクエストを送信しても、そのリクエストヘッダに `asp.net` から発行されているCookieは付与されない

という仕様が各ブラウザにて展開されつつあります。

#### なぜ規制されているか?

背景として、プライバシーの問題があります。

先程、`asp.net` へリクエストを送信するタグを、suumoの内見予約完了ページに配置することで、**「〇〇町のおすすめの物件を探すならsuumoが1番!!」の記事を訪れたユーザー** が、suumoの内見予約を行ったことを、ASP `asp.net` は把握することができるお話をしました。

では仮に、この `asp.net` へリクエストを送信するタグが、あらゆるページに配置されていたとしましょう。

すると、仮に`asp.net` から発行されたCookieをブラウザが持つ場合、そのブラウザを通じてユーザーが訪れたサイトを、`asp.net` はタグ内のリクエストを通じて全て把握することができます。

> Chrome 3rd-party Cookieの廃止について: https://blog.chromium.org/2020/01/building-more-private-web-path-towards.html

# 1st-party Cookieを用いた広告ビジネス

ここで、各社は1st-party Cookieを用いたビジネスを展開します。

## 1st-party Cookieとは

さきほど、3rd-party Cookieの定義について記載しました。

> 訪れているページとは、異なるドメインから発行されているCookieのことを、第三者というニュアンスを込めて、**3rd-party Cookie** と呼びます。

この3rd-party Cookieと相対するのが、**1st-party Cookie** です。

1st-party Cookieとは、訪れているサイトのドメインから発行されているCookieです。

ex)

`asp.net` から発行されたCookieは、`asp.net` を訪れているとき、`1st-party Cookie` と呼ばれます。

---

この1st-party Cookieに関しては、送信がブロックされていません。

冒頭の例で、amazon.co.jpを訪れた際、login済みかどうかを判別するCookieを、`amazon.co.jp` ドメインで発行しました。

このCookieは、amazon.co.jp に接続した際に、リクエストヘッダに付与されます。

仮に1st-party Cookieの送信をブロックした場合、ブラウザに発行されているlogin済みかどうかを判別するCookieを、amazon.co.jpに送信できず、login状態をブラウザ上で保持できないという問題が発生します。


## 1st-party Cookieを用いたアフィリエイトの仕組み

3rd-party Cookieがブロックされてしまっている場合、

先程登場した **suumoで内見予約をしたユーザーが、実際にタウンブログを訪れていることを確認する仕組み** は無効となってしまいます。

現在の主流として、この仕組みを1st-party Cookieを用いて実現しています。

#### Cookieの発行方法について

これまでに紹介したCookieの発行方法は、
サーバ上で起動しているWebアプリケーションの、レスポンスヘッダにCookieを記載するという方法でした。

この方法で発行されたCookieを **Server-Side Cookie** と呼びます。

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

このServer-Side Cookieと相対するのが、**Client-Side Cookie**です。

**Client-Side Cookie** とは、JavaScriptによって発行されたCookieを指します。

*html上でCookieを発行するscriptタグ*

```html

<script>
document.cookie = "test1=hello"
</script>

```

上記のように、JavaScriptを用いて、htmlが配置されたDomainのCookie、いわゆる**1st-party Cookieを操作することができます**。

JavaScriptを用いて、1st-party Cookie 発行にとどまらず、Cookieの値の取得や、Cookieの更新等も行うことができます。

※ このとき、JavaScriptで、そのページから見て **3rd-party Cookie** にあたるCookieの発行・操作はできません。これが可能である場合、あらゆるドメインのCookieに保存されている情報を取得できてしまうからです。

ex) ログイン情報や決済情報など

## Server-Side Cookie を用いたアフィリエイト
ここで、3rd-party Cookieの代わりに、**Server-Side Cookie** を用いて下記の要件を満たしてみましょう。

要件: *suumoで内見予約をしたユーザーが、実際にタウンブログを訪れていることを確認する*

#### 1.訪れたサイトを元に、遷移先のリンクをデコレーションする

ASPは、自社のサーバから、suumoの物件 `https://suumo.jp/chintai/jnc_000060837140/` にリダイレクトするリンク `https://asp.net/link_decorator?article=townblog00123` 発行します。

```js
app.get('/link_decorator', (req, res) => {
  const article = req.query.article
  const landing_page_url = `https://suumo.jp/chintai/jnc_000060837140/`
  res.redirect(landing_page_url+`?from=${article}`)
})
```

`asp.net` にて、遷移先の `https://suumo.jp/chintai/jnc_000060837140` のリンクに、どこからこのページにやってきたかを示す情報を付与します。

今回は、`https://town-blog.net/article/00123` からやってきたという情報をリンク上に付与したいので、`from=townblog00123` というクエリを付与して、`https://suumo.jp/chintai/jnc_000060837140/` へリダイレクトします。

ユーザーの行動を把握するために、リンクに情報を付与することを、一般的にリンクデコレーションと呼びます。

#### 2. Client-Side Cookieの発行


`https://suumo.jp/chintai/jnc_000060837140?from=townblog00123`に遷移してきました。

このとき、`from` クエリに保存されている、どのページから遷移してきたかという情報を値に持つ、Server-Side Cookieを発行します。

```html

<script>
const urlParam = location.search.substring(1);

// URLにパラメータが存在する場合
if(urlParam) {
  // 「&」が含まれている場合は「&」で分割
  const param = urlParam.split('&');
 
  // パラメータを格納する用の配列を用意
  let paramArray = [];
 
  // 用意した配列にパラメータを格納
  for (i = 0; i < param.length; i++) {
    let paramItem = param[i].split('=');
    paramArray[paramItem[0]] = paramItem[1];
  }
}

document.cookie = `visit_from=${paramArray.from}`
</script>

```

これにより、`suumo.jp` ドメインで、どのサイトから来たかという情報を持つ `visit_from` が発行されました。

この  `visit_from` Cookiehの発行元は、`suumo.jp` ドメイン であるため、`suumo.jp`配下のページであれば、JavaScriptで自由に操作することができます。


#### 3. Client-Side Cookieの値を取得してASPに送信する

この `suumo.jp` ドメインを発行元とする `visit_from` Cookieには、`suumo.jp`配下であればJavaScriptで操作することが可能です。

ここで、内見予約を完了した際に表示されるページ `https://suumo.jp/chintai/finished_reservation` (仮のURL) 上に、ASP `asp.net` ドメインに対してリクエストを送信するscriptタグを配置します。

```html
<script>

// cookieを取得して、それをもとにbodyを形成し、requestを送信するscriptを記載 z

</script>

```

上記のscript内では、`visit_from` から `suumo` に接続したユーザーが、どのブログを見ていたかという情報: `townblog00123` を取得し、その情報を `asp.net` に送信しています。

これにより、`asp.net` は *suumoで内見予約をしたユーザーが、実際にタウンブログを訪れていることを確認する* という要件を達成することができます。

#### まとめ

現在の主流は、これまで説明したように、

1. リンクデコレーションによって、URLにブログの回覧履歴を書き込む
2. 遷移先で、URLに書き込まれたブログの回覧履歴を、Client-Side Cookieとして遷移先のドメインに保存する
3. Client-Side Cookie が発行されたドメイン上の、ユーザーが訪れたかどうかを計測したいページで、Client-Side Cookieの値を取得し、それを伴ったリクエストを送信する

