
$(document).ready(function(){/* google maps -----------------------------------------------------*/


    if (typeof google !== 'object') {

        //display friendly error message
        //alert('google map failed to load. check you internet connection');

        $('#map-canvas').append("<div class='alert alert-danger'>Unable to load Google Maps - No Internet Available</div>");

        return;
    }

    google.maps.event.addDomListener(window, 'load', initialize);

    var map;
    var markers = [];

    var infowindow = null;

    function initialize() {


  /* position Amsterdam */
  //var latlng = new google.maps.LatLng(52.3731, 4.8922);
  var latlng = new google.maps.LatLng(43.6425662,-79.3870568);
        //var latlng = new google.maps.LatLng(43.82034693693644,-79.18190002441406);


    var mapOptions = {
    center: latlng,
    scrollWheel: false,
    zoom: 14
  };

/*
  var marker = new google.maps.Marker({
    position: latlng,
    url: '/',
    animation: google.maps.Animation.DROP
  });
*/

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  //marker.setMap(map);

        //markers.push(marker);



};

    function CreateMarkers(geodata, itemclickedfromlist){

        var marker;
        console.log('calling createmarkers');

        console.log(map);

            var venue = geodata.response.venue;
            var location = venue.location;
            var lat = location.lat;
            var lng = location.lng;

        console.log('venue name: ' + venue.name);
        console.log(venue);

        marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    animation: google.maps.Animation.DROP,
                    map: map,
                    title: venue.name
            });


        var address = location.address;
        var lat = location.lat;
        var lng = location.lng;
        var city = location.city;
        var postal = location.postalCode;

        var contact = venue.contact;
        var phone = contact.formattedPhone;

        var photos = venue.photos.groups[0].items;
        var bestphoto = venue.bestPhoto;

        //https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple

        marker.addListener('click', function() {

            //kill animation in other
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
            }


            if (infowindow) {
                infowindow.close();
            }

            var contentString = '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h1 id="firstHeading" class="firstHeading">'+ venue.name + '</h1>'+
                '<div id="bodyContent">'+
                '<p><b>Location:</b>' +
                address + ',' + city + ','+ postal + '</p>'+
                '<p><b>Contact:</b>' +
                phone +
                '</p>'+
                '<p><b>Website:</b> <a href="' + venue.url + '">'+
                venue.url +
                '</p>'+
                '<p><b>FourSquare:</b> <a href="' + venue.canonicalUrl + '">'+
                venue.canonicalUrl +
                '</a>' +
                '</p>'+
                '</div>'+
                '</div>';


            infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            marker.setAnimation(google.maps.Animation.BOUNCE)

            //var locaddr = address + ',' + city;

            //var googleviewurl = 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=' + lat + ',' + lng + '';

                ShowImages(photos,bestphoto);


            infowindow.open(map, marker);


        });


        //create pictures
        if( typeof itemclickedfromlist !== 'undefined') {

            console.log('variable clickedfromlistonly is defined');
            ShowImages(photos,bestphoto);

            //http://jsfiddle.net/sgentile/pRC4c/
            viewModel.clickedlocation(1);

        }

        markers.push(marker);

        var bounds = new google.maps.LatLngBounds();
        for(i=0;i<markers.length;i++) {
            bounds.extend(markers[i].getPosition());
        }

        //center the map to a specific spot (city)
        //map.setCenter(center);

        //center the map to the geometric center of all markers
        map.setCenter(bounds.getCenter());

        map.fitBounds(bounds);

        //remove one zoom level to ensure no marker is on the edge.
        map.setZoom(map.getZoom()-1);

        // set a minimum zoom
        // if you got only 1 marker or all markers are on the same address map will be zoomed too much.
        if(map.getZoom()> 15){
            map.setZoom(15);
        }

    };

    function ShowImages(photos,bestphoto)
    {

        $('.bgimg').remove();

        photoslen = photos.length;
        for(var i=0; i< photoslen-1;i++ ) {
            var photourl = photos[i].prefix + '100x100' + photos[i].suffix;
            $('#locimg').append('<div class="col-md-4 col-xs-6 col-lg-2"><img class="bgimg" src="' + photourl + '" class="img-responsive"></div>');
        }

        //venue picture
        var venueimage = bestphoto.prefix + '100x100' + bestphoto.suffix;
        $('#locimg').append('<div class="col-md-4 col-xs-6 col-lg-2"><img class="bgimg" src="' + venueimage + '" class="img-responsive"></div>');


    }


    function clearMarkers() {

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);

        }

    }

    function LoadFourSquareDetails(place, itemclickedfromlist)
    {

        //http://stackoverflow.com/questions/16554748/adding-multiple-markers-to-google-map
        //remove all markers
        if (markers.length> 0)
        {
            //https://developers.google.com/maps/documentation/javascript/examples/marker-remove
            clearMarkers();
        }

        var options = {
            url:place.url,
            type: 'GET',
            datatype: 'json'
        };

        $.ajax(options)
            .done(function( data ) {

                var venue = data.response.venue;
                CreateMarkers(data,itemclickedfromlist);
            }
        ).fail(
            function(data){
                //alert( "fail: " + data );
                $('.bgimg').remove();
                $('.alert').remove();
                $('#locimg').append("<div class='alert alert-danger'>Unable to call API - No Internet Available</div>");
            }
        );

    }


  var locationstovisit = [
        {
          name:"CN Tower",
          url:"https://api.foursquare.com/v2/venues/4ad4c05ef964a52096f620e3?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"
        },
        {
          name:"eat fresh be healthy",
          url:"https://api.foursquare.com/v2/venues/4f209e78e4b0005b80def5de?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"
        },
        {
          name:"Kupfer & Kim",
          url:"https://api.foursquare.com/v2/venues/50e44770e4b0e03a48c0d8a8?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"
        },
        {
          name:"Fresh On Spadina",
          url:"https://api.foursquare.com/v2/venues/4ad4c05cf964a5200ff620e3?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"
        },
        {
          name:"Royal Ontario Museaum",
          url:"https://api.foursquare.com/v2/venues/4ad4c05ef964a520d9f620e3?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"
        },
        {
          name:"Rogers Center",
          url:"https://api.foursquare.com/v2/venues/4ad4c061f964a520adf720e3?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"

        }
      ]
      ;


  var viewModel = {
    query: ko.observable(''),
      clickedlocation: ko.observable(0),
      locations: ko.observableArray(locationstovisit),
      loadlocationdetails: function (place) {

        console.log(place);
        //call api and display pictures
        //alert('you click here' + place);
          //this.clickedlocation(1);
          LoadFourSquareDetails(place, 'true');

    }

  };


  viewModel.locations = ko.dependentObservable(function() {
    var search = this.query().toLowerCase();

    //clear pics

    return ko.utils.arrayFilter(locationstovisit, function(loc) {

        if (markers.length> 0)
        {
            //https://developers.google.com/maps/documentation/javascript/examples/marker-remove
            clearMarkers();
            $('.bgimg').remove();
        }

      return loc.name.toLowerCase().indexOf(search) >= 0;
    });
  }, viewModel);

    /*
    viewModel.locations.subscribe(function (places) {
        // do something with newValue, like an Ajax request.

        console.log("num of places: " + places.length);
        var allplacestovisitlen = places.length;

        for(var i=0; i< allplacestovisitlen;i++ )
        {
            var place = places[i];

            console.log('url: '+ place.url);

            LoadFourSquareDetails(place);

        }


    });
    */


  ko.applyBindings(viewModel);


  /* end google maps -----------------------------------------------------*/
});






