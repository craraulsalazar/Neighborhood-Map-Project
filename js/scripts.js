
$(document).ready(function(){/* google maps -----------------------------------------------------*/


    if (typeof google !== 'object') {

        //display friendly error message, whenever google maps or internet is down

        $('#map-canvas').append("<div class='alert alert-danger'>Unable to load Google Maps - No Internet Available</div>");

        return;
    }

    //add listener to initialize google map
    google.maps.event.addDomListener(window, 'load', initialize);


    //set global variables
    var map;
    var markers = [];

    var infowindow = null;


    function initialize() {

        //set initial position to city of toronto
  var latlng = new google.maps.LatLng(43.6425662,-79.3870568);
        //var latlng = new google.maps.LatLng(43.82034693693644,-79.18190002441406);

    var mapOptions = {
    center: latlng,
    scrollWheel: false,
    zoom: 14
  }

/*
  var marker = new google.maps.Marker({
    position: latlng,
    url: '/',
    animation: google.maps.Animation.DROP
  });
*/

  //getting id where we the map will be loaded and load global variable
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

         google.maps.event.addListenerOnce(map, 'idle', function(){
                //map is fully loaded. set all markers in map

                DisplayAllPlaces(locationstovisit);
         });




    };

    //This function will create and position the markers in the map
    function CreateMarkers(geodata, itemclickedfromlist){

        var marker;
        //console.log('calling createmarkers');

        //console.log(map);

            var venue = geodata.response.venue;
            var location = venue.location;
            var lat = location.lat;
            var lng = location.lng;

        //console.log('venue name: ' + venue.name);
        //console.log(venue);

        if( typeof itemclickedfromlist !== 'undefined') {

            //
            console.log('user click button');
            for (var i = 0; i < markers.length; i++) {

                if (markers[i].title == venue.name){

                    console.log('item remove from map: ' + markers[i].title);

                    markers[i].setMap(null);
                    markers.splice(i, 1);

                    break;
                }
            }
        }

        marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    animation: google.maps.Animation.DROP,
                    map: map,
                    title: venue.name
            });


        var address = location.address;
        var city = location.city;
        var postal = location.postalCode;

        var contact = venue.contact;
        var phone = contact.formattedPhone;

        var photos = venue.photos.groups[0].items;
        var bestphoto = venue.bestPhoto;


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

            marker.setAnimation(google.maps.Animation.BOUNCE);


            ShowImages(photos,bestphoto);


            infowindow.open(map, marker);


        });


        //create pictures
        if( typeof itemclickedfromlist !== 'undefined') {

            console.log('variable clickedfromlistonly is defined');
            ShowImages(photos,bestphoto);

            //http://jsfiddle.net/sgentile/pRC4c/
            //trigger marker click event
            google.maps.event.trigger(marker, 'click');
        }

        //check to see if marker has been already pin in map
        //if so, just don't added to the markers array

        markers.push(marker);

        var bounds = new google.maps.LatLngBounds();
        for(var i=0;i<markers.length;i++) {
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

    }

    //This function will display images from foursquare
    function ShowImages(photos,bestphoto)
    {
        //remove previous pictures
        $('.bgimg').remove();

        //load pictures from photos variable
        var photoslen = photos.length;
        for(var i=0; i< photoslen-1;i++ ) {
            var photourl = photos[i].prefix + '100x100' + photos[i].suffix;
            $('#locimg').append('<div class="col-md-4 col-xs-6 col-lg-2"><img class="bgimg" src="' + photourl + '" class="img-responsive"></div>');
        }

        //load picture from bestphoto variable
        var venueimage = bestphoto.prefix + '100x100' + bestphoto.suffix;
        $('#locimg').append('<div class="col-md-4 col-xs-6 col-lg-2"><img class="bgimg" src="' + venueimage + '" class="img-responsive"></div>');


    }

    //This function will clear all markers
    function clearMarkers() {

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        markers = [];

    }

    //This function will Load all details from foursquare API
    function LoadFourSquareDetails(place, itemclickedfromlist)
    {


        //remove all markers only when itemclickedfromlist parameter is empty
        if (markers.length> 0 && typeof itemclickedfromlist === 'undefined')
        {
            clearMarkers();

        }

        var options = {
            url:place.url,
            type: 'GET',
            datatype: 'json'
        };

        $.ajax(options)
            .done(function( data ) {

                //var venue = data.response.venue;
                CreateMarkers(data,itemclickedfromlist);
            }
        ).fail(
            function(data){
                //clear previous images or alerts
                $('.bgimg').remove();
                $('.alert').remove();

                //show alert in case internet is down
                $('#locimg').append("<div class='alert alert-danger'>Unable to call API - No Internet Available</div>");
            }
        );

    }


    //this function will look for all my favorites places to go and set the markers
    var DisplayAllPlaces = function (places) {
        // do something with newValue, like an Ajax request.

        viewModel.currentlocationselected('');
        var allplacestovisitlen = places.length;

        for(var i=0; i< allplacestovisitlen;i++ )
        {
            var place = places[i];

            console.log('url: '+ place.url);

            LoadFourSquareDetails(place);

        }
    }


//my favorites places to visit in toronto
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


    //build viewmodel using MVVM Model with knowoutjs
  var viewModel = {

    query: ko.observable(''),
      clickedlocation: ko.observable(0),
      currentlocationselected:ko.observable(''),
      locations: ko.observableArray(locationstovisit),
      selectedLocation: function(mydata) {

          //alert(mydata.name);
          viewModel.currentlocationselected(mydata.name);

      },
      loadlocationdetails: function (place) {

        console.log(place);
        //call api and display pictures
        //alert('you click here' + place);

          viewModel.currentlocationselected(place.name);
          LoadFourSquareDetails(place, 'true');

    }

  };

  viewModel.locations = ko.dependentObservable(function() {
    var search = this.query().toLowerCase();

    
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


    viewModel.locations.subscribe(DisplayAllPlaces);

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






