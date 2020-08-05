// Create Functions - always write functions - can help in splitting the files
require('cesium/Widgets/widgets.css');
require('./css/main.css');

let urls = ['http://backend.digitaltwincities.info/poles',
  'https://function.digitaltwincities.info/lambda/localize',
  'http://api.openweathermap.org/data/2.5/forecast?lat=30.6173014&lon=-96.3403507&units=metric&APPID=49406c4e8b6ee455d1904676a313aa40'
];    // multiple endpoints to retrieve data from
let promises = urls.map(url => fetch(url).then(y => y.json()));
var poles, vulnerable_objects, current_weather;
Promise.all(promises).then(results => {
  poles = results[0]
  vulnerable_objects = results[1]
  current_weather = results[2]
  initializes_settings()
  processPoles()
  processLocalizedResults()
  addListeners()
});

var Cesium = require('cesium/Cesium');
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzYyNDZmZi1lYTdhLTQwMDgtOGRhZC03ZDE5YTlkYmVkMGMiLCJpZCI6NDAxOSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzOTYzODc1OX0.Kb7k51vZGYR5F7btrBIAuSan3ZNyKY_AWrFv1cLFUFk';

var viewer = new Cesium.Viewer('cesiumContainer', {
  requestRenderMode : true,
  maximumRenderTimeChange : Infinity,
  terrainProvider: Cesium.createWorldTerrain({
    requestWaterMask: true
  }),
  timeline: true,
  animation: true,
  shadows: true
});

var myPos = { my: "center center", at: "center-390 center", of: window };
var myPos_right = { my: "center center", at: "center+370 center", of: window };

viewer.scene.debugShowFramesPerSecond = true;
var pinBuilder = new Cesium.PinBuilder();
var now = viewer.clock.startTime;
var res = new Cesium.JulianDate();
var CheckFloodI = document.getElementById('x');
var CheckPowerI = document.getElementById('y');
var pole_longs = []
var pole_lats = []
var weather_data;
viewer.scene.globe.maximumScreenSpaceError = 18;


// Calling init function initializes the code - please follow this kind of coding

// Write comments on what exactly each function is doing - helps in maintaining the code

// Please write what this function does and how it is achieved

/*
  This function updates weather
  Input: json data and time
  Output: update html element associated with weather
*/
function update_weather(data, currentTime) {
  let pair_time = []
let pair_wind = []
let pair_temp = []
let pair_humi = []
let weather_desc = []
  weather_data = data;
  for (let i = 0; i < 39; i++) {
    weather_desc.push(data['list'][i]['weather'][0]['main'])
    pair_humi.push([weather_data['list'][i]['main']['humidity'], data['list'][i + 1]['main']['humidity']])
    pair_wind.push([weather_data['list'][i]['wind']['speed'], weather_data['list'][i + 1]['wind']['speed']])
    pair_temp.push([weather_data['list'][i]['main']['temp'], weather_data['list'][i + 1]['main']['temp']])
    pair_time.push([Cesium.JulianDate.fromDate(new Date(weather_data['list'][i]['dt_txt'])), Cesium.JulianDate.fromDate(new Date(weather_data['list'][i + 1]['dt_txt']))])

  }
  var wind_track = 0;
  for (let i = 0; i < 39; i++) {
    let before = pair_time[i][0];
    let after = pair_time[i][1];

    if (Cesium.JulianDate.greaterThanOrEquals(currentTime, before) && Cesium.JulianDate.lessThan(currentTime, after)) {
      wind_track = i
    }
    if (Cesium.JulianDate.equals(currentTime, before) && Cesium.JulianDate.equals(currentTime, after)) {
      wind_track = i
    }
  }
  let cur_wind = (pair_wind[wind_track][0] + pair_wind[wind_track][1]) / 2
  let cur_temp = (pair_temp[wind_track][0] + pair_temp[wind_track][1]) / 2
  let cur_humi = (pair_humi[wind_track][0] + pair_humi[wind_track][1]) / 2
  let cur_desc = weather_desc[wind_track]
  let cur_rain = '0';

  if (cur_desc == 'Rain') {
    cur_rain = weather_data['list'][wind_track]['rain']['3h']
  }

  let windElem = document.getElementById("wind");
  windElem.innerHTML = `${cur_wind.toFixed(1)}&nbsp;m/s`;

  let tempElement = document.getElementById("temperature");
  tempElement.innerHTML = `<i id="icon-thermometer" class="wi wi-thermometer" style=" font-size: 0.9rem;
  padding-bottom: 0.1rem;"></i><p class="temp">${cur_temp.toFixed(3)}&nbsp;<nobr>°C</nobr></p>`;

  let description = document.getElementById("description");
  description.innerHTML = `<i id="icon-desc" class="wi wi-owm-200"></i><p class="desc">${cur_desc}</p>`;
  let rainfall = document.getElementById("visibility");
  rainfall.innerHTML = `${parseFloat(cur_rain).toFixed(1)}&nbsp;mm`;
  let humidityElem = document.getElementById("humidity");
  humidityElem.innerHTML = `${cur_humi.toFixed(0)}&nbsp;%`;
}


