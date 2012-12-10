// UTF-8
// meltdown.js
// Copyright (c) 2007 KAZUMiX
// http://d.hatena.ne.jp/KAZUMiX/20071105/meltdown
// Licensed under the MIT License:
// http://www.opensource.org/licenses/mit-license.php

// todo
// ・親要素のpaddingの再現
// ・textNodeと隣り合ってるinline要素とかどうしよう

// history
// 2007/11/05 やっつけ版
// 2007/11/07 Math.max(),Math.min()を使えば済む比較や三項演算子の部分を修正

(function(){

    // ブラウザがIEで後方互換かどうかのフラグをセット
    //var IeQuirks = false;
    //if(window.attachEvent && document.compatMode == 'BackCompat')IeQuirks = true;

    // 全要素を取得
    var all = document.body.getElementsByTagName('*');

    // ドキュメントの高さ
    // スタイルで使うときは px つける
    var documentHeight = document.body.scrollHeight;

    // 表示ウィンドウの高さ
    var windowHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);

    // ラッパーを追加する
    var boxHeight = Math.max(documentHeight, windowHeight);
    var divBegin = '<div style="width:100%;overflow:hidden;height:' + boxHeight + 'px;">';
    var divEnd = '</div>';
    document.body.innerHTML = divBegin + document.body.innerHTML + divEnd;

    // 全要素の絶対値座標を保存する
    // offsetParentを持たない要素（scriptとか）は除外する
    // IEはこのチェックじゃだめ。実際に動いたかどうかでもチェック。
    var targetEles = [];
    var i,len;
    for(i=0,len=all.length; i<len; i++){
	if(!all[i].offsetParent)continue;
	all[i].point = getPoint(all[i]);
	targetEles[targetEles.length] = all[i];
    }

    // 要素 ele の x,y 座標を絶対値で取得する関数
    function getPoint(ele){
	var x=0,y=0;
	while(ele){
	    x += ele.offsetLeft;
	    y += ele.offsetTop;
	    ele = ele.offsetParent;
	}
	return {x:x, y:y};
    }

    // 設定するスタイルプロパティの値を準備する
    var ele;
    var eleParent;
    for(i=0,len=targetEles.length; i<len; i++){
	ele = targetEles[i];
	eleParent = ele.parentNode;
	// widthとheightを記録する
	// clientWidth がゼロなら offsetWidth
	// そうじゃなければ小さいほう
	if(ele.clientWidth == 0){
	    ele._width = ele.offsetWidth;
	}else{
	    ele._width = Math.min(ele.offsetWidth, ele.clientWidth);
	}
	if(ele.clientHeight == 0){
	    ele._height = ele.offsetHeight;
	}else{
	    ele._height = Math.min(ele.offsetHeight, ele.clientHeight);
	}

	// 親からのオフセット座標を保存する
	if(eleParent.point){
	    ele._x = ele.point.x - eleParent.point.x;
	    ele._y = ele.point.y - eleParent.point.y;
	    ele.parentX = eleParent.point.x;
	    ele.parentY = eleParent.point.y;
 	}else{
	    ele._x = ele.point.x;
	    ele._y = ele.point.y;
	}
    }

    // ターゲット要素のpositionをabsoluteにし、現在の座標をセットする
    var ele;
    for(i=0,len=targetEles.length; i<len; i++){
	ele = targetEles[i];
	// 親ノードとの差分をセットする
	//ele.style.overflow = 'visible';
	ele.style.position = 'absolute';
	ele.style.margin = '0px';
	ele.style.padding = '0px';
	ele.style.width = ele._width + 'px';
	ele.style.height = ele._height + 'px';
	//ele.style.display = 'block';
	ele.style.left = ele._x + 'px';
	ele.style.top = ele._y + 'px';
    }

    // 指定要素を画面外に落とすアニメーションクラス
    // コンストラクタ
    function Falldown(target){
	this.ele = target;
	this.speed = 1;
	this.left = target.offsetLeft;
	//this.leftRightSpeed = 2;
	this.leftRightSpeed = Math.random()*3;
    }
    // start(アニメーション開始遅延時間)
    Falldown.prototype.start = function(delay){
	this.targetY = boxHeight - this.ele.point.y;
	var scope = this;
	setTimeout(function(){scope.loop()},delay);
    }
    // loop()
    Falldown.prototype.loop = function(){
	//console.log(this.targetY,this.ele.offsetTop);
	if(this.targetY < this.ele.offsetTop)return;
	var _top = this.ele.offsetTop;
	this.ele.style.top = this.ele.offsetTop + parseInt(this.speed) + 'px';
	this.speed *= 2;
	this.left += this.leftRightSpeed;
	this.ele.style.left = parseInt(this.left) + 'px';
	var scope = this;
	// 要素の位置が変わらなかったら動かせない要素なので終わり
	if(this.ele.offsetTop==_top)return;
	// ループ
	setTimeout(function(){scope.loop()},70);
    }

    //アニメーション割り当てスタート
    //追加したdivは割り当てない
    for(i=0; i<targetEles.length-1; i++){
	var obj = new Falldown(targetEles[targetEles.length-1-i]);
	obj.start(i*30);
    }


})();
