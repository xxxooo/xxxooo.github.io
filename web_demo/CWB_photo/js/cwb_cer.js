// CERQ -- 2016.01.27

function CerX (id, list_, ePoints, out_link) {

	//const device = navigator.platform,
	const isTouchDevice = !!('ontouchstart' in window),
		lang = navigator.language,
		//isPC = false;
		//iOS = false;
		//isPC = ['Win32', 'Win64', 'MacIntel', 'Linux x86_64', 'Linux i686 on x86_64'].indexOf(device) > -1, //判斷是否為PC裝置
		//iOS = ['iPod', 'iPhone', 'iPad'].indexOf(device) > -1, //判斷是否為iOS裝置
		mz = 72,
		list = list_,
		cerqSvg = '<svg viewBox="0 0 720 720"><circle fill="#FFF" cx="360" cy="360" r="360"/><g id="cqs2"><path id="cqs1" fill="#AAA" d="M253.93,381.21L116.92,518.23c10.81,16.57,23.47,32.28,38.02,46.83c91.03,91.03,227.53,108.87,336.4,53.56L253.93,381.21z"/><use xlink:href="#cqs1" transform="rotate(180,360,360)"/></g><use xlink:href="#cqs2" transform="rotate(90,360,360)"/><circle cx="360" cy="360" r="340" fill="none" stroke="#AAA" stroke-width="40"/></svg>',
		loadingSvg = '<svg viewBox="0 0 96 96"><circle cx="48" cy="48" fill="#888"><animate attributeName="r" from="6" to="48" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" from=".8" to="0" dur="1.5s" repeatCount="indefinite"/></circle></svg>',
		canvCss0 = 'position:absolute;width:100%;height:100%;',
		infoText = isTouchDevice ? ["左右滑動調整時間", "Swipe for changing time"] : ["拖曳進行以調整時間", "Drag for changing time"];

	var cerq = document.getElementById(id); //主要物件節點
	cerq.style.cssText = 'position:relative;overflow:hidden;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;max-width:800px;text-align:center;font:18px Helvetica,STHeiti,sans-serif;';

	var cage = document.createElement("div"), //顯示框架
		ctr = document.createElement("div"), //控制框架
		loadingBtn = document.createElement("div"), //開始按鈕
		dragInfo = document.createElement("p"),
		pod = document.createElement("div"),
		owl = document.createElement("a"),
		canv0 = document.createElement("canvas"),
		ctx0 = canv0.getContext("2d"),
		newStyle = document.createElement("style"),
		imgNormal = new Array(mz),
		imgHigh = new Array(mz), //高畫質圖片暫存
		eigenPoints = [0], //特徵點資訊
		dots = [], //特徵點顯示按鈕
		isReady = false, //是否可操作控制
		isPlay = false, //是否正在輪播
		firstAct, //初次顯示文字提示
		m = 0, //現在格數(可小數)
		_m = 0, //上個格數(為整數)
		zoomFactor = 1, //視野放大倍數
		zFactor = 1, //即將放大的倍數
		inFocus = 0, //特徵點聚焦
		longtouchTimer, //長按計時
		scrollTimer,
		transitionTimer,
		scaleRatio, //原始影像與初始顯示比例
		_X, _Y, //上次游標位置
		dX, dY, //游標瞬間移動量
		sX, sY, //放大位移or點擊開始位置
		pinch, _pinch,
		w = 0, //影像原始大小
		h = 0,
		oW = cerq.offsetWidth, //cerq顯示框架尺寸
		oH = cerq.offsetHeight,
		radiusBase = Math.max(oW, oH),
		maxWRes,
		zoomMax = 3,
		subpath = "-p600";

	cerq.appendChild(ctr);
	ctr.appendChild(loadingBtn);
	ctr.appendChild(dragInfo);
	cerq.appendChild(pod);
	cerq.appendChild(cage);
	cage.appendChild(canv0);

	loadingBtn.style.top = .5 * oH - 48 + 'px';
	loadingBtn.innerHTML = loadingSvg;
	dragInfo.innerHTML = lang.indexOf('zh') == 0 ? infoText[0] : infoText[1];
	cage.style.cssText = canvCss0 + 'left:0;top:0;text-align:left;opacity:.35';
	canv0.style.cssText = canvCss0;
	pod.style.bottom = '-44px';
	pod.className = 'dashPod';
	ctr.className = "ctrLayer";

	//var p1 = document.getElementById("p1");

	newStyle.innerHTML = '.ctrLayer{position:absolute;top:0;width:100%;height:100%;z-index:2;cursor:grab;cursor:-moz-grab;cursor:-webkit-grab}.ctrLayer:active{cursor:grabbing;cursor:-moz-grabbing;cursor:-webkit-grabbing}.ctrLayer>div{position:relative;width:96px;height:96px;margin:auto;pointer-events:none}.ctrLayer p{position:absolute;top:0;width:100%;margin:0;padding:8px 0;opacity:0;background:#FFF;font-size:16px;transition:opacity 1s}.blink{animation:blink 4s infinite ease-in 1s;-webkit-animation:blink 4s infinite ease-in 1s}@keyframes blink{0%{opacity:.2}50%{opacity:.6}100%{opacity:.2}}@-webkit-keyframes blink{0%{opacity:.2}50%{opacity:.6}100%{opacity:.2}}.dashPod{position:absolute;width:100%;height:40px;opacity:.4;z-index:3;pointer-events:none;transition:bottom .6s}.dashPod:hover{opacity:.7}.dashPod>div{pointer-events:auto;cursor:pointer;float:left}.dashPod>div:first-child{margin-left:8px}.dashPod>div>p{width:10px;height:10px;background:rgba(128,128,128,.2);border-radius:50%;border:2px solid #FFF;box-shadow:0 2px 5px #999;margin:13px}.dashPod>div:hover>p{background:#FFF}.dashPod>a{pointer-events:auto;position:absolute;right:6px;width:36px;height:36px}.eigenPtInfo{position:absolute;box-sizing:border-box;border-radius:12px;max-width:70%;z-index:5;padding:10px;color:#222;text-shadow:0 1px 7px #FFF;background:rgba(255,255,255,.5)}';
	document.head.appendChild(newStyle);
	//確定版本壓縮時再整合

	//if (oW+oH > 960) subpath = "-p900";
	var m1 = 7*mz/8;
	img1 = new Image();
	img1.src = serialPathN(m1);
	img1.onload = function(){
		ctxDrawImage(img1);
	}

	if (ePoints.length > 5) ePoints = ePoints.slice(0,5);
	eigenPoints = eigenPoints.concat(ePoints);

	const j = eigenPoints.length - 1;
	if (j > 0) {
		for (var i = 0; i < j; i++) {
			dots[i] = document.createElement("div");
			dots[i].id = i + 1;
			dots[i].appendChild( document.createElement("p") );
			pod.appendChild(dots[i]);
			dots[i].onclick = function(){ cerq.focusPoint(this.id) }
		}
	}
	if (out_link) {
		owl.innerHTML = cerqSvg;
		owl.href = out_link;
		owl.setAttribute("target", "_blank");
		pod.appendChild(owl);
	}

	window.addEventListener('resize', setScale);

	//開始執行播放與旋轉
	cerq.run = function() { //原始結構請參考 _prototype_cerq.run.js
		var loadPart = [0, 0, 0, 0, 0, 0],
			i =  [2*mz/3,      0,   .25*mz, .75*mz+1,       1,  .25*mz+1],
			iz = [    mz, .25*mz,   2*mz/3,     mz+1, .25*mz+1, .75*mz+1],
			ih = [mz/6-3, mz/8-1, 5*mz/24-2,  mz/8-2,   mz/8-2,  mz/4-2];

		imgLoadRecur( 0, function(){
			imgLoadRecur( 1, function(){
				toReady();
				setTimeout(function(){
					imgLoadRecur( 2, function(){
						imgLoadRecur(3, function(){
							imgLoadRecur(4, function(){
								imgLoadRecur(5, function(){
									if (!w) toReady();
								});
							});
						});
					});
				},800);
			});
		} );

		function imgLoadRecur( n, dofunction1 ) {
			for (; i[n] != iz[n]; i[n]+=2){
				imgNormal[ i[n] ] = new Image();
				imgNormal[ i[n] ].src = serialPathN( i[n] );
				imgNormal[ i[n] ].onload = function(){
					loadPart[n]++;
					if (loadPart[n] == ih[n]) dofunction1();
				}
			}
		}
	}


	function setScale() {
		oW = cerq.offsetWidth;
		oH = cerq.offsetHeight;
		scaleRatio = w / oW;
		if (maxWRes) zoomMax = maxWRes / oW;

		if (zoomFactor > 1) {
			zooming(1, 10);
		} else if (inFocus) {
			focusOff();
		} else {
			dealShiftPosition(1, 10);
		}
	}

	function serialPathN (n) {
		return "http://www.cwb.gov.tw/V7/observe/satellite/Data/s1p/s1p-" + list[n] + ".jpg";
	}

	function toReady() {
		_m = Math.floor(2*mz/3);
		loadingBtn.innerHTML = '';
		cage.style.opacity = '.1';
		cage.style.transition = 'opacity 1.6s';
		cage.style.opacity = ''; //取消透明度標示，回到預設透明度1
		var img1 = imgNormal[_m];
		w = img1.naturalWidth;
		h = img1.naturalHeight;
		scaleRatio = w / oW;
		ctxDrawImage(img1);
		playingC( false, 1000, 33 );

		setTimeout(function(){
			ctr.addEventListener('mousedown', movestart);
			ctr.addEventListener('touchstart', movestart);
			ctr.addEventListener('dblclick', mouseDoubleClick);
			ctr.addEventListener('mousewheel', mouseScroll1);
			ctr.addEventListener('DOMMouseScroll', mouseScroll2);
			ctr.addEventListener('contextmenu', contextmenuDo);

			dragInfo.style.opacity = .2;
			dragInfo.className = "blink";
			pod.style.bottom = '0';
			isReady = true;
		}, 600);

		setTimeout(function(){
			firstAct = true;
		},3000);
	}

	function ctxDrawImage (img) {
		if (!!img.naturalWidth) {
			canv0.width = img.naturalWidth;
			canv0.height = img.naturalHeight;
			ctx0.drawImage(img, 0, 0);
		}
	}

	function dismissDragInfo () {
		if (firstAct) {
			firstAct = false;
			setTimeout(function(){
				dragInfo.style.opacity = 0;
				dragInfo.className = '';
			}, 200);
		}
	}

	//取消長按計時狀態
	function longtouchOff () {
		if (longtouchTimer) clearTimeout(longtouchTimer);
	}

	//移動時取消長按計時狀態
	function longtouchOffD (dist) {
		if ( (dX*dX) + (dY*dY) > dist ) longtouchOff ();
	}

	function setXY ( e , with_dXdY ) {
		if (with_dXdY) {
			dX = e.pageX - _X;
			dY = e.pageY - _Y;
		}
		_X = e.pageX;
		_Y = e.pageY;
	}

	//滑鼠或觸控按下
	function movestart (e) {
		if (isReady) {
			dX = 0;
			dY = 0;
			isPlay = false;
			m = _m + .5;

			if (e.touches == null) { //判斷為非觸控，就是滑鼠
				e.preventDefault(); //避免滑鼠游標變成cursor:text;
				setXY(e, false);
				longtouchTimer = setTimeout(mouseDoubleClick, 1400, e); //開始長按計時
				document.addEventListener('mousemove', moving);
				document.addEventListener('mouseup', moveend);
				document.addEventListener('mouseout', moveend);
			} else if (e.touches.length <= 2) { //單指操作時才作用，保留雙指以上預設的動作
				if (e.touches.length == 1) {
					var e1 = e.targetTouches[0];
					setXY(e1, false);
					_pinch = 0;
					longtouchTimer = setTimeout(mouseDoubleClick, 1400, e1); //開始長按計時
				} else {
					var e1 = e.targetTouches[0],
						e2 = e.targetTouches[1],
						xD = e2.pageX - e1.pageX,
						yD = e2.pageY - e1.pageY;
					_X = .5 * (e1.pageX + e2.pageX);
					_Y = .5 * (e1.pageY + e2.pageY);
					_pinch = Math.sqrt( xD*xD + yD*yD);
					longtouchOff();
				}
				document.addEventListener('touchmove', moving);
				document.addEventListener('touchend', moveend);
				document.addEventListener('touchcancel', moveend);
			} else {
				longtouchOff();
			}
		}
	}

	//滑鼠或觸控按著移動時
	function moving (e) {
		if (e.touches == null) {
			setXY(e, true);

			longtouchOffD(2); //若移動太大則非長按動作
			movingAction();
		} else if (e.touches.length == 1) {
			e.preventDefault(); //取消常見的單指滾輪作用
			var e1 = e.targetTouches[0];
			setXY(e1, true);

			longtouchOffD(12); //觸控的長按位置較容易漂移
			movingAction();
		} else if (e.touches.length == 2) {
			e.preventDefault(); //取消雙指縮放視窗
			var e1 = e.targetTouches[0],
				e2 = e.targetTouches[1],
				xx = .5 * (e1.pageX + e2.pageX),
				yy = .5 * (e1.pageY + e2.pageY),
				xD = e2.pageX - e1.pageX,
				yD = e2.pageY - e1.pageY;
			dX = xx - _X;
			dY = yy - _Y;
			_X = xx;
			_Y = yy;
			pinch = Math.sqrt( xD*xD + yD*yD);

			if ( 4*(pinch - _pinch)*(pinch - _pinch) > (dX*dX + dY*dY) ) {
				//縮放
				zFactor = zoomFactor * (pinch / _pinch);
				if (pinch > _pinch) { //放大
					if (zFactor > 1.5 * zoomMax) zFactor = 1.5 * zoomMax;
				} else { //縮小
					if (zFactor < .96) zFactor = .96;
				}
				zooming(zFactor, 1);  //第二個參數若為零則無法移動
			} else { //移動
				movingAction();
			}
			_pinch = pinch;
		}
	}

	//放開滑鼠或觸控的時刻
	function moveend (e) {
		longtouchOff();
		if (e.touches == null) {
			this.removeEventListener('mousemove', moving);
			this.removeEventListener('mouseup', moveend);
			this.removeEventListener('mouseout', moveend);
		} else {
			this.removeEventListener('touchmove', moving);
			this.removeEventListener('touchend', moveend);
			this.removeEventListener('touchcancel', moveend);
		}
		if (zoomFactor == 1) {
			if (inFocus) {
				focusOff();
			} else {
				//操作拖動結束，判斷是否繼續播放或轉半圈或停止
				if ( Math.abs(dX) > 9 && Math.abs(dX) > Math.abs(dY) ){
					playingC( (dX < 0), 1000, Math.abs(1200 / dX) );
				} else if ( Math.abs(dY) > 9 && Math.abs(dY) > Math.abs(dX) ) {
					isReady = false;
					playingC( (dY < 0), Math.floor(.5*mz), 10 );
				}
			}
		} else {
			zoomBoundaryCheck();
		}
	}

	function movingAction () {
		if (zoomFactor > 1){
			shifting();
		} else if (inFocus) {
			focusOff();
		} else if ( dY*dY > 3*dX*dX ) {
			window.scrollBy( 0, -dY );
			_Y -= dY;
		} else {
			swapping();
		}
	}

	function factorUp (n, d) {
		var factor1 = Math.floor( Math.floor(n / d) * d * (1 + d) / d ) * d;
		return factor1 > zoomMax ? zoomMax : factor1;
	}

	function mouseDoubleClick (e) {
		setXY(e, false);
		if (zoomFactor < zoomMax) {
			zooming( factorUp( zoomFactor, .5 ), 400);
		} else {
			zooming(1, 800);
		}
	}

	function mouseScroll1 (e) {
		e.preventDefault(); //必須在isReady判斷之前，才能確保網頁不會被拉動
		if (isReady) { //縮放過程中要禁止再縮放，否則圖片位置會跑掉
			setXY(e, false);
			scrollZoom(e.wheelDelta * .002);
		}
	}

	function mouseScroll2 (e) {
		e.preventDefault();
		if (isReady) {
			setXY(e, false);
			scrollZoom(-e.detail * .08);
		}
	}

	function scrollZoom ( sFactor ) {
		longtouchOff();
		if (scrollTimer) clearTimeout(scrollTimer);

		pinch = sFactor;
		_pinch = Math.abs(sFactor);
		if (_pinch > 1) _pinch = 1;

		if (pinch > 0) { //放大
			zFactor = zoomFactor * (1 + _pinch);
			if (zFactor > 1.5 * zoomMax) zFactor = 1.5 * zoomMax;
		} else { // 縮小
			zFactor = zoomFactor / (1 + _pinch);
			if (zFactor < .96) zFactor = .96;
		}
		zooming(zFactor, 400*_pinch);

		scrollTimer = setTimeout(zoomBoundaryCheck, 400);
	}

	function zoomBoundaryCheck () {
		if (zoomFactor < 1.12) {
			zooming(1, 400);
		} else if (zoomFactor > zoomMax) {
			zooming(zoomMax, 400);
		}
	}

	//按右鍵取消動作
	function contextmenuDo () {
		longtouchOff();
		document.removeEventListener('mousemove', moving);
		document.removeEventListener('mouseup', moveend);
		document.removeEventListener('touchmove', moving);
		document.removeEventListener('touchend', moveend);
	}

	function zooming (targetFactor, transSec, notReady) {
		isPlay = false;
		if (inFocus) focusOff();

		if (zoomFactor != targetFactor) {
			isReady = false;
			dismissDragInfo();

			if (targetFactor == 1) {
				sX = 0;
				sY = 0;
			} else {
				var zoomRatio = targetFactor / zoomFactor,
					_X1 = _X - cerq.offsetLeft,
					_Y1 = _Y - cerq.offsetTop;
				sX = (_X1 - cage.offsetLeft) * zoomRatio - _X1;
				sY = (_Y1 - cage.offsetTop) * zoomRatio - _Y1;
			}
			dealShiftPosition(targetFactor, transSec);
			transitionTimer = setTimeout(function(){ cage.style.transition = '' }, transSec); //避免畫面拖移時有延遲
			zoomFactor = targetFactor;

			if (zoomFactor <= 1) {
				loadingBtn.innerHTML = '';
				if (canv0.width != w) ctxDrawImage(imgNormal[_m]);
			} else if (canv0.width == w) {
				if (zoomFactor > 1.2) {
					var img1 = imgHigh[_m]
					if (img1) {
						if (img1.complete) ctxDrawImage(img1);
					} else {
						imgHigh[_m] = new Image();
						img1 = imgHigh[_m]
						img1.src = serialPathN(_m );
						img1.setAttribute("n", _m );
						img1.onload = function(){
							const n = parseInt( this.getAttribute("n") );
							if (n == _m && zoomFactor > 1.2) {
								loadingBtn.innerHTML = '';
								ctxDrawImage(this);
								//
								//console.log(this);
							}
							if (maxWRes == undefined) {
								maxWRes = this.naturalWidth;
								zoomMax = maxWRes / oW;
							}
						}
					}
				}
				if (zoomFactor < 1.6) {
					if (loadingBtn.innerHTML != '') loadingBtn.innerHTML = '';
				} else if (zoomFactor > 1.9) {
					if (loadingBtn.innerHTML == '') loadingBtn.innerHTML = loadingSvg;
				}
			}
			if (!notReady) {
				setTimeout( function(){ isReady = true }, transSec );
			}
			//
			//p1.innerHTML = zoomFactor;
		}
	}

	//放大模式中平移影像位置
	function shifting () {
		//位移量曲線修正
		if (dX < 0) {
			sX += 64 + 4096 / (dX-64);
		} else {
			sX -= 64 - 4096 / (dX+64);
		}
		if (dY < 0) {
			sY += 64 + 4096 / (dY-64);
		} else {
			sY -= 64 - 4096 / (dY+64);
		}
		dealShiftPosition(zoomFactor);
	}

	function dealShiftPosition (factor, transSec) {
		var dW = (factor - 1) * oW,
			dH = (factor - 1) * oH;
		if (factor >= 1) {
			if (sX < 0) {
				sX = 0;
			} else if (sX > dW) {
				sX = dW;
			}
			if (sY < 0) {
				sY = 0;
			} else if (sY > dH) {
				sY = dH;
			}
		} else {
			if (sX > 0) {
				sX = 0;
			} else if (sX < dW) {
				sX = dW;
			}
			if (sY > 0) {
				sY = 0;
			} else if (sY < dH) {
				sY = dH;
			}
		}
		if (transSec) {
			if (transitionTimer) clearTimeout(transitionTimer);
			cage.style.transition = 'all ' + .001*transSec + 's' ;
			cage.style.width = Math.round(oW * factor) + 'px';
			cage.style.height = Math.round(oH * factor) + 'px';
		}
		cage.style.left = Math.round(-sX) + 'px';
		cage.style.top = Math.round(-sY) + 'px';
	}

	//全域模式中更換影像張數
	function swapping () {
		//位移量曲線修正
		if (dX < 0) {
			m -= 1 + 6 / (dX-6);
		} else {
			m += 1 - 6 / (dX+6);
		}
		if (m >= mz) {
			m = m % mz;
		}
		else if (m < 0) {
			m = mz + (m % mz);
		}
		swapcanv( Math.floor(m) );
	}

	//進行一個更換canvas的動作
	function swapcanv (mi) {
	  	if (mi != _m) {
	  		_m = mi
	  		if (!!imgNormal[mi] && imgNormal[mi].complete) {
	  			ctx0.drawImage( imgNormal[mi], 0, 0);
	  		}
			dismissDragInfo();
		}
	}

	//連續播放canvas的動作
	function playingC (cw, step, t, fP) {
		isPlay = true;
		setTimeout(function(){
			if (cw) {
				if (_m == 0) _m = mz;
				swapcanv( _m - 1);
			} else {
				if (_m == (mz-1)) _m = -1;
				swapcanv( _m + 1);
			}
			t = (t < 83) ? t*1.06 : 83; //減速至10fps的方式
			if (step > 1) {
				if (isPlay) playingC(cw, step - 1, t, fP);
			} else {
				isPlay = false;
				if (fP) {
					focusOn(fP);
				} else {
					isReady = true;
				}
			}
		}, Math.round(t));
	}

	cerq.focusPoint = function (sn) {
		isPlay = false;
		isReady = false;
		pod.style.bottom = '-44px';

		const n = eigenPoints[sn]["n"] - 1,
			s = zoomFactor - 1;

		setTimeout(function(){
			zooming(1, 400*s, true);
			if (n == _m) {
				setTimeout(function(){ focusOn(sn) }, 408*s);
			} else {
				var gap = (n - _m);
				if (Math.abs(gap)*2 > mz) {
					gap = (gap < 0) ? gap + mz : gap - mz ;
				}
				var gap_abs = Math.abs(gap),
					ms = 400*s - 72*gap_abs - 72;
				if (ms < 0) ms = 0;
				setTimeout(function(){
					playingC( (gap < 0), gap_abs, 64 - 2 * gap_abs, sn );
				}, ms);
			}
			inFocus = sn;
		},104);
	}

	function focusOn (sn) {
		var f1 = document.createElement('div'), //文字說明層
			point = eigenPoints[sn],
			radius = point["r"],
			px = point["x"],
			py = point["y"],
			info = point["info"],
			bd = 0; //計算邊界暫存數字

		if (radius < .05) {
			radius = .05;
		} else if (radius > .2) {
			radius = .2;
		}

		const rd = Math.round( radius * radiusBase ),
			dL = Math.round(px * oW),
			dT = Math.round(py * oH),
			//scaleR1 = (1 - 2*radius) * 5 / 3,
			scaleR1 = (20 * (1-scaleRatio) * radius + (4 * scaleRatio) - 1) / 3,
			dW = oW * (scaleR1 - 1),
			dH = oH * (scaleR1 - 1);

		var canvas = cage.firstChild,
			newCanv = canvas.cloneNode();

		ctx = newCanv.getContext("2d");
		cage.appendChild(newCanv);

		ctx.save();
		ctx.beginPath();
		ctx.arc(dL*scaleRatio, dT*scaleRatio, rd*scaleRatio, 0, 2*Math.PI);
		ctx.clip();
		ctx.drawImage(canvas, 0, 0);
		ctx.restore();
		ctx.lineWidth = 4 * scaleRatio / scaleR1;
		ctx.strokeStyle = 'rgba(255,255,255,.5)';
		ctx.stroke();
		canvas.style.cssText += '-webkit-filter:blur(8px) invert(15%);filter:blur(8px) invert(15%)';

		sX = dW * px;
		sY = dH * py;

		if (px > .5 ) {
			bd = scaleR1 *(oW - dL - rd); //bd邊界像素數
			if (dW - sX > bd) sX = dW;
		} else {
			bd = scaleR1 *(dL - rd);
			if (sX > bd) sX = bd;
		}
		if (py > .5 ) {
			bd = scaleR1 *(oH - dT - rd);
			if (dH - sY > bd) sY = dH;
		} else {
			bd = scaleR1 *(dT - rd);
			if (sY > bd) sY = bd;
		}
		dealShiftPosition(scaleR1, 1600);

		f1.className = "eigenPtInfo";
		cerq.appendChild(f1);
		f1.innerHTML = info;
		//
		//if (py > .5) {
		//	b_high = scaleR1 * (dT - rd) - sY;
		//} else {
			//b_high = scaleR1 *(oH - dT - rd) - dH1 + sY ; 化簡為下行
		//	b_high = (oH + sY) - scaleR1 *(dT + rd);
		//}
		//
		b_high = py > .5 ? scaleR1 * (dT - rd) - sY : (oH + sY) - scaleR1 *(dT + rd);
		bd = b_high - f1.offsetHeight - 18;
		if (bd < 12) {
			if (py > .5) {
				f1.style.top = '0';
			} else {
				f1.style.bottom = '0';
			}
			f1.style.height = b_high - 18 + 'px';
			f1.style.overflowY = 'scroll';
		} else {
			if (py > .5) {
				f1.style.top = bd + 'px';
			} else {
				f1.style.bottom = bd + 'px';
			}
		}
		f1.style.left = px * (oW - f1.offsetWidth) + 'px';

		setTimeout(function(){ isReady = true },500);
	}

	function focusOff () {
		dealShiftPosition(1, 600);

		if (cage.childElementCount > 1) {
			cage.lastChild.remove();
			cage.firstChild.style.cssText = canvCss0;
			inFocus = 0;
		}
		if (cerq.childElementCount > 4) {
			cerq.lastChild.remove();
		}
		pod.style.bottom = '0';
	}


	return cerq;
}
