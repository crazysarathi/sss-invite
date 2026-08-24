<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_api_auth();
require_csrf();

$_SESSION = [];
session_destroy();

respond(['ok' => true]);
