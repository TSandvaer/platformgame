class NPCManager {
    constructor(data) {
        this.data = data;
    }

    // Create a new NPC at the specified position
    addNPC(x, y, npcType = 'blacksmith') {
        const npc = this.data.createNPC(x, y, npcType);
        if (npc) {
        }
        return npc;
    }

    // Remove an NPC by ID
    removeNPC(id) {
        const removed = this.data.removeNPC(id);
        if (removed) {
        }
        return removed;
    }

    // Get NPC at specific coordinates (for selection)
    getNPCAtPosition(x, y, tolerance = 10) {
        for (const npc of this.data.npcs) {
            // Only return visible NPCs
            if (!npc.isVisible) continue;

            if (x >= npc.x - tolerance && x <= npc.x + npc.width + tolerance &&
                y >= npc.y - tolerance && y <= npc.y + npc.height + tolerance) {
                return npc;
            }
        }
        return null;
    }

    // Select an NPC
    selectNPC(npc) {
        this.data.selectedNPC = npc;
    }

    // Get currently selected NPC
    getSelectedNPC() {
        return this.data.selectedNPC;
    }

    // Update NPC properties
    updateNPCProperties(npcId, properties) {
        const npc = this.data.getNPCById(npcId);
        if (!npc) return false;

        // Update basic properties
        if (properties.x !== undefined) npc.x = properties.x;
        if (properties.y !== undefined) npc.y = properties.y;
        if (properties.facing !== undefined) npc.facing = properties.facing;
        if (properties.interactionRadius !== undefined) {
            npc.interactionRadius = Math.max(0, properties.interactionRadius);
        }
        if (properties.canInteract !== undefined) {
            npc.canInteract = properties.canInteract;
        }
        if (properties.dialogueId !== undefined) {
            npc.dialogueId = properties.dialogueId;
        }

        return true;
    }

    // Move NPC to new position
    moveNPC(npcId, x, y) {
        const npc = this.data.getNPCById(npcId);
        if (!npc) return false;

        npc.x = x;
        npc.y = y;

        return true;
    }

    // Duplicate an NPC
    duplicateNPC(npcId) {
        const original = this.data.getNPCById(npcId);
        if (!original) return null;

        const duplicate = this.addNPC(original.x + 50, original.y, original.type);
        if (duplicate) {
            // Copy properties from original
            duplicate.facing = original.facing;
            duplicate.interactionRadius = original.interactionRadius;
            duplicate.canInteract = original.canInteract;
            duplicate.dialogueId = original.dialogueId;
        }

        return duplicate;
    }

    // Get NPCs in a specific area
    getNPCsInArea(x, y, width, height) {
        return this.data.getNPCsInBounds(x, y, x + width, y + height);
    }

    // Clear all NPCs
    clearAllNPCs() {
        const count = this.data.npcs.length;
        this.data.clearAllNPCs();
    }

    // Get NPC statistics
    getNPCStats() {
        const stats = {
            total: this.data.npcs.length,
            byType: {},
            interactive: 0,
            nonInteractive: 0
        };

        for (const npc of this.data.npcs) {
            // Count by type
            stats.byType[npc.type] = (stats.byType[npc.type] || 0) + 1;

            // Count by interaction status
            if (npc.canInteract) {
                stats.interactive++;
            } else {
                stats.nonInteractive++;
            }
        }

        return stats;
    }

    // Validate NPC data
    validateNPCData() {
        const issues = [];

        for (const npc of this.data.npcs) {
            // Check for invalid positions
            if (npc.x < 0 || npc.y < 0) {
                issues.push(`NPC ${npc.id} has negative coordinates`);
            }

            // Check for invalid interaction radius
            if (npc.interactionRadius < 0) {
                issues.push(`NPC ${npc.id} has negative interaction radius`);
            }
        }

        return issues;
    }
}
