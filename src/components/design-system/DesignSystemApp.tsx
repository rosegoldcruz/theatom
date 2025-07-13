import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, Palette, Code } from 'lucide-react';

export const DesignSystemApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('components');

  const components = [
    { name: 'Button', variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
    { name: 'Card', variants: ['default', 'elevated', 'outlined'] },
    { name: 'Badge', variants: ['default', 'secondary', 'destructive', 'outline'] },
    { name: 'Input', variants: ['default', 'error', 'success'] },
    { name: 'Alert', variants: ['default', 'destructive', 'warning', 'success'] },
  ];

  const colors = {
    primary: '#3b82f6',
    secondary: '#64748b',
    destructive: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Design System</h1>
        <p className="text-muted-foreground">Reusable components and style guide for the DeFi Arbitrage Bot</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          {components.map((component) => (
            <Card key={component.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {component.name}
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Available variants and usage examples</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {component.variants.map((variant) => (
                    <div key={variant} className="space-y-2">
                      <Badge variant="outline">{variant}</Badge>
                      {component.name === 'Button' && (
                        <Button variant={variant as any} size="sm">
                          {variant}
                        </Button>
                      )}
                      {component.name === 'Badge' && (
                        <Badge variant={variant as any}>{variant}</Badge>
                      )}
                      {component.name === 'Alert' && (
                        <Alert className="max-w-xs">
                          <AlertDescription>{variant} alert</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Design system color tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(colors).map(([name, value]) => (
                  <div key={name} className="space-y-2">
                    <div 
                      className="w-full h-20 rounded-lg border" 
                      style={{ backgroundColor: value }}
                    />
                    <div className="text-sm">
                      <p className="font-medium capitalize">{name}</p>
                      <p className="text-muted-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>Text styles and hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <h2 className="text-3xl font-semibold">Heading 2</h2>
                <h3 className="text-2xl font-medium">Heading 3</h3>
                <h4 className="text-xl font-medium">Heading 4</h4>
                <p className="text-base">Body text - Lorem ipsum dolor sit amet</p>
                <p className="text-sm text-muted-foreground">Small text - Secondary information</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Design System</CardTitle>
              <CardDescription>Download tokens and documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSS Variables
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Export Tailwind Config
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Export Figma Tokens
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Component Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};