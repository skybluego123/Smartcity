
require('cesium/Widgets/widgets.css');
require('./css/main.css');
var h377=require('heatmap.js/build/heatmap.js');
var Cesium = require('cesium/Cesium');

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzYyNDZmZi1lYTdhLTQwMDgtOGRhZC03ZDE5YTlkYmVkMGMiLCJpZCI6NDAxOSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzOTYzODc1OX0.Kb7k51vZGYR5F7btrBIAuSan3ZNyKY_AWrFv1cLFUFk';
var numClicks = 0;
var toolbar = document.getElementById('toolbar');
var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain({
       //     requestVertexNormals: true,
            requestWaterMask: true

        }),
    timeline: true,
    animation: true,
    shadows: true,
    animation: true

});

var pinBuilder = new Cesium.PinBuilder();
var start_time;
var weather_data;

var pair_time=[]
var pair_wind=[]
var pair_temp=[]
var pair_humi=[]
var weather_desc=[]
var API_KEY='49406c4e8b6ee455d1904676a313aa40'

var weather_data1;
$.ajax({
    url: 'http://api.openweathermap.org/data/2.5/forecast',
    data: {
      lat: 30.6173014,
      lon: -96.3403507,
      units: 'imperial',
      APPID: API_KEY
    }, 
    async: false,
    dataType: 'json',
    success:function(data){
      weather_data1=data;
}
});

function update_weather(data,currentTime){
      weather_data=data;
      for(var i = 0; i < 38; i++)
      {
        weather_desc.push(data['list'][i]['weather'][0]['main'])
        pair_humi.push([weather_data['list'][i]['main']['humidity'],data['list'][i+1]['main']['humidity']])
        pair_wind.push([weather_data['list'][i]['wind']['speed'],weather_data['list'][i+1]['wind']['speed']])
        pair_temp.push([weather_data['list'][i]['main']['temp'],weather_data['list'][i+1]['main']['temp']])
        pair_time.push([Cesium.JulianDate.fromDate(new Date(weather_data['list'][i]['dt_txt'])),Cesium.JulianDate.fromDate(new Date(weather_data['list'][i+1]['dt_txt']))])
        
      }
      var wind_track=0;
      for(var i =0;i<38;i++)
      {
        let before=pair_time[i][0];
        let after=pair_time[i][1];

        if(Cesium.JulianDate.greaterThanOrEquals(currentTime,before) && Cesium.JulianDate.lessThan(currentTime,after))
        {
            wind_track=i
        }
           if(Cesium.JulianDate.equals(currentTime,before) && Cesium.JulianDate.equals(currentTime,after))
        {
            wind_track=i
        }
      }
      let cur_wind=(pair_wind[wind_track][0]+pair_wind[wind_track][1])/2
      let cur_temp=(pair_temp[wind_track][0]+pair_temp[wind_track][1])/2
      let cur_humi=(pair_humi[wind_track][0]+pair_humi[wind_track][1])/2
      let cur_desc=weather_desc[wind_track]
      let cur_rain='None';
      
      if(cur_desc=='Rain')
      {
        cur_rain=weather_data['list'][i]['rain']['3h']
      }

      let windElem = document.getElementById("wind");
      windElem.innerHTML = `${cur_wind.toFixed(3)}m/s`;
      let time =document.getElementById("time");
      time.innerHTML = `${Cesium.JulianDate.toDate(currentTime).toString().substring(4,25)}`;
      let tempElement = document.getElementById("temperature");
      tempElement.innerHTML = `${cur_temp.toFixed(3)}<i id="icon-thermometer" class="wi wi-thermometer"></i>` ;
      let humidityElem = document.getElementById("humidity");
      humidityElem.innerHTML = `${cur_humi}%`;
      let description = document.getElementById("description");
      description.innerHTML = `<i id="icon-desc" class="wi wi-owm-200"></i><p>${cur_desc}</p>`;
      let rainfall =document.getElementById("visibility");
         rainfall.innerHTML=`${cur_rain}`
    }


function onTimelineScrubfunction(e) {
  var clock = e.clock;
  clock.currentTime = e.timeJulian;
  clock.shouldAnimate = true;
  update_weather(weather_data1,e.timeJulian);

}
viewer.clock.onTick.addEventListener(function(clock){
    update_weather(weather_data1,clock.currentTime);
});

viewer.timeline.addEventListener('settime', onTimelineScrubfunction, false);

viewer.animation.viewModel.dateFormatter = localeDateTimeFormatter
viewer.animation.viewModel.timeFormatter = localeTimeFormatter
viewer.timeline.makeLabel = function (time) { return localeDateTimeFormatter(time) }

// Date formatting to a global form
function localeDateTimeFormatter(datetime, viewModel, ignoredate) {
    var julianDT = new Cesium.JulianDate(); 
    Cesium.JulianDate.addHours(datetime,-5,julianDT)
    var gregorianDT= Cesium.JulianDate.toGregorianDate(julianDT)
    var objDT;
    if (ignoredate)
        objDT = '';
    else {
        objDT = new Date(gregorianDT.year, gregorianDT.month - 1, gregorianDT.day);
        objDT = objDT.toLocaleString("default", { month: "long" })+ gregorianDT.day + ' '+gregorianDT.year  + ' ';
        if (viewModel || gregorianDT.hour + gregorianDT.minute === 0)
        return objDT;
        objDT += ' ';
    }
    return objDT + Cesium.sprintf("%02d:%02d:%02d", gregorianDT.hour, gregorianDT.minute, gregorianDT.second);
}

function localeTimeFormatter(time, viewModel) {
    return localeDateTimeFormatter(time, viewModel, true);
}


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

var myrange_stop;
var power_demage;
var temp_poles=[];
$('#myRange').change(function() {
  myrange_stop=$(this).val();
    $.ajax({
    url: 'https://jvc8szgvya.execute-api.us-west-2.amazonaws.com/default/networkanalysis',
    data: {
      'windspeed' : myrange_stop
    },
    async: false,
    dataType: 'json',
    success:function(data){
      power_demage=data;
    },
  })
 
  for(let x of poles_entity)
  {
     x.model.color=Cesium.Color.GREEN;
    for(let y of power_demage['failedpoles'])
    {
      if(x['manual_id']==y)
      {
        x.model.color=Cesium.Color.RED;
      }
    }
  }

});

var myVar = setInterval(myTimer, 10000);
function myTimer() {
  var cur_speed=Math.round(parseInt($('#wind').text()));
  //console.log(cur_speed);
      $.ajax({
    url: 'https://jvc8szgvya.execute-api.us-west-2.amazonaws.com/default/networkanalysis',
    data: {
      'windspeed' : cur_speed
    },
    async: false,
    dataType: 'json',
    success:function(data){
      power_demage=data;
    },
  })
 
  for(let x of poles_entity)
  {
     x.model.color=Cesium.Color.GREEN;
    for(let y of power_demage['failedpoles'])
    {
      if(x['manual_id']==y)
      {
        x.model.color=Cesium.Color.RED;
      }
    }
  }


}

var myPos = { my: "center center", at: "center-370 center", of: window };
var myPos_right = { my: "center center", at: "center+370 center", of: window };
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


var r= 0, g=255, b=0;
var fadeColor = new Cesium.CallbackProperty(function(){
    r=slider.value;
    g=255-slider.value;
    return Cesium.Color.fromBytes(r, g, b, 255);
}, false);


function getCallback(long,lat) {
    return function callbackFunction() {
    var poss_arr=[long-0.00005, lat-0.00005,
              long+0.00005, lat-0.00005,
              long+0.00009, lat+0.00009,
              long-0.00005, lat+0.00005,
              long-0.00007, lat+0.00007
          ];
var poss=Cesium.Cartesian3.fromDegreesArray(poss_arr);
if(slider1.value > 10)
{
 let temp=parseFloat((slider1.value-10)/1000000);
    let poss1=Cesium.Cartesian3.fromDegreesArray([poss_arr[0]-temp,poss_arr[1]-temp,poss_arr[2]+temp,poss_arr[3]-temp
    ,poss_arr[4]+temp,poss_arr[5]+temp,poss_arr[6]-temp,poss_arr[7]+temp,poss_arr[8]-temp,poss_arr[9]+temp]);
 return new Cesium.PolygonHierarchy(poss1);
}
    };
}


var water_height = new Cesium.CallbackProperty(function(result){
      water_height=slider.value;
      water_height += 0.1;
    return water_height;
},false);

      let temperature=0 //humidity
      let humidity=0;
      let windSpeed=0.0;
      let desc='rain';
      let curr_time='Mar 31 2020 23:23:23';
      let cur_rain=''

      let tempElement = document.getElementById("temperature");
        tempElement.innerHTML = `${temperature}<i id="icon-thermometer" class="wi wi-thermometer"></i>` ;
      let humidityElem = document.getElementById("humidity");
        humidityElem.innerHTML = `${humidity}%`;
      let windElem = document.getElementById("wind");
        windElem.innerHTML = `${windSpeed}m/h`;
      let description = document.getElementById("description");
        description.innerHTML = `<i id="icon-desc" class="wi wi-owm-200"></i><p>${desc}</p>`;
      let time =document.getElementById("time");
        time.innerHTML = `${curr_time}`;
      let rainfall =document.getElementById("visibility");
         rainfall.innerHTML=`${cur_rain}`

var myVar = '';
function getAddr(latitude, longtitude) {
  $.ajax({
    url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode',
    data: {
      'f': 'pjson',
      'featureTypes':'',
      'location': latitude +','+longtitude,
    },
    async: false,
    dataType: 'json',
    success:function(data){
      myVar=data;
    },
  })
  return myVar;
}

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
  res_obj = parseInt( cur.substring(
    cur.lastIndexOf("i") + 1, 
    cur.lastIndexOf("-")
));
  console.log(res_obj)
  res_img = cur.substring(
    cur.lastIndexOf("-") + 1, 
    cur.lastIndexOf("-") + 2
)
 
  let object_lat = vulnerable_objects[object_indicator]['cluster_latitude'];
  let object_lon = vulnerable_objects[object_indicator]['cluster_longitude'];
  let observer_lat = vulnerable_objects[object_indicator]['cluster_objects'][res_img]['latitude'];
  let observer_lon = vulnerable_objects[object_indicator]['cluster_objects'][res_img]['longitude'];      
  var baltimore = new google.maps.LatLng(object_lat, object_lon);
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
    let dWidth = wWidth *0.4;
    let dHeight = wHeight * 0.4;
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


