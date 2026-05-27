import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const STORAGE_KEY = 'winerim_internal_api_key';

export const SubscriptionMigrationPanel = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem(STORAGE_KEY) || '');
  const [account, setAccount] = useState<'es' | 'intl'>('es');
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    if (!apiKey) {
      toast({ title: 'Falta la API key interna', variant: 'destructive' });
      return;
    }
    localStorage.setItem(STORAGE_KEY, apiKey);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/migrate-subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': apiKey,
        },
        body: JSON.stringify({ account, dryRun, limit: 500 }),
      });
      const data = await res.json();
      setResult(data);
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Fallo en la migración', variant: 'destructive' });
      } else {
        toast({
          title: dryRun ? 'Simulación completada' : 'Migración completada',
          description: `Migradas: ${data.summary?.migrated ?? 0} · Omitidas: ${data.summary?.skipped ?? 0} · Errores: ${data.summary?.errored ?? 0}`,
        });
      }
    } catch (err: any) {
      toast({ title: 'Error de red', description: String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-amber-200 bg-amber-50/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground">Migración de suscripciones a producto estable</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Reasigna todas las suscripciones activas que apunten a productos efímeros (archivados) al producto estable de Winerim, sin prorrateo. Usa <strong>Simulación</strong> primero para ver qué cambiaría.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Cuenta Stripe</Label>
          <div className="flex gap-2 mt-1">
            <Button
              type="button"
              variant={account === 'es' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAccount('es')}
              className={account === 'es' ? 'btn-wine' : ''}
            >
              España (EUR)
            </Button>
            <Button
              type="button"
              variant={account === 'intl' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAccount('intl')}
              className={account === 'intl' ? 'btn-wine' : ''}
            >
              Internacional
            </Button>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={dryRun} onCheckedChange={setDryRun} id="dry-run" />
            <Label htmlFor="dry-run" className="text-sm cursor-pointer">
              {dryRun ? 'Simulación (no aplica cambios)' : 'Aplicar cambios reales'}
            </Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="api-key" className="text-xs">API Key interna (se guarda en este navegador)</Label>
        <Input
          id="api-key"
          type="password"
          placeholder="WINERIM_INTERNAL_API_KEY"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-1"
        />
      </div>

      <Button onClick={handleRun} disabled={loading} className="btn-wine w-full">
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ejecutando...</>
        ) : (
          <><RefreshCw className="w-4 h-4 mr-2" /> {dryRun ? 'Simular migración' : `Migrar suscripciones (${account.toUpperCase()})`}</>
        )}
      </Button>

      {result && (
        <div className="mt-3">
          <p className="text-sm font-medium mb-2">
            Resumen: migradas {result.summary?.migrated ?? 0} · omitidas {result.summary?.skipped ?? 0} · errores {result.summary?.errored ?? 0}
          </p>
          <pre className="text-xs bg-background border border-border rounded p-3 max-h-80 overflow-auto">
            {JSON.stringify(result.results ?? result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
