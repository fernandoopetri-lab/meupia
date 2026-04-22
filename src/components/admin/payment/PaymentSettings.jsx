import React, { useState } from 'react';
import AsaasCredentials from './AsaasCredentials';
import ConnectionStatus from './ConnectionStatus';
import WebhookConfiguration from './WebhookConfiguration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PaymentSettings = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">Configurações de Pagamento</h2>
            <p className="text-gray-400 mt-1">Gerencie a integração com o gateway de pagamento (ASAAS).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Status Column */}
        <div className="lg:col-span-1 space-y-6">
            <ConnectionStatus refreshTrigger={refreshTrigger} />
        </div>

        {/* Configuration Column */}
        <div className="lg:col-span-2">
             <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="bg-gray-800 border-gray-700 text-gray-400 w-full justify-start">
                    <TabsTrigger value="credentials" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Credenciais</TabsTrigger>
                    <TabsTrigger value="webhooks" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Webhooks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="credentials" className="mt-4">
                    <AsaasCredentials onUpdate={handleUpdate} />
                </TabsContent>
                
                <TabsContent value="webhooks" className="mt-4">
                    <WebhookConfiguration />
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;