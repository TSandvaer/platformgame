class NPCData {
    constructor() {
        this.npcs = [];
        this.nextNPCId = 1;
        this.selectedNPC = null;
        this.npcTypes = {
            blacksmith: {
                name: 'Blacksmith',
                spriteFolder: 'sprites/NPC/Blacksmith/Sprites',
                width: 48,
                height: 48,
                scale: 1.0,
                animations: {
                    idle: { file: 'BLACKSMITH.png', frames: 7, frameWidth: 96, frameHeight: 96 }
                }
            },
            alchemist: {
                name: 'Alchemist',
                spriteFolder: 'sprites/NPC',
                width: 48,
                height: 48,
                scale: 1.0,
                animations: {
                    idle: { file: 'ALCHEMIST.png', frames: 8, frameWidth: 96, frameHeight: 96 }
                }
            },
            enchanter: {
                name: 'Enchanter',
                spriteFolder: 'sprites/NPC',
                width: 64,
                height: 48,
                scale: 1.0,
                animations: {
                    idle: { file: 'ENCHANTER.png', frames: 8, frameWidth: 128, frameHeight: 96 }
                }
            }
        };
    }

    createNPC(x, y, npcType = 'blacksmith') {
        const typeData = this.npcTypes[npcType];
        if (!typeData) {
            console.error('Unknown NPC type:', npcType);
            return null;
        }

        const npc = {
            id: this.nextNPCId++,
            type: npcType,
            x: x,
            y: y,
            width: typeData.width,
            height: typeData.height,

            // Animation state
            currentAnimation: 'idle',
            frameIndex: 0,
            frameTimer: 0,
            frameRate: 150,
            facing: 'right',

            // NPC properties
            interactionRadius: 50,
            canInteract: true,
            dialogueId: null, // For future dialogue system

            // Metadata
            isVisible: true
        };

        this.npcs.push(npc);
        return npc;
    }

    removeNPC(id) {
        const index = this.npcs.findIndex(npc => npc.id === id);
        if (index !== -1) {
            const removed = this.npcs.splice(index, 1)[0];
            if (this.selectedNPC && this.selectedNPC.id === id) {
                this.selectedNPC = null;
            }
            return removed;
        }
        return null;
    }

    getNPCById(id) {
        return this.npcs.find(npc => npc.id === id);
    }

    getNPCsInBounds(left, top, right, bottom) {
        return this.npcs.filter(npc => {
            return npc.x + npc.width > left &&
                   npc.x < right &&
                   npc.y + npc.height > top &&
                   npc.y < bottom;
        });
    }

    clearAllNPCs() {
        this.npcs = [];
        this.selectedNPC = null;
        this.nextNPCId = 1;
    }

    // Export/Import functionality
    exportNPCData() {
        return {
            npcs: this.npcs.map(npc => ({
                id: npc.id,
                type: npc.type,
                x: npc.x,
                y: npc.y,
                facing: npc.facing,
                interactionRadius: npc.interactionRadius,
                canInteract: npc.canInteract,
                dialogueId: npc.dialogueId
            })),
            nextNPCId: this.nextNPCId
        };
    }

    importNPCData(data) {
        if (!data || !Array.isArray(data.npcs)) return false;

        this.clearAllNPCs();
        this.nextNPCId = data.nextNPCId || 1;

        for (const npcData of data.npcs) {
            const npc = this.createNPC(npcData.x, npcData.y, npcData.type);
            if (npc) {
                // Restore saved properties
                npc.id = npcData.id;
                npc.facing = npcData.facing || 'right';
                npc.interactionRadius = npcData.interactionRadius || 50;
                npc.canInteract = npcData.canInteract !== undefined ? npcData.canInteract : true;
                npc.dialogueId = npcData.dialogueId || null;
                npc.isVisible = npcData.isVisible !== undefined ? npcData.isVisible : true;
            }
        }

        return true;
    }

    // Utility methods
    getNPCBounds(npc) {
        return {
            left: npc.x,
            right: npc.x + npc.width,
            top: npc.y,
            bottom: npc.y + npc.height
        };
    }

    getNPCCenter(npc) {
        return {
            x: npc.x + npc.width / 2,
            y: npc.y + npc.height / 2
        };
    }

    isPlayerInInteractionRange(npc, player) {
        if (!npc.canInteract || !player) return false;

        const npcCenter = this.getNPCCenter(npc);
        const playerCenter = {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2
        };

        const distance = Math.sqrt(
            Math.pow(npcCenter.x - playerCenter.x, 2) +
            Math.pow(npcCenter.y - playerCenter.y, 2)
        );

        return distance <= npc.interactionRadius;
    }
}
