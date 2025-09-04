// components/admin/managers-config.tsx
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Plus, 
  Phone, 
  User, 
  Edit, 
  Trash2, 
  MessageCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import type { Manager, CreateManagerData, UpdateManagerData } from '@/lib/types'

export default function ManagersConfig() {
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingManager, setEditingManager] = useState<Manager | null>(null)
  const [formData, setFormData] = useState<CreateManagerData>({
    nome: '',
    telefone: ''
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadManagers()
  }, [])

  const loadManagers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/managers')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar encarregados')
      }

      setManagers(data.managers)
    } catch (error: any) {
      console.error('Erro ao carregar encarregados:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome.trim() || !formData.telefone.trim()) {
      setError('Nome e telefone são obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const url = editingManager ? `/api/managers/${editingManager.id}` : '/api/managers'
      const method = editingManager ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar encarregado')
      }

      await loadManagers()
      setShowAddDialog(false)
      setEditingManager(null)
      setFormData({ nome: '', telefone: '' })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager)
    setFormData({
      nome: manager.nome,
      telefone: manager.telefone
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (managerId: string) => {
    try {
      setSubmitting(true)
      const response = await fetch(`/api/managers/${managerId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover encarregado')
      }

      await loadManagers()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`
    }
    return phone
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setEditingManager(null)
    setFormData({ nome: '', telefone: '' })
    setError(null)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Encarregados</h3>
          <p className="text-sm text-muted-foreground">
            Configurar responsáveis por aprovar checklists
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Encarregado
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingManager ? 'Editar Encarregado' : 'Novo Encarregado'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome completo"
                  disabled={submitting}
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, telefone: value })
                  }}
                  placeholder="11999999999"
                  maxLength={11}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Apenas números, 10 ou 11 dígitos
                </p>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && !showAddDialog && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <AnimatePresence>
          {managers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">Nenhum encarregado configurado</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione encarregados para receber notificações de checklists
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Encarregado
                </Button>
              </CardContent>
            </Card>
          ) : (
            managers.map((manager) => (
              <motion.div
                key={manager.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div>
                          <h4 className="font-medium">{manager.nome}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{formatPhone(manager.telefone)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(manager)}
                          disabled={submitting}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={submitting}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Encarregado</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover <strong>{manager.nome}</strong>? 
                                Esta ação não pode ser desfeita e eles não receberão mais notificações.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(manager.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {managers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span>
                {managers.length} encarregado{managers.length !== 1 ? 's' : ''} configurado{managers.length !== 1 ? 's' : ''} 
                para receber notificações WhatsApp
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}