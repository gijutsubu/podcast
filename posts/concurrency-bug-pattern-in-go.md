---
title: 'Goの並行処理のバグについて'
date: '2020-11-01'
presenters: ['谷口']
audiences: ['奥山', '富本']
draft: true
---

Goでは並行処理の扱いが多言語よりも容易だと感じますが、それでも結構バグは生まれてしまうものです。

Goの並行処理パターンとともによくある並行処理のバグ、それを回避する等々を見ていきます。

# 単純な並行処理

### 一番シンプルな並行処理

```go
func main() {
	go func() {
		fmt.Println("do somthing") // 表示は不確定
	}()
}
```

[Play](https://play.golang.org/p/Zh1_9wJCmxf)

### 表示を確定させる(fork-join)

#### WaitGroup

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

#### chan

```go
func main() {
	ch := make(chan interface{})
	go func() {
		defer close(ch)
		fmt.Println("do somthing")
	}()
	<-ch
}
```

[Play](https://play.golang.org/p/Bc1c2pfAE0j)

### よくあるバグ: goキーワード内でAddしてしまう

```go
func main() {
	var wg sync.WaitGroup

	go func() {
		wg.Add(1) // NG
		defer wg.Done()
		fmt.Println("do somthing")
	}()
	wg.Wait()
}
```

[Play](https://play.golang.org/p/uXG8MjMbStM)

# for文

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

### よくあるバグ: ループ変数をそのまま`goroutine`で使用してしまう

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

### 対応: 関数の引数に渡す

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

### 対応: ループ内で変数をコピーする

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

# エラーチェック

### 普通のエラーチェック

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

### エラーを返す関数を並行に処理したい

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

### エラーを返す関数をループで並行に処理したい

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

### エラーも値も返す関数をループで並行に処理したい

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

### 対応: エラーだけの場合、errgroupを使うと簡潔に書ける

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

### チャネルのバッファに関するバグ

```go
func run() error {
	timeout := time.Second * 1
	ch := make(chan int)
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

### 対応: バッファを追加する

```go
func run() error {
	timeout := time.Second * 1
	ch := make(chan int, 1)
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

### contextを使うとtimmeoutのハンドリングが良い感じ

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

`cancel`を引き回せば呼び出し先の関数から呼び出し側の関数を終了させることができる

[Play](https://play.golang.org/p/UKp9XD1B4_O)

# selectの挙動

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

### 対応: for の最初でもchannelを見るようにする

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
