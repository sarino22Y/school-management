import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, School, FileText } from "lucide-react"

async function getStats() {
  const currentYear = await prisma.schoolYear.findFirst({
    where: { status: "ACTIVE" }
  })

  if (!currentYear) return null

  const [studentsCount, teachersCount, classesCount, gradesCount] = await Promise.all([
    prisma.student.count({ where: { schoolYearId: currentYear.id, status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.class.count({ where: { schoolYearId: currentYear.id, status: "ACTIVE" } }),
    prisma.grade.count({ where: { schoolYearId: currentYear.id } })
  ])

  return {
    students: studentsCount,
    teachers: teachersCount,
    classes: classesCount,
    grades: gradesCount,
    year: currentYear.label
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  if (!stats) {
    return <div>Aucune année scolaire active</div>
  }

  const cards = [
    { title: "Élèves actifs", value: stats.students, icon: Users, color: "text-blue-600" },
    { title: "Enseignants", value: stats.teachers, icon: GraduationCap, color: "text-green-600" },
    { title: "Classes", value: stats.classes, icon: School, color: "text-amber-600" },
    { title: "Notes saisies", value: stats.grades, icon: FileText, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Année scolaire {stats.year}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}