// components/checklist/pending-approval.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Clock, 
  User, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MessageCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PendingApproval {
  id: string
  checklist_id: string
  manager_id: string
  status: 'pending'
  created_at: string
  confereai_checklists: {
    codigo: string
    action: 'taking' | 'returning'
    has_issues: boolean
    device_timestamp: string
    confereai_employees: {
      nome: string
    }
    confereai_equipments: {
      nome: string
    }
  }
  confereai_managers: {
    nome: string
  }
}

export default function PendingApprovalList() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPendingApprovals()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadPendingApprovals, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPendingApprovals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/checklist/pending')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar aprovações')
      }

      setApprovals(data.pendingApprovals)
    } catch (error: any) {
      console.error('Erro ao carregar aprovações pendentes:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovalResponse = async (approved: boolean) => {
    if (!selectedApproval) return

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/checklist/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistId: selectedApproval.checklist_id,
          managerId: selectedApproval.manager_id,
          approved,
          responseMessage: responseMessage.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar aprovação')
      }

      // Atualizar lista e fechar modal
      await loadPendingApprovals()
      setSelectedApproval(null)
      setResponseMessage('')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatTimeSince = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min atrás`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d atrás`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Aprovações Pendentes</span>
            {approvals.length > 0 && (
              <Badge variant="secondary">{approvals.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <AnimatePresence>
            {approvals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma aprovação pendente no momento
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((approval, index) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedApproval(approval)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">
                              {approval.confereai_checklists.codigo}
                            </h4>
                            <Badge 
                              variant={approval.confereai_checklists.action === 'taking' ? 'default' : 'secondary'}
                            >
                              {approval.confereai_checklists.action === 'taking' ? 'RETIRADA' : 'DEVOLUÇÃO'}
                            </Badge>
                            {approval.confereai_checklists.has_issues && (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                COM PROBLEMAS
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{approval.confereai_checklists.confereai_employees.nome}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Package className="w-4 h-4" />
                                <span>{approval.confereai_checklists.confereai_equipments.nome}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{formatTimeSince(approval.created_at)}</div>
                        <div>Para: {approval.confereai_managers.nome}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Modal de Aprovação */}
      <Dialog 
        open={!!selectedApproval} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApproval(null)
            setResponseMessage('')
            setError(null)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aprovar Checklist</DialogTitle>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Código:</span>
                  <span>{selectedApproval.confereai_checklists.codigo}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Funcionário:</span>
                  <span>{selectedApproval.confereai_checklists.confereai_employees.nome}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Equipamento:</span>
                  <span>{selectedApproval.confereai_checklists.confereai_equipments.nome}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Ação:</span>
                  <Badge variant={selectedApproval.confereai_checklists.action === 'taking' ? 'default' : 'secondary'}>
                    {selectedApproval.confereai_checklists.action === 'taking' ? 'RETIRADA' : 'DEVOLUÇÃO'}
                  </Badge>
                </div>
                
                {selectedApproval.confereai_checklists.has_issues && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Equipamento com problemas reportados</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Data/Hora:</span>
                  <span>{formatDate(selectedApproval.confereai_checklists.device_timestamp)}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="response">Observação (opcional)</Label>
                <Textarea
                  id="response"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Digite uma observação sobre sua decisão..."
                  rows={3}
                  disabled={submitting}
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => handleApprovalResponse(true)}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    'Processando...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleApprovalResponse(false)}
                  disabled={submitting}
                  variant="destructive"
                  className="flex-1"
                >
                  {submitting ? (
                    'Processando...'
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}