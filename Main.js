(function(){
var ClientID = "952551d397361b9aec701f7f9c5fe63753db1452";
var ClientSecret = "238e661c2d6838153d09549584bd5f1be27e43a2";
var ClientScope = "read_qiita";	//権限は必要に応じて
var ClientStat = "ABC";			//これは適当な文字列でOK

//最初に実行するファンクションを設定
document.addEventListener("DOMContentLoaded",onLoad);

//Json形式のデータを送る
function postJson(url,param,proc) {
	var xmlHttp = xmlHttp = new XMLHttpRequest();
	xmlHttp.open('POST', url, true);
	xmlHttp.setRequestHeader("Content-Type", "application/json");
	xmlHttp.onreadystatechange = function (){
		if(this.readyState == 4){
			proc(JSON.parse(xmlHttp.response));
		}
	}
	var p = JSON.stringify(param);
	xmlHttp.send(p);
}

//Json形式のデータを受け取る
function getJson(url,token,proc) {
	var xmlHttp = xmlHttp = new XMLHttpRequest();
	xmlHttp.open('GET', url, true);
	xmlHttp.setRequestHeader('Authorization', 'Bearer ' + token);
	xmlHttp.onreadystatechange = function (){
		if(this.readyState == 4){
			proc(JSON.parse(xmlHttp.response));
		}
	}
	xmlHttp.send();
}

//Token取得処理
function getToken(func){
	//セッションに保存済みか確認
	var token = sessionStorage.getItem("TOKEN");
	if(token != null){
		func(token);	//Token取得後の処理へ
		return;
	}

	//パラメータの取得
	var p = {};
	location.search.substring(1).split('&').forEach(function(v){s=v.split('=');p[s[0]]=s[1];});
	//CODEが送られてきているか？
	if(p.code != null && p.state == ClientStat){
		//パラメータがみっともないのでURLから取り除く
		history.replaceState(null,null,'?');	
		//トークンを取得
		postJson("https://qiita.com/api/v2/access_tokens",	
			{client_id:ClientID,client_secret:ClientSecret,code:p.code},
			function(e){
				sessionStorage.setItem("TOKEN",e.token);	//セッションに保存
				func(e.token);								//Token取得後の処理へ
			});
	}else{//認証サイトへ遷移
		location.href = "https://qiita.com/api/v2/oauth/authorize?client_id="+
				ClientID+"&scope="+ClientScope+"&state="+ClientStat;
	}		
}

//ページが読み込まれた際に最初に呼び出される
function onLoad(){
	//トークンの要求
	getToken(function(token){
		//トークンをテストするため、ユーザ情報を取得して表示
		getJson("https://qiita.com/api/v2/authenticated_user",token,function(r){
			var table = document.createElement('table');
			table.border = "1";
			Object.keys(r).forEach(function(key){
				var row = table.insertRow(-1);
				row.insertCell(-1).innerHTML = key;
				row.insertCell(-1).innerHTML = r[key];
			});
			document.body.appendChild(table);
		});
	});
}

})();