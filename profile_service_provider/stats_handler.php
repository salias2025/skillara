<?php
// profile_service_provider/stats_handler.php

require_once 'profile_db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$providerId = $_GET['providerId'] ?? 0;

if ($action === 'getStats') {
    if (!$providerId) {
        echo json_encode(['success' => false, 'message' => 'No provider ID']);
        exit;
    }
    
    try {
        $db = new ProfileDB();
        $stats = $db->getStatistics($providerId);
        
        // Calculate profile completion percentage (simplified)
        $completionPercentage = calculateProfileCompletion($stats);
        
        echo json_encode([
            'success' => true,
            'stats' => $stats,
            'profileCompletion' => $completionPercentage,
            'globalRating' => round($stats['average_rating'] ?? 0, 1),
            'currentTasks' => $stats['total_works'] ?? 0
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to load statistics']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function calculateProfileCompletion($stats) {
    // Simplified calculation
    $totalSections = 0;
    $completedSections = 0;
    
    // Profile basics (always counts as 1 if we have stats)
    $totalSections++;
    if (!empty($stats)) $completedSections++;
    
    // Services
    $totalSections++;
    if (($stats['service_count'] ?? 0) > 0) $completedSections++;
    
    // Skills
    $totalSections++;
    if (($stats['skill_count'] ?? 0) > 0) $completedSections++;
    
    // Portfolio
    $totalSections++;
    if (($stats['portfolio_count'] ?? 0) > 0) $completedSections++;
    
    // Testimonials
    $totalSections++;
    if (($stats['testimonial_count'] ?? 0) > 0) $completedSections++;
    
    // Certifications
    $totalSections++;
    if (($stats['certification_count'] ?? 0) > 0) $completedSections++;
    
    return $totalSections > 0 ? round(($completedSections / $totalSections) * 100) : 0;
}
?>