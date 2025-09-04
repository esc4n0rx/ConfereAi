// components/checklist/approval-status.tsx
"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  User 
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ApprovalStatusProps {
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approvalStatus?: 'pending' | 'approved' | 'rejected' | null
  approvedBy?: string
  approvalResponse?: string
  action: 'taking' | 'returning'
  className?: string
}

export default function ApprovalStatus({
  status,
  approvalStatus,
  approvedBy,
  approvalResponse,
  action,
  className = ""
}: ApprovalStatusProps) {
  const getStatusConfig = () => {
    switch (approvalStatus || status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Aguardando Aprovação',
          description: 'Os encarregados foram notificados e em breve você receberá uma resposta',
          color: 'orange',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700'
        }
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Aprovado',
          description: approvedBy ? `Aprovado por ${approvedBy}` : 'Checklist aprovado',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        }
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejeitado',
          description: approvedBy ? `Rejeitado por ${approvedBy}` : 'Checklist rejeitado',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        }
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Concluído',
          description: 'Checklist finalizado com sucesso',
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        }
      default:
        return {
          icon: Clock,
          label: 'Processando',
          description: 'Aguarde...',
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon
  const actionText = action === 'taking' ? 'retirada' : 'devolução'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className={`${config.borderColor} ${config.bgColor}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <Icon className={`w-5 h-5 ${config.textColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${config.textColor}`}>
                  {config.label}
                </h4>
                <Badge 
                  variant="outline" 
                  className={`${config.borderColor} ${config.textColor} bg-white`}
                >
                  {actionText.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {config.description}
              </p>
              
              {approvalResponse && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Observação do encarregado:
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    "{approvalResponse}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}