function onTimelineScrubfunction(e) {
  let clock = e.clock;
  clock.currentTime = e.timeJulian;
  if (viewer.clock.shouldAnimate == true) {
  }
  //if (event_indicator == "Rita") {
   // console.log(weather_rita)
 //   update_weather_hist(weather_rita, e.timeJulian)
  ///}

}
function addListeners() {

  viewer.clock.onTick.addEventListener(function (clock) {
    update_weather(current_weather, clock.currentTime);
    if (event_indicator == "Rita") {
      update_weather_hist(weather_rita, clock.currentTime)
    }
    if (event_indicator == "Harvey") {
   //   console.log(weather_harvey);
      update_weather_hist(weather_harvey, clock.currentTime)
    }
    if (event_indicator == "Allison") {
      update_weather_hist(weather_allison, clock.currentTime)
    }
    if (event_indicator == "Ike") {
      update_weather_hist(weather_ike, clock.currentTime)
    }

  });
}
// Please dont have any lines outside functions, create a function called init where all the init codes reside

// Date formatting to a global form
function localeDateTimeFormatter(datetime, viewModel, ignoredate) {
  var julianDT = new Cesium.JulianDate();
  Cesium.JulianDate.addHours(datetime, -5, julianDT)
  var gregorianDT = Cesium.JulianDate.toGregorianDate(julianDT)
  var objDT;
  if (ignoredate)
    objDT = '';
  else {
    objDT = new Date(gregorianDT.year, gregorianDT.month - 1, gregorianDT.day);
    objDT = objDT.toLocaleString("default", { month: "long" }) + gregorianDT.day + ' ' + gregorianDT.year + ' ';
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
output.innerHTML = slider.value + "m/s";
slider.oninput = function () {
  output.innerHTML = this.value + "m/s";
  if (this.value > 0)
    viewer.clock.shouldAnimate = false;
  else
    viewer.clock.shouldAnimate = true;
}


var slider1 = document.getElementById("myRange1");
var output1 = document.getElementById("demo1");
output1.innerHTML = slider1.value + "m/s";
slider1.oninput = function () {
  output1.innerHTML = this.value + "m/s";
  if (this.value > 0)
    viewer.clock.shouldAnimate = false;
  else
    viewer.clock.shouldAnimate = true;
}

var myrange_stop;
var power_demage;
var previous = 0;
var heat;
$('#myRange').change(function () {

  let temp_longs = [];
  let temp_lats = [];
  var temp_poles = [];
  myrange_stop = $(this).val();

  $.ajax({
    url: 'https://jvc8szgvya.execute-api.us-west-2.amazonaws.com/default/networkanalysis',
    data: {
      'windspeed': myrange_stop
    },
    async: false,
    dataType: 'json',
    success: function (data) {
      power_demage = data;
    },
  })
  let wood_arr=new Array(61);
  for(let i=426;i<487;i++)
      wood_arr[i]=i;
  let wood_set=new Set(wood_arr)

  let damaged_poles = new Set(power_demage['failedpoles']);
  for (let x = 0; x < poles_data.entities.values.length; x++) {
    //poles_data.entities.values[x].model.color = Cesium.Color.GREEN;
    if (wood_set.has(x)) {
      poles_data.entities.values[x].model.color = Cesium.Color.BURLYWOOD;
    //poles_data.entities.values[x].model.scale=
    }else{
      poles_data.entities.values[x].model.color = Cesium.Color.GREEN;
    }

    if (damaged_poles.has(x + 1)) {
      poles_data.entities.values[x].model.color = Cesium.Color.RED;
      //   console.log(pole_longs[x+1]);
      temp_longs.push(pole_longs[x])
      temp_lats.push(pole_lats[x])

    }
  }


  for (let i = 0; i < temp_lats.length; i++) {

    temp_poles.push({ x: temp_longs[i], y: temp_lats[i], value: Math.floor(Math.random() * 89) + 1   })

  }
  console.log(temp_poles)
  //heatmap here
  if(heat!=null)
  {
   heat.destory() 
  }
  const bbox = [-95.451095, 29.651095, -95.1039, 29.826357]

  const getHeat = require('cesiumjs-heat').default
  const CesiumHeat = getHeat(Cesium)
  heat = new CesiumHeat(
    viewer,
    {
      autoMaxMin: true,
      min: 0,
      max: 100,
      data: temp_poles
    },
    bbox,
    {
      container: document.getElementById('heatmapContainer'),
       radius: 10,
  maxOpacity: .4,
  minOpacity: 0,
  blur: .75,
  gradient: {
    // enter n keys between 0 and 1 here
    // for gradient color customization
    '.4': 'blue',
    '.8': 'red',
    '.9': 'white'
  }
}
  ,{
    enabled: true,  
    min: 6375000,   
    max: 10000000,  
    maxRadius:  7,
    minRadius:  7
  }
    
  )

});

//Solved
//Please create meaningful function names
var state_i;
function start_load_network() {
  state_i = setInterval(wind_networkanalysis, 3000);
}
function stop_load_network() {
  clearTimeout(state_i);
}
Cesium.knockout.getObservable(viewer.animation.viewModel.clockViewModel, 'shouldAnimate').subscribe(function(value) {
    console.log(value)
    if(value==true)
      start_load_network();
    else
      stop_load_network();
});


// Solved. 
//This function will be called every 3s - Instead when the user clicks on the clock, do the timer for 3s
function wind_networkanalysis() {
  let tmp_longs=[]
  let tmp_lats=[]
  let tmp_poles=[]
    var cur_speed = Math.round(parseInt($('#wind').text()));
    //console.log(cur_speed);
    $.ajax({
      url: 'https://jvc8szgvya.execute-api.us-west-2.amazonaws.com/default/networkanalysis',
      data: {
        'windspeed': cur_speed
      },
      async: false,
      dataType: 'json',
      success: function (data) {
        power_demage = data;
      },
    })
    let damaged_poles = new Set(power_demage['failedpoles']);
    //console.log("damaged poles: " + damaged_poles.size)
    let wood_arr=new Array(61);
      for(let i=426;i<487;i++)
        wood_arr[i]=i;
    let wood_set=new Set(wood_arr)
 
  
  for (let x = 0; x < poles_data.entities.values.length; x++) {
    //poles_data.entities.values[x].model.color = Cesium.Color.GREEN;
    if (wood_set.has(x)) {
      poles_data.entities.values[x].model.color = Cesium.Color.BURLYWOOD;
    //poles_data.entities.values[x].model.scale=
    }else{
      poles_data.entities.values[x].model.color = Cesium.Color.GREEN;
    }


    if (damaged_poles.has(x + 1)) {
      poles_data.entities.values[x].model.color = Cesium.Color.RED;
      //   console.log(pole_longs[x+1]);
      tmp_longs.push(pole_longs[x])
      tmp_lats.push(pole_lats[x])

    }
  }


  for (let i = 0; i < tmp_lats.length; i++) {

    tmp_poles.push({ x: tmp_longs[i], y: tmp_lats[i], value: Math.floor(Math.random() * 89) + 1   })

  }
  console.log(tmp_poles)
  //heatmap here
  if(heat!=null)
  {
   heat.destory() 
  }
  const bbox = [-95.451095, 29.651095, -95.1039, 29.826357]

  const getHeat = require('cesiumjs-heat').default
  const CesiumHeat = getHeat(Cesium)
  heat = new CesiumHeat(
    viewer,
    {
      autoMaxMin: true,
      min: 0,
      max: 100,
      data: tmp_poles
    },
    bbox,
    {
       radius: 30,
  maxOpacity: .5,
  minOpacity: 0,
  blur: .75,
  gradient: {
    // enter n keys between 0 and 1 here
    // for gradient color customization
    '.6': 'blue',
    '.8': 'red',
    '.9': 'white'
  }
}
  ,{
    enabled: true,  
    min: 6375000,   
    max: 10000000,  
    maxRadius:  7,
    minRadius:  7,
  }
    
  )



}

var myVar = '';
function getAddr(latitude, longtitude) {
  $.ajax({
    url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode',
    data: {
      'f': 'pjson',
      'featureTypes': '',
      'location': latitude + ',' + longtitude,
    },
    async: false,
    dataType: 'json',
    success: function (data) {
      myVar = data;
    },
  })
  return myVar;
}

//Generate the dialog box
function map_create(img_id) {
  //console.log("img_id" + img_id)
  var mapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: baltimore,
    zoom: 14
  }
  var cur = img_id;
  var res_obj;
  var res_img;
  res_obj = parseInt(cur.substring(
    cur.lastIndexOf("i") + 1,
    cur.lastIndexOf("-")
  ));
  //console.log(res_obj)
  res_img = cur.substring(
    cur.lastIndexOf("-") + 1,
    cur.lastIndexOf("-") + 2
  )
   //console.log(res_img)

  let object_lat = vulnerable_objects[object_indicator]['cluster_latitude'];
  let object_lon = vulnerable_objects[object_indicator]['cluster_longitude'];
  let observer_lat = vulnerable_objects[object_indicator]['cluster_objects'][res_img-1]['latitude'];
  let observer_lon = vulnerable_objects[object_indicator]['cluster_objects'][res_img-1]['longitude'];
  var baltimore = new google.maps.LatLng(object_lat, object_lon);
  var baltimore1 = new google.maps.LatLng(observer_lat, observer_lon);
  var panorama = new google.maps.StreetViewPanorama(
    document.getElementById('pano'),
    {
      position: baltimore1,
      pov: { heading: 4, pitch: 10 },
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
  google.maps.event.addListener(panorama, 'position_changed', function () {
    var heading = google.maps.geometry.spherical.computeHeading(panorama.getPosition(), cafeMarker2.getPosition());
    panorama.setPov({
      heading: heading,
      pitch: 0
    });
  });
  map.setStreetView(panorama);
}

function img_dialog(img_id) {
  let wWidth = $(window).width();
  let wHeight = $(window).height();
  let dWidth = wWidth * 0.4;
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
      Close: function () {
        $(this).dialog('close');
      }
    },
    open: function () {
      map_create(img_id);
    }
  }
  );
}

