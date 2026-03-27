/**
 * 校外教學大考驗 - Google Apps Script 後端程式碼
 * 功能：處理地圖點位的儲存 (doPost) 與 讀取 (doGet)
 */

// 處理老師端傳來的「發布任務」請求
function doPost(e) {
  try {
    // 取得當前試算表的第一張工作表
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var dataArray = payload.data;
    var customId = payload.customId; 
    var timestamp = new Date();

    // 將每一筆任務點位寫入試算表
    dataArray.forEach(function(item) {
      sheet.appendRow([
        customId, 
        timestamp, 
        item.type, 
        item.lat, 
        item.lng, 
        item.text, 
        item.optA, 
        item.optB, 
        item.answer, 
        item.placeName
      ]);
    });
    
    // 回傳成功訊息
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success", 
      "gameId": customId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // 發生錯誤時回傳錯誤訊息
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error", 
      "message": err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 處理學生端傳來的「取得任務」請求
function doGet(e) {
  var targetId = e.parameter.gameId;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  
  // 根據學生輸入的 gameId 篩選出對應的點位資料
  var gameData = rows.filter(r => r[0].toString() === targetId).map(r => ({
    type: r[2], 
    lat: r[3], 
    lng: r[4], 
    text: r[5], 
    optA: r[6], 
    optB: r[7], 
    answer: r[8]
  }));

  // 將資料轉為 JSON 格式回傳給學生端
  return ContentService.createTextOutput(JSON.stringify(gameData))
    .setMimeType(ContentService.MimeType.JSON);
}