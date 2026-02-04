<?php
// main_page/main_db.php

require_once 'database.php';

class MainDB {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get client info for sidebar
     */
    public function getClientInfo($client_id) {
        try {
            $sql = "SELECT username, email, profile_picture 
                    FROM Client 
                    WHERE id_client = :client_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":client_id", $client_id);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("Get client info error: " . $e->getMessage());
            return null;
        }
    }

        /**
     * Get providers client worked with
     */
    public function getClientProviders($client_id) {
        try {
            $sql = "SELECT 
                    sp.id_provider,
                    sp.profile_picture,
                    sp.username,
                    GROUP_CONCAT(DISTINCT st.name_service_type SEPARATOR ', ') as services,
                    COALESCE(AVG(t.rating), 0) as rating
                    FROM Client_provider cp
                    JOIN Service_provider sp ON cp.id_provider = sp.id_provider
                    LEFT JOIN Provider_service_type pst ON sp.id_provider = pst.id_provider
                    LEFT JOIN Service_type st ON pst.id_service_type = st.id_service_type
                    LEFT JOIN Testimonials t ON sp.id_provider = t.id_provider AND t.id_client = cp.id_client
                    WHERE cp.id_client = :client_id
                    GROUP BY sp.id_provider, sp.profile_picture, sp.username";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":client_id", $client_id);
            $stmt->execute();
            
            $providers = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $providers[] = [
                    'id' => $row['id_provider'],
                    'name' => $row['username'],
                    'service' => $row['services'] ?: 'Service Provider',
                    'rating' => round($row['rating'], 1),
                    'img' => '/skillara/uploads/profile/' . $row['profile_picture']
                ];
            }
            
            return $providers;
            
        } catch(PDOException $e) {
            error_log("Get client providers error: " . $e->getMessage());
            return [];
        }
    }
    /**
     * Get service provider info for sidebar
     */
    public function getProviderInfo($provider_id) {
        try {
            $sql = "SELECT 
                    sp.profile_picture,
                    sp.username,
                    sp.email,
                    GROUP_CONCAT(DISTINCT st.name_service_type SEPARATOR ', ') as service_types
                    FROM Service_provider sp
                    LEFT JOIN Provider_service_type pst ON sp.id_provider = pst.id_provider
                    LEFT JOIN Service_type st ON pst.id_service_type = st.id_service_type
                    WHERE sp.id_provider = :provider_id
                    GROUP BY sp.id_provider, sp.profile_picture, sp.username, sp.email";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $provider_id);
            $stmt->execute();
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row) {
                return [
                    'username' => $row['username'],
                    'fullname' => $row['username'], // Using username as fallback for fullname
                    'email' => $row['email'],
                    'profession' => $row['service_types'] ?: 'Service Provider',
                    'profile_picture' => '/skillara/uploads/profile/' . $row['profile_picture']
                ];
            }
            
            return null;
            
        } catch(PDOException $e) {
            error_log("Get provider info error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get counters
     */
    public function getCounters() {
        try {
            $counters = [];
            
            // Total providers
            $sql1 = "SELECT COUNT(*) as total_providers FROM Service_provider";
            $stmt1 = $this->conn->query($sql1);
            $row1 = $stmt1->fetch(PDO::FETCH_ASSOC);
            $counters['total_providers'] = $row1['total_providers'];
            
            // Total services
            $sql2 = "SELECT COUNT(*) as total_services FROM Services";
            $stmt2 = $this->conn->query($sql2);
            $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
            $counters['total_services'] = $row2['total_services'];
            
            return $counters;
            
        } catch(PDOException $e) {
            error_log("Get counters error: " . $e->getMessage());
            return [
                'total_providers' => 500,
                'total_services' => 400
            ];
        }
    }

    /**
     * Get provider cards for main page
     */
    public function getProviderCards($limit = 9) {
        try {
            $sql = "SELECT 
                    sp.id_provider,
                    sp.profile_picture,
                    sp.username,
                    sp.email,
                    sp.location,
                    GROUP_CONCAT(DISTINCT st.name_service_type SEPARATOR ', ') as service_types,
                    MAX(CASE WHEN sm.name_media = 'Facebook' THEN smp.link END) as facebook,
                    MAX(CASE WHEN sm.name_media = 'Instagram' THEN smp.link END) as instagram
                    FROM Service_provider sp
                    LEFT JOIN Provider_service_type pst ON sp.id_provider = pst.id_provider
                    LEFT JOIN Service_type st ON pst.id_service_type = st.id_service_type
                    LEFT JOIN social_medias_provider smp ON sp.id_provider = smp.id_provider
                    LEFT JOIN social_medias sm ON smp.id_media = sm.id_media
                    GROUP BY sp.id_provider
                    ORDER BY RAND()
                    LIMIT :limit";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":limit", (int)$limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $cards = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Get random rating for now (4.0-5.0)
                $rating = rand(40, 50) / 10;
                
                $cards[] = [
                    'id' => $row['id_provider'],
                    'name' => $row['username'],
                    'profession' => $row['service_types'] ?: 'Service Provider',
                    'location' => $row['location'] ?: 'Not specified',
                    'rating' => $rating,
                    'img' => '/skillara/uploads/profile/' . $row['profile_picture'],
                    'icons' => [
                        [
                            'class' => 'fa-brands fa-facebook',
                            'link' => $row['facebook'] ?: '#'
                        ],
                        [
                            'class' => 'fa-brands fa-square-instagram',
                            'link' => $row['instagram'] ?: '#'
                        ],
                        [
                            'class' => 'fa-solid fa-envelope',
                            'link' => 'mailto:' . $row['email']
                        ],
                        [
                            'class' => 'fa-solid fa-map-location-dot',
                            'link' => 'https://www.google.com/maps'
                        ]
                    ]
                ];
            }
            
            return $cards;
            
        } catch(PDOException $e) {
            error_log("Get provider cards error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get about me box data
     */
   public function getAboutMeData($provider_id) {
    try {
        $sql = "SELECT 
                sp.username,
                sp.email,
                sp.bio,
                GROUP_CONCAT(DISTINCT s.icon ORDER BY s.title SEPARATOR '|') as skill_icons,
                GROUP_CONCAT(DISTINCT s.title ORDER BY s.title SEPARATOR '|') as skill_titles
                FROM Service_provider sp
                LEFT JOIN Skills_provider spk ON sp.id_provider = spk.id_provider
                LEFT JOIN Skills s ON spk.id_skill = s.id_skill
                WHERE sp.id_provider = :provider_id
                GROUP BY sp.id_provider, sp.username, sp.email, sp.bio";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":provider_id", $provider_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            // Parse skills into arrays
            $skill_icons = !empty($row['skill_icons']) ? explode('|', $row['skill_icons']) : [];
            $skill_titles = !empty($row['skill_titles']) ? explode('|', $row['skill_titles']) : [];
            
            // Combine into skill objects
            $skills = [];
            for ($i = 0; $i < count($skill_icons); $i++) {
                if (!empty($skill_icons[$i]) && !empty($skill_titles[$i])) {
                    $skills[] = [
                        'icon' => $skill_icons[$i],
                        'title' => $skill_titles[$i]
                    ];
                }
            }
            
            return [
                'name' => $row['username'],
                'email' => $row['email'],
                'bio' => $row['bio'] ?: 'No bio available.',
                'skills' => $skills
            ];
        }
        
        return null;
        
    } catch(PDOException $e) {
        error_log("Get about me error: " . $e->getMessage());
        return null;
    }
}
    /**
     * Get popular services
     */
    public function getPopularServices($limit = 4) {
        try {
            $sql = "SELECT 
                    st.name_service_type AS service_type,
                    COUNT(pst.id_provider) AS provider_count,
                    ROUND((COUNT(pst.id_provider) * 100.0 / total_providers.total), 2) AS percentage_of_providers
                    FROM Service_type st
                    LEFT JOIN Provider_service_type pst ON st.id_service_type = pst.id_service_type
                    CROSS JOIN (SELECT COUNT(DISTINCT id_provider) AS total FROM Provider_service_type) AS total_providers
                    GROUP BY st.id_service_type, st.name_service_type, total_providers.total
                    HAVING COUNT(pst.id_provider) > 0
                    ORDER BY provider_count DESC
                    LIMIT :limit";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":limit", (int)$limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $services = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $services[] = [
                    'title' => $row['service_type'],
                    'description' => '+' . $row['provider_count'] . ' providers',
                    'popularity' => $row['percentage_of_providers']
                ];
            }
            
            return $services;
            
        } catch(PDOException $e) {
            error_log("Get popular services error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get all providers for modal
     */
    public function getAllProviders() {
        try {
            $sql = "SELECT 
                    sp.id_provider,
                    sp.username,
                    sp.profile_picture,
                    GROUP_CONCAT(DISTINCT st.name_service_type SEPARATOR ', ') as service_types
                    FROM Service_provider sp
                    LEFT JOIN Provider_service_type pst ON sp.id_provider = pst.id_provider
                    LEFT JOIN Service_type st ON pst.id_service_type = st.id_service_type
                    GROUP BY sp.id_provider, sp.username, sp.profile_picture
                    ORDER BY sp.username";
            
            $stmt = $this->conn->query($sql);
            
            $providers = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $providers[] = [
                    'id' => $row['id_provider'],
                    'name' => $row['username'],
                    'profession' => $row['service_types'] ?: 'Service Provider',
                    'rating' => rand(40, 50) / 10, // Random rating for now
                    'img' => '/skillara/uploads/profile/' . $row['profile_picture']
                ];
            }
            
            return $providers;
            
        } catch(PDOException $e) {
            error_log("Get all providers error: " . $e->getMessage());
            return [];
        }
    }


    
/**
 * Update client profile picture
 */
public function updateClientProfilePicture($clientId, $imageName) {
    try {
        $sql = "UPDATE Client 
                SET profile_picture = :image_name 
                WHERE id_client = :client_id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":image_name", $imageName);
        $stmt->bindParam(":client_id", $clientId);
        
        return $stmt->execute();
        
    } catch(PDOException $e) {
        error_log("MainDB updateClientProfilePicture error: " . $e->getMessage());
        return false;
    }
}
}




?>