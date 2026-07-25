'use client'

/**
 * Admin Staff Manager
 * 
 * Manage staff users - create, edit, delete, and change roles.
 */

import { useEffect, useState } from 'react'
import { Users, Plus, Edit, Trash2, Shield, Search, Mail, Key, Eye, EyeOff } from 'lucide-react'
import { useStaffAuth } from '../../contexts/StaffAuthContext'
import { usersApi, CommUser } from '../../lib/api'
import { formatDate, cn, DEPARTMENTS, getDepartmentLabel } from '../../lib/utils'
import { toast } from 'sonner'

const ROLES = [
  { value: 'STAFF', label: 'Staff', description: 'Basic access to dashboard' },
  { value: 'STAFF_ADMIN', label: 'Staff Admin', description: 'Can approve timesheets & travel' },
  { value: 'DEPARTMENT_ADMIN', label: 'Dept Admin', description: 'Department-scoped admin access' },
  { value: 'FINANCE', label: 'Finance', description: 'Finance administrative access' },
  { value: 'ADMIN', label: 'Admin', description: 'Full administrative access' },
  { value: 'COUNCIL', label: 'Council', description: 'Council member access' },
]

export default function AdminStaffPage() {
  const { user: currentUser } = useStaffAuth()
  const [users, setUsers] = useState<CommUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [showEditor, setShowEditor] = useState(false)
  const [editingUser, setEditingUser] = useState<CommUser | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Editor form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'STAFF' as string,
    department: 'BAND_OFFICE' as string,
    isActive: true,
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await usersApi.getAll()
      if (res.success && res.data) {
        // API returns { users: [...], count: ... }
        const data = res.data as any
        const usersList = Array.isArray(data) ? data : data.users || []
        setUsers(usersList)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load staff members')
    } finally {
      setLoading(false)
    }
  }

  const openEditor = (user?: CommUser) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: '', // Don't show existing password
        role: user.role,
        department: user.department || 'BAND_OFFICE',
        isActive: true,
      })
    } else {
      setEditingUser(null)
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'STAFF',
        department: 'BAND_OFFICE',
        isActive: true,
      })
    }
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setShowEditor(true)
  }

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('Please enter a name')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Please enter an email')
      return
    }
    if (!editingUser && !formData.password) {
      toast.error('Please enter a password for new users')
      return
    }
    if (formData.password && formData.password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      const data: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        isActive: formData.isActive,
      }

      if (formData.password) {
        data.password = formData.password
      }

      let res
      if (editingUser) {
        res = await usersApi.update(editingUser.id, data)
      } else {
        res = await usersApi.create(data)
      }

      if (res.success) {
        toast.success(editingUser ? 'User updated' : 'User created')
        setShowEditor(false)
        fetchUsers()
      } else {
        toast.error(res.error || 'Failed to save user')
      }
    } catch (error) {
      toast.error('Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error("You can't delete your own account")
      return
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setDeleting(id)
    try {
      const res = await usersApi.delete(id)
      if (res.success) {
        toast.success('User deleted')
        setUsers(prev => prev.filter(u => u.id !== id))
      } else {
        toast.error(res.error || 'Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const handleResendInvite = async (userId: string, email: string) => {
    try {
      // This would typically call an API to resend the activation email
      toast.success(`Invitation sent to ${email}`)
    } catch (error) {
      toast.error('Failed to send invitation')
    }
  }

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase()
      return fullName.includes(searchLower) || u.email.toLowerCase().includes(searchLower)
    }
    return true
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400 bg-red-500/20'
      case 'STAFF_ADMIN': return 'text-purple-400 bg-purple-500/20'
      case 'DEPARTMENT_ADMIN': return 'text-amber-400 bg-amber-500/20'
      case 'FINANCE': return 'text-emerald-400 bg-emerald-500/20'
      case 'COUNCIL': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Staff Manager</h1>
              <p className="text-staff-secondary">Manage staff accounts and permissions</p>
            </div>
          </div>

          <button
            onClick={() => openEditor()}
            className="btn-staff-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {['ALL', ...ROLES.map(r => r.value)].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                roleFilter === role
                  ? "bg-staff-accent text-[#1F2937]"
                  : "bg-white/5 text-staff-secondary hover:bg-white/10"
              )}
            >
              {role === 'ALL' ? 'All' : ROLES.find(r => r.value === role)?.label || role}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-staff-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="staff-input w-full pl-10 pr-4 py-2 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="staff-card rounded-xl p-8 text-center">
          <div className="staff-spinner w-10 h-10 mx-auto"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="staff-card rounded-xl p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-staff-muted mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Users Found</h3>
          <p className="text-staff-secondary">
            {search || roleFilter !== 'ALL' 
              ? 'No users match your filters.' 
              : 'Add your first staff member to get started.'}
          </p>
        </div>
      ) : (
        <div className="staff-card rounded-xl overflow-hidden">
          <table className="staff-table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className={cn(
                  "hover:bg-white/5 transition-colors",
                  u.id === currentUser?.id && "bg-staff-accent/5"
                )}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-staff-accent/20 flex items-center justify-center text-staff-accent font-medium">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {u.first_name} {u.last_name}
                          {u.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-staff-accent">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-staff-secondary">{u.email}</td>
                  <td>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getRoleColor(u.role)
                    )}>
                      {ROLES.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  </td>
                  <td className="text-staff-secondary">{u.department ? getDepartmentLabel(u.department) : '-'}</td>
                  <td className="text-staff-muted text-sm">
                    {formatDate(u.created_at)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditor(u)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-staff-muted hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting === u.id}
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === u.id ? (
                            <div className="staff-spinner w-4 h-4"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="staff-card rounded-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-inherit">
              <h3 className="text-white font-medium">
                {editingUser ? 'Edit Staff Member' : 'Add Staff Member'}
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-staff-secondary mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="staff-input w-full px-4 py-3 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-staff-secondary mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="staff-input w-full px-4 py-3 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-staff-secondary mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="staff-input w-full px-4 py-3 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-staff-secondary mb-2">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={editingUser ? '••••••••' : ''}
                    className="staff-input w-full px-4 py-3 pr-12 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-staff-muted hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-staff-secondary mb-2">
                  {editingUser ? 'Confirm New Password' : 'Confirm Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={editingUser ? '••••••••' : ''}
                    className={cn(
                      "staff-input w-full px-4 py-3 pr-12 rounded-lg",
                      confirmPassword && formData.password !== confirmPassword && "border-red-500/50"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-staff-muted hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && formData.password !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-staff-secondary mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="staff-input w-full px-4 py-3 rounded-lg"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-staff-secondary mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="staff-input w-full px-4 py-3 rounded-lg"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-staff-secondary">Account is active</span>
              </label>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 btn-staff-primary py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <div className="staff-spinner w-4 h-4"></div> : null}
                  {editingUser ? 'Update' : 'Create'} User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
