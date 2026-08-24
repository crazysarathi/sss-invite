<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_api_auth();

$q          = trim($_GET['q'] ?? '');
$attendance = trim($_GET['attendance'] ?? '');
$slot       = trim($_GET['slot'] ?? '');
$interest   = trim($_GET['interest'] ?? '');

$sql = "SELECT u.*,
            (SELECT p.status FROM payments p WHERE p.user_id = u.id ORDER BY p.id DESC LIMIT 1) AS payment_status,
            (SELECT p.amount FROM payments p WHERE p.user_id = u.id ORDER BY p.id DESC LIMIT 1) AS payment_amount
        FROM users u";
$conditions = [];
$params = [];

if ($q !== '') {
    // Native prepares (PDO::ATTR_EMULATE_PREPARES = false) reject a named
    // placeholder reused more than once, so each LIKE gets its own :qN.
    $conditions[] = "(u.name LIKE :q1 OR u.email LIKE :q2 OR u.whatsapp LIKE :q3)";
    $params[':q1'] = $params[':q2'] = $params[':q3'] = "%$q%";
}
if ($attendance === 'yes' || $attendance === 'no') {
    $conditions[] = "u.attendance = :attendance";
    $params[':attendance'] = $attendance;
}
if ($slot !== '') {
    $conditions[] = "u.slot = :slot";
    $params[':slot'] = $slot;
}
if ($interest !== '') {
    $conditions[] = "u.interest = :interest";
    $params[':interest'] = $interest;
}

if ($conditions) {
    $sql .= " WHERE " . implode(' AND ', $conditions);
}
$sql .= " ORDER BY u.created_at DESC";

$stmt = db()->prepare($sql);
$stmt->execute($params);

respond(['users' => $stmt->fetchAll()]);
