
google.maps.LatLng.prototype.latRadians = function() {
	return this.lat()*(Math.PI/180);
}

google.maps.LatLng.prototype.lngRadians = function() {
	return this.lng()*(Math.PI/180);
}

google.maps.LatLng.prototype.bearingTo = function(ll) {
	var lat1 = this.latRadians(),lat2 = ll.latRadians();
	var dLon = ll.lngRadians() - this.lngRadians();

	return (((Math.atan2(Math.sin(dLon)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon)))*180/Math.PI)+360)%360;
}

google.maps.LatLng.prototype.distanceFrom = function(ll) {
	return Math.sqrt(Math.pow(this.lat()-ll.lat(),2)+Math.pow(this.lng()-ll.lng(),2))
}
