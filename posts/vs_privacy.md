---
title: "3rd-party Cookieを巡る環境の変遷"
date: "2020-09-24"
presenters: ["富本"]
audiences: ["谷口", "奥山"]
draft: false
---

# はじめに

とあるアドテクに務める富本が、技術部の二人に `Cookie`の基礎知識(この doc)と、Cookie 周りのアドテク界隈のてんやわんや(podcast 上)についてお伝えします。

# そもそも Cookie って何?

NTT さんの言葉をお借りすると、Cookie とは、

**Web サイト（Web サーバ）側が Web ブラウザを通じてアクセスしてきたパソコンやスマホにユーザを識別するための ID や閲覧履歴などの情報を書き込み、一時的に保存する仕組み** のことです。

> NTT さんの言葉: https://www.ntt.com/personal/ocn-security/case/column/20200116.html

もう少し柔らかい表現で Cookie を表現するとすれば、**Web 上の `足跡`** と表せるかと思います。

Cookie の仕組みを通じて、**Web アプリケーションは、ユーザーがどのページで、何を行なってきたのかを、大まかに把握することができます。**

簡単に Cookie の概念がわかったところで、

具体的にこの仕組みが、どのようにして達成されているか、実際に Cookie が用いられているサイトを触りながら確認してみましょう。

## Cookie が用いられているサイト

ここで、Amazon を開いてみましょう。

> https://www.amazon.co.jp/

このとき、

- login 画面を表示される人

- login 画面を表示されない人

がいるかと思います。

---

このことから、

`https://www.amazon.co.jp/` では、なんらかの仕組みを用いて、

**ユーザーが未ログインか login 済みか判断し、login 画面を切り替える**

仕様になっていることがわかります。

この「なんらかの仕組み」 は、**Cookie** を用いて達成されています。

では、具体的に、この仕組みを実現するために、Cookie はどのように用いられているのでしょうか?

## Cookie を用いて login 済みかどうか識別する仕組みとは

具体的な結論からいうと、

**要件**: _ユーザーが未ログインか login 済みか判断し、login 画面のレンダリングを切り替える_

という要件を満たすための仕組みは、主に 2 つのステップによって構成されています。

1. `https://www.amazon.co.jp/` では ログインに成功した際、_login したかどうかを判別するための識別子_ をブラウザに発行する。

2. `https://www.amazon.co.jp/` に接続した際、ブラウザが _login したかどうかを判別するための識別子_ を持っていれば、login 済の画面をレンダリングする。

この

_login したかどうかを判別するための識別子_

こそが

**Cookie** です。

以下では、それぞれの方法をより具体的に確認していきましょう。

## 仕組み ①: Cookie の発行

まず、ステップ `1`

> 1. `https://www.amazon.co.jp/` では ログインに成功した際、_login したかどうかを判別するための識別子_ をブラウザに発行する。

において、`https://www.amazon.co.jp/`が、ブラウザに対してどのように Cookie を発行しているかを確認してみましょう。

---

デベロッパーツールを確認すると、 `https://www.amazon.co.jp/` では、login 処理が行われたあと、login したことを証明するいくつかの Cookie をブラウザに発行していることがわかります。

試しに、これらの Cookie を削除してから、再度ブラウザを reload してみてください。すると、未 login 画面が表示されます。

では、Cookie は、どのように Amazon から発行されているのでしょうか?

### どのように ブラウザに対して Cookie が発行されているのか？

Cookie をブラウザに対して発行する方法は主に 2 つあります。

#### 方法 1. Web アプリケーションのレスポンスヘッダに Cookie を付与して、ブラウザに発行する

1 つ目の方法は、Web アプリケーションのレスポンスヘッダに Cookie を付与して、ブラウザに発行する方法です。

`Set-Cookie` ヘッダを付与することで、ブラウザに対して Cookie が付与されます。

> Set-Cookie: https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Set-Cookie

_Cookie を発行するエンドポイントの例: Express フレームワークの場合_

```js
app.get('/login', (request, response) => {
   ...

   // Cookieをレスポンスヘッダにセットする
   response.cookie('success_login', 'Success login at ...', {

      // Cookieに属性を付与する
      maxAge: XXXXX,
      ...

   })
   ...
})

```

