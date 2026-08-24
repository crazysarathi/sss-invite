<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_api_auth();

$q = trim($_GET['q'] ?? '');

$sql = "SELECT p.*, u.name AS user_name, u.email AS user_email, u.whatsapp AS user_whatsapp
        FROM payments p
        JOIN users u ON u.id = p.user_id";
$params = [];
if ($q !== '') {
    // Native prepares (PDO::ATTR_EMULATE_PREPARES = false) reject a named
    // placeholder reused more than once, so each LIKE gets its own :qN.
    $sql .= " WHERE u.name LIKE :q1 OR u.email LIKE :q2 OR p.reference LIKE :q3";
    $params[':q1'] = $params[':q2'] = $params[':q3'] = "%$q%";
}
$sql .= " ORDER BY p.created_at DESC";

$stmt = db()->prepare($sql);
$stmt->execute($params);

respond(['payments' => $stmt->fetchAll()]);
