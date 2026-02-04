<?php
// free_solutions/free_solutions_handler.php

session_start();
header('Content-Type: application/json');

// Enable CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Check preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'free_solutions_db.php';

$handler = new FreeSolutionsHandler();

if (isset($_GET['action'])) {
    try {
        switch ($_GET['action']) {
            case 'getAll':
                echo $handler->getAllPosts();
                break;
                
            case 'getAds':
                echo $handler->getAdvertisements();
                break;
                
            case 'addPost':
                echo $handler->addPost();
                break;
                
            case 'addComment':
                echo $handler->addComment();
                break;
                
            case 'addAd':
                echo $handler->addAdvertisement();
                break;
                
            case 'search':
                $keyword = $_GET['keyword'] ?? '';
                echo $handler->searchPosts($keyword);
                break;
                
            case 'getUserInfo':
                echo $handler->getUserInfo();
                break;
                
            default:
                throw new Exception('Invalid action');
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No action specified'
    ]);
}

class FreeSolutionsHandler {
    private $db;
    
    public function __construct() {
        $this->db = new FreeSolutionsDB();
    }
    
    /**
     * Check if user is logged in and get session info
     */
    private function checkSession() {
        if (!isset($_SESSION['username'])) {
            throw new Exception('User not logged in');
        }
        
        return [
            'username' => $_SESSION['username'],
            'user_type' => $_SESSION['user_type'] ?? null,
            'profile_picture' => $_SESSION['profile_picture'] ?? 'default_avatar.jpg'
        ];
    }
    
    /**
     * Get Publisher ID from username
     */
    private function getPublisherId($username) {
        $publisherId = $this->db->getPublisherIdByUsername($username);
        if (!$publisherId) {
            throw new Exception('User not found in Publisher table');
        }
        return $publisherId;
    }
    
    /**
     * Get all posts with comments
     */
    public function getAllPosts() {
        try {
            $posts = $this->db->getAllPosts();
            
            // Fix image paths
            foreach ($posts as &$post) {
                // Post image - POSTS GO IN ADS FOLDER
                if ($post['post_image'] && $post['post_image'] !== 'default_avatar.jpg') {
                    $post['post_image'] = '/skillara/uploads/ads/' . $post['post_image'];
                }
                
                // Author avatar - PROFILES GO IN PROFILE FOLDER (singular)
                if ($post['author_avatar'] && $post['author_avatar'] !== 'default_avatar.jpg') {
                    $post['author_avatar'] = '/skillara/uploads/profile/' . $post['author_avatar'];
                }
                
                // Comments are already arrays
                if ($post['comments']) {
                    foreach ($post['comments'] as &$comment) {
                        // Comment author avatar - PROFILES GO IN PROFILE FOLDER (singular)
                        if ($comment['avatar'] && $comment['avatar'] !== 'default_avatar.jpg') {
                            $comment['avatar'] = '/skillara/uploads/profile/' . $comment['avatar'];
                        }
                    }
                }
            }
            
            return json_encode([
                'success' => true,
                'data' => $posts
            ]);
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Get user info for frontend
     */
    public function getUserInfo() {
        try {
            $session = $this->checkSession();
            
            // Get user type if not in session
            if (!$session['user_type']) {
                $session['user_type'] = $this->db->getUserType($session['username']);
            }
            
            // Get publisher info
            $publisherInfo = $this->db->getUserByUsername($session['username']);
            
            return json_encode([
                'success' => true,
                'user' => [
                    'username' => $session['username'],
                    'user_type' => $session['user_type'],
                    'profile_picture' => $publisherInfo['profile_picture'] ? 
                        '/skillara/uploads/profile/' . $publisherInfo['profile_picture'] : 
                        '/skillara/images/default_avatar.jpg',
                    'can_add_ads' => $session['user_type'] === 'provider'
                ]
            ]);
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage(),
                'redirect' => '/skillara/registration/login.html'
            ]);
        }
    }
    
