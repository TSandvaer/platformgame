class PropsMouseHandler {
    constructor(propSystem, propManager, platformSystem, viewport, camera) {
        this.propSystem = propSystem;
        this.propManager = propManager;
        this.platformSystem = platformSystem;
        this.viewport = viewport;
        this.camera = camera;
    }

    handleMouseDown(worldMouseX, worldMouseY, ctrlPressed = false, shiftPressed = false) {
        const result = this.propManager.handleMouseDown(
            worldMouseX,
            worldMouseY,
            this.platformSystem,
            ctrlPressed,
            shiftPressed,
            this.viewport,
            this.camera
        );

        return result;
    }

    handleMouseMove(worldMouseX, worldMouseY) {
        return this.propManager.handleMouseMove(worldMouseX, worldMouseY, this.viewport, this.camera);
    }

    handleMouseUp(ctrlPressed = false) {
        return this.propManager.handleMouseUp(ctrlPressed, this.viewport);
    }

    sendPropToBackground(prop) {
        // Get all z-orders, filtering out undefined/null values and converting to numbers
        const zOrders = this.propSystem.props.map(p => p.zOrder || 0).filter(z => !isNaN(z));

        // Find the lowest z-order, defaulting to 0 if no valid z-orders exist
        const minZOrder = zOrders.length > 0 ? Math.min(...zOrders) : 0;

        // Set this prop's z-order to be lower than the minimum
        prop.zOrder = minZOrder - 1;

        console.log(`Sent prop ${prop.type} to background with z-order: ${prop.zOrder}`);
    }

    bringPropToFront(prop) {
        // Get all z-orders, filtering out undefined/null values and converting to numbers
        const zOrders = this.propSystem.props.map(p => p.zOrder || 0).filter(z => !isNaN(z));

        // Find the highest z-order, defaulting to 0 if no valid z-orders exist
        const maxZOrder = zOrders.length > 0 ? Math.max(...zOrders) : 0;

        // Set this prop's z-order to be higher than the maximum
        prop.zOrder = maxZOrder + 1;

        // Update the next z-order counter to be higher
        this.propSystem.nextPropZOrder = Math.max(this.propSystem.nextPropZOrder, prop.zOrder + 1);

        console.log(`Brought prop ${prop.type} to front with z-order: ${prop.zOrder}`);
    }
}