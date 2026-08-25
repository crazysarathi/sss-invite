<?php
declare(strict_types=1);

/**
 * Manual diagnostic page — visit /sss-admin/index.php directly in a browser
 * to check whether PHP, the pdo_mysql driver, and the DB credentials in
 * config.php are working, without needing SSH/log access on the host.
 *
 * This does NOT compete with the React admin panel's routing: the site's
 * .htaccess only falls back to the SPA for requests that don't resolve to
 * a real file, so normal navigation to /sss-admin (no filename) is
 * unaffected — this script only runs if this exact URL is requested.
 * Delete this file once the backend is confirmed working.
 */

require_once __DIR__ . '/config.php';

header('Content-Type: text/plain; charset=utf-8');

echo "PHP version: " . PHP_VERSION . "\n";
echo "pdo_mysql extension: " . (extension_loaded('pdo_mysql') ? 'loaded' : 'NOT LOADED - ask your host to enable it') . "\n";
echo "DB config: host=" . DB_HOST . " db=" . DB_NAME . " user=" . DB_USER . "\n";

try {
    db()->query('SELECT 1');
    echo "DB connection: OK\n";
} catch (Throwable $e) {
    echo "DB connection: FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
}
