<?php
// landing_page/testimonials_handler.php

require_once 'landing_db.php';

header('Content-Type: application/json');

try {
    $db = new LandingPageDB();
    $testimonials = $db->getLandingTestimonials(6);
    
    // Fix image paths
    foreach ($testimonials as &$testimonial) {
        if (!empty($testimonial['profile_picture'])) {
            // Add the correct path
            $testimonial['profile_picture'] = '/skillara/uploads/profile/' . $testimonial['profile_picture'];
        } else {
            // Use default image
            $testimonial['profile_picture'] = '/skillara/uploads/profile/default_avatar.jpg';
        }
    }
    
    echo json_encode([
        'success' => true,
        'testimonials' => $testimonials
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'testimonials' => []
    ]);
}
?>