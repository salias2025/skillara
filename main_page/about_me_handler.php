<?php
// main_page/about_me_handler.php

header('Content-Type: application/json');

require_once 'main_db.php';

// Check if provider_id is provided
if (!isset($_GET['provider_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Provider ID is required'
    ]);
    exit;
}

$provider_id = $_GET['provider_id'];

try {
    $mainDB = new MainDB();
    $aboutMeData = $mainDB->getAboutMeData($provider_id);
    
    if ($aboutMeData) {
        echo json_encode([
            'success' => true,
            'data' => $aboutMeData
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Provider not found'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>