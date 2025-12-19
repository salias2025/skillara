<?php
// profile_service_provider/portfolio_handler.php

session_start();
header('Content-Type: application/json');

require_once 'profile_db.php';

// Get action from request
$action = $_GET['action'] ?? $_POST['action'] ?? null;

// Get provider ID from request or session
$providerId = $_GET['providerId'] ?? $_POST['providerId'] ?? null;

try {
    $profileDB = new ProfileDB();
    
    // Get absolute path to project root (skillara/)
    $projectRoot = realpath(dirname(__FILE__) . '/..');  // Go up ONE level
    
    // Get base URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host;
    
    // Function to get image path with FULL URL
    function getPortfolioImagePath($fileName, $projectRoot, $baseUrl) {
        if (empty($fileName)) {
            // Return a placeholder image URL
            return $baseUrl . '/skillara/images/default-portfolio.webp';
        }
        
        // Check uploads/portfolio folder
        $uploadsPath = $projectRoot . "/uploads/portfolio/" . $fileName;
        if (file_exists($uploadsPath)) {
            // Return FULL URL
            return $baseUrl . "/skillara/uploads/portfolio/" . $fileName;
        }
        
        // File doesn't exist, use placeholder
        error_log("Portfolio image file not found: {$fileName} in uploads/portfolio/");
        return $baseUrl . '/skillara/images/default-portfolio.webp';
    }
    
    switch($action) {
        
        // ==================== GET PORTFOLIO ====================
        case 'getPortfolio':
            if (!$providerId) {
                throw new Exception('Provider ID required');
            }
            
            $portfolio = $profileDB->getPortfolio($providerId);
            
            // Convert relative paths to FULL URLs
            foreach ($portfolio as &$item) {
                if (!empty($item['img'])) {
                    $item['img'] = getPortfolioImagePath($item['img'], $projectRoot, $baseUrl);
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => $portfolio
            ]);
            break;
            
        // ==================== ADD PORTFOLIO ====================
        case 'addPortfolio':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to add portfolio items');
            }
            
            if (!isset($_POST['title']) || !isset($_POST['category'])) {
                throw new Exception('Portfolio title and category required');
            }
            
            $title = $_POST['title'];
            $category = $_POST['category'];
            $link = $_POST['link'] ?? '';
            
            // Handle image upload (EXACTLY like profile images)
            if (!isset($_FILES['image']) || $_FILES['image']['error'] != 0) {
                throw new Exception('Portfolio image is required');
            }
            
            $file = $_FILES['image'];
            
            // Validate file (same as profile)
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
            $maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception('Invalid image format. Allowed: JPG, PNG, GIF, WEBP, AVIF');
            }
            
            if ($file['size'] > $maxSize) {
                throw new Exception('Image too large. Maximum size: 5MB');
            }
            
            // Use correct upload path
            $uploadDir = $projectRoot . "/uploads/portfolio/";
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            // Generate unique filename (same pattern as profile)
            $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
            $fileName = "portfolio_{$providerId}_" . time() . "_" . uniqid() . ".{$fileExt}";
            $filePath = $uploadDir . $fileName;
            
            // DEBUG
            error_log("📤 Uploading portfolio image for provider: {$providerId}");
            error_log("📁 Upload directory: {$uploadDir}");
            error_log("📁 Full file path: {$filePath}");
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                error_log("❌ Failed to move uploaded file");
                error_log("❌ Error: " . print_r(error_get_last(), true));
                throw new Exception('Failed to upload portfolio image');
            }
            
            // Verify file was saved
            if (!file_exists($filePath)) {
                error_log("❌ File not found after move: {$filePath}");
                throw new Exception('Portfolio image not saved');
            }
            
            error_log("✅ Portfolio file saved successfully: {$filePath}");
            error_log("✅ File size: " . filesize($filePath) . " bytes");
            
            // Update database (store just filename like profile)
            $portfolioId = $profileDB->addPortfolio($providerId, $title, $category, $fileName, $link);
            
            if ($portfolioId) {
                // Return FULL URL
                $imageUrl = $baseUrl . "/skillara/uploads/portfolio/{$fileName}";
                
                error_log("✅ Returning portfolio image URL: {$imageUrl}");
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Portfolio item added successfully',
                    'portfolioId' => $portfolioId,
                    'imageUrl' => $imageUrl
                ]);
            } else {
                throw new Exception('Failed to add portfolio item');
            }
            break;
            
        // ==================== UPDATE PORTFOLIO ====================
        case 'updatePortfolio':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to update portfolio items');
            }
            
            if (!isset($_POST['portfolioId']) || !isset($_POST['title']) || !isset($_POST['category'])) {
                throw new Exception('Portfolio ID, title, and category required');
            }
            
            $portfolioId = $_POST['portfolioId'];
            $title = $_POST['title'];
            $category = $_POST['category'];
            $link = $_POST['link'] ?? '';
            
            // Handle image update (use existing if no new upload)
            $fileName = $_POST['existing_image'] ?? '';
            
            if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
                $file = $_FILES['image'];
                
                // Validate file (same as add)
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
                $maxSize = 5 * 1024 * 1024; // 5MB
                
                if (!in_array($file['type'], $allowedTypes)) {
                    throw new Exception('Invalid image format. Allowed: JPG, PNG, GIF, WEBP, AVIF');
                }
                
                if ($file['size'] > $maxSize) {
                    throw new Exception('Image too large. Maximum size: 5MB');
                }
                
                // Use correct upload path
                $uploadDir = $projectRoot . "/uploads/portfolio/";
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                // Generate unique filename
                $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
                $fileName = "portfolio_{$providerId}_" . time() . "_" . uniqid() . ".{$fileExt}";
                $filePath = $uploadDir . $fileName;
                
                // Move uploaded file
                if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                    throw new Exception('Failed to upload new portfolio image');
                }
                
                // Delete old image if it exists and is different
                if (!empty($_POST['existing_image']) && $_POST['existing_image'] != $fileName) {
                    $oldPath = $uploadDir . $_POST['existing_image'];
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                    }
                }
            }
            
            // Make sure we have an image
            if (empty($fileName)) {
                throw new Exception('Portfolio image is required');
            }
            
            $success = $profileDB->updatePortfolio($portfolioId, $title, $category, $fileName, $link);
            
            if ($success) {
                // Return FULL URL for the image
                $imageUrl = $baseUrl . "/skillara/uploads/portfolio/{$fileName}";
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Portfolio item updated successfully',
                    'imageUrl' => $imageUrl
                ]);
            } else {
                throw new Exception('Failed to update portfolio item');
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