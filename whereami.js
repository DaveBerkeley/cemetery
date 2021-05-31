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

var cb = function callback(obj)
{
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

    // Plot each item
    for (var i = 0; i < obj.length; i++) {
        var item = obj[i];
        var lon = item.lon;
        var lat = item.lat;
        // Convert GPS co-ordinates to Spherical Mercator (OpenStreetMap, Google Maps etc)
        var xform = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        var pt = new ol.geom.Point(xform);
        var feature = new ol.Feature({
            //type: 'abcd',
            name: item.name,
            geometry: pt,
        });
        feature.setStyle(style);
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
            var name = feature.get('name');
            alert(name);
        })
    });
}

//  FIN