// Move to promise.all
function initializes_settings(){
  viewer.scene.globe.depthTestAgainstTerrain = true;
var initialPosition = Cesium.Cartesian3.fromDegrees(-95.364808777523, 29.736084676987729, 953);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);

viewer.scene.camera.setView({
  destination: initialPosition,
  orientation: initialOrientation,
  endTransform: Cesium.Matrix4.IDENTITY
});

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

viewer.scene.globe.maximumScreenSpaceError = 18;
viewer.clock.shouldAnimate = false;
viewer.clock.multiplier = 1500.0;
viewer.timeline.addEventListener('settime', onTimelineScrubfunction, false);
viewer.animation.viewModel.dateFormatter = localeDateTimeFormatter
viewer.animation.viewModel.timeFormatter = localeTimeFormatter
viewer.timeline.makeLabel = function (time) { return localeDateTimeFormatter(time) }

} 

function processPoles() {
  let objects = poles['data']
  for (let object of objects) {
    let entity = new Cesium.Entity();

    entity.position = Cesium.Cartesian3.fromDegrees(object['longitude'], object['latitude'], 0);
    entity.name = object['id'];
    let manual_id = object['manual_id'];
    entity.billboard = undefined;
    entity.model = new Cesium.ModelGraphics({
      uri: './geoMappings/Utilitypole_3Dmodel.glb',
      scale: 0.2,
      color: Cesium.Color.GREEN,
      silhouetteColor: Cesium.Color.WHITE,
      silhouetteSize: 0.0,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    });
    entity.addProperty("manual_id")
    entity.manual_id = manual_id;
    entity.silhouetteColor = Cesium.Color.WHITE;
    entity.silhouetteSize = 0.4;
    poles_data.entities.add(entity);
    
    pole_longs.push(parseFloat(object['longitude']))
    pole_lats.push(parseFloat(object['latitude']))

  }
  let wood_arr=new Array(61);
  for(let i=426;i<487;i++)
      wood_arr[i]=i;
  let wood_set=new Set(wood_arr)
  //console.log(wood_set);
  for(let x=0;x<poles_data.entities.values.length;x++)
  {
    if (wood_set.has(x)) {
    poles_data.entities.values[x].model.color = Cesium.Color.BURLYWOOD;
    //poles_data.entities.values[x].model.scale=
    }
  
  }


};

