<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_api_auth();

$totalGuests = (int) db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
$totalCollected = (float) db()->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid'")->fetchColumn();

respond(['totalGuests' => $totalGuests, 'totalCollected' => $totalCollected]);