Amazon の場合も、この方法で、ログインが完了した際、ブラウザに対して `既にログインしていることを証明するCookie` を発行しています。

下記が、Amazon において、その役割を果たしているエンドポイントだと思われます。

> ユーザー名とパスワードを受け付け、そのレスポンスとして Cookie を発行するエンドポイント: `https://www.amazon.co.jp/ap/signin`

このように、Web アプリケーション内の HTTP ヘッダに `Set-Cookie` を用いて付与される Cookie を

一般的に **Server-Side Cookie** と呼びます。

---

#### 方法 2. ブラウザ上で、JavaScript を用いて、ブラウザに発行する

この Server-Side Cookie と相対するのが、**Client-Side Cookie**です。

**Client-Side Cookie** とは、Web ページ上で、 JavaScript によって発行された Cookie のことを指します。

_ページ上で Cookie を発行する script タグ_

```html
<script>
  document.cookie = "success_login=Success login at ...";
</script>
```

上記のように、JavaScript を用いることでも、Cookie を発行することができます。

---

さて、これまでに、

**要件**: _ユーザーが未ログインか login 済みか判断し、login 画面のレンダリングを切り替える_

という要件を満たすための 2 つのステップのうち、

1. `https://www.amazon.co.jp/` では ログインに成功した際、_login したかどうかを判別するための識別子_ をブラウザに発行する。

というステップについて、Cookie の発行方法を交えて、具体的に紹介しました。

現在ブラウザは、これらの方法によって、

`既にログインしていることを証明するCookie`

を付与されています。

続いて、要件を満たす 2 つのステップのうち、

2. `https://www.amazon.co.jp/` に接続した際、ブラウザが _login したかどうかを判別するための識別子_ を持っていれば、login 済の画面をレンダリングする。

というステップについても、具体的に確認していきましょう。

## 仕組み ②: Cookie の送信

現在、 _login したかどうかを判別するための識別子_ としての Cookie がブラウザに付与されています。

この Cookie は、

**要件**: _ユーザーが未ログインか login 済みか判断し、login 画面のレンダリングを切り替える_

という要件を満たすための 2 つのステップのうち、2 つ目のステップ

2. `https://www.amazon.co.jp/` に接続した際、ブラウザが _login したかどうかを判別するための識別子_ を持っていれば、login 済の画面をレンダリングする。

で利用されます。

では、この Cookie は、どのように `https://www.amazon.co.jp/` で利用されるのでしょうか?

### どのように ブラウザに発行された Cookie は利用されているのか?

Cookie の利用は、Cookie の性質に基づいて行われています。

#### Cookie の性質とは

**[Cookie の性質 1]**

基本的に、Cookie は、**発行された時点で、その Cookie 自身に、自身の発行元である domain を記憶** しています。

---

**[Cookie の性質 2]**

**ブラウザがリクエストを行う際、**

ex) `https://www.amazon.co.jp/` を開く等

**ブラウザ上に発行されている Cookie は、Cookie 自身に記録された発行元ドメインを確認し、**

**そのドメインがリクエスト先のドメインと一致していた場合、そのリクエストのヘッダーに付与** されます。

---

_既にログインしていることを証明する Cookie_ は、 Amazon からブラウザに発行された時点で、自身に発行元ドメインである、 `www.amazon.co.jp` を記憶しています。

この Cookie をブラウザが保持したまま、`https://www.amazon.co.jp/` にリクエストを送信した際、その Cookie は `https://www.amazon.co.jp/` へ送信されます。
`https://www.amazon.co.jp/` では、受け取ったリクエストヘッダ内に、_既にログインしていることを証明する Cookie_ があるかどうかを確認し、その Cookie の有無によって、返却する html を切り替えているのです。

これにより、

**要件**: _ユーザーが未ログインか login 済みか判断し、login 画面のレンダリングを切り替える_

という要件を満たすための 2 つのステップのうち、2 つ目のステップ

2. `https://www.amazon.co.jp/` に接続した際、ブラウザが _login したかどうかを判別するための識別子_ を持っていれば、login 済の画面をレンダリングする。

を達成しています。

---

さて、これまでに Cookie が用いられているケースを通じて、Cookie の下記の性質について触れました。

- 基本的に、Cookie は、_発行された時点で、その Cookie 自身に、自身の発行元である domain を記憶_ しています。
- ブラウザがリクエストを行う際、_ブラウザ上に発行されている Cookie は、Cookie 自身に記録された発行元ドメインを確認し、そのドメインがリクエスト先のドメインと一致していた場合そのリクエストのヘッダーに付与_ されます。

以降の Tutorials では、この性質を理解しておけば、理解がスムーズになるでしょう。

# `1st-Party Cookie` と `3rd-Party Cookie` について

先程紹介した login 機能を筆頭に、ネットビジネスを構成する上では、Cookie の存在は欠かせないものとなっています。

特に、ネット広告ビジネスにおいて、Cookie はとても重要な役割を果たしています。

中でも、Cookie の中で、`3rd-Party Cookie` 及び `1st-Party Cookie` と呼ばれる Cookie は、ネット広告を知る上では欠かせません。

以降、これらの Cookie について、解説していきます。

# 3rd-Party Cookie と 1st-Party Cookie とは?

はじめに、結論から抑えておきましょう。

**Cookie は、訪れているページのドメインと、Cookie の発行元のドメインによって、呼称が異なります。**

このとき、

- 訪れているサイトのドメインと、異なるドメインから発行されている Cookie を、**3rd-Party Cookie**
- 訪れているサイトのドメインと、等しいドメインから発行されている Cookie を、**1st-Party Cookie**

と呼びます。

なぜ `3rd` なのかについてですが、訪れているページとは、異なるドメインから発行されているという点において、第三者というニュアンスを込めて、**3rd-party Cookie** と呼ばれています。

| 訪れているページのドメイン | `example.com` から発行されている Cookie | `tracker.net` から発行されている Cookie |
| -------------------------- | --------------------------------------- | --------------------------------------- |
| `example.com`              | **1st**-Party Cookie                    | **3rd**-Party Cookie                    |
| `tracker.net`              | **3rd**-Party Cookie                    | **1st**-Party Cookie                    |

---

仮に、ブラウザが `example.com` から発行されている Cookie と、`tracker.net` から発行されている Cookie を持っているケースを考えてみましょう。

そのブラウザで、とある Web ページ `https://example.com/index.html` に接続してみます。

_index.html_

```html
<!DOCTYPE html>
<html lang="ja">
  <body>
    <p>ようこそ example.com へ!</p>
    <img src="https://tracker.net/test.jpg" />
  </body>
</html>
```

このケースだと、

訪れているページのドメインが `example.com` であるため、

- `example.com` から発行されている Cookie => **1st**-Party Cookie
- `tracker.net` から発行されている Cookie => **3rd**-Party Cookie

となります。

## 3rd-Party Cookie と 1st-Party Cookie の送信について

さて、ここで、`https://example.com/index.html` に接続したとき、

ブラウザからは、2 つのリクエストが送信されています。

1. `https://example.com/index.html` のページを要求するリクエスト
2. `https://example.com/index.html` のページ内で、img ソースを `https://tracker.net/test.jpg` に対するリクエスト

---

ここで、Cookie の性質を思い出してください。

- ブラウザがリクエストを行う際、_ブラウザ上に発行されている Cookie は、Cookie 自身に記録された発行元ドメインを確認し、そのドメインがリクエスト先のドメインと一致していた場合そのリクエストのヘッダーに付与_ されます。

この性質に基づき、もともとブラウザに付与されている Cookie

- `example.com` から発行されている Cookie => **1st**-Party Cookie
- `tracker.net` から発行されている Cookie => **3rd**-Party Cookie

は、発行されたドメイン別に、それぞれのリクエストヘッダに付与され、

1. `https://example.com/index.html` のページを要求するリクエスト + `example.com` から発行されている Cookie
2. `https://tracker.net/test.jpg` へ img を要求するリクエスト + `tracker.net` から発行されている Cookie

各サーバに送信されます。

