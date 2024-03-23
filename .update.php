<?php
include_once(".config.php");
include_once(".functions.php");

// Authenticate
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $website . "/login.php");
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, ['loggingin' => 'Yup.', 'loginname' => $username, 'password' => $password, 'secure' => '0', 'submitbutton' => 'Log In']);
curl_setopt($ch, CURLOPT_USERAGENT, 'EggNetMonitor/0.1');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_COOKIEFILE, "");
curl_exec($ch);

curl_setopt($ch, CURLOPT_URL, $website . "/place.php?whichplace=town_right&action=townright_dna");
curl_exec($ch);

curl_setopt($ch, CURLOPT_URL, $website . "/choice.php?forceoption=0");
$html = curl_exec($ch);
curl_close($ch);

// Process the page and push updates
$conn = connect_to_database();

$doc = new DOMDocument();
$doc->loadHTML($html);
$form_contents = $doc->getElementsByTagName('form');
$monster_list = $form_contents->item(0)->childNodes->item(1)->childNodes;

foreach ($monster_list as $monster) {
	if (!($monster instanceof DOMElement)) continue;
	$value = $monster->getAttribute('value');
	if ($value == "") continue;
	$completed = !($monster->hasAttribute('disabled'));
	$amount_collected = 100;
	if (!$completed) {
		$option_contents = $monster->nodeValue;
		$last_bracket_pos = strrpos($option_contents, "(");
		$amount_collected = 100 - (int)(filter_var(substr($option_contents, $last_bracket_pos), FILTER_SANITIZE_NUMBER_INT));
	}

	$conn->query("REPLACE INTO `eggnet_monitor` (monster_id, eggs_donated) VALUES ({$value}, {$amount_collected})");
	$conn->query("INSERT INTO `eggnet_monitor_history` (monster_id, eggs_donated) VALUES ({$value}, {$amount_collected})");
}

$conn->close();
