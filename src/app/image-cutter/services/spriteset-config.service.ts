import { Injectable, signal } from '@angular/core';
import premadeConfigs from "../data/spriteset-configs.json";
import { SpritesetConfig } from '../models/spriteset-config.model';

const SPRITESET_CONFIG_KEY = 'spriteset_configs';
const CURRENT_SPRITESET_CONFIG_KEY = 'current_spriteset_config';

@Injectable({
    providedIn: 'root',
})
export class SpritesetConfigService {
    public currentConfig;
    public existingConfigs;

    public constructor() {
        this.existingConfigs = signal(this.loadConfigs());
        this.currentConfig = signal(this.loadCurrentConfig());
    }

    public selectCurrentConfig(config: SpritesetConfig): void {
        this.currentConfig.set(config);
        localStorage.setItem(CURRENT_SPRITESET_CONFIG_KEY, config.id);
    }

    private loadConfigs(): SpritesetConfig[] {
        const customConfigsData = localStorage.getItem(SPRITESET_CONFIG_KEY);
        if (customConfigsData) {
            const customConfigs = JSON.parse(customConfigsData);
            return [
                ...premadeConfigs,
                ...customConfigs,
            ];
        } else {
            return [
                ...premadeConfigs,
            ];
        }
    }

    private loadCurrentConfig(): SpritesetConfig {
        const allConfigs: SpritesetConfig[] = this.existingConfigs();
        const currentConfigId = localStorage.getItem(CURRENT_SPRITESET_CONFIG_KEY);
        if (currentConfigId) {
            const currentConfig = allConfigs.find((entry: SpritesetConfig) => entry.id === currentConfigId);
            if (currentConfig) {
                return currentConfig;
            }
        }
        return allConfigs[0];
    }
}
