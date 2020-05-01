
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
    shadows: true
    // animation: true

});


var pinBuilder = new Cesium.PinBuilder();
var now = viewer.clock.startTime;
var res=new Cesium.JulianDate();

viewer.clock.shouldAnimate=false;
viewer.clock.multiplier = 2000.0;
$('#time_default').on('click', function(){
viewer.clock.currentTime = now.clone();
Cesium.JulianDate.addDays(now,4.0,res);
viewer.timeline.updateFromClock();
viewer.timeline.zoomTo(now, res);
now=viewer.clock.currentTime ;
viewer.clock.shouldAnimate=false;
});

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
      units: 'metric',
      APPID: API_KEY
    }, 
    async: false,
    dataType: 'json',
    success:function(data){
      weather_data1=data;
}
});

// var weather_harvey;
// $.ajax({
//     url: 'http://backend.digitaltwincities.info/harvey',
//     data: {
      
//     }, 
//     async: false,
//     dataType: 'json',
//     success:function(data){
//       weather_harvey=data;
//       console.log(weather_harvey)
// }
// });


$.ajax({
    url: 'http://backend.digitaltwincities.info/rita',
    data: {
      
    }, 
    async: false,
    dataType: 'json',
    success:function(data){
      weather_rita=data;
    //  console.log(weather_rita)
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
      let cur_rain='0';
      
      if(cur_desc=='Rain')
      {
        cur_rain=weather_data['list'][wind_track]['rain']['3h']
      }

      let windElem = document.getElementById("wind");
      windElem.innerHTML = `${cur_wind.toFixed(1)}&nbsp;m/s`;
      // let time =document.getElementById("time");
      // time.innerHTML = `${Cesium.JulianDate.toDate(currentTime).toString().substring(4,25)}`;
      let tempElement = document.getElementById("temperature");
      tempElement.innerHTML = `<i id="icon-thermometer" class="wi wi-thermometer" style=" font-size: 0.9rem;
  padding-bottom: 0.1rem;"></i><p class="temp">${cur_temp.toFixed(3)}&nbsp;<nobr>°C</nobr></p>` ;
  
      let description = document.getElementById("description");
      description.innerHTML = `<i id="icon-desc" class="wi wi-owm-200"></i><p class="desc">${cur_desc}</p>`;
      let rainfall =document.getElementById("visibility");
         rainfall.innerHTML=`${parseFloat(cur_rain).toFixed(1)}&nbsp;mm`;
      let humidityElem = document.getElementById("humidity");
      humidityElem.innerHTML = `${cur_humi.toFixed(0)}&nbsp;%`;
    }


function onTimelineScrubfunction(e) {
  var clock = e.clock;
  clock.currentTime = e.timeJulian;
  //clock.shouldAnimate = true;
  console.log( e.timeJulian);
  if(viewer.clock.shouldAnimate==true){
  //update_weather(weather_data1,e.timeJulian);
  }
  if(event_indicator=="Rita"){
    console.log(weather_rita)
    update_weather_hist(weather_rita,e.timeJulian)
   // console.log("updating")
  }

}
viewer.clock.onTick.addEventListener(function(clock){
  update_weather(weather_data1,clock.currentTime);
  if(event_indicator=="Rita"){
    update_weather_hist(weather_rita,clock.currentTime)
  }
  if(event_indicator=="Harvey"){
    update_weather_hist(weather_harvey,clock.currentTime)
  }
  if(event_indicator=="Allison"){
    update_weather_hist(weather_allison,clock.currentTime)
  }

});

viewer.timeline.addEventListener('settime', onTimelineScrubfunction, false);

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

viewer.animation.viewModel.dateFormatter = localeDateTimeFormatter
viewer.animation.viewModel.timeFormatter = localeTimeFormatter
viewer.timeline.makeLabel = function (time) { return localeDateTimeFormatter(time) }


var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value+"m/s";
slider.oninput = function() {
  output.innerHTML = this.value+"m/s";
    if(this.value>0)
      viewer.clock.shouldAnimate=false;
    else
      viewer.clock.shouldAnimate=true;
}


var slider1 = document.getElementById("myRange1");
var output1 = document.getElementById("demo1");
output1.innerHTML = slider1.value+"m/s";
slider1.oninput = function() {
  output1.innerHTML = this.value+"m/s";
  if(this.value>0)
    viewer.clock.shouldAnimate=false;
  else
      viewer.clock.shouldAnimate=true;
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
 
    // for(let y of power_demage['failedpoles'])
    // {
    //   poles_data.entities.values[y-1].model.color=Cesium.Color.RED;
    // }
 
   for(var x = 0; x < poles_data.entities.values.length; x++) {

 // for(let x of poles_data.entities.value)
  //{
     poles_data.entities.values[x].model.color=Cesium.Color.GREEN;
    for(let y of power_demage['failedpoles'])
    {
      //poles_data.entities.values[y-1].model.color=Cesium.Color.RED;
      if(poles_data.entities.values[x].manual_id==y)
     {
       poles_data.entities.values[x].model.color=Cesium.Color.RED;
      }
    }
  }

});

var myVar = setInterval(myTimer, 10000);
function myTimer() {
  var cur_speed=Math.round(parseInt($('#wind').text()));
  //console.log(cur_speed);
  if(viewer.clock.shouldAnimate==true){
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
 for(var x = 0; x < poles_data.entities.values.length; x++) {

 // for(let x of poles_data.entities.value)
  //{
     poles_data.entities.values[x].model.color=Cesium.Color.GREEN;
    for(let y of power_demage['failedpoles'])
    {
      //poles_data.entities.values[y-1].model.color=Cesium.Color.RED;
      if(poles_data.entities.values[x].manual_id==y)
     {
        poles_data.entities.values[x].model.color=Cesium.Color.RED;
      }
    }
  }

}
}

var myPos = { my: "center center", at: "center-390 center", of: window };
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


// var r= 0, g=255, b=0;
// var fadeColor = new Cesium.CallbackProperty(function(){
//     r=slider.value;
//     g=255-slider.value;
//     return Cesium.Color.fromBytes(r, g, b, 255);
// }, false);


// function getCallback(long,lat) {
//     return function callbackFunction() {
//     var poss_arr=[long-0.00005, lat-0.00005,
//               long+0.00005, lat-0.00005,
//               long+0.00009, lat+0.00009,
//               long-0.00005, lat+0.00005,
//               long-0.00007, lat+0.00007
//           ];
// var poss=Cesium.Cartesian3.fromDegreesArray(poss_arr);
// if(slider1.value > 10)
// {
//  let temp=parseFloat((slider1.value-10)/1000000);
//     let poss1=Cesium.Cartesian3.fromDegreesArray([poss_arr[0]-temp,poss_arr[1]-temp,poss_arr[2]+temp,poss_arr[3]-temp
//     ,poss_arr[4]+temp,poss_arr[5]+temp,poss_arr[6]-temp,poss_arr[7]+temp,poss_arr[8]-temp,poss_arr[9]+temp]);
//  return new Cesium.PolygonHierarchy(poss1);
// }
//     };
// }


// var water_height = new Cesium.CallbackProperty(function(result){
//       water_height=slider.value;
//       water_height += 0.1;
//     return water_height;
// },false);

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
var initialPosition = Cesium.Cartesian3.fromDegrees(-95.364808777523, 29.736084676987729, 953);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);



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
var inlet_longs=[]
var inlet_lats=[]

