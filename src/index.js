
require('cesium/Widgets/widgets.css');
require('./css/main.css');
var Cesium = require('cesium/Cesium');

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzYyNDZmZi1lYTdhLTQwMDgtOGRhZC03ZDE5YTlkYmVkMGMiLCJpZCI6NDAxOSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzOTYzODc1OX0.Kb7k51vZGYR5F7btrBIAuSan3ZNyKY_AWrFv1cLFUFk';

var viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: true,
    animation: true,
    shadows: true
});
var tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(41753)
    })
);
viewer.scene.globe.depthTestAgainstTerrain = true;
var initialPosition = Cesium.Cartesian3.fromDegrees(-95.381735, 29.749122, 753);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
viewer.clock.shouldAnimate = true; 
viewer.infoBox.frame.removeAttribute('sandbox');
var frame = viewer.infoBox.frame;
/*
frame.addEventListener('load', function () {
    var cssLink = frame.contentDocument.createElement('link');
    cssLink.href = Cesium.buildModuleUrl('test.css');
    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    frame.contentDocument.head.appendChild(cssLink);
}, false);
*/
viewer.scene.camera.setView({
    destination: initialPosition,
    orientation: initialOrientation,
    endTransform: Cesium.Matrix4.IDENTITY
});



//var checkbox1 = document.getElementById('Power');
//var checkbox2 = document.getElementById('Waterline');

var checkbox1 = document.getElementById('one');
var checkbox2 = document.getElementById('two');
var checkbox3 = document.getElementById('one1');
var checkbox4 = document.getElementById('two1');
var checkbox5 = document.getElementById('three1');

var CheckFloodI = document.getElementById('x'); 
var CheckPowerI = document.getElementById('y');  //updateobj
var updateP = document.getElementById('updateobj');

var power1 = Cesium.GeoJsonDataSource.load('./geoMappings/updateobj.geojson');
var power2 = Cesium.GeoJsonDataSource.load('./geoMappings/update.geojson');
var power3 = Cesium.GeoJsonDataSource.load('./geoMappings/power.geojson');
var power4 = Cesium.GeoJsonDataSource.load('./geoMappings/powerSub.geojson');
var power5 = Cesium.GeoJsonDataSource.load('./geoMappings/wire.geojson');
var flood1 = Cesium.GeoJsonDataSource.load('./geoMappings/dStormInlet_L5457_ver3.geojson');


fetch('https://sk4a447dkf.execute-api.us-east-1.amazonaws.com/default/localize')
  .then(response => response.json())
  .then(json => console.log(json))


var sample = Cesium.Resource.fetchJsonp('./geoMappings/sample.json');

sample.then(function(dataSource) {
      console.log("This is a very loooong message");
      console.log(dataSource);
         });

