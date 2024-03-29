[![Actions Status](https://github.com/gijutsubu/podcast/workflows/deploy/badge.svg)](https://github.com/gijutsubu/podcast/actions)

# 技術部

## <https://gijutsubu.com/>

## 記事の置き場

```
.
└── posts
```

- ファイル名がパスになる
  - `posts/example.md`の場合、`/posts/example`でアクセス可能

## 音源の置き場

```
.
└── public
    └── sounds
```

- とりあえず`MP3`限定
- 記事のファイル名と同じにする
  - `posts/example.md`の場合、`public/sounds/example.mp3`

## 記事の書き方

- `Markdown`形式で記述する
- 下記のようにメタデータを記載する

```md
---
title: 'kubernetesについて'
date: '2020-01-01'
draft: false
presenters: ['田中']
audiences: ['中村', '橋本']
---
```

- `presenters`と`audiences`は省略可能
- `draft: true`だと公開されない
  - ただし`npm run dev`で確認する場合は表示される

## ローカルで確認

```bash
npm install
npm run dev
```

- `localhost:3000`にて確認

## 記事を公開する方法

- `main`ブランチに`push`する

```bash
git push origin main
```

- 記事のメタデータ`draft`が`false`でないと公開されないので注意