//var power3 = Cesium.GeoJsonDataSource.load('./geoMappings/power.geojson');
var power4 = Cesium.GeoJsonDataSource.load('./geoMappings/powerSub.geojson');
var power5 = Cesium.GeoJsonDataSource.load('./geoMappings/wire.geojson');
var flood1 = Cesium.GeoJsonDataSource.load('./geoMappings/dStormInlet_L5457_ver3.geojson');

var vulnerable_objects;
var object_indicator;
var url =Cesium.buildModuleUrl("./images/power.png");

var inlet_longs=[]
var inlet_lats=[]
var entity_array=[]

// fetch("./geoMappings/dStormInlet_L5457_ver3.json")
//   .then(response => response.json())
//   .then(function(json){
//     let inlets=json['features'];
//     console.log("fetch json")
//     for(let inlet of inlets)
//     {
//       let inlet_long = inlet['geometry']['coordinates'][0];
//       let inlet_lat = inlet['geometry']['coordinates'][1];
//       inlet_longs.push(inlet_long)
//       inlet_lats.push(inlet_lat)

//     }
  
// let target_long=inlet_longs[40]
// let target_lat=inlet_lats[40]

// //draw_polygon(inlet_longs,inlet_lats,target_long,target_lat)
// for(let i =0;i<40;i++)
//   {
//     let poss_arr=[inlet_longs[i]-0.00005,inlet_lats[i]-0.00005,
//               inlet_longs[i]+0.00005, inlet_lats[i]-0.00005,
//               inlet_longs[i]+0.00009, inlet_lats[i]+0.00009,
//               inlet_longs[i]-0.00005, inlet_lats[i]+0.00005,
//               inlet_longs[i]-0.00007, inlet_lats[i]+0.00007
//           ];

// let poss=Cesium.Cartesian3.fromDegreesArray(poss_arr);


//     let entity_example=new Cesium.Entity();
//     entity_example.polygon={
//         hierarchy:new Cesium.CallbackProperty(getCallback(inlet_longs[i],inlet_lats[i]), false),//new Cesium.PolygonHierarchy(poss),//getCallback(inlet_longs[i],inlet_lats[i]),
//         material: Cesium.Color.RED.withAlpha(0.5),
//         heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
//         show: true
//     }
//     entity_array.push(entity_example);
//     viewer.entities.add(entity_example);
//   }

//   });

  
// function draw_polygon(center_long,center_lat,target_long,target_lat)
// {
// for(let i =0;i<40;i++)
//   {
//     let poss_arr=[inlet_longs[i]-0.00005,inlet_lats[i]-0.00005,
//               inlet_longs[i]+0.00005, inlet_lats[i]-0.00005,
//               inlet_longs[i]+0.00009, inlet_lats[i]+0.00009,
//               inlet_longs[i]-0.00005, inlet_lats[i]+0.00005,
//               inlet_longs[i]-0.00007, inlet_lats[i]+0.00007
//           ];

// let poss=Cesium.Cartesian3.fromDegreesArray(poss_arr);


//     let entity_example=new Cesium.Entity();
//     entity_example.polygon={
//         hierarchy:new Cesium.CallbackProperty(getCallback(inlet_longs[i],inlet_lats[i]), false),//new Cesium.PolygonHierarchy(poss),//getCallback(inlet_longs[i],inlet_lats[i]),
//         material: Cesium.Color.RED.withAlpha(0.5),
//         heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
//         show: true
//     }
//     entity_array.push(entity_example);
//     viewer.entities.add(entity_example);
//   }
    
//     entity_array.push(entity_example);
//     viewer.entities.add(entity_example);
//   }
//  // console.log(entity_array.length)




function toRad(Value) 
{
      return Value * Math.PI / 180;
}

function distance_to_reported(reported_long,reported_lat,inlet_long,inlet_lat)
{
      var R = 6371; // km
      var dLat = toRad(inlet_lat-reported_lat);
      var dLon = toRad(inlet_long-reported_long);
      var lat1 = toRad(reported_lat);
      var lat2 = toRad(inlet_lat);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      if(d > 0.5)
        return false;
      else
        return true;
}
   
