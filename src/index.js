
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

frame.addEventListener('load', function () {
  console.log("ddd");
    var cssLink = frame.contentDocument.createElement('link');
    cssLink.href = Cesium.buildModuleUrl('./css/main.css');
    cssLink.rel = 'stylesheet';
    cssLink.type = 'test/css';
    frame.contentDocument.head.appendChild(cssLink);
}, false);

viewer.scene.camera.setView({
    destination: initialPosition,
    orientation: initialOrientation,
    endTransform: Cesium.Matrix4.IDENTITY
});



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

var vulnerable_objects;//cesium.com/docs/tutorials/creating-entities/Flag_of_Wyoming.svg
var url =Cesium.buildModuleUrl("./images/power.png");

//./images/power.png
fetch('https://sk4a447dkf.execute-api.us-east-1.amazonaws.com/default/localize')
  .then(response => response.json())
  .then(function(json){
      let objects = json['objects'];
      vulnerable_objects = objects;
      for(let object of objects){
        // console.log("Object is ", object['cluster_center_latitude'])
        // console.log("Object is ", object['cluster_center_longitude'])
        var entity = new Cesium.Entity();
        entity.position = Cesium.Cartesian3.fromDegrees(object['cluster_center_longitude'],object['cluster_center_latitude'], 0);
        entity.name = object['cluster_id'];
        var lat =object['cluster_center_latitude'];
        var lon =object['cluster_center_longitude'];
        var name=object['cluster_id'];


    var pinBuilder = new Cesium.PinBuilder();
  //  entity.billboard.image = pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48);
    
        entity.description = '\
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
        <td>Cluster id</td>\
        <td>'+name+'</td>\
      </tr>\
      <tr>\
        <td>Coordinate</td>\
        <th>'+lat+'   '+lon+'</th>\
      </tr>\
      <tr>\
        <td>Status</td>\
      </tr>\
      <tr>\
        <td>Potential demage</td>\
      </tr>\
    </table>\
     <img data-object-id='+entity.name+' class="object-image" width="100% style="float:center; margin: 0 1em 1em 0;" src="//cesium.com/docs/tutorials/creating-entities/Flag_of_Wyoming.svg"/>\
     ';
     entity.point = {
    color : Cesium.Color.BLUE,
    pixelSize : 15,
  };
 // if(updateP.checked)
  //{
 var updated=viewer.entities.add(entity);
  //}
  // viewer.entities.add(entity);
//     viewer.entities.add({
//   position : Cesium.Cartesian3.fromDegrees(object['cluster_center_longitude'],object['cluster_center_latitude'], 0),
//   name : object['cluster_id'],
//   point : {
//     color : Cesium.Color.YELLOW,
//     pixelSize : 15,
//   }
//   description : 
// });

      }
  } )


viewer.infoBox.frame.addEventListener('load', function() {

    console.log("Frame loaded")
    viewer.infoBox.frame.contentDocument.body.addEventListener('click', function(e) {
 
        console.log("frame clicked")
        console.log(e.target.className)
        console.log(e.target.className == "object-image")
        if (e.target && e.target.className === 'object-image') {
          $("#dialog").html("");
            console.log("Im entering in this if");
            let element = e.target;
            let object_id = element.getAttribute("data-object-id");
            let object_images = vulnerable_objects[object_id]['cluster_images'];
            for(let object_image of object_images){
              let ima = new Image();
              ima.src = "//cesium.com/docs/tutorials/creating-entities/Flag_of_Wyoming.svg";
              ima.height = 30;
              ima.width = 30;
              document.getElementById("dialog").appendChild(ima);
            }
           $( "#dialog" ).dialog();
        }
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
     <img class="object-image" width="100% style="float:center; margin: 0 1em 1em 0;" src="//cesium.com/docs/tutorials/creating-entities/Flag_of_Wyoming.svg"/>\
     ';
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


    updateP.addEventListener('change', function () {
        if (updateP.checked) {
            viewer.dataSources.add(updated);
        }
        else {
           viewer.entities.remove(updated); 
        }
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
colorByDistance();