console.log(sample)
power1.then(function(dataSource) {
    var entities = dataSource.entities.values;
        var name="";
        var Coordinate="";
        var Status="";
        var Potential_demage="";
    for (var i = 0; i < entities.length; i++) {
         var entity = entities[i];
        
        if (entity.properties.hasProperty('Name')) {
        
       // var pinBuilder = new Cesium.PinBuilder();
        //entity.billboard.image = pinBuilder.fromUrl(url, Cesium.Color.RED, 48);
        
         if (entity.properties.hasProperty('Name')) {         
          name = entity.properties.Name.valueOf();
         }
        if (entity.properties.hasProperty('Coordinate')) {         
          Coordinate = entity.properties.Coordinate.valueOf();
         }
    if (entity.properties.hasProperty('Status')) {         
          Status = entity.properties.Status.valueOf();
         }
    if (entity.properties.hasProperty('Potential_demage')) {         
          Potential_demage = entity.properties.Potential_demage.valueOf();
         }
        
    //table id="t01" <table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter">
    var descriptions = '\
    <style>\
    .cesium-infoBox-description {\
        font-family: "Times New Roman", Times, serif;\
        font-size: 8px;\
        padding: 4px 10px;\
        margin-right: 4px;\
        color: #edffff;\
    }\
    .cesium-infoBox-defaultTable tr:nth-child(odd) {\
        background-color: rgba(38, 38, 38, 1.0);\
    }\
    .cesium-infoBox-defaultTable tr:nth-child(even) {\
        background-color: rgba(38, 38, 38, 1.0);\
    }\
    .cesium-infoBox-defaultTable th {\
        font-weight: normal;\
        padding: 4px;\
        vertical-align: middle;\
        text-align: center;\
    }\
    .cesium-infoBox-defaultTable td {\
        padding: 4px;\
        vertical-align: middle;\
        text-align: center;\
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
    <img width="100% style="float:center; margin: 0 1em 1em 0;" src="//cesium.com/docs/tutorials/creating-entities/Flag_of_Wyoming.svg"/>\
    <p>\
      Source: \
      <a style="color: WHITE"\
        target="_blank"\
        href="http://en.wikipedia.org/wiki/Wyoming">Openstreet</a>\
    </p>\
     <button onclick="parent.myFunction()">Click me</button>';
      entity.description = descriptions;
        }
    
    /*
        if (entity.properties.hasProperty('id')) {
          entity.point = new Cesium.PointGraphics({
            color: Cesium.Color.YELLOW,
            pixelSize: 10
        }); 
         }
      */  
        
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

Cesium.when(power1, function (dataSource) {
    updateP.addEventListener('change', function () {
        if (updateP.checked) {
            viewer.dataSources.add(dataSource);
        }
        else {
            viewer.dataSources.remove(dataSource);

        }
    });

});


power2.then(function (dataSource) {
    var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.billboard = undefined;

        if (entity.properties.hasProperty('id')) {
            entity.point = new Cesium.PointGraphics({
                color: Cesium.Color.YELLOW,
                pixelSize: 10
            });

        }

    }
});

Cesium.when(power2, function (dataSource) {
    checkbox2.addEventListener('change', function () {
        if (checkbox2.checked) {
            viewer.dataSources.add(dataSource);
        }
        else {
            viewer.dataSources.remove(dataSource);

        }
    });

});

power3.then(function(dataSource) {
    var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
            color: Cesium.Color.GREEN,
            pixelSize: 13
        });
     //    if (entity.properties.hasProperty('id')) {
      //    entity.point = new Cesium.PointGraphics({
       //     color: Cesium.Color.YELLOW,
       //     pixelSize: 10
       // });
         }
      
    });
    
    
    Cesium.when(power3,function(dataSource){
         CheckPowerI.addEventListener('change', function() {
            if ( CheckPowerI.checked) {
            viewer.dataSources.add(dataSource);
            }
            else{
            viewer.dataSources.remove(dataSource);
            
            }
        });
    
    });
    
    
    power4.then(function(dataSource) {
    var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.billboard = undefined; 
        entity.polyline.material=Cesium.Color.Red;
       
     //    if (entity.properties.hasProperty('id')) {
      //    entity.point = new Cesium.PointGraphics({
       //     color: Cesium.Color.YELLOW,
       //     pixelSize: 10
       // });
         }
      
    });
    
    
    Cesium.when(power4,function(dataSource){
        CheckPowerI.addEventListener('change', function() {
            if (CheckPowerI.checked) {
            viewer.dataSources.add(dataSource);
            }
            else{
            viewer.dataSources.remove(dataSource);
            
            }
        });
    
    });
    
    
    power5.then(function(dataSource) {
    var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.billboard = undefined; 
     //   entity.point = new Cesium.PointGraphics({
     //       color: Cesium.Color.WHITE,
     //       pixelSize: 13
     //   });
     //    if (entity.properties.hasProperty('id')) {
      //    entity.point = new Cesium.PointGraphics({
       //     color: Cesium.Color.YELLOW,
       //     pixelSize: 10
       // });
         }
      
    });
    
    
    Cesium.when(power5,function(dataSource){
        CheckPowerI.addEventListener('change', function() {
            if (CheckPowerI.checked) {
            viewer.dataSources.add(dataSource);
            }
            else{
            viewer.dataSources.remove(dataSource);
            
            }
        });
    
    });

       flood1.then(function(dataSource) {
    var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.billboard = undefined; 
        entity.point = new Cesium.PointGraphics({
            color: Cesium.Color.WHITE,
            pixelSize: 13
        });
     //    if (entity.properties.hasProperty('id')) {
      //    entity.point = new Cesium.PointGraphics({
       //     color: Cesium.Color.YELLOW,
       //     pixelSize: 10
       // });
         }
      
    });
    
    
    Cesium.when(flood1,function(dataSource){
        CheckFloodI.addEventListener('change', function() {
            if (CheckFloodI.checked) {
            viewer.dataSources.add(dataSource);
            }
            else{
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