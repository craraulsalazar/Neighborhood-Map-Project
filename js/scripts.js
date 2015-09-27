
$(document).ready(function(){


    if (typeof google !== 'object') {

        //display friendly error message, if google maps or internet is down

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
    
       var mapOptions = {
       center: latlng,
       scrollWheel: false,
       zoom: 14
       };


       //getting id where the map will be loaded and load global variable
       map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

       google.maps.event.addListenerOnce(map, 'idle', function(){
            //map is fully loaded. set all markers in map

            DisplayAllPlaces(locationstovisit);
        });

    }

    //This function will create and position the markers in the map
    function CreateMarkers(geodata, itemclickedfromlist){

        var marker;
        var venue = geodata.response.venue;
        var location = venue.location;
        var lat = location.lat;
        var lng = location.lng;

        if( typeof itemclickedfromlist !== 'undefined') {

            //if user pushed button, then find venue name in array and remove from map
		    for (var i = 0; i < markers.length; i++) {

                if (markers[i].title == venue.name){
					
					//venue found, remove from map and array
                    markers[i].setMap(null);
                    markers.splice(i, 1);

                    break;
                }
            }
        }

	    //Create marker
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

            //clear animation
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
            }

			//if any infowindow is open, just closed
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


        //display pictures of venue selected
        if( typeof itemclickedfromlist !== 'undefined') {

            ShowImages(photos,bestphoto);

            //trigger marker click event
            google.maps.event.trigger(marker, 'click');
        }

        //add marker to array

        markers.push(marker);

        var bounds = new google.maps.LatLngBounds();
        for(var i2=0;i2<markers.length;i2++) {
            bounds.extend(markers[i2].getPosition());
        }

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

    //This function will load all details from foursquare API
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


    //this function will loop for all my favorites places to go and set the markers
    var DisplayAllPlaces = function (places) {

        viewModel.currentlocationselected('');
        var allplacestovisitlen = places.length;

        for(var i=0; i< allplacestovisitlen;i++ )
        {
            var place = places[i];

            console.log('url: '+ place.url);

            LoadFourSquareDetails(place);

        }
    };


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

        },
        {
          name:"Toronto Islands",
          url:"https://api.foursquare.com/v2/venues/4ad4c05ef964a5209af620e3?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"

        },
		{
          name:"St. Lawrence Market",
          url:"https://api.foursquare.com/v2/venues/4ad4c062f964a520fbf720e3?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"

        },
		{
          name:"TIFF Bell Lightbox",
          url:"https://api.foursquare.com/v2/venues/4bcf714ab221c9b67f0ad2d0?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"

        },
		{
          name:"BMO Field",
          url:"https://api.foursquare.com/v2/venues/4ad4c062f964a520f3f720e3?client_id=XQ2ZGEMRPJCRRHMUI0VMHH53VLL5FYHHNDP5GXQJ12VYGQDK&client_secret=SE0GMX2FIWHB5RHSOCZTEJT5EWKDKDOZ05FMYJ4UOVG5ZSZY&v=20150715"

        }
      ];


    //build viewModel using MVVM Model with knockoutjs
    var viewModel = {
        query: ko.observable(''),
        currentlocationselected:ko.observable(''),
        locations: ko.observableArray(locationstovisit),
        loadlocationdetails: function (place) {
           viewModel.currentlocationselected(place.name);
           LoadFourSquareDetails(place, 'true');
	}

	};

    viewModel.locations = ko.dependentObservable(function() {
        var search = this.query().toLowerCase();
        return ko.utils.arrayFilter(locationstovisit, function(loc) {

          if (markers.length> 0)
          {
              clearMarkers();
             $('.bgimg').remove();
          }
          return loc.name.toLowerCase().indexOf(search) >= 0;
       });
   }, viewModel);


   viewModel.locations.subscribe(DisplayAllPlaces);

    
   ko.applyBindings(viewModel);


  /* end google maps -----------------------------------------------------*/
});






