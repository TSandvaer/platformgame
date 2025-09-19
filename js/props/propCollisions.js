class PropCollisions {
    checkPlayerPropCollisions(player, props, propTypes) {
        // Check collision with obstacle props - 4-sided collision
        props.filter(prop => prop.isObstacle).forEach(prop => {
            if (this.checkCollision(player, this.getPropBounds(prop, propTypes))) {
                const bounds = this.getPropBounds(prop, propTypes);

                // Calculate overlap on each side
                const overlapLeft = (player.x + player.width) - bounds.x;
                const overlapRight = (bounds.x + bounds.width) - player.x;
                const overlapTop = (player.y + player.height) - bounds.y;
                const overlapBottom = (bounds.y + bounds.height) - player.y;

                // Find the smallest overlap to determine collision side
                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapX < minOverlapY) {
                    // Horizontal collision (left or right side)
                    if (overlapLeft < overlapRight) {
                        // Colliding with left side of prop
                        player.x = bounds.x - player.width;
                    } else {
                        // Colliding with right side of prop
                        player.x = bounds.x + bounds.width;
                    }
                    player.velocityX = 0;
                } else {
                    // Vertical collision (top or bottom side)
                    if (overlapTop < overlapBottom) {
                        // Colliding with top side of prop (landing on it)
                        player.y = bounds.y - player.height;
                        player.velocityY = 0;
                        player.onGround = true;
                    } else {
                        // Colliding with bottom side of prop (hitting from below)
                        player.y = bounds.y + bounds.height;
                        player.velocityY = 0;
                    }
                }
            }
        });
    }

    getPropBounds(prop, propTypes) {
        const propType = propTypes[prop.type];
        if (!propType) return { x: prop.x, y: prop.y, width: 0, height: 0 };

        const scale = prop.scale !== undefined ? prop.scale :
                     (prop.type === 'well' ? 1 :
                     (prop.type === 'barrel' || prop.type === 'crate') ? 1.2 :
                     (prop.type === 'smallPot' || prop.type === 'mediumPot' || prop.type === 'bigPot') ? 0.6 : 1.6);

        return {
            x: prop.x,
            y: prop.y,
            width: propType.width * scale,
            height: propType.height * scale
        };
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
}