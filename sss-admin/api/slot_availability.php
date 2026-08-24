<?php
declare(strict_types=1);

/**
 * Public endpoint the RSVP form polls to grey out full time slots.
 * Not part of the admin panel — no login required, same as rsvp_submit.php.
 */

require_once __DIR__ . '/../config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$rows = db()->query(
    "SELECT slot, COUNT(*) AS count FROM users WHERE attendance = 'yes' AND slot IS NOT NULL AND slot != '' GROUP BY slot"
)->fetchAll();

$counts = [];
foreach ($rows as $row) {
    $counts[$row['slot']] = (int) $row['count'];
}

echo json_encode(['capacity' => SLOT_CAPACITY, 'counts' => $counts]);
