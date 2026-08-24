<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_api_auth();
require_csrf();

$in = json_input();

$id         = isset($in['id']) ? (int) $in['id'] : 0;
$name       = trim((string) ($in['name'] ?? ''));
$email      = trim((string) ($in['email'] ?? ''));
$whatsapp   = trim((string) ($in['whatsapp'] ?? ''));
$attendance = ((string) ($in['attendance'] ?? 'yes')) === 'no' ? 'no' : 'yes';
$guests     = max(1, min(4, (int) ($in['guests'] ?? 1)));
$slot       = trim((string) ($in['slot'] ?? ''));
$interest   = in_array($in['interest'] ?? '', ['pickle', 'pilates', 'both', 'matcha'], true) ? $in['interest'] : null;
$message    = trim((string) ($in['message'] ?? ''));
$theme      = trim((string) ($in['theme'] ?? ''));

if ($name === '' || $email === '' || $whatsapp === '') {
    respond(['error' => 'Name, email and WhatsApp number are required.'], 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'Invalid email address.'], 422);
}

$params = [
    ':name' => $name,
    ':email' => $email,
    ':whatsapp' => $whatsapp,
    ':attendance' => $attendance,
    ':guests' => $guests,
    ':slot' => $slot !== '' ? $slot : null,
    ':interest' => $interest,
    ':message' => $message !== '' ? $message : null,
    ':theme' => $theme !== '' ? $theme : null,
];

if ($id > 0) {
    $params[':id'] = $id;
    $stmt = db()->prepare(
        'UPDATE users SET name = :name, email = :email, whatsapp = :whatsapp, attendance = :attendance,
         guests = :guests, slot = :slot, interest = :interest, message = :message, theme = :theme WHERE id = :id'
    );
    $stmt->execute($params);
    respond(['ok' => true, 'id' => $id]);
}

$stmt = db()->prepare(
    'INSERT INTO users (name, email, whatsapp, attendance, guests, slot, interest, message, theme)
     VALUES (:name, :email, :whatsapp, :attendance, :guests, :slot, :interest, :message, :theme)'
);
$stmt->execute($params);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