var power4 = Cesium.GeoJsonDataSource.load('./geoMappings/powerSub.geojson');
var power5 = Cesium.GeoJsonDataSource.load('./geoMappings/wire.geojson');
var flood1 = Cesium.GeoJsonDataSource.load('./geoMappings/dStormInlet_L5457_ver3.geojson');

var vulnerable_objects;
var object_indicator;
var url = Cesium.buildModuleUrl("./images/power.png");
var url1 = Cesium.buildModuleUrl("./images/vul.png");

var url = Cesium.buildModuleUrl('./images/exclaimation.png')
//var object_loc;
var vulnerable_objects_entity = []
// Use promise all

function processLocalizedResults() {
  let objects = vulnerable_objects['objects'];
  vulnerable_objects = objects;

  for (let object of objects) {
    let entity = new Cesium.Entity();
    entity.position = Cesium.Cartesian3.fromDegrees(object['cluster_longitude'], object['cluster_latitude'], 0);
    entity.name = object['cluster_id'];

    let cluster_obj = object['cluster_objects'];

    entity.billboard = new Cesium.BillboardGraphics();

    entity.billboard.image = pinBuilder.fromUrl(url, Cesium.Color.BLACK, 48);
    entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    vulnerable_objects_entity.push(entity)
    let updated=viewer.entities.add(entity);

  }
};


