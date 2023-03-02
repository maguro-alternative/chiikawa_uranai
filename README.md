# chiikawa_uranai
ちいかわ占いの順位を争う人へ

# これなに？

https://www.fujitv.co.jp/meza/uranai/index.html

めざましテレビで朝5時に行われているちいかわ占いの順位を集計するスクリプトです。

Google Apps Scriptで実行できます。

# 使い方
## ライブラリ
**jsonで取得できることが分かったので、スクレイピングが不要になりました。  
なのでライブラリは不要です。**  
~~めざまし占いのサイトからスクレイピングをするため、Parserを追加します。  
エディタのライブラリ欄にある+をクリックし、以下のライブラリidで検索します。~~  
```
1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw
```  
![image](https://user-images.githubusercontent.com/71870614/222350249-77928d0e-ea94-461c-a880-cf1f3e4dd143.png)

~~こんな感じの画面になると思うので保存をクリックします。すると使えます。~~
![image](https://user-images.githubusercontent.com/71870614/222350576-3dac9be7-e727-4950-9d9e-6e92fe6d1d1c.png)

## 使う定数
**上記と同様の理由で不要です。**
```js
const PHANTOMJS = "phantomjscloudのAPIキー"
```
~~めざまし占いのページは動的生成されるため、Parserだけでは取得できません。  
phantomjscloudを使用します。  
登録してAPIキーを取得してください。~~

~~https://phantomjscloud.com/~~

```js
const SSID = "シートid"
```
また、集計にはスプレッドシートを使用します。
スプレッドシートを用意しURLの
```docs.google.com/spreadsheets/d/{シートid}/```
のシートidも控えておきましょう。
1行目は以下の図のようにしておくと見やすくなると思います。

![image](https://user-images.githubusercontent.com/71870614/222334287-aab5bfd3-3c1d-4df4-9aca-e19be769cb1f.png)

```js
const WEBHOOK = "DiscordのWebHook"
```
DiscordのWebHookです。
登録すると実行するたび以下のように投稿できます。
![image](https://user-images.githubusercontent.com/71870614/222335579-ebd76faf-8d6a-43b1-b13d-56b18bb17024.png)

## 実行
めざまし占いの更新は毎日8時半ごろに行われます。(アニメちいかわ公式Twitterの更新時刻を見た感じ)
なので以下のようにトリガーの設定をします。

![image](https://user-images.githubusercontent.com/71870614/222335961-18c63fec-fe84-4d3c-a77f-de133229e306.png)

***これで君もちいかわ占いの順位を争えるぞ！！！！！！***

ちなみに2023年2月は私の星座であるしし座は3位でした。
