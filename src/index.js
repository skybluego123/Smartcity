require('cesium/Widgets/widgets.css');
require('./css/main.css');

var Cesium = require('cesium/Cesium');

// Example app

var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain()
});

viewer.scene.globe.depthTestAgainstTerrain = true;

var scene = viewer.scene;
scene.debugShowFramesPerSecond = true;


Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzYyNDZmZi1lYTdhLTQwMDgtOGRhZC03ZDE5YTlkYmVkMGMiLCJpZCI6NDAxOSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzOTYzODc1OX0.Kb7k51vZGYR5F7btrBIAuSan3ZNyKY_AWrFv1cLFUFk';

var initialPosition = Cesium.Cartesian3.fromDegrees(-95.381735, 29.749122, 753);
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

var tileset1 = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(40446)
    })
);

function colorByDistance() {
    tileset.style = new Cesium.Cesium3DTileStyle({
        defines : {
            distance : 'distance(vec2(${Longitude}, ${Latitude}), vec2(-1.6647633256709604,0.519209520751604))'
        },
        color : {
           conditions : [
                ['${distance} > 0.0012',"color('gray')"],
                ['${distance} > 0.0008', "mix(color('yellow'), color('red'), (${distance} - 0.008) / 0.0004)"],
                ['${distance} > 0.0004', "mix(color('green'), color('yellow'), (${distance} - 0.0004) / 0.0004)"],
                ['${distance} < 0.00001', "color('white')"],
                ['true', "mix(color('blue'), color('green'), ${distance} / 0.0004)"]
            ]
        }
    });
}

colorByDistance();