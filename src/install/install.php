<?php

// required headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// include database and utitlities files
require_once '../vendor/autoload.php';
require_once '../api/config/database.php';
require_once '../api/shared/utilities.php';


$data = json_decode(file_get_contents("php://input"));

if (!isset($data->database->name)
    || !isset($data->database->user)
    || !isset($data->database->password)
    || !isset($data->user->email)
    || !isset($data->user->password)
    || !isset($data->project->sendGridAPI)
) {
    http_response_code(400); //Bad request
    echo json_encode(array("message" => "Connection failed. Incomplete data."));
    die();
}
//time
$now = Utilities::getTimeNow();

// A. CREATE ENVIRONMENT VARIABLES 
try {
    if (!createEnv($now)) {
        throw new Exception("Failed to create Environment Variables");
    }
} catch (Exception $e) {
    http_response_code(501); //Internal Server Error
    echo json_encode(
        array(
            "message" => "Installation failed.",
            "error" => $exception->getMessage()
        )
    );
}

//B. SETUP DATABASE
try {

    $dotenv = Dotenv\Dotenv::create("../");
    $dotenv->load();
    
    // initiate Database
    $database = new Database();
    $db = $database->getConnection();

    // 1. CREATE META TABLE
    if (!createDBTableMeta($db)) {
        throw new Exception("Failed to create DB Meta Table");
    }

    // 2. ADD META DATA
    $metaData = addContentToDBTableMeta($db);
    if (!$metaData) {
        throw new Exception("Failed to add content to DB 'meta' Table");
    }
    
    // //3. CREATE USERS TABLE
    if (!createDBTableUsers($db)) {
        throw new Exception("Failed to create DB 'users' Table");
    }
    
    // //4. ADD USERS DATA
    if (!addContentToDBTableUsers($db, $now)) {
        throw new Exception("Failed to add user to DB 'users' Table");
    }
    
    // //5. CREATE PASSWORD REQUEST TABLE
    if (!createDBTablePasswordRequest($db)) {
        throw new Exception("Failed to create DB 'password_request' Table");
    }
    
    // //6. CREATE NODES TABLE
    if (!createDBTableNodes($db)) {
        throw new Exception("Failed to create DB 'nodes' Table");
    }

    // //7. CREATE EDGES TABLE
    if (!createDBTableEdges($db)) {
        throw new Exception("Failed to create DB 'edges' Table");
    }
    
    //8. return OK
    http_response_code(200); //OK
    echo json_encode(
        array(
            "message" => "Instalation successful.",
            "metadata" => $metaData
        )
    );
    
} catch(PDOException $exception) {
    http_response_code(500); //Internal Server Error
    echo json_encode(
        array(
            "message" => "Installation failed.",
            "error" => $exception->getMessage()
        )
    );
}

function createEnv($now)
{
    global $data;

    // save Database info into an evironment file
    
    $envFile = '../.env';

    $info = "\n# DATABASE\n";
    $info .= "DATABASE_HOST=localhost\n";
    $info .= "DATABASE_NAME=" . $data->database->name . "\n";
    $info .= "DATABASE_USERNAME=" . $data->database->user . "\n";
    $info .= "DATABASE_PASSWORD=" . $data->database->password . "\n";

    $info .= "\n# SALT\n";
    $info .= "SALT='(z@V5X[P(!vY}knC$fxXR|1@>55J;3_o]9;zU$M W[T1#>#MN?5g2U#~X[*.Y.w}'\n";
    
    $save = file_put_contents($envFile, $info);

    if ($save === false) {
        return false;
    } else {
        return true;
    }

}

