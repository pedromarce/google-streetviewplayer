
google.maps.LatLng.prototype.latRadians = function() {
	return this.lat()*(Math.PI/180);
}

google.maps.LatLng.prototype.lngRadians = function() {
	return this.lng()*(Math.PI/180);
}

Array.prototype.indexOf = function(a) {
	for(var i=0,l=this.length;i<l;i++) {
		if(this[i]==a)
			return i;
	}
	return -1;
}

google.maps.LatLng.prototype.bearingTo = function(ll) {
	var lat1 = this.latRadians(),lat2 = ll.latRadians();
	var dLon = ll.lngRadians() - this.lngRadians();

	return (((Math.atan2(Math.sin(dLon)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon)))*180/Math.PI)+360)%360;
}

google.maps.LatLng.prototype.distanceFrom = function(ll) {
	return Math.sqrt(Math.pow(this.lat()-ll.lat(),2)+Math.pow(this.lng()-ll.lng(),2))
}


google.maps.StreetViewPlayer = new function() {

	var panoClient = new google.maps.StreetViewService();
	var aVertices = [];
	var finalPanos = [];
	var ratio = 1664/360;
	var canvasStyle0 = null;
	var canvasStyle1 = null;
	var canvasStyle2 = null;
	var aFrames = [];
	var sensitivity = 15;
	var playSpeed = 300;
	var map = null;
	var cF = 0;
	var bufferedPlace = 0;
	var doneLoading = true;
	var mloading = 0;
	var framesLoading = 0;
	var totalImages = 0;
	var marker = null;
	var totalFrames = -1;
	var paused = true;
	var firstPlayed = false;

	framePlayer();


	function loadingMovie() {
		document.getElementById("controls").style.visibility = "hidden";
		canvasStyle0.backgroundImage = "none";
		canvasStyle1.backgroundImage = "none";
		canvasStyle2.backgroundImage = "none";
		document.getElementById("draw").className = "loading";
		setProgress(0);
	}

	var verticesBack = 0;

	function getPanoramaDataForVertex(vertex) {
		panoClient.getPanoramaByLocation(vertex,sensitivity,function(panoData,status) {
			verticesBack++;
			if(status==="OK") {
				vertex.panoData = panoData;
			}
			if(verticesBack === aVertices.length) {
				for(var i=0;i<aVertices.length;i++) {
					if(!aVertices[i].panoData) {
						aVertices.splice(i--,1);
					}
				}
				setupFrames();
			}
		})
	}

	function setupFrames() {
		for(var i=0,length=aVertices.length;i<length;i++) {
			aFrames.push(
				new Frame(
					aVertices[i].panoData,
					aVertices[i].panoData.location.pano,
					aVertices[i].panoData.tiles.centerHeading,
					aVertices[i].bearingTo(aVertices[Math.min(i+1,aVertices.length-1)].panoData.location.latLng)
				)
			)
		}
	}

	function getDirections(aPlaces) {
		marker = null;
		doneLoading = false;
		firstPlayed = true;
		loadingMovie();

		function loadMovieFrames() {
			paused = true;
			loadingMovie();

			var _this = this;

			setTimeout(function() {
				aVertices = [];
				finalPanos = [];
				aFrames = [];
				framesLoading = 0;
				totalImages = 0;
				totalFrames = -1;
				cF = 0;
				doneLoading = false;
				bufferedPlace = 0;
				paused = false;
				for(var i=0,length=mapMyData.length;i<300/*length*/;i++) {
					aVertices.push(mapMyData[i]);
				}
				for(var i=0,length=aVertices.length;i<length;i++) {
					getPanoramaDataForVertex(aVertices[i]);
				}
			},3000);
		}

		if(map == null) {
			map = new google.maps.Map(document.getElementById("map_canvas"),{
				zoom:14,
				center : mapMyData[0],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			
			document.getElementById("draw").className="";

			marker = new google.maps.Marker({
				map:map,
				location:mapMyData[0],
				visible:true
			})

			var polyline = new google.maps.Polyline({
				map:map,
				path:mapMyData
			});

			loadMovieFrames();

		}
	}

	function uniqueData(panoData) {
		for(var i=0;i<aFrames.length;i++) {
			if(aFrames[i].panoId === panoData.location.pano) {
				return false;
			}
		}
		return true;
	}

	function getImagesForCenter(center) {
		if(center >=0 && center < 256) {
			return [2,3,0];
		} else if(center===256) {
			return [0];
		} else if(center > 256 && center < 768) {
			return [0,1];
		} else if(center===768) {
			return [1];
		} else if(center > 768 && center < 1280) {
			return [1,2];
		} else if(center===1280) {
			return [2];
		} else if(center > 1280 && center <= 1664){
			return [2,3];
		}
	}

	function getImageCenter(panoId,cameraYaw,linkYaw) {
		var moveYaw = linkYaw - cameraYaw;
		if(moveYaw < 0) {
			moveYaw += 360;
		} else if(moveYaw > 360) {
			moveYaw -= 360;
		}

		var imageCenter = Math.round(896+(moveYaw*ratio));

		if(imageCenter > 1664) {
			imageCenter -= 1664;
		}
		return imageCenter;
	}

	function getFrameDisplayData(frame) {

		var panoId = frame.panoId,cameraYaw = frame.cameraYaw,linkYaw = frame.nextYaw;
		var imageCenter = getImageCenter(panoId,cameraYaw,linkYaw);
		var images = getImagesForCenter(imageCenter);

		var aDisplay = [{},{},{}];

		for(var i=0,length=images.length;i<length;i++) {
			var img = frame.images[i];
			if(imageCenter >= 0 && imageCenter < 256) {
				var diff = 384+imageCenter;
				if(i===0) {
					aDisplay[0].left = -diff + "px";
					aDisplay[0].image = img.src
				} else if(i===1) {
					aDisplay[1].left = -diff+512 + "px";
					aDisplay[1].width = "128px";
					aDisplay[1].image = img.src;
				} else if(i===2) {
					aDisplay[2].left = -diff+640+"px";
					aDisplay[2].image = img.src;
				}
			} else {
				if(images.length===1) {
					aDisplay[0].left = "0px";
					aDisplay[0].image = img.src;
				} else {
					var diff = (imageCenter - ((images[0]*2+1)*256));
					if(i===0) {
						aDisplay[0].left = -diff+"px";
						aDisplay[0].image = img.src;
					} else if(i===1){
						aDisplay[1].left = -diff+512+"px";
						aDisplay[1].image = img.src;
						aDisplay[2].image = "none";
					}
				}
			}
		}

		return aDisplay;

	}

	function drawPano(frame) {
		var panoId = frame.panoId,cameraYaw = frame.cameraYaw,linkYaw = frame.nextYaw;
		var imageCenter = getImageCenter(panoId,cameraYaw,linkYaw);
		var images = getImagesForCenter(imageCenter);

		for(var i=0,length=images.length;i<length;i++) {
			var img = frame.images[i];
			if(imageCenter >= 0 && imageCenter < 256) {
				var diff = 384+imageCenter;
				if(i===0) {
					canvasStyle0.left = -diff + "px";
					canvasStyle0.backgroundImage = "url("+img.src+")";
				} else if(i===1) {
					canvasStyle1.left = -diff+512 + "px";
					canvasStyle1.width = "128px";
					canvasStyle1.backgroundImage = "url("+img.src+")";
				} else if(i===2) {
					canvasStyle2.left = -diff+640+"px";
          canvasStyle2.width = (512-(-diff+640))+"px";
					canvasStyle2.backgroundImage = "url("+img.src+")";
				}
			} else {
				if(images.length===1) {
					canvasStyle0.left = "0px";
					canvasStyle0.backgroundImage = "url("+img.src+")";
				} else {
					var diff = (imageCenter - ((images[0]*2+1)*256));
					if(i===0) {
						canvasStyle0.left = -diff+"px";
						canvasStyle0.backgroundImage = "url("+img.src+")";
					} else if(i===1){
						canvasStyle1.left = -diff+512+"px";
						canvasStyle1.width = (512-(-diff+512))+"px";
						canvasStyle1.backgroundImage = "url("+img.src+")";
            canvasStyle2.width = "0px";
						canvasStyle2.backgroundImage = "none";
					}
				}
			}
		}

		marker.setPosition(frame.panoData.location.latLng);
		//map.setCenter(frame.panoData.location.latLng);

	}

	function getImageUrl(panoId,x,y) {
		return ["http://cbk0.google.com/cbk?output=tile&panoid=",panoId,"&zoom=2&x=",x,"&y=",y,"&cb_client=api&fover=0&onerr=3"].join("");
	}

	function Frame(panoData,panoId,cameraYaw,nextYaw) {
		this.images = [];
		totalFrames++;
		var lImages = getImagesForCenter(getImageCenter(panoId,cameraYaw,nextYaw));
		for(var i=0;i<lImages.length;i++) {
			framesLoading++;
			totalImages++;
			var img = new Image();
			img.loaded = false;
			img.onload = img.onerror = function() {
				this.loaded=true;
				framesLoading--;
			}
			img.src = getImageUrl(panoId,lImages[i],0);
			this.images.push(img);
		}
		this.panoData = panoData;
		this.panoId = panoId;
		this.cameraYaw = cameraYaw;
		this.nextYaw = nextYaw;
	}

	function playMovie() {
		document.getElementById("controls").style.visibility="visible";
		document.getElementById("draw").className="";
	}

	function framePlayer(){
		if(firstPlayed===true && doneLoading===true && cF >= totalFrames ) {
			setProgress(totalFrames);
		} else if(paused===false&&totalFrames>-1&&cF<=totalFrames) {
			var currentFrameImages = aFrames[cF].images;
			for(var i=0,length=currentFrameImages.length;i<length;i++) {
				if(currentFrameImages[i].loaded===false) {
					break;
				}
			}
			if(i===length) {
				setProgress(cF);
				drawPano(aFrames[cF++]);
			}
		}
		setTimeout(framePlayer,playSpeed);
	};

	function setProgress(currentFrame) {
		if(document.getElementById("progressbar")) 
			document.getElementById("progressbar").style.width = parseInt(100*currentFrame/totalFrames)+"%";
	}

	this.restartMovie = function() {
		cF = 0;
	}

	this.speedUpMovie = function() {
		playSpeed-=100;
	}

	this.setProgress = function(newFrame) {
		paused = true;
		cF = newFrame;
		paused = false;
		document.getElementById("btn_playpause").value = "Pause"
	}

	this.slowDownMovie = function() {
		playSpeed+=100;
	}

	this.pauseMovie = function(btn) {
		if(!paused) {
			paused = true;
			btn.value="Play";
		} else {
			paused = false;
			btn.value="Pause";
		}
	}

	this.selectPopularRoute = function(sel) {
		var o = sel.options[sel.selectedIndex];
		document.getElementById("start").value = o.getAttribute("start");
		document.getElementById("end").value = o.getAttribute("end");
		paused = true;
		this.initMovie();
		sel.selectedIndex = 0;
	}

	this.initMovie = function() {
		for(var i=0,length=mapMyData.length;i<length;i++) {
			mapMyData[i] = new google.maps.LatLng(mapMyData[i].lat, mapMyData[i].lng);
		}
		if(firstPlayed && !doneLoading) {
			alert("Please wait for current movie to finish loading before loading a new one.");
			return;
		} else if(!firstPlayed) {
			paused = false;
		}

		canvas = document.getElementById("draw").getElementsByTagName("DIV");
		canvasStyle0 = canvas[0].style;
		canvasStyle1 = canvas[1].style;
		canvasStyle2 = canvas[2].style;
		delete canvas;

		getDirections([document.getElementById("start").value,document.getElementById("end").value])
	}
	
	this.getTotalFrames = function() {
		return totalFrames;
	}

	this.getCurrentMovieData = function() {
    if(!firstPlayed||!doneLoading)
    {
      alert('This movie is currently not done loading all data points, please wait for the movie to finish loading before downloading.');
      return;
    }
		var aData = [];
		for(var i=0;i<aFrames.length;i++) {
			aData.push(getFrameDisplayData(aFrames[i]));
		}
    var f = document.createElement("form");
    f.method="POST";
    f.action="http://50.62.15.115/driver/";
    var i = document.createElement("input");
    i.type="hidden";
    i.name="DATA";
    i.value=$.toJSON(aData);
    f.appendChild(i);
    document.body.appendChild(f);
    f.submit();
    document.body.removeChild(f);
	}

}
