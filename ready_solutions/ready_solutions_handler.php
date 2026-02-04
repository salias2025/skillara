<?php
// ready_solutions/ready_solutions_handler.php

session_start();
header('Content-Type: application/json');

try {
    require_once 'ready_solutions_db.php';
    $readyDB = new ReadySolutionsDB();
    
    $action = $_GET['action'] ?? '';
    
    if ($action === 'getAll') {
        $solutions = $readyDB->getAllSolutions();
        
        // Fix image paths
        foreach($solutions as &$solution) {
            if (!empty($solution['img'])) {
                $solution['img'] = '/skillara/uploads/ready/' . $solution['img'];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $solutions,
            'count' => count($solutions)
        ]);
        
    } else if ($action === 'add') {
        // Check if user is provider
        if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'provider') {
            throw new Exception('Only providers can add solutions');
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('User not logged in');
        }
        
        // Get form data
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $link = trim($_POST['link'] ?? '');
        $id_publisher = $_SESSION['user_id'];
        
        // Validate
        if (empty($title)) throw new Exception('Title is required');
        if (empty($description)) throw new Exception('Description is required');
        
        // Handle image upload
        $img = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['image'];
            
            // Validate image
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception('Invalid image type. Allowed: JPG, PNG, GIF, WEBP');
            }
            
            if ($file['size'] > $maxSize) {
                throw new Exception('Image too large. Maximum size: 5MB');
            }
            
            // Create uploads/ready directory if not exists
            $uploadDir = __DIR__ . '/../uploads/ready/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            // Generate unique filename
            $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
            $fileName = 'ready_' . $id_publisher . '_' . time() . '.' . $fileExt;
            $filePath = $uploadDir . $fileName;
            
            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                $img = $fileName;
            } else {
                throw new Exception('Failed to upload image');
            }
        } else {
            throw new Exception('Image is required');
        }
        
        // Insert into database using DB class
        $solutionId = $readyDB->addSolution($title, $description, $img, $link, $id_publisher);
        
        if ($solutionId) {
            echo json_encode([
                'success' => true,
                'message' => 'Solution added successfully',
                'solutionId' => $solutionId,
                'imgUrl' => '/skillara/uploads/ready/' . $img
            ]);
        } else {
            throw new Exception('Failed to save to database');
        }
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
    
} catch(Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>