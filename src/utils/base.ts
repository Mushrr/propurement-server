
/**
 * Check if an object has all the properties in an array
 * @param obj  object to check
 * @param properties array of properties to check
 * @returns true if the object has all the properties
 */
function hasProperties(obj: object, properties: string[]): boolean {
    return obj && properties.every(prop => Object.hasOwnProperty.call(obj, prop));
}


export {
    hasProperties
}