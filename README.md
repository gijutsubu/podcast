# podcast [WIP]

## <https://stupefied-mayer-7b68e7.netlify.app/>

```bash
yarn
yarn dev
```

## 記事の書き方

- `Markdown`形式で記述する
- 冒頭に下記のようにメタデータを記載する

```md
---
title: 'kubernetesについて'
date: '2020-01-01'
presenters: ['田中']
audiences: ['中村', '橋本']
---
```

- `presenters`と`audiences`は省略可能


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
