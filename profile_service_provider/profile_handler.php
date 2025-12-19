<?php
// profile_service_provider/profile_handler.php

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
    $projectRoot = realpath(dirname(__FILE__) . '/..');  // CHANGED: Go up ONE level
    
    // Get base URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host;
    
    // Default images with FULL URL
    $defaultProfileImg = $baseUrl . '/skillara/uploads/profile/user-1.jpg';
    $defaultBannerImg = $baseUrl . '/skillara/uploads/banner/coding.webp';
    $defaultBackgroundImg = $baseUrl . '/skillara/uploads/background/default_background.avif';
    
    // Function to check if image file exists and return FULL URL
    function getImagePath($fileName, $type, $projectRoot, $default, $baseUrl) {
        if (empty($fileName)) {
            return $default;
        }
        
        // Check uploads folder
        $uploadsPath = $projectRoot . "/uploads/{$type}/" . $fileName;
        if (file_exists($uploadsPath)) {
            // Return FULL URL
            return $baseUrl . "/skillara/uploads/{$type}/" . $fileName;
        }
        
        // File doesn't exist, use default (already full URL)
        error_log("Image file not found: {$fileName} in uploads/{$type}/");
        return $default;
    }
    
    switch($action) {
        
        // ==================== GET PROFILE DATA ====================
        case 'getProfile':
            if (!$providerId) {
                throw new Exception('Provider ID required');
            }
            
            $profileData = $profileDB->getProfileData($providerId);
            $socialMedia = $profileDB->getSocialMedia($providerId);
            
            if (!$profileData) {
                throw new Exception('Profile not found');
            }
            
            // DEBUG: Log what we found
            error_log("🔍 Loading profile for provider: {$providerId}");
            error_log("📷 Profile picture from DB: " . ($profileData['profile_picture'] ?? 'NULL'));
            error_log("🎬 Banner image from DB: " . ($profileData['banner_image'] ?? 'NULL'));
            error_log("🌅 Background image from DB: " . ($profileData['background_image'] ?? 'NULL'));
            
            // Format social media as associative array
            $socialArray = [];
            foreach ($socialMedia as $social) {
                $platform = strtolower($social['name_media']);
                $socialArray[$platform] = $social['link'] ?? '#';
            }
            
            // Get image paths (with FULL URLs)
            $profileIMG = getImagePath($profileData['profile_picture'], 'profile', $projectRoot, $defaultProfileImg, $baseUrl);
            $bannerIMG = getImagePath($profileData['banner_image'], 'banner', $projectRoot, $defaultBannerImg, $baseUrl);
            $backgroundIMG = getImagePath($profileData['background_image'], 'background', $projectRoot, $defaultBackgroundImg, $baseUrl);
            
            error_log("✅ Final image URLs:");
            error_log("   Profile: {$profileIMG}");
            error_log("   Banner: {$bannerIMG}");
            error_log("   Background: {$backgroundIMG}");
            
            // Prepare response
            $response = [
                'success' => true,
                'data' => [
                    'id' => $profileData['id_provider'],
                    'username' => $profileData['username'],
                    'fullname' => $profileData['fullname'],
                    'email' => $profileData['email'],
                    'phone' => $profileData['phone_number'],
                    'profileIMG' => $profileIMG,
                    'bannerIMG' => $bannerIMG,
                    'backgroundIMG' => $backgroundIMG,
                    'businessname' => $profileData['name_business'] ?? 'No business',
                    'location' => $profileData['location'] ?? 'Unknown',
                    'servicetype' => $profileData['service_types'] ?? 'No service',
                    'bio' => $profileData['bio'] ?? 'No bio available',
                    'password' => '*********',
                    'social' => $socialArray
                ]
            ];
            
            echo json_encode($response);
            break;
            
        // ==================== UPDATE PROFILE ====================
        case 'updateProfile':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to update this profile');
            }
            
            $updates = [];
            
            // Text updates
            if (isset($_POST['username'])) {
                $profileDB->updateUsername($providerId, $_POST['username']);
                $updates[] = 'username';
            }
            
            if (isset($_POST['businessname'])) {
                $profileDB->updateBusiness($providerId, $_POST['businessname']);
                $updates[] = 'business';
            }
            
            if (isset($_POST['location'])) {
                $profileDB->updateLocation($providerId, $_POST['location']);
                $updates[] = 'location';
            }
            
            if (isset($_POST['bio'])) {
                $profileDB->updateBio($providerId, $_POST['bio']);
                $updates[] = 'bio';
            }
            
            if (isset($_POST['servicetype'])) {
                $profileDB->updateServiceTypes($providerId, $_POST['servicetype']);
                $updates[] = 'service types';
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully',
                'updated' => $updates
            ]);
            break;
            
        // ==================== UPLOAD IMAGE ====================
        case 'uploadImage':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to update images');
            }
            
            if (!isset($_FILES['image']) || !isset($_POST['imageType'])) {
                throw new Exception('Image file and type required');
            }
            
            $imageType = $_POST['imageType']; // 'profile', 'banner', or 'background'
            $file = $_FILES['image'];
            
            // Validate file
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
            $maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception('Invalid image format. Allowed: JPG, PNG, GIF, WEBP, AVIF');
            }
            
            if ($file['size'] > $maxSize) {
                throw new Exception('Image too large. Maximum size: 5MB');
            }
            
            // Use correct upload path
            $uploadDir = $projectRoot . "/uploads/{$imageType}/";
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            // Generate unique filename
            $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
            $fileName = "provider_{$providerId}_" . time() . ".{$fileExt}";
            $filePath = $uploadDir . $fileName;
            
            // DEBUG
            error_log("📤 Uploading image for provider: {$providerId}");
            error_log("📁 Upload directory: {$uploadDir}");
            error_log("📁 Full file path: {$filePath}");
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                error_log("❌ Failed to move uploaded file");
                error_log("❌ Error: " . print_r(error_get_last(), true));
                throw new Exception('Failed to upload image');
            }
            
            // Verify file was saved
            if (!file_exists($filePath)) {
                error_log("❌ File not found after move: {$filePath}");
                throw new Exception('File not saved');
            }
            
            error_log("✅ File saved successfully: {$filePath}");
            error_log("✅ File size: " . filesize($filePath) . " bytes");
            
            // Update database
            switch($imageType) {
                case 'profile':
                    $profileDB->updateProfilePicture($providerId, $fileName);
                    break;
                case 'banner':
                    $profileDB->updateBannerImage($providerId, $fileName);
                    break;
                case 'background':
                    $profileDB->updateBackgroundImage($providerId, $fileName);
                    break;
                default:
                    throw new Exception('Invalid image type');
            }
            
            // Return FULL URL
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'];
            $imageUrl = $protocol . '://' . $host . "/skillara/uploads/{$imageType}/{$fileName}";
            
            error_log("✅ Returning image URL: {$imageUrl}");
            
            echo json_encode([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'imageUrl' => $imageUrl
            ]);
            break;
            
        // ==================== GET SOCIAL MEDIA ====================
        case 'getSocial':
            if (!$providerId) {
                throw new Exception('Provider ID required');
            }
            
            $socialMedia = $profileDB->getSocialMedia($providerId);
            
            echo json_encode([
                'success' => true,
                'data' => $socialMedia
            ]);
            break;
            
        // ==================== UPDATE SOCIAL MEDIA ====================
        case 'updateSocial':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to update social media');
            }
            
            if (!isset($_POST['platform']) || !isset($_POST['link'])) {
                throw new Exception('Platform and link required');
            }
            
            // Map platform names to IDs
            $platformIds = [
                'facebook' => 1,
                'twitter' => 2, 
                'linkedin' => 3,
                'instagram' => 4,
                'whatsapp' => 5
            ];
            
            $platform = strtolower($_POST['platform']);
            $mediaId = $platformIds[$platform] ?? null;
            
            if (!$mediaId) {
                throw new Exception('Invalid platform');
            }
            
            $success = $profileDB->updateSocialMedia($providerId, $mediaId, $_POST['link']);
            
            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Social media link updated'
                ]);
            } else {
                throw new Exception('Failed to update social media link');
            }
            break;
            
        // ==================== GET CURRENT PROVIDER (for owner mode) ====================
        case 'getCurrentProvider':
            $currentProviderId = $profileDB->getCurrentProviderId();
            
            if ($currentProviderId) {
                echo json_encode([
                    'success' => true,
                    'providerId' => $currentProviderId
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Not logged in as provider'
                ]);
            }
            break;
            
        // ==================== GET CLIENTS LIST ====================
        case 'getClients':
            if (!$providerId) {
                throw new Exception('Provider ID required');
            }
            
            $clients = $profileDB->getClients($providerId);
            
            // Format clients data
            $formattedClients = [];
            foreach ($clients as $client) {
                $formattedClients[] = [
                    'name' => $client['username'],
                    'photo' => getImagePath($client['profile_picture'], 'profile', $projectRoot, $defaultProfileImg, $baseUrl),
                    'email' => $client['email'],
                    'phone' => $client['phone_number']
                ];
            }
            
            echo json_encode([
                'success' => true,
                'data' => $formattedClients
            ]);
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