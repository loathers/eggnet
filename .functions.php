<?php
// Helper functions

function connect_to_database(): mysqli {
    global $db_username, $db_password, $db_host, $db_name;
	$conn = mysqli_connect($db_host, $db_username, $db_password, $db_name);
	if (!$conn) die('Cannot connect to database');
	mysqli_set_charset($conn, "utf8");
    setup_database($conn);
	return $conn;
}

function setup_database(mysqli $conn) {
    execute_query($conn, "
        CREATE TABLE IF NOT EXISTS `eggnet_monitor` (
            `monster_id` int(11) NOT NULL,
            `eggs_donated` tinyint(4) NOT NULL DEFAULT '0',
            `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
    ");

    execute_query($conn, "
        CREATE TABLE IF NOT EXISTS `eggnet_monitor_history` (
            `monster_id` int(11) NOT NULL,
            `eggs_donated` tinyint(4) NOT NULL DEFAULT '0',
            `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
    ");
}

function execute_query(mysqli $conn, string $query) {
	$query_data = mysqli_query($conn, $query);
	if (!$query_data || $query_data === true) return array();
    return mysqli_fetch_all($query_data, MYSQLI_ASSOC);
}
?>