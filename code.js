// Code.gs

// 處理 POST 請求：發布、更新、刪除
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action; 
    var customId = payload.customId;

    // 1. 如果是「發布」或「刪除」，先清空該 ID 在試算表中的舊資料（實現覆蓋更新）
    if (action === "publish" || action === "delete") {
      var data = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 0; i--) {
        if (data[i][0].toString() === customId) {
          sheet.deleteRow(i + 1);
        }
      }
    }

    // 2. 如果只是要「刪除」，到此結束
    if (action === "delete") {
      return ContentService.createTextOutput(JSON.stringify({"status":"deleted"})).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. 寫入新資料 (發布/更新)
    var dataArray = payload.data;
    var timestamp = new Date();
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
        item.placeName || ""
      ]);
    });

    return ContentService.createTextOutput(JSON.stringify({"status":"success", "gameId":customId})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"status":"error", "message":err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// 處理 GET 請求：讓老師或學生讀取資料
function doGet(e) {
  var targetId = e.parameter.gameId;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  
  // 篩選 ID 並轉換成前端需要的格式
  var gameData = rows.filter(r => r[0].toString() === targetId).map(r => ({
    type: r[2], 
    lat: r[3], 
    lng: r[4], 
    text: r[5], 
    optA: r[6], 
    optB: r[7], 
    answer: r[8],
    placeName: r[9] || ""
  }));
  
  return ContentService.createTextOutput(JSON.stringify(gameData)).setMimeType(ContentService.MimeType.JSON);
}
