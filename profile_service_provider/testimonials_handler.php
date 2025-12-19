<?php
// skillara/profile_service_provider/testimonials_handler.php

// NO output before headers!
header('Content-Type: application/json');

require_once 'database.php';
require_once 'profile_db.php';

$action = $_GET['action'] ?? '';
$providerId = $_GET['providerId'] ?? 0;

if ($action === 'getTestimonials') {
    if (!$providerId) {
        echo json_encode(['success' => false, 'message' => 'No provider ID']);
        exit;
    }
    
    $db = new ProfileDB();
    $testimonials = $db->getTestimonials($providerId);
    
    // Format the response
    $formatted = [];
    foreach ($testimonials as $t) {
        $formatted[] = [
            'name' => $t['username'],
            'image' => !empty($t['profile_picture']) ? '/uploads/profile/' . $t['profile_picture'] : '/uploads/profile/default_avatar.jpg',
            'text' => $t['message'],
            'rating' => (int)$t['rating']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'testimonials' => $formatted
    ]);
}
?>