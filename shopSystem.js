// ================================
// SISTEMA DE TIENDA - SHOP SYSTEM
// ================================

class ShopSystem {
    constructor() {
        // Inventario del jugador
        this.inventory = {
            avatars: ['👦'], // Martín es gratis
            ships: ['🚀'],   // Nave básica es gratis
            weapons: ['🗡️'], // Espada básica es gratis
            cars: ['🏎️'],    // Auto básico es gratis
            themes: ['default'],
            musicPacks: ['default']
        };

        // Items equipados actualmente
        this.equipped = {
            avatar: '👦',
            ship: '🚀',
            weapon: '🗡️',
            car: '🏎️',
            theme: 'default',
            musicPack: 'default'
        };

        // Catálogo completo de la tienda
        this.catalog = this.createCatalog();

        // Referencias DOM
        this.modal = null;

        this.loadInventory();
        this.createShopModal();

        console.log('🛒 Sistema de tienda inicializado');
    }

    // =============================
    // CATÁLOGO DE PRODUCTOS
    // =============================

    createCatalog() {
        return {
            // AVATARES
            avatars: [
                {
                    id: 'martin',
                    name: 'Martín',
                    icon: '👦',
                    price: 0,
                    rarity: 'common',
                    description: 'El héroe clásico'
                },
                {
                    id: 'sofia',
                    name: 'Sofía',
                    icon: '👧',
                    price: 100,
                    rarity: 'common',
                    description: 'La genio matemática'
                },
                {
                    id: 'superhero',
                    name: 'Superhéroe',
                    icon: '🦸‍♂️',
                    price: 250,
                    rarity: 'rare',
                    description: 'Poder ilimitado'
                },
                {
                    id: 'wizard',
                    name: 'Mago',
                    icon: '🧙‍♂️',
                    price: 500,
                    rarity: 'epic',
                    description: 'Magia matemática'
                },
                {
                    id: 'ninja',
                    name: 'Ninja',
                    icon: '🥷',
                    price: 350,
                    rarity: 'rare',
                    description: 'Velocidad extrema'
                },
                {
                    id: 'robot',
                    name: 'Robot',
                    icon: '🤖',
                    price: 400,
                    rarity: 'epic',
                    description: 'Cálculo perfecto'
                },
                {
                    id: 'alien',
                    name: 'Alienígena',
                    icon: '👽',
                    price: 600,
                    rarity: 'epic',
                    description: 'Inteligencia cósmica'
                },
                {
                    id: 'dragon',
                    name: 'Dragón',
                    icon: '🐉',
                    price: 1000,
                    rarity: 'legendary',
                    trophiesRequired: 10,
                    description: 'Poder legendario'
                }
            ],

            // NAVES (para Aventura Espacial)
            ships: [
                {
                    id: 'basic',
                    name: 'Nave Básica',
                    icon: '🚀',
                    price: 0,
                    rarity: 'common',
                    description: 'Tu primera nave',
                    stats: { speed: 5, firepower: 5 }
                },
                {
                    id: 'fast',
                    name: 'Nave Veloz',
                    icon: '🛸',
                    price: 200,
                    rarity: 'rare',
                    description: 'El doble de rápida',
                    stats: { speed: 10, firepower: 5 }
                },
                {
                    id: 'epic',
                    name: 'Nave Épica',
                    icon: '🛰️',
                    price: 500,
                    rarity: 'epic',
                    description: 'Tecnología avanzada',
                    stats: { speed: 10, firepower: 10 }
                },
                {
                    id: 'star',
                    name: 'Nave Estelar',
                    icon: '✨',
                    price: 750,
                    rarity: 'epic',
                    description: 'Brilla en la oscuridad',
                    stats: { speed: 12, firepower: 12 }
                },
                {
                    id: 'legendary',
                    name: 'Crucero Intergaláctico',
                    icon: '🌌',
                    price: 1200,
                    rarity: 'legendary',
                    trophiesRequired: 15,
                    description: 'La nave definitiva',
                    stats: { speed: 15, firepower: 15 }
                }
            ],

            // ARMAS (para Batalla de Jefes)
            weapons: [
                {
                    id: 'sword',
                    name: 'Espada',
                    icon: '🗡️',
                    price: 0,
                    rarity: 'common',
                    description: 'Clásica y efectiva',
                    damage: 10
                },
                {
                    id: 'double',
                    name: 'Espadas Dobles',
                    icon: '⚔️',
                    price: 150,
                    rarity: 'rare',
                    description: 'Doble daño',
                    damage: 15
                },
                {
                    id: 'trident',
                    name: 'Tridente',
                    icon: '🔱',
                    price: 400,
                    rarity: 'epic',
                    description: 'Poder del mar',
                    damage: 20
                },
                {
                    id: 'hammer',
                    name: 'Martillo',
                    icon: '🔨',
                    price: 300,
                    rarity: 'rare',
                    description: 'Golpes devastadores',
                    damage: 18
                },
                {
                    id: 'staff',
                    name: 'Báculo Mágico',
                    icon: '🪄',
                    price: 550,
                    rarity: 'epic',
                    description: 'Magia destructiva',
                    damage: 25
                },
                {
                    id: 'excalibur',
                    name: 'Excalibur',
                    icon: '⚡',
                    price: 1000,
                    rarity: 'legendary',
                    trophiesRequired: 20,
                    description: 'La espada legendaria',
                    damage: 35
                }
            ],

            // AUTOS (para Carrera Matemática)
            cars: [
                {
                    id: 'basic',
                    name: 'Auto Básico',
                    icon: '🏎️',
                    price: 0,
                    rarity: 'common',
                    description: 'Tu primer auto',
                    speed: 5
                },
                {
                    id: 'sport',
                    name: 'Auto Deportivo',
                    icon: '🏁',
                    price: 180,
                    rarity: 'rare',
                    description: 'Velocidad pura',
                    speed: 10
                },
                {
                    id: 'formula',
                    name: 'Fórmula 1',
                    icon: '🏆',
                    price: 450,
                    rarity: 'epic',
                    description: 'El más rápido',
                    speed: 15
                },
                {
                    id: 'rocket',
                    name: 'Auto Cohete',
                    icon: '💨',
                    price: 700,
                    rarity: 'epic',
                    description: 'Impulso a chorro',
                    speed: 18
                }
            ],

            // TEMAS DE COLOR
            themes: [
                {
                    id: 'default',
                    name: 'Tema Clásico',
                    icon: '🎨',
                    price: 0,
                    rarity: 'common',
                    description: 'Los colores originales',
                    colors: { primary: '#6366f1', secondary: '#ec4899' }
                },
                {
                    id: 'ocean',
                    name: 'Océano',
                    icon: '🌊',
                    price: 150,
                    rarity: 'rare',
                    description: 'Azules profundos',
                    colors: { primary: '#0891b2', secondary: '#06b6d4' }
                },
                {
                    id: 'forest',
                    name: 'Bosque',
                    icon: '🌲',
                    price: 150,
                    rarity: 'rare',
                    description: 'Verdes naturales',
                    colors: { primary: '#059669', secondary: '#10b981' }
                },
                {
                    id: 'sunset',
                    name: 'Atardecer',
                    icon: '🌅',
                    price: 300,
                    rarity: 'epic',
                    description: 'Naranjas cálidos',
                    colors: { primary: '#f97316', secondary: '#fb923c' }
                },
                {
                    id: 'galaxy',
                    name: 'Galaxia',
                    icon: '🌌',
                    price: 500,
                    rarity: 'epic',
                    description: 'Púrpuras cósmicos',
                    colors: { primary: '#7c3aed', secondary: '#a855f7' }
                }
            ]
        };
    }

