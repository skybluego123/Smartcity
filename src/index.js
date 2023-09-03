// Create Functions - always write functions - can help in splitting the files
require('cesium/Widgets/widgets.css');
require('./css/main.css');


var Cesium = require('cesium/Cesium');


Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMzYyNDZmZi1lYTdhLTQwMDgtOGRhZC03ZDE5YTlkYmVkMGMiLCJpZCI6NDAxOSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzOTYzODc1OX0.Kb7k51vZGYR5F7btrBIAuSan3ZNyKY_AWrFv1cLFUFk';

// add additional access token 
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5Y2U5NWU1Ny1iMmY4LTRkYjMtYThjMi1kMDVmYTY1ZWM1YjMiLCJpZCI6Nzc0OCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MDM2NDcxMH0.xYWY-C0FJjqSkRhRN9UMAzLKxg17whGjUhqihBKkHTs'

//Retrive data of poles, vulnerabilities and weather asynchronously using fetch JS API 

var poles, vulnerable_objects, current_weather;

var viewer = new Cesium.Viewer('cesiumContainer', {
  requestRenderMode : true,
  maximumRenderTimeChange : Infinity,
  terrainProvider: Cesium.createWorldTerrain({
    requestWaterMask: true,
    requestVertexNormals : true
  }),
  // terrainProvider: new Cesium.CesiumTerrainProvider({
  //   url: Cesium.IonResource.fromAssetId(1),
  // }),
  timeline: true,
  animation: true,
  shadows: true,
  infoBox: true
});



$('#select_city').on('change', function() {
  var value = $(this).val();
  console.log(value);
  if(value === 'houston'){

    let urls = [
      'http://backend.digitaltwincities.info/poles',
      'https://function.digitaltwincities.info/lambda/localize',
      'http://api.openweathermap.org/data/2.5/forecast?lat=30.6173014&lon=-96.3403507&units=metric&APPID=49406c4e8b6ee455d1904676a313aa40'
    ];
    
    let promises = urls.map(
          url => fetch(url)
                 .then(y => y.json()
                 )
          );
    
    Promise.all(promises).then(results => {
      poles = results[0]
      vulnerable_objects = results[1]
      current_weather = results[2]
      console.log(poles)
      viewer.clock.onTick.removeEventListener(applyGlobeSpin);
      //console.log(vulnerable_objects)
      initializes_settings()
      processPoles()
      processLocalizedResults()
      addListeners()
    });
    
    // viewer.clock.onTick.removeEventListener(applyGlobeSpin);
    // initializes_settings();
    // processPoles();
    // processLocalizedResults();
  } else{
    var cameraPosition = viewer.camera.positionWC;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 40000000.0),
      orientation: {
          heading: cameraPosition.heading,
          pitch: cameraPosition.pitch,
          roll: cameraPosition.roll
      },
      duration: 3 // Set the duration of the flight to 3 seconds
    });
    viewer.entities.removeAll();
    viewer.clock.onTick.addEventListener(applyGlobeSpin);
    //$('#select_city').prop('selectedIndex',0);
  }
});

// let urls = [
//   'http://backend.digitaltwincities.info/poles',
//   'https://function.digitaltwincities.info/lambda/localize',
//   'http://api.openweathermap.org/data/2.5/forecast?lat=30.6173014&lon=-96.3403507&units=metric&APPID=49406c4e8b6ee455d1904676a313aa40'
// ];

// let promises = urls.map(
//       url => fetch(url)
//              .then(y => y.json()
//              )
//       );

// Promise.all(promises).then(results => {
//   poles = results[0]
//   vulnerable_objects = results[1]
//   current_weather = results[2]
//   console.log(poles)
//   console.log(vulnerable_objects)
//   initializes_settings()
//   processPoles()
//   processLocalizedResults()
//   addListeners()
// });



//Creating Cesium Conatiner object where all the visulaizations will be mapped
//viewer.scene.debugShowFramesPerSecond = true;

const camera = viewer.camera;
camera.zoomOut(20000000);

// viewer.scene.globe.shadows = ShadowMode.ENABLED;

viewer.scene.globe.enableLighting = true;

var previousTime = Date.now();
var spinRate = 0.2;

function applyGlobeSpin() {
  var currentTime = Date.now();
  var delta = ( currentTime - previousTime ) / 1000;
  previousTime = currentTime;
  viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
 }

viewer.clock.onTick.addEventListener(applyGlobeSpin);

let animate_btn = document.querySelector('.animator');
// //let left_arr = document.querySelector('.left-arrow');
let get_animate = document.querySelector('.cesium-viewer-animationContainer');
let get_timeline_controller = document.querySelector('.cesium-viewer-timelineContainer');
// // let get_menu = document.querySelector('.menu-btn');
// let get_anly = document.querySelector('.anly-btn');
// let get_weather = document.querySelector('.cloud-btn');
// let get_his = document.querySelector('.his-btn');
// let get_menu_func = document.querySelector('.menu-func');
// let simulate_func = document.querySelector('.anly-btn');
// let simulate_fnc_div1 = document.querySelector('.div1');
// //Need to add onclick events to all the left navs.
//Start Here --------------------------------------------------

// get_anly.addEventListener('click', () => {
//   if(get_anly.after.style.visibility === 'visible'){
//     get_anly.after.style.visibility = 'hidden';
//     get_anly.style.border = 'none';
//     get_anly.style.background = '#500000';
//     get_anly.style.color = '';
//     //left_arr.style.marginBottom = '-300px';
//   }else{
//     get_anly.style.border = '1px solid black';
//     get_anly.after.style.visibility = 'visible';
//     get_anly.style.background = 'white';
//     get_anly.style.color = '#500000';
//     //left_arr.style.marginBottom = '-150px';
//   }
// });

// animate_btn.addEventListener('click', () => {
//   if(get_animate.style.visibility === 'visible'){
//     get_animate.style.visibility = 'hidden';
//     get_timeline_controller.style.visibility = 'hidden';
//     // animate_btn.style.border = 'none';
//     // animate_btn.style.background = '#500000';
//     // animate_btn.style.color = '';
//     //left_arr.style.marginBottom = '-300px';
//   }else{
//     // animate_btn.style.border = '1px solid black';
//     get_animate.style.visibility = 'visible';
//     get_timeline_controller.style.visibility = 'visible';
//     // animate_btn.style.background = 'white';
//     // animate_btn.style.color = '#500000';
//     //left_arr.style.marginBottom = '-150px';
//   }
// });
// get_menu.addEventListener('click',()=>{
//   if(get_menu_func.style.display === 'inline-block'){
//     get_menu_func.style.display = 'none';
//     get_menu.style.border = 'none';
//     get_menu.style.background = '#500000';
//     get_menu.style.color = '';

    
//   }else{
//     get_menu.style.border = '1px solid black';
//     get_menu_func.style.display = 'inline-block';
//     get_menu.style.background = 'white';
//     get_menu.style.color = '#500000';

//   }
// });

/*
  This function updates weather
  Input: json data and time
  Output: update html element associated with weather
*/


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
  return objDT + Cesium.toString("%02d:%02d:%02d", gregorianDT.hour, gregorianDT.minute, gregorianDT.second);
}
  
function localeTimeFormatter(time, viewModel) {
  return localeDateTimeFormatter(time, viewModel, true);
}
  
var pinBuilder = new Cesium.PinBuilder();
// var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(50.27879878293835, -50.39390550872461, 5.0916951918898415);
// var initialPosition = Cesium.Cartesian3.fromDegrees(-96.49198382732189, 30.756144216291395, 15000);
//  // longitude, latitude, height
//  var houstonDowntownMainBuildingPosition = Cesium.Cartesian3.fromDegrees(-95.38198382732189,29.746144216291395, 1);
//  var houstonDowntownMainBuildingHeading = Cesium.Math.toRadians(360.0);
//  var houstonDowntownMainBuildingPitch = Cesium.Math.toRadians(500.0);
//  var houstonDowntownMainBuildingRange = 1200.0;
//  var houstonDowntownMainBuildingOrientation = {
//    heading: houstonDowntownMainBuildingHeading,
//    pitch: houstonDowntownMainBuildingPitch,
//    roll: 0.0
//  };
// //  var newCameraOrientation = {
// //   heading: Cesium.Math.toRadians(360.0),
// //   pitch: Cesium.Math.toRadians(-100.0),
// //   roll: 0.0
// // };
// var destination = Cesium.Cartesian3.fromDegrees(-95.3698, 29.7604, 300);
// var orientation = {
//     heading: Cesium.Math.toRadians(-30.0),
//     pitch: Cesium.Math.toRadians(-30.0),
//     roll: 0.0
// };
// function initializes_settings(){
//   console.log("initializing settings!");
//   viewer.clock.onTick.removeEventListener(applyGlobeSpin);
//   viewer.scene.globe.depthTestAgainstTerrain = true;
//   Promise.resolve(viewer.camera.flyTo({
//     destination: Cesium.Rectangle.fromDegrees(-130.0, 20.0, -65.0, 155.0),
//     duration: 10.0,
//     easingFunction: Cesium.EasingFunction.LINEAR_NONE
//   })).then(function() {
//     //Once the camera has finished flying to North America, zoom to Texas
//     viewer.camera.flyTo({
//       destination: Cesium.Rectangle.fromDegrees(-107.0, 25.0, -93.0, 37.0),
//       duration: 10.0,
//       easingFunction: Cesium.EasingFunction.LINEAR_NONE
//     })})
//     .then(function() {
//       // Once the camera has finished flying to Texas, zoom in to the Houston downtown main building
//       viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(houstonDowntownMainBuildingPosition, houstonDowntownMainBuildingRange), {
//         //offset: new Cesium.HeadingPitchRange(houstonDowntownMainBuildingHeading, houstonDowntownMainBuildingPitch, houstonDowntownMainBuildingRange),
//         duration: 10.0,
//         easingFunction: Cesium.EasingFunction.LINEAR_NONE,
//         destination: initialPosition,
//         orientation: initialOrientation,
//         //endTransform: Cesium.Matrix4.IDENTITY
//        });
//        //camera.zoomIn(100000000);
//       })//.then(function() {
//         //Once the camera has finished transitioning to the linear view, update the camera orientation for a better view
//   // viewer.camera.flyTo({
//   //       destination: initialPosition,
//   //       orientation: initialOrientation,
//   //       duration: 10.0,
//   //       easingFunction: Cesium.EasingFunction.LINEAR_NONE
//   //   })
//   //     });
//     // Promise.resolve(viewer.camera.flyTo({
//     //   destination: Cesium.Rectangle.fromDegrees(-107.0, 25.0, -93.0, 37.0),
//     //   duration: 3.0,
//     //   easingFunction: Cesium.EasingFunction.LINEAR_NONE
//     // })).then(function() {
//     //   // Once the camera has finished flying to Texas, zoom in to the Houston downtown main building
//     //   var houstonDowntownMainBuildingPosition = Cesium.Cartesian3.fromDegrees(-95.3698, 29.7604, 0.0);
//     //   var houstonDowntownMainBuildingHeading = Cesium.Math.toRadians(180.0);
//     //   var houstonDowntownMainBuildingPitch = Cesium.Math.toRadians(-25.0);
//     //   var houstonDowntownMainBuildingRange = 950.0;
//     //   var houstonDowntownMainBuildingOrientation = {
//     //     heading: houstonDowntownMainBuildingHeading,
//     //     pitch: houstonDowntownMainBuildingPitch,
//     //     roll: 0.0
//     //   };
      
//     //   viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(houstonDowntownMainBuildingPosition, houstonDowntownMainBuildingRange), {
//     //     offset: new Cesium.HeadingPitchRange(houstonDowntownMainBuildingHeading, houstonDowntownMainBuildingPitch, houstonDowntownMainBuildingRange),
//     //     duration: 3.0,
//     //     easingFunction: Cesium.EasingFunction.LINEAR_NONE,
//     //     orientation: houstonDowntownMainBuildingOrientation
//     //   });
//     // });
//     //.then(function (){
//     //   viewer.camera.flyTo({
//     //     destination: Cesium.Cartesian3.fromDegrees(-95.3698, 29.7604, 2000.0),
//     //     orientation: {
//     //       heading: Cesium.Math.toRadians(180.0),
//     //       pitch: Cesium.Math.toRadians(-25.0),
//     //       roll: 0.0
//     //     },
//     //     duration: 3.0,
//     //     easingFunction: Cesium.EasingFunction.LINEAR_NONE
//     //   });
//     // });

//       // Once the camera has finished flying to Texas, zoom to Houston
//     // viewer.camera.flyTo({
//     //     destination: initialPosition,
//     //     orientation: initialOrientation,
//     //     duration: 3.0,
//     //     easingFunction: Cesium.EasingFunction.LINEAR_NONE
//     // });

//   // var texas = Cesium.Rectangle.fromDegrees(-106.6, 25.8, -93.5, 36.5);
//   // var houston = Cesium.Cartesian3.fromDegrees(-95.3698, 29.7604, 5000.0); // longitude, latitude, height
  
//   // // Set the camera to look at Texas
//   // viewer.camera.flyTo({
//   //     destination: texas,
//   //     orientation: {
//   //         heading: Cesium.Math.toRadians(0.0), // North
//   //         pitch: Cesium.Math.toRadians(-30.0), // Downward
//   //         roll: Cesium.Math.toRadians(0.0) // Level
//   //     },
//   //     duration: 5.0 // animation duration in seconds
//   // }).then(function() {
//   //     // Once the Texas flyTo animation is complete, fly to Houston downtown
//   //     viewer.camera.flyTo({
//   //         destination: houston,
//   //         orientation: {
//   //             heading: Cesium.Math.toRadians(10.0), // Slightly to the right
//   //             pitch: Cesium.Math.toRadians(-60.0), // More downward
//   //             roll: Cesium.Math.toRadians(0.0) // Level
//   //         },
//   //         duration: 3.0 // animation duration in seconds
//   //     });
//   // });
// // Fly to North America
// //let viewer = new Cesium.Viewer('cesiumContainer');
// // us_object = {
// //   destination: Cesium.Rectangle.fromDegrees(-140.0, 10.0, -50.0, 70.0),
// //   duration: 5.0
// //  }

