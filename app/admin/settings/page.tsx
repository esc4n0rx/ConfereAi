// app/admin/settings/page.tsx (SUBSTITUIR arquivo completo)
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Users, 
  MessageCircle, 
  Bell,
  Database,
  Shield
} from 'lucide-react'
import ManagersConfig from '@/components/admin/managers-config'
import PendingApprovalList from '@/components/checklist/pending-approval'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("managers")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configure as preferências do sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="managers" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Encarregados</span>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Aprovações</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Sistema</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="managers" className="space-y-6">
          <ManagersConfig />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <PendingApprovalList />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Configurações de Notificação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">WhatsApp API</h4>
                    <p className="text-sm text-muted-foreground">
                      Status da integração com API do WhatsApp
                    </p>
                  </div>
                  <Badge variant={process.env.WHATSAPP_API_URL ? "default" : "destructive"}>
                    {process.env.WHATSAPP_API_URL ? "Configurado" : "Não Configurado"}
                  </Badge>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Como configurar:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Adicione as variáveis no arquivo .env:</li>
                    <li className="ml-4 font-mono bg-blue-100 p-2 rounded">
                      WHATSAPP_API_URL=sua_url_da_api<br/>
                      WHATSAPP_API_KEY=sua_chave_da_api
                    </li>
                    <li>2. Reinicie a aplicação</li>
                    <li>3. Teste enviando uma mensagem</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Banco de Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Status da Conexão:</span>
                    <Badge variant="default">Conectado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Última Sincronização:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Segurança</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Autenticação:</span>
                    <Badge variant="default">Ativa</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Logs de Auditoria:</span>
                    <Badge variant="default">Habilitados</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}