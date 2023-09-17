export function pointRectCollision(point, rect) {
    return (point.x > rect.x && point.x < rect.x + rect.width && point.y > rect.y && point.y < rect.y + rect.height);
}

