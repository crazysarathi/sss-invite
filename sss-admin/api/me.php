<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

/**
 * Session check for the React admin app on load/refresh — it has no
 * server-rendered page to read a CSRF token from, so it asks here instead.
 */

$admin = current_admin();
if (!$admin) {
    respond(['authenticated' => false]);
}

$_SESSION['csrf'] = $_SESSION['csrf'] ?? bin2hex(random_bytes(32));

respond([
    'authenticated' => true,
    'username' => $admin['username'],
    'csrf' => $_SESSION['csrf'],
]);
