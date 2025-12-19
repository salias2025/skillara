<?php
// landing_page/counters_handler.php

require_once 'landing_db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow frontend requests

try {
    $db = new LandingPageDB();
    
    // Get counters from database
    $counters = $db->getLandingCounters();
    
    // Return JSON response
    echo json_encode([
        'success' => true,
        'total_clients' => $counters['total_clients'],
        'total_providers' => $counters['total_providers'],
        'total_services' => $counters['total_services'],
        'total_projects' => $counters['total_projects']
    ]);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'total_clients' => 0,
        'total_providers' => 0,
        'total_services' => 0,
        'total_projects' => 0,
        'message' => 'Failed to load counters'
    ]);
}
?>