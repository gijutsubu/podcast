---
title: 'Goの並行処理のバグについて'
date: '2020-11-01'
presenters: ['谷口']
audiences: ['奥山', '富本']
draft: true
---

# はじめに

`Go`では並行処理の扱いが多言語よりも容易だと感じますが、\
それでも結構バグは生まれてしまうものです。

`Go`の並行処理パターンとともによくある並行処理のバグ、\
それを回避する方法を見ていきます。

# 単純な並行処理

### 一番シンプルな並行処理

`go f()` で並行処理を実行できる\
ただしこれだと別ゴルーチン内の処理の実行が非決定的

```go
func main() {
	go func() {
		fmt.Println("do somthing") // 表示は不確定
	}()
}
```

[Play](https://play.golang.org/p/Zh1_9wJCmxf)

### 表示を確定させる方法(`fork-join`)

#### 1. `sync.WaitGroup`

```go
func main() {
	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		fmt.Println("do somthing") // 表示は確定
	}()
	wg.Wait()
}
```

[Play](https://play.golang.org/p/qi09jZdak3Y)

#### 2. チャネル

```go
func main() {
	ch := make(chan interface{})
	go func() {
		defer close(ch)
		fmt.Println("do somthing") // 表示を確定
	}()
	<-ch
}
```

[Play](https://play.golang.org/p/Bc1c2pfAE0j)

### よくあるバグ: `go`キーワード内で`Add`してしまう

```go
func main() {
	var wg sync.WaitGroup

	go func() {
		wg.Add(1) // NG
		defer wg.Done()
		fmt.Println("do somthing")
	}()
	wg.Wait() // ここに到達する前にAddが呼ばれない可能性がある
}
```

[Play](https://play.golang.org/p/uXG8MjMbStM)

# `for`文

### 逐次実行

`go`しないのであればこれで良い

```go
func main() {
	data := []string{
		"hoge",
		"huga",
		"piyo",
	}

	for _, d := range data {
		func() {
			time.Sleep(time.Second)
			fmt.Printf("handle %s\n", d)
		}()
	}
}
```

[Play](https://play.golang.org/p/qwQj-PSEZBb)

### よくあるバグ: ループ変数をそのままゴルーチンで使用してしまう

ループ内の関数はある瞬間の値でなく、メモリ位置を共有する\
そのためループの最後の値をすべてのゴルーチンから参照してしまう

```go
func main() {
	data := []string{
		"hoge",
		"huga",
		"piyo",
	}

	var wg sync.WaitGroup
	for _, d := range data {
		wg.Add(1)
		go func() {
			defer wg.Done()
			time.Sleep(time.Second)
			fmt.Printf("handle %s\n", d) // NG
		}()
	}

	wg.Wait()
}
```

[Play](https://play.golang.org/p/VjTAZg3WvQt)

### 関数の引数に渡す

関数の引数に渡してしまえば渡したときの値を参照するので問題ない

```go
func main() {
	data := []string{
		"hoge",
		"huga",
		"piyo",
	}

	var wg sync.WaitGroup
	for _, d := range data {
		wg.Add(1)
		go func(d string) {
			defer wg.Done()
			time.Sleep(time.Second)
			fmt.Printf("handle %s\n", d)
		}(d)
	}

	wg.Wait()
}
```

[Play](https://play.golang.org/p/4n8OUQ3SxNU)

### ループ内で変数をコピーする

コピーした値を参照するので問題ない

```go
func main() {
	data := []string{
		"hoge",
		"huga",
		"piyo",
	}

	var wg sync.WaitGroup
	for _, d := range data {
		wg.Add(1)
		dd := d
		go func() {
			defer wg.Done()
			time.Sleep(time.Second)
			fmt.Printf("handle %s\n", dd)
		}()
	}

	wg.Wait()
}
```

[Play](https://play.golang.org/p/H_p0lKtzVtx)

# エラーハンドリング

### 逐次処理のエラーハンドリング

`Go`の関数はエラーハンドリングが基本必要になる\
なので普通の`go f()`だとできない

```go
func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	os.Exit(0)
}

func run() error {
	return doSomting()
}

func doSomting() error {
	return errors.New("error")
}
```

[Play](https://play.golang.org/p/SB2Ye6NK-Jp)

### 並行処理のエラーハンドリング

チャネルを経由してエラーをハンドリングする

```go
func run() error {
	errCh := make(chan error)
	go func() {
		defer close(errCh)
		if err := doSomting(); err != nil {
			errCh <- err
		}
	}()

	if err := <-errCh; err != nil {
		return err
	}

	return nil
}

func doSomting() error {
	return errors.New("error")
}
```

[Play](https://play.golang.org/p/Z6F9W8eA3EV)

### エラーを返す関数をループで並行に処理する

`sync.WaitGroup`とチャネルを併用してエラーをハンドリングする

```go
func run() error {
	errCh := make(chan error, 10)

	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := doSomting(); err != nil {
				errCh <- err
			}
		}()
	}

	go func() {
		wg.Wait()
		close(errCh)
	}()

	if err := <-errCh; err != nil {
		return err
	}

	return nil
}

func doSomting() error {
	return errors.New("error")
}
```

[Play](https://play.golang.org/p/v3TOqav1_bh)

### エラーも値も返す関数をループで並行に処理する

エラーと返却値をまとめた構造体を定義するパターンが多いように感じる

```go
type Result struct {
	Status int
	Err    error
}

func run() error {
	ch := make(chan *Result, 10)

	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			status, err := doSomting()
			ch <- &Result{Status: status, Err: err}
		}()
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	for r := range ch {
		if err := r.Err; err != nil {
			return r.Err
		}

		fmt.Printf("%d\n", r.Status)
	}

	return nil
}

func doSomting() (int, error) {
	return 0, errors.New("error")
}
```

[Play](https://play.golang.org/p/qAirEG0f4zM)

### `errgroup.Group`

`errgroup.Group`を使うと簡潔に書ける\
今回は関係ないが`errgroup.Group`を直接使う場合は\
`cancel`を呼ばないので
他のゴルーチンは処理を途中でやめられない\
`errgroup.WithContext`は`cancel`を返却するので\
`<-ctx.Done`で他のゴルーチンの終了を検知できる


```go
func run() error {
	eg, _ := errgroup.WithContext(context.Background())
	for i := 0; i < 10; i++ {
		eg.Go(doSomting)
	}

	if err := eg.Wait(); err != nil {
		return err
	}

	return nil
}

func doSomting() error {
	return errors.New("error")
}
```

[Play](https://play.golang.org/p/m_SzdhwFArR)

# goroutineリーク

### よくあるバグ: チャネルのバッファ不足

チャネルにバッファがないため受信されないと送信できない\
永遠にブロックしゴルーチンが残り続ける

```go
func run() error {
	timeout := time.Second * 1
	ch := make(chan int) // バッファ0
	go func() {
		result := doSomting()
		ch <- result // ブロック
	}()
	select {
	case result := <-ch:
		fmt.Println(result)
		return nil
	case <-time.After(timeout):
		return errors.New("time out")
	}
}

func doSomting() int {
	time.Sleep(time.Second * 2)
	return 42
}
```

[Play](https://play.golang.org/p/6f4PBbxcF81)

### バッファを追加する

チャネルを受信しなくくても送信できるようにバッファを作っておく

```go
func run() error {
	timeout := time.Second * 1
	ch := make(chan int, 1) // バッファ1
	go func() {
		result := doSomting()
		ch <- result
	}()
	select {
	case result := <-ch:
		fmt.Println(result)
		return nil
	case <-time.After(timeout):
		return errors.New("time out")
	}
}

func doSomting() int {
	time.Sleep(time.Second * 2)
	return 42
}
```

[Play](https://play.golang.org/p/K2pyVdROK5u)

### `context.WithTimeout`を使うとタイムアウトのハンドリングが良い感じ

```go
func run() error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*1)
	defer cancel()

	ch := make(chan int, 1)
	go func() {
		result := doSomting()
		ch <- result
	}()
	select {
	case result := <-ch:
		fmt.Println(result)
		return nil
	case <-ctx.Done():
		return errors.New("time out")
	}
}

func doSomting() int {
	time.Sleep(time.Second * 2)
	return 42
}
```

`cancel`を引き回せば呼び出し先の関数から\
呼び出し側の関数を終了させることができる

[Play](https://play.golang.org/p/UKp9XD1B4_O)

# `select`の挙動

### よくあるバグ: `select`のランダム性

`select`は同時に条件を満たす`case`があった場合、ランダムに選択される\
そのため`stopCh`が閉じられていても実行される可能性がある

```go
func run() error {
	stopCh := make(chan interface{})

	go func() {
		time.Sleep(time.Second * 3)
		close(stopCh)
	}()

	t := time.NewTicker(time.Second * 1)
	for {
		doSomting()
		select {
		case <-stopCh:
			return nil
		case <-t.C:
		}
	}
}

func doSomting() {
	fmt.Println("do")
}
```

[Play](https://play.golang.org/p/daS7ePxiex8)

### `for`の最初でもチャネルを見るようにする

`for`の最初でも`stopCh`を見ることで\
確実に終了を検知する

```go
func run() error {
	stopCh := make(chan interface{})

	go func() {
		time.Sleep(time.Second * 3)
		close(stopCh)
	}()

	t := time.NewTicker(time.Second * 1)
	for {
		select {
		case <-stopCh:
			return nil
		default:
		}
		doSomting()
		select {
		case <-stopCh:
			return nil
		case <-t.C:
		}
	}
}

func doSomting() {
	fmt.Println("do")
}
```

[Play](https://play.golang.org/p/mQL0toGdOj5)

### 余談: `select`を使用したサイコロ

`select`のランダム性を利用してこんなこともできる\
`crypt/rand`とか`math/rand`を使わずに作れる

```go
func dice() int {
	ch1 := make(chan interface{}); close(ch1)
	ch2 := make(chan interface{}); close(ch2)
	ch3 := make(chan interface{}); close(ch3)
	ch4 := make(chan interface{}); close(ch4)
	ch5 := make(chan interface{}); close(ch5)
	ch6 := make(chan interface{}); close(ch6)

	select {
	case <-ch1: return 1
	case <-ch2: return 2
	case <-ch3: return 3
	case <-ch4: return 4
	case <-ch5: return 5
	case <-ch6: return 6
	}
}
```

[Play](https://play.golang.org/p/au82GRZ7x_9)

# おわりに

他にも山ほどあるが、書いていたらきりがないので終わっときます。


色々書いていたけど\
正直、素直なAPI書いてたら、あんまり使う必要がないと思ってます。\
使っても良いけどやっぱりバグの温床になりやすい気がするなあ。

外部のAPI叩いたり、バッチで処理するときは使うけど。


でも書いていて気持ちが良いし、\
プリミティブな`sync.Mutex`とかもあるので\
Goの並行処理を書いていて\
ほとんど困るときはないなあと思います。

あと[The Go Playground](https://play.golang.org/)が便利すぎますね。
