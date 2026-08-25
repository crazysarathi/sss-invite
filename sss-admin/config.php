<?php
declare(strict_types=1);

/**
 * Set to false once the site is confirmed working in production — leaving
 * it on shows real exception messages (e.g. the DB error) in API 500
 * responses, which is useful while debugging but shouldn't stay on forever.
 */
define('APP_DEBUG', true);

// Local-dev defaults. On the live host, replace these four with the real
// MySQL credentials from your hosting control panel (e.g. cPanel > MySQL
// Databases) — most hosts don't allow a "root"/"password" login, and use a
// prefixed username/database name instead (e.g. "user_smashers").
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'password');
define('DB_NAME', 'smashers_admin');

/** Max registrations per time slot — must match src/data/siteData.ts's slot list. */
define('SLOT_CAPACITY', 20);

/**
 * Single shared PDO connection, created on first use.
 */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Turns any uncaught error/exception (e.g. a failed DB connection) into a
 * JSON 500 instead of a blank response — every endpoint requires this file
 * first, so it's a safety net for all of them, not just the ones that
 * already wrap their DB calls in try/catch.
 */
function fatal_to_json(string $message): void
{
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['error' => 'Server error', 'detail' => APP_DEBUG ? $message : null]);
}

set_exception_handler(function (Throwable $e): void {
    fatal_to_json($e->getMessage());
});

register_shutdown_function(function (): void {
    $err = error_get_last();
    if ($err !== null && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        fatal_to_json($err['message']);
    }
});
