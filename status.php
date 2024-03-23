<?php
include_once(".config.php");
include_once(".functions.php");

$conn = connect_to_database();

ini_set('memory_limit', '256M');
$db_results = execute_query($conn, "SELECT * FROM `eggnet_monitor`");

$last_update_ts = 0;
$data = [];

foreach ($db_results as $result) {
	$last_update_date = date_create_from_format("Y-m-d H:i:s", $result['last_update']);
	$last_update_ts = max($last_update_ts, $last_update_date->getTimestamp());
	$data[(int)($result['monster_id'])] = (int)($result['eggs_donated']);
}

mysqli_close($conn);

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['last_update' => $last_update_ts, 'eggs' => $data]);
?>