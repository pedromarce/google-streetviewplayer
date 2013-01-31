google-streetviewplayer
=======================

Google Streetview Player

+ Stitches google streetview panoramic data into a movie.
+ Can pull the view from a specific panorama and lat lng.

```html
<script src="http://maps.google.com/maps/api/js?sensor=false" type="text/javascript"></script>
<script type="text/javascript" src="google.maps.LatLng.js"></script>
<script type="text/javascript" src="google.maps.StreetViewPlayer.js"></script>
<script type="text/javascript" src="google.maps.StreetViewPlayer.Frame.js"></script>
<script type="text/javascript">
var streetviewPlayer = new google.maps.StreetViewPlayer({
	origin: "Phoenix, AZ",
	destination: "Tempe, AZ",
	travelMode: google.maps.TravelMode.DRIVING,
	movieCanvas: document.getElementById("movie-canvas"),
	mapCanvas: document.getElementById("map-canvas"),
	onLoading: function() {
		//do something while loading
	},
	onPlay: function() {
		//do something when playing
	},
	onProgress: function(progress) {
		//do something with progress
	}
})
</script>
```
