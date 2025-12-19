<?php
// profile_service_provider/subscribe_handler.php

require_once 'profile_db.php';

header('Content-Type: application/json');
session_start();

$providerId = $_POST['providerId'] ?? 0;

if (!$providerId) {
    echo json_encode(['success' => false, 'message' => 'Provider ID required']);
    exit;
}

// Check if user is logged in as client
$clientId = $_SESSION['user_id'] ?? null;
$userType = $_SESSION['user_type'] ?? '';

if (!$clientId || $userType !== 'client') {
    echo json_encode(['success' => false, 'message' => 'You must be logged in as a client to subscribe']);
    exit;
}

try {
    $db = new ProfileDB();
    $result = $db->subscribeClient($providerId, $clientId);
    
    echo json_encode($result);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>