var current_id = "xx";
var current_id1 = "xx";
var current_c = "0";

var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (click) {
  var pick = viewer.scene.pick(click.position);
  if (pick && pick.id && (typeof pick.id._name == 'number')) {

    let name = vulnerable_objects[parseInt(pick.id._name)]['cluster_id'];
    let cluster_obj = vulnerable_objects[parseInt(pick.id._name)]['cluster_objects'];
    let image_url = cluster_obj[0]['image'];
    let image_date = cluster_obj[0]['createdDate'];
    let object_type = cluster_obj[0]['classification'];
    let lat = vulnerable_objects[parseInt(pick.id._name)]['cluster_latitude'];
    let lon = vulnerable_objects[parseInt(pick.id._name)]['cluster_longitude'];
    let nearest_target = vulnerable_objects[parseInt(pick.id._name)]['nearest_pole']
    var test = getAddr(lon, lat);
    vulnerable_objects_entity[parseInt(pick.id._name)].description = '\
      <style>\
      .rotate90 {\
        text-indent: 0;\
        border: thin silver solid;\
        margin: 0.0em;\
        padding: 0.0em;\
        width:300px;\
        height:400px;\
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
        <th>'+ object_type + '</th>\
      </tr>\
      <tr>\
        <td>Object id</td>\
        <td>'+ name + '</td>\
      </tr>\
      <tr>\
        <td>Coordinate</td>\
        <th>'+ lat + '   ' + lon + '</th>\
      </tr>\
      <tr>\
        <td>Receive Date</td>\
        <th>'+ image_date.substring(0, 10) + '</th>\
      </tr>\
      <tr>\
        <td>Address</td>\
        <th>'+ test['address']['Match_addr'] + '</th>\
      </tr>\
      <tr>\
        <td>Analysis Results</td>\
      </tr>\
    </table>\
    <br style = "line-height:8;"><br>\
    <img data-object-id='+ parseInt(pick.id._name) + ' class="rotate90" src=' + image_url + ' >\
    <br style = "line-height:10;"><br>\
  ';

    object_indicator = pick.id._name;
    initial_pole = nearest_target;
    let near_track = 0;

    for (let pole of poles_data.entities.values) {
      pole.model.silhouetteSize = 0.0;
    }
    let entity = poles_data.entities.values[nearest_target - 1];
    entity.silhouetteColor = Cesium.Color.WHITE;
    entity.model.silhouetteSize = 1.0;
  }

}, Cesium.ScreenSpaceEventType.LEFT_DOWN);



