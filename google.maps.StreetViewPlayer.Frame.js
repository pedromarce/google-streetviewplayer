/**
 * Represents a google maps StreetViewPlayer Frame
 */
google.maps.StreetViewPlayer.Frame = function(vertex, nextVertex) {

	this.panoData = vertex.panoData;
	this.panoId = this.panoData.location.pano;
	this.cameraYaw = this.panoData.tiles.centerHeading;
	this.nextYaw = vertex.bearingTo(nextVertex.panoData.location.latLng);
	this.images = [];
	this.loaded = false;
	var thisFrame = this;
	var lImages = this.getCanvasStyles();

	for(var i=0;i<lImages.length;i++) {
		var img = new Image();
		img.loaded = false;
		img.onload = img.onerror = function() {
			this.loaded = true;
			for(var j=0;j<thisFrame.images.length;j++) {
				if(!thisFrame.images[j].loaded) {
					return;
				}
			}
			thisFrame.loaded = true;
		}
		img.src = this.getImageUrl(lImages[i], 0);
		this.images.push(img);
	}
}

google.maps.StreetViewPlayer.Frame.prototype.getImageUrl = function(x, y) {
	return ["http://cbk0.google.com/cbk?output=tile&panoid=", this.panoId, "&zoom=2&x=", x, "&y=", y, "&cb_client=api&fover=0&onerr=3"].join("");
}

google.maps.StreetViewPlayer.Frame.prototype.getDisplayData = function() {

	var panoId = this.panoId;
	var cameraYaw = this.cameraYaw;
	var linkYaw = this.nextYaw;
	var imageCenter = this.getCanvasOffset();
	var images = this.getCanvasStyles();

	var aDisplay = [{},{},{}];

	for(var i=0,length=images.length;i<length;i++) {
		var img = this.images[i];
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

google.maps.StreetViewPlayer.Frame.prototype.getCanvasOffset = function() {
	var moveYaw = this.nextYaw - this.cameraYaw;
	if(moveYaw < 0) {
		moveYaw += 360;
	} else if(moveYaw > 360) {
		moveYaw -= 360;
	}
	var imageCenter = Math.round(896+(moveYaw*(1664/360)));
	if(imageCenter > 1664) {
		imageCenter -= 1664;
	}
	return imageCenter;
}

google.maps.StreetViewPlayer.Frame.prototype.getCanvasStyles = function() {
	var center = this.getCanvasOffset();
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
