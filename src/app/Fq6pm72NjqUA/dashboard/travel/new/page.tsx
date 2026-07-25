'use client'

/**
 * New Travel Form Page
 * 
 * Tab-based travel expense form matching the TCN Electron app layout.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffAuth } from '../../../contexts/StaffAuthContext'
import { travelFormsApi } from '../../../lib/api'
import { DEFAULT_TRAVEL_RATES } from '../../../lib/utils'
import { toast } from 'sonner'
import HelpTooltip from '../../../components/HelpTooltip'
import '../TravelForm.css'

interface FormData {
  name: string
  destination: string
  departureDate: string
  returnDate: string
  reasonsForTravel: string
  
  // Accommodation
  hotelRate: number
  hotelNights: number
  hotelTotal: number
  privateRate: number
  privateNights: number
  privateTotal: number
  
  // Meals
  breakfastRate: number
  breakfastDays: number
  breakfastTotal: number
  lunchRate: number
  lunchDays: number
  lunchTotal: number
  dinnerRate: number
  dinnerDays: number
  dinnerTotal: number
  incidentalRate: number
  incidentalDays: number
  incidentalTotal: number
  
  // Transportation
  transportationType: 'PERSONAL_VEHICLE' | 'PUBLIC_TRANSPORT_WINNIPEG' | 'PUBLIC_TRANSPORT_THOMPSON' | 'COMBINATION'
  personalVehicleRate: number
  licensePlateNumber: string
  oneWayWinnipegKm: number
  oneWayWinnipegTrips: number
  oneWayWinnipegTotal: number
  oneWayThompsonKm: number
  oneWayThompsonTrips: number
  oneWayThompsonTotal: number
  winnipegFlatRate: number
  thompsonFlatRate: number
  publicTransportTotal: number
  taxiFareRate: number
  taxiFareDays: number
  taxiFareTotal: number
  
  // Other
  parkingTotal: number
  parkingReceipts: boolean
  notes: string
  
  // Totals
  grandTotal: number
  status: string
}

export default function NewTravelFormPage() {
  const router = useRouter()
  const { user } = useStaffAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('basic')

  const [formData, setFormData] = useState<FormData>({
    name: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    reasonsForTravel: '',
    
    // Accommodation
    hotelRate: DEFAULT_TRAVEL_RATES.hotelRate,
    hotelNights: 0,
    hotelTotal: 0,
    privateRate: DEFAULT_TRAVEL_RATES.privateRate,
    privateNights: 0,
    privateTotal: 0,
    
    // Meals
    breakfastRate: DEFAULT_TRAVEL_RATES.breakfastRate,
    breakfastDays: 0,
    breakfastTotal: 0,
    lunchRate: DEFAULT_TRAVEL_RATES.lunchRate,
    lunchDays: 0,
    lunchTotal: 0,
    dinnerRate: DEFAULT_TRAVEL_RATES.dinnerRate,
    dinnerDays: 0,
    dinnerTotal: 0,
    incidentalRate: DEFAULT_TRAVEL_RATES.incidentalRate,
    incidentalDays: 0,
    incidentalTotal: 0,
    
    // Transportation
    transportationType: 'PERSONAL_VEHICLE',
    personalVehicleRate: DEFAULT_TRAVEL_RATES.personalVehicleRate,
    licensePlateNumber: '',
    oneWayWinnipegKm: DEFAULT_TRAVEL_RATES.oneWayWinnipegKm,
    oneWayWinnipegTrips: 0,
    oneWayWinnipegTotal: 0,
    oneWayThompsonKm: DEFAULT_TRAVEL_RATES.oneWayThompsonKm,
    oneWayThompsonTrips: 0,
    oneWayThompsonTotal: 0,
    winnipegFlatRate: DEFAULT_TRAVEL_RATES.winnipegFlatRate,
    thompsonFlatRate: DEFAULT_TRAVEL_RATES.thompsonFlatRate,
    publicTransportTotal: 0,
    taxiFareRate: DEFAULT_TRAVEL_RATES.taxiFareRate,
    taxiFareDays: 0,
    taxiFareTotal: 0,
    
    // Other
    parkingTotal: 0,
    parkingReceipts: false,
    notes: '',
    
    // Totals
    grandTotal: 0,
    status: 'DRAFT'
  })

  // Set user name when available
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({
        ...prev,
        name: user.name
      }))
    }
  }, [user])

  // Auto-calculate totals when relevant fields change
  useEffect(() => {
    calculateTotals()
  }, [
    formData.hotelRate, formData.hotelNights,
    formData.privateRate, formData.privateNights,
    formData.breakfastRate, formData.breakfastDays,
    formData.lunchRate, formData.lunchDays,
    formData.dinnerRate, formData.dinnerDays,
    formData.incidentalRate, formData.incidentalDays,
    formData.transportationType,
    formData.personalVehicleRate,
    formData.oneWayWinnipegKm, formData.oneWayWinnipegTrips,
    formData.oneWayThompsonKm, formData.oneWayThompsonTrips,
    formData.winnipegFlatRate, formData.thompsonFlatRate,
    formData.taxiFareRate, formData.taxiFareDays,
    formData.parkingTotal
  ])

  const calculateTotals = () => {
    const newData = { ...formData }
    
    // Accommodation totals
    newData.hotelTotal = (newData.hotelRate || 0) * (newData.hotelNights || 0)
    newData.privateTotal = (newData.privateRate || 0) * (newData.privateNights || 0)
    
    // Meal totals
    newData.breakfastTotal = (newData.breakfastRate || 0) * (newData.breakfastDays || 0)
    newData.lunchTotal = (newData.lunchRate || 0) * (newData.lunchDays || 0)
    newData.dinnerTotal = (newData.dinnerRate || 0) * (newData.dinnerDays || 0)
    
    // Incidental total
    newData.incidentalTotal = (newData.incidentalRate || 0) * (newData.incidentalDays || 0)
    
    // Transportation totals
    if (newData.transportationType === 'PERSONAL_VEHICLE' || newData.transportationType === 'COMBINATION') {
      newData.oneWayWinnipegTotal = (newData.oneWayWinnipegKm || 0) * 
        (newData.oneWayWinnipegTrips || 0) * (newData.personalVehicleRate || 0)
      newData.oneWayThompsonTotal = (newData.oneWayThompsonKm || 0) * 
        (newData.oneWayThompsonTrips || 0) * (newData.personalVehicleRate || 0)
    } else {
      newData.oneWayWinnipegTotal = 0
      newData.oneWayThompsonTotal = 0
    }
    
    if (newData.transportationType === 'PUBLIC_TRANSPORT_WINNIPEG') {
      newData.publicTransportTotal = newData.winnipegFlatRate || 0
    } else if (newData.transportationType === 'PUBLIC_TRANSPORT_THOMPSON') {
      newData.publicTransportTotal = newData.thompsonFlatRate || 0
    } else if (newData.transportationType === 'COMBINATION') {
      newData.publicTransportTotal = (newData.winnipegFlatRate || 0) + (newData.thompsonFlatRate || 0)
    } else {
      newData.publicTransportTotal = 0
    }
    
    // Taxi total
    newData.taxiFareTotal = (newData.taxiFareRate || 0) * (newData.taxiFareDays || 0)
    
    // Grand total
    newData.grandTotal = 
      (newData.hotelTotal || 0) +
      (newData.privateTotal || 0) +
      (newData.breakfastTotal || 0) +
      (newData.lunchTotal || 0) +
      (newData.dinnerTotal || 0) +
      (newData.incidentalTotal || 0) +
      (newData.oneWayWinnipegTotal || 0) +
      (newData.oneWayThompsonTotal || 0) +
      (newData.publicTransportTotal || 0) +
      (newData.taxiFareTotal || 0) +
      (newData.parkingTotal || 0)
    
    // Round values
    newData.grandTotal = Math.round(newData.grandTotal * 100) / 100
    
    setFormData(newData)
  }

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveDraft = async () => {
    if (!formData.departureDate || !formData.returnDate) {
      setError('Please enter departure and return dates to save the form')
      return
    }
    
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const res = await travelFormsApi.create({
        ...formData,
        userId: user?.id,
        status: 'DRAFT'
      })
      
      if (res.success) {
        setSuccessMessage('Travel form saved as draft!')
        toast.success('Form saved as draft')
        setTimeout(() => {
          router.push('/Fq6pm72NjqUA/dashboard/travel')
        }, 1500)
      } else {
        setError(res.error || 'Failed to save travel form')
        toast.error(res.error || 'Failed to save travel form')
      }
    } catch (err) {
      console.error('Error saving travel form:', err)
      setError('Failed to save travel form')
      toast.error('Failed to save travel form')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.destination || !formData.departureDate || !formData.returnDate || !formData.reasonsForTravel) {
      setError('Please fill in all required fields (destination, dates, and reason)')
      return
    }
    
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const res = await travelFormsApi.create({
        ...formData,
        userId: user?.id,
        status: 'SUBMITTED'
      })
      
      if (res.success) {
        setSuccessMessage('Travel form submitted for approval!')
        toast.success('Form submitted for approval')
        setTimeout(() => {
          router.push('/Fq6pm72NjqUA/dashboard/travel')
        }, 1500)
      } else {
        setError(res.error || 'Failed to submit travel form')
        toast.error(res.error || 'Failed to submit travel form')
      }
    } catch (err) {
      console.error('Error submitting travel form:', err)
      setError('Failed to submit travel form')
      toast.error('Failed to submit travel form')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value || 0)
  }

  return (
    <div className="travel-form">
      {/* Header */}
      <div className="travel-form-header">
        <div className="header-left">
          <button className="back-button" onClick={() => router.back()}>← Back</button>
          <div className="header-info">
            <h1>New Travel Request</h1>
            <p>{user?.first_name} {user?.last_name} • {user?.department?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleSaveDraft} disabled={saving}>
            💾 Save Draft
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            📤 Submit for Approval
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="message error">{error}</div>}
      {successMessage && <div className="message success">{successMessage}</div>}

      {/* Section Navigation */}
      <div className="section-tabs">
        <button 
          className={`section-tab ${activeSection === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveSection('basic')}
        >
          📋 Basic Info
        </button>
        <button 
          className={`section-tab ${activeSection === 'accommodation' ? 'active' : ''}`}
          onClick={() => setActiveSection('accommodation')}
        >
          🏨 Accommodation<HelpTooltip text="Enter hotel or private accommodation rates and number of nights." position="bottom" />
        </button>
        <button 
          className={`section-tab ${activeSection === 'meals' ? 'active' : ''}`}
          onClick={() => setActiveSection('meals')}
        >
          🍽️ Meals<HelpTooltip text="Enter daily meal rates for breakfast, lunch, dinner, and incidentals." position="bottom" />
        </button>
        <button 
          className={`section-tab ${activeSection === 'transport' ? 'active' : ''}`}
          onClick={() => setActiveSection('transport')}
        >
          🚗 Transportation<HelpTooltip text="Enter vehicle mileage, public transport fares, or taxi expenses." position="bottom" />
        </button>
        <button 
          className={`section-tab ${activeSection === 'other' ? 'active' : ''}`}
          onClick={() => setActiveSection('other')}
        >
          📝 Other<HelpTooltip text="Parking costs, receipts, and any additional notes for the approver." position="bottom" />
        </button>
      </div>

      {/* Basic Information Section */}
      {activeSection === 'basic' && (
        <div className="form-section">
          <h2>📋 Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                readOnly
                className="read-only-input"
              />
            </div>
            <div className="form-group">
              <label>Destination *</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                placeholder="e.g., Winnipeg, Thompson, etc."
                required
              />
            </div>
            <div className="form-group">
              <label>Departure Date *</label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => updateField('departureDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Return Date *</label>
              <input
                type="date"
                value={formData.returnDate}
                onChange={(e) => updateField('returnDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Reason for Travel *</label>
              <textarea
                value={formData.reasonsForTravel}
                onChange={(e) => updateField('reasonsForTravel', e.target.value)}
                placeholder="Describe the purpose of your travel..."
                rows={4}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Accommodation Section */}
      {activeSection === 'accommodation' && (
        <div className="form-section">
          <h2>🏨 Accommodation</h2>
          <div className="expense-cards">
            {/* Hotel */}
            <div className="expense-card">
              <h3>Hotel Accommodations</h3>
              <div className="expense-row">
                <div className="expense-field">
                  <label>Rate/Night</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hotelRate}
                    onChange={(e) => updateField('hotelRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-field">
                  <label>Nights</label>
                  <input
                    type="number"
                    value={formData.hotelNights}
                    onChange={(e) => updateField('hotelNights', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-total">
                  <label>Total</label>
                  <div className="total-display">{formatCurrency(formData.hotelTotal)}</div>
                </div>
              </div>
            </div>

            {/* Private Accommodations */}
            <div className="expense-card">
              <h3>Private Accommodations</h3>
              <div className="expense-row">
                <div className="expense-field">
                  <label>Rate/Night</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.privateRate}
                    onChange={(e) => updateField('privateRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-field">
                  <label>Nights</label>
                  <input
                    type="number"
                    value={formData.privateNights}
                    onChange={(e) => updateField('privateNights', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-total">
                  <label>Total</label>
                  <div className="total-display">{formatCurrency(formData.privateTotal)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meals Section */}
      {activeSection === 'meals' && (
        <div className="form-section">
          <h2>🍽️ Meals & Incidentals</h2>
          <div className="expense-cards">
            {/* Breakfast */}
            <div className="expense-card">
              <h3>Breakfast</h3>
              <div className="expense-row">
                <div className="expense-field">
                  <label>Rate/Day</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.breakfastRate}
                    onChange={(e) => updateField('breakfastRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-field">
                  <label>Days</label>
                  <input
                    type="number"
                    value={formData.breakfastDays}
                    onChange={(e) => updateField('breakfastDays', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-total">
                  <label>Total</label>
                  <div className="total-display">{formatCurrency(formData.breakfastTotal)}</div>
                </div>
              </div>
            </div>

            {/* Lunch */}
            <div className="expense-card">
              <h3>Lunch</h3>
              <div className="expense-row">
                <div className="expense-field">
                  <label>Rate/Day</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.lunchRate}
                    onChange={(e) => updateField('lunchRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-field">
                  <label>Days</label>
                  <input
                    type="number"
                    value={formData.lunchDays}
                    onChange={(e) => updateField('lunchDays', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-total">
                  <label>Total</label>
                  <div className="total-display">{formatCurrency(formData.lunchTotal)}</div>
                </div>
              </div>
            </div>

            {/* Dinner */}
            <div className="expense-card">
              <h3>Dinner</h3>
              <div className="expense-row">
                <div className="expense-field">
                  <label>Rate/Day</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dinnerRate}
                    onChange={(e) => updateField('dinnerRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-field">
                  <label>Days</label>
                  <input
                    type="number"
                    value={formData.dinnerDays}
                    onChange={(e) => updateField('dinnerDays', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-total">
                  <label>Total</label>
                  <div className="total-display">{formatCurrency(formData.dinnerTotal)}</div>
                </div>
              </div>
            </div>

            {/* Incidentals */}
            <div className="expense-card">
              <h3>Incidentals</h3>
              <div className="expense-row">
                <div className="expense-field">
                  <label>Rate/Day</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.incidentalRate}
                    onChange={(e) => updateField('incidentalRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-field">
                  <label>Days</label>
                  <input
                    type="number"
                    value={formData.incidentalDays}
                    onChange={(e) => updateField('incidentalDays', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-total">
                  <label>Total</label>
                  <div className="total-display">{formatCurrency(formData.incidentalTotal)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transportation Section */}
      {activeSection === 'transport' && (
        <div className="form-section">
          <h2>🚗 Transportation</h2>
          
          <div className="form-group">
            <label>Transportation Type</label>
            <select
              value={formData.transportationType}
              onChange={(e) => updateField('transportationType', e.target.value)}
            >
              <option value="PERSONAL_VEHICLE">Personal Vehicle</option>
              <option value="PUBLIC_TRANSPORT_WINNIPEG">Public Transport (Winnipeg)</option>
              <option value="PUBLIC_TRANSPORT_THOMPSON">Public Transport (Thompson)</option>
              <option value="COMBINATION">Combination</option>
            </select>
          </div>

          {/* Personal Vehicle Options */}
          {(formData.transportationType === 'PERSONAL_VEHICLE' || formData.transportationType === 'COMBINATION') && (
            <div className="expense-cards">
              <div className="expense-card full-width">
                <h3>Personal Vehicle</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Rate per KM</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.personalVehicleRate}
                      onChange={(e) => updateField('personalVehicleRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>License Plate #</label>
                    <input
                      type="text"
                      value={formData.licensePlateNumber}
                      onChange={(e) => updateField('licensePlateNumber', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Winnipeg Trip */}
              <div className="expense-card">
                <h3>Trip to Winnipeg (One Way)</h3>
                <div className="expense-row">
                  <div className="expense-field">
                    <label>KM (One Way)</label>
                    <input
                      type="number"
                      value={formData.oneWayWinnipegKm}
                      onChange={(e) => updateField('oneWayWinnipegKm', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="expense-field">
                    <label># of Trips</label>
                    <input
                      type="number"
                      value={formData.oneWayWinnipegTrips}
                      onChange={(e) => updateField('oneWayWinnipegTrips', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="expense-total">
                    <label>Total</label>
                    <div className="total-display">{formatCurrency(formData.oneWayWinnipegTotal)}</div>
                  </div>
                </div>
              </div>

              {/* Thompson Trip */}
              <div className="expense-card">
                <h3>Trip to Thompson (One Way)</h3>
                <div className="expense-row">
                  <div className="expense-field">
                    <label>KM (One Way)</label>
                    <input
                      type="number"
                      value={formData.oneWayThompsonKm}
                      onChange={(e) => updateField('oneWayThompsonKm', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="expense-field">
                    <label># of Trips</label>
                    <input
                      type="number"
                      value={formData.oneWayThompsonTrips}
                      onChange={(e) => updateField('oneWayThompsonTrips', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="expense-total">
                    <label>Total</label>
                    <div className="total-display">{formatCurrency(formData.oneWayThompsonTotal)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Public Transport Options */}
          {(formData.transportationType === 'PUBLIC_TRANSPORT_WINNIPEG' || 
            formData.transportationType === 'PUBLIC_TRANSPORT_THOMPSON' || 
            formData.transportationType === 'COMBINATION') && (
            <div className="expense-cards">
              <div className="expense-card">
                <h3>Public Transportation</h3>
                <div className="form-grid">
                  {(formData.transportationType === 'PUBLIC_TRANSPORT_WINNIPEG' || formData.transportationType === 'COMBINATION') && (
                    <div className="form-group">
                      <label>Winnipeg Flat Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.winnipegFlatRate}
                        onChange={(e) => updateField('winnipegFlatRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                  {(formData.transportationType === 'PUBLIC_TRANSPORT_THOMPSON' || formData.transportationType === 'COMBINATION') && (
                    <div className="form-group">
                      <label>Thompson Flat Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.thompsonFlatRate}
                        onChange={(e) => updateField('thompsonFlatRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </div>
                <div className="expense-total standalone">
                  <label>Public Transport Total</label>
                  <div className="total-display">{formatCurrency(formData.publicTransportTotal)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Taxi */}
          <div className="expense-cards">
            <div className="expense-card">
              <h3>Taxi Fare</h3>
              <div className="expense-row">
                <div className="expense-field">
                  <label>Rate/Day</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taxiFareRate}
                    onChange={(e) => updateField('taxiFareRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-field">
                  <label>Days</label>
                  <input
                    type="number"
                    value={formData.taxiFareDays}
                    onChange={(e) => updateField('taxiFareDays', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-total">
                  <label>Total</label>
                  <div className="total-display">{formatCurrency(formData.taxiFareTotal)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Section */}
      {activeSection === 'other' && (
        <div className="form-section">
          <h2>📝 Other Expenses & Notes</h2>
          <div className="expense-cards">
            <div className="expense-card">
              <h3>Parking</h3>
              <div className="expense-row">
                <div className="expense-field">
                  <label>Parking Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.parkingTotal}
                    onChange={(e) => updateField('parkingTotal', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="expense-field checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.parkingReceipts}
                      onChange={(e) => updateField('parkingReceipts', e.target.checked)}
                    />
                    Receipts Attached
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any additional information or special requests..."
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Grand Total Summary - Always Visible */}
      <div className="grand-total-section">
        <div className="total-breakdown">
          <div className="breakdown-item">
            <span>Accommodation</span>
            <span>{formatCurrency((formData.hotelTotal || 0) + (formData.privateTotal || 0))}</span>
          </div>
          <div className="breakdown-item">
            <span>Meals</span>
            <span>{formatCurrency((formData.breakfastTotal || 0) + (formData.lunchTotal || 0) + (formData.dinnerTotal || 0))}</span>
          </div>
          <div className="breakdown-item">
            <span>Incidentals</span>
            <span>{formatCurrency(formData.incidentalTotal || 0)}</span>
          </div>
          <div className="breakdown-item">
            <span>Transportation</span>
            <span>{formatCurrency((formData.oneWayWinnipegTotal || 0) + (formData.oneWayThompsonTotal || 0) + (formData.publicTransportTotal || 0) + (formData.taxiFareTotal || 0))}</span>
          </div>
          <div className="breakdown-item">
            <span>Parking</span>
            <span>{formatCurrency(formData.parkingTotal || 0)}</span>
          </div>
        </div>
        <div className="grand-total">
          <span>Grand Total</span>
          <span className="total-amount">{formatCurrency(formData.grandTotal)}</span>
        </div>
      </div>
    </div>
  )
}
