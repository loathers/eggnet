<?php
include_once(".config.php");
include_once(".functions.php");

$conn = connect_to_database();

$result = $conn->query("SELECT * FROM `eggnet_monitor`");

$last_update_ts = 0;
$data = [];

while ($row = $result->fetch_assoc()) {
	$last_update_date = date_create_from_format("Y-m-d H:i:s", $row['last_update']);
	$last_update_ts = max($last_update_ts, $last_update_date->getTimestamp());
	$data[(int)($row['monster_id'])] = (int)($row['eggs_donated']);
}

$conn->close();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['last_update' => $last_update_ts, 'eggs' => $data]);
