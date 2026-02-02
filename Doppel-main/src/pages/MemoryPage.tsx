import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useMemoryStore, MemoryItem } from '@/stores/memoryStore'
import { Plus, User, Heart, Shield, MessageSquare, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const MEMORY_TYPES = [
  { value: 'person', label: 'Person', icon: User },
  { value: 'preference', label: 'Preference', icon: Heart },
  { value: 'rule', label: 'Rule', icon: Shield },
  { value: 'context', label: 'Context', icon: MessageSquare }
]

export default function MemoryPage() {
  const { memories, addMemory, updateMemory, deleteMemory } = useMemoryStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const filteredMemories = filterType === 'all' 
    ? memories 
    : memories.filter(m => m.type === filterType)

  const handleSaveMemory = (memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMemory) {
      updateMemory(editingMemory.id, memory)
      toast.success('Memory updated')
    } else {
      addMemory(memory)
      toast.success('Memory added')
    }
    setIsDialogOpen(false)
    setEditingMemory(null)
  }

  const handleDeleteMemory = (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      deleteMemory(id)
      toast.success('Memory deleted')
    }
  }

  const openEditDialog = (memory: MemoryItem) => {
    setEditingMemory(memory)
    setIsDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Memory & Context</h1>
            <p className="text-xl text-muted-foreground">
              Manage what your Doppel knows about you
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary" onClick={() => setEditingMemory(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Memory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMemory ? 'Edit Memory' : 'Add New Memory'}
                </DialogTitle>
              </DialogHeader>
              <MemoryForm 
                onSave={handleSaveMemory} 
                initialData={editingMemory || undefined}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          {MEMORY_TYPES.map(type => {
            const Icon = type.icon
            return (
              <Button
                key={type.value}
                variant={filterType === type.value ? 'default' : 'outline'}
                onClick={() => setFilterType(type.value)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {type.label}
              </Button>
            )
          })}
        </div>

        {/* Memory Cards */}
        {filteredMemories.length === 0 ? (
          <Card className="p-12">
            <div className="text-center max-w-md mx-auto">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No memories yet</h3>
              <p className="text-muted-foreground mb-6">
                Start adding people, preferences, rules, and context to help your Doppel understand you better
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Memory
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredMemories.map(memory => {
              const memoryType = MEMORY_TYPES.find(t => t.value === memory.type)
              const Icon = memoryType?.icon || MessageSquare
              
              return (
                <Card key={memory.id} className="p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{memory.title}</h3>
                        <span className="text-xs text-muted-foreground capitalize">
                          {memory.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(memory)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteMemory(memory.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {memory.content}
                  </p>
                  <div className="text-xs text-muted-foreground mt-4">
                    Updated {new Date(memory.updatedAt).toLocaleDateString()}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function MemoryForm({ 
  onSave, 
  initialData 
}: { 
  onSave: (memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  initialData?: MemoryItem
}) {
  const [type, setType] = useState<MemoryItem['type']>(initialData?.type || 'person')
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    onSave({ type, title, content })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="type" className="mb-2 block">Type</Label>
        <Select value={type} onValueChange={(val) => setType(val as MemoryItem['type'])}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEMORY_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>
                <div className="flex items-center gap-2">
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title" className="mb-2 block">Title</Label>
        <Input
          id="title"
          placeholder="e.g., Mom, Never book mornings"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="content" className="mb-2 block">Details</Label>
        <Textarea
          id="content"
          placeholder="Describe what your Doppel should remember..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      <Button type="submit" className="w-full">
        Save Memory
      </Button>
    </form>
  )
}
