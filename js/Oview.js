// Oview 2014.08.26 -- 2015.01.07

function Oview(id , editMode) {
	editMode = typeof editMode == 'undefined' ? false : editMode;
	var device = navigator.platform,
		//iOS = true,
		iOS = ( device == 'iPad' || device == 'iPhone' || device == 'iPod' ), //判斷是否為iOS裝置
		oview = document.getElementById(id), //主要物件
		vid = document.createElement("video"), //VIDEO物件
		cage = document.createElement("div"), //顯示框架
		ctr = document.createElement("div"), //控制框架
		bar = document.createElement("div"), //載入進度條
		pbtn = document.createElement("div"), //開始按鈕
		pod = document.createElement("div"),
		editFormName = "theEigenPoint",
		eigenPoints = [0], //特徵點資訊
		dots = [], //特徵點顯示按鈕
		isReady = false, //是否可操作控制
		zoomin = false, //是否放大檢視
		inFocus = 0, //特徵點聚焦
		playTimer, //連續播放時間
		longtouchTimer, //長按計時
		in1playing, //第一次播放
		radiusBase, //特徵點聚焦半徑
		scaleRatio, //原始影像與旋轉顯示比例
		_X, _Y, //上次游標位置
		dX, dY, //游標瞬間移動量
		sX, sY, //放大位移or點擊開始位置
		w, h, //影像放大顯示尺寸
		oW, oH, //影像縮小顯示尺寸
		dW, dH; //計算放大縮小差值

	//若裝置為iOS，使用影像播放模式，其他裝置截取影像至canvas替換顯示
	if (iOS) {
		var r = 0, //播放速度
			duration = 4.8; //影片長度
	} else {
		var m = 0, //現在格數(可小數)
			_m = 0, //上個格數(為整數)
			mz = 48, //總格數
			mf = 41, //可操作控制格數
			q = 0, //截取至canvas格數
			isPlay = false, //是否正在輪播
			editEigenPoint = false,
			canvBuffer = new Array(48); //canvas儲存陣列
	}
	if (editMode) {
		var ctx,
			ex = 0,
			ey = 0,
			er = 0;
	}

	oview.appendChild(ctr);
	ctr.appendChild(bar);
	ctr.appendChild(pbtn);
	oview.appendChild(pod);
	oview.appendChild(cage);
	if (!iOS) cage.appendChild(document.createElement("div"));
	cage.appendChild(vid);
	//
	

	//設定影像位址與css格式
	oview.set = function(s, p, ePoints) {
		vid.setAttribute("src", s);
		vid.setAttribute("poster", p);
		vid.setAttribute("preload", "auto");

		oW = oview.offsetWidth;
		oH = oview.offsetHeight;		
		
		oview.style.cssText = 'position:relative;overflow:hidden;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none';
		bar.style.cssText = 'position:absolute;bottom:0;background:#ff7600;width:0;height:5px;z-index:5;opacity:.5;transition:width .3s, opacity 2s';
		pbtn.style.top = 0.5 * (oH-80) + 'px'
		cage.style.position = 'relative';
		cage.style.width = oW + 'px';
		cage.style.height = oH + 'px';
		cage.style.left = '0';
		cage.style.top = '0';
		vid.style.cssText = 'position:absolute;width:inherit;height:inherit';
		pod.style.cssText = 'position:absolute;bottom:-50px;z-index:3;transition:bottom .5s';

		var turnBtnSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 216"><path opacity=".35" d="M108,12C48.4,12,0,40.2,0,75v66c0,34.8,48.4,63,108,63s108-28.2,108-63V75C216,40.2,167.6,12,108,12z"/><path fill="#FFF" d="M108,192c-53.8,0-96-22.4-96-51c0-3.3,2.7-6,6-6s6,2.7,6,6c0,18.1,31.7,39,84,39s84-21,84-39c0-3.3,2.7-6,6-6s6,2.7,6,6C204,169.6,161.8,192,108,192z"/><path fill="#FFF" d="M108,24c-53.8,0-96,22.4-96,51c0,24.4,31.4,54,96,54c0.1,0,0.2,0,0.3,0l-25.1,25.1c-3.5,3.5-3.5,9.2,0,12.7c3.4,3.4,9.2,3.6,12.7,0l42.4-42.4c3.5-3.5,3.5-9.2,0-12.7L95.9,69.3c-3.5-3.5-9.2-3.5-12.7,0s-3.5,9.2,0,12.7l29,29C62,112.4,24,92,24,75c0-22.2,40.8-39,84-39c47.8,0,84,19.2,84,39c0,8.5-6.5,17-18.4,24c-2.9,1.7-3.8,5.4-2.1,8.2c1.7,2.9,5.4,3.8,8.2,2.1C195.4,100.1,204,87.9,204,75C204,46.4,161.8,24,108,24z"/></svg>',
			newStyle = document.createElement("style");
		newStyle.innerHTML = '.tBtn00{position:relative;width:72px;height:72px;margin:auto;z-index:5;pointer-events:none;opacity:.8}.tBtn01{width:36px;height:36px;margin:2px 12px 6px 8px;float:left;opacity:.2}.tBtn01:hover{opacity:.5}.eigenBtn{width:10px;height:10px;background:rgba(160,160,160,.2);border-radius:50%;border:2px solid #FFF;box-shadow:1px 1px 6px #AAA;margin:15px;float:left;opacity:.8}.eigenBtn:hover{opacity:1;background:#FFF}.ctrLayer{width:inherit;height:inherit;position:absolute;z-index:2;cursor:pointer}.ctrLayer:hover .tBtn00{opacity:1}.eigenPtInfo{position:absolute;width:100%;box-sizing:border-box;z-index:3;padding:15px;background:rgba(255,255,255,.4);color:#333;font-size:18px;font-family:Helvetica,"STHeiti";text-align:center;text-shadow:1px 2px 8px #FFF}'
		document.head.appendChild(newStyle);
		ctr.className = "ctrLayer";
		pbtn.className = "tBtn00";
		pbtn.innerHTML = turnBtnSvg;
		
		var tBtn1 = document.createElement("div");
		tBtn1.className = "tBtn01";
		tBtn1.innerHTML = turnBtnSvg;
		pod.appendChild(tBtn1);
		tBtn1.onclick = function(){
			if (iOS) {
				if (vid.paused) {
					vid.playbackRate = 1;
					vid.play();
				} else {
					vid.pause();
				}
			} else {
				if (isPlay) {
					isPlay = false;
				} else {
					keepPlayC(99);
				}
			}
			
		};

		if (ePoints.length > 5) ePoints = ePoints.slice(0,5);
		eigenPoints = eigenPoints.concat(ePoints);

		var j = eigenPoints.length - 1;
		if (j > 0) {
			for (var i = 0; i < j; i++) {
				dots[i] = document.createElement("div");
				dots[i].id = i + 1;
				dots[i].className = "eigenBtn";
				pod.appendChild(dots[i]);
				dots[i].onclick = function(){
					oview.focusPoint(this.id);
				};
			};
		}

		if (editMode) {
			var ee1 = document.getElementById("ee1");
			ee1.onclick = function(){
				if (isReady){
					if (zoomin) {
						swopzoom();
					} else if (inFocus) {
						focusOff();
					} else {
						isPlay = false;
						m = _m + 0.5;
					}
					pod.style.bottom = "-50px";
					ctr.style.cursor = "crosshair";
					editEigenPoint = true;
					document.forms[editFormName]["qn"].value = _m;
				}
			}
		}
	}

	//開始執行播放與旋轉
	oview.run = function() {
		ctr.addEventListener('mousedown', movestart);
		ctr.addEventListener('touchstart', movestart);
		ctr.addEventListener('dblclick', function(){if (isReady) swopzoom() });
		ctr.addEventListener('contextmenu', contextmenuDo);
		vid.addEventListener('play', firstPlay);
		//vid.play();
	}

	//取消長按計時狀態
	function longtouchOff() {
		if (longtouchTimer) clearTimeout(longtouchTimer);
	}

	//移動時取消長按計時狀態
	function longtouchOffD(dT) {
		if (longtouchTimer) {
			if ( (dX*dX) + (dY*dY) > dT ) clearTimeout(longtouchTimer);
		}
	}

	//滑鼠或觸控按下
	function movestart(e) {
		if (isReady){
			dX = 0;
			dY = 0;
			if (e.touches == null) { //判斷為非觸控，就是滑鼠
				e.preventDefault(); //避免滑鼠游標變成cursor:text;
				_X = e.pageX;
				_Y = e.pageY;

				if (editEigenPoint) {
					setEigenPointPosition();
				} else {
					if (iOS) {
						vid.pause();
					} else {
						isPlay = false;
						m = _m + 0.5;
					}
					longtouchTimer = setTimeout(function(){ swopzoom() }, 777); //開始長按計時
					ctr.style.cursor = "move";
				}
				document.addEventListener('mousemove', moving);
				document.addEventListener('mouseup', moveend);
			} else if (e.touches.length == 1) { //單指操作時才作用，保留雙只以上預設的動作
				if (iOS) {
					vid.pause();
				} else {
					isPlay = false;
					m = _m + 0.5;
				}
				var et = e.targetTouches[0];
				_X = et.pageX;
				_Y = et.pageY;
				document.addEventListener('touchmove', moving);
				document.addEventListener('touchend', moveend);
				longtouchTimer = setTimeout(function(){ swopzoom() }, 777); //開始長按計時
			} else {
				longtouchOff();
			}
			if (playTimer) clearTimeout(playTimer); //取消連續播放計時
		} else {
			vid.play();
		}
	}

	//滑鼠或觸控按著移動時
	function moving(e) {
		if (e.touches == null) {
			dX = e.pageX - _X;
			dY = e.pageY - _Y;
			_X = e.pageX;
			_Y = e.pageY;

			longtouchOffD(1); //若移動太大則非長按動作

			if (zoomin){
				shifting();
			} else if (inFocus) {
				focusOff();
			} else if (editEigenPoint) {
				setEigenPointRange();
			} else if (iOS) {
				turning();
			} else {
				swapping();
			}
		} else if (e.touches.length == 1) {
			e.preventDefault(); //取消常見的單指滾輪作用
			var et = e.targetTouches[0];
			dX = et.pageX - _X;
			dY = et.pageY - _Y;
			_X = et.pageX;
			_Y = et.pageY;

			longtouchOffD(8); //觸控的長按位置較容易漂移

			if (zoomin) {
				shifting();
			} else if (inFocus) {
				focusOff();
			} else if (iOS) {
				turning();
			} else {
				swapping();
			}
		}
	}

	//放開滑鼠或觸控的時刻
	function moveend(e) {
		longtouchOff();
		if (e.touches == null) {
			this.removeEventListener('mousemove', moving);
			this.removeEventListener('mouseup', moveend);
			if (!zoomin){
				if (inFocus) {
					focusOff();
				} else if (editEigenPoint) {
					setEigenPointDone();
				} else if (iOS) {
					turnend();
				} else {
					swapend();
				}
			}
			ctr.style.cursor = "pointer";
		} else {
			this.removeEventListener('touchmove', moving);
			this.removeEventListener('touchend', moveend);
			if (!zoomin) {
				if (inFocus) {
					focusOff();
				} else if (iOS) {
					turnend();
				} else {
					swapend();
				}
			}
		}
	}

	//按右鍵取消動作
	function contextmenuDo(){
		longtouchOff();
		document.removeEventListener('mousemove', moving);
		document.removeEventListener('mouseup', moveend);
		document.removeEventListener('touchmove', moving);
		document.removeEventListener('touchend', moveend);
	}

	//切換放大模式
	function swopzoom() {
		zoomin = !zoomin
		if (zoomin) {
			if (inFocus) focusOff();
			sX = Math.round(dW * (_X - oview.offsetLeft) / oW);
			sY = Math.round(dH * (_Y - oview.offsetTop) / oH);
			cage.style.width = w + 'px';
			cage.style.height = h + 'px';
			cage.style.left = -sX + 'px';
			cage.style.top = -sY + 'px';
			setTimeout(function(){ cage.style.transition = '' },650); //避免畫面拖移時有延遲
		} else {
			cage.style.transition = 'width .6s, height .6s, left .6s, top .6s'
			cage.style.width = oW + 'px';
			cage.style.height = oH + 'px';
			cage.style.left = '0';
			cage.style.top = '0';
		}
	}

	//放大模式中平移影像位置
	function shifting() {
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

		if (sX < 0) {
			sX = 0;
		}
		else if (sX > dW) {
			sX = dW;
		}
		if (sY < 0) {
			sY = 0;
		}
		else if (sY > dH) {
			sY = dH;
		}
		cage.style.left = Math.round(-sX) + 'px';
		cage.style.top = Math.round(-sY) + 'px';
	}

	//全域模式中更換影像張數
	function swapping() {
		//位移量曲線修正
		if (dX >= 0) {
			m += 1 - 10 / (dX+10);
		} else {
			m -= 1 + 10 / (dX-10);
		}
		if (m >= mz) {
			m = m % mz;
		}
		else if (m < 0) {
			m = mz + (m % mz);
		}
		swapcanv( Math.floor(m) );
	}

	//iOS全域模式中播放影像
	function turning() {
		r = dX * 0.25;
		if (r > 2.0) {
			r = 2.0;
		}
		else if (r < -2.0) {
			r = -2.0;
		}
		vid.playbackRate = (vid.duration < 1) ? 2 : r.toPrecision(2);
		if (vid.paused) vid.play();
	}

	//進行一個更換canvas的動作
	function swapcanv(mi) {
	  	if (mi != _m) {
			if (canvBuffer[mi] != null) {
				cage.replaceChild(canvBuffer[mi], cage.firstChild);
			}
			_m = mi
		}
	}

	//操作拖動結束，判斷是否繼續播放或轉半圈或停止
	function swapend() {
		if ( Math.abs(dX) > 9 && Math.abs(dX) > Math.abs(dY) ){
			keepPlayC( 1200 / dX );
		} else if ( Math.abs(dY) > 9 && Math.abs(dY) > Math.abs(dX) ) {
			playingC2( (dY > 0), 28, Math.floor(0.5*mz), false );
		} else {
			isPlay = false;
		}
	}

	//iOS操作拖動結束，判斷是否繼續播放或轉半圈或停止
	function turnend() {
		if ( Math.abs(dX) > 9 && Math.abs(dX) > Math.abs(dY) ){
			var j = (dX > 0) ? -1 : 1;
			for (var i = 0 ; i < 10; i++) {
				setTimeout(function(){
					vid.playbackRate += 0.1*j;
				}, 100);
			}
		} else if ( Math.abs(dY) > 9 && Math.abs(dY) > Math.abs(dX) ) {
			vid.currentTime = (vid.currentTime + 0.5 * duration) % duration;
			vid.pause();
		} else {
			vid.pause();
		}
	}

	//canvas模式中繼續播放
	function keepPlayC(intival) {
		isPlay = true;
		playingC1( (intival < 0), Math.abs(intival) );
		playTimer = setTimeout(function(){ isPlay = false }, 50000);
	}

	//video模式中繼續播放
	function keepPlayV() {
		playTimer = setTimeout(function(){ vid.pause() }, 50000);
	}

	//連續播放canvas的動作
	function playingC1(cw, t) {
		setTimeout(function(){
			if (cw){
				if (_m == 0) _m = mz;
				swapcanv( _m - 1);
			} else {
				if (_m == (mz-1)) _m = -1;
				swapcanv( _m + 1);
			}

			if (isPlay) {
				t = (t < 99) ? t*1.09 : 99; //減速至10fps的方式
				playingC1(cw, t);
			}
		}, Math.round(t));
	}

	//固定步數播放canvas，不減速
	function playingC2(cw, t, step, fP) {
		if (step > 0) {
			setTimeout(function(){
				if (cw) {
					if (_m == 0) _m = mz;
					swapcanv( _m - 1);
				} else {
					if (_m == (mz-1)) _m = -1;
					swapcanv( _m + 1);
				}
				playingC2(cw, t, step - 1 , fP);
			}, Math.round(t));
		} else {
			if (fP) focusOn( fP[0], fP[1], fP[2], fP[3] );
		}
	}

	//第一次開始播放的動作
	function firstPlay() {
		pbtn.style.opacity = '0';
		bar.style.width = '2%';
		this.removeEventListener('play', firstPlay);
		this.addEventListener('play', playBtnOff);
		this.addEventListener('pause', playBtnOn);
		this.addEventListener('canplaythrough', vidplaythrough);
		this.addEventListener('playing', firstPlaying);
	}

	//第一次影片真正開始播放的時候
	function firstPlaying() {
		this.removeEventListener('playing', firstPlaying);

		w = oW * 2;
		h = oH * 2;
		if (this.videoWidth > w) w = this.videoWidth;
		if (this.videoHeight > h) h = this.videoHeight;
		dW = w - oW;
		dH = h - oH;
		radiusBase = Math.max(oW, oH);
		scaleRatio = w / oW;
		
		if (iOS) {
			this.addEventListener('play', reverseloop);
			this.addEventListener('play', keepPlayV);

			duration = vid.duration;
			in1playing = setInterval(function(){ in1V() }, 20);
		} else {
			img2Buffer(); //safari第一張canvas會抓到空白，原因不明，所以第一張多抓一次

			window.addEventListener("focus", vidPlay);
			window.addEventListener('blur', vidPause);

			if (this.duration > 0.1) {
				mz = Math.round(this.duration * 10);
				if (mz > 80) mz = 80;
				mf = Math.round(mz * 0.85);
			}
			var rp = 0;
			in1playing = setInterval(function(){ in1C() }, 20);
		}

		//影片分隔抓入canvas中
		function in1C() {
			if ( vid.currentTime > (0.1*q + 0.02) ){
				img2Buffer();
				q += 1;
				bar.style.width = (q < mf) ? (98 * q / mf + 2) + '%' : '100%';
			}
			if (q >= mz || rp > 2){ //所有影像格數截取完成或者重播兩次以上
				if (!isReady) toReady();

				window.removeEventListener("focus", vidPlay);
				window.removeEventListener('blur', vidPause);
				setTimeout(function(){ vid.remove() },108);
				clearInterval(in1playing);
				keepPlayC(99);
			} else if (q >= mf) { //載入85%的影像就可以讓使用者拖拉控制
				toReady();
			} else if (vid.ended){
				vid.play();
				rp++;
			}
		}

		//iOS第一次播放影像與進度顯示
		function in1V() {
			if (vid.currentTime > (duration * 0.85) || vid.ended) {
				toReady();
				clearInterval(in1playing);
				vid.setAttribute("loop", "");
				vid.play();
			} else {
				bar.style.width = ( 98 * vid.currentTime / (duration * 0.85) + 2 ) + '%';
			}
		}

		//載入完成85%以上，開始讓使用者拖拉控制
		function toReady() {
			isReady = true;
			bar.style.width = '100%';
			bar.style.opacity = 0;
			setTimeout(function(){ bar.remove() },2000); //等待進度條消失動畫後再移除物件
			this.removeEventListener('canplaythrough', vidplaythrough);
			this.removeEventListener('play', playBtnOff);
			this.removeEventListener('pause', playBtnOn);
			pod.style.bottom = "0";
			pbtn.remove();
			cage.style.transition = 'width .6s, height .6s, left .6s, top .6s'
		}

	}

	//將影像截取至canvas陣列中
	var img2Buffer = function(){
		var newCanv = document.createElement('canvas');
		newCanv.width = w;
		newCanv.height = h;
		newCanv.style.cssText = 'position:absolute;width:inherit;height:inherit;';
		newCanv.setAttribute("serial", q );
		cage.replaceChild(newCanv, cage.firstChild);
		newCanv.getContext('2d').drawImage( vid, 0, 0, w, h );
		canvBuffer[q] = newCanv;
	}

	// video loop 只有正向播放可以重播，反向播放的重播自己寫...
	function reverseloop() {
		var vidreverse = setInterval( function(){
			if (vid.playbackRate < 0) {
				if (vid.currentTime < 0.1){
					vid.pause();
					vid.currentTime = duration - 0.05;
					vid.play();
				}
			}
			if (vid.paused) clearInterval(vidreverse);
		}, 20);
	}

	function vidPlay() {
		vid.play();
	}

	function vidPause() {
		vid.pause();
	}

	function vidplaythrough() {
		vid.play();
	}

	function playBtnOff() {
		pbtn.style.opacity = '0';
	}

	function playBtnOn() {
		if (this.readyState == 4) {
			pbtn.style.opacity = '1';
		}
	}

	oview.focusPoint = function(sn) {
		if (isReady) {
			if (iOS) {
				vid.pause();
			} else {
				isPlay = false;
			}

			if (zoomin) {
				swopzoom();
			}
			if (inFocus != sn) {
				isReady = false;
				if (inFocus) focusOff();
				
				var point = eigenPoints[sn],
					n = point["n"],
					x = point["x"],
					y = point["y"],
					r = point["r"],
					f = point["info"];

				setTimeout(function(){
					if (n == _m) {
						focusOn(x, y, r, f);
					} else {
						if (iOS) {
							vid.currentTime = 0.1 * n;
							focusOn(x, y, r, f);
						} else {
							var gap = (n - _m);
							if (Math.abs(gap)*2 > mz) {
								gap = (gap < 0) ? gap + mz : gap - mz ;
							}
							playingC2( (gap < 0), 28, Math.abs(gap), [x,y,r,f] );
						}
					}
					inFocus = sn;
				},104);

				if (editMode) {
					document.forms[editFormName]["qn"].value = n;
					document.forms[editFormName]["px"].value = x;
					document.forms[editFormName]["py"].value = y;
					document.forms[editFormName]["radius"].value = r;
					document.forms[editFormName]["info"].value = f;
				}
			}
		}
	}

	function focusOn(px, py, radius, info) {
		pod.style.bottom = "-50px";

		if (radius < .05) {
			radius = .05;
		} else if (radius > .2) {
			radius = .2;
		}

		var f1 = document.createElement('div'), //文字說明層
			rd = Math.round( radius * radiusBase ),
			dL = Math.round(px * oW),
			dT = Math.round(py * oH),
			scaleR1 = (1 - 2*radius) * 5 / 3,
			dW1 = oW * (scaleR1 - 1),
			dH1 = oH * (scaleR1 - 1),
			bd = 0;

		if (iOS) {
			var newCanv = document.createElement('canvas'); //周圍覆蓋層
			
			ctx = newCanv.getContext("2d");
			newCanv.width = oW * scaleR1;
			newCanv.height = oH * scaleR1;
			newCanv.style.cssText = 'position:absolute;width:inherit;height:inherit;';
			cage.appendChild(newCanv);

			ctx.fillStyle = 'rgba(195,195,195,0.65)';
			ctx.fillRect(0, 0, oW * scaleR1, oH * scaleR1);
			ctx.fillStyle = '#000';
			ctx.globalCompositeOperation = 'destination-out';
			ctx.beginPath();
			ctx.arc(dL*scaleR1, dT*scaleR1, rd*scaleR1, 0, 2*Math.PI);
			ctx.fill();

			ctx.globalCompositeOperation = 'source-over';
			ctx.lineWidth = 4 * scaleR1;
			ctx.strokeStyle = 'rgba(255,255,255,0.5)';
			ctx.stroke();
		} else {
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
			ctx.lineWidth = 4 * scaleRatio;
			ctx.strokeStyle = 'rgba(255,255,255,0.5)';
			ctx.stroke();
			canvas.style.cssText += '-webkit-filter:blur(8px) invert(15%)';
		}

		sX = dW1 * px;
		sY = dH1 * py;

		if (px > .5 ) {
			bd = scaleR1 *(oW - dL - rd);
			if (dW1 - sX > bd) sX = dW1;
		} else {
			bd = scaleR1 *(dL - rd);
			if (sX > bd) sX = bd;
		}
		if (py > .5 ) {
			bd = scaleR1 *(oH - dT - rd);
			if (dH1 - sY > bd) sY = dH1;
		} else {
			bd = scaleR1 *(dT - rd);
			if (sY > bd) sY = bd;
		}

		if (py > .5) {
			f1.style.top = '0';
			b_high = scaleR1 *(dT - rd) - sY;
		} else {
			f1.style.bottom = '0';
			//b_high = scaleR1 *(oH - dT - rd) - dH1 + sY; 化簡為下行
			b_high = oH + sY - scaleR1 *(dT + rd);
		}

		cage.style.width = oW * scaleR1 + 'px';
		cage.style.height = oH * scaleR1 + 'px';
		cage.style.left = -sX + 'px';
		cage.style.top = -sY + 'px';

		oview.appendChild(f1);
		f1.innerHTML = info;
		f1.className = "eigenPtInfo";

		if (f1.offsetHeight > b_high + 12) {
			f1.style.height = b_high + 'px';
			f1.style.overflowY = 'scroll';
		}
		if (f1.offsetHeight > oH *.4 + 12) {
			f1.style.height = ( oH *.4) + 'px';
			f1.style.overflowY = 'scroll';
		}

		isReady = true;
	}

	function focusOff() {
		cage.style.width = oW + 'px';
		cage.style.height = oH + 'px';
		cage.style.left = '0';
		cage.style.top = '0';

		if (cage.childElementCount > 1) {
			cage.lastChild.remove();
			cage.firstChild.style.cssText = 'position:absolute;width:inherit;height:inherit';
			inFocus = 0;
		}
		if (oview.childElementCount > 3) {
			oview.lastChild.remove();
		}
		pod.style.bottom = "0";
	}

	function setEigenPointPosition() {
		sX = _X;
		sY = _Y;
		ex = sX - oview.offsetLeft;
		ey = sY - oview.offsetTop;
		scaleRatio = w / oW;
		if (cage.childNodes.length > 1) cage.lastChild.remove();

		var canvas = cage.firstChild,
			newCanv = canvas.cloneNode();

		cage.appendChild(newCanv);
		ctx = cage.lastChild.getContext("2d");

		document.forms[editFormName]["qn"].value = _m;
		document.forms[editFormName]["px"].value = (ex / oW).toFixed(4);
		document.forms[editFormName]["py"].value = (ey / oH).toFixed(4);
	}

	function setEigenPointRange() {
		er = Math.sqrt( (_X - sX)*(_X - sX) + (_Y - sY)*(_Y - sY) );
		if (er < .05 * radiusBase) {
			er = .05 * radiusBase;
		} else if (er > .2 * radiusBase) {
			er = .2 * radiusBase;
		}

		ctx.fillStyle = 'rgba(195,195,195,0.65)';
		ctx.clearRect(0, 0, w, h);
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = '#000';
		ctx.globalCompositeOperation = 'destination-out';
		ctx.beginPath();
		ctx.arc( ex * scaleRatio, ey * scaleRatio, er * scaleRatio, 0, 2*Math.PI);
		ctx.fill();

		ctx.globalCompositeOperation = 'source-over';
		ctx.lineWidth = 4 * scaleRatio;
		ctx.strokeStyle = 'rgba(255,255,255,0.5)';
		ctx.stroke();

		document.forms[editFormName]["radius"].value = er / radiusBase;
	}

	function setEigenPointDone() {
		var canvas = cage.firstChild;
		ctx.clearRect(0, 0, w, h);
		ctx.save();
		ctx.clip();
		ctx.drawImage(canvas, 0, 0);
		ctx.restore();
		ctx.stroke();

		canvas.style.cssText += '-webkit-filter:blur(8px) invert(15%)';
		inFocus = 8;

		document.forms[editFormName]["radius"].value = (er / radiusBase).toFixed(4);
		editEigenPoint = false;
	}


	return oview;
}