viewer.infoBox.frame.addEventListener('load', function () {
  viewer.infoBox.frame.contentDocument.body.addEventListener('click', function (e) {
    console.log("frame clicked")
    console.log(e.target.className)
    console.log(e.target.className == "rotate90")
    if (e.target && e.target.className === 'rotate90') {
      let myNode = document.getElementById("dialog1");
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
      }
      let element = e.target;
      let object_id = element.getAttribute("data-object-id");
      let object_clusters = vulnerable_objects[object_indicator]['cluster_objects'];
      current_c = object_clusters;
      var tmp = 1;
      for (let object_image of object_clusters) {
        let ima = new Image();

        ima.src = object_image['image'];
        ima.height = 250;
        ima.width = 200;
        ima.id = 'i' + object_id + '-' + tmp.toString();
        ima.className = "test";
        document.getElementById("dialog1").appendChild(ima);
        tmp = tmp + 1;
      }
      var track = 1
      current_id1 = 'i' + object_id + '-' + track.toString();
      let wWidth = $(window).width();
      let wHeight = $(window).height();
      let dWidth = wWidth * 0.4;
      let dHeight = wHeight * 0.4;

      $(function () {
        $("#dialog1").dialog({
          width: dWidth,
          height: dHeight,
          position: myPos,
          open: function () {
            $(".test").on('click', function () {
              current_id = $(this).attr('id');
              img_dialog(current_id);
            });
          }
        });
      });
      $(function () {
        $("#dialog2").dialog({
          width: dWidth,
          height: dHeight,
          position: myPos_right,
          open: function () {
            map_create(current_id1);
          }
        });
      });
    }

  }, false);
}, false);

var poles_data = new Cesium.CustomDataSource();

CheckPowerI.addEventListener('change', function () {
  if (CheckPowerI.checked) {
    viewer.dataSources.add(poles_data);
    //console.log("add")

  } else {
    viewer.dataSources.remove(poles_data);
  }
});


