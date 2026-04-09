import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appConfig } from '@/config/app';
import { Customer, getCustomers, getActivityLogs, ActivityLog } from '@/lib/salesStore';
import { CustomerFormDialog } from '@/components/sales/CustomerFormDialog';
import { LinkGeneratorDialog } from '@/components/sales/LinkGeneratorDialog';
import { QuickLinkGenerator } from '@/components/sales/QuickLinkGenerator';
import { QuickLinkIntlGenerator } from '@/components/sales/QuickLinkIntlGenerator';
import { BankTransferManager } from '@/components/sales/BankTransferManager';
import { StripeInternationalManager } from '@/components/sales/StripeInternationalManager';
import { ProformaGenerator } from '@/components/sales/ProformaGenerator';
import { ActivityTable } from '@/components/sales/ActivityTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserPlus,
  FileText,
  Search,
  LogOut,
  Users,
  Activity,
  Building2,
  Landmark,
  Globe,
  Link as LinkIcon,
} from 'lucide-react';
import winerimIcon from '@/assets/winerim-icon.png';

export const SalesDashboard = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  // Check auth
  useEffect(() => {
    const auth = localStorage.getItem('winerim_sales_auth');
    if (!auth) {
      navigate('/sales/login');
    }
  }, [navigate]);

  // Load data
  const loadData = () => {
    setCustomers(getCustomers());
    setActivityLogs(getActivityLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('winerim_sales_auth');
    navigate('/sales/login');
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vatId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowLinkDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src={winerimIcon} 
                alt="Winerim" 
                className="w-9 h-9 object-contain"
              />
              <div>
                <span className="font-display font-semibold text-foreground">
                  {appConfig.brandName}
                </span>
                <span className="text-muted-foreground text-sm ml-2">Portal Comercial</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <QuickLinkGenerator />
              <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {customers.length}
                </p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {activityLogs.filter((l) => l.action === 'link_created').length}
                </p>
                <p className="text-sm text-muted-foreground">Links generados</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {activityLogs.filter((l) => l.action === 'paid').length}
                </p>
                <p className="text-sm text-muted-foreground">Pagados</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customers section */}
          <div className="lg:col-span-1">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Clientes
                </h2>
                <Button
                  size="sm"
                  className="btn-wine"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setShowCustomerDialog(true);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Nuevo
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-premium pl-9"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {searchQuery ? 'Sin resultados' : 'No hay clientes aún'}
                  </p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => handleSelectCustomer(customer)}
                          className="flex-1 text-left"
                        >
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {customer.companyName}
                          </p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">{customer.vatId}</p>
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-7 text-xs"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Link pago
                        </Button>
                        <ProformaGenerator customer={customer} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity & Bank Transfers section */}
          <div className="lg:col-span-2">
            <div className="card-elevated p-6">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Actividad
                  </TabsTrigger>
                  <TabsTrigger value="transfers" className="flex items-center gap-2">
                    <Landmark className="w-4 h-4" />
                    Transferencias
                  </TabsTrigger>
                  <TabsTrigger value="international" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Internacional
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="activity">
                  <ActivityTable logs={activityLogs} onRefresh={loadData} />
                </TabsContent>
                <TabsContent value="transfers">
                  <BankTransferManager 
                    customers={customers} 
                    currentUser={localStorage.getItem('winerim_sales_user') || 'comercial'} 
                  />
                </TabsContent>
                <TabsContent value="international">
                  <StripeInternationalManager 
                    customers={customers} 
                    currentUser={localStorage.getItem('winerim_sales_user') || 'comercial'} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CustomerFormDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        editCustomer={selectedCustomer}
        onCustomerCreated={(customer) => {
          loadData();
          setSelectedCustomer(customer);
        }}
      />

      <LinkGeneratorDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        customer={selectedCustomer}
        onLinkGenerated={loadData}
      />
    </div>
  );
};

export default SalesDashboard;
