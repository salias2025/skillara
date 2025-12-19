<?php
// profile_service_provider/certifications_handler.php

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
        
        // ==================== GET CERTIFICATIONS ====================
        case 'getCertifications':
            if (!$providerId) {
                throw new Exception('Provider ID required');
            }
            
            $certifications = $profileDB->getCertifications($providerId);
            
            echo json_encode([
                'success' => true,
                'data' => $certifications
            ]);
            break;
            
        // ==================== ADD CERTIFICATION ====================
        case 'addCertification':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to add certifications');
            }
            
            // Required fields
            $requiredFields = ['title', 'issuer', 'date'];
            foreach ($requiredFields as $field) {
                if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
                    throw new Exception("Certification {$field} is required");
                }
            }
            
            $title = $_POST['title'];
            $issuer = $_POST['issuer'];
            $date = $_POST['date'];
            $description = $_POST['description'] ?? '';
            $link = $_POST['link'] ?? '';
            $logo = $_POST['logo'] ?? '';
            
            $certId = $profileDB->addCertification(
                $providerId, 
                $title, 
                $issuer, 
                $date, 
                $description, 
                $link, 
                $logo
            );
            
            if ($certId) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Certification added successfully',
                    'certificationId' => $certId,
                    'certification' => [
                        'id_certification' => $certId,
                        'title' => $title,
                        'issuer' => $issuer,
                        'date' => $date,
                        'description' => $description,
                        'link' => $link,
                        'logo' => $logo
                    ]
                ]);
            } else {
                throw new Exception('Failed to add certification');
            }
            break;
            
        // ==================== UPDATE CERTIFICATION ====================
        case 'updateCertification':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to update certifications');
            }
            
            if (!isset($_POST['certificationId'])) {
                throw new Exception('Certification ID required');
            }
            
            $certificationId = $_POST['certificationId'];
            $title = $_POST['title'] ?? '';
            $issuer = $_POST['issuer'] ?? '';
            $date = $_POST['date'] ?? '';
            $description = $_POST['description'] ?? '';
            $link = $_POST['link'] ?? '';
            $logo = $_POST['logo'] ?? '';
            
            $success = $profileDB->updateCertification(
                $certificationId, 
                $title, 
                $issuer, 
                $date, 
                $description, 
                $link, 
                $logo
            );
            
            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Certification updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update certification');
            }
            break;
            
        // ==================== DELETE CERTIFICATION ====================
        case 'deleteCertification':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to delete certifications');
            }
            
            if (!isset($_POST['certificationId'])) {
                throw new Exception('Certification ID required');
            }
            
            $certificationId = $_POST['certificationId'];
            
            $success = $profileDB->deleteCertification($providerId, $certificationId);
            
            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Certification deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete certification');
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