
require('cesium/Widgets/widgets.css');
require('./css/main.css');
var Cesium = require('cesium/Cesium');


Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzYyNDZmZi1lYTdhLTQwMDgtOGRhZC03ZDE5YTlkYmVkMGMiLCJpZCI6NDAxOSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzOTYzODc1OX0.Kb7k51vZGYR5F7btrBIAuSan3ZNyKY_AWrFv1cLFUFk';
var numClicks = 0;
var toolbar = document.getElementById('toolbar');
var viewer = new Cesium.Viewer('cesiumContainer', {
    // terrainProvider: Cesium.createWorldTerrain({
    //    //     requestVertexNormals: true,
    //     //    requestWaterMask: true

    //     }),
    timeline: true,
    animation: true,
    shadows: true,

});


var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
}


var slider1 = document.getElementById("myRange1");
var output1 = document.getElementById("demo1");
output1.innerHTML = slider1.value;
slider1.oninput = function() {
  output1.innerHTML = this.value;
}

var myPos = { my: "center center", at: "center-350 center", of: window };
var myPos_right = { my: "center center", at: "center+350 center", of: window };
var tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(37161)
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


var water_height = new Cesium.CallbackProperty(function(result){
  //  waterHeight=slider.value-;
  //  if(waterHeight < 12)
      water_height=slider.value;
      water_height += 0.1;
    return water_height;

},false);

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
  console.log("img_id"+img_id)
  var mapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: baltimore,
    zoom: 14
  }
  var cur=img_id;
  var res_obj;
  var res_img;
  res_obj = cur.substring(1, 2);
  res_img = parseInt(cur.substring(3, 4));
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
    let wWidth = $(window).width();
    let wHeight = $(window).height();
    let dWidth = wWidth *0.5;
    let dHeight = wHeight * 0.5;
    console.log("img_dialog called")
    $("#dialog2").dialog('close');
    $("#dialog2").dialog({
      width: dWidth,
      resizable: false,
      draggable: true,
      height: dHeight,
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
var initialPosition = Cesium.Cartesian3.fromDegrees(-95.334726705707027, 29.764084676987729, 253);
 var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
viewer.clock.shouldAnimate = true; 
viewer.infoBox.frame.removeAttribute('sandbox');
var frame = viewer.infoBox.frame;

viewer.scene.camera.setView({
    destination: initialPosition,
    orientation: initialOrientation,
    endTransform: Cesium.Matrix4.IDENTITY
});
// viewer.camera.setView({
//    destination: Cesium.Cartesian3.fromDegrees(-122.19, 46.20, 10000.0)
// });
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
    let wWidth = $(window).width();
    let wHeight = $(window).height();
    let dWidth = wWidth * 0.5;
    let dHeight = wHeight * 0.5; 

    $(function(){
      $( "#dialog1" ).dialog({
        width: dWidth,
        height: dHeight,
        position: myPos,
        open: function()
        {
          $(".test").on('click', function () {
            current_id=$(this).attr('id');
            console.log("zzzz")
            img_dialog(current_id);
          });
        }
      });
    });
    $(function(){
      $( "#dialog2" ).dialog({
        width: dWidth,
        height: dHeight,
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
        });
     
      }
    });

Cesium.when(power3,function(dataSource){
  CheckPowerI.addEventListener('change', function() {
    if ( CheckPowerI.checked) {    
      var entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.show=true;
      }
      viewer.dataSources.add(dataSource);

    }else
     viewer.dataSources.remove(dataSource);    
      
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
      if(i==40){
        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
          color: Cesium.Color.WHITE,
          pixelSize: 13
        });
      }else{
        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
            color: Cesium.Color.YELLOW,
            pixelSize: 13
        });
      }
      }
    });
    
