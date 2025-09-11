// Utility functions for IFC element handling and formatting

/**
 * Get the appropriate Tailwind CSS classes for element type colors
 * @param type - The IFC element type string
 * @returns Tailwind CSS classes for text color
 */
export const getElementTypeColor = (type: string): string => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('wall')) return 'text-green-600 dark:text-green-400';
    if (typeLower.includes('slab') || typeLower.includes('floor') || typeLower.includes('roof')) return 'text-blue-600 dark:text-blue-400';
    if (typeLower.includes('beam') || typeLower.includes('column')) return 'text-orange-600 dark:text-orange-400';
    if (typeLower.includes('door') || typeLower.includes('window')) return 'text-purple-600 dark:text-purple-400';
    if (typeLower.includes('buildingelementproxy') || typeLower.includes('furnishing')) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
};

/**
 * Format IFC element type names for display
 * @param type - The raw IFC element type string
 * @returns Formatted element type name
 */
export const formatElementType = (type: string): string => {
    // Handle different IFC prefix variations and remove them
    let cleanType = type
        .replace(/^IFC/i, '') // Remove IFC prefix (case insensitive)
        .replace(/^ifc/i, '') // Also handle lowercase ifc
        .replace(/^Ifc/, ''); // Handle title case Ifc

    // Add spaces before capital letters (but keep existing spaces)
    cleanType = cleanType.replace(/([A-Z])/g, ' $1').trim();

    // Handle special cases and clean up
    cleanType = cleanType
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

    // Title case the final result
    return cleanType.replace(/\b\w/g, l => l.toUpperCase());
};
