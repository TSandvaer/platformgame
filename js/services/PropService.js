/**
 * PropService
 * Client-side service for interacting with GLOBAL prop and sprite sheet APIs
 * Props and sprite sheets are shared across all games
 */
class PropService {
    constructor() {
        this.baseUrl = '/api/props';
    }

    // ============================================
    // SPRITE SHEET API METHODS (GLOBAL)
    // ============================================

    /**
     * Get all sprite sheets (global - shared across all games)
     */
    async getSpriteSheets() {
        try {
            const response = await fetch(`${this.baseUrl}/spritesheets`);
            if (!response.ok) {
                throw new Error(`Failed to fetch sprite sheets: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching sprite sheets:', error);
            throw error;
        }
    }

    /**
     * Register a new sprite sheet (global)
     */
    async registerSpriteSheet(sheetData) {
        try {
            const response = await fetch(`${this.baseUrl}/spritesheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sheetData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to register sprite sheet');
            }

            return await response.json();
        } catch (error) {
            console.error('Error registering sprite sheet:', error);
            throw error;
        }
    }

    /**
     * Update a sprite sheet (global)
     */
    async updateSpriteSheet(sheetId, updateData) {
        try {
            const response = await fetch(`${this.baseUrl}/spritesheets/${sheetId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update sprite sheet');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating sprite sheet:', error);
            throw error;
        }
    }

    /**
     * Delete a sprite sheet (global)
     */
    async deleteSpriteSheet(sheetId) {
        try {
            const response = await fetch(`${this.baseUrl}/spritesheets/${sheetId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete sprite sheet');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting sprite sheet:', error);
            throw error;
        }
    }

    // ============================================
    // PROP DEFINITION API METHODS (GLOBAL)
    // ============================================

    /**
     * Get all props (global - shared across all games)
     */
    async getProps(category = null) {
        try {
            let url = `${this.baseUrl}/props`;
            if (category) {
                url += `?category=${encodeURIComponent(category)}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch props: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching props:', error);
            throw error;
        }
    }

    /**
     * Get a single prop by ID (global)
     */
    async getProp(propId) {
        try {
            const response = await fetch(`${this.baseUrl}/props/${propId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch prop: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching prop:', error);
            throw error;
        }
    }

    /**
     * Create a new prop definition (global)
     */
    async createProp(propData) {
        try {
            const response = await fetch(`${this.baseUrl}/props`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create prop');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating prop:', error);
            throw error;
        }
    }

    /**
     * Update a prop definition (global)
     */
    async updateProp(propId, updateData) {
        try {
            const response = await fetch(`${this.baseUrl}/props/${propId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update prop');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating prop:', error);
            throw error;
        }
    }

    /**
     * Delete a prop definition (global)
     */
    async deleteProp(propId) {
        try {
            const response = await fetch(`${this.baseUrl}/props/${propId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete prop');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting prop:', error);
            throw error;
        }
    }

    /**
     * Get all prop categories (global)
     */
    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/props/categories`);
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    /**
     * Convert prop definitions from database format to PropData format
     */
    convertToGameFormat(propDefinitions) {
        const propsBySheet = {};

        propDefinitions.forEach(prop => {
            if (!propsBySheet[prop.spriteSheet]) {
                propsBySheet[prop.spriteSheet] = [];
            }

            propsBySheet[prop.spriteSheet].push({
                key: prop.propKey,
                name: prop.name,
                tileX: prop.tileX,
                tileY: prop.tileY,
                width: prop.width,
                height: prop.height,
                category: prop.category,
                hasGlow: prop.hasGlow,
                hasFlame: prop.hasFlame,
                isChest: prop.isChest,
                chestRow: prop.chestRow,
                isObstacle: prop.isObstacle,
                destroyable: prop.destroyable,
                damagePerSecond: prop.damagePerSecond,
                maxDurability: prop.maxDurability
            });
        });

        return propsBySheet;
    }
}

// Create singleton instance
window.propService = new PropService();