Cesium.when(flood1,function(dataSource){
  CheckFloodI.addEventListener('change', function() {
    if (CheckFloodI.checked) {
      viewer.dataSources.add(dataSource);
      viewer.entities.add(entity_example);
    }else{
      viewer.dataSources.remove(dataSource);
      viewer.entities.remove(entity_example);
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

//waterHeight=0
var primitives = viewer.scene.primitives;
var poss_arr=[-95.334726705707027-0.00005, 29.764084676987729-0.00005,
              -95.334726705707027+0.00005, 29.764084676987729-0.00005,
              -95.334726705707027+0.00005, 29.764084676987729+0.00005,
              -95.334726705707027-0.00005,  29.764084676987729+0.00005
          ];
var poss=Cesium.Cartesian3.fromDegreesArray(poss_arr);
var dynamicPositions = new Cesium.CallbackProperty(function() {
    let temp=parseFloat(slider1.value/1000000);
    let poss1=Cesium.Cartesian3.fromDegreesArray([poss_arr[0]-temp,poss_arr[1]-temp,poss_arr[2]+temp,poss_arr[3]-temp
    ,poss_arr[4]+temp,poss_arr[5]+temp,poss_arr[6]-temp,poss_arr[7]+temp]);

    return new Cesium.PolygonHierarchy(poss1);
}, false);

var entity_example=new Cesium.Entity();
entity_example.polygon={height: 0,
        hierarchy: dynamicPositions ,
        material: Cesium.Color.RED.withAlpha(0.5)
}
entity_example.hierarchy=dynamicPositions;
entity_example.material=Cesium.Color.RED.withAlpha(0.5);

//     var entity = viewer.entities.add({
//         polygon: {height: 0,
//         hierarchy: dynamicPositions ,
//         material: Cesium.Color.RED.withAlpha(0.5)
// }
//     });
 // viewer.entities.add(entity_example);
viewer.zoomTo(entity_example);
//Need to fix after heatmap.js load
// let bounds = {
//     west: 147.13833844,
//     east: 147.13856899,
//     south: -41.43606916,
//     north: -41.43582929
// };
 
// // init heatmap
// let heatMap = CesiumHeatmap.create(
//     myViewer, // your cesium viewer
//     bounds, // bounds for heatmap layer
//     {
//         // heatmap.js options go here
//         // maxOpacity: 0.3
//     }
// );
 
// // random example data
// let data = [{"x":147.1383442264,"y":-41.4360048372,"value":76},{"x":147.1384363011,"y":-41.4360298848,"value":63},{"x":147.138368102,"y":-41.4358360603,"value":1},{"x":147.1385627739,"y":-41.4358799123,"value":21},{"x":147.1385138501,"y":-41.4359327669,"value":28},{"x":147.1385031219,"y":-41.4359730105,"value":41},{"x":147.1384127393,"y":-41.435928255,"value":75},{"x":147.1384551136,"y":-41.4359450132,"value":3},{"x":147.1384927196,"y":-41.4359158649,"value":45},{"x":147.1384938639,"y":-41.4358498311,"value":45},{"x":147.1385183299,"y":-41.4360213794,"value":93},{"x":147.1384007925,"y":-41.4359860133,"value":46},{"x":147.1383604844,"y":-41.4358298672,"value":54},{"x":147.13851025,"y":-41.4359098303,"value":39},{"x":147.1383874733,"y":-41.4358511035,"value":34},{"x":147.1384981796,"y":-41.4359355403,"value":81},{"x":147.1384504107,"y":-41.4360332348,"value":39},{"x":147.1385582664,"y":-41.4359788335,"value":20},{"x":147.1383967364,"y":-41.4360581999,"value":35},{"x":147.1383839615,"y":-41.436016316,"value":47},{"x":147.1384082712,"y":-41.4358423338,"value":36},{"x":147.1385092651,"y":-41.4358577623,"value":69},{"x":147.138360356,"y":-41.436046789,"value":90},{"x":147.138471893,"y":-41.4359184292,"value":88},{"x":147.1385605689,"y":-41.4360271359,"value":81},{"x":147.1383585714,"y":-41.4359362476,"value":32},{"x":147.1384939114,"y":-41.4358844253,"value":67},{"x":147.138466724,"y":-41.436019121,"value":17},{"x":147.1385504355,"y":-41.4360614056,"value":49},{"x":147.1383883832,"y":-41.4358733544,"value":82},{"x":147.1385670669,"y":-41.4359650236,"value":25},{"x":147.1383416534,"y":-41.4359310876,"value":82},{"x":147.138525285,"y":-41.4359394661,"value":66},{"x":147.1385487719,"y":-41.4360137656,"value":73},{"x":147.1385496029,"y":-41.4359187277,"value":73},{"x":147.1383989222,"y":-41.4358556562,"value":61},{"x":147.1385499424,"y":-41.4359149305,"value":67},{"x":147.138404523,"y":-41.4359563326,"value":90},{"x":147.1383883675,"y":-41.4359794855,"value":78},{"x":147.1383967187,"y":-41.435891185,"value":15},{"x":147.1384610005,"y":-41.4359044797,"value":15},{"x":147.1384688489,"y":-41.4360396127,"value":91},{"x":147.1384431875,"y":-41.4360684409,"value":8},{"x":147.1385411067,"y":-41.4360645847,"value":42},{"x":147.1385237178,"y":-41.4358843181,"value":31},{"x":147.1384406464,"y":-41.4360003831,"value":51},{"x":147.1384679169,"y":-41.4359950456,"value":96},{"x":147.1384194314,"y":-41.4358419739,"value":22},{"x":147.1385049792,"y":-41.4359574813,"value":44},{"x":147.1384097378,"y":-41.4358598672,"value":82},{"x":147.1384993219,"y":-41.4360352975,"value":84},{"x":147.1383640499,"y":-41.4359839518,"value":81}];
// let valueMin = 0;
// let valueMax = 100;

// // add data to heatmap
// heatMap.setWGS84Data(valueMin, valueMax, data);
