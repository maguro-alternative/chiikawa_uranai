# chiikawa_uranai
ちいかわ占いの順位を争う人へ

# これなに？

https://www.fujitv.co.jp/meza/uranai/index.html

めざましテレビで朝5時に行われているちいかわ占いの順位を集計するスクリプトです。

Google Apps Scriptで実行できます。

# 使い方
## 使う定数
```js
const PHANTOMJS = "phantomjscloudのAPIキー"
```
めざまし占いのページは動的生成されるため、Parserだけでは取得できません。  
phantomjscloudを使用します。  
登録してAPIキーを取得してください。

https://phantomjscloud.com/

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
