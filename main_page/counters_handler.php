<?php
// main_page/counters_handler.php

header('Content-Type: application/json');

require_once 'main_db.php';

try {
    $mainDB = new MainDB();
    $counters = $mainDB->getCounters();
    
    echo json_encode([
        'success' => true,
        'data' => $counters
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'data' => [
            'total_providers' => 500,
            'total_services' => 400
        ]
    ]);
}
?>