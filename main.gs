const JSONURL = "https://www.fujitv.co.jp/meza/uranai/data/uranai.json"
// DiscordのWebHook
const WEBHOOK = ""
// スプレッドシートのid
const SSID = ""
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

  // jsonを取得
  const response = UrlFetchApp.fetch(JSONURL).getContentText();
  const uranai = JSON.parse(response);
  
  // アドバイスとラッキーパーソン
  let advice = []
  let person = []
  // 星座(順位順)
  let zodiacSign = []
  let text = []
  let luckyPoint = []

  // 順位の重みづけ
  let rankNum = []
  
  // Discordに送信するテキスト
  let uranaiText = ""

  for (let i = 0; i < 12; i++){
    
    advice[i] = uranai["ranking"][i]["advice"]
    person[i] = uranai["ranking"][i]["person"]
    zodiacSign[i] = uranai["ranking"][i]["name"]
    text[i] = uranai["ranking"][i]["text"].replace('<br>','\n')
    luckyPoint[i] = uranai["ranking"][i]["point"]

    let sendText = text[i] + "\nラッキーポイント:" + luckyPoint[i]

    // アドバイスは首位、おまじないは最下位
    if (advice[i].length > 0 && i === 0) {
      sendText = sendText + '\nアドバイス:' + advice[i]
    } else if (advice[i].length > 0 && i === 11) {
      sendText = sendText + '\nおまじない:' + advice[i]
    }
    // ラッキーパーソンは首位のみ
    if (person[i].length > 0) {
      sendText = sendText + '\nラッキーパーソン:' + person[i]
    }
    uranaiText = uranaiText + uranai["ranking"][i]["rank"] + "位\n" + "***" + zodiacSign[i] + "***" + "\n" + "```" + sendText + "\n" + "```"
    
    // スプレッドシートへの書き込みのため列の代入
    // おうし座の場合B列へ書き込み
    rankNum[i] = SEIZA[zodiacSign[i]]
  }

  // スプレッドシートに順位の書き込み
  outPut(rankNum)

  // Discordへ送信
  sendDiscord(uranaiText)
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
