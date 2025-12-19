<?php
// profile_service_provider/services_handler.php

session_start();
header('Content-Type: application/json');

require_once 'profile_db.php';

// Get action from request
$action = $_GET['action'] ?? $_POST['action'] ?? null;

// Get provider ID from request or session
$providerId = $_GET['providerId'] ?? $_POST['providerId'] ?? null;

try {
    $profileDB = new ProfileDB();
    
    switch($action) {
        
        // ==================== GET SERVICES ====================
        case 'getServices':
            if (!$providerId) {
                throw new Exception('Provider ID required');
            }
            
            $services = $profileDB->getServices($providerId);
            
            echo json_encode([
                'success' => true,
                'data' => $services
            ]);
            break;
            
        // ==================== ADD SERVICE ====================
        case 'addService':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to add services');
            }
            
            if (!isset($_POST['title']) || !isset($_POST['description']) || !isset($_POST['icon'])) {
                throw new Exception('Service title, description, and icon required');
            }
            
            $title = $_POST['title'];
            $description = $_POST['description'];
            $icon = $_POST['icon'];
            
            $serviceId = $profileDB->addService($providerId, $icon, $title, $description);
            
            if ($serviceId) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Service added successfully',
                    'serviceId' => $serviceId
                ]);
            } else {
                throw new Exception('Failed to add service');
            }
            break;
            
        // ==================== UPDATE SERVICE ====================
        case 'updateService':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to update services');
            }
            
            if (!isset($_POST['serviceId']) || !isset($_POST['title']) || !isset($_POST['description']) || !isset($_POST['icon'])) {
                throw new Exception('Service ID, title, description, and icon required');
            }
            
            $serviceId = $_POST['serviceId'];
            $title = $_POST['title'];
            $description = $_POST['description'];
            $icon = $_POST['icon'];
            
            $success = $profileDB->updateService($serviceId, $icon, $title, $description);
            
            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Service updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update service');
            }
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>