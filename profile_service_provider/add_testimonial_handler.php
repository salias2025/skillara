<?php
// profile_service_provider/add_testimonial_handler.php

require_once 'profile_db.php';

header('Content-Type: application/json');
session_start();

// Check if user is logged in as client
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'client') {
    echo json_encode(['success' => false, 'message' => 'You must be logged in as a client to leave a testimonial']);
    exit;
}

$clientId = $_SESSION['user_id'];
$providerId = $_POST['providerId'] ?? 0;
$message = $_POST['message'] ?? '';
$rating = $_POST['rating'] ?? 0;

// Validate input
if (!$providerId) {
    echo json_encode(['success' => false, 'message' => 'Provider ID required']);
    exit;
}

if (empty(trim($message))) {
    echo json_encode(['success' => false, 'message' => 'Testimonial message cannot be empty']);
    exit;
}

if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5 stars']);
    exit;
}

try {
    $db = new ProfileDB();
    
    // Add testimonial to database
    $result = $db->addTestimonial($providerId, $clientId, $message, $rating);
    
    if ($result) {
        // Get client info for the response
        $clientInfo = $db->getClientInfo($clientId);
        
        echo json_encode([
            'success' => true,
            'message' => 'Testimonial added successfully!',
            'testimonial' => [
                'name' => $clientInfo['username'] ?? 'Anonymous',
                'image' => !empty($clientInfo['profile_picture']) ? 
                          '/skillara/uploads/profile/' . $clientInfo['profile_picture'] : 
                          '/skillara/uploads/profile/default_avatar.jpg',
                'text' => $message,
                'rating' => (int)$rating
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save testimonial']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>