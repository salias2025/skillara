<?php
// main_page/popular_services_handler.php

header('Content-Type: application/json');

require_once 'main_db.php';

try {
    $mainDB = new MainDB();
    
    // Get limit from request or default to 4
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 4;
    $services = $mainDB->getPopularServices($limit);
    
    echo json_encode([
        'success' => true,
        'data' => $services
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'data' => []
    ]);
}
?>