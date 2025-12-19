<?php
// registration/registration_handler.php

header('Content-Type: application/json');

// Start session
session_start();

require_once 'register_db.php';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['full_name']) || !isset($data['username']) || !isset($data['email']) || 
    !isset($data['phone']) || !isset($data['password']) || !isset($data['role'])) {
    
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Sanitize inputs
$full_name = trim($data['full_name']);
$username = trim($data['username']);
$email = trim($data['email']);
$phone = trim($data['phone']);
$password = $data['password'];
$role = $data['role'];
$location = isset($data['location']) ? trim($data['location']) : '';
$service_type = isset($data['service_type']) ? trim($data['service_type']) : '';
$business_name = isset($data['business_name']) ? trim($data['business_name']) : '';

try {
    // Create RegisterDB instance
    $registerDB = new RegisterDB();
    
    // Check if user already exists
    $registerDB->checkUserExists($email, $username, $phone);
    
    // Register user based on role
    if ($role === 'client') {
        $user_data = $registerDB->registerClient($full_name, $username, $email, $phone, $password);
    } else if ($role === 'provider') {
        // Validate provider-specific fields
        if (empty($service_type) || empty($business_name) || empty($location)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Service Type, Business Name, and Location are required for service providers']);
            exit;
        }
        
        // For now, use empty bio. You can add bio field to the form later
        $bio = "";
        $user_data = $registerDB->registerProvider($full_name, $username, $email, $phone, $password, $location, $bio, $service_type, $business_name);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid role selected']);
        exit;
    }
    
    if ($user_data) {
        // Set session variables
        $_SESSION['user_id'] = $user_data['id'];
        $_SESSION['user_type'] = $user_data['user_type'];
        $_SESSION['username'] = $user_data['username'];
        $_SESSION['email'] = $user_data['email'];
        $_SESSION['fullname'] = $user_data['fullname'];
        $_SESSION['profile_picture'] = 'default_avatar.jpg';
        
        // Add provider-specific session data if applicable
        if ($role === 'provider') {
            $_SESSION['location'] = $user_data['location'];
        }
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful!',
            'redirect' => '/skillara/main_page/main.html'
        ]);
    } else {
        throw new Exception("Registration failed");
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>