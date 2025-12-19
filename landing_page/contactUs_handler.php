<?php
// landing_page/contactUs_handler.php

// Enable error reporting (turn off in production)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Log for debugging
error_log("=== CONTACT FORM SUBMISSION ===");
error_log("Time: " . date('Y-m-d H:i:s'));

require_once 'landing_db.php';

header('Content-Type: application/json');

// Get POST data
$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

error_log("Received - Username: '$username', Email: '$email', Message: '$message'");

// Basic validation
if (empty($username) || empty($email) || empty($message)) {
    error_log("Validation failed: Empty fields");
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_log("Validation failed: Invalid email - $email");
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address'
    ]);
    exit;
}

// Message length validation
if (strlen($message) < 10) {
    error_log("Validation failed: Message too short - " . strlen($message) . " chars");
    echo json_encode([
        'success' => false,
        'message' => 'Message must be at least 10 characters long'
    ]);
    exit;
}

if (strlen($message) > 100) {
    error_log("Validation failed: Message too long - " . strlen($message) . " chars");
    echo json_encode([
        'success' => false,
        'message' => 'Message must not exceed 100 characters'
    ]);
    exit;
}

try {
    $db = new LandingPageDB();
    
    // Check if client exists
    error_log("Checking client: Username='$username', Email='$email'");
    $clientId = $db->checkClientExists($username, $email);
    
    if (!$clientId) {
        error_log("Client not found: $username ($email)");
        echo json_encode([
            'success' => false,
            'message' => 'Username and email combination not found. Please check your details or register first.'
        ]);
        exit;
    }
    
    error_log("Client found: ID = $clientId");
    
    // Submit message
    $result = $db->submitContactMessage($clientId, $message);
    
    if ($result) {
        error_log("Message saved successfully for client $clientId");
        echo json_encode([
            'success' => true,
            'message' => 'Your message has been successfully sent!'
        ]);
    } else {
        error_log("Failed to save message for client $clientId");
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save your message. Please try again.'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error. Please try again later.'
    ]);
}
?>