var power1= Cesium.Resource.fetchJson('http://backend.digitaltwincities.info/poles').then(function (dataSource) {
    console.log('Successfully loaded!');
    objects=dataSource['data']    
    for(let object of objects){
      let entity = new Cesium.Entity();
      entity.position = Cesium.Cartesian3.fromDegrees(object['longitude'],object['latitude'], 0);
      entity.name = object['id'];
      var manual_id = object['manual_id'];
      entity.billboard = undefined; 
      entity.model=new Cesium.ModelGraphics({
      uri: './geoMappings/Utilitypole_3Dmodel.glb',
      scale: 0.2,//new Cesium.CallbackProperty(ScaleCallback(initial_pole), false),
      color: Cesium.Color.GREEN,
      silhouetteColor:Cesium.Color.WHITE,
      silhouetteSize:0.0,
      heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
        });
      entity.addProperty("manual_id")
      entity.manual_id=manual_id;
    entity.silhouetteColor=Cesium.Color.WHITE;
     entity.silhouetteSize=0.4;
     poles_data.entities.add(entity);
     inlet_longs.push(parseFloat(object['longitude']))
      inlet_lats.push(parseFloat(object['latitude']))
     //console.log()
    }
//console.log(inlet_lats.length)



lonmx=Math.max.apply(null, inlet_longs)
lonmi=Math.min.apply(null, inlet_longs)
latmx=Math.max.apply(null, inlet_lats)
latmi=Math.min.apply(null, inlet_lats)


            var len = 294;
            var points = [];
            var max = 100;
            var width = 650;
            var height = 650;


            // var latMin =  29.151095;
            // var latMax =  29.766357;
            // var lonMin = -95.851095;
            // var lonMax = -95.4039;
            
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
                 radius: 10,
            });

            var data = {
                max: max,
                data: points
            };

            heatmapInstance.setData(data);

            viewer._cesiumWidget._creditContainer.style.display = "none";

            var canvas = document.getElementsByClassName('heatmap-canvas');
         //   console.log(canvas);

            viewer.entities.add({
                name: 'heatmap',
                rectangle: {
              //      height: 0,
               //     heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
                    coordinates: Cesium.Rectangle.fromDegrees(lonMin, latMin, lonMax, latMax),
                    material: //Cesium.Color.RED
                    
                    new Cesium.ImageMaterialProperty({
                        image: canvas[0],
                        transparent: true
                    })
                    

                }
            });

 

});