power4.then(function (dataSource) {
  var entities = dataSource.entities.values;
  for (let i = 0; i < entities.length; i++) {
    var entity = entities[i];
    entity.polygon.material = new Cesium.Material(Cesium.Color.YELLOW);
    entity.polygon.outline = false;
    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
  }
});

Cesium.when(power4, function (dataSource) {
  CheckPowerI.addEventListener('change', function () {
    if (CheckPowerI.checked) {
      viewer.dataSources.add(dataSource);
    } else {
      viewer.dataSources.remove(dataSource);
    }
  });
});

power5.then(function (dataSource) {
  var entities = dataSource.entities.values;
  for (let i = 0; i < entities.length; i++) {
    var entity = entities[i];
    entity.billboard = undefined;
    entity.polyline.clampToGround = true;
    entity.polyline.material = new Cesium.Material(Cesium.Color.YELLOW);
  }
});

Cesium.when(power5, function (dataSource) {
  CheckPowerI.addEventListener('change', function () {
    if (CheckPowerI.checked) {
      viewer.dataSources.add(dataSource);
    } else {
      viewer.dataSources.remove(dataSource);
    }
  });
});

flood1.then(function (dataSource) {
  var entities = dataSource.entities.values;
  for (let i = 0; i < entities.length; i++) {
    let entity = entities[i];
    let Coordinate = "";

    entity.billboard = undefined;
    entity.point = new Cesium.PointGraphics({
      color: Cesium.Color.WHITE,
      pixelSize: 13,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    });

  }
});

Cesium.when(flood1, function (dataSource) {
  CheckFloodI.addEventListener('change', function () {
    if (CheckFloodI.checked) {
      viewer.dataSources.add(dataSource);

    } else {
      viewer.dataSources.remove(dataSource);
    }
  });
});

function update_weather_hist(data, currentTime) {
  weather_data = data;
  let weather_desc = []
  let pair_humi = []
  let pair_wind = []
  let pair_temp = []
  let pair_time = []

  for (let i = 0; i < weather_data['data'].length - 1; i++) {
    //  let dt_time=weather_harvey['data'][i]['dt']
    // Cesium.JulianDate.fromDate(new Date(weather_data['data'][i]['dt'] * 1000), tmp_date)
    weather_desc.push(data['data'][i]['weather'][0]['main'])
    pair_humi.push([weather_data['data'][i]['main']['humidity'], weather_data['data'][i + 1]['main']['humidity']])
    pair_wind.push([weather_data['data'][i]['wind']['speed'], weather_data['data'][i + 1]['wind']['speed']])
    pair_temp.push([weather_data['data'][i]['main']['temp'], weather_data['data'][i + 1]['main']['temp']])
    pair_time.push([Cesium.JulianDate.fromDate(new Date(weather_data['data'][i]['dt'] * 1000)), Cesium.JulianDate.fromDate(new Date(weather_data['data'][i + 1]['dt'] * 1000))])

  }

  var wind_track = 0;
  for (let i = 0; i < weather_data['data'].length - 1; i++) {
    let before = pair_time[i][0];
    let after = pair_time[i][1];

    if (Cesium.JulianDate.greaterThanOrEquals(currentTime, before) && Cesium.JulianDate.lessThan(currentTime, after)) {
      wind_track = i
    }
    if (Cesium.JulianDate.equals(currentTime, before) && Cesium.JulianDate.equals(currentTime, after)) {
      wind_track = i
    }
  }

  let cur_wind = (pair_wind[wind_track][0] + pair_wind[wind_track][1]) / 2
  let cur_temp = (pair_temp[wind_track][0] + pair_temp[wind_track][1]) / 2
  let cur_humi = (pair_humi[wind_track][0] + pair_humi[wind_track][1]) / 2
  let cur_desc = weather_desc[wind_track]
  let cur_rain = '0';
  //  console.log(cur_humi)
  if (cur_desc == 'Rain') {
    cur_rain = weather_data['data'][wind_track]['rain']['3h']
  }

  let windElem = document.getElementById("wind");
  windElem.innerHTML = `${cur_wind.toFixed(1)}&nbsp;m/s`;
  // let time =document.getElementById("time");
  // time.innerHTML = `${Cesium.JulianDate.toDate(currentTime).toString().substring(4,25)}`;
  let tempElement = document.getElementById("temperature");
  tempElement.innerHTML = `<i id="icon-thermometer" class="wi wi-thermometer" style=" font-size: 0.9rem;
  padding-bottom: 0.1rem;"></i><p class="temp">${cur_temp.toFixed(3)}&nbsp;<nobr>°C</nobr></p>`;
  let description = document.getElementById("description");
  description.innerHTML = `<i id="icon-desc" class="wi wi-owm-200"></i><p class="desc">${cur_desc}</p>`;
  let rainfall = document.getElementById("visibility");
  rainfall.innerHTML = `${parseFloat(cur_rain).toFixed(1)}&nbsp;mm`;
  let humidityElem = document.getElementById("humidity");
  // humidityElem.innerHTML = `${cur_humi.toFixed(0)}&nbsp;%`;
  humidityElem.innerHTML = `${cur_humi}&nbsp;%`;
  //    console.log(humidityElem.innerHTML)
}


