<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_api_auth();
require_csrf();

$in = json_input();

$id      = isset($in['id']) ? (int) $in['id'] : 0;
$userId  = isset($in['user_id']) ? (int) $in['user_id'] : 0;
$amount  = (float) ($in['amount'] ?? 0);
$method  = (string) ($in['method'] ?? 'upi');
$status  = (string) ($in['status'] ?? 'pending');
$reference = trim((string) ($in['reference'] ?? ''));
$notes   = trim((string) ($in['notes'] ?? ''));
$paidAt  = trim((string) ($in['paid_at'] ?? ''));

$validMethods = ['cash', 'upi', 'card', 'bank_transfer', 'other'];
$validStatuses = ['pending', 'paid', 'failed', 'refunded'];

if ($userId <= 0) {
    respond(['error' => 'Please choose a guest.'], 422);
}
if ($amount < 0) {
    respond(['error' => 'Amount cannot be negative.'], 422);
}
if (!in_array($method, $validMethods, true)) {
    respond(['error' => 'Invalid payment method.'], 422);
}
if (!in_array($status, $validStatuses, true)) {
    respond(['error' => 'Invalid payment status.'], 422);
}

$userExists = db()->prepare('SELECT id FROM users WHERE id = :id');
$userExists->execute([':id' => $userId]);
if (!$userExists->fetch()) {
    respond(['error' => 'That guest no longer exists.'], 422);
}

$params = [
    ':user_id' => $userId,
    ':amount' => $amount,
    ':method' => $method,
    ':status' => $status,
    ':reference' => $reference !== '' ? $reference : null,
    ':notes' => $notes !== '' ? $notes : null,
    ':paid_at' => $paidAt !== '' ? $paidAt : ($status === 'paid' ? date('Y-m-d H:i:s') : null),
];

if ($id > 0) {
    $params[':id'] = $id;
    $stmt = db()->prepare(
        'UPDATE payments SET user_id = :user_id, amount = :amount, method = :method, status = :status,
         reference = :reference, notes = :notes, paid_at = :paid_at WHERE id = :id'
    );
    $stmt->execute($params);
    respond(['ok' => true, 'id' => $id]);
}

$stmt = db()->prepare(
    'INSERT INTO payments (user_id, amount, method, status, reference, notes, paid_at)
     VALUES (:user_id, :amount, :method, :status, :reference, :notes, :paid_at)'
);
$stmt->execute($params);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
