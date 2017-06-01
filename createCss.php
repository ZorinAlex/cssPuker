<?php

$txt = $_REQUEST["cssRule"];
$myfile = fopen("user/userCss.css", "w");
fwrite($myfile, $txt);
fclose($myfile);

echo "Done!"

?>

