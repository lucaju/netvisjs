<?php
// require database and object files
require_once '../vendor/autoload.php';
require_once '../api/config/database.php';
require_once '../api/objects/meta.php';

$dotenv = Dotenv\Dotenv::create("../");
$dotenv->load();

$database = new Database();
$db = $database->getConnection();

$meta = new Meta($db);
$metaInfo = $meta->read();

if (!isset($_GET['action']) || !isset($_GET['requestID'])) {
    header("Location: {$metaInfo['project']['url']}");
}
?>
<!doctype html>
<html ng-app="resetApp">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo $metaInfo["project"]["title"]; ?></title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body ng-controller="ResetCtrl as resetCtrl"
      ng-init="getInitialData({
          action: '<?php echo $_GET['action']; ?>',
          requestID: <?php echo $_GET['requestID']; ?>
        })">

    <md-content md-theme="appTheme" >

        <div id="main" flex="auto">
            <div id="main-top">
                <div id="title" layout-padding>
                    <h2 class="md-title">
                        <?php echo $metaInfo["project"]["title"]; ?>
                    </h2>   
                </div>
            </div>
        </div>

        <div class="loader"
            layout="row"
            layout-sm="column"
            layout-align="space-around"
            ng-if="request.status == 'loading'">
            <md-progress-circular md-mode="indeterminate"></md-progress-circular>
        </div>

        <section ng-if="request.status == 'editing'">
            <h1 class="md-headline">{{request.title}}</h1>
            
            <form class="md-whiteframe-1dp">
                <div layout="column">
                    <md-input-container class="input-custom">
                        <label>{{request.label}}</label>
                        <input type="password"
                            ng-model="request.password"
                            aria-label="Password">
                    </md-input-container>
                </div>
            </form>

            <md-button type="submit"
                       ng-click="submit()"
                       aria-label="Submit">Submit</md-button>
        </section>

        <section ng-if="request.status == 'error'">
            <div id="message"
                 ng-if="request.error"
                 flex="100">
                    <md-divider></md-divider>
                <p class="md-caption">
                    <md-icon md-font-icon="material-icons md-18">warning</md-icon>
                    {{request.error}}
                </p>
            </div>
        </section>

        <section ng-if="request.status == 'expired'">
            <h1 class="md-headline">This session is expired.</h1>
        </section>

        <section id="success" ng-if="request.status == 'done'">
            <md-icon md-font-icon="material-icons checked md-warn md-hue-1">check</md-icon>
            <p class="md-body-1"><strong>All done!</strong><br/>
            Use your email and password to access the website.</p>
             <md-button href="<?php echo $metaInfo["project"]["url"]; ?>"
                 class="md-fab md-mini md-primary"
                 title="<?php echo $metaInfo["project"]["title"]; ?>">
                 <md-icon md-font-icon="material-icons">arrow_forward</md-icon>
            </md-button>
        </section>
                
    </md-content>

</body>

</html>