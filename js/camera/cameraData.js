class CameraData {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.mode = 'character'; // 'free' or 'character'
        this.smoothing = 0.1;
        this.minX = 0;
        this.minY = 0;
        this.maxX = Infinity;
        this.maxY = Infinity;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    setMode(mode) {
        if (mode === 'free' || mode === 'character') {
            this.mode = mode;
            return true;
        }
        return false;
    }

    toggleMode() {
        this.mode = this.mode === 'free' ? 'character' : 'free';
        return this.mode;
    }

    setBounds(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    applyConstraints(x, y) {
        const constrainedX = Math.max(this.minX, Math.min(this.maxX, x));
        const constrainedY = Math.max(this.minY, Math.min(this.maxY, y));
        return { x: constrainedX, y: constrainedY };
    }

    getState() {
        return {
            x: this.x,
            y: this.y,
            targetX: this.targetX,
            targetY: this.targetY,
            mode: this.mode,
            bounds: {
                minX: this.minX,
                minY: this.minY,
                maxX: this.maxX,
                maxY: this.maxY
            }
        };
    }

    loadState(state) {
        if (state.x !== undefined) this.x = state.x;
        if (state.y !== undefined) this.y = state.y;
        if (state.targetX !== undefined) this.targetX = state.targetX;
        if (state.targetY !== undefined) this.targetY = state.targetY;
        if (state.mode !== undefined) this.mode = state.mode;
        if (state.bounds) {
            this.setBounds(state.bounds.minX, state.bounds.minY, state.bounds.maxX, state.bounds.maxY);
        }
    }
}