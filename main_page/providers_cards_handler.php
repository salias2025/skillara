<?php
// main_page/providers_cards_handler.php

header('Content-Type: application/json');

require_once 'main_db.php';

try {
    $mainDB = new MainDB();
    
    // Get limit from request or default to 9
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 9;
    $cards = $mainDB->getProviderCards($limit);
    
    echo json_encode([
        'success' => true,
        'data' => $cards
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'data' => []
    ]);
}
?>