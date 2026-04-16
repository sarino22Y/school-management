export function calculateAverage(
    grades: { value: number; coefficient?: number | null }[],
    decimalPlaces: number = 2
  ): number {
    if (grades.length === 0) return 0
  
    const totalPoints = grades.reduce((sum, grade) => {
      const coef = grade.coefficient || 1
      return sum + grade.value * coef
    }, 0)
  
    const totalCoef = grades.reduce((sum, grade) => {
      return sum + (grade.coefficient || 1)
    }, 0)
  
    const average = totalPoints / totalCoef
    
    // Arrondi à 2 décimales
    return Math.round(average * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
  }
  
  export function getGradeColorClass(value: number): string {
    if (value >= 16) return "text-emerald-600 bg-emerald-50"
    if (value >= 14) return "text-cyan-600 bg-cyan-50"
    if (value >= 12) return "text-amber-600 bg-amber-50"
    if (value >= 10) return "text-slate-600 bg-slate-50"
    return "text-red-600 bg-red-50"
  }