var weather_harvey;
var weather_allison;
var weather_rita;
var weather_ike;
var event_indicator;
$('.dropdown-menu a').click(function () {
  let t = $(this).text();
  $('button[data-toggle="dropdown"]').html('<i class="fas fa-wind"></i>' +
    '<br /><span>' + t + '</span>');
  event_indicator = t;
  console.log(event_indicator)
});

function extract_weather(weather_info,weather_name)
{

  let start = new Cesium.JulianDate()
  for (let i = 0; i < weather_info['count']; i++) {
    let dt_time = weather_info['data'][i]['dt']
    let tmp_date = new Cesium.JulianDate()
    Cesium.JulianDate.fromDate(new Date(dt_time * 1000), tmp_date)

    if (i == 0) {
      start = tmp_date;
    }
  }


  Cesium.JulianDate.addDays(start, 4.0, res);
  viewer.timeline.zoomTo(start, res);
  viewer.timeline.updateFromClock();
  viewer.clock.currentTime = start.clone();
  viewer.clock.shouldAnimate = true;

 // e.preventDefault();

}

// The same code is ued for all the hurricanes, why cant we use an if condition to get the url to fetch the information
jQuery("#harvey").click(function (e) {
  if (weather_harvey == undefined) {
    $.ajax({
      url: 'http://backend.digitaltwincities.info/harvey',
      data: {
      },
      async: false,
      dataType: 'json',
      success: function (data) {
        weather_harvey = data;
      }
    });
  }
  extract_weather(weather_harvey,'harvey');

});


jQuery("#allison").click(function (e) {
  if (weather_allison == undefined) {
    $.ajax({
      url: 'http://backend.digitaltwincities.info/allison',
      data: {

      },
      async: false,
      dataType: 'json',
      success: function (data) {
        weather_allison = data;
      }
    });
  }
  extract_weather(weather_allison);
 
});

jQuery("#rita").click(function (e) {
  if (weather_rita == undefined) {
    $.ajax({
      url: 'http://backend.digitaltwincities.info/rita',
      data: {

      },
      async: false,
      dataType: 'json',
      success: function (data) {
        weather_rita = data;
        
      }
    });
  }
extract_weather(weather_rita);

});

jQuery("#ike").click(function (e) {
  if (weather_ike == undefined) {
    $.ajax({
      url: 'http://backend.digitaltwincities.info/ike',
      data: {

      },
      async: false,
      dataType: 'json',
      success: function (data) {
        weather_ike = data;
      }
    });
  }
extract_weather(weather_ike);

});