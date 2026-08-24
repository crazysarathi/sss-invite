<?php
declare(strict_types=1);

/**
 * Public endpoint for the site's "Save your spot" form (src/lib/rsvp.ts).
 * Not part of the admin panel itself — no login required, since guests
 * submit it anonymously from the invitation page.
 */

require_once __DIR__ . '/../config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$in = json_decode($raw ?: '', true);
if (!is_array($in)) {
    $in = $_POST;
}

$name       = trim((string) ($in['name'] ?? ''));
$email      = trim((string) ($in['email'] ?? ''));
// Accept "whatsapp" (preferred) and fall back to the frontend's current
// "phone" field name, since src/lib/rsvp.ts isn't touched by this endpoint.
$whatsapp   = trim((string) ($in['whatsapp'] ?? $in['phone'] ?? ''));
$attendance = ((string) ($in['attendance'] ?? 'yes')) === 'no' ? 'no' : 'yes';
$guests     = max(1, min(4, (int) ($in['guests'] ?? 1)));
$slot       = trim((string) ($in['slot'] ?? ''));
$interest   = in_array($in['interest'] ?? '', ['pickle', 'pilates', 'both', 'matcha'], true) ? $in['interest'] : null;
$message    = trim((string) ($in['message'] ?? ''));
$theme      = trim((string) ($in['theme'] ?? ''));

if ($name === '' || $email === '' || $whatsapp === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Name, email and WhatsApp number are required.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid email address.']);
    exit;
}

try {
    // Only a "yes" holds a spot in the slot — declining doesn't use up capacity.
    if ($attendance === 'yes' && $slot !== '') {
        $countStmt = db()->prepare("SELECT COUNT(*) FROM users WHERE slot = :slot AND attendance = 'yes'");
        $countStmt->execute([':slot' => $slot]);
        if ((int) $countStmt->fetchColumn() >= SLOT_CAPACITY) {
            http_response_code(422);
            echo json_encode(['error' => 'That time slot is full. Please choose another.']);
            exit;
        }
    }

    $stmt = db()->prepare(
        'INSERT INTO users (name, email, whatsapp, attendance, guests, slot, interest, message, theme)
         VALUES (:name, :email, :whatsapp, :attendance, :guests, :slot, :interest, :message, :theme)'
    );
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':whatsapp' => $whatsapp,
        ':attendance' => $attendance,
        ':guests' => $guests,
        ':slot' => $slot !== '' ? $slot : null,
        ':interest' => $interest,
        ':message' => $message !== '' ? $message : null,
        ':theme' => $theme !== '' ? $theme : null,
    ]);
    echo json_encode(['ok' => true, 'id' => (int) db()->lastInsertId()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not save RSVP.']);
}
