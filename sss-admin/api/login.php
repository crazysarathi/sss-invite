<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$in = json_input();
$username = trim((string) ($in['username'] ?? ''));
$password = (string) ($in['password'] ?? '');

$stmt = db()->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = :u LIMIT 1');
$stmt->execute([':u' => $username]);
$row = $stmt->fetch();

if (!$row || !password_verify($password, $row['password_hash'])) {
    respond(['error' => 'Invalid username or password.'], 401);
}

session_regenerate_id(true);
$_SESSION['admin'] = ['id' => $row['id'], 'username' => $row['username']];
$_SESSION['csrf'] = $_SESSION['csrf'] ?? bin2hex(random_bytes(32));

respond(['ok' => true, 'username' => $row['username'], 'csrf' => $_SESSION['csrf']]);
