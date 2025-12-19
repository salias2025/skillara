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