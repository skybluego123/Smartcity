
require('cesium/Widgets/widgets.css');
require('./css/main.css');
var Cesium = require('cesium/Cesium');

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzYyNDZmZi1lYTdhLTQwMDgtOGRhZC03ZDE5YTlkYmVkMGMiLCJpZCI6NDAxOSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzOTYzODc1OX0.Kb7k51vZGYR5F7btrBIAuSan3ZNyKY_AWrFv1cLFUFk';

var viewer = new Cesium.Viewer('cesiumContainer', {
    sceneMode : Cesium.SceneMode.SCENE2D,
    timeline : false,
    animation : false
});
viewer.scene.globe.depthTestAgainstTerrain = true;
var initialPosition = Cesium.Cartesian3.fromDegrees(-95.381735, 29.749122, 753);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);


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

var CheckPowerI=document.getElementById('y');  //updateobj
var updateP=document.getElementById('updateobj');



var power1 = Cesium.GeoJsonDataSource.load('./geoMappings/dStormInlet_L5457_ver3.geojson');
var power2 = Cesium.GeoJsonDataSource.load('./geoMappings/power.geojson');


power1.then(function(dataSource) {
var entities = dataSource.entities.values;
for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];
    entity.billboard = undefined; 
    entity.point = new Cesium.PointGraphics({
        color: Cesium.Color.WHITE,
        pixelSize: 10
    });
    var descriptions = '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>' + '<tr><th>' + "Longitude" + '</th><td>' + longitude.toFixed(5) + '</td></tr>' + '<tr><th>' + "Latitude" + '</th><td>' + latitude.toFixed(5) + '</td></tr>' + '</tbody></table>'; entity.description = description;
entity.description=descriptions;


    if (entity.properties.hasProperty('id')) {
      entity.point = new Cesium.PointGraphics({
        color: Cesium.Color.YELLOW,
        pixelSize: 10
    }); 

     }
    
        if (entity.properties.hasProperty('CREATIONUS')) {
      entity.point = new Cesium.PointGraphics({
        color: Cesium.Color.WHITE,
        pixelSize: 10
    }); 
     }
}
});

Cesium.when(power1,function(dataSource){
    checkbox1.addEventListener('change', function() {
        if (checkbox1.checked) {
        viewer.dataSources.add(dataSource);
        }
        else{
        viewer.dataSources.remove(dataSource);
        
        }
    });

});


power2.then(function(dataSource) {
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

Cesium.when(power2,function(dataSource){
    checkbox2.addEventListener('change', function() {
        if (checkbox2.checked) {
        viewer.dataSources.add(dataSource);
        }
        else{
        viewer.dataSources.remove(dataSource);
        
        }
    });

});
