# NetVis - Network Visualization Visualization Tool

Developed in Javascript, NodeJS and MongoDB, with AngularJS and [D3](https://d3js.org/).

Originally developed as a tool to visualize networked data, focus on the relationship between faculty members, departments, and research topics, commissioned by [Kule Institute for Advanced Study(KIAS)](https://www.ualberta.ca/kule-institute/index.html) at the University of Alberta.

**The description fits the example, but this tool can be generalized to render any type of network connection.**

## Features

### Dataset

The “Tags” menu displays the dataset in three categories: Researchers, Interests, and Departments. It is possible to search for data by name. The visualization is populated as the user selects and deselects tags. The nodes represent tags (Researchers, Departments, and Interests), and the lines the connection between them. More details and functionalities are available in the ‘Help’ section of the visualization.

### Add / Import Data

Data can be added and edited manually by clicking on the “+” button.
It is also possible to import a dataset in two formats (JSON or CSV).

#### JSON

```jsonn
[{
  "name": "name",
  "type": "Researcher",
  "firstName": "FirstName",
  "lastName": "lastName",
  "website": "www.website.com",
  "relations":
    [{
      "type": Department",
      "name": "Name"
    }]
}]
```

Name - Required : String
Type - Required : String. One of the following: 'Researcher', 'Department', 'Interest'
firstName - Optional : String
lastName - Optional : String
website - Optional : String
relations - Optional : Array. Collection of Objects with 'type' and 'name' properties.

#### CSV

**Nodes only schema:**
`name,type,firstName,lastName,website`

- Only “name” and “type” are required. All the other fields can be empty.
- "type" should be one of the following: 'Researcher', 'Department', or ‘Interest.

**Edges only schema:**
`source,target,sourceType,targetType`

- All fields required. ‘source’ and ‘target’ correspond to the name of a node.
- The ‘sourceType’ and ‘targetType’ should be one of the following: 'Researcher', 'Department', or ‘Interest.
- Nodes are automatically created using the ‘source’ and ‘target’ fields.

### Export

Export the data or graphic from the on-screen visualization.

#### Data

**CSV** and **JSON**: Both options contain the nodes (researchers, interests, and departments) and their relationship to other nodes.

#### Graphs

**PNG**: Generates a raster file with a transparent background. All the nodes and links currently present in the visualization.

**SVG**: Generates a vector-based file that can be opened in the browser or any vector-based image editor.

### Layout

The layout menu in the side panel provides additional customization options, which includes:

- Network and cluster view; Adjusting how nodes react to each other through gravity, charge, distance, and collision detection;
- Changing the weight, size, and colour of nodes (colour coding can be applied by type of tags or by cluster communities);
- the latter is calculated by an algorithm that finds similar clusters based on the number of shared connections);
- Changing the title and the network link size and colour.

## Install

There are two ways to install:

1. Using Docker and Docker-Compose
2. Pulling this repo and setup the environment yourself

## Using Docker

This is the easiest way to install. Files related to Docker are in the Docker folder.

The basics, clone this repository, modify the config files, and run docker-compose to pull the DockerHub images and deploy Netvis and MongoDB.

Clone this repo: `https://github.com/lucaju/netvisjs.git`

**_When you have evyrthing setup run_**
`docker-compose -f ./docker/docker-compose.yml up -d`

### Requirements

**Docker & Docker Compose**  
Follow these tutorials:

- [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04)
- [https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04](https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04)

### MongoDB

```yml
mongo:
  container_name: mongo
  restart: unless-stopped
  image: mongo
  env_file: ./volumes/mongodb/config/mongodb.env
  volumes:
    - ./volumes/mongodb/data/db:/data/db
  ports:
    - "27017:27017"
  networks:
    - netvis
```

#### Environment Variables

It is important to keep your database secured.
**mongodb.env** holds the username and password to access MongoDB.
The config file is located in the folder `/docker/mongodb/config`
Rename `mongodb.example.env` to `mongodb.env` and setup the username and password:

```text
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=root
```

#### Volume

To keep MongoDB persistent and accessible even after the container is tear down.
`- ./volumes/mongodb/data/db:/data/db` The data will be sync between the container and the host machine on these two folders, respectively.

#### Ports

This is the port from where MongoDB will be available (usually 27017). If this setup conflicts with your environment, you can change the left side (your machine) to another port, for instance, 27019. This means that the port 27019 in your machine will match port 27017 in the container.

#### External Access

You can use [MongoDB Compass](https://www.mongodb.com/products/compass) to access MongoDB. The connection string will look like this:

```string
mongodb://${MONGO_INITDB_ROOT_USERNAME}:
${MONGO_INITDB_ROOT_USERNAME}@
${YOUR_SERVER_URL}:
${YOUR_SERVER_MONGODB_PORT}/
?authSource=admin
```

### Netvis

```yml
netvis:
  image: lucaju/netvis
  restart: unless-stopped
  volumes:
    - ./volumes/netvis/config/:/app/config/
  ports:
    - "80:3000"
  depends_on:
    - mongo
  networks:
    - netvis
```

#### Ports

This is the port from where Netvis will be available. Port 80 is the common port for the localhost HTTP services. So, in this case, Netvis will be available at `http://localhost`. You can change to another port if there is any conflict. For instance, you can change to `3000:3000` and access at `http://localhost:3000`.

#### Config File

You don't have easy access to the Netvis' config file when using Docker. This config file will sync and overwrites the default configurations.
Config files is localted in the folder `/docker/netvis/config`
Rename `config.example.json` to `config.json` and setup the username and passord:

```json
{
  "mongoDB": {
    "host": "mongo",
    "port": "27017",
    "rootUser": "root",
    "rootPWD": "root",
    "database": "netvis"
  },
  "user": {
    "firstName": "Admin",
    "lastName": "",
    "email": "your@email.com",
    "password": "Password"
  },
  "meta": {
    "title": "Netvis",
    "url": "http://your_server",
    "jwtSecret": "someSecret",
    "sendgripdAPI": ""
  }
}
```

**MongoDB is used to setup the connection to Netvis**
mongoDB.host - Reference to the container that hold MongoDB
mongoDB.port - usually 27017
mongoDB.rootUser - The same as defined in the MongoDB config
mongoDB.rootPWD - The same as defined in the MongoDB config
mongoDB.database - Default: netvis, but it can be anything.

**User data is used to create the first Admin user**
user.firstName - Default: Admin, but can be your name or anything else.
user.lastName - Default empty, but can be your last name or anything else.
user.email - Add your email. Used to manage, add and edit content.
user.password - Add a password. Need to be more than 7 characters and includes numbers and special characters.

**Meta is used to setup Netvis internal functions**
meta.title - Website's title
meta.url - Website's url
meta.jwtSecret - Used to encrypt users' passwords.
meta.sendgripdAPI - Use to send recover and reset emails.

#### Email Provider - SendGrid

This app uses [SendGrid](https://sendgrid.com/) to send invites for new users and password resets. SendGrid is free for up to 100 emails per day. Create an account and user your API during the installation process to hook the service.

### Deployment

- `docker-compose -f ./docker/docker-compose.yml up -d` will launch the containers
- `docker-compose -f ./docker/docker-compose.yml down` will stop the containers

### Traefik

From here you can configure a reverse proxy & Let's Encrypt with [Traefik](https://docs.traefik.io/). Learn more here: [https://www.digitalocean.com/community/tutorials/how-to-use-traefik-as-a-reverse-proxy-for-docker-containers-on-ubuntu-18-04](https://www.digitalocean.com/community/tutorials/how-to-use-traefik-as-a-reverse-proxy-for-docker-containers-on-ubuntu-18-04)

## Installing without Docker

The basics, clone this repository, modify the config files, and run docker-compose to pull the DockerHub images and deploy Netvis and MongoDB.

Clone this repo: `https://github.com/lucaju/netvisjs.git`

### Requirements

- NodeJS. Dowload here: [https://nodejs.org/en/](https://nodejs.org/en/)
- NPM (it comes with NodeJS)
- MongoDB. Follow this tutorial: [https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04)

### Config File

Config files is localted in the folder `/config`
Rename `config.example.json` to `config.json` and setup the username and passord:

```json
{
  "mongoDB": {
    "host": "localhost",
    "port": "27017",
    "rootUser": "",
    "rootPWD": "",
    "database": "netvis"
  },
  "user": {
    "firstName": "Admin",
    "lastName": "",
    "email": "your@email.com",
    "password": "Password"
  },
  "meta": {
    "title": "Netvis",
    "url": "http://your_server",
    "jwtSecret": "someSecret",
    "sendgripdAPI": ""
  }
}
```

**MongoDB is used to setup the connection to Netvis**
mongoDB.host - Usually localhost (or 127.0.0.1)
mongoDB.port - usually 27017
mongoDB.rootUser - Empty. Only define if your MongoBD setup requires credentials.
mongoDB.rootPWD - Empty. Only define if your MongoBD setup requires credentials.
mongoDB.database - Default: netvis, but it can be anything.

**User data is used to create the first Admin user**
user.firstName - Default: Admin, but can be your name or anything else.
user.lastName - Default empty, but can be your last name or anything else.
user.email - Add your email. Used to manage, add and edit content.
user.password - Add a password. Need to be more than 7 characters and includes numbers and special characters.

**Meta is used to setup Netvis internal functions**
meta.title - Website's title
meta.url - Website's url
meta.jwtSecret - Used to encrypt users' passwords.
meta.sendgripdAPI - Use to send recover and reset emails.

#### Email Provider - SendGrid

This app uses [SendGrid](https://sendgrid.com/) to send invites for new users and password resets. SendGrid is free for up to 100 emails per day. Create an account and user your API during the installation process to hook the service.

### Install dependencies

Run `npm install` to install all the dependencies for this project.

### Deployment

- Run `npm run build` to build with Webpack. Files will be available at `dist` folder.

- Run `npm start` to start ExpressJS server. Leave it running while using the app.

## For Development

Use the same setup described above for installation without Docker.

- Run `npm run build-dev-watch` to build with Webpack in development mode. Files will be available at `dist` folder and will update as you change the files on `src` folder. Leave it running while developing the app.

- Run `npm run dev-server` to start ExpressJS server in development mode. The server restarts itself when files on the `server` are updated. Leave it running while using the app.

- The app is accessible at `localhost:3000`

### Tests

Unit test using Jest. Run `npm run test` or `npm run test-watch`
Tests only cover files on the `server` folder.
**_Todo_**: Add frontend tests
