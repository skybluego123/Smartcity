
require('cesium/Widgets/widgets.css');
require('./css/main.css');
var Cesium = require('cesium/Cesium');

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzYyNDZmZi1lYTdhLTQwMDgtOGRhZC03ZDE5YTlkYmVkMGMiLCJpZCI6NDAxOSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzOTYzODc1OX0.Kb7k51vZGYR5F7btrBIAuSan3ZNyKY_AWrFv1cLFUFk';
var numClicks = 0;
var toolbar = document.getElementById('toolbar');
var viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: true,
    animation: true,
    shadows: true
});

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
}
var myPos = { my: "center center", at: "center-350 center", of: window };
var myPos_right = { my: "center center", at: "center+350 center", of: window };
var tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(41753)
    })
);

var tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(36440)
    })
);
//viewer.zoomTo(tileset);

var r= 255, g=200, b=255;
var fadeColor = new Cesium.CallbackProperty(function(t, result){
    r=slider.value;
    if(r>0)
    {
      if(g>5)
        g=g-5;
      if(b>5)
        b=b-5;
    }
    return Cesium.Color.fromBytes(r, g, b, 255, result);
}, false);

let API_KEY = '49406c4e8b6ee455d1904676a313aa40';
function getWeather(latitude, longtitude) {
  $.ajax({
    url: 'http://api.openweathermap.org/data/2.5/forecast',
    data: {
      lat: latitude,
      lon: longtitude,
      units: 'imperial',
      APPID: API_KEY
    },
    success: data => {
      console.log(data['list'][30]['weather'][0]['main']);
      var temperature=data['list'][0]['main']['temp']; //humidity
      var humidity=data['list'][0]['main']['humidity'];
      var windSpeed=data['list'][0]['wind']['speed'];
      var desc=data['list'][30]['weather'][0]['main'];
      var curr_time=data['list'][0]['dt_txt'];
      console.log(curr_time)
      var tempElement = document.getElementById("temperature");
        tempElement.innerHTML = `${temperature}<i id="icon-thermometer" class="wi wi-thermometer"></i>` ;
      var humidityElem = document.getElementById("humidity");
        humidityElem.innerHTML = `${humidity}%`;
      var windElem = document.getElementById("wind");
        windElem.innerHTML = `${windSpeed}m/h`;
      var description = document.getElementById("description");
        description.innerHTML = `<i id="icon-desc" class="wi wi-owm-200"></i><p>${desc}</p>`;
      var time =document.getElementById("time");
        time.innerHTML = `${curr_time}`;
      
    }
  })
}

getWeather(40.863372, -74.113181);


function coordinate_to_address(objects,callback)
{
  objects=objects.slice(0,3);
  var geocode_address=[];
      for(let object of objects)
      {
        var input = object['cluster_latitude']+','+object['cluster_longitude'];
        var latlngStr = input.split(',', 2);
        var latlng = new google.maps.LatLng(parseFloat(latlngStr[0]), parseFloat(latlngStr[1]));
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'location': latlng}, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
              geocode_address.push(results[0]['formatted_address']);
                if(geocode_address.length == (objects.length)){
                  if(typeof callback == 'function'){
                    callback();
                  }
                }
          }
          else {
            alert('Geocoder failed due to: ' + status);
          }
        });
      }  
}

//Generate the dialog box
function map_create(img_id)
{
  var mapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: baltimore,
    zoom: 14
  }
  var cur=img_id;
  var res_obj;
  var res_img;
  res_obj = cur.substring(1, 2);
  res_img = cur.substring(3, 4);
  console.log(res_img);
  let object_lat = vulnerable_objects[object_indicator]['cluster_latitude'];
  let object_lon = vulnerable_objects[object_indicator]['cluster_longitude'];
  let observer_lat = vulnerable_objects[object_indicator]['cluster_objects'][res_img]['latitude'];
  let observer_lon = vulnerable_objects[object_indicator]['cluster_objects'][res_img]['longitude'];      
  var baltimore = new google.maps.LatLng(object_lat, object_lon);
  console.log(observer_lat)
  console.log(object_lon)
  var baltimore1 = new google.maps.LatLng(observer_lat, observer_lon);
  var panorama = new google.maps.StreetViewPanorama(
    document.getElementById('pano'),
    {
        position: baltimore1,
        pov: {heading: 4, pitch: 10},
        zoom: 2
    });
  var map = new google.maps.Map(
      document.getElementById('canvasMap'),
      {
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center: baltimore1,
          zoom: 14
      });
      var cafeMarker2 = new google.maps.Marker({
          position: baltimore,
          map: map,
          icon: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569',
          title: 'utility pole'
      });
      var cafeMarker1 = new google.maps.Marker({
          position: baltimore,
          map: panorama,
          icon: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569',
          title: 'utility pole'
      });
      google.maps.event.addListener(panorama, 'position_changed', function(){
          var heading = google.maps.geometry.spherical.computeHeading(panorama.getPosition(), cafeMarker2.getPosition());
          panorama.setPov({
              heading: heading,
              pitch: 0
          }); 
    });
      map.setStreetView(panorama);
}

