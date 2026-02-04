<?php
// free_solutions/free_solutions_db.php

require_once __DIR__ . '/../registration/database.php';

class FreeSolutionsDB {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    /**
     * Get Publisher ID by username
     */
    public function getPublisherIdByUsername($username) {
        $sql = "SELECT id_publisher FROM Publisher WHERE publisher_username = :username";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':username' => $username]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ? $result['id_publisher'] : null;
    }
    
    /**
     * Get all posts with their comments (FIXED: removed JSON_ARRAYAGG)
     */
    public function getAllPosts() {
        $sql = "SELECT 
                    p.id_post,
                    p.text as post_content,
                    p.image as post_image,
                    p.date as post_date,
                    pub.publisher_username as post_author,
                    pub.profile_picture as author_avatar
                FROM Post p
                JOIN Publisher pub ON p.publisher = pub.id_publisher
                ORDER BY p.date DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get comments for each post
        foreach ($posts as &$post) {
            $post['comments'] = $this->getCommentsForPost($post['id_post']);
        }
        
        return $posts;
    }
    
    /**
     * Get comments for a specific post
     */
    private function getCommentsForPost($postId) {
        $sql = "SELECT 
                    c.id_comment,
                    c.text,
                    c.date,
                    pub.publisher_username as author,
                    pub.profile_picture as avatar
                FROM Comment c
                JOIN Publisher pub ON c.id_publisher = pub.id_publisher
                WHERE c.id_post = :post_id
                ORDER BY c.date";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':post_id' => $postId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Add new post
     */
    public function addPost($text, $publisherId, $image = null) {
        $sql = "INSERT INTO Post (text, publisher, image) 
                VALUES (:text, :publisher, :image)";
        
        $stmt = $this->conn->prepare($sql);
        $result = $stmt->execute([
            ':text' => $text,
            ':publisher' => $publisherId,
            ':image' => $image
        ]);
        
        if ($result) {
            return $this->conn->lastInsertId();
        }
        return false;
    }
    
    /**
     * Add comment to post
     */
    public function addComment($postId, $publisherId, $text) {
        $sql = "INSERT INTO Comment (id_post, id_publisher, text) 
                VALUES (:post_id, :publisher_id, :text)";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':post_id' => $postId,
            ':publisher_id' => $publisherId,
            ':text' => $text
        ]);
    }
    
    /**
     * Get advertisements
     */
    public function getAdvertisements() {
        $sql = "SELECT id_add, img, text, link 
                FROM Advertisement 
                ORDER BY id_add DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Add new advertisement
     */
    public function addAdvertisement($text, $link, $image) {
        $sql = "INSERT INTO Advertisement (text, link, img) 
                VALUES (:text, :link, :image)";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':text' => $text,
            ':link' => $link,
            ':image' => $image
        ]);
    }
    
    /**
     * Search posts by keyword (FIXED: removed JSON_ARRAYAGG)
     */
    public function searchPosts($keyword) {
        $sql = "SELECT 
                    p.id_post,
                    p.text as post_content,
                    p.image as post_image,
                    p.date as post_date,
                    pub.publisher_username as post_author,
                    pub.profile_picture as author_avatar
                FROM Post p
                JOIN Publisher pub ON p.publisher = pub.id_publisher
                WHERE p.text LIKE :keyword
                ORDER BY p.date DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':keyword' => "%$keyword%"]);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get comments for each post
        foreach ($posts as &$post) {
            $post['comments'] = $this->getCommentsForPost($post['id_post']);
        }
        
        return $posts;
    }
    
    /**
     * Get user info from Publisher table
     */
    public function getUserByUsername($username) {
        $sql = "SELECT id_publisher, publisher_username, profile_picture 
                FROM Publisher 
                WHERE publisher_username = :username";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get user type (client or provider)
     */
    public function getUserType($username) {
        // Check if user is in Service_provider table
        $sql_provider = "SELECT 'provider' as user_type 
                         FROM Service_provider 
                         WHERE username = :username 
                         LIMIT 1";
        
        $stmt_provider = $this->conn->prepare($sql_provider);
        $stmt_provider->execute([':username' => $username]);
        
        if ($stmt_provider->rowCount() > 0) {
            return 'provider';
        }
        
        // Check if user is in Client table
        $sql_client = "SELECT 'client' as user_type 
                       FROM Client 
                       WHERE username = :username 
                       LIMIT 1";
        
        $stmt_client = $this->conn->prepare($sql_client);
        $stmt_client->execute([':username' => $username]);
        
        if ($stmt_client->rowCount() > 0) {
            return 'client';
        }
        
        return null; // User not found
    }
}
?>