// // texas_object = {
// //   destination: Cesium.Rectangle.fromDegrees(-106.6, 25.8, -93.5, 36.5),
// //   orientation: {
// //       heading: Cesium.Math.toRadians(0.0), // North
// //       pitch: Cesium.Math.toRadians(-30.0), // Downward
// //       roll: Cesium.Math.toRadians(0.0) // Level
// //   },
// //   duration: 2.0
// // }

// // houston_object = {
// //   destination: Cesium.Cartesian3.fromDegrees(-95.3698, 29.7604, 950.0), // longitude, latitude, height
// //   orientation: {
// //       heading: Cesium.Math.toRadians(10.0), // Slightly to the right
// //       pitch: Cesium.Math.toRadians(-60.0), // More downward
// //       roll: Cesium.Math.toRadians(0.0) // Level
// //   },
// //   duration: 1.0
// // }

// // viewer.camera.setView({
// //   destination: Cesium.Cartesian3.fromDegrees(-75.0, 45.0, 15000000.0),
// //   orientation: {
// //       heading: Cesium.Math.toRadians(180.0),
// //       pitch: Cesium.Math.toRadians(0.0),
// //       roll: Cesium.Math.toRadians(0.0)
// //   }
// // });

// // // Rotate the globe to North America
// // viewer.camera.flyTo({
// //   destination: Cesium.Cartesian3.fromDegrees(-98.0, 38.0, 3000000.0),
// //   orientation: {
// //       heading: Cesium.Math.toRadians(0.0),
// //       pitch: Cesium.Math.toRadians(-20.0),
// //       roll: Cesium.Math.toRadians(0.0)
// //   },
// //   duration: 5 // Duration of the camera animation in seconds
// // });

// // {
// //   destination: Cesium.Rectangle.fromDegrees(-140.0, 10.0, -50.0, 70.0),
// //   duration: 10.0
// //   }

// // viewer.camera.setView({
// //   destination: Cesium.Cartesian3.fromDegrees(-75.0, 45.0, 15000000.0),
// //   orientation: {
// //       heading: Cesium.Math.toRadians(180.0),
// //       pitch: Cesium.Math.toRadians(0.0),
// //       roll: Cesium.Math.toRadians(0.0)
// //   }
// // });

// // Promise.resolve(viewer.camera.flyTo({
// //   destination: Cesium.Cartesian3.fromDegrees(-98.0, 38.0, 3000000.0),
// //   orientation: {
// //       heading: Cesium.Math.toRadians(0.0),
// //       pitch: Cesium.Math.toRadians(-20.0),
// //       roll: Cesium.Math.toRadians(0.0)
// //   },
// //   duration: 5 // Duration of the camera animation in seconds
// // }));//.then(function() {
// //   // Fly to Houston
// //   viewer.camera.flyTo({
// //       destination: Cesium.Cartesian3.fromDegrees( -95.3676974, 29.7604267, 10000.0),
// //       orientation: Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0916951918898415),
// //       duration: 3 // Duration of the camera animation in seconds
// //   });
// // }));
  
//   // var target = Cesium.Cartesian3.fromDegrees(-95.3698, 29.7604, 950);
//   // Set the camera to look at the target location
//   // viewer.camera.flyTo({
//   //   destination: target,
//   //   orientation : initialOrientation,
//   //   duration: 3 // animation duration in seconds
//   // });
//   // viewer.camera.flyTo({
//   //   destination: initialPosition,
//   //   orientation : initialOrientation,
//   //   duration: 3,
//   // });


// // // var initialPosition = Cesium.Cartesian3.fromDegrees(-95.364808777523, 29.736084676987729, 953);
// // viewer.scene.camera.setView({
// //   destination: initialPosition,
// //   orientation: initialOrientation,
// //   endTransform: Cesium.Matrix4.IDENTITY
// // });

// // var tileset = new Cesium.Cesium3DTileset({
// //   url: Cesium.IonResource.fromAssetId(16947),
// // });

// // tileset.style = new Cesium.Cesium3DTileStyle({
// //   color: {
// //     conditions: [
// //       ["true", "color('red')"],
// //     ],
// //   },
// // });

// // viewer.scene.primitives.add(tileset)

// // var tileset = viewer.scene.primitives.add(
// //   new Cesium.Cesium3DTileset({
// //     url: Cesium.IonResource.fromAssetId(16947),
// //   })
// // );


// // var tileset = viewer.scene.primitives.add(
// //   new Cesium.Cesium3DTileset({
// //     url: Cesium.IonResource.fromAssetId(36440)
// //   })
// // );

// var tileset  = new Cesium.Cesium3DTileset({
//   url: Cesium.IonResource.fromAssetId(96188)
// });

// tileset.style = new Cesium.Cesium3DTileStyle({
//     color: {
//       conditions: [
//         // ["${building} === 'tower'", "color('yellow')"],
//         // ["${building} === 'office'", "color('dodgeblue')"],
//         // ["${building} === 'garage'", "color('cornflowerblue')"],
//         // ["${building} === 'hospital'", "color('forestgreen')"],
//         // ["${building} === 'apartments'", "color('darkgoldenrod')"],
//         // ["${building} === 'stadium'", "color('skyblue')"],
//         // ["${building} === 'commercial'", "color('blue', 0.9)"],
//         ["true", "color('white', 1)"],
//       ],
//     },
// });

// viewer.scene.primitives.add(tileset);



// // var tileset = viewer.scene.primitives.add(
// //   new Cesium.Cesium3DTileset({
// //     url: Cesium.IonResource.fromAssetId(96188)
// //   })
// // );
// // //replot on mean-sea level
// // var tileset = viewer.scene.primitives.add(
// //   new Cesium.Cesium3DTileset({
// //     url: Cesium.IonResource.fromAssetId(706934),
// //     maximumScreenSpaceError: 1,
// //     maximumMemoryUsage: 16384
// //   })
// // );
// // //replot on mean-sea level
// // var tileset = viewer.scene.primitives.add(
// //   new Cesium.Cesium3DTileset({
// //     url: Cesium.IonResource.fromAssetId(706970),
// //     maximumScreenSpaceError: 1,
// //     maximumMemoryUsage: 16384
// //   })
// // );




// viewer.scene.globe.maximumScreenSpaceError = 16;
// viewer.clock.shouldAnimate = false;
// viewer.clock.multiplier = 1500.0;
// viewer.timeline.addEventListener('settime', onTimelineScrubfunction, false);
// viewer.animation.viewModel.dateFormatter = localeDateTimeFormatter
// viewer.animation.viewModel.timeFormatter = localeTimeFormatter
// viewer.timeline.makeLabel = function (time) { return localeDateTimeFormatter(time) }
// }
function initializes_settings(){
  viewer.clock.onTick.removeEventListener(applyGlobeSpin);
  //viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.depthTestAgainstTerrain = false;
  viewer.scene.logarithmicDepthBuffer = false;
  var initialPosition = Cesium.Cartesian3.fromDegrees(-95.38198382732189,29.726144216291395, 1500);
  // var initialPosition = Cesium.Cartesian3.fromDegrees(-95.364808777523, 29.736084676987729, 953);
  var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
  Promise.resolve(viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(-130.0, 20.0, -65.0, 155.0),
    duration: 5.0,
    easingFunction: Cesium.EasingFunction.LINEAR_NONE
  })).then(function() {
    //Once the camera has finished flying to North America, zoom to Texas
    viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(-107.0, 25.0, -93.0, 37.0),
      duration: 5.0,
      easingFunction: Cesium.EasingFunction.LINEAR_NONE
    })}).then(function() {
            viewer.camera.flyTo({
              destination: initialPosition,
              orientation: initialOrientation,
              endTransform: Cesium.Matrix4.IDENTITY,
              duration: 5.0
            });
            // camera.zoomOut(9000000000);
      })

// var tileset = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(16947),
//   })
// );

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

var tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(96188)
  })
);
//replot on mean-sea level
var tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(706934),
    maximumScreenSpaceError: 1,
    maximumMemoryUsage: 16384
  })
);
//replot on mean-sea level
var tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(706970),
    maximumScreenSpaceError: 1,
    maximumMemoryUsage: 16384
  })
);


viewer.scene.globe.maximumScreenSpaceError = 16;
viewer.clock.shouldAnimate = false;
viewer.clock.multiplier = 1500.0;
viewer.timeline.addEventListener('settime', onTimelineScrubfunction, false);
viewer.animation.viewModel.dateFormatter = localeDateTimeFormatter
viewer.animation.viewModel.timeFormatter = localeTimeFormatter
viewer.timeline.makeLabel = function (time) { return localeDateTimeFormatter(time) }

}


var object_indicator;
var url = Cesium.buildModuleUrl('exclaimation.png');
var vulnerable_objects_entity = []
var myVar = '';

function getAddr(latitude, longtitude) {
  console.log(latitude)
 console.log(longtitude)
   $.ajax({
     url: 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?token=AAPK0739d35a69e14dd292c08f016aa3bc312KJV1eOL4IMAsfNIN-rNSSr8DyHFliqv1ojNR9J-LzKmExHMPQQ0YrzEgZ3_Wnyz',
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
   console.log(myVar)

  return myVar;
}

function processLocalizedResults() {
  console.log("Process Localized Results function called!!!");
  console.log(vulnerable_objects);
  let objects = vulnerable_objects['objects'];
  vulnerable_objects = objects;
  console.log('objects length : '+ objects.length);
  // var pinBuilder = new Cesium.PinBuilder();
  // var url = Cesium.buildModuleUrl('exclaimation.png');
  for (let [index,object] of objects.entries()) {
    // if(index == object['cluster_id']){
    //   console.log("index is same as cluster_id")
    // }
    // else{
    //   console.log("index is not same as cluster id")
    // }
    console.log('vulnarable objects list : ' + object['cluster_id']);
    let entity = new Cesium.Entity();
    entity.position = Cesium.Cartesian3.fromDegrees(object['cluster_longitude'], object['cluster_latitude'], 35);
    if(index == object['cluster_id']){
      console.log("index and object are same")
      entity.name = object['cluster_id'];
    }else{
      console.log("index and object are not same!!!!!")
      entity.name = index;
    }

    let cluster_obj = object['cluster_objects'];

    entity.billboard = new Cesium.BillboardGraphics();


    entity.billboard.image = pinBuilder.fromUrl(url, Cesium.Color.BLACK, 48);
    entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    //viewer.scene.requestRender();
    vulnerable_objects_entity.push(entity);
    console.log('entity-details ' + entity.name);
    let updated=viewer.entities.add(entity);

  }
  console.log('vulnerable_objects_entities ' + vulnerable_objects_entity.length);
};

var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (click) {
  var pick = viewer.scene.pick(click.position);
  //console.log('pick_position'+ pick.id);
  if (pick && pick.id && (typeof pick.id._name == 'number')) {
    console.log("pick.id._name " + pick.id._name);
    //console.log('vulnerable_objects_list ' + vulnerable_objects);
    //console.log('vulnerable_objects.pick.id._name ' + vulnerable_objects[pick.id._name]);
    let name = vulnerable_objects[parseInt(pick.id._name)]['cluster_id'];
    //console.log('name ' + name);
    let cluster_obj = vulnerable_objects[parseInt(pick.id._name)]['cluster_objects'];
    //console.log('cluster_obj ' + cluster_obj);
    let image_url = cluster_obj[0]['image'];
    //console.log('image_url ' + image_url);
    let image_date = cluster_obj[0]['createdDate'];
    //console.log('image_date ' + image_date);
    let object_type = cluster_obj[0]['classification'];
    //console.log('object_type ' + object_type);
    let lat = vulnerable_objects[parseInt(pick.id._name)]['cluster_latitude'];
    //console.log('latitude ' + lat);
    let lon = vulnerable_objects[parseInt(pick.id._name)]['cluster_longitude'];
    //console.log('longitude ' + lon);
    let nearest_target = vulnerable_objects[parseInt(pick.id._name)]['nearest_pole']
    //console.log('nearest_traget ' + nearest_target);
    let result=getAddr(lon, lat);
    //console.log(result)
    //console.log(nearest_target);
    //console.log('check-here ' + vulnerable_objects_entity[parseInt(pick.id._name)]);
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
        font-size: 2px;\
        padding: 1px 1px;\
        margin-right: 1px;\
        color: #edffff;\
        z-index: 999;\
        top:20%;\
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
    <br style = "line-height:8;"><br>\
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
        <th>'+ result['address']['Match_addr']+ '</th>\
      </tr>\
      <tr>\
        <td>Analysis Results</td>\
      </tr>\
    </table>\
    <img data-object-id='+ parseInt(pick.id._name) + ' class="rotate90" src=' + image_url + ' >\
    <br style = "line-height:10;"><br>\
  ';
    //console.log(vulnerable_objects_entity[parseInt(pick.id._name)].description._value);
    object_indicator = pick.id._name;
    initial_pole = nearest_target;
    let near_track = 0;

    // for (let pole of poles_data.entities.values) {
    //   console.log(pole)
    //   console.log(pole.model)
    //   pole.model.silhouetteSize = 0.0;
    // }
    //let entity = poles_data.entities.values[nearest_target - 1];
    //console.log(poles_data.entities.values._value);
    //console.log(entity)
    //entity.model.silhouetteColor = Cesium.Color.WHITE;
    //entity.model.silhouetteSize = 1.5;
  }

}, Cesium.ScreenSpaceEventType.LEFT_DOWN);


var CheckPowerI = document.getElementById('y');
var power4 = Cesium.GeoJsonDataSource.load('powerSub.geojson');
var power5 = Cesium.GeoJsonDataSource.load('wire.geojson');
var poles_data = new Cesium.CustomDataSource();
var pinBuilder = new Cesium.PinBuilder();
var res = new Cesium.JulianDate();
var pole_longs = []
var pole_lats = []
var pole_tmp=[]

function compare_qty(a, b){
  // a should come before b in the sorted order
  if(a.manual_id < b.manual_id){
          return -1;
  // a should come after b in the sorted order
  }else if(a.manual_id > b.manual_id){
          return 1;
  // a and b are the same
  }else{
          return 0;
  }
}



function processPoles() {
  console.log('In Process poles!');
  let objects = poles['data'];
  let objects_tmp = poles['data'];
  let objects_angle = objects_tmp.filter(function(x){ return x.angle >= 20});

  // for(let object_angle of objects_angle){
  //   console.log("objects_angle is " + object_angle.angle);
  // }

  for (let object of objects_angle) {
    let entity = new Cesium.Entity();
    entity.position = Cesium.Cartesian3.fromDegrees(object['longitude'], object['latitude'], 50);
    entity.description=false;
    //entity.description=''
    entity.billboard = new Cesium.BillboardGraphics();
    entity.billboard.image = pinBuilder.fromUrl(url,Cesium.Color.DARKRED, 48);
    //entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    poles_data.entities.add(entity);

  }

  // for(let j=0;j<10;j++){
  //   console.log(poles_data.entities.values[j].description.value);
  // }

  for (let object of objects) {
    let entity = new Cesium.Entity();

  entity.position = Cesium.Cartesian3.fromDegrees(object['longitude'], object['latitude'], 0);


  var heading = 0;
  var pitch = Cesium.Math.toRadians(object['angle']);
  var roll = 0;
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(
    Cesium.Cartesian3.fromDegrees(object['longitude'], object['latitude'], 0),
    hpr
  );
  entity.orientation=orientation;
    entity.name = object['manual_id']; //object['id'];
    let manual_id = object['manual_id'];
    let age=object['age']
    let angle=object['angle']
    let update_angle=object['updated_angle']
    
    if (update_angle != undefined){
         angle=update_angle
         console.log(angle)
     }
    let lat=object['latitude']
    let lon=object['longitude']
    let id=object['id']
    entity.billboard = undefined;
    entity.model = new Cesium.ModelGraphics({
      uri: 'Utilitypole_3Dmodel.glb',
      scale: 0.2,
      color: Cesium.Color.GREEN,
      silhouetteColor: Cesium.Color.WHITE,
      silhouetteSize: 0.0,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    });
    entity.addProperty("manual_id")
    entity.manual_id = manual_id;
    //entity.model.silhouetteColor = Cesium.Color.WHITE;
    //entity.model.silhouetteSize = 0.0;
    
    entity.description='  <style>\
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
     <h2 style="text-align:center;">Information about one utility pole</h2>\
    <table class="cesium-infoBox-defaultTable">\
      <tr>\
        <td>Object id</td>\
        <td>'+ entity.manual_id + '</td>\
      </tr>\
      <tr>\
        <td>Age</td>\
        <td>'+ age + '</td>\
      </tr>\
      <tr>\
        <td>Angle</td>\
        <td>'+angle+ '</td>\
      </tr>\
       <tr>\
        <td>Coordinate</td>\
        <th>'+ lat + '   ' + lon + '</th>\
      </tr>\
       <tr>\
        <td>ID</td>\
        <th>'+ id +'</th>\
      </tr>\
    </table>\
    <br style = "line-height:8;"><br>\
    '
    let obj = {};
    obj["lat"] = parseFloat(object['latitude'])
    obj["long"] = parseFloat(object['longitude'])
    obj["manual_id"] = object['manual_id'];
    pole_tmp.push(obj);
    pole_longs.push(parseFloat(object['longitude']))
    pole_lats.push(parseFloat(object['latitude']))
    poles_data.entities.add(entity);
    //console.log(poles_data.entities.values);
  }

  // for(let i=0; i<10;i++){
  //   //console.log(poles_data.entities.values[i].model.color);
  // }

poles_data.entities.values.sort(compare_qty)
pole_tmp.sort(compare_qty)


  let wood_arr=new Array(62);
  for(let i=426;i<487;i++)
      wood_arr[i]=i;
  let wood_set=new Set(wood_arr)
//  console.log(wood_set);

  for(let x=427;x<poles_data.entities.values.length;x++)
  {

    poles_data.entities.values[x].model.color = Cesium.Color.BURLYWOOD;
  }


  console.log('poles_data is as follows'+ poles_data.entities.values[427].model.color);


};

console.log("poles data is as follows : " + poles_data)

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
    entity.polygon.material = Cesium.Color.YELLOW;
    entity.polygon.outline = false;
    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

  }
});


