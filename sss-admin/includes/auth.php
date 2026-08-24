<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function current_admin(): ?array
{
    return $_SESSION['admin'] ?? null;
}

/** API-level guard: reply with 401 JSON instead of a redirect. */
function require_api_auth(): void
{
    if (!current_admin()) {
        respond(['error' => 'Unauthorized'], 401);
    }
}

/** Rejects state-changing API requests without a valid CSRF token. */
function require_csrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if ($token === '' || !hash_equals($_SESSION['csrf'] ?? '', $token)) {
        respond(['error' => 'Invalid CSRF token'], 403);
    }
}
