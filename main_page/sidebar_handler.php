<?php
// main_page/sidebar_handler.php

session_start();
header('Content-Type: application/json');

require_once 'main_db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];
$user_type = $_SESSION['user_type'];

try {
    $mainDB = new MainDB();
    
    // ===== NEW: HANDLE CLIENT PROFILE PICTURE UPLOAD =====
    // Get action from POST request
    $action = $_POST['action'] ?? null;
    
    if ($action === 'uploadClientImage') {
        // Check if user is logged in as client
        if ($user_type !== 'client') {
            throw new Exception('Not authorized to upload image');
        }
        
        if (!isset($_FILES['image'])) {
            throw new Exception('Image file required');
        }
        
        $file = $_FILES['image'];
        
        // Validate file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Invalid image format. Allowed: JPG, PNG, GIF, WEBP, AVIF');
        }
        
        if ($file['size'] > $maxSize) {
            throw new Exception('Image too large. Maximum size: 5MB');
        }
        
        // Get project root path
        $projectRoot = realpath(dirname(__FILE__) . '/..');
        
        // Upload directory
        $uploadDir = $projectRoot . "/uploads/profile/";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Generate unique filename
        $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = "client_{$user_id}_" . time() . ".{$fileExt}";
        $filePath = $uploadDir . $fileName;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception('Failed to upload image');
        }
        
        // Update database
        $success = $mainDB->updateClientProfilePicture($user_id, $fileName);
        
        if ($success) {
            // Return FULL URL
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'];
            $imageUrl = $protocol . '://' . $host . "/skillara/uploads/profile/{$fileName}";
            
            echo json_encode([
                'success' => true,
                'message' => 'Profile picture updated successfully',
                'imageUrl' => $imageUrl
            ]);
            exit;
        } else {
            throw new Exception('Failed to update database');
        }
    }
    // ===== END OF UPLOAD HANDLER =====
    
    if ($user_type === 'client') {
        // Get client info
        $clientInfo = $mainDB->getClientInfo($user_id);
        
        if (!$clientInfo) {
            throw new Exception("Client not found");
        }
        
        // Get providers client worked with
        $clientProviders = $mainDB->getClientProviders($user_id);
        
        echo json_encode([
            'success' => true,
            'user_type' => 'client',
            'data' => [
                'client' => [
                    'fullName' => $clientInfo['username'], // Using username as fallback
                    'username' => $clientInfo['username'],
                    'email' => $clientInfo['email'],
                    'profileImage' => '/skillara/uploads/profile/' . $clientInfo['profile_picture']
                ],
                'followedProviders' => $clientProviders
            ]
        ]);
        
    } elseif ($user_type === 'provider') {
        // Get provider info
        $providerInfo = $mainDB->getProviderInfo($user_id);
        
        if (!$providerInfo) {
            throw new Exception("Provider not found");
        }
        
        echo json_encode([
            'success' => true,
            'user_type' => 'provider',
            'data' => [
                'provider' => $providerInfo
            ]
        ]);
        
    } else {
        throw new Exception("Invalid user type");
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>