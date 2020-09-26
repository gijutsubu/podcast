---
title: 'Next.jsでPodcastブログを作った'
date: '2020-09-24'
presenters: ['谷口']
audiences: ['富本']
draft: false
---

サイトはこれ

[技術部](https://github.com/gijutsubu/podcast)

- podcastを配信するためのブログが作りたかった
- 簡単に作りたかった
- でも音源 + Markdownを取り扱いたい

## Next.jsとは

- [Vercel](https://vercel.com/)が開発した[React](https://reactjs.org/)フレームワーク

## Next.jsの何が良かったか

- 設定がほぼない
  - なくても動く
  - 必要ならば[`next.config.js`](https://nextjs.org/docs/api-reference/next.config.js/introduction)に記載する
- SSGの機能
- Typescriptサポート
  - 移行がかなり楽
- ファイルシステムルーティングサポート
  - 設定が少ない
  - カスタマイズが容易
- exampleとlearnが豊富すぎる
  - [Learn](https://nextjs.org/learn/basics/create-nextjs-app)がやばすぎる
  - これだけやればほとんどの機能を理解できる
  - [Examples](https://github.com/vercel/next.js/tree/canary/examples)多すぎる
  - 作りたいもののテンプレートがほぼ揃っている

# 若干ウッとなったところ

- デフォルトで`html`タグに`lang`を設定できない
  - `pages/_document.tsx`で設定する
- コンパイルエラーのときのメッセージがまだよくわからない