    /**
     * Add new post with image upload
     */
    public function addPost() {
        try {
            $session = $this->checkSession();
            $publisherId = $this->getPublisherId($session['username']);
            
            // Check if it's FormData (for file upload) or JSON (backward compatibility)
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            $isFormData = strpos($contentType, 'multipart/form-data') !== false;
            
            if ($isFormData) {
                // Handle FormData with image upload
                $text = $_POST['text'] ?? '';
                $imageFileName = null;
                
                // Handle image upload if provided
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $imageFileName = $this->uploadImage($_FILES['image'], 'ads');
                }
            } else {
                // Handle JSON data (backward compatibility)
                $postData = json_decode(file_get_contents('php://input'), true);
                $text = $postData['text'] ?? '';
                $imageFileName = $postData['image'] ?? null;
            }
            
            if (empty(trim($text))) {
                throw new Exception('Post text is required');
            }
            
            $text = trim($text);
            
            // Add post to database
            $postId = $this->db->addPost($text, $publisherId, $imageFileName);
            
            if ($postId) {
                return json_encode([
                    'success' => true,
                    'message' => 'Post added successfully',
                    'post_id' => $postId
                ]);
            } else {
                throw new Exception('Failed to add post');
            }
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Add comment to post
     */
    public function addComment() {
        try {
            $session = $this->checkSession();
            $publisherId = $this->getPublisherId($session['username']);
            
            // Get POST data
            $postData = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($postData['post_id']) || !is_numeric($postData['post_id'])) {
                throw new Exception('Post ID is required');
            }
            
            if (!isset($postData['text']) || empty(trim($postData['text']))) {
                throw new Exception('Comment text is required');
            }
            
            $postId = (int)$postData['post_id'];
            $text = trim($postData['text']);
            
            // Add comment to database
            $success = $this->db->addComment($postId, $publisherId, $text);
            
            if ($success) {
                return json_encode([
                    'success' => true,
                    'message' => 'Comment added successfully'
                ]);
            } else {
                throw new Exception('Failed to add comment');
            }
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Get advertisements
     */
    public function getAdvertisements() {
        try {
            $ads = $this->db->getAdvertisements();
            
            // Fix image paths
            foreach ($ads as &$ad) {
                if ($ad['img']) {
                    $ad['img'] = '/skillara/uploads/ads/' . $ad['img'];
                }
            }
            
            return json_encode([
                'success' => true,
                'data' => $ads
            ]);
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Add new advertisement (for providers only)
     */
    public function addAdvertisement() {
        try {
            $session = $this->checkSession();
            
            // Check if user is provider
            if ($session['user_type'] !== 'provider') {
                throw new Exception('Only service providers can add advertisements');
            }
            
            // Check if form data is multipart/form-data (for file upload)
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            if (strpos($contentType, 'multipart/form-data') === false) {
                throw new Exception('Invalid content type for file upload');
            }
            
            // Validate required fields
            if (empty($_POST['text'])) {
                throw new Exception('Advertisement text is required');
            }
            
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('Image is required');
            }
            
            // Handle image upload
            $imageFileName = $this->uploadImage($_FILES['image'], 'ads');
            
            // Add to database
            $success = $this->db->addAdvertisement(
                $_POST['text'],
                $_POST['link'] ?? null,
                $imageFileName
            );
            
            if ($success) {
                return json_encode([
                    'success' => true,
                    'message' => 'Advertisement added successfully'
                ]);
            } else {
                throw new Exception('Failed to add advertisement');
            }
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Search posts
     */
    public function searchPosts($keyword) {
        try {
            if (empty($keyword)) {
                return $this->getAllPosts();
            }
            
            $posts = $this->db->searchPosts($keyword);
            
            // Fix image paths
            foreach ($posts as &$post) {
                if ($post['post_image'] && $post['post_image'] !== 'default_avatar.jpg') {
                    $post['post_image'] = '/skillara/uploads/ads/' . $post['post_image'];
                }
                if ($post['author_avatar'] && $post['author_avatar'] !== 'default_avatar.jpg') {
                    $post['author_avatar'] = '/skillara/uploads/profile/' . $post['author_avatar'];
                }
                
                // Comments are already arrays
                if ($post['comments']) {
                    foreach ($post['comments'] as &$comment) {
                        if ($comment['avatar'] && $comment['avatar'] !== 'default_avatar.jpg') {
                            $comment['avatar'] = '/skillara/uploads/profile/' . $comment['avatar'];
                        }
                    }
                }
            }
            
            return json_encode([
                'success' => true,
                'data' => $posts
            ]);
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Upload image file
     */
    private function uploadImage($file, $type = 'ads') {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        // Validate file type
        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Only JPG, PNG, GIF, and WebP images are allowed');
        }
        
        // Validate file size
        if ($file['size'] > $maxSize) {
            throw new Exception('Image size must be less than 5MB');
        }
        
        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . "/../uploads/$type/";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = $type . '_' . time() . '_' . uniqid() . '.' . $extension;
        $filePath = $uploadDir . $fileName;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception('Failed to upload image');
        }
        
        return $fileName;
    }
}
?>