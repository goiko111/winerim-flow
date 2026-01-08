import { ActivityLog } from '@/lib/salesStore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link, CheckCircle, Clock, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ActivityTableProps {
  logs: ActivityLog[];
  onRefresh?: () => void;
}

const actionLabels: Record<ActivityLog['action'], { label: string; color: string }> = {
  link_created: { label: 'Link creado', color: 'text-blue-600 bg-blue-50' },
  checkout_opened: { label: 'Checkout abierto', color: 'text-amber-600 bg-amber-50' },
  paid: { label: 'Pagado', color: 'text-success bg-success/10' },
  pending: { label: 'Pendiente', color: 'text-muted-foreground bg-muted' },
};

export const ActivityTable = ({ logs, onRefresh }: ActivityTableProps) => {
  const { toast } = useToast();

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copiado',
      description: 'El enlace ha sido copiado al portapapeles.',
    });
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay actividad reciente</p>
        <p className="text-sm mt-1">Los enlaces generados aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Fecha
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Cliente
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Plan
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const action = actionLabels[log.action];
            return (
              <tr
                key={log.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="text-sm text-foreground">
                    {formatDistanceToNow(log.date, { addSuffix: true, locale: es })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-foreground">
                    {log.customerName}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-foreground">{log.planName}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                      action.color
                    )}
                  >
                    {log.action === 'paid' && <CheckCircle className="w-3 h-3" />}
                    {log.action === 'pending' && <Clock className="w-3 h-3" />}
                    {log.action === 'link_created' && <Link className="w-3 h-3" />}
                    {action.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {log.link && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => handleCopyLink(log.link!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => window.open(log.link, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
