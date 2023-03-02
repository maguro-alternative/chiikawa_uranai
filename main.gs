const URL = "https://www.fujitv.co.jp/meza/uranai/index.html"
const WEBHOOK = ""
const SSID = ""
const PHANTOMJS = ""
const SEIZA = {
    "おひつじ座":'B',
    "おうし座":'C',
    "ふたご座":'D',
    "かに座":'E',
    "しし座":'F',
    "おとめ座":'G',
    "てんびん座":'H',
    "さそり座":'I',
    "いて座":'J',
    "やぎ座":'K',
    "みずがめ座":'L',
    "うお座":'M'
}

function uranai() {
  // PhantomJSで動的サイトのスクレイピング
  const uranaiContent = phantomJSCloudScraping()
  // 星座(順位順)
  let zodiacSign = []
  let text = []
  let luckyPoint = []

  // 順位の重みづけ
  let rankNum = []
  
  // uranaiListから12星座の要素を配列にして取得
  let uranaiRank = Parser.data(uranaiContent)
  .from('<ul class="uranaiList flex">')
  .to('</ul>')
  .iterate();
  
  // 順位ごとに星座を取得
  uranaiRank = Parser.data(uranaiRank[0])
  .from('<li class="result')
  .to('</li>')
  .iterate()

  // Discordに送信するテキスト
  let uranaiText = ""

  for (let i = 1; i < 13; i++){
    let j = i - 1

    // 星座名を取得
    zodiacSign[j] = Parser.data(uranaiRank[j])
    .from('<p class="name id')
    .to('</p>')
    .iterate()

    // <p class="name id{数字}">という形式なので、{数字}">を取り除く
    zodiacSign[j] = zodiacSign[j][0].replace(/.*>/, '')

    // アドバイスを取得
    text[j] = Parser.data(uranaiRank[j])
    .from('<p class="text">')
    .to('</p>')
    .iterate()

    text[j] = text[j][0].replace('<br>','\n')

    // ラッキーポイントを抽出
    luckyPoint[j] = Parser.data(uranaiRank[j])
    .from('<p class="point">')
    .to('</p>')
    .iterate()
    luckyPoint[j] = luckyPoint[j][0].replaceAll('<br>','\n')
    luckyPoint[j] = luckyPoint[j].replaceAll('<!---->','')

    // Discordへの送信用メッセージの作成
    uranaiText = uranaiText + i + "位\n" + "***" + zodiacSign[j] + "***" + "\n" + "```" + text[j] + "\n" + luckyPoint[j] + "```" + "\n\n"

    // スプレッドシートへの書き込みのため列の代入
    // おうし座の場合B列へ書き込み
    rankNum[j] = SEIZA[zodiacSign[j]]
  }

  // スプレッドシートに順位の書き込み
  outPut(rankNum)

  // Discordへ送信
  sendDiscord(uranaiText)

}

function phantomJSCloudScraping() {
  const option = {
    url:URL,
    renderType:"HTML",
    outputAsJson:true,
  };

  let payload = JSON.stringify(option); 

  // 日本語がURLに含まれている場合にエンコード
  payload = encodeURIComponent(payload);

  // 動的ページのスクレイピング
  const apiUrl = "https://phantomjscloud.com/api/browser/v2/"+ PHANTOMJS +"/?request=" + payload;
  const response = UrlFetchApp.fetch(apiUrl);
  const json = JSON.parse(response.getContentText());
  const source = json["content"]["data"];
  
  return source;
}

function sendDiscord(text){
  const options = {
    "content" : text
  };
  UrlFetchApp.fetch(
    WEBHOOK,
    {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(options),
      muteHttpExceptions: true,
    }
  );
}

function outPut(result){
  const spreadSheet = SpreadsheetApp.openById(SSID);  
  const sheetName = "シート1";

  const sheet = spreadSheet.getSheetByName(sheetName)

  // yyyy/MM/dd の形式で現在の日付を取得
  const dayNow = new Date()
  const data = Utilities.formatDate(dayNow, "Asia/Tokyo", "yyyy/MM/dd");

  // 一番下の要素の行数を取得
  let lastRaw = sheet.getLastRow()

  // スプレッドシートに書き込んだ日付を取得
  let last_time = sheet.getRange(lastRaw,1).getValue()
  last_time = Utilities.formatDate(last_time, "Asia/Tokyo", "yyyy/MM/dd");

  // 本日分がもう書き込まれていた場合、または日曜日の場合終了
  if (dayNow.getDay() === 0 || last_time === data){
    return
  }

  // 一番下の次の行を参照
  lastRaw = lastRaw + 1
  
  // A列に日付を書き込む
  sheet.getRange('A' + lastRaw).setValue(data)
  // それぞれの星座の順位を書き込む
  for (let i = 1; i < 13; i++) {
    let j = i - 1
    sheet.getRange(result[j] + lastRaw).setValue(i)
  }

}