//console.log(inlet_longs.length)
//console.log(inlet_lats.length)

//var dataSource = new Cesium.CustomDataSource(power1);
//console.log(poles_entity);
var power4 = Cesium.GeoJsonDataSource.load('./geoMappings/powerSub.geojson');
var power5 = Cesium.GeoJsonDataSource.load('./geoMappings/wire.geojson');
var flood1 = Cesium.GeoJsonDataSource.load('./geoMappings/dStormInlet_L5457_ver3.geojson');

var vulnerable_objects;
var object_indicator;
var url =Cesium.buildModuleUrl("./images/power.png");


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
// 
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
   
var url = Cesium.buildModuleUrl('./images/exclaimation.png')
var object_loc;
vulnerable_objects_entity=[]
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
  //    var t0 = performance.now();
    //  var test=getAddr(lon,lat);
      // var test=" ";
  //    var t1 = performance.now();
  //    console.log(t1 - t0);
      let name=object['cluster_id'];
      let cluster_obj=object['cluster_objects'];
      let image_url = cluster_obj[0]['image'];
      let image_date= cluster_obj[0]['createdDate'];
      let object_type=cluster_obj[0]['classification'];
      entity.billboard= new Cesium.BillboardGraphics();
      //entity.billboard.image= pinBuilder.fromText('!', Cesium.Color.BLACK, 48).toDataURL()
      entity.billboard.image= pinBuilder.fromUrl(url, Cesium.Color.BLACK, 48);
      entity.billboard.heightReference =Cesium.HeightReference.CLAMP_TO_GROUND;
      //entity.billboard.verticalOrigin=Cesium.VerticalOrigin.BOTTOM
      vulnerable_objects_entity.push(entity)
    var updated=viewer.entities.add(entity);
      }
  });

//   var fadeColor = new Cesium.CallbackProperty(function(){
//     r=slider.value;
//     g=255-slider.value;
//     return Cesium.Color.fromBytes(r, g, b, 255);
// }, false);

//     function ScaleCallback(target) {
//       var count=0;
//     return function callbackFunction() {
       
//     var res;
//     for(let pole_entity of poles_entity){
//       if(count == target-1){
//     //  console.log("werwer")
//         res=0.8;
//       }
//       else
//         res=0.2;
//        //pole_entity.scale=0.2; 
//     count++;
//     }
//    // console.log(res);
//     return res;
//     };
// }

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
            let name=vulnerable_objects[parseInt(pick.id._name)]['cluster_id'];
            let cluster_obj=vulnerable_objects[parseInt(pick.id._name)]['cluster_objects'];
            let image_url = cluster_obj[0]['image'];
            let image_date= cluster_obj[0]['createdDate'];
            let object_type=cluster_obj[0]['classification'];
            let lat =vulnerable_objects[parseInt(pick.id._name)]['cluster_latitude'];
            let lon =vulnerable_objects[parseInt(pick.id._name)]['cluster_longitude'];
            let nearest_target=vulnerable_objects[parseInt(pick.id._name)]['nearest_pole']
            var test=getAddr(lon,lat);
            vulnerable_objects_entity[parseInt(pick.id._name)].description='\
      <style>\
      .rotate90 {\
        text-indent: 0;\
        border: thin silver solid;\
        margin: 0.1em;\
        padding: 0.1em;\
        width:100px;\
        height:200px;\
        position:fixed;\
        image-orientation: 0deg;\
        overflow: hidden;\
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
    <img data-object-id='+parseInt(pick.id._name)+' class="rotate90" src='+image_url+' >\
    <br style = "line-height:10;"><br>\
  ';// <th>'+test['address']['Match_addr']+'</th>\

              object_indicator=pick.id._name;
              initial_pole= nearest_target;
           //   console.log(nearest_target)
              let near_track=0;
              let entity= poles_data.entities.values[nearest_target-1];
             // console.log(entity)
              entity.silhouetteColor=Cesium.Color.WHITE;
              entity.model.silhouetteSize=1.0;
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
    let dWidth = wWidth * 0.4;
    let dHeight = wHeight * 0.4; 

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

