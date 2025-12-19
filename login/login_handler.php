<?php
// login/login_handler.php

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Start session
session_start();

require_once 'login_db.php';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$rawData = file_get_contents('php://input');

// Check if we received any data
if (empty($rawData)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'No data received'
    ]);
    exit;
}

// Try to decode JSON
$data = json_decode($rawData, true);

// Check if JSON decoding failed
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Invalid JSON data: ' . json_last_error_msg()
    ]);
    exit;
}

// Validate required fields
if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Username and password are required',
        'received_data' => array_keys($data)
    ]);
    exit;
}

// Sanitize inputs
$username = trim($data['username']);
$password = $data['password'];

// Validate inputs
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Username and password cannot be empty'
    ]);
    exit;
}

try {
    // Create LoginDB instance
    $loginDB = new LoginDB();
    
    // Authenticate user
    $user = $loginDB->authenticateUser($username, $password);
    
    if ($user) {
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['fullname'] = $user['fullname'];
        $_SESSION['profile_picture'] = $user['profile_picture'] ?? 'default_avatar.jpg';
        
        // Add provider-specific session data if applicable
        if ($user['user_type'] === 'provider') {
            $_SESSION['location'] = $user['location'] ?? '';
            $_SESSION['bio'] = $user['bio'] ?? '';
            
            // Get additional provider details
            $provider_details = $loginDB->getProviderDetails($user['id']);
            if ($provider_details) {
                $_SESSION['service_types'] = $provider_details['service_types'] ?? '';
                $_SESSION['business_names'] = $provider_details['business_names'] ?? '';
            }
        }
        
        // Debug: Show session data (remove in production)
        error_log("Login successful for user: " . $user['username'] . " (Type: " . $user['user_type'] . ")");
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Login successful!',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'fullname' => $user['fullname'],
                'user_type' => $user['user_type']
            ],
            'redirect' => '/skillara/main_page/main.html'
        ]);
        
    } else {
        // Authentication failed
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during login'
    ]);
}
?>