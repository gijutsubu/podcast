---
title: 'Next.jsでPodcastブログを作った'
date: '2020-09-24'
presenters: ['谷口']
audiences: ['富本']
draft: false
---

# Podcastを配信するためのブログが作りたかった

- 簡単に作りたかった
- でも音源 + Markdownを取り扱いたい
- [HUGO](https://gohugo.io/)や[Gatsby](https://www.gatsbyjs.com/)は使ったことがあって嫌だった
- [NuxtJS](https://nuxtjs.org/)は会社でVueを使っているのでやめておこう
- [Next.js](https://nextjs.org/)がモダンだと耳にした

## Next.jsとは

### [Next.js](https://nextjs.org/)

- [Vercel](https://vercel.com/)が開発した[React](https://reactjs.org/)フレームワーク

## Next.jsの何が良いのか

- 設定がほぼない
  - Gatsbyで設定をいっぱい書いた記憶があって大量の設定ファイルは嫌だった
  - Next.jsはなくて動く
  - 必要ならば[`next.config.js`](https://nextjs.org/docs/api-reference/next.config.js/introduction)に記載する
- SSGの機能
- SSRできる(当ブログでは不要)
- Typescriptサポート
  - 移行手順の手厚い[ドキュメント](https://nextjs.org/learn/excel/typescript/nextjs-types)
- チュートリアル([Learn](https://nextjs.org/learn/basics/create-nextjs-app))がやばすぎる
  - これだけやればほとんどの機能を理解できる
- Dynamic Routes(ファイルシステムルーティング)が楽
  - 設定が少ない
  - カスタマイズも容易でした
- [Examples](https://github.com/vercel/next.js/tree/canary/examples)が窒息するレベルで豊富
  - 作りたいもののテンプレートがほぼ揃っている
- 専用のテンプレート記法を学ぶ必要がない
  - Reactを書くだけ

## 良くなかったところ

- まだほぼ見つかっていない
- デフォルトで`html`タグに`lang`を設定できない
  - [`pages/_document.tsx`](https://nextjs.org/docs/advanced-features/custom-document)で設定する
- `pages/_document.tsx`において`next/docuemnt.Document`を継承したclass componentしか使えない(function componentが使いたい)

## 完成品

<https://github.com/gijutsubu/podcast>

## 挙がった話題

- ReactフレームワークといえばNext.js
- VueフレームワークといえばNuxt.js
  - 正しいのか?
- TypescriptとVuexの相性の話
  - Refs: <https://dev.to/3vilarthas/vuex-typescript-m4j>
- 静的サイトジェネレーターについて
  - Refs: <https://dyno.design/articles/what-is-static-site-generator/>
- CMSとSSG
  - Refs: <https://hamamuratakuo.blog.fc2.com/blog-entry-1112.html>
- Hexo
  - Refs: <https://hexo.io/>
- Hugoのビルドが早い
  - Refs: <https://exlair.net/trend-for-static-site-generator/>
- Next.jsのテンプレート
  - Refs: <https://colorlib.com/wp/nextjs-templates/>
- フロントエンドの移り変わり
  - Refs: <https://note.com/koojy3/n/n58d24a7f3358>
