// File: src/utils/helpers.ts
export const formatCurrency = (amount: number) => {
    // TODO: Implement currency formatting
    return `$${amount.toFixed(2)}`
  }
  
  export const calculateRentalCost = (days: number, dailyRate: number) => {
    // TODO: Implement rental cost calculation
    return days * dailyRate
  }