function createDBTableMeta($db)
{
    $query = "DROP TABLE IF EXISTS `meta`;
    CREATE TABLE `meta` (
      `attribute` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
      `value` varchar(200) CHARACTER SET utf8mb4 NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    
    
    ALTER TABLE `meta`
      ADD PRIMARY KEY (`attribute`),
      ADD UNIQUE KEY `attribute` (`attribute`);";

    $stmt = $db->prepare($query);
    
    return $stmt->execute();
}

function addContentToDBTableMeta($db)
{
    global $data;

    // //check if title
    if (isset($data->project->title)) {
        $projectTitle = $data->project->title;
    } else {
        $projectTitle = "Net Viz App";
    }

    //get current folder: the url where the app is located.
    $actual_link = "http://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
    $appRoot = str_ireplace("/install/install.php", "", $actual_link);
    
    // // sanitize
    $projectTitle = htmlspecialchars(strip_tags($projectTitle));
    $projectEmail = htmlspecialchars(strip_tags($data->user->email));
    $sendgridApi = $data->project->sendGridAPI;

    // //query
    $query = "INSERT INTO `meta` (`attribute`, `value`) VALUES
        ('project_title', '$projectTitle'),
        ('project_url', '$appRoot'),
        ('project_email', '$projectEmail'),
        ('sendgrid_api', '$sendgridApi');";
    
    $stmt = $db->prepare($query);

    // //execute   
    if ($stmt->execute()) {
        $metaData = array(
            "title" => $projectTitle,
            "url" => $appRoot,
            "email" => $projectEmail
        );
    
        return $metaData;
    }
    return false;
}

function createDBTableUsers($db)
{
    $query = "DROP TABLE IF EXISTS `users`;
        CREATE TABLE `users` (
        `id` int(10) UNSIGNED NOT NULL,
        `level` int(2) NOT NULL,
        `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
        `password` varbinary(255) NOT NULL,
        `first` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
        `last` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
        `created_at` datetime NOT NULL,
        `modified_at` datetime NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        
        ALTER TABLE `users`
        ADD PRIMARY KEY (`id`);
        
        ALTER TABLE `users`
        MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;";

    $stmt = $db->prepare($query);
    
    return $stmt->execute();
}

function addContentToDBTableUsers($db, $now)
{
    global $data;

    //set initial info
    $level = 0;
    $first = "";
    $last = "";

    $SALT = getenv('SALT');

    // query
    $query = "INSERT INTO `users`
            SET
                level = :level,
                email = :email,
                password = AES_ENCRYPT(:password, SHA1(:salt)),
                first = :first,
                last = :last,
                created_at = :created_at,
                modified_at = :modified_at";

    $stmt = $db->prepare($query);

    $stmt->bindParam(":level", $level);
    $stmt->bindParam(":email", $data->user->email);
    $stmt->bindParam(":password", $data->user->password);
    $stmt->bindParam(':salt', $SALT);
    $stmt->bindParam(":first", $first);
    $stmt->bindParam(":last", $last);
    $stmt->bindParam(":created_at", $now);
    $stmt->bindParam(":modified_at", $now);

    //execute
    return $stmt->execute();
}

function createDBTablePasswordRequest($db)
{
    $query = "DROP TABLE IF EXISTS `password_request`;
        CREATE TABLE `password_request` (
        `reqID` int(10) UNSIGNED NOT NULL,
        `userID` int(10) UNSIGNED NOT NULL,
        `created_at` datetime NOT NULL,
        `used` varchar(5) CHARACTER SET utf8 DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        
        ALTER TABLE `password_request`
        ADD PRIMARY KEY (`reqID`);
        
        ALTER TABLE `password_request`
        MODIFY `reqID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;";

    $stmt = $db->prepare($query);

    return $stmt->execute();
}

function createDBTableNodes($db)
{
    $query = "DROP TABLE IF EXISTS `nodes`;
    CREATE TABLE `nodes` (
      `id` int(10) UNSIGNED NOT NULL,
      `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
      `type` enum('Researcher','Interest','Department') COLLATE utf8mb4_unicode_ci NOT NULL,
      `first` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      `last` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
      `website` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      `created_at` datetime NOT NULL,
      `modified_at` datetime NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    
    ALTER TABLE `nodes`
      ADD PRIMARY KEY (`id`);
    
    ALTER TABLE `nodes`
      MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;";

    $stmt = $db->prepare($query);

    return $stmt->execute();
}

function createDBTableEdges($db)
{
    $query = "DROP TABLE IF EXISTS `edges`;
    CREATE TABLE `edges` (
      `id` int(10) UNSIGNED NOT NULL,
      `source` int(10) UNSIGNED NOT NULL,
      `target` int(10) UNSIGNED NOT NULL,
      `created_at` datetime NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    
    ALTER TABLE `edges`
      ADD PRIMARY KEY (`id`),
      ADD KEY `source` (`source`),
      ADD KEY `target` (`target`);
    
    ALTER TABLE `edges`
      MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;";

    $stmt = $db->prepare($query);

    return $stmt->execute();
}
?>