# NetVis

## Academic Research Network Visualization

A tool to visualize networked data, focus on the relationship between faculty members, departments, and research topics.
Developed in Javascript, PHP and MySQL, with AngularJS and [D3](https://d3js.org/).

## Features

### Dataset

The “Tags” menu displays the dataset in three categories: Researchers, Interests, and Departments. It is possible to search for data by name. The visualization is populated as the user selects and deselects tags. The nodes represent tags (Researchers, Departments, and Interests), and the lines the connection between them. More details and functionalities are available in the ‘Help’ section of the visualization.

### Add / Import Data

Data can be added and edited manually by clicking on the “+” button.
It is also possible to import a dataset in two formats (JSON or CSV).

#### JSON

Schema:

    [   
        {
            "name": "String: required",
            "type": "String: required ['Researcher' | 'Department' | 'Interest']",
            "firstName": "String: optional",
            "lastName": "String: optional",
            "website": "String: optional",
            "edges": Array: optional
                [
                    {
                        "type": "String: required",
                        "name": "String: required"
                    }
                ]
        }
    ]

#### CSV

**Nodes only schema:**

    name,type,firstName,lastName,website

- Only “name” and “type” are required. All the other fields can be empty.
- "type" should be one of the following: 'Researcher', 'Department', or ‘Interest.

**Edges only schema:**

    source,target,sourceType,targetType

- All fields required. ‘source’ and ‘target’ correspond to the name of a node.
- The ‘sourceType’ and ‘targetType’ should be one of the following: 'Researcher', 'Department', or ‘Interest.
- Nodes are automatically created using the ‘source’ and ‘target’ fields.

### Export

Export the data or graphic from the on-screen visualization.  

#### Data

CSV and JSON: Both options contain the nodes (researchers, interests, and departments) and their relationship to other nodes.

#### Graphs

**PNG**
The PNG option generates a raster file with a transparent background. All the nodes and links currently present in the visualization.

**SVG**
The SVG option generates a vector-based file that can be opened in the browser or any vector-based image editor.

### Layout

The layout menu in the side panel provides additional customization options, which includes:  

- Network and cluster view;   Adjusting how nodes react to each other through gravity, charge, distance, and collision detection;
- Changing the weight, size, and colour of nodes (colour coding can be applied by type of tags or by cluster communities);
- the latter is calculated by an algorithm that finds similar clusters based on the number of shared connections);
- Changing title and network link size and color.

## Install

1. Check the server requirements
2. Set up a database
3. Upload the files
4. Setup the app

### Server

This app requires a web server with
**PHP 7.0** (or higher) and **MySQL**

### Database

On your web host server, create a database for this app and define a user (and password) for this database.  

### Upload the Files

Copy the files in the “dist” folder of this repository to a folder on the server.

### Setup

On the browser, navigate to the folder you put the files. *e.g.*, www.your-server-url.com/netvis/index.php
The app guides you through a step-by-step installation on the first time you run it. Follow the instructions.

#### Email Provider - SendGrid

Though SendGrid is not required for the app to work, it is highly recommended to have it installed. This app uses SendGrid to send invites for new users and password resets. SendGrid is free for up to 100 emails per day. Create an account and user your API during the installation process to hook the service. You can also set up this later through the settings panel.

## For Development

If you want to modify the code, customize, or develop further.
Assuming you are installing on a local machine.

1. Check the server requirements
2. Setup a database
3. Clone this repository and install the dependencies
4. Set up the app
5. Run

### Dev Server

This app requires a web server with
**PHP 7.0** (or higher) and **MySQL**

If you are on a Mac, I suggest using [MAMP](https://www.mamp.info/en/)

The development environment requires:

[**NodeJS**](https://nodejs.org/en/)

**NPM** (Comes with NodeJS)

### Dev Database

On your web host server, create a database for this app and define a user (and password) for this database.

### Install Dependencies

Clone this repository
Install dependencies `npm install`

### Development

Use the following to develop each module of this project

[main app]

`npm run watch`

[invite/reset email]

`npm run watchReset`

[install process]

`npm run watchInstall`

The app is accessible through your localhost in the ‘public’ folder of this project.

### Production

Use the following to compile files for production:

[main app]

`npm run production`

 [invite/reset email]

`npm run productionReset`

[install process]

`npm run productionInstall`

The files are available in the ‘dist’ folder of this project.

### Setup the App

On the browser, navigate to the folder you put the files on your localhost *e.g.*, projects/netvis/index.php
The app guides you through a step-by-step installation on the first time you run it. Follow the instructions.
The installation process creates an environment variable file (config/.env) to store the database credentials.