このとき、`2` のケースでは、`https://example.com/index.html` 内で、第三者のドメインである `tracker.net` に対してリクエストを送信しており、そのリクエストヘッダに `tracker.net` から発行されている Cookie、いわゆる **3rd**-Party Cookie が付与されていることを認識しておいてください。

# Cookie の呼称について

さて、ここまでに

- Cookie の発行と送信の仕組み
- Client-Side Cookie と Server-Side Cookie の違い
- 3rd-Party Cookie と 1st-Party Cookie の違い

について扱いました。

ここまでに様々な Cookie の呼称が出てきたので、一旦これまでに登場した呼称をまとめてみましょう。

## 呼称のまとめ

本 Part では、4 種類の呼称が出てきました。
簡単におさらいしてみます。

#### 1st-Party Cookie と 3rd-Party Cookie

まず、1st-Party Cookie と 3rd-Party Cookie についてです。

これらは、訪れているページのドメインに応じて、相対的に決定される呼称です。

なので、

Cookie が発行されたのが、`Client-Side` か、`Server-Side` かに関わらず、

`1st-Party Cookie` と `3rd-Party Cookie` どちらかの呼称は持ちます。

ex) Client-Side で発行された 1st-Party Cookie, Server-Side で発行された 1st-Party Cookie 等

#### Client-Side Cookie と Server-Side Cookie

訪れているページのドメインに応じて、相対的に決定される `1st-Party Cookie` と `3rd-Party Cookie` に対して、

Client-Side Cookie と Server-Side Cookie は 発行方法によって決定する呼称です。

発行元によって Client-Side Cookie か Server-Side Cookie が決定し、

そのあと訪れたページのドメインに対して、動的に `1st-Party Cookie` と呼ぶか、 `3rd-Party Cookie`と呼ぶかが決定します。

#### Client-Side Cookie × 3rd-Party Cookie は存在しない

ここで、Cookie には大きく 4 つの組み合わせがあるのではないか??

と考えてみます。

1. Client-Side Cookie × 1st-Party Cookie
2. Server-Side Cookie × 1st-Party Cookie
3. Client-Side Cookie × 3rd-Party Cookie
4. Server-Side Cookie × 3rd-Party Cookie

しかし、実際には、**3. Client-Side Cookie × 3rd-Party Cookie** のケースの Cookie は存在しません。

---

Client-Side Cookie は、ページ内の JavaScript `document.cookie` によって生成されます。

その際、発行元のドメイン以外のドメインを指定した場合、Cookie のドメインの設定は暗黙的に無視されます。

_`https://example.com/index.html` 上で、JavaScript により、`tracker.net` ドメインの Cookie を発行しようとした場合_

```html
<!DOCTYPE html>
<html lang="ja">
  <body>
    <p>ようこそ example.com へ!</p>
    <img src="https://tracker.net/test.jpg" />
  </body>
  <script>
    document.cookie = "test=123; domain=tracker.net;";
  </script>
</html>
```

この場合は、Cookie の生成には失敗します。

> ドメインは JavaScript のオリジンと一致している必要があります。外部ドメインへのクッキーの設定は暗黙に無視されます。: https://developer.mozilla.org/ja/docs/Web/API/Document/cookie

そのため、実際には **Client-Side Cookie × 3rd-Party Cookie は存在しない** ということになります。

## 呼称のまとめ

_Cookie の発行方法と、ドメインで見る Cookie の呼称について_

| 発行方法/訪れたドメインに対する Cookie の発行元 | 1st-Party                             | 3rd-Party                             |
| ----------------------------------------------- | ------------------------------------- | ------------------------------------- |
| Client-Side Cookie                              | Client-Side Cookie × 1st-Party Cookie | 発行できない                          |
| Server-Side Cookie                              | Server-Side Cookie × 1st-Party Cookie | Server-Side Cookie × 3rd-Party Cookie |

# 最後に

ここまでに

1. Cookie の送信の性質
2. Cookie の生成方法が 2 パターンあること
3. Cookie 自体の発行元ドメインと、訪れたサイトによって、Cookie の呼称が変わること

の 3 点についてお話しました。

この Cookie に対する各規制が、 アドテク業界を賑わせて?います。