var initial_pole=-1;
var poles;
var poles_data=new Cesium.CustomDataSource();



  CheckPowerI.addEventListener('change', function() {
    if (CheckPowerI.checked) {
      viewer.dataSources.add(poles_data);
   

    }else{
      viewer.dataSources.remove(poles_data);    
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

// var inlet_coordinates=[]
// var inlet_longs=[]
flood1.then(function(dataSource) {
 // var extract_long=json['features']['geometry']


  var entities = dataSource.entities.values;
    for(var i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let Coordinate="";

        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
            color: Cesium.Color.WHITE,
            pixelSize: 13,
            heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
        });
      
      }
    });
    
Cesium.when(flood1,function(dataSource){
  CheckFloodI.addEventListener('change', function() {
    if (CheckFloodI.checked) {
      viewer.dataSources.add(dataSource);
    //  viewer.entities.add(entity_example);
    }else{
      viewer.dataSources.remove(dataSource);
    //  viewer.entities.remove(entity_example);
    }
  });    
});

// function colorByDistance() {
//     tileset.style = new Cesium.Cesium3DTileStyle({
//         defines : {
//             distance : 'distance(vec2(${Longitude}, ${Latitude}), vec2(-1.664242028123,0.5192594629615))'
//         },
//         color : {
//             conditions : [
//                 ['${distance} > 0.00012',"color('gray')"],
//                 ['${distance} > 0.00008', "mix(color('yellow'), color('red'), (${distance} - 0.0008) / 0.00004)"],
//                 ['${distance} > 0.00004', "mix(color('green'), color('yellow'), (${distance} - 0.00004) / 0.00004)"],
//                 ['${distance} < 0.0000005', "color('white')"],
//                 ['true', "mix(color('blue'), color('green'), ${distance} / 0.00004)"]
//             ]
//         }
//     });
// }
// function timeConverter(UNIX_timestamp){
//   var a = new Date(UNIX_timestamp * 1000);
//   var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
//   var year = a.getFullYear();
//   var month = months[a.getMonth()];
//   var date = a.getDate();
//   var hour = a.getHours();
//   var min = "0"+a.getMinutes();
//   var sec = "0"+a.getSeconds();
//   var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
//   return time;
// }

//console.log(timeConverter(0));

function update_weather_hist(data,currentTime){
      weather_data=data;
      let weather_desc=[]
      let pair_humi=[]
      let pair_wind=[]
      let pair_temp=[]
      let pair_time=[]

      for(var i = 0; i < weather_data['data'].length-1; i++)
      {
      //  let dt_time=weather_harvey['data'][i]['dt']
       // Cesium.JulianDate.fromDate(new Date(weather_data['data'][i]['dt'] * 1000), tmp_date)
        weather_desc.push(data['data'][i]['weather'][0]['main'])
        pair_humi.push([weather_data['data'][i]['main']['humidity'],weather_data['data'][i+1]['main']['humidity']])
        pair_wind.push([weather_data['data'][i]['wind']['speed'],weather_data['data'][i+1]['wind']['speed']])
        pair_temp.push([weather_data['data'][i]['main']['temp'],weather_data['data'][i+1]['main']['temp']])
        pair_time.push([Cesium.JulianDate.fromDate(new Date(weather_data['data'][i]['dt'] * 1000)),Cesium.JulianDate.fromDate(new Date(weather_data['data'][i+1]['dt'] * 1000))])
        
      }

      var wind_track=0;
      for(var i =0;i<weather_data['data'].length-1;i++)
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
      let cur_rain='0';
      console.log(cur_humi)
      if(cur_desc=='Rain')
      {
        cur_rain=weather_data['data'][wind_track]['rain']['3h']
      }

      let windElem = document.getElementById("wind");
      windElem.innerHTML = `${cur_wind.toFixed(1)}&nbsp;m/s`;
      // let time =document.getElementById("time");
      // time.innerHTML = `${Cesium.JulianDate.toDate(currentTime).toString().substring(4,25)}`;
      let tempElement = document.getElementById("temperature");
      tempElement.innerHTML = `<i id="icon-thermometer" class="wi wi-thermometer" style=" font-size: 0.9rem;
  padding-bottom: 0.1rem;"></i><p class="temp">${cur_temp.toFixed(3)}&nbsp;<nobr>°C</nobr></p>` ;
  
      let description = document.getElementById("description");
      description.innerHTML = `<i id="icon-desc" class="wi wi-owm-200"></i><p class="desc">${cur_desc}</p>`;
      let rainfall =document.getElementById("visibility");
         rainfall.innerHTML=`${parseFloat(cur_rain).toFixed(1)}&nbsp;mm`;
      let humidityElem = document.getElementById("humidity");
      console.log(humidityElem.innerHTML)
     // humidityElem.innerHTML = `${cur_humi.toFixed(0)}&nbsp;%`;
       humidityElem.innerHTML = `${cur_humi}&nbsp;%`;
       console.log(humidityElem.innerHTML)
    }


var weather_harvey;
var weather_allison;
var weather_rita;
var event_indicator;
$('.dropdown-menu a').click(function () {           
  let t=$(this).text();
$('button[data-toggle="dropdown"]').html('<i class="fas fa-wind"></i>'+
      '<br /><span>'+t+'</span>');
event_indicator=t;
console.log(event_indicator)
// if(t=="Harvey")
// {


// }
    // console.log($(this).text())
  });

jQuery("#harvey").click(function(e){
//do something
//if(weather_harvey.length == 0 || weather_harvey == undefined){
$.ajax({
    url: 'http://backend.digitaltwincities.info/harvey',
    data: {
      
    }, 
    async: false,
    dataType: 'json',
    success:function(data){
      weather_harvey=data;
     
}
});
//}
let start=new Cesium.JulianDate()
for(let i =0;i<160;i++)
{
  let dt_time=weather_harvey['data'][i]['dt']
  let tmp_date= new Cesium.JulianDate()
  Cesium.JulianDate.fromDate(new Date(dt_time * 1000), tmp_date)

  if(i==0){
    start=tmp_date;
  }
}


Cesium.JulianDate.addDays(start,4.0,res);
viewer.timeline.zoomTo(start, res);
viewer.timeline.updateFromClock();
viewer.clock.currentTime=start.clone();
viewer.clock.shouldAnimate=true;


//update_weather_hist(weather_harvey,currentTime);

e.preventDefault();
});


jQuery("#allison").click(function(e){
//do something
//if(weather_allison.length == 0 || weather_allison == undefined){
$.ajax({
    url: 'http://backend.digitaltwincities.info/allison',
    data: {
      
    }, 
    async: false,
    dataType: 'json',
    success:function(data){
      weather_allison=data;
    //  console.log(weather_allison)
}
});
//}
let start=new Cesium.JulianDate()
for(let i =0;i<153;i++)
{
  let dt_time=weather_allison['data'][i]['dt']
  let tmp_date= new Cesium.JulianDate()
  Cesium.JulianDate.fromDate(new Date(dt_time * 1000), tmp_date)

  if(i==0){
    start=tmp_date;
  }
}

Cesium.JulianDate.addDays(start,4.0,res);
viewer.timeline.zoomTo(start, res);
viewer.timeline.updateFromClock();
viewer.clock.currentTime=start.clone();
viewer.clock.shouldAnimate=true;

//console.log(weather_harvey['data'][0]['dt'])
e.preventDefault();
});

jQuery("#rita").click(function(e){
//do something
//if( weather_rita == undefined){
// $.ajax({
//     url: 'http://backend.digitaltwincities.info/rita',
//     data: {
      
//     }, 
//     async: false,
//     dataType: 'json',
//     success:function(data){
//       weather_rita=data;
//       console.log(weather_rita)
// }
// });
//}

let start=new Cesium.JulianDate()
for(let i =0;i<123;i++)
{
  let dt_time=weather_rita['data'][i]['dt']
  let tmp_date= new Cesium.JulianDate()
  Cesium.JulianDate.fromDate(new Date(dt_time * 1000), tmp_date)

  if(i==0){
    start=tmp_date;
  }
}

Cesium.JulianDate.addDays(start,4.0,res);
viewer.timeline.zoomTo(start, res);
viewer.timeline.updateFromClock();
viewer.clock.currentTime=start.clone();
viewer.clock.shouldAnimate=true;

//console.log(weather_harvey['data'][0]['dt'])
e.preventDefault();
});


// var dataSourcePromise=viewer.dataSources.add(Cesium.CzmlDataSource.load('./geoMappings/power.czml'));
// //var dataSourcePromise = viewer.dataSources.add(Cesium.CzmlDataSource.load(czml));
// dataSourcePromise.then(function(dataSource){
//     //viewer.trackedEntity = dataSource.entities.getById('utility pole');
// }).otherwise(function(error){
//     //window.alert(error);
// });



