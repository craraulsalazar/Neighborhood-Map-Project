/**
 * Created by Raul At Home on 26/08/2015.
 */

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(51.503454,-0.119562),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };



    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    var markers = [
        ['London Eye, London', 51.503454,-0.119562],
        ['Palace of Westminster, London', 51.499633,-0.124755]
    ];


    // markers & place each one on the map
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0]
        });



        // Automatically center the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

}

google.maps.event.addDomListener(window, 'load', initialize);