function img_dialog(img_id)
{
    $("#dialog2").dialog({
      width: 700,
      resizable: false,
      draggable: true,
      height: 600,
      position: myPos_right,
      buttons: {
      Close: function() {
          $(this).dialog('close');
        }
      },
      open: function(){
          map_create(img_id);
      }
    }
);
}

viewer.scene.globe.depthTestAgainstTerrain = true;
var initialPosition = Cesium.Cartesian3.fromDegrees(-95.381735, 29.749122, 753);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
viewer.clock.shouldAnimate = true; 
viewer.infoBox.frame.removeAttribute('sandbox');
var frame = viewer.infoBox.frame;

viewer.scene.camera.setView({
    destination: initialPosition,
    orientation: initialOrientation,
    endTransform: Cesium.Matrix4.IDENTITY
});

var CheckFloodI = document.getElementById('x'); 
var CheckPowerI = document.getElementById('y');  //updateobj
var updateP = document.getElementById('updateobj');

var power1 = Cesium.GeoJsonDataSource.load('./geoMappings/updateobj.geojson');
var power3 = Cesium.GeoJsonDataSource.load('./geoMappings/power.geojson');
var power4 = Cesium.GeoJsonDataSource.load('./geoMappings/powerSub.geojson');
var power5 = Cesium.GeoJsonDataSource.load('./geoMappings/wire.geojson');
var flood1 = Cesium.GeoJsonDataSource.load('./geoMappings/dStormInlet_L5457_ver3.geojson');

var vulnerable_objects;
var object_indicator;
var url =Cesium.buildModuleUrl("./images/power.png");

var object_loc;
fetch('https://sk4a447dkf.execute-api.us-east-1.amazonaws.com/default/localize')
  .then(response => response.json())
  .then(function(json){
      let objects = json['objects'];
      vulnerable_objects = objects;
      // coordinate_to_address(objects,function(results)
      // {
      //   console.log("received all addresses:", results);
      // });
    for(let object of objects){
      var entity = new Cesium.Entity();
      entity.position = Cesium.Cartesian3.fromDegrees(object['cluster_longitude'],object['cluster_latitude'], 0);
      entity.name = object['cluster_id'];
      var lat =object['cluster_latitude'];
      var lon =object['cluster_longitude'];
      var name=object['cluster_id'];
      var cluster_obj=object['cluster_objects'];
      var image_url = cluster_obj[0]['image'];
      var image_date= cluster_obj[0]['createdDate'];
      var object_type=cluster_obj[0]['classification'];
      var cluster_addr=object['cluster_address'];

      entity.description = '\
      <style>\
      .rotate90 {\
        -webkit-transform: rotate(90deg);\
        -moz-transform: rotate(90deg);\
        -o-transform: rotate(90deg);\
        -ms-transform: rotate(90deg);\
        transform: rotate(90deg);\
        float: center;\
        text-align: center;\
        font-style: italic;\
        text-indent: 0;\
        border: thin silver solid;\
        margin: 0.5em;\
        padding: 0.5em;\
        width:100%;\
        min-width: 150px;\
      }\
      .cesium-infoBox-description {\
        font-family: "Times New Roman", Times, serif;\
        font-size: 6px;\
        padding: 4px 10px;\
        margin-right: 4px;\
        color: #edffff;\
      }\
      .cesium-infoBox-defaultTable tr:nth-child(odd) {\
        background-color: rgba(38, 38, 38, 1.0);\
        font-size:small;\
      }\
      .cesium-infoBox-defaultTable tr:nth-child(even) {\
        background-color: rgba(38, 38, 38, 1.0);\
        font-size:small;\
      }\
      .cesium-infoBox-defaultTable th {\
        font-weight: normal;\
        padding: 4px;\
        vertical-align: middle;\
        text-align: center;\
        font-size:small;\
      }\
      .cesium-infoBox-defaultTable td {\
        padding: 4px;\
        vertical-align: middle;\
        text-align: center;\
        font-size:small;\
      }\
      .cesium-infoBox-visible {\
        transform: translate(0, 0);\
        visibility: visible;\
        opacity: 0;\
        transition: opacity 0.2s ease-out, transform 0.2s ease-out;\
      }\
    </style>\
    <br style = "line-height:1;"><br>\
    <table class="cesium-infoBox-defaultTable">\
      <tr>\
        <th>classification</th>\
        <th>'+object_type+'</th>\
      </tr>\
      <tr>\
        <td>Object id</td>\
        <td>'+name+'</td>\
      </tr>\
      <tr>\
        <td>Coordinate</td>\
        <th>'+lat+'   '+lon+'</th>\
      </tr>\
      <tr>\
        <td>Receive Date</td>\
        <th>'+image_date.substring(0,10)+'</th>\
      </tr>\
      <tr>\
        <td>Address</td>\
        <th>'+cluster_addr+'</th>\
      </tr>\
      <tr>\
        <td>Analysis Results</td>\
      </tr>\
    </table>\
    <br style = "line-height:8;"><br>\
    <img data-object-id='+entity.name+' class="rotate90" src='+image_url+' >\
    <br style = "line-height:10;"><br>\
  ';
    entity.point = {
    color : Cesium.Color.BLUE,
    pixelSize : 15,
  };
    var updated=viewer.entities.add(entity);
      }
  });

var current_id="xx";
var current_id1="xx";
var current_c="0";
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function(click) {
           // Get current mouth position
            var pick = viewer.scene.pick(click.position);
            //pick current entity
            if(pick && pick.id){
              console.log(pick.id._name)
              object_indicator=pick.id._name;
            }
         }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

viewer.infoBox.frame.addEventListener('load', function() {
  viewer.infoBox.frame.contentDocument.body.addEventListener('click', function(e) {
  console.log("frame clicked")
  console.log(e.target.className)
  console.log(e.target.className == "rotate90")
  if(e.target && e.target.className === 'rotate90')
  {
    let myNode = document.getElementById("dialog1");
    while(myNode.firstChild)
    {
      myNode.removeChild(myNode.firstChild);
    }
    let element = e.target;
    let object_id = element.getAttribute("data-object-id");
    let object_clusters = vulnerable_objects[object_indicator]['cluster_objects'];
    current_c=object_clusters;
    var tmp=1;
    for(let object_image of object_clusters)
    { 
      let ima = new Image();
      ima.src = object_image['image'];
      console.log(ima.src)
      ima.height = 250;
      ima.width = 250;
      ima.id='i'+object_id+'-'+tmp.toString();
      ima.className="test";
      document.getElementById("dialog1").appendChild(ima);
      tmp=tmp+1;
    }
    var track=0
    current_id1='i'+object_id+'-'+track.toString();
    $(function(){
      $( "#dialog1" ).dialog({
        width: 600,
        height: 600,
        position: myPos,
        open: function()
        {
          $(".test").on('click', function () {
            current_id=$(this).attr('id');
            img_dialog(current_id);
          });
        }
      });
    });
    $(function(){
      $( "#dialog2" ).dialog({
        width: 600,
        height: 600,
        position:myPos_right,
        open: function()
        {
          console.log("map id"+current_id1)
          map_create(current_id1);
        }
      });
    });
  }
        // In case need to add button later
        // else if(e.target && e.target.id === 'viewButton'){
        //     current_id="i"+current_c+"-"+"0";
        //     img_dialog(current_id);
        // }
  }, false);
}, false);

power1.then(function(dataSource) {
    var entities = dataSource.entities.values;
    var name="";
    var Coordinate="";
    var Status="";
    var Potential_demage="";
    for (var i = 0; i < entities.length; i++) {
      var entity = entities[i];  
      if(entity.properties.hasProperty('Name')) {
        if(entity.properties.hasProperty('Name'))        
          name = entity.properties.Name.valueOf();
        if(entity.properties.hasProperty('Coordinate'))      
          Coordinate = entity.properties.Coordinate.valueOf();
        if(entity.properties.hasProperty('Status'))        
          Status = entity.properties.Status.valueOf();
        if (entity.properties.hasProperty('Potential_demage'))         
          Potential_demage = entity.properties.Potential_demage.valueOf();
    var descriptions = '\
     <style>\
    .cesium-infoBox-description {\
        font-family: "Times New Roman", Times, serif;\
        font-size: 6px;\
        padding: 4px 10px;\
        margin-right: 4px;\
        color: #edffff;\
    }\
    .cesium-infoBox-defaultTable tr:nth-child(odd) {\
        background-color: rgba(38, 38, 38, 1.0);\
        font-size:small;\
    }\
    .cesium-infoBox-defaultTable tr:nth-child(even) {\
        background-color: rgba(38, 38, 38, 1.0);\
        font-size:small;\
    }\
    .cesium-infoBox-defaultTable th {\
        font-weight: normal;\
        padding: 4px;\
        vertical-align: middle;\
        text-align: center;\
        font-size:small;\
    }\
    .cesium-infoBox-defaultTable td {\
        padding: 4px;\
        vertical-align: middle;\
        text-align: center;\
        font-size:small;\
    }\
    .cesium-infoBox-visible {\
        transform: translate(0, 0);\
        visibility: visible;\
        opacity: 0;\
        transition: opacity 0.2s ease-out, transform 0.2s ease-out;\
    }\
    \
    </style>\
    <table class="cesium-infoBox-defaultTable">\
      <tr>\
        <th>Type</th>\
        <th>Power</th>\
      </tr>\
      <tr>\
        <td>Name</td>\
        <td>'+name+'</td>\
      </tr>\
      <tr>\
        <td>Coordinate</td>\
        <td>'+Coordinate+'</td>\
      </tr>\
      <tr>\
        <td>Status</td>\
        <td>'+Status+'</td>\
      </tr>\
      <tr>\
        <td>Potential demage</td>\
        <td>'+Potential_demage+'</td>\
      </tr>\
    <tr>\
        <td>Severity</td>\
        <td>'+'1'+'</td>\
      </tr>\
    </table>\
     <img class="object-image" width="50% height="50%" style="float:center; margin: 0 1em 1em 0;" src="//cesium.com/docs/tutorials/creating-entities/Flag_of_Wyoming.svg"/>\
     ';
      entity.description = descriptions;
        }
        else
        {
         entity.billboard=undefined;
          entity.point = new Cesium.PointGraphics({
            color: Cesium.Color.WHITE,
            pixelSize: 10
        }); 
        }
    }
    });

