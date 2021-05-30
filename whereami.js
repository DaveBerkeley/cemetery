    /*
    *
    */            

function loadJSON(data_file, callback)
{
   var http_request = new XMLHttpRequest();
   try{
      // Opera 8.0+, Firefox, Chrome, Safari
      http_request = new XMLHttpRequest();
   }catch (e){
      // Internet Explorer Browsers
      try{
         http_request = new ActiveXObject("Msxml2.XMLHTTP");
      }catch (e) {
         try{
            http_request = new ActiveXObject("Microsoft.XMLHTTP");
         }catch (e){
            // Something went wrong
            alert("Your browser broke!");
            return false;
         }
      }
   }
   http_request.onreadystatechange  = function(){
      if (http_request.readyState == 4  )
      {
        // Javascript function JSON.parse to parse JSON data
        var obj = JSON.parse(http_request.responseText);
        callback(obj);
      }
   }
   http_request.open("GET", data_file, true);
   http_request.send();
}

    /*
    *
    */            

function is_android()
{
    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
    return isAndroid;
}

    /*
    *
    */            

function make_layer(url) {
    var format = new ol.format.GeoJSON({
        defaultDataProjection :'EPSG:4326', 
        projection: 'EPSG:3857'
    });

    var source = new ol.source.Vector({
        url: url,
        format: format,
        name: 'NAME 1',
    });

    var layer = new ol.layer.Vector({
        source: source
    });

    return layer;
}

    /*
    *
    */            

var cb = function callback(obj)
{
    var calls = []
    // Plot SMS messages for the day
    for (var i = 0; i < obj.sms.length; i++) {
        var sms = obj.sms[i];
        var where = sms.where;
        if (where) {
            var info = { 
                lat: where[1], 
                lon: where[2], 
                sms: sms, 
            };
            calls.push(info);
        }
    }

    var circle = new ol.style.Circle({
        radius: 6,
        stroke: new ol.style.Stroke({
            color: [0, 0, 255, 1],
            width: 4.5
        })
    });

    var style = new ol.style.Style({
        image: circle,
        zIndex: 2
    });

    var features = [];

    for (var i = 0; i < calls.length; i++) {
        var lon = calls[i].lon;
        var lat = calls[i].lat;
        var sms = calls[i].sms;
        var xform = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        var pt = new ol.geom.Point(xform);
        var feature = new ol.Feature({
            type: 'call',
            sms: sms,
            geometry: pt,
        });
        feature.setStyle(style);
        features.push(feature);
    }
 
    // Plot photos for the day
    var pcircle = new ol.style.Circle({
        radius: 8,
        stroke: new ol.style.Stroke({
            color: [128, 128, 128, 1],
            width: 4.5
        })
    });

    var pstyle = new ol.style.Style({
        image: pcircle,
        zIndex: 3
    });

    var pix = obj.photos;

    for (var i = 0; i < pix.length; i++) {
        var lon = pix[i].lon;
        var lat = pix[i].lat;
        var xform = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        var pt = new ol.geom.Point(xform);
        var feature = new ol.Feature({
            type: 'photo',
            photo: pix[i],
            geometry: pt,
        });
        feature.setStyle(pstyle);
        features.push(feature);
    }
 
    var src = new ol.source.Vector({
        features: features
    });
    var points = new ol.layer.Vector({
        source: src
    });

    map.addLayer(points);

    map.on("click", function(e) {
        var tr = null;
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
            var ty = feature.get('type');
            if (ty == 'call') {
                var sms = feature.get('sms');
                alert(render_sms(sms));
            }
            if (ty == 'track') {
                tr = feature.get('track');
            }
            if (ty == 'photo') {
                photo = feature.get('photo')
                alert(photo.path);
            }
        })
        if (tr) {
            alert('track ' + tr[0] + ' ' + tr[1] + ' ' + tr[2]); // date/time, lat, lon
        }
    });

    //  Cluster the call records : experimental

    var source = new ol.source.Vector({
        features: features
    });

    var clusterSource = new ol.source.Cluster({
        distance: 10,
        source: source
    });

    //  Track

    small = new ol.style.Circle({
        radius: 1,
        stroke: new ol.style.Stroke({
            color: [255, 0, 0, 1],
            width: 0.5
        })
    });

    var tstyle = new ol.style.Style({
        image: small,
        zIndex: 1
    });

    var points = [];
    for (var i = 0; i < obj.tracks.length; i++) {
        var track = obj.tracks[i];
        for (var j = 0; j < track.length; j++) {
          var item = track[j];
          var lon = item[2];
          var lat = item[1];
          var xform = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
          var pt = new ol.geom.Point(xform);
          var point = new ol.Feature({
              type: 'track',
              geometry: pt,
              track: item,
          });
          point.setStyle(tstyle);
          points.push(point);
       }
    }

    var psrc = new ol.source.Vector({
        features: points
    });
    var tracks = new ol.layer.Vector({
        source: psrc
    });

    map.addLayer(tracks);
}

    /*
    *
    */
            
function make_feature(map, name, info)
{
    var mark = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([info.Lat, info.Long], 'EPSG:4326', 'EPSG:3857')),
        name: name,
    });

    return mark;
}

    /*
    *
    */
            
function render_sms(sms) {
    var text = sms.date.substr(0,19);
    text += "<hr/>";
    text += sms.text;
    text += "<hr/>";
    if (sms.sent) {
        text += "To: ";
    } else {
        text += "From: ";
    }
    text += '<a href="/piki/Dialer.cgp?number=';
    text += sms.phone;
    text += '" target="_blank">';
    text += sms.phone;
    text += '</a>';
    return text;
}

    /*
    *
    */
            
//var xcb = function xcallback(obj) {
//
// Track of GPS locations for the day
//    var points = [];
//    var last_colour = get_colour(0);
//    for (var i = 0; i < obj.tracks.length; i++) {
//        var track = obj.tracks[i];
//        for (var j = 0; j < track.length; j++) {
//          var item = track[j];
//          var lon = item[1];
//          var lat = item[2];
//          var velocity = item[5];
//          var colour = get_colour(velocity);
//          var point = new google.maps.LatLng(lon, lat);
//
//          if (colour != last_colour) {
//              points.push(point);
//              add_points(map, points, last_colour);
//              points = [];
//              last_colour = colour;
//          }
//
//          points.push(point);
//        }
//
//        add_points(map, points, last_colour);
//        points = [];
//    }
//}

//  FIN
