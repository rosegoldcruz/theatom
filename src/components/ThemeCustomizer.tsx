import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Moon, Sun, Palette, Zap } from 'lucide-react';
import { useTheme } from './theme-provider';

interface ThemeCustomizerProps {
  colorTheme?: string;
  onColorThemeChange?: (theme: string) => void;
  brandingMode?: string;
  onBrandingChange?: (mode: string) => void;
}

const COLOR_THEMES = {
  blue: { name: 'Ocean Blue', color: '#3B82F6', bg: 'bg-blue-500' },
  purple: { name: 'Royal Purple', color: '#8B5CF6', bg: 'bg-purple-500' },
  green: { name: 'Forest Green', color: '#10B981', bg: 'bg-green-500' },
  red: { name: 'Crimson Red', color: '#EF4444', bg: 'bg-red-500' },
  orange: { name: 'Sunset Orange', color: '#F97316', bg: 'bg-orange-500' },
  pink: { name: 'Rose Pink', color: '#EC4899', bg: 'bg-pink-500' }
};

const BRANDING_MODES = {
  arbitrage: { name: 'ArbitrageBot Pro', icon: Zap, color: 'text-blue-600' },
  mev: { name: 'MEV Hunter', icon: Zap, color: 'text-purple-600' },
  defi: { name: 'DeFi Maximizer', icon: Zap, color: 'text-green-600' },
  flash: { name: 'Flash Trader', icon: Zap, color: 'text-red-600' }
};

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  colorTheme = 'blue',
  onColorThemeChange = () => {},
  brandingMode = 'arbitrage',
  onBrandingChange = () => {}
}) => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="font-medium">Dark Mode</span>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
        </div>

        {/* System Theme Option */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Follow System</span>
          <Switch 
            checked={theme === 'system'} 
            onCheckedChange={(checked) => setTheme(checked ? 'system' : 'light')} 
          />
        </div>

        {/* Color Theme */}
        <div className="space-y-3">
          <label className="font-medium">Color Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(COLOR_THEMES).map(([key, themeData]) => (
              <Button
                key={key}
                size="sm"
                variant={colorTheme === key ? "default" : "outline"}
                onClick={() => onColorThemeChange(key)}
                className="flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${themeData.bg}`} />
                {themeData.name.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-3">
          <label className="font-medium">Branding Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(BRANDING_MODES).map(([key, brand]) => (
              <Badge
                key={key}
                variant={brandingMode === key ? "default" : "outline"}
                className={`cursor-pointer justify-center ${brand.color}`}
                onClick={() => onBrandingChange(key)}
              >
                <brand.icon className="h-3 w-3 mr-1" />
                {brand.name.split(' ')[0]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Current Theme Display */}
        <div className="p-3 rounded-lg bg-muted">
          <div className="text-sm font-medium mb-1">Current Theme</div>
          <div className="text-xs text-muted-foreground">
            {theme === 'system' ? 'System' : isDarkMode ? 'Dark' : 'Light'} • {COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES]?.name} • {BRANDING_MODES[brandingMode as keyof typeof BRANDING_MODES]?.name}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeCustomizer;