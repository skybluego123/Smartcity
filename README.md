# SmartCity - Houston HeatMap using [Cesium](https://cesiumjs.org/) with [Webpack](https://webpack.js.org/concepts/)

* Using webpack dev server for development deployment
* Using Docker for containerization
* Using aws for deployment 

## Running the application locally

	npm install
	npm start

Navigate to `localhost:8080`.

### Available scripts for running webpack

* `npm start` - Runs a webpack build with `webpack.config.js` and starts a development server
* `npm run build` - Runs a webpack build with `webpack.config.js`
* `npm run release` - Runs an optimized webpack build with `webpack.release.config.js`
* `npm run serve-release` - Runs an optimized webpack build with `webpack.release.config.js` and starts a development server

### Docker commands for [dockerizing a Node.js web app](https://nodejs.org/de/docs/guides/nodejs-docker-webapp/)

	docker build -t smartcity .
	docker run -p 8081:8080 -d smart city
	docker ps
	docker logs <container id>
	docker exec -it <container id> /bin/bash
	docker inspect <container id>
	docker rm <container id>
	docker rmi <image id>

### [AWS Commands](https://medium.com/@xoor/deploying-a-node-js-app-to-aws-elastic-beanstalk-681fa88bac53) to create a new environment and application
* Create AWS and EB cli and add them to the environment path
* Create a new eb-deploy-user with group security profile of AWSElasticBeanStalkFullAccess
* `aws configure --profile eb-deploy-user`
* `eb init --profile eb-deploy-user`
* `eb create`
* `eb deploy` - Always push the latest code to git before eb deploy
	