    // =============================
    // RAREZA
    // =============================

    getRarityInfo(rarity) {
        const rarities = {
            common: {
                name: 'Común',
                color: '#9CA3AF',
                bgColor: 'rgba(156, 163, 175, 0.1)',
                icon: '⚪'
            },
            rare: {
                name: 'Raro',
                color: '#3B82F6',
                bgColor: 'rgba(59, 130, 246, 0.1)',
                icon: '🔵'
            },
            epic: {
                name: 'Épico',
                color: '#A855F7',
                bgColor: 'rgba(168, 85, 247, 0.1)',
                icon: '🟣'
            },
            legendary: {
                name: 'Legendario',
                color: '#F59E0B',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                icon: '🟡'
            }
        };
        return rarities[rarity] || rarities.common;
    }

    // =============================
    // INVENTARIO
    // =============================

    loadInventory() {
        try {
            const saved = localStorage.getItem('shopInventory');
            if (saved) {
                const data = JSON.parse(saved);
                this.inventory = data.inventory || this.inventory;
                this.equipped = data.equipped || this.equipped;
            }
        } catch (error) {
            console.error('❌ Error cargando inventario:', error);
        }
    }

    saveInventory() {
        try {
            const data = {
                inventory: this.inventory,
                equipped: this.equipped
            };
            localStorage.setItem('shopInventory', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Error guardando inventario:', error);
        }
    }

    hasItem(category, itemIcon) {
        return this.inventory[category].includes(itemIcon);
    }

    addToInventory(category, itemIcon) {
        if (!this.hasItem(category, itemIcon)) {
            this.inventory[category].push(itemIcon);
            this.saveInventory();
            return true;
        }
        return false;
    }

    equipItem(category, itemIcon) {
        if (this.hasItem(category, itemIcon)) {
            this.equipped[category] = itemIcon;
            this.saveInventory();
            console.log(`✅ Equipado: ${itemIcon} en ${category}`);
            return true;
        }
        return false;
    }

    // =============================
    // COMPRA
    // =============================

    canAfford(price) {
        if (!window.coinSystem) return false;
        return window.coinSystem.getStars() >= price;
    }

    hasTrophies(required) {
        if (!window.coinSystem || !required) return true;
        return window.coinSystem.getTrophies() >= required;
    }

    buyItem(category, item) {
        // Verificar si ya lo tiene
        if (this.hasItem(category, item.icon)) {
            return { success: false, message: '¡Ya tienes este item!' };
        }

        // Verificar trofeos requeridos
        if (item.trophiesRequired && !this.hasTrophies(item.trophiesRequired)) {
            return {
                success: false,
                message: `Necesitas ${item.trophiesRequired} 🏆 trofeos`
            };
        }

        // Verificar estrellas
        if (!this.canAfford(item.price)) {
            const needed = item.price - (window.coinSystem ? window.coinSystem.getStars() : 0);
            return {
                success: false,
                message: `Necesitas ${needed} ⭐ estrellas más`
            };
        }

        // Realizar compra
        if (window.coinSystem && window.coinSystem.spendStars(item.price)) {
            this.addToInventory(category, item.icon);
            this.equipItem(category, item.icon);

            // Sonido de compra
            if (window.soundSystem) {
                window.soundSystem.playPowerUp();
            }

            console.log(`🛒 Comprado: ${item.name} por ${item.price} ⭐`);

            return {
                success: true,
                message: `¡${item.name} comprado y equipado!`
            };
        }

        return { success: false, message: 'Error en la compra' };
    }

    // =============================
    // MODAL DE TIENDA
    // =============================

    createShopModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'shopModal';
        this.modal.className = 'shop-modal';
        this.modal.style.display = 'none';

        this.modal.innerHTML = `
            <div class="shop-modal-overlay"></div>
            <div class="shop-modal-content">
                <!-- Header -->
                <div class="shop-header">
                    <h2 class="shop-title">🛒 TIENDA DE HÉROE</h2>
                    <div class="shop-balance">
                        <span class="shop-balance-label">Tu balance:</span>
                        <span class="shop-balance-amount" id="shopBalanceStars">0</span>
                        <span class="shop-balance-currency">⭐</span>
                    </div>
                    <button class="shop-close" id="shopCloseBtn">✕</button>
                </div>

                <!-- Tabs -->
                <div class="shop-tabs">
                    <button class="shop-tab active" data-category="avatars">
                        <span class="shop-tab-icon">👤</span>
                        <span class="shop-tab-label">Avatares</span>
                    </button>
                    <button class="shop-tab" data-category="ships">
                        <span class="shop-tab-icon">🚀</span>
                        <span class="shop-tab-label">Naves</span>
                    </button>
                    <button class="shop-tab" data-category="weapons">
                        <span class="shop-tab-icon">⚔️</span>
                        <span class="shop-tab-label">Armas</span>
                    </button>
                    <button class="shop-tab" data-category="cars">
                        <span class="shop-tab-icon">🏎️</span>
                        <span class="shop-tab-label">Autos</span>
                    </button>
                    <button class="shop-tab" data-category="themes">
                        <span class="shop-tab-icon">🎨</span>
                        <span class="shop-tab-label">Temas</span>
                    </button>
                </div>

                <!-- Items Grid -->
                <div class="shop-items-container" id="shopItemsContainer">
                    <!-- Se llena dinámicamente -->
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Event listeners
        document.getElementById('shopCloseBtn').addEventListener('click', () => this.close());
        this.modal.querySelector('.shop-modal-overlay').addEventListener('click', () => this.close());

        // Tabs
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.showCategory(category);
            });
        });

        console.log('🛒 Modal de tienda creado');
    }

    // =============================
    // MOSTRAR TIENDA
    // =============================

    open() {
        if (!this.modal) return;

        this.modal.style.display = 'flex';
        setTimeout(() => {
            this.modal.classList.add('shop-modal-open');
        }, 10);

        // Actualizar balance
        this.updateBalance();

        // Mostrar primera categoría
        this.showCategory('avatars');

        console.log('🛒 Tienda abierta');
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.remove('shop-modal-open');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);

        console.log('🛒 Tienda cerrada');
    }

    updateBalance() {
        const balanceEl = document.getElementById('shopBalanceStars');
        if (balanceEl && window.coinSystem) {
            balanceEl.textContent = window.coinSystem.getStars();
        }
    }

    showCategory(category) {
        // Actualizar tabs activos
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            }
        });

        // Renderizar items
        this.renderItems(category);
    }

    renderItems(category) {
        const container = document.getElementById('shopItemsContainer');
        if (!container) return;

        const items = this.catalog[category] || [];
        container.innerHTML = '';

        items.forEach(item => {
            const itemCard = this.createItemCard(category, item);
            container.appendChild(itemCard);
        });
    }

    createItemCard(category, item) {
        const owned = this.hasItem(category, item.icon);
        const equipped = this.equipped[category] === item.icon;
        const canBuy = this.canAfford(item.price);
        const hasTrophiesNeeded = this.hasTrophies(item.trophiesRequired);
        const rarity = this.getRarityInfo(item.rarity);

        const card = document.createElement('div');
        card.className = `shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;
        card.style.borderColor = rarity.color;
        card.style.background = rarity.bgColor;

        card.innerHTML = `
            <div class="shop-item-rarity" style="color: ${rarity.color}">
                ${rarity.icon} ${rarity.name}
            </div>
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-description">${item.description}</div>

            ${item.trophiesRequired ? `
                <div class="shop-item-requirement ${hasTrophiesNeeded ? 'met' : ''}">
                    🏆 ${item.trophiesRequired} trofeos
                </div>
            ` : ''}

            <div class="shop-item-footer">
                ${owned ? `
                    ${equipped ? `
                        <div class="shop-item-equipped">✓ Equipado</div>
                    ` : `
                        <button class="shop-item-equip" data-category="${category}" data-item='${JSON.stringify(item)}'>
                            Equipar
                        </button>
                    `}
                ` : `
                    <div class="shop-item-price ${canBuy && hasTrophiesNeeded ? 'can-buy' : ''}">
                        ${item.price === 0 ? 'GRATIS' : `${item.price} ⭐`}
                    </div>
                    <button class="shop-item-buy ${canBuy && hasTrophiesNeeded ? '' : 'disabled'}"
                            data-category="${category}"
                            data-item='${JSON.stringify(item)}'
                            ${!canBuy || !hasTrophiesNeeded ? 'disabled' : ''}>
                        ${item.price === 0 ? 'Obtener' : 'Comprar'}
                    </button>
                `}
            </div>
        `;

        // Event listeners
        const buyBtn = card.querySelector('.shop-item-buy');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => this.handleBuy(category, item));
        }

        const equipBtn = card.querySelector('.shop-item-equip');
        if (equipBtn) {
            equipBtn.addEventListener('click', () => this.handleEquip(category, item));
        }

        return card;
    }

    handleBuy(category, item) {
        const result = this.buyItem(category, item);

        if (result.success) {
            this.showNotification(result.message, 'success');
            this.updateBalance();
            this.renderItems(category);
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    handleEquip(category, item) {
        if (this.equipItem(category, item.icon)) {
            this.showNotification(`${item.name} equipado!`, 'success');
            this.renderItems(category);
        }
    }

    showNotification(message, type = 'info') {
        // Reutilizar el sistema de notificaciones de app.js si existe
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
        }
    }

    // =============================
    // GETTERS
    // =============================

    getEquipped(category) {
        return this.equipped[category];
    }

    getAllEquipped() {
        return this.equipped;
    }
}

// ================================
// INICIALIZACIÓN GLOBAL
// ================================

window.shopSystem = new ShopSystem();

console.log('🛒 Sistema de tienda listo');
console.log(`   Avatares: ${window.shopSystem.inventory.avatars.length}`);
console.log(`   Naves: ${window.shopSystem.inventory.ships.length}`);
console.log(`   Armas: ${window.shopSystem.inventory.weapons.length}`);
console.log(`   Autos: ${window.shopSystem.inventory.cars.length}`);
