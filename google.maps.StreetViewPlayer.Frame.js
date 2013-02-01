/**
 * Represents a google maps StreetViewPlayer Frame
 * @param vertex The vertex which this frame will represent visually.
 * @param nextVertex the next vertex which will be displayed after this vertex in the sequence.
 */
google.maps.StreetViewPlayer.Frame = function(vertex, nextVertex) {

	this.m_pPanoData = vertex.panoData;
	this.m_sPanoId = this.m_pPanoData.location.pano;
	this.m_iCameraYaw = this.m_pPanoData.tiles.centerHeading;
	this.m_iNextYaw = vertex.bearingTo(nextVertex.panoData.location.latLng);
	this.m_aImages = [];
	this.m_bLoaded = false;

	var iMoveYaw = this.m_iNextYaw - this.m_iCameraYaw;
	if(iMoveYaw < 0) {
		iMoveYaw += 360;
	} else if(iMoveYaw > 360) {
		iMoveYaw -= 360;
	}

	var iImageCenter = (896+(iMoveYaw*(1664/360)))>>0;
	if(iImageCenter > 1664) {
		iImageCenter -= 1664;
	}

	this.m_iCanvasOffset = iImageCenter;

	if(iImageCenter>>8===0) {
		this.m_aCanvasStyles = [2, 3, 0];
	} else if(iImageCenter===256) {
		this.m_aCanvasStyles = [0];
	} else if((iImageCenter-256)>>9===0) {
		this.m_aCanvasStyles = [0, 1];
	} else if(iImageCenter===768) {
		this.m_aCanvasStyles = [1];
	} else if((iImageCenter-768)>>9===0) {
		this.m_aCanvasStyles = [1, 2];
	} else if(iImageCenter===1280) {
		this.m_aCanvasStyles = [2];
	} else {
		this.m_aCanvasStyles = [2, 3];
	}

	this.loadImages();

}

/**
 * Loads all of the images required for the frame.
 */
google.maps.StreetViewPlayer.Frame.prototype.loadImages = function() {
	var aImages = this.m_aCanvasStyles;
	for(var i=0,lengthI=aImages.length;i<lengthI;i++) {
		this.m_aImages.push(this.getImage(aImages[i], 0));
	}
}

/**
 * Constructs a string of a given url from google maps api.
 * @param x X coordinate of the image according to google maps images.
 * @param y Y coordinate of the image according to google maps images.
 */
google.maps.StreetViewPlayer.Frame.prototype.getImage = function(x, y) {
	var iImage = new Image();
	iImage.src = ["http://cbk0.google.com/cbk?output=tile&panoid=", this.m_sPanoId, "&zoom=2&x=", x, "&y=", y, "&cb_client=api&fover=0&onerr=3"].join("");
	return iImage;
}

/**
 * Determines if all of the images required to display the frame have loaded.
 */
google.maps.StreetViewPlayer.Frame.prototype.isLoaded = function() {
	if(this.m_bLoaded===false) {
		for(var i=0,length=this.m_aImages.length;i<length;i++) {
			if(this.m_aImages[i].width===0) {
				break;
			}
		}
		if(i===length) {
			this.m_bLoaded = true;
		}
	}
	return this.m_bLoaded;
}

/**
 * Gets the current latLng which the frame represents.
 */
google.maps.StreetViewPlayer.Frame.prototype.getPosition = function() {
	return this.m_pPanoData.location.latLng;
}

/**
 * Gets the display data for the frame.
 * @return Array of FrameData.
 */
google.maps.StreetViewPlayer.Frame.prototype.getDisplayData = function() {
	var iImageCenter = this.m_iCanvasOffset;
	var aImages = this.m_aCanvasStyles;
	if(aImages.length===3) {
		var iDiff = 384 + iImageCenter;
		return [
			{
				left : -iDiff + "px",
				image : this.m_aImages[0].src
			},
			{
				left : -iDiff+512 + "px",
				width : "128px",
				image : this.m_aImages[1].src
			},
			{
				left : -iDiff+640+"px",
				image : this.m_aImages[2].src
			}
		]
	} else if(aImages.length===1) {
		return [{
			left : "0px",
			image : this.m_aImages[0].src
		}]
	} else {
		var iDiff = (iImageCenter - ((aImages[0]*2+1)*256));
		return [{
			left : -iDiff+"px",
			image : this.m_aImages[0].src
		},
		{
			left : -iDiff+512+"px",
			image : this.m_aImages[1].src
		}]
	}
}
