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

var make_map = function mm(vector_source, lon, lat, zoom)
{
    var vector_layer = new ol.source.Vector({
        source: vector_source
    });
    var layer = new ol.layer.Tile({ source: new ol.source.OSM() });

    var map = new ol.Map({
        target: 'map',
        layers: [
            layer,
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: zoom
        })
    });

    return map;
}

    /*
     *
     */

function render_feature(feature)
{
    var name = feature.get('name');
    var title = feature.get('title');
    var date = feature.get('date');
    var photo = feature.get('photo');
    var more = feature.get('html');

    var html =  name + '<br>died: ' + date + '<br>';
    if (title)
    {
        html += title + '<br>';
    }
    if (more)
    {
        html += '<a target="_blank" href="docs/' + more + '"> more details </a>' + '<br>'
    }
    if (photo)
    {
        html += '<a target="_blank" href="photos/' + photo + '">'
        html += '<img width="150" src="photos/' + photo + '">'
        html += '</a>'
    }
    return html;
}

    /*
     *
     */

// Global array of features, one per record
var features = [];

// Overlay  pop-up 
var overlay = undefined;

   /*
    *
    */

var select_feature  = function(idx)
{
    var feature = features[idx];
    var html = render_feature(feature);
    var element = overlay.getElement();
    element.innerHTML = html;
};

function render_list(found)
{
    var html = '<ul>';

    // Generate list of records at this location
    for (var i = 0; i < found.length; i++) {
        var feature = found[i];
        var name = feature.get('name');
        var date = feature.get('date');
        var idx = feature.get('idx');
        var fn = 'onclick="select_feature(' + idx + ')"';
        html += '<li><a ' + fn + '>' + name + ' died: ' + date + '</a>' + '<br></li>';
    }
 
    html += '</ul>';
    return html
}

    /*
     *
     */

var cb = function callback(obj)
{
    // Handle any search criteria
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const name_match = urlParams.get('name');
    var search = document.getElementById('search')
    search.innerHTML = name_match;

    var name_found = null;

    var circle = new ol.style.Circle({
        radius: 4,
        stroke: new ol.style.Stroke({
            color: [0, 0, 255, 1],
            width: 9
        })
    });

    var style = new ol.style.Style({
        image: circle,
        zIndex: 2
    });

    var found_circle = new ol.style.Circle({
        radius: 2,
        stroke: new ol.style.Stroke({
            color: [255, 0, 0, 1],
            width: 4.5
        })
    });

    var found_style = new ol.style.Style({
        image: found_circle,
        zIndex: 2
    });

    features = [];
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
            title: item.title,
            date: item.date,
            photo: item.photo,
            html: item.html,
            idx: i,
            geometry: pt,
        });

        var s = style;

        // Change the style for matched items
        if (name_match)
        {
            if (item.name.search(name_match) != -1)
            {
                s = found_style;
            }
        }

        feature.setStyle(s);
        features.push(feature);
    }
 
    var src = new ol.source.Vector({
        features: features
    });
    var points = new ol.layer.Vector({
        source: src
    });

    map.addLayer(points);

    var doc_coord = document.getElementById('coord');

    // get the pop-up
    overlay = new ol.Overlay({
        element: document.getElementById('overlay'),
        positioning: 'bottom-center',
    });    

    map.addOverlay(overlay);

    map.on("click", function(event) {
        overlay.setPosition(undefined);

        // create a list of found items at this pixel location
        var found = [];
        map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
            found.push(feature);
        })

        if (found.length == 0)
        {
            // no matches
            return;
        }

        var element = overlay.getElement();

        if (found.length == 1)
        {
            // single match
            element.innerHTML = render_feature(found[0]);
        }
        else
        {
            // render a list of matches
            element.innerHTML = render_list(found);
        }

        overlay.setPosition(event.coordinate);
    });

    // show lon/lat continuously
    map.on("pointermove", function(event) {
        var coord = event.coordinate;
        var degrees = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
        doc_coord.innerHTML = degrees;
    });
}

//  FIN