Promise.resolve(power4).then(function (dataSource) {
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
    //console.log(entity.polyline.positions)
    entity.billboard = undefined;
    entity.polylineVolume = new Cesium.PolylineVolumeGraphics({

positions: entity.polyline.positions,

shape: [

new Cesium.Cartesian2( 0.2, 0.1),

new Cesium.Cartesian2( 0.2, 0.0),

new Cesium.Cartesian2(-0.2, 0.1),

new Cesium.Cartesian2(-0.2, 0.0)

],

material: Cesium.Color.YELLOW

});

entity.polyline.material = Cesium.Color.YELLOW;
entity.polylineVolume.material = Cesium.Color.YELLOW;
entity.polylineVolume.clampToGround = true;
   // entity.polyline.material = Cesium.Material.fromType('Color'); 
   // entity.polyline.material.uniforms.color =Cesium.Color.LIGHTGOLDENRODYELLOW;// new Cesium.Material(Cesium.Color.YELLOW);
  }
});

Promise.resolve(power5).then(function (dataSource) {
  CheckPowerI.addEventListener('change', function () {
    if (CheckPowerI.checked) {
      viewer.dataSources.add(dataSource);
    } else {
      viewer.dataSources.remove(dataSource);
    }
  });
});

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


var myPos = { my: "center center", at: "center-390 center", of: window };
var myPos_right = { my: "center center", at: "center+370 center", of: window };
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
    url: 'https://function.digitaltwincities.info/analysis/networkanalysis',
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

  console.log("Number of damaged poles : " + damaged_poles.size);

  console.log("poles_data length : " + poles_data.entities.values.length);

  console.log(poles_data.entities.values);

  console.dir("--------------check here--------- : " + poles_data.entities.values[426].values);

  for (let x = 0; x < poles_data.entities.values.length; x++) {
    console.log("x value is : "+ x);  
    if (wood_set.has(x)) {
      poles_data.entities.values[x].model.color = Cesium.Color.BURLYWOOD;
    //poles_data.entities.values[x].model.scale=
    }else{
      //poles_data.entities.values[x].model.color = Cesium.Color.GREEN;
    }

    if (damaged_poles.has(x+1)) {
      //poles_data.entities.values[x].model.color = Cesium.Color.RED;
      temp_longs.push(pole_tmp[x].long)
      temp_lats.push(pole_tmp[x].lat)

    }
  }


  for (let i = 0; i < temp_lats.length; i++) {

    temp_poles.push({ x: temp_longs[i], y: temp_lats[i], value: Math.floor(Math.random() * 89) + 1   })

  }

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
  maxOpacity: .5,
  minOpacity: 0,
  blur: .75,
  gradient: {
    // enter n keys between 0 and 1 here
    // for gradient color customization
    '.2': 'blue',
    '.4': 'green',
    '.8': 'yellow',
    '.9': 'red'
  }
}
  ,{
    enabled: true,  
    min: 6375000,   
    max: 10000000,  
    maxRadius:  45,
    minRadius:  10
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
  //console.log(value)
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
      url: 'https://function.digitaltwincities.info/analysis/networkanalysis',
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
      for(let i=427;i<487;i++)
        wood_arr[i]=i;
    let wood_set=new Set(wood_arr)
 
  
  for (let x = 0; x < poles_data.entities.values.length; x++) {

    if (wood_set.has(x+1)) {
      poles_data.entities.values[x].model.color = Cesium.Color.BURLYWOOD;
    }else{
      //poles_data.entities.values[x].model.color = Cesium.Color.GREEN;
    }


    if (damaged_poles.has(x + 1)) {
      //poles_data.entities.values[x].model.color = Cesium.Color.RED;
      tmp_longs.push(pole_tmp[x].long)
      tmp_lats.push(pole_tmp[x].lat)

    }
  }


  for (let i = 0; i < tmp_lats.length; i++) {

    tmp_poles.push({ x: tmp_longs[i], y: tmp_lats[i], value: Math.floor(Math.random() * 89) + 1   })

  }
  //console.log(tmp_poles)
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
       radius: 10,
  maxOpacity: .4,
  minOpacity: 0,
  blur: .75,
  gradient: {
    // enter n keys between 0 and 1 here
    // for gradient color customization
    '.2': 'blue',
    '.4': 'green',
    '.8': 'yellow',
    '.9': 'red'
  }
}
  ,{
    enabled: true,  
    min: 6375000,   
    max: 10000000,  
    maxRadius:  45,
    minRadius:  10,
  }
    
  )



}


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
 // console.log("img_dialog called")
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
var weather_harvey;
var weather_allison;
var weather_rita;
var weather_ike;
var event_indicator;
$('.dropdown-menu a').click(function () {
  let t = $(this).text();
  // $('button[data-toggle="dropdown"]').html('<i class="fas fa-wind"></i>' +
  //   '<br /><span>' + t + '</span>');
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