viewer.entities.add({
    name : 'Red box with fade color',
    position: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 300000.0),
    box : {
        dimensions : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
        material : new Cesium.ColorMaterialProperty(fadeColor)
    }
});
//Utility pole data sources 
// TO DO change variable name
power3.then(function(dataSource) {
    var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.billboard = undefined; 
        entity.model=new Cesium.ModelGraphics({
        uri: './geoMappings/Utilitypole_3Dmodel.glb',
        scale: 0.2,
        color: fadeColor
        //show: false
        });
        viewer.entities.add(entity);
      }
    });

Cesium.when(power3,function(dataSource){
  CheckPowerI.addEventListener('change', function() {
    if ( CheckPowerI.checked) {
        //    viewer.dataSources.add(dataSource);
      var entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.show=true;
         //     console.log(entity.show)
      }
    }else{
            
            }
        });
    
    });

power4.then(function(dataSource) {
  var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.billboard = undefined; 
        entity.polyline.material=Cesium.Color.Red;
    }      
});
    
Cesium.when(power4,function(dataSource){
  CheckPowerI.addEventListener('change', function() {
    if (CheckPowerI.checked) {
      viewer.dataSources.add(dataSource);
    }else{
      viewer.dataSources.remove(dataSource);      
    }
  });  
});
    
power5.then(function(dataSource) {
  var entities = dataSource.entities.values;
    for(var i = 0; i < entities.length; i++) {
      var entity = entities[i];
      entity.billboard = undefined; 
        //entity.color=new Cesium.Color(fadeColor);
    }  
});
    
Cesium.when(power5,function(dataSource){
  CheckPowerI.addEventListener('change', function() {
    if (CheckPowerI.checked) {
      viewer.dataSources.add(dataSource);
    }else{
      viewer.dataSources.remove(dataSource);      
    }
  }); 
});

flood1.then(function(dataSource) {
  var entities = dataSource.entities.values;
    for(var i = 0; i < entities.length; i++) {
      var entity = entities[i];
    //  if(i==40){
        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
          color: Cesium.Color.WHITE,
          pixelSize: 50
        });
    //  }else{
        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
            color: Cesium.Color.YELLOW,
            pixelSize: 13
        });
    //  }
      }
    });
    
Cesium.when(flood1,function(dataSource){
  CheckFloodI.addEventListener('change', function() {
    if (CheckFloodI.checked) {
      viewer.dataSources.add(dataSource);
    }else{
      viewer.dataSources.remove(dataSource);
    }
  });    
});

function colorByDistance() {
    tileset.style = new Cesium.Cesium3DTileStyle({
        defines : {
            distance : 'distance(vec2(${Longitude}, ${Latitude}), vec2(-1.664242028123,0.5192594629615))'
        },
        color : {
            conditions : [
                ['${distance} > 0.00012',"color('gray')"],
                ['${distance} > 0.00008', "mix(color('yellow'), color('red'), (${distance} - 0.0008) / 0.00004)"],
                ['${distance} > 0.00004', "mix(color('green'), color('yellow'), (${distance} - 0.00004) / 0.00004)"],
                ['${distance} < 0.0000005', "color('white')"],
                ['true', "mix(color('blue'), color('green'), ${distance} / 0.00004)"]
            ]
        }
    });
}


