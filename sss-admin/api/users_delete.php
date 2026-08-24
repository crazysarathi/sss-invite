<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_api_auth();
require_csrf();

$in = json_input();
$id = isset($in['id']) ? (int) $in['id'] : 0;

if ($id <= 0) {
    respond(['error' => 'Missing id.'], 422);
}

// Payments for this guest are removed too (ON DELETE CASCADE).
$stmt = db()->prepare('DELETE FROM users WHERE id = :id');
$stmt->execute([':id' => $id]);

respond(['ok' => true]);
