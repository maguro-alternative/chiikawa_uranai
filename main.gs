const JSONURL = "https://www.fujitv.co.jp/meza/uranai/data/uranai.json"
const SATURDAYURL = "http://fcs2.sp2.fujitv.co.jp/fortune.php"
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

function main(){
  // jsonを取得
  const response = UrlFetchApp.fetch(JSONURL).getContentText();
  const uranaiJson = JSON.parse(response);

  // yyyy/MM/dd の形式で現在の日付を取得
  const dayNow = new Date()
  const data = Utilities.formatDate(dayNow, "Asia/Tokyo", "yyyy/MM/dd");

  const mon = Utilities.formatDate(dayNow, "Asia/Tokyo", "yyyy/MM");

  const spreadSheet = SpreadsheetApp.openById(SSID);
  let sheet = spreadSheet.getSheetByName(mon)

  const oToZ = "OPQRSTUVWXYZ".split("");
  let i = 0

  // シートが存在しない場合、作成
  if (sheet === null){
    sheet = spreadSheet.insertSheet().setName(mon);
    sheet.getRange('A1').setValue("日付")
    sheet.getRange('N2').setValue("月間順位")
    sheet.getRange('N3').setValue("順位の合計")
    Object.keys(SEIZA).forEach(seiza => {
      sheet.getRange(SEIZA[seiza]+'1').setValue(seiza)
      sheet.getRange(oToZ[i]+'1').setValue(seiza)
      i++
    })
  }

  // 最終更新日と今日を比較(時間分秒を取り除く)
  const lastDay = new Date(Utilities.formatDate(new Date(uranaiJson["date"]), "Asia/Tokyo", "yyyy/MM/dd"))
  const nowTime = new Date(Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd"))

  // 日曜日の場合、終了
  if (dayNow.getDay() === 0){
    return
  }

  // 土曜日、年末の場合、フジテレビコンテンツストアからスクレイピング
  if (
    dayNow.getDay() === 6 ||
    lastDay < nowTime
  ){
    // すでに書き込まれていた場合終了
    if (data === getLastTime(sheet)){
      return
    }
    saturdayUranai()
  }else{
    uranai(uranaiJson)
  }

  i = 0
  // 一番下の要素の行数を取得
  let lastRaw = sheet.getLastRow()
  Object.keys(SEIZA).forEach(seiza =>  {
    sheet.getRange(oToZ[i]+'1').setValue(seiza)
    sheet.getRange(oToZ[i]+'3').setFormula('=SUM('+SEIZA[seiza]+'2:'+SEIZA[seiza]+lastRaw+')');
    sheet.getRange(oToZ[i]+'2').setFormula('=RANK('+oToZ[i]+'3,$O3:$Z3,1)');
    i++
  })
}

function uranai(uranai) {
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

    if (advice[i].length > 0 && i === 0) {
      sendText = sendText + '\nアドバイス:' + advice[i]
    } else if (advice[i].length > 0 && i === 11) {
      sendText = sendText + '\nおまじない:' + advice[i]
    }
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

function saturdayUranai(){
  // めざましコンテンツサイトからスクレイピング
  const res = UrlFetchApp.fetch(
    SATURDAYURL,
    {
      "contentType":"text/html;",
      "method":"get"
    }
  ).getContentText("Shift_JIS");

  // 占い結果の抽出
  let ura = Parser.data(res).from('<div class="rankArea">').to('</div>').iterate()
  
  // 更新日を取得
  let updateTime = Parser.data(res).from('<h1 class="pageTitle">').to('</h1>').iterate()

  // 最終更新日をyyyy/MM/ddで取得
  let lastDay = ""
  updateTime.map(update => {
    // spanから「月」「日」「のランキング」を抽出
    let span = Parser.data(update).from('<span>').to('</span>').iterate()

    // spanタグの削除
    update = update.replaceAll('<span>','')
    update = update.replaceAll('</span>','')
    // 「月」「日」「のランキング」を/に変換
    span.map(u => {
      update = update.replace(u,'/')
    })
    // 最終更新日をyyyy/MM/ddで取得
    lastDay = new Date(new Date().getFullYear() + '/' + update)
  })

  // 最終更新日と今日を比較(時間分秒を取り除く)
  const lastUpdateDay = Utilities.formatDate(lastDay, "Asia/Tokyo", "yyyy/MM/dd")
  const nowTime = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd")

  // 日付が合わない場合、終了
  if (lastUpdateDay !== nowTime){
    return
  }

  let zodiac = []

  // 順位の重みづけ
  let rankNum = []
  
  // Discordに送信するテキスト
  let uranaiText = ""

  let i = 1
  ura.map(uranai => {
    let span = Parser.data(uranai).from('<span>').to('</span>').iterate()
    zodiac.push(span[0])
    uranaiText = uranaiText + i + "位\n" + "***" + span[0] +"***\n"

    // スプレッドシートへの書き込みのため列の代入
    // おうし座の場合B列へ書き込み
    rankNum[i-1] = SEIZA[zodiac[i-1]]
    i++
  })

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

// スプレッドシートを取得
function getSheet(sheetName){
  const spreadSheet = SpreadsheetApp.openById(SSID);  
  const sheet = spreadSheet.getSheetByName(sheetName)
  return sheet
}

// スプレッドシートのA行目の最後(書き込み時刻)を取得
function getLastTime(sheet){
  // 一番下の要素の行数を取得
  //let lastRaw = sheet.getLastRow()
  // A列の一番下の行数を取得
  let lastRaw = sheet.getRange(1, 1).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow();
  // A列に1行しか値がない場合、大きな値になるので1にする
  if (lastRaw >= 30) {
    lastRaw = 1
  }
  // スプレッドシートに書き込んだ日付を取得
  let lastTime = sheet.getRange(lastRaw,1).getValue()

  // 現在の日付を取得
  const startDate = new Date();

  // 月初めの場合
  if (typeof(sheet.getRange(2,1).getValue()) === "string"){
    // 先月を取得
    const lastMonth = new Date(startDate.getFullYear() , startDate.getMonth()-1);
    const sheetName = Utilities.formatDate(lastMonth, "Asia/Tokyo", "yyyy/MM")
    lastRaw = getSheet(sheetName).getLastRow()
    // スプレッドシートに書き込んだ日付を取得
    lastTime = getSheet(sheetName).getRange(lastRaw,1).getValue()
  }
  lastTime = Utilities.formatDate(lastTime, "Asia/Tokyo", "yyyy/MM/dd");

  return lastTime
}

function outPut(result){
  // yyyy/MM/dd の形式で現在の日付を取得
  const dayNow = new Date()
  const data = Utilities.formatDate(dayNow, "Asia/Tokyo", "yyyy/MM/dd");

  const mon = Utilities.formatDate(dayNow, "Asia/Tokyo", "yyyy/MM");

  const sheet = getSheet(mon)

  // 一番下の要素の行数を取得
  let lastTime = getLastTime(sheet)

  // 本日分がもう書き込まれていた場合、または日曜日の場合終了
  if (dayNow.getDay() === 0 || lastTime === data){
    return
  }

  // A列の一番下の行数を取得
  let lastRaw = sheet.getRange(1, 1).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow();
  // A列に1行しか値がない場合、大きな値になるので1にする
  if (lastRaw >= 30) {
    lastRaw = 1
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