var url = Cesium.buildModuleUrl('./images/power.png')
var object_loc;
fetch('https://bz4knl8hyc.execute-api.us-west-2.amazonaws.com/default/localize')
  .then(response => response.json())
  .then(function(json){
      let objects = json['objects'];
      vulnerable_objects = objects;

    for(let object of objects){
      let entity = new Cesium.Entity();
      entity.position = Cesium.Cartesian3.fromDegrees(object['cluster_longitude'],object['cluster_latitude'], 0);
      entity.name = object['cluster_id'];
      let lat =object['cluster_latitude'];
      let lon =object['cluster_longitude'];
      var test=getAddr(lon,lat);
      let name=object['cluster_id'];
      let cluster_obj=object['cluster_objects'];
      let image_url = cluster_obj[0]['image'];
      let image_date= cluster_obj[0]['createdDate'];
      let object_type=cluster_obj[0]['classification'];
      entity.billboard= new Cesium.BillboardGraphics();
      entity.billboard.image= pinBuilder.fromText('?', Cesium.Color.BLACK, 48).toDataURL()
      entity.billboard.verticalOrigin=Cesium.VerticalOrigin.BOTTOM

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
        <th>'+test['address']['Match_addr']+'</th>\
      </tr>\
      <tr>\
        <td>Analysis Results</td>\
      </tr>\
    </table>\
    <br style = "line-height:8;"><br>\
    <img data-object-id='+entity.name+' class="rotate90" src='+image_url+' >\
    <br style = "line-height:10;"><br>\
  ';
  //   entity.point = {
  //   color : Cesium.Color.BLUE,
  //   pixelSize : 15,
  //   height: 0
  // };
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
      //image_url.substring(38,image_url.length)
      ima.src = object_image['image'];//.substring(38,object_image['image'].length);
     // console.log(ima.src)
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
        //  console.log("map id"+current_id1)
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


var poles;
var poles_entity=[];
CheckPowerI.addEventListener('change',function(){
if(CheckPowerI.checked){
fetch('http://backend.digitaltwincities.info/poles')
  .then(response => response.json())
  .then(function(json){
    let objects = json['data'];
    poles=objects;
    //console.log(poles)
    for(let object of objects){
      let entity = new Cesium.Entity();
      entity.position = Cesium.Cartesian3.fromDegrees(object['longitude'],object['latitude'], 0);
      entity.name = object['id'];
      var manual_id = object['manual_id'];
      entity.billboard = undefined; 
      entity.model=new Cesium.ModelGraphics({
      uri: './geoMappings/Utilitypole_3Dmodel.glb',
      scale: 0.2,
      color: fadeColor,//Cesium.Color.GREEN,
      heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
        });
      entity.addProperty("manual_id")
      entity.manual_id=manual_id;
      var pole=viewer.entities.add(entity);

      poles_entity.push(entity);
    }
    
    });
}
else
{
  for(var x of poles_entity)
  {
    var pole=viewer.entities.remove(x);
  }
}

});

power4.then(function(dataSource) {
  var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.polygon.material=new Cesium.Material(Cesium.Color.YELLOW);
        entity.polygon.outline=false;
        entity.polygon.heightReference=Cesium.HeightReference.CLAMP_TO_GROUND;
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
      entity.polyline.clampToGround=true;
      entity.polyline.material=new Cesium.Material(Cesium.Color.YELLOW);
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

var inlet_coordinates=[]
var inlet_longs=[]
flood1.then(function(dataSource) {
  var entities = dataSource.entities.values;
    for(var i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let Coordinate="";
      //Coordinate=entity.properties.Coordinate.valueOf();
      //console.log(Coordinate)
      if(i==40){
        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
          color: Cesium.Color.WHITE,
          pixelSize: 13,
          heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
        });
      }else{
        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
            color: Cesium.Color.YELLOW,
            pixelSize: 13,
            heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
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
// var primitives = viewer.scene.primitives;
var poss_arr=[-95.334726705707027-0.00005, 29.764084676987729-0.00005,
              -95.334726705707027+0.00005, 29.764084676987729-0.00005,
              -95.334726705707027+0.00009, 29.764084676987729+0.00009,
              -95.334726705707027-0.00005,  29.764084676987729+0.00005,
              -95.334726705707027-0.00007,  29.764084676987729+0.00007
          ];
var poss=Cesium.Cartesian3.fromDegreesArray(poss_arr);
var dynamicPositions = new Cesium.CallbackProperty(function() {
    let temp=parseFloat(slider1.value/1000000);
    let poss1=Cesium.Cartesian3.fromDegreesArray([poss_arr[0]-temp,poss_arr[1]-temp,poss_arr[2]+temp,poss_arr[3]-temp
    ,poss_arr[4]+temp,poss_arr[5]+temp,poss_arr[6]-temp,poss_arr[7]+temp,poss_arr[8]-temp,poss_arr[9]+temp]);

    return new Cesium.PolygonHierarchy(poss1);
}, false);

var dynamicPositions1 = new Cesium.CallbackProperty(function() {
    let temp=parseFloat((slider1.value-40)/1000000);
    let poss1=Cesium.Cartesian3.fromDegreesArray([poss_arr[0]-temp,poss_arr[1]-temp,poss_arr[2]+temp,poss_arr[3]-temp
    ,poss_arr[4]+temp,poss_arr[5]+temp,poss_arr[6]-temp,poss_arr[7]+temp,poss_arr[8]-temp,poss_arr[9]+temp]);

    return new Cesium.PolygonHierarchy(poss1);
}, false);

var entity_example=new Cesium.Entity();
entity_example.polygon={
        height: 0,
        hierarchy: dynamicPositions ,
        material: Cesium.Color.RED.withAlpha(0.5),
        heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
}


// var dataSourcePromise=viewer.dataSources.add(Cesium.CzmlDataSource.load('./geoMappings/power.czml'));
// //var dataSourcePromise = viewer.dataSources.add(Cesium.CzmlDataSource.load(czml));
// dataSourcePromise.then(function(dataSource){
//     //viewer.trackedEntity = dataSource.entities.getById('utility pole');
// }).otherwise(function(error){
//     //window.alert(error);
// });

inlet_longs=[
-95.36577791950545,
-95.36366429670309,
-95.35839870527784,
-95.3636425479564,
-95.35992051291285,
-95.35234683467759,
-95.33467318235415,
-95.33639868218921,
-95.3357208569561,
-95.33652734277139,
-95.3355446117371,
-95.32739880473369,
-95.32755967287737,
-95.34313391908204,
-95.33739694524824,
-95.33775834000846,
-95.33821792323538,
-95.33753413034906,
-95.333669225267,
-95.33836028305456,
-95.34312791768963,
-95.33849601340032,
-95.33455926090745,
-95.33551309631945,
-95.33732151179186,
-95.33639818982513,
-95.34288845557322,
-95.34307060907666,
-95.33847018172803,
-95.33836056951404,
-95.33554609275578,
-95.33550328704538,
-95.34313042453068,
-95.3429295862329,
-95.33639205759754,
-95.33379253267056,
-95.33736698864647,
-95.33748997254901,
-95.33452734437004,
-95.34312926465981,
-95.33472670570703,
-95.33363432830421,
-95.33472523699695,
-95.33655387987463,
-95.33550230383952,
-95.33731984751243,
-95.3375557333095,
-95.33649407295198,
-95.33638507039397,
-95.32756458893397,
-95.34290380300097,
-95.34314514154322,
-95.34310032976805,
-95.3363641061303,
-95.33655137665158,
-95.32756212395591,
-95.32747139413173,
-95.34310167415254,
-95.35009344561736,
-95.35245612981673,
-95.36351461371665,
-95.36347663501891,
-95.36589568121671,
-95.35585647154096,
-95.36603773786985,
-95.36847979085589,
-95.3646968355077,
-95.35730895235655,
-95.36881332454399,
-95.35483532203665,
-95.36260605735553,
-95.36503980270108,
-95.36107515155793,
-95.36231516171141,
-95.35856055109008,
-95.35892562836986,
-95.36489557393384,
-95.36479417003085,
-95.35275936751458,
-95.35510472781996,
-95.36858679018631,
-95.35890293896455,
-95.3613807124456,
-95.35501731499731,
-95.3525098822553,
-95.35866543911014,
-95.35284528499956,
-95.36600179364648,
-95.35044071304489,
-95.36271185023232,
-95.35438479833124,
-95.36651984655178,
-95.36407693588963,
-95.36255048391433,
-95.35053761936209,
-95.35256432906117,
-95.35450009700277,
-95.36388156478365,
-95.36609132058484,
-95.36419838408999,
-95.35016513694104,
-95.36173369428911,
-95.36648098457323,
-95.36397749890378,
-95.35027801193195,
-95.36423618441151,
-95.35424610503321,
-95.35180150429042,
-95.35166443983388,
-95.35411744298169,
-95.36526743005379,
-95.36561306549804,
-95.36324658948492,
-95.35537698146908,
-95.35194622908863,
-95.36542062972802,
-95.355704289342,
-95.35951410833316,
-95.36673185270091,
-95.36547038969712,
-95.35332510864325,
-95.3518263589364,
-95.35950669474718,
-95.35547003926284,
-95.35933271355854,
-95.3632928022082,
-95.3514640841569,
-95.3534170461894,
-95.36675057633491,
-95.36458980033474,
-95.36694941983407,
-95.35096813763136,
-95.364699848116,
-95.35295988640972,
-95.36875334925993,
-95.36845416072556,
-95.35104853417133,
-95.36686250388058,
-95.35316049013592,
-95.35468162496244,
-95.35078463363263,
-95.35850839083913,
-95.36480871241346,
-95.36445356446573,
-95.368553366366,
-95.36820719055989,
-95.35449958880459,
-95.36708786331928,
-95.36479554995034,
-95.35483330570317,
-95.35114863703105,
-95.36454464410582,
-95.35830319529883,
-95.36831002948944,
-95.35100852718013,
-95.35459621301314,
-95.35993140313724,
-95.35840005105094,
-95.36804453502694,
-95.35597792697051,
-95.3673415225802,
-95.35976056838547,
-95.35256170689884,
-95.36762377349413,
-95.3538621883647,
-95.36732564069492,
-95.35242422304242,
-95.36775723578299,
-95.36012446161644,
-95.36772073205779,
-95.35395603004503,
-95.36735864078864,
-95.35361106715797,
-95.36517957513934,
-95.3599524091743,
-95.36528972643278,
-95.35166060615046,
-95.35529595524994,
-95.36736274596733,
-95.35371025908104,
-95.36538614287969,
-95.36755853827212,
-95.35512479341281,
-95.35174996513767,
-95.36742859200763,
-95.3688265706381,
-95.36766924043798,
-95.35141984618426,
-95.3653884889204,
-95.3670253730782,
-95.35149107536625,
-95.36781342168452,
-95.36652132159813,
-95.35314609554324,
-95.3681734661506,
-95.36829179508838,
-95.35690413836117,
-95.35295204174656,
-95.36660149586879,
-95.35200500028583,
-95.36790178105598,
-95.35665666582537,
-95.3544265575335,
-95.35661651845537,
-95.36794431497404,
-95.35181192965294,
-95.3663496676712,
-95.35666583375136,
-95.35427872895342,
-95.35678819979191,
-95.368284772169,
-95.36576170841842,
-95.35215958809151,
-95.36790103686337,
-95.36830587264161,
-95.36207368441383,
-95.3658781975049,
-95.36811056450695,
-95.3681305740338,
-95.36604014954108,
-95.35198657825036,
-95.35685203179197,
-95.3656327867775,
-95.36597634590292,
-95.35690024403735,
-95.35968757729695,
-95.36209923353664,
-95.35235051906974,
-95.3557729243251,
-95.35704150513385,
-95.3659778109465,
-95.34319821681163,
-95.34554764019805,
-95.34313617901238,
-95.34566042287021,
-95.34330085489071,
-95.34251105795818,
-95.33583664499822,
-95.33553695399031,
-95.34389303865272,
-95.33132272211905,
-95.33552685878665,
-95.34397377161613,
-95.33583925277945,
-95.33942842057367,
-95.33841151315393,
-95.338660621015,
-95.33956564594465,
-95.3429790368435,
-95.33659030509683,
-95.33649078800875,
-95.34483727559201,
-95.33840777963566,
-95.33866212559332,
-95.3443494959521,
-95.34365764159273,
-95.32892292363037,
-95.32884605132973,
-95.34201835045462,
-95.3394194137247,
-95.33956209340201,
-95.32746903583218,
-95.32743868985888,
-95.34288990795619,
-95.34368830848189,
-95.3437926106217,
-95.34241855855586,
-95.33375352170009,
-95.3338256691467,
-95.34277771836601,
-95.33467922085333,
-95.33474102950812,
-95.34239203881324,
-95.34284033677743,
-95.34514669695255,
-95.33387721584289,
-95.33551801056694,
-95.33369216446528,
-95.34284500620012,
-95.33582006507267,
-95.3366507743271,
-95.33739486493644,
-95.3358190089245,
-95.34532169834009,
-95.33551662136065,
-95.33763629294049,
-95.33467438015593,
-95.33473815822045,
-95.33665021025466,
-95.33839940345558,
-95.33861558810865,
-95.33763266651437,
-95.33932321060936,
-95.3373977479297,
-95.34291851846109,
-95.33958808968903,
-95.33996904393972,
-95.33843064286924,
-95.32758329333535,
-95.33940964356346,
-95.33953627479818,
-95.32758480532847,
-95.3429234381325,
-95.34304370865932,
-95.3418139362923,
-95.3338063654413,
-95.33463084689949,
-95.33472356970343,
-95.3358004495114,
-95.3417302393846,
-95.33547114887784,
-95.33640384656557,
-95.33742463987234,
-95.33663847872869,
-95.33579994387202,
-95.33372315939805,
-95.33381218010737,
-95.33663761955246,
-95.33765467079701,
-95.33838376783979,
-95.33547277339417,
-95.33855881837293,
-95.3394057834436,
-95.33765619060392,
-95.33646665172321,
-95.33838043376285,
-95.33742355332178,
-95.33954795557248,
-95.33851842096915,
-95.34064012666816,
-95.3415719204218,
-95.33949369377447,
-95.3393850827155,
-95.34498094944612,
-95.34489830749035,
-95.34051317230866,
-95.34062975954188,
-95.32754415510821,
-95.3274940350738,
-95.33754932651105,
-95.33742141759217,
-95.34180668737316,
-95.34290578648441,
-95.3430359212499,
-95.3417253108829,
-95.33638410897767,
-95.33662132110635,
-95.33736585390396,
-95.33759542387547,
-95.33637043373191,
-95.33834447782438,
-95.33856935188727,
-95.34061508313356,
-95.34049977613857,
-95.33834341827738,
-95.34029206601683,
-95.34054451448381,
-95.34162642168054,
-95.34172967903761,
-95.34164483521796,
-95.32801840679282,
-95.32809669579174,
-95.34302875274722,
-95.34290984325048,
-95.32796726806805,
-95.33462125925915,
-95.33472481076808,
-95.32965197496432,
-95.33555722533087,
-95.3357282546361,
-95.3301086714198,
-95.33044695100277,
-95.32806309102762,
-95.33642403723627,
-95.33655228086079,
-95.32963287653446,
-95.34288933712705,
-95.34301374053848,
-95.33009490898542,
-95.33269078410248,
-95.33455028589343,
-95.330417004453,
-95.33475933918051,
-95.33850038303724,
-95.33841608950242,
-95.33752128025581,
-95.33660130716369,
-95.33293332563652,
-95.33734924218197,
-95.33756553752336,
-95.338315971769,
-95.33855340235507,
-95.33303040783849,
-95.33277597259294,
-95.33292836660067,
-95.33320052899441,
-95.33789079487437,
-95.33796263904982,
-95.34302328834674,
-95.34287896101566,
-95.33310859105403,
-95.33361636340558,
-95.33376959963003,
-95.33460133308152,
-95.35132884516062,
-95.35140725382725,
-95.35815171590909,
-95.35802842987077,
-95.35594067914893,
-95.35132629984423,
-95.35572901784272,
-95.35216666247752,
-95.35335748377923,
-95.35499727740438,
-95.35355785686204,
-95.35410215014589,
-95.35493922690607,
-95.35455492039202,
-95.35199101636266,
-95.35218311892987,
-95.35509426408207,
-95.35691604177411,
-95.35474693852716,
-95.35350452577292,
-95.35339173703127,
-95.35677587998947,
-95.36771538375231,
-95.35510046093148,
-95.35496376744959,
-95.35819325830445,
-95.35794952336485,
-95.35505875238098,
-95.36773070494486,
-95.35798578442697,
-95.36354309378531,
-95.35786967326646,
-95.36340224086806,
-95.35174757850419,
-95.35683048589524,
-95.3568678716402,
-95.35791831426849,
-95.35175166928985,
-95.3560949262917,
-95.35787831456612,
-95.3559618106668,
-95.3636201208491,
-95.3634623145686,
-95.35338587172778,
-95.35305514579655,
-95.3535146474074,
-95.35417505346636,
-95.35607199531324,
-95.35783927439863,
-95.35432251401114,
-95.35313295981078,
-95.3577453461978,
-95.35622949693375,
-95.35494156817602,
-95.35414765532099,
-95.35340216517154,
-95.35198609255126,
-95.35210715036624,
-95.3541793141979,
-95.3542956465017,
-95.3549626846913,
-95.36046855123703,
-95.35973153825796,
-95.36760602000079,
-95.35739530115254,
-95.35720201363968,
-95.35198010768242,
-95.35212083586094,
-95.3606631575582,
-95.3678568728218,
-95.3624641293499,
-95.36058335708498,
-95.36006414934322,
-95.35633908389113,
-95.35563443783046,
-95.35197981659314,
-95.35211091600794,
-95.36009768801712,
-95.35567026645893,
-95.35920656513206,
-95.3605069269333,
-95.36045043153021,
-95.35561011903914,
-95.36823097495795,
-95.3584973643263,
-95.36304879604668,
-95.36798624059433,
-95.36307895040625,
-95.36823802339009,
-95.36810593457074,
-95.35872015963817,
-95.36313361510163,
-95.36626592253778,
-95.35968229916446,
-95.36586729198012,
-95.36834456814648,
-95.36838575574394,
-95.36587484741662,
-95.36822105847334,
-95.36547266426159,
-95.36548336920883,
-95.36509920243844,
-95.36510784076864,
-95.36576277008324,
-95.36739935744386,
-95.35554189351429,
-95.36751410573402,
-95.36541154439473,
-95.36723937866522,
-95.36514994799596,
-95.36720292132257,
-95.36582141828353,
-95.36637811334923,
-95.36204881442828,
-95.36110753818345,
-95.36758371093218,
-95.35595167082134,
-95.36620191248826,
-95.36522052393812,
-95.35196833469935,
-95.36725827577082,
-95.35209521854561,
-95.35574484115229,
-95.36798616544462,
-95.3620104820154,
-95.36575262593075,
-95.362424678659,
-95.36577017732054,
-95.36524388863694,
-95.3645518084544,
-95.36530121792754,
-95.36520532038895,
-95.36416586237893,
-95.36326476649909,
-95.35121087519359,
-95.35106983424383,
-95.36654348546125,
-95.36096343368669,
-95.36673640818498,
-95.36122605793916,
-95.36127228745097,
-95.36079458475794,
-95.3610248154594,
-95.35208652236327,
-95.35189125529361,
-95.36679359337774,
-95.36105553254751,
-95.36101493564622,
-95.36155060823876,
-95.36087165343831,
-95.36091378977837,
-95.36048901081071,
-95.36086691616596,
-95.36076133090768,
-95.34923193390307,
-95.34288122958121,
-95.34309892055214,
-95.32764241069697,
-95.32755798201052,
-95.32771707660326,
-95.32778587969655,
-95.33970968320557,
-95.34784637867646,
-95.34775954790699,
-95.34784948839776,
-95.34792196521506,
-95.344858101475,
-95.34503349313327,
-95.34489775787561,
-95.3448067181557,
-95.34465015039233,
-95.34470817469982,
-95.34068413625005,
-95.34589603103709,
-95.34618715409877,
-95.34592635265074,
-95.34600965856193,
-95.34623862330265,
-95.34117663270858,
-95.34127157452377,
-95.34541367289457,
-95.33990179030751,
-95.3412809341183,
-95.33709881616389,
-95.34563488366882,
-95.33714493344156,
-95.33012168459223,
-95.33034607347282,
-95.3303983990634,
-95.33007336055294,
-95.33005994682665,
-95.33012247114173,
-95.33020735135217,
-95.34424208053386,
-95.34482738318572,
-95.34405490193052,
-95.3365655722888,
-95.34445777826342,
-95.33646912230567,
-95.3444018262195,
-95.34420013417267,
-95.34432033589908,
-95.3421159762176,
-95.3420398416514,
-95.34221543110807,
-95.34211212600115,
-95.3309229939286,
-95.33059646284326,
-95.33064638573256,
-95.33072882472608,
-95.33024353708876,
-95.33031397685656,
-95.3302870293201,
-95.33024135584768,
-95.33147228509166,
-95.33737874473992,
-95.33112868034317,
-95.33728706058861,
-95.34069703975425,
-95.33745091316935,
-95.34189957043402,
-95.33118401535654,
-95.34066129681747,
-95.34060266988833,
-95.34209740833046,
-95.34210623453806,
-95.33156694658243,
-95.35991562226582,
-95.35237975538179,
-95.35682593066564,
-95.34884813415869,
-95.36405081731492,
-95.36741558084516,
-95.35618442713537,
-95.35258420858558,
-95.36363901274508,
-95.3524418663229,
-95.36740149163099,
-95.36776783938814,
-95.3562257459918,
-95.35387978810898,
-95.35951303241421,
-95.36029409961903,
-95.3569558828033,
-95.36525892015486,
-95.36374380065425,
-95.36012928175674,
-95.36751710768195,
-95.3570232828875,
-95.36758197556505,
-95.3651420561967,
-95.35925124779041,
-95.35359288673618,
-95.35918004666641,
-95.35386451401045,
-95.36543652513134,
-95.35716038447418,
-95.3597600347474,
-95.366800068705,
-95.3652957834348,
-95.34949858358033,
-95.35722353576932,
-95.35324487932152,
-95.3531686886841,
-95.3603142966037,
-95.35937969464848,
-95.36690961603364,
-95.35689683459526,
-95.35952345046509,
-95.35890691438044,
-95.35730042573003,
-95.34961164492586,
-95.34932916929164,
-95.35679512314057,
-95.36449371192634,
-95.35335342735752,
-95.35917709666033,
-95.3607219791666,
-95.36729479649622,
-95.36573330289335,
-95.36724781041386,
-95.35353346711307,
-95.35213571061644,
-95.36565599456347,
-95.36836635206903,
-95.36706931627063,
-95.36712304689526,
-95.35337558600995,
-95.3558648170076,
-95.36745454624821,
-95.35986135215762,
-95.35373269439066,
-95.3686232942826,
-95.3683399881447,
-95.36124005512939,
-95.36112558231997,
-95.36119128293396,
-95.36531564347068,
-95.36727601869809,
-95.35345727098465,
-95.36126986367503,
-95.36132542546538,
-95.36114818695981,
-95.35269004079457,
-95.3626807894409,
-95.3525773987521,
-95.36276006293906,
-95.35287988476378,
-95.36458357894577,
-95.35062856635604,
-95.36239589480458,
-95.36038520041646,
-95.36881742617886,
-95.36780447508437,
-95.36402897450226,
-95.36249640735693,
-95.36410170135858,
-95.35073295058847,
-95.35256219423519,
-95.36390492425909,
-95.36766514893664,
-95.3642407856447,
-95.36049866217783,
-95.36418253876484,
-95.36009628027304,
-95.36765698745008,
-95.36670775037503,
-95.36420728434605,
-95.36798661168646,
-95.36019654698462,
-95.36549736590443,
-95.36771595585891,
-95.36782807424675,
-95.36532978176707,
-95.36564818023348,
-95.36374730561002,
-95.36558914731846,
-95.34953204325065,
-95.36693986062812,
-95.36705513335792,
-95.34940074075188,
-95.36324668196941,
-95.36316351743825,
-95.36345088228443,
-95.36715435150141,
-95.3633339630003,
-95.362996047088,
-95.36681303204607,
-95.34974670140355,
-95.36095598589735,
-95.36462486148233,
-95.36469989408242,
-95.34959133910291,
-95.36689875608674,
-95.363107130056,
-95.3644839774903,
-95.35485944998705,
-95.36106561470584,
-95.36068257059594,
-95.36478980807232,
-95.36288118174984,
-95.36729154856812,
-95.3647959981593,
-95.35496898479515,
-95.3607711970618,
-95.35454900956076,
-95.36613535282393,
-95.36456167446407,
-95.36234470768315,
-95.36463882866381,
-95.36257082473482,
-95.36594740537605,
-95.36214547310655,
-95.35465863674057,
-95.3624165876692,
-95.36622861063401,
-95.36210083217117,
-95.36753692107573,
-95.36767031261684,
-95.36222511085282,
-95.36604804718434,
-95.35398468594587,
-95.36203771562379,
-95.36776712729508,
-95.36740667531177,
-95.36155126759364,
-95.35034500217637,
-95.35367741085282,
-95.35410935903853,
-95.36750242267566,
-95.36893745690972,
-95.36527769485694,
-95.3501823943525,
-95.36884824938467,
-95.3616831831239,
-95.35371040641036,
-95.36126859573056,
-95.36508642563702,
-95.35386746625242,
-95.35395589657281,
-95.36537378641971,
-95.35399436454,
-95.36287839852,
-95.36521649996993,
-95.36139251564158,
-95.35312603040765,
-95.36274740109425,
-95.36305295271923,
-95.3529070127438,
-95.36069858165243,
-95.35419559083037,
-95.36305131174726,
-95.35327275593725,
-95.36444663247411,
-95.36288356077822,
-95.36814512512028,
-95.35304445354852,
-95.36826361795251,
-95.36660311869333,
-95.36090090357685,
-95.36290338032202,
-95.35084363990457,
-95.35303464185688,
-95.35331222173926,
-95.36081067209004,
-95.3545178642072,
-95.35313932425436,
-95.36456540690591,
-95.36835988763553,
-95.36418498964089,
-95.36799722802226,
-95.35063585169533,
-95.35091100499368,
-95.36218365154936,
-95.35438159693759,
-95.35832961696829,
-95.360003773773,
-95.36833122718889,
-95.36580522809582,
-95.36430662044089,
-95.3526245241624,
-95.35820659256386,
-95.35074672445722,
-95.35866259323748,
-95.36808775341521,
-95.35434309096128,
-95.35468665555314,
-95.36565253199377,
-95.35332479765111,
-95.36001358434675,
-95.36221861634885,
-95.35769215748385,
-95.36599988572056,
-95.35458872218615,
-95.3618664206905,
-95.35609090294425,
-95.35450571231496,
-95.35845827674449,
-95.35415903646026,
-95.35356177126222,
-95.35833890122531,
-95.35345605895961,
-95.3574323974242,
-95.3539831928099,
-95.36196776734796,
-95.36352232162133,
-95.35620439209919,
-95.36570400171814,
-95.363354053933,
-95.36363515164754,
-95.35796952819162,
-95.3611667071608,
-95.36349793302301,
-95.35136473018633,
-95.36883746771841,
-95.35350644027581,
-95.36502477809474,
-95.3610644590639,
-95.3511868082727,
-95.35122645957546,
-95.35770577214501,
-95.35334080625593,
-95.36508164069917,
-95.35511925906198,
-95.36894361190251,
-95.353597954506,
-95.364808777523,
-95.3685902571041,
-95.36131465749833,
-95.35507428770906,
-95.36273044999405,
-95.35398293377263,
-95.3549884067579,
-95.35731715680178,
-95.36640583953631,
-95.36487052128257,
-95.35386100963612,
-95.351549373363,
-95.36117224012355,
-95.36868354562777,
-95.35336936027744,
-95.35139474227027,
-95.35291031936258,
-95.36623926051932,
-95.36283532707368,
-95.35527714068759,
-95.35140866075854,
-95.36243754854401,
-95.35319803691387,
-95.3526936666022,
-95.35513884632161,
-95.36031399547123,
-95.36658214349039,
-95.35401996230335,
-95.36416289526345,
-95.35061586363992,
-95.36255594091239,
-95.35051019817992,
-95.36788917962376,
-95.36018662650018,
-95.35064567019388,
-95.35426051975315,
-95.36640546449445,
-95.35178606887665,
-95.35252952144846,
-95.36396694042729,
-95.35428252782305,
-95.3503783862338,
-95.35414065670042,
-95.36769273470037,
-95.36426796776063,
-95.36048764195544,
-95.36806898438944,
-95.35072790262078,
-95.35031213507489,
-95.35164811174532,
-95.35415004357957,
-95.35033138920578,
-95.35075119273827,
-95.35312710086369,
-95.3526339785031,
-95.35419630710827,
-95.36804565972136,
-95.36033815831833,
-95.36551939220304,
-95.3640862649183,
-95.35068425193619,
-95.36181917855404,
-95.35301294628418,
-95.3540722109265,
-95.35212988705578,
-95.35445438898043,
-95.3678511433723,
-95.35423237640856,
-95.36541030557117,
-95.35043622262154,
-95.36167759189121,
-95.350545647324,
-95.35576126461278,
-95.3504580356179,
-95.36192807447532,
-95.35389168752755,
-95.35428614946247,
-95.35213828726029,
-95.35953055221148,
-95.36568770541447,
-95.36177721424102,
-95.36334560535332,
-95.34965406321317,
-95.3518455284162,
-95.36698267424765,
-95.3537306412258,
-95.34966510761573,
-95.35587201520376,
-95.35615919986749,
-95.3655611779466,
-95.35555783438731,
-95.3593625060448,
-95.34946708754491,
-95.35626685054017,
-95.34951658109864,
-95.36344701927165,
-95.36681379160065,
-95.35963228134142,
-95.35185312201443,
-95.35350982721394,
-95.35560716549064,
-95.36303295648203,
-95.35946035678487,
-95.36468296548729,
-95.34984967453148,
-95.3609732799359,
-95.34988818274968,
-95.36314909281317,
-95.34971126897149,
-95.36701259373244,
-95.36450845431482,
-95.36112232557917,
-95.36079800719439,
-95.35644633324684,
-95.353616480872,
-95.3497118581807,
-95.35351878734355,
-95.36109246765912,
-95.3604110921041,
-95.36485643838726,
-95.35867795544,
-95.36089572415361,
-95.34878513792842,
-95.35655751027242,
-95.36051426789977,
-95.36240506156922,
-95.34878828756969,
-95.36612820159968,
-95.34868215702623,
-95.36055771350438,
-95.34864102383821,
-95.35849077291113,
-95.36468133614574,
-95.35877923653605,
-95.36600564973538,
-95.36223843007815,
-95.36062631452249,
-95.35635508069085,
-95.3526747052024,
-95.36251820479688,
-95.35670474416324,
-95.35859114645555,
-95.35243124517642,
-95.3601087987169,
-95.3639321697542,
-95.3662949587712,
-95.35273866586506,
-95.36235971346953,
-95.34899559582622,
-95.34896253828039,
-95.3675909988928,
-95.3676462005405,
-95.3564547656385,
-95.34888517849029,
-95.36615504085474,
-95.36244830301453,
-95.36386666010948,
-95.35034240009571,
-95.36621135154489,
-95.3637420881104,
-95.35653567293383,
-95.35025398466122,
-95.35420506258407,
-95.3564201629163,
-95.36373325287005,
-95.36401928119291,
-95.36379864593967,
-95.35427551440223,
-95.35050258626032,
-95.35394636499414,
-95.36389903958626,
-95.36916848147467,
-95.35041245775639,
-95.35402236949166,
-95.36678056648755,
-95.35196356182261,
-95.35942116629667,
-95.36661065929336,
-95.34950576929799,
-95.35179700574257,
-95.34939772690696,
-95.36697023034549,
-95.34967499272514,
-95.36445831540708,
-95.36681027107569,
-95.34954431030123,
-95.3643767844917,
-95.36456271142251,
-95.36216895729798,
-95.36448499898168,
-95.36203863796419,
-95.3684271987964,
-95.35240093376508,
-95.36236489860343,
-95.36829844218838,
-95.35225099552521,
-95.36362072824069,
-95.3621105228047,
-95.34880815385998,
-95.36747457972172,
-95.3686121115394,
-95.36349406515738,
-95.3486793226119,
-95.35010879466655,
-95.35258095656359,
-95.36849129004864,
-95.36012302610406,
-95.35758359655607,
-95.35000588993512,
-95.36756785142903,
-95.35242832074675,
-95.36719786214272,
-95.3574347591562,
-95.35989393168006,
-95.35025801325868,
-95.36728192482744,
-95.3650708781116,
-95.3688993015587,
-95.35014924266338,
-95.3577657416879,
-95.36496796337374,
-95.368978992066,
-95.36865378259779,
-95.36518460462656,
-95.3576137034273,
-95.3628699810535,
-95.36506869876374,
-95.34923857138568,
-95.36874435547989,
-95.36293302285631,
-95.34910168839382,
-95.36262751636323,
-95.3605540366811,
-95.3505941090049,
-95.36423040083186,
-95.36268719285832,
-95.34941125791339,
-95.35047685278464,
-95.36791452527518,
-95.36672528648884,
-95.36408174883188,
-95.36030198211797,
-95.3508156573557,
-95.36066445255884,
-95.34925795623604,
-95.36783066886409,
-95.35690368143254,
-95.36659600878467,
-95.36439025831224,
-95.34169927401926,
-95.34376126613037,
-95.34157999698128,
-95.34385375711643,
-95.34190996677732,
-95.34693387976293,
-95.34321461889854,
-95.3467710329326,
-95.33103143701159,
-95.33094464312177,
-95.34335262723704,
-95.34302358681279,
-95.33905605518055,
-95.33907322364276,
-95.34709581852026,
-95.33914496539066,
-95.36919330469455,
-95.36562678900277,
-95.36922293385022,
-95.3658863054316,
-95.35572624319904,
-95.34983609722592,
-95.35106087238398,
-95.35603184326835,
-95.36574606098156,
-95.3497071094362,
-95.35097100128927,
-95.35581295248916,
-95.36693515988887,
-95.36604344675389,
-95.34997427101409,
-95.36862332771508,
-95.36590172613022,
-95.36088754110399,
-95.36854177573063,
-95.34985221338174,
-95.36578871185087,
-95.35503275972869,
-95.36843545563418,
-95.36838383038457,
-95.36873736149066,
-95.36862185007956,
-95.35489662214955,
-95.36100649726278,
-95.36853043827644,
-95.36622807252263,
-95.34902494626387,
-95.35141510730216,
-95.36847963804246,
-95.35278734912559,
-95.36609290959224,
-95.35519454589574,
-95.35129885355008,
-95.34887487593399,
-95.36022611776725,
-95.3550673641457,
-95.36638769197391,
-95.3320246242737,
-95.34108136283301,
-95.33207755733919,
-95.34085038557343,
-95.33164130247576,
-95.34123018125072,
-95.3317080596226,
-95.33194598170478,
-95.34101471930352,
-95.33186378960666,
-95.33292893117857,
-95.33279766981497,
-95.34361985911919,
-95.333010369573,
-95.3330749763857,
-95.34006478146681,
-95.34368487368104,
-95.33998433956762,
-95.33261544481292,
-95.3325643861835,
-95.33268641919688,
-95.33381436487001,
-95.33306550655179,
-95.34283800457699,
-95.33809686549054
]
inlet_lats=[
29.76202573052496,
29.76195912051669,
29.76180333548514,
29.76193421967339,
29.76182920109132,
29.76160567466023,
29.76490697314338,
29.76492761746867,
29.76490481697553,
29.76492673086316,
29.76489504442764,
29.76464007042473,
29.76463897750374,
29.76505124125511,
29.76487856373619,
29.76486844693903,
29.76486371405974,
29.76483444094857,
29.76472817663142,
29.76484261911155,
29.76497238798836,
29.76483266870122,
29.76470740812594,
29.76464876011773,
29.7646784031006,
29.76462509293084,
29.76475564773513,
29.7647589688113,
29.76459276902453,
29.76458910858158,
29.76418688250238,
29.76418461063824,
29.76437486069651,
29.76436497643054,
29.76416379640611,
29.76408773077183,
29.76416734213685,
29.76416740253866,
29.76408637652392,
29.76431925154586,
29.76408467698773,
29.76404983449148,
29.76402025540906,
29.76406587007226,
29.76400134280941,
29.76400482264243,
29.76400466877455,
29.76378194463023,
29.76377896358074,
29.76346922755823,
29.76369459044466,
29.76370062799112,
29.76364877961505,
29.76336183273783,
29.76336310193338,
29.76278461761733,
29.76278213097944,
29.76306607745261,
29.76153439546373,
29.76158278834335,
29.76186086237888,
29.76184448453671,
29.7619067655463,
29.76163069642925,
29.76188475583968,
29.76032437971697,
29.76021948314198,
29.76000073476261,
29.76030920825673,
29.75992610502438,
29.76012100437856,
29.76017037492541,
29.7600579680542,
29.76007238541062,
29.7599555222719,
29.75995774154615,
29.76009674293846,
29.76009399194751,
29.75975170454548,
29.75981095575274,
29.76017100358601,
29.75988669063587,
29.75994300651143,
29.75973441636979,
29.75966186777778,
29.75980869929856,
29.75964122556796,
29.75997324373448,
29.75954966995587,
29.75987790542375,
29.75963181080295,
29.7599507661245,
29.7598376131749,
29.7597871315628,
29.75943235065591,
29.75947016842832,
29.75950460394682,
29.75971308909796,
29.75976161679439,
29.75971006058096,
29.7593022428742,
29.75961252627849,
29.75969596262241,
29.75959030186522,
29.75921452312718,
29.75957714749319,
29.75929655958588,
29.75922929238108,
29.75917000651786,
29.75922114489151,
29.75948686657677,
29.75945219438801,
29.75936691449994,
29.7591425900215,
29.75903298055284,
29.75939476262175,
29.75910747188978,
29.75919620191367,
29.75938209261826,
29.75934692689337,
29.75901418048482,
29.75894832491818,
29.75910355454058,
29.75899159503411,
29.75903059293442,
29.75913210298315,
29.75880584951407,
29.75885599997713,
29.75921529363212,
29.75914473530314,
29.75919558918033,
29.75875128540256,
29.75912286331995,
29.75879901362505,
29.75919396121309,
29.75918486983428,
29.75869681956332,
29.75912352045522,
29.75873370325102,
29.75876573143353,
29.75864503616695,
29.75881999559349,
29.75899026407956,
29.75895001640249,
29.75905885083584,
29.75902383632531,
29.75865023523412,
29.75898741999668,
29.75886604019207,
29.75858610126819,
29.75848326644497,
29.75884081581,
29.75866749499446,
29.75889256225661,
29.75839801012121,
29.75846978350704,
29.75858353359847,
29.75853366085557,
29.75875636600625,
29.75838580563267,
29.75868477882227,
29.75847544035907,
29.75826257802659,
29.75865618035364,
29.75824107262273,
29.75859232853653,
29.75817011373964,
29.7585852325437,
29.75833400426959,
29.75852762139656,
29.75811768194625,
29.75847332008443,
29.75809384479644,
29.75839385490004,
29.75824238619766,
29.7583639117996,
29.75795794338212,
29.75803929086275,
29.75834740637322,
29.75796902201261,
29.75824382121069,
29.75830040833671,
29.75794053791965,
29.75784668588238,
29.75827030016476,
29.75830768601102,
29.75827260582238,
29.75781271755252,
29.75813021187663,
29.75814473754006,
29.75770790447442,
29.75808689907005,
29.75805077329172,
29.75759601929546,
29.75793771680559,
29.75793534735415,
29.75759769567246,
29.75748154055157,
29.75784736118244,
29.75744511397538,
29.75787609503447,
29.75755189572998,
29.75748462193808,
29.75752824274245,
29.75782869531323,
29.75737712531084,
29.75773897579062,
29.75747180556148,
29.75740356046071,
29.75747128195025,
29.75772512076306,
29.75764677888407,
29.7572666327989,
29.7576905252544,
29.75769927971955,
29.75752467765598,
29.75761709026475,
29.75762300020948,
29.75759644901048,
29.7575348445635,
29.75714911572783,
29.75727326924917,
29.75747362564245,
29.75748165123608,
29.75721239967087,
29.75727414826319,
29.75733882937858,
29.75705942669631,
29.75715147208414,
29.75715956351186,
29.75739022723511,
29.76853456938109,
29.76846573169858,
29.76834743450062,
29.768413879857,
29.76831065811852,
29.76827919454813,
29.76807150609106,
29.76805670630682,
29.76825968722386,
29.76789184828027,
29.76800415376654,
29.76822447145691,
29.76799894114281,
29.76805908680174,
29.76802909739383,
29.76802985233725,
29.76804907945659,
29.76812138524071,
29.76793253723232,
29.76792871534835,
29.76811761858101,
29.76793985110879,
29.76793524649473,
29.76808890250189,
29.76807002248127,
29.76762636239197,
29.76762425643607,
29.76798345358122,
29.7679058649933,
29.76790205906441,
29.76755845172819,
29.76747287786104,
29.76788068477855,
29.76784799886577,
29.76784149122559,
29.76772804813151,
29.76747084731782,
29.76746401742293,
29.76770263570886,
29.76745875741187,
29.76745879791942,
29.76765853985162,
29.76764491551312,
29.76765503296512,
29.76734601844287,
29.76739035704274,
29.7673354511214,
29.76758506317064,
29.76739201545095,
29.7673905206382,
29.76737729794689,
29.76733365766622,
29.76759262190108,
29.76732373610293,
29.76736353847845,
29.76727758491206,
29.76727547767248,
29.76731841959574,
29.76736513738953,
29.76735178585118,
29.76731504259278,
29.76735296375643,
29.76729703710108,
29.76743464437466,
29.7673359888039,
29.76733594134087,
29.76725043361397,
29.76689024937949,
29.76721170436197,
29.76719810570113,
29.76681325203192,
29.76706884753564,
29.76705672297468,
29.76701819673473,
29.76679050395337,
29.76678665068771,
29.76678643553909,
29.7667443574707,
29.76688989892926,
29.76671113843046,
29.76673224525283,
29.76675905450461,
29.76673205765026,
29.76668821544431,
29.76659618192407,
29.76659366540471,
29.76666820256572,
29.76669380742431,
29.76671132443503,
29.76663084315504,
29.76670201231947,
29.76672185605293,
29.76665147841897,
29.76661675386226,
29.76662444139263,
29.76659614477494,
29.76664429975139,
29.76661506618882,
29.76666808311087,
29.76666161494095,
29.76657458363603,
29.76656061042908,
29.76671092699088,
29.76667467105958,
29.76651494146619,
29.76651757556688,
29.76615566041268,
29.76609375613657,
29.76629032945052,
29.7662868325856,
29.76637638088821,
29.76640033498364,
29.76639453296809,
29.76628886680496,
29.76608788507374,
29.76606850955243,
29.7660602514316,
29.7660604744636,
29.76599451512033,
29.76603560976294,
29.76603977205833,
29.7660477917462,
29.76604464195022,
29.76597967018141,
29.76599769742127,
29.76599471109936,
29.76602148572088,
29.76600889698779,
29.76598293343208,
29.76559637357588,
29.76559411742677,
29.76596127266866,
29.76595307457645,
29.76551023000132,
29.76568474067415,
29.76568152067477,
29.76547275341573,
29.76563220548607,
29.76562917987367,
29.76547095794144,
29.76546481601883,
29.76535382701464,
29.76557337081047,
29.76556752340335,
29.76535502250319,
29.76571589768365,
29.76571158937841,
29.76534511828654,
29.7654007951025,
29.76544838222402,
29.76533303050964,
29.76544034462213,
29.76551897906871,
29.76551282317508,
29.76548062285634,
29.76541423673247,
29.76528582355243,
29.76539891906473,
29.76540015322159,
29.76538520899302,
29.76537735688289,
29.76521694515743,
29.76520667845323,
29.76512555799531,
29.76509889005714,
29.76519439778626,
29.76519446196776,
29.76530464853323,
29.76526659140399,
29.76498962040393,
29.76497050098484,
29.76491856712604,
29.76490555755673,
29.76844699112174,
29.7684414226108,
29.76857815369429,
29.7685687489416,
29.76848226589571,
29.76832421213107,
29.7684220312719,
29.76826455516878,
29.76826395611202,
29.76830142628023,
29.76825180118599,
29.76825230721677,
29.76826683039207,
29.76825472361965,
29.7681849352584,
29.7681571495902,
29.76821037371202,
29.76822760291741,
29.76815869842422,
29.76812048580639,
29.76811741660469,
29.76819627819564,
29.76843498251981,
29.76807917249601,
29.76807435316008,
29.76815667561725,
29.76812913944011,
29.76802851315829,
29.76834130222397,
29.76803217743653,
29.76806592582681,
29.76789255376404,
29.76803624030233,
29.76767315830454,
29.76779771677724,
29.7677222456361,
29.76774915563853,
29.76755881307578,
29.76764289660839,
29.76766827902229,
29.76760695770222,
29.76779838434388,
29.76776658784577,
29.76747013855565,
29.76744132646742,
29.76744943144155,
29.76746575407519,
29.76750800664396,
29.76754285656135,
29.76743399858308,
29.76738181356241,
29.7675061864072,
29.76746001502532,
29.76742498016411,
29.76735000149851,
29.76729669640093,
29.76724713963712,
29.76724823444569,
29.76729363456843,
29.76728579510903,
29.76727533072163,
29.76724727830492,
29.76713315884764,
29.76733457345947,
29.76704709814739,
29.76700222402929,
29.76681501353402,
29.76681279304891,
29.76697247785477,
29.76710111601553,
29.76692894328334,
29.76685805492771,
29.76679112416194,
29.76665244691514,
29.76662117499792,
29.76647053628693,
29.76647300573941,
29.76668198109955,
29.76651869910867,
29.76659173460172,
29.76661386039923,
29.76658866347968,
29.766366288867,
29.76662041773998,
29.76633474309116,
29.76645109038233,
29.7665147352822,
29.76631135911829,
29.76642251168328,
29.76639471956183,
29.76613609850191,
29.76611958726993,
29.76618909930897,
29.76591824299403,
29.76597743878035,
29.76603415885339,
29.76601106379748,
29.76594242617453,
29.76597798574898,
29.76590125117028,
29.7658663249084,
29.76581518274406,
29.76578515157315,
29.76572478141224,
29.76576256364578,
29.76541813094918,
29.76572825604846,
29.76566958058197,
29.76568559018286,
29.76561240957049,
29.76562902471203,
29.76556569383093,
29.76551861295813,
29.76539947200259,
29.76537170745804,
29.76552709457058,
29.76519194729213,
29.7654544052439,
29.76541952859702,
29.76504612218562,
29.76545608973977,
29.76504297336502,
29.76513789713854,
29.7654543650702,
29.76528947762814,
29.76537233387608,
29.76524129575549,
29.76530457645609,
29.76525948417306,
29.76521209181538,
29.76520821336898,
29.76517369571576,
29.76510477081474,
29.76488771838563,
29.76455226097322,
29.76454566816505,
29.76486824822051,
29.76469096160748,
29.76484434564931,
29.76466617867221,
29.76464322267663,
29.7645926322953,
29.76459688169733,
29.76431637836157,
29.76430941054661,
29.76470358995037,
29.7645401301942,
29.76451630037452,
29.76451182164509,
29.76446159992067,
29.76445570432942,
29.7644405770336,
29.76443024709921,
29.76436826212194,
29.76405372858161,
29.76302264093387,
29.76300217075308,
29.76221893462968,
29.76221661982417,
29.7615991698067,
29.76159817586233,
29.76113718140796,
29.76058226406133,
29.76054137768296,
29.76049540620402,
29.76049683187476,
29.76016399740773,
29.76016217953053,
29.76007813646614,
29.75996119599615,
29.75993051003162,
29.75991283439934,
29.75962413638645,
29.75948191051996,
29.75945353302961,
29.7594453189346,
29.75933808662557,
29.75928435222012,
29.75911592856882,
29.75908880681613,
29.75919746712464,
29.75902609359596,
29.75896855276078,
29.75872770492071,
29.75895532859586,
29.75867283729698,
29.75844980533964,
29.75836570673284,
29.75829615511086,
29.75826799074526,
29.75818508171754,
29.75811250754263,
29.75810217676724,
29.75845344667228,
29.75840878368361,
29.75832672796319,
29.75806985181196,
29.75825958347931,
29.75801603850643,
29.75814910256261,
29.75811058272724,
29.7580824970491,
29.75801792174723,
29.75797787414204,
29.75790012803873,
29.75786153946835,
29.75754564099393,
29.75750643152654,
29.75743351201786,
29.75742091244608,
29.75730691957741,
29.75722465703312,
29.75695703451949,
29.75692937038414,
29.7569498788842,
29.75704436459482,
29.75682436046574,
29.75698077706889,
29.7570586907711,
29.7569489386717,
29.75705343570152,
29.75675874176463,
29.75699155221319,
29.75692061576164,
29.75693557666204,
29.75683016505643,
29.75645722258157,
29.75185218185542,
29.75164003459255,
29.75175719610424,
29.75153886779221,
29.751923360307,
29.75201065472857,
29.75168855627805,
29.75158342085924,
29.75187828919088,
29.75156083520897,
29.75194589077625,
29.75194702083561,
29.75162639907855,
29.75155761196434,
29.75170037100993,
29.751707839042,
29.75160235767272,
29.75181458455811,
29.75174071108341,
29.75160816413867,
29.75179825162314,
29.75150170817075,
29.75178295252743,
29.75171401524395,
29.75154358226438,
29.75132749125138,
29.75145360365514,
29.75129691703913,
29.7516086499698,
29.75135727405801,
29.75138792565794,
29.75156515612152,
29.75152339044301,
29.75107290476405,
29.75126971592717,
29.75113092537057,
29.7511277503217,
29.75129358066601,
29.75124882547285,
29.75144246876988,
29.75116426433056,
29.75123182209594,
29.75120846199278,
29.75116384598984,
29.75092686172802,
29.75090815808862,
29.75109876659456,
29.75129502905984,
29.75098750782676,
29.75112996282405,
29.75116864222872,
29.75739122796001,
29.75733918797245,
29.75737743138045,
29.75700369588786,
29.75694682432004,
29.75730876899011,
29.7573671287844,
29.75731237679721,
29.75730867033583,
29.75692852052205,
29.75698008628482,
29.75727284937595,
29.75705805560007,
29.75688422492082,
29.75728625581293,
29.75725487612559,
29.75702715192741,
29.75700093121952,
29.75699776343525,
29.75710677577865,
29.7570891610522,
29.75670196882136,
29.75688103937539,
29.756879247173,
29.75672090703416,
29.75648868384077,
29.75675262405973,
29.75641133043489,
29.75666948462255,
29.75637295302376,
29.75667600732377,
29.75629167025001,
29.75660677077995,
29.75653197243261,
29.75672546054905,
29.75666752595892,
29.75656196211186,
29.75649394250455,
29.75653016858685,
29.75614153833295,
29.75618953004192,
29.75648595896656,
29.75658787711588,
29.75648944830402,
29.75638286791027,
29.75645402313079,
29.75633792590991,
29.75650696729496,
29.75647076189256,
29.75638961399504,
29.75643641827305,
29.75620100035697,
29.75634263175822,
29.75640138218047,
29.75639237811377,
29.75624949170351,
29.75623391788456,
29.75614926295465,
29.75619159638373,
29.75570546829639,
29.75616928825131,
29.75613052996393,
29.75563860909874,
29.75600421212722,
29.75600195484154,
29.75596813052604,
29.75601958050375,
29.75589102501674,
29.75587029527809,
29.75596771726025,
29.75548735617183,
29.75576748524928,
29.75582096157461,
29.75582134724886,
29.75538792589889,
29.75585726412937,
29.75574399770829,
29.75573955016404,
29.75546292179367,
29.7556221350731,
29.75559624361789,
29.75568731944521,
29.7556205744325,
29.75571311010381,
29.75561980438408,
29.75532756366896,
29.75548215496037,
29.75527698549739,
29.7555879097359,
29.7555413597,
29.75547730008854,
29.75551759159627,
29.75543322866787,
29.75546450320447,
29.75535305540096,
29.7551390196014,
29.75534615204108,
29.75544846993767,
29.75532842631943,
29.75540218573029,
29.75538912334004,
29.75522939629776,
29.75533021583193,
29.75496830662528,
29.75511919524356,
29.7552695139819,
29.7552197314022,
29.75502659051644,
29.7547085354663,
29.75477783085009,
29.7547730075849,
29.75512649813929,
29.75516032563469,
29.75505674217089,
29.75462886837457,
29.75510732710249,
29.75491062125089,
29.75465241704335,
29.75485586682741,
29.75495580465035,
29.75463079438341,
29.75463240731767,
29.75490857516894,
29.7545825028006,
29.75474839939665,
29.75480966000892,
29.75470564644008,
29.75445464062419,
29.75467275710387,
29.75461061873414,
29.75431881269808,
29.75451764683244,
29.75433316318292,
29.7545682028905,
29.75428419822579,
29.75457581356487,
29.75451522475642,
29.75464921156247,
29.75423637835973,
29.75463228032394,
29.75458369753783,
29.75442596873193,
29.75447229110271,
29.75412429136524,
29.75416135832926,
29.75416627494166,
29.75436581573426,
29.75417171603483,
29.75411954793307,
29.75442826256741,
29.75452939305116,
29.75441463651724,
29.75447778923897,
29.75400475809936,
29.75400005340324,
29.75430398398794,
29.75408491570899,
29.75418349817458,
29.75418828061362,
29.75440745378783,
29.75432213538409,
29.754275418156,
29.75395715383347,
29.75410755530482,
29.75390204062299,
29.75411276077756,
29.75435880080843,
29.75397468354906,
29.75396610505307,
29.75423600243524,
29.75389873850757,
29.75407244027346,
29.75413154669685,
29.75400383733205,
29.75422176487151,
29.75390070851996,
29.75409278535972,
29.75393552703388,
29.75389055254294,
29.75398889851375,
29.75386137741939,
29.75383690624498,
29.75392347265102,
29.75376903144816,
29.7538432476555,
29.75374938217475,
29.7539621135579,
29.75400430598141,
29.75379499304175,
29.7540481061523,
29.75391279477037,
29.75386429781251,
29.75367131034379,
29.75372738283348,
29.75378628666861,
29.75343049383629,
29.75389186863294,
29.75347259850093,
29.75378370545385,
29.75365912261524,
29.75337997520485,
29.75336454694287,
29.75351666586269,
29.75338873397508,
29.75369225241099,
29.75341934962358,
29.75377946093115,
29.75334770401118,
29.7536512811582,
29.75373918293945,
29.7535399074979,
29.75335429471736,
29.75354837672107,
29.75330824210659,
29.75332224334884,
29.75336192739773,
29.75360711858268,
29.75354675457873,
29.75323595830797,
29.75316974164957,
29.75343093646663,
29.75362454404419,
29.75319789912057,
29.75312040722107,
29.75314548320492,
29.75350355113894,
29.75340838076848,
29.75320133540934,
29.75308391838468,
29.75335884495514,
29.75309543344658,
29.75305453052893,
29.75311833327309,
29.75321777652297,
29.75338463926655,
29.75302961008594,
29.75330083810139,
29.75291044611872,
29.75322889997493,
29.75288500663297,
29.75335625288051,
29.75314663248003,
29.7528705383946,
29.75296341315748,
29.75328134785245,
29.75288179181523,
29.75290093703596,
29.7531722582985,
29.7529046360429,
29.75279722306263,
29.75289401916996,
29.75325903130084,
29.7531661224842,
29.75305246016573,
29.75323016417587,
29.75275777130561,
29.75274534354843,
29.7527718314302,
29.75283554766021,
29.75271835455111,
29.75272373849496,
29.75278459111958,
29.75276621246123,
29.75278953720432,
29.75315909668922,
29.75294714884354,
29.75307021816104,
29.75302692423168,
29.75265588203087,
29.7529560150962,
29.75271434950362,
29.75272255363583,
29.75266664305231,
29.75270131047148,
29.75306082725503,
29.75268014444963,
29.7529814161005,
29.75257318710253,
29.75287678303508,
29.7525640618991,
29.75269504977724,
29.75254516742939,
29.75283791307671,
29.75261474831704,
29.7525916292774,
29.75250234073356,
29.75269353853503,
29.75285962799789,
29.75275347636085,
29.75279275323221,
29.75241980969516,
29.75247125592075,
29.75286889316469,
29.75250186088224,
29.75237553839953,
29.75254288555498,
29.75253584086415,
29.75278245957324,
29.752493617829,
29.75259597573483,
29.75232281793885,
29.75250575237189,
29.75229665385484,
29.75267203140287,
29.75275921063583,
29.75254662891844,
29.75232949303672,
29.75236304578826,
29.75241902239149,
29.75261237145329,
29.75245171219747,
29.75256328244899,
29.75213459549698,
29.75243229136069,
29.75211583451342,
29.75246783806024,
29.75207249497241,
29.75252468451119,
29.75245234385576,
29.75235545016757,
29.75234278722084,
29.75222198874697,
29.75213153255296,
29.75202078514032,
29.7520771479489,
29.75227319852223,
29.75224643263369,
29.75234953220792,
29.75218117299356,
29.75223758934092,
29.75190693400152,
29.75211345447249,
29.75218265340651,
29.75223016075265,
29.7518541935743,
29.75231965661077,
29.75183361075001,
29.75214916647196,
29.7518105602302,
29.75207208269656,
29.75223747743782,
29.75206451656288,
29.75223709283515,
29.7521282367821,
29.75206463798511,
29.75192486344533,
29.75182140162622,
29.75208135732519,
29.75192223284815,
29.75194549762793,
29.75176965018465,
29.75196970414568,
29.75206056251803,
29.75211727841653,
29.75174335372639,
29.75199359713587,
29.75162982987612,
29.75160948096176,
29.75211390979171,
29.75210440189987,
29.75178799960551,
29.75155910151559,
29.75202653951174,
29.74870133674716,
29.74873269306666,
29.74830435463314,
29.74872541767973,
29.74865392384299,
29.74844049110068,
29.74825517225465,
29.74835011421718,
29.74837296762203,
29.74856564025595,
29.74853763728401,
29.74851789091364,
29.74824913019364,
29.7481100693404,
29.74819559922953,
29.74846118642985,
29.74859708772926,
29.74805588832833,
29.74809806841815,
29.74832433656341,
29.7479016926565,
29.74805506661883,
29.74822551455675,
29.74775329233562,
29.74779810707175,
29.74768871656302,
29.7480876850806,
29.7475708102581,
29.74793214798432,
29.74798594032286,
29.74750451739058,
29.74788426226265,
29.74779851319237,
29.74772857101967,
29.74774963078996,
29.74765184568323,
29.74779615971231,
29.7473270110944,
29.74759192172207,
29.7477211447681,
29.74725249232968,
29.74751211471199,
29.74743974170109,
29.74707119587935,
29.74754606026272,
29.74756155084798,
29.74740357340077,
29.74698844445955,
29.74702575277927,
29.74708924187976,
29.74748685857357,
29.74724296420535,
29.74717254566839,
29.7469585660853,
29.74743107317999,
29.74700199347322,
29.74737117434366,
29.74706976574378,
29.74711611775712,
29.74682071419056,
29.7472644011833,
29.74718169173205,
29.74728442858088,
29.7467588705075,
29.74694616688759,
29.74711451652986,
29.74718919027772,
29.74716661765955,
29.74705161158492,
29.74684418385061,
29.74693815578992,
29.74699508936766,
29.74653265190553,
29.74704911311445,
29.74685017325706,
29.74644582975214,
29.74678795104048,
29.74668767151112,
29.74641551403589,
29.74677203840871,
29.74670592966291,
29.74632385224597,
29.74634408504772,
29.74678284414786,
29.74674693133649,
29.74666125081881,
29.7465523280038,
29.74628618270156,
29.74655282565624,
29.74623768232237,
29.74672939480994,
29.74641723717927,
29.74666951116486,
29.74655076551412,
29.74640949346297,
29.74646304289825,
29.74634185306201,
29.74634560763754,
29.74628428157443,
29.7462656645838,
29.74616197708293,
29.74616437435556,
29.74571325446927,
29.74568941634299,
29.74602377275044,
29.74600268411116,
29.74589430273473,
29.7458727609867,
29.74603564258075,
29.74580648796052,
29.74640676805571,
29.74630423286872,
29.74636795011888,
29.74624156105243,
29.74592682937711,
29.74576479368572,
29.74577725482137,
29.74589937323507,
29.7461573207443,
29.74568644128196,
29.74571592651449,
29.74581198031397,
29.74611191435345,
29.74602625507578,
29.74556880978098,
29.74605589167216,
29.74594849758107,
29.74581172214884,
29.74600855852943,
29.74549064541184,
29.74590412670101,
29.74558714943237,
29.74594844825927,
29.74591072995168,
29.74591701321227,
29.74590237241062,
29.74551466002902,
29.74565052700685,
29.7458310633731,
29.74576367047936,
29.74529531208065,
29.7453433812959,
29.74578786568751,
29.74532022435098,
29.7456813141026,
29.7453829981406,
29.74527393457888,
29.74520702988238,
29.74543067451723,
29.74528929148107,
29.74556660028263,
29.75633933998589,
29.75655070097939,
29.75627035408845,
29.7564145265294,
29.75612579155215,
29.75634015848016,
29.75604067611977,
29.75600096809746,
29.75621101193034,
29.75595414562975,
29.75597230210939,
29.75595715265003,
29.75621280889112,
29.75591730306168,
29.75585689034453,
29.75604033906858,
29.7561232378748,
29.75597981273008,
29.75574581058118,
29.75565746996056,
29.75563109580794,
29.7556388585105,
29.75557654064092,
29.75582894801256,
29.75260621968588]




lonmx=Math.max.apply(null, inlet_longs)
lonmi=Math.min.apply(null, inlet_longs)
latmx=Math.max.apply(null, inlet_lats)
latmi=Math.min.apply(null, inlet_lats)



            var len = 294;
            var points = [];
            var max = 100;
            var width = 650;
            var height = 550;


            // var latMin =  29.151095;
            // var latMax =  29.766357;
            // var lonMin = -95.851095;
            // var lonMax = -94.366357;
            
            var latMin = latmi;
            var latMax = latmx;
            var lonMin = lonmi;
            var lonMax = lonmx;
            

             var dataRaw = [];
            for (var i = 0; i < inlet_longs.length; i=i+1) {
                var tmp=Math.floor(Math.random() * 100)
                var point = {
                    lat: inlet_lats[i],
                    lon: inlet_longs[i],
                    value: tmp
                };
                
                dataRaw.push(point);
            }

            for (var i = 0; i < inlet_longs.length; i=i+1) {
                var dataItem = dataRaw[i];
                var point = {
                    x: Math.floor((dataItem.lat - latMin) / (latMax - latMin) * width),
                    y: Math.floor((dataItem.lon - lonMin) / (lonMax - lonMin) * height),
                    value: Math.floor(dataItem.value)
                };

                max = Math.max(max, dataItem.value);
                points.push(point);
            }

            var heatmapInstance = h377.create({
                container: document.querySelector('#heatmap'),
                 radius: 7,
            });

            var data = {
                max: max,
                data: points
            };

            heatmapInstance.setData(data);

            viewer._cesiumWidget._creditContainer.style.display = "none";

            var canvas = document.getElementsByClassName('heatmap-canvas');
            console.log(canvas);
            viewer.entities.add({
                name: 'heatmap',
                rectangle: {
                    height: 0,
                    heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
                    coordinates: Cesium.Rectangle.fromDegrees(lonMin, latMin, lonMax, latMax),
                    material: new Cesium.ImageMaterialProperty({
                        image: canvas[0],
                        transparent: true
                    })